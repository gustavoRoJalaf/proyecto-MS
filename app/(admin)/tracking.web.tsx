import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_PATIENTS, MOCK_DOCTORS } from '../../store/appStore';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';

type LayerFilter = 'all' | 'patients' | 'doctors';

export default function AdminTrackingScreen() {
  const [layer, setLayer] = useState<LayerFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const showPatients = layer === 'all' || layer === 'patients';
  const showDoctors = layer === 'all' || layer === 'doctors';

  const selectedPatient = MOCK_PATIENTS.find(p => p.id === selectedId);
  const selectedDoctor = MOCK_DOCTORS.find(d => d.id === selectedId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Map notice */}
      <View style={styles.mapNotice}>
        <Ionicons name="map-outline" size={32} color={Colors.textLight} />
        <Text style={styles.mapNoticeTitle}>Mapa Global de Seguimiento</Text>
        <Text style={styles.mapNoticeSub}>El mapa interactivo está disponible en la app móvil (Expo Go)</Text>
      </View>

      {/* Layer Filters */}
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

      {/* Selected Detail */}
      {(selectedPatient || selectedDoctor) && (
        <Card elevated style={styles.selectedCard}>
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
          {selectedPatient && (
            <>
              <Text style={styles.selDetail}>{selectedPatient.diagnosis}</Text>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={13} color={Colors.accent} />
                <Text style={styles.infoText}>{selectedPatient.address}</Text>
              </View>
            </>
          )}
          {selectedDoctor && (
            <>
              <StatusBadge status={selectedDoctor.visitStatus as any} />
              <Text style={styles.selDetail}>{selectedDoctor.assignedPatients.length} pacientes asignados</Text>
            </>
          )}
        </Card>
      )}

      {/* Doctors List */}
      {showDoctors && (
        <>
          <Text style={styles.sectionTitle}>Médicos ({MOCK_DOCTORS.length})</Text>
          {MOCK_DOCTORS.map(doctor => (
            <TouchableOpacity key={doctor.id} onPress={() => setSelectedId(doctor.id)} activeOpacity={0.8}>
              <Card style={[styles.listCard, selectedId === doctor.id && styles.listCardSelected]}>
                <View style={styles.listRow}>
                  <View style={[styles.listAvatar, { backgroundColor: Colors.doctorColor }]}>
                    <Ionicons name="medkit" size={16} color={Colors.surface} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listName}>{doctor.firstName} {doctor.lastName}</Text>
                    <Text style={styles.listSub}>{doctor.specialty} · {doctor.assignedPatients.length} pacientes</Text>
                    <View style={styles.coordChip}>
                      <Ionicons name="navigate-outline" size={11} color={Colors.primary} />
                      <Text style={styles.coordText}>
                        {doctor.location.latitude.toFixed(3)}, {doctor.location.longitude.toFixed(3)}
                      </Text>
                    </View>
                  </View>
                  <StatusBadge status={doctor.visitStatus as any} small />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Patients List */}
      {showPatients && (
        <>
          <Text style={styles.sectionTitle}>Pacientes ({MOCK_PATIENTS.length})</Text>
          {MOCK_PATIENTS.map(patient => (
            <TouchableOpacity key={patient.id} onPress={() => setSelectedId(patient.id)} activeOpacity={0.8}>
              <Card style={[styles.listCard, selectedId === patient.id && styles.listCardSelected]}>
                <View style={styles.listRow}>
                  <View style={[styles.listAvatar, { backgroundColor: Colors.patientColor }]}>
                    <Ionicons name="person" size={16} color={Colors.surface} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listName}>{patient.firstName} {patient.lastName}</Text>
                    <Text style={styles.listSub} numberOfLines={1}>{patient.diagnosis}</Text>
                    <View style={styles.coordChip}>
                      <Ionicons name="navigate-outline" size={11} color={Colors.accent} />
                      <Text style={[styles.coordText, { color: Colors.accent }]}>
                        {patient.location.latitude.toFixed(3)}, {patient.location.longitude.toFixed(3)}
                      </Text>
                    </View>
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
  content: { padding: 12, gap: 10, paddingBottom: 30 },
  mapNotice: {
    backgroundColor: Colors.surface,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    padding: 20, alignItems: 'center', gap: 6,
  },
  mapNoticeTitle: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  mapNoticeSub: { fontSize: 12, color: Colors.textLight, textAlign: 'center' },
  layerRow: { flexDirection: 'row', gap: 8 },
  layerBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, borderRadius: 20, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  layerBtnActive: { backgroundColor: Colors.adminColor, borderColor: Colors.adminColor },
  layerBtnText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  selectedCard: { borderColor: Colors.adminColor + '40', backgroundColor: Colors.adminColor + '06' },
  selectedHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  selAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  selName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  selSub: { fontSize: 12, color: Colors.textSecondary },
  selDetail: { fontSize: 13, color: Colors.textSecondary, marginBottom: 4 },
  infoRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', marginTop: 4 },
  listCard: { marginBottom: 4 },
  listCardSelected: { borderColor: Colors.adminColor, borderWidth: 1.5 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  listAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  listName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  listSub: { fontSize: 11, color: Colors.textSecondary },
  coordChip: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  coordText: { fontSize: 10, color: Colors.primary, fontWeight: '500' },
});
