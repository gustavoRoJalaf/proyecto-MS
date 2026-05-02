import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { MOCK_APPOINTMENTS, MOCK_DOCTORS } from '../../store/appStore';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';

export default function AppointmentsScreen() {
  const { user } = useAuth();
  const myAppointments = MOCK_APPOINTMENTS.filter(a => a.patientId === user?.id);

  const upcoming = myAppointments.filter(a => a.status === 'confirmed' || a.status === 'pending');
  const past = myAppointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  const AppointmentCard = ({ appt }: { appt: typeof myAppointments[0] }) => {
    const doctor = MOCK_DOCTORS.find(d => d.id === appt.doctorId);
    const [d, m, y] = [
      appt.date.split('-')[2],
      new Date(appt.date + 'T12:00:00').toLocaleString('es-CL', { month: 'long' }),
      appt.date.split('-')[0],
    ];

    return (
      <Card elevated style={styles.card}>
        <View style={styles.cardTop}>
          <View style={[styles.datePill, { backgroundColor: appt.status === 'completed' ? Colors.textLight : Colors.primary }]}>
            <Text style={styles.dateDay}>{d}</Text>
            <Text style={styles.dateMonthYear}>{m.substring(0, 3).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.time}>{appt.time} hrs</Text>
            <Text style={styles.doctorName}>{doctor?.firstName} {doctor?.lastName}</Text>
            <Text style={styles.specialty}>{doctor?.specialty}</Text>
          </View>
          <StatusBadge status={appt.status} small />
        </View>
        {appt.notes && (
          <View style={styles.notesRow}>
            <Ionicons name="chatbubble-ellipses-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.notesText}>{appt.notes}</Text>
          </View>
        )}
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Mis Citas</Text>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <>
          <View style={styles.sectionRow}>
            <Ionicons name="calendar" size={16} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Próximas ({upcoming.length})</Text>
          </View>
          {upcoming.map(a => <AppointmentCard key={a.id} appt={a} />)}
        </>
      )}

      {/* Past */}
      {past.length > 0 && (
        <>
          <View style={styles.sectionRow}>
            <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
            <Text style={[styles.sectionTitle, { color: Colors.textSecondary }]}>Historial ({past.length})</Text>
          </View>
          {past.map(a => <AppointmentCard key={a.id} appt={a} />)}
        </>
      )}

      {myAppointments.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={48} color={Colors.textLight} />
          <Text style={styles.emptyText}>No tienes citas registradas</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 30 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 20 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  card: { marginBottom: 12 },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 8 },
  datePill: {
    width: 52, borderRadius: 10, padding: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  dateDay: { fontSize: 22, fontWeight: '800', color: Colors.surface },
  dateMonthYear: { fontSize: 11, fontWeight: '600', color: Colors.surface + 'CC' },
  time: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  doctorName: { fontSize: 13, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  specialty: { fontSize: 12, color: Colors.textSecondary },
  notesRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  notesText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textSecondary },
});
