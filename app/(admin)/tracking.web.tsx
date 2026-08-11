import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_PATIENTS, MOCK_DOCTORS } from '../../store/appStore';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import MapPlaceholder from '../../components/MapPlaceholder';

type LayerFilter = 'all' | 'patients' | 'doctors';

export default function AdminTrackingScreen() {
  const [layer, setLayer] = useState<LayerFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const showPatients = layer === 'all' || layer === 'patients';
  const showDoctors = layer === 'all' || layer === 'doctors';

  const selectedPatient = MOCK_PATIENTS.find(p => p.id === selectedId);
  const selectedDoctor = MOCK_DOCTORS.find(d => d.id === selectedId);

  const markers = [
    ...(showDoctors ? MOCK_DOCTORS.map(d => ({
      id: d.id, lat: d.location.latitude, lng: d.location.longitude,
      label: `${d.firstName} ${d.lastName}`, color: Colors.doctorColor, icon: 'medkit',
    })) : []),
    ...(showPatients ? MOCK_PATIENTS.map(p => ({
      id: p.id, lat: p.location.latitude, lng: p.location.longitude,
      label: `${p.firstName} ${p.lastName}`, color: Colors.patientColor, icon: 'person',
    })) : []),
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.layerRow}>
        {(['all', 'doctors', 'patients'] as LayerFilter[]).map(l => (
          <TouchableOpacity
            key={l}
            style={[styles.layerBtn, layer === l && styles.layerBtnActive]}
            onPress={() => { setLayer(l); setSelectedId(null); }}
          >
            <Ionicons
              name={l === 'all' ? 'layers' : l === 'doctors' ? 'medkit' : 'people'}
              size={14}
              color={layer === l ? Colors.surface : Colors.textSecondary}
            />
            <Text style={[styles.layerBtnText, layer === l && { color: Colors.surface }]}>
              {l === 'all' ? 'Todo' : l === 'doctors' ? 'Médicos' : 'Pacientes'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <MapPlaceholder markers={markers} height={240} note="Seguimiento GPS disponible en app móvil" />

      {(selectedPatient || selectedDoctor) && (
        <Card elevated style={{ borderColor: Colors.adminColor + '40' }}>
          <View style={styles.selectedHeader}>
            <View style={[styles.selAvatar, { backgroundColor: selectedPatient ? Colors.patientColor : Colors.doctorColor }]}>
              <Ionicons name={selectedPatient ? 'person' : 'medkit'} size={20} color={Colors.surface} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.selName}>
                {selectedPatient
                  ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                  : `${selectedDoctor!.firstName} ${selectedDoctor!.lastName}`}
              </Text>
              <Text style={styles.selSub}>
                {selectedPatient ? selectedPatient.rut : selectedDoctor!.specialty}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedId(null)}>
              <Ionicons name="close-circle" size={20} color={Colors.textLight} />
            </TouchableOpacity>
          </View>
          {selectedPatient && <Text style={styles.selDetail}>{selectedPatient.diagnosis}</Text>}
          {selectedDoctor && <StatusBadge status={selectedDoctor.visitStatus as any} />}
        </Card>
      )}

      {showDoctors && (
        <>
          <Text style={styles.sectionTitle}>Médicos ({MOCK_DOCTORS.length})</Text>
          {MOCK_DOCTORS.map(doctor => (
            <TouchableOpacity key={doctor.id} onPress={() => setSelectedId(doctor.id)} activeOpacity={0.8}>
              <Card style={[styles.listCard, selectedId === doctor.id ? styles.listCardSelected : undefined]}>
                <View style={styles.listRow}>
                  <View style={[styles.listAvatar, { backgroundColor: Colors.doctorColor }]}>
                    <Ionicons name="medkit" size={16} color={Colors.surface} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listName}>{doctor.firstName} {doctor.lastName}</Text>
                    <Text style={styles.listSub}>{doctor.specialty} · {doctor.assignedPatients.length} pacientes</Text>
                  </View>
                  <StatusBadge status={doctor.visitStatus as any} small />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </>
      )}

      {showPatients && (
        <>
          <Text style={styles.sectionTitle}>Pacientes ({MOCK_PATIENTS.length})</Text>
          {MOCK_PATIENTS.map(patient => (
            <TouchableOpacity key={patient.id} onPress={() => setSelectedId(patient.id)} activeOpacity={0.8}>
              <Card style={[styles.listCard, selectedId === patient.id ? styles.listCardSelected : undefined]}>
                <View style={styles.listRow}>
                  <View style={[styles.listAvatar, { backgroundColor: Colors.patientColor }]}>
                    <Ionicons name="person" size={16} color={Colors.surface} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listName}>{patient.firstName} {patient.lastName}</Text>
                    <Text style={styles.listSub} numberOfLines={1}>{patient.diagnosis}</Text>
                  </View>
                  <Ionicons name="location" size={16} color={Colors.accent} />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 12, paddingBottom: 30, gap: 10 },
  layerRow: { flexDirection: 'row', gap: 8 },
  layerBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, borderRadius: 20, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  layerBtnActive: { backgroundColor: Colors.adminColor, borderColor: Colors.adminColor },
  layerBtnText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  selectedHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  selAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  selName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  selSub: { fontSize: 12, color: Colors.textSecondary },
  selDetail: { fontSize: 13, color: Colors.textSecondary },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase' },
  listCard: { marginBottom: 0 },
  listCardSelected: { borderColor: Colors.adminColor, borderWidth: 1.5 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  listAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  listName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  listSub: { fontSize: 11, color: Colors.textSecondary },
});
