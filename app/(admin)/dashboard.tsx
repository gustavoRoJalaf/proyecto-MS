import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import {
  MOCK_PATIENTS, MOCK_DOCTORS, MOCK_APPOINTMENTS, MOCK_EXAMS,
} from '../../store/appStore';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const router = useRouter();

  const totalPatients = MOCK_PATIENTS.length;
  const totalDoctors = MOCK_DOCTORS.length;
  const totalAppointments = MOCK_APPOINTMENTS.length;
  const pendingExams = MOCK_EXAMS.filter(e => e.status === 'pending').length;
  const confirmedAppts = MOCK_APPOINTMENTS.filter(a => a.status === 'confirmed').length;
  const completedAppts = MOCK_APPOINTMENTS.filter(a => a.status === 'completed').length;

  const doctorsEnRoute = MOCK_DOCTORS.filter(d => d.visitStatus === 'en_route' || d.visitStatus === 'visiting').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetLabel}>Panel de Administración</Text>
          <Text style={styles.greetName}>MedTrack MS</Text>
          <Text style={styles.greetDate}>{new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={Colors.adminColor} />
        </TouchableOpacity>
      </View>

      {/* Alert Banner */}
      {doctorsEnRoute > 0 && (
        <TouchableOpacity style={styles.alertBanner} onPress={() => router.push('/(admin)/tracking')}>
          <Ionicons name="navigate" size={16} color={Colors.surface} />
          <Text style={styles.alertText}>{doctorsEnRoute} médico{doctorsEnRoute > 1 ? 's' : ''} en tránsito actualmente</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.surface + 'CC'} />
        </TouchableOpacity>
      )}

      {/* Main KPIs */}
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, { backgroundColor: Colors.patientColor }]}>
          <Ionicons name="people" size={28} color={Colors.surface} />
          <Text style={styles.kpiNum}>{totalPatients}</Text>
          <Text style={styles.kpiLabel}>Pacientes</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: Colors.doctorColor }]}>
          <Ionicons name="medkit" size={28} color={Colors.surface} />
          <Text style={styles.kpiNum}>{totalDoctors}</Text>
          <Text style={styles.kpiLabel}>Médicos</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: Colors.primary }]}>
          <Ionicons name="calendar" size={28} color={Colors.surface} />
          <Text style={styles.kpiNum}>{totalAppointments}</Text>
          <Text style={styles.kpiLabel}>Citas Total</Text>
        </View>
        <View style={[styles.kpiCard, { backgroundColor: Colors.warning }]}>
          <Ionicons name="flask" size={28} color={Colors.surface} />
          <Text style={styles.kpiNum}>{pendingExams}</Text>
          <Text style={styles.kpiLabel}>Exámenes{'\n'}Pendientes</Text>
        </View>
      </View>

      {/* Appointments Status */}
      <Card elevated style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="calendar" size={18} color={Colors.primary} />
          <Text style={styles.cardTitle}>Estado de Citas</Text>
        </View>
        <View style={styles.apptStats}>
          <View style={styles.apptStatItem}>
            <Text style={[styles.apptStatNum, { color: Colors.primary }]}>{confirmedAppts}</Text>
            <Text style={styles.apptStatLabel}>Confirmadas</Text>
          </View>
          <View style={styles.apptDivider} />
          <View style={styles.apptStatItem}>
            <Text style={[styles.apptStatNum, { color: Colors.warning }]}>
              {MOCK_APPOINTMENTS.filter(a => a.status === 'pending').length}
            </Text>
            <Text style={styles.apptStatLabel}>Pendientes</Text>
          </View>
          <View style={styles.apptDivider} />
          <View style={styles.apptStatItem}>
            <Text style={[styles.apptStatNum, { color: Colors.success }]}>{completedAppts}</Text>
            <Text style={styles.apptStatLabel}>Completadas</Text>
          </View>
          <View style={styles.apptDivider} />
          <View style={styles.apptStatItem}>
            <Text style={[styles.apptStatNum, { color: Colors.accent }]}>
              {MOCK_APPOINTMENTS.filter(a => a.status === 'cancelled').length}
            </Text>
            <Text style={styles.apptStatLabel}>Canceladas</Text>
          </View>
        </View>
      </Card>

      {/* Doctors Status */}
      <Card elevated style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="medkit" size={18} color={Colors.doctorColor} />
          <Text style={styles.cardTitle}>Estado de Médicos</Text>
          <TouchableOpacity onPress={() => router.push('/(admin)/tracking')} style={styles.mapLink}>
            <Text style={styles.mapLinkText}>Ver mapa</Text>
            <Ionicons name="map-outline" size={13} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        {MOCK_DOCTORS.map(doctor => (
          <View key={doctor.id} style={styles.doctorRow}>
            <View style={[styles.docAvatar, { backgroundColor: Colors.doctorColor }]}>
              <Ionicons name="person" size={16} color={Colors.surface} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.docName}>{doctor.firstName} {doctor.lastName}</Text>
              <Text style={styles.docSpec}>{doctor.specialty}</Text>
            </View>
            <View style={styles.docRight}>
              <StatusBadge status={doctor.visitStatus as any} small />
              <Text style={styles.docPatients}>{doctor.assignedPatients.length} pac.</Text>
            </View>
          </View>
        ))}
      </Card>

      {/* Recent Appointments */}
      <Card elevated style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="time" size={18} color={Colors.adminColor} />
          <Text style={styles.cardTitle}>Citas Recientes</Text>
        </View>
        {MOCK_APPOINTMENTS.slice(0, 3).map(appt => {
          const patient = MOCK_PATIENTS.find(p => p.id === appt.patientId);
          const doctor = MOCK_DOCTORS.find(d => d.id === appt.doctorId);
          return (
            <View key={appt.id} style={styles.apptRow}>
              <View style={styles.apptDate}>
                <Text style={styles.apptDay}>{appt.date.split('-')[2]}</Text>
                <Text style={styles.apptMonth}>
                  {new Date(appt.date + 'T12:00:00').toLocaleString('es-CL', { month: 'short' }).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.apptPat}>{patient?.firstName} {patient?.lastName}</Text>
                <Text style={styles.apptDoc}>{doctor?.firstName} {doctor?.lastName}</Text>
              </View>
              <StatusBadge status={appt.status} small />
            </View>
          );
        })}
      </Card>

      {/* Quick Navigation */}
      <View style={styles.navGrid}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/(admin)/tracking')}>
          <Ionicons name="map" size={26} color={Colors.primary} />
          <Text style={styles.navLabel}>Mapa Global</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/(admin)/patients')}>
          <Ionicons name="people" size={26} color={Colors.patientColor} />
          <Text style={styles.navLabel}>Pacientes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push('/(admin)/documents')}>
          <Ionicons name="folder" size={26} color={Colors.adminColor} />
          <Text style={styles.navLabel}>Documentos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 30 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  greetLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase' },
  greetName: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  greetDate: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  logoutBtn: { padding: 8, backgroundColor: Colors.surface, borderRadius: 10, borderWidth: 1, borderColor: Colors.border },
  alertBanner: {
    backgroundColor: Colors.primary,
    borderRadius: 10, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16,
  },
  alertText: { flex: 1, color: Colors.surface, fontWeight: '600', fontSize: 14 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  kpiCard: {
    width: '47.5%', borderRadius: 14, padding: 16,
    alignItems: 'center', gap: 6,
  },
  kpiNum: { fontSize: 28, fontWeight: '800', color: Colors.surface },
  kpiLabel: { fontSize: 12, fontWeight: '700', color: Colors.surface + 'DD', textAlign: 'center' },
  card: { marginBottom: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  mapLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mapLinkText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  apptStats: { flexDirection: 'row', alignItems: 'center' },
  apptStatItem: { flex: 1, alignItems: 'center' },
  apptStatNum: { fontSize: 22, fontWeight: '800' },
  apptStatLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  apptDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  doctorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  docAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  docName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  docSpec: { fontSize: 12, color: Colors.textSecondary },
  docRight: { alignItems: 'flex-end', gap: 4 },
  docPatients: { fontSize: 11, color: Colors.textSecondary },
  apptRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  apptDate: {
    backgroundColor: Colors.adminColor, borderRadius: 8, width: 44,
    alignItems: 'center', paddingVertical: 6,
  },
  apptDay: { fontSize: 18, fontWeight: '800', color: Colors.surface },
  apptMonth: { fontSize: 10, color: Colors.surface + 'CC', fontWeight: '600' },
  apptPat: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  apptDoc: { fontSize: 12, color: Colors.textSecondary },
  navGrid: { flexDirection: 'row', gap: 12 },
  navBtn: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    padding: 16, alignItems: 'center', gap: 8,
  },
  navLabel: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
});
