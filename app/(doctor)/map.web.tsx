import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { MOCK_DOCTORS, MOCK_PATIENTS } from '../../store/appStore';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';

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
  const [selectedPatientId, setSelectedPatientId] = useState(myPatients[0]?.id);
  const selectedPatient = myPatients.find(p => p.id === selectedPatientId);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Map notice */}
      <View style={styles.mapNotice}>
        <Ionicons name="map-outline" size={32} color={Colors.textLight} />
        <Text style={styles.mapNoticeText}>Mapa GPS disponible en la app móvil</Text>
        <Text style={styles.mapNoticeSub}>Usa la app Expo Go en tu celular para ver el mapa interactivo</Text>
      </View>

      {/* Visit Status */}
      <Text style={styles.sectionLabel}>Estado de Visita</Text>
      <View style={styles.statusRow}>
        {VISIT_STATUSES.map(s => (
          <TouchableOpacity
            key={s.key}
            style={[styles.statusBtn, visitStatus === s.key && { backgroundColor: s.color, borderColor: s.color }]}
            onPress={() => setVisitStatus(s.key)}
          >
            <Ionicons name={s.icon as any} size={14} color={visitStatus === s.key ? Colors.surface : s.color} />
            <Text style={[styles.statusBtnText, visitStatus === s.key && { color: Colors.surface }]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Patient Selector */}
      <Text style={styles.sectionLabel}>Mis Pacientes</Text>
      {myPatients.map(patient => (
        <TouchableOpacity key={patient.id} onPress={() => setSelectedPatientId(patient.id)} activeOpacity={0.8}>
          <Card style={[styles.patientCard, selectedPatientId === patient.id && styles.patientCardSelected]}>
            <View style={styles.patientRow}>
              <View style={[styles.avatar, { backgroundColor: Colors.patientColor }]}>
                <Ionicons name="person" size={18} color={Colors.surface} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.patientName}>{patient.firstName} {patient.lastName}</Text>
                <Text style={styles.patientRut}>{patient.rut}</Text>
                <Text style={styles.patientDiag} numberOfLines={1}>{patient.diagnosis}</Text>
              </View>
              <Ionicons
                name={selectedPatientId === patient.id ? 'chevron-down' : 'chevron-forward'}
                size={16} color={Colors.textLight}
              />
            </View>

            {selectedPatientId === patient.id && (
              <View style={styles.expandedInfo}>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={13} color={Colors.accent} />
                  <Text style={styles.infoText}>{patient.address}</Text>
                </View>
                <View style={styles.coordRow}>
                  <View style={styles.coordChip}>
                    <Ionicons name="navigate-outline" size={12} color={Colors.primary} />
                    <Text style={styles.coordText}>
                      {patient.location.latitude.toFixed(4)}, {patient.location.longitude.toFixed(4)}
                    </Text>
                  </View>
                </View>
                {visitStatus === 'available' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
                    onPress={() => setVisitStatus('en_route')}
                  >
                    <Ionicons name="navigate" size={15} color={Colors.surface} />
                    <Text style={styles.actionBtnText}>Iniciar Ruta</Text>
                  </TouchableOpacity>
                )}
                {visitStatus === 'en_route' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.warning }]}
                    onPress={() => setVisitStatus('visiting')}
                  >
                    <Ionicons name="home" size={15} color={Colors.surface} />
                    <Text style={styles.actionBtnText}>Marcar En Visita</Text>
                  </TouchableOpacity>
                )}
                {visitStatus === 'visiting' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.success }]}
                    onPress={() => setVisitStatus('completed')}
                  >
                    <Ionicons name="checkmark-circle" size={15} color={Colors.surface} />
                    <Text style={styles.actionBtnText}>Finalizar Visita</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </Card>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 14, gap: 10, paddingBottom: 30 },
  mapNotice: {
    backgroundColor: Colors.surface,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    padding: 20, alignItems: 'center', gap: 6,
  },
  mapNoticeText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  mapNoticeSub: { fontSize: 12, color: Colors.textLight, textAlign: 'center' },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, borderRadius: 20, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  statusBtnText: { fontSize: 10, fontWeight: '600', color: Colors.textSecondary },
  patientCard: { marginBottom: 4 },
  patientCardSelected: { borderColor: Colors.patientColor, borderWidth: 1.5 },
  patientRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  patientName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  patientRut: { fontSize: 11, color: Colors.textSecondary },
  patientDiag: { fontSize: 11, color: Colors.doctorColor, fontWeight: '500' },
  expandedInfo: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border, gap: 8 },
  infoRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  coordRow: { flexDirection: 'row' },
  coordChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary + '10', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  coordText: { fontSize: 11, color: Colors.primary, fontWeight: '500' },
  actionBtn: {
    borderRadius: 8, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6, paddingVertical: 10,
  },
  actionBtnText: { color: Colors.surface, fontWeight: '700', fontSize: 14 },
});
