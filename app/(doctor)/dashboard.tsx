import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { MOCK_DOCTORS, MOCK_PATIENTS, MOCK_APPOINTMENTS } from '../../store/appStore';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';

const VISIT_STATUS_OPTIONS = ['available', 'en_route', 'visiting', 'completed'] as const;
const VISIT_LABELS: Record<string, string> = {
  available: 'Disponible',
  en_route: 'En Camino',
  visiting: 'En Visita',
  completed: 'Turno Finalizado',
};

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const doctor = MOCK_DOCTORS.find(d => d.id === user?.id)!;
  const myPatients = MOCK_PATIENTS.filter(p => doctor?.assignedPatients.includes(p.id));
  const todayAppointments = MOCK_APPOINTMENTS.filter(a =>
    myPatients.some(p => p.id === a.patientId) && a.status !== 'cancelled'
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetLabel}>Panel Médico</Text>
          <Text style={styles.greetName}>{doctor?.firstName}</Text>
          <Text style={styles.specialty}>{doctor?.specialty}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={Colors.doctorColor} />
        </TouchableOpacity>
      </View>

      {/* Status Card */}
      <Card elevated style={styles.statusCard}>
        <Text style={styles.statusTitle}>Mi Estado Actual</Text>
        <StatusBadge status={doctor?.visitStatus as any} />
        <Text style={styles.statusHint}>Estado actualizable desde el mapa de ruta</Text>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: Colors.doctorColor + '15' }]}>
          <Ionicons name="people" size={22} color={Colors.doctorColor} />
          <Text style={[styles.statNum, { color: Colors.doctorColor }]}>{myPatients.length}</Text>
          <Text style={styles.statLabel}>Pacientes{'\n'}Asignados</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: Colors.primary + '15' }]}>
          <Ionicons name="calendar" size={22} color={Colors.primary} />
          <Text style={[styles.statNum, { color: Colors.primary }]}>{todayAppointments.length}</Text>
          <Text style={styles.statLabel}>Citas{'\n'}del Día</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: Colors.warning + '15' }]}>
          <Ionicons name="time" size={22} color={Colors.warning} />
          <Text style={[styles.statNum, { color: Colors.warning }]}>
            {MOCK_APPOINTMENTS.filter(a => myPatients.some(p => p.id === a.patientId) && a.status === 'pending').length}
          </Text>
          <Text style={styles.statLabel}>Citas{'\n'}Pendientes</Text>
        </View>
      </View>

      {/* Today's Appointments */}
      <Card elevated style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="calendar" size={18} color={Colors.primary} />
          <Text style={styles.cardTitle}>Agenda del Día</Text>
        </View>
        {todayAppointments.length === 0 && (
          <Text style={styles.emptyText}>Sin citas programadas para hoy</Text>
        )}
        {todayAppointments.map(appt => {
          const pt = myPatients.find(p => p.id === appt.patientId);
          return (
            <View key={appt.id} style={styles.apptRow}>
              <View style={styles.timeBadge}>
                <Text style={styles.timeText}>{appt.time}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.apptPatient}>{pt?.firstName} {pt?.lastName}</Text>
                <Text style={styles.apptNotes}>{appt.notes}</Text>
              </View>
              <StatusBadge status={appt.status} small />
            </View>
          );
        })}
      </Card>

      {/* My Patients Preview */}
      <Card elevated style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="people" size={18} color={Colors.doctorColor} />
          <Text style={styles.cardTitle}>Mis Pacientes</Text>
          <TouchableOpacity onPress={() => router.push('/(doctor)/patients')} style={styles.seeAll}>
            <Text style={styles.seeAllText}>Ver todos</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        {myPatients.slice(0, 2).map(patient => (
          <View key={patient.id} style={styles.patientRow}>
            <View style={[styles.patientAvatar, { backgroundColor: Colors.patientColor }]}>
              <Ionicons name="person" size={18} color={Colors.surface} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.patientName}>{patient.firstName} {patient.lastName}</Text>
              <Text style={styles.patientRut}>{patient.rut}</Text>
            </View>
            <TouchableOpacity
              style={styles.navigateBtn}
              onPress={() => router.push('/(doctor)/map')}
            >
              <Ionicons name="navigate" size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </Card>

      {/* CTA Map */}
      <TouchableOpacity style={styles.mapCta} onPress={() => router.push('/(doctor)/map')} activeOpacity={0.85}>
        <Ionicons name="map" size={22} color={Colors.surface} />
        <Text style={styles.mapCtaText}>Ver Mapa de Ruta</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.surface + 'CC'} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  greetLabel: { fontSize: 13, color: Colors.textSecondary },
  greetName: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  specialty: { fontSize: 13, color: Colors.doctorColor, fontWeight: '600' },
  logoutBtn: { padding: 8, backgroundColor: Colors.surface, borderRadius: 10, borderWidth: 1, borderColor: Colors.border },
  statusCard: {
    marginBottom: 16, backgroundColor: Colors.doctorColor + '0A',
    borderColor: Colors.doctorColor + '30',
  },
  statusTitle: { fontSize: 12, color: Colors.textSecondary, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase' },
  statusHint: { fontSize: 11, color: Colors.textSecondary, marginTop: 6 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },
  card: { marginBottom: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  apptRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  timeBadge: {
    backgroundColor: Colors.primary + '15', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  timeText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  apptPatient: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  apptNotes: { fontSize: 12, color: Colors.textSecondary },
  emptyText: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', paddingVertical: 12 },
  patientRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  patientAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  patientName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  patientRut: { fontSize: 12, color: Colors.textSecondary },
  navigateBtn: { padding: 8, backgroundColor: Colors.primary + '15', borderRadius: 8 },
  mapCta: {
    backgroundColor: Colors.doctorColor,
    borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  mapCtaText: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.surface },
});
