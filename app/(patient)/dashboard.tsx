import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import {
  MOCK_PATIENTS, MOCK_APPOINTMENTS, MOCK_EXAMS, MOCK_DOCTORS,
} from '../../store/appStore';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const patient = MOCK_PATIENTS.find(p => p.id === user?.id)!;
  const doctor = MOCK_DOCTORS.find(d => d.id === patient?.assignedDoctorId);
  const nextAppointment = MOCK_APPOINTMENTS
    .filter(a => a.patientId === user?.id && a.status !== 'completed' && a.status !== 'cancelled')
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const pendingExams = MOCK_EXAMS.filter(e => e.patientId === user?.id && e.status === 'pending');
  const completedExams = MOCK_EXAMS.filter(e => e.patientId === user?.id && e.status !== 'pending');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Greeting */}
      <View style={styles.greeting}>
        <View>
          <Text style={styles.greetLabel}>Bienvenido/a</Text>
          <Text style={styles.greetName}>{patient?.firstName} {patient?.lastName.split(' ')[0]}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={Colors.patientColor} />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: Colors.patientColor + '15' }]}>
          <Ionicons name="flask" size={24} color={Colors.patientColor} />
          <Text style={[styles.statNum, { color: Colors.patientColor }]}>{pendingExams.length}</Text>
          <Text style={styles.statLabel}>Exámenes{'\n'}Pendientes</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: Colors.primary + '15' }]}>
          <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
          <Text style={[styles.statNum, { color: Colors.primary }]}>{completedExams.length}</Text>
          <Text style={styles.statLabel}>Exámenes{'\n'}Completados</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: Colors.success + '15' }]}>
          <Ionicons name="calendar" size={24} color={Colors.success} />
          <Text style={[styles.statNum, { color: Colors.success }]}>
            {MOCK_APPOINTMENTS.filter(a => a.patientId === user?.id).length}
          </Text>
          <Text style={styles.statLabel}>Total{'\n'}Citas</Text>
        </View>
      </View>

      {/* Patient Info */}
      <Card elevated style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="person-circle" size={20} color={Colors.patientColor} />
          <Text style={styles.cardTitle}>Mi Información</Text>
        </View>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>RUT</Text>
            <Text style={styles.infoValue}>{patient?.rut}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Diagnóstico</Text>
            <Text style={styles.infoValue}>{patient?.diagnosis}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Dirección</Text>
            <Text style={styles.infoValue}>{patient?.address}</Text>
          </View>
        </View>
      </Card>

      {/* Assigned Doctor */}
      {doctor && (
        <Card elevated style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="medkit" size={20} color={Colors.doctorColor} />
            <Text style={styles.cardTitle}>Mi Médico Asignado</Text>
          </View>
          <View style={styles.doctorRow}>
            <View style={[styles.doctorAvatar, { backgroundColor: Colors.doctorColor }]}>
              <Ionicons name="person" size={26} color={Colors.surface} />
            </View>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{doctor.firstName} {doctor.lastName}</Text>
              <Text style={styles.doctorSpec}>{doctor.specialty}</Text>
              <Text style={styles.doctorPhone}>{doctor.phone}</Text>
            </View>
            <StatusBadge status={doctor.visitStatus as any} small />
          </View>
          {doctor.visitStatus === 'en_route' && (
            <TouchableOpacity
              style={styles.trackBtn}
              onPress={() => router.push('/(patient)/tracking')}
            >
              <Ionicons name="navigate" size={16} color={Colors.surface} />
              <Text style={styles.trackBtnText}>Ver médico en mapa</Text>
            </TouchableOpacity>
          )}
        </Card>
      )}

      {/* Next Appointment */}
      {nextAppointment && (
        <Card elevated style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Próxima Cita</Text>
          </View>
          <View style={styles.appointmentBox}>
            <View style={styles.dateBox}>
              <Text style={styles.dateDay}>{nextAppointment.date.split('-')[2]}</Text>
              <Text style={styles.dateMonth}>
                {new Date(nextAppointment.date + 'T12:00:00').toLocaleString('es-CL', { month: 'short' }).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.apptTime}>{nextAppointment.time} hrs</Text>
              <Text style={styles.apptNotes}>{nextAppointment.notes}</Text>
              <StatusBadge status={nextAppointment.status} small />
            </View>
          </View>
        </Card>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(patient)/exams')}>
          <Ionicons name="document-text" size={28} color={Colors.primary} />
          <Text style={styles.actionLabel}>Ver Exámenes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(patient)/upload')}>
          <Ionicons name="cloud-upload" size={28} color={Colors.secondary} />
          <Text style={styles.actionLabel}>Subir Orden</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(patient)/appointments')}>
          <Ionicons name="calendar" size={28} color={Colors.warning} />
          <Text style={styles.actionLabel}>Mis Citas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(patient)/tracking')}>
          <Ionicons name="navigate" size={28} color={Colors.accent} />
          <Text style={styles.actionLabel}>Seguimiento</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 30 },
  greeting: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  greetLabel: { fontSize: 14, color: Colors.textSecondary },
  greetName: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  logoutBtn: { padding: 8, backgroundColor: Colors.surface, borderRadius: 10, borderWidth: 1, borderColor: Colors.border },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1, borderRadius: 12, padding: 12,
    alignItems: 'center', gap: 4,
  },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },
  card: { marginBottom: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  infoGrid: { gap: 8 },
  infoItem: {},
  infoLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 1 },
  infoValue: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  doctorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  doctorAvatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  doctorSpec: { fontSize: 12, color: Colors.textSecondary },
  doctorPhone: { fontSize: 12, color: Colors.primary, marginTop: 2 },
  trackBtn: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  trackBtnText: { color: Colors.surface, fontWeight: '600', fontSize: 14 },
  appointmentBox: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  dateBox: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 52,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dateDay: { fontSize: 22, fontWeight: '800', color: Colors.surface },
  dateMonth: { fontSize: 11, fontWeight: '600', color: Colors.surface + 'CC' },
  apptTime: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  apptNotes: { fontSize: 13, color: Colors.textSecondary, marginBottom: 8 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionBtn: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
});
