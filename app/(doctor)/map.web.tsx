import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { MOCK_DOCTORS, MOCK_PATIENTS } from '../../store/appStore';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import MapPlaceholder from '../../components/MapPlaceholder';

const VISIT_STATUSES = [
  { key: 'available', label: 'Disponible', icon: 'checkmark-circle', color: Colors.success },
  { key: 'en_route', label: 'En Camino', icon: 'navigate', color: Colors.primary },
  { key: 'visiting', label: 'En Visita', icon: 'home', color: Colors.warning },
  { key: 'completed', label: 'Completado', icon: 'flag', color: Colors.textSecondary },
] as const;

export default function DoctorMapScreen() {
  const { user } = useAuth();
  const doctor = MOCK_DOCTORS.find(d => d.id === user?.id)!;
  const myPatients = MOCK_PATIENTS.filter(p => doctor?.assignedPatients.includes(p.id));

  const [visitStatus, setVisitStatus] = useState(doctor?.visitStatus ?? 'available');
  const [selectedPatient, setSelectedPatient] = useState(myPatients[0]);

  const markers = [
    { id: 'doctor', lat: doctor?.location.latitude, lng: doctor?.location.longitude, label: 'Mi ubicación', color: Colors.doctorColor, icon: 'medkit' },
    ...myPatients.map(p => ({ id: p.id, lat: p.location.latitude, lng: p.location.longitude, label: p.firstName, color: p.id === selectedPatient?.id ? Colors.warning : Colors.patientColor, icon: 'person' })),
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.statusRow}>
        {VISIT_STATUSES.map(s => (
          <TouchableOpacity
            key={s.key}
            style={[styles.statusBtn, visitStatus === s.key && { backgroundColor: s.color }]}
            onPress={() => setVisitStatus(s.key)}
          >
            <Ionicons name={s.icon as any} size={14} color={visitStatus === s.key ? Colors.surface : s.color} />
            <Text style={[styles.statusBtnText, visitStatus === s.key && { color: Colors.surface }]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <MapPlaceholder markers={markers} height={220} note="Mapa GPS disponible en app móvil" />

      <Text style={styles.sectionLabel}>Seleccionar Paciente</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        {myPatients.map(patient => (
          <TouchableOpacity
            key={patient.id}
            style={[styles.patientChip, selectedPatient?.id === patient.id && styles.patientChipActive]}
            onPress={() => setSelectedPatient(patient)}
          >
            <Ionicons name="person" size={14} color={selectedPatient?.id === patient.id ? Colors.surface : Colors.patientColor} />
            <Text style={[styles.patientChipText, selectedPatient?.id === patient.id && { color: Colors.surface }]}>
              {patient.firstName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedPatient && (
        <Card elevated>
          <View style={styles.selectedHeader}>
            <View style={[styles.avatar, { backgroundColor: Colors.patientColor }]}>
              <Ionicons name="person" size={20} color={Colors.surface} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedName}>{selectedPatient.firstName} {selectedPatient.lastName}</Text>
              <Text style={styles.selectedRut}>{selectedPatient.rut}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="medical-outline" size={13} color={Colors.doctorColor} />
            <Text style={styles.diagText}>{selectedPatient.diagnosis}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={13} color={Colors.accent} />
            <Text style={styles.addrText}>{selectedPatient.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="globe-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.coordText}>
              {selectedPatient.location.latitude.toFixed(5)}, {selectedPatient.location.longitude.toFixed(5)}
            </Text>
          </View>
          <View style={styles.actionRow}>
            {visitStatus === 'available' && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.primary }]} onPress={() => { setVisitStatus('en_route'); Alert.alert('Ruta iniciada', `Navegando a ${selectedPatient.firstName}`); }}>
                <Ionicons name="navigate" size={16} color={Colors.surface} />
                <Text style={styles.actionBtnText}>Iniciar Ruta</Text>
              </TouchableOpacity>
            )}
            {visitStatus === 'en_route' && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.warning }]} onPress={() => setVisitStatus('visiting')}>
                <Ionicons name="home" size={16} color={Colors.surface} />
                <Text style={styles.actionBtnText}>Marcar En Visita</Text>
              </TouchableOpacity>
            )}
            {visitStatus === 'visiting' && (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.success }]} onPress={() => setVisitStatus('completed')}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.surface} />
                <Text style={styles.actionBtnText}>Finalizar Visita</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 14, paddingBottom: 30, gap: 12 },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, borderRadius: 20, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  statusBtnText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase' },
  patientChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surface, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12, paddingVertical: 7, marginRight: 8,
  },
  patientChipActive: { backgroundColor: Colors.patientColor, borderColor: Colors.patientColor },
  patientChipText: { fontSize: 13, fontWeight: '600', color: Colors.patientColor },
  selectedHeader: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  selectedName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  selectedRut: { fontSize: 12, color: Colors.textSecondary },
  infoRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginBottom: 6 },
  diagText: { flex: 1, fontSize: 13, color: Colors.doctorColor, fontWeight: '500' },
  addrText: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  coordText: { flex: 1, fontSize: 12, color: Colors.textSecondary },
  actionRow: { marginTop: 10 },
  actionBtn: {
    borderRadius: 8, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6, paddingVertical: 10,
  },
  actionBtnText: { color: Colors.surface, fontWeight: '700', fontSize: 14 },
});
