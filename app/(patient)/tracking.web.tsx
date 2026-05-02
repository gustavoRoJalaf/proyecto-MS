import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { MOCK_PATIENTS, MOCK_DOCTORS } from '../../store/appStore';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';

function interpolate(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function PatientTrackingScreen() {
  const { user } = useAuth();
  const patient = MOCK_PATIENTS.find(p => p.id === user?.id)!;
  const doctor = MOCK_DOCTORS.find(d => d.id === patient?.assignedDoctorId)!;

  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(12);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (doctor?.visitStatus !== 'en_route') return;
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(prev + 0.015, 1);
        setEta(Math.round((1 - next) * 12));
        return next;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ETA Banner */}
      <View style={styles.etaBanner}>
        <View style={styles.etaLeft}>
          <Ionicons name="navigate" size={20} color={Colors.surface} />
          <View>
            <Text style={styles.etaLabel}>Tiempo estimado de llegada</Text>
            <Text style={styles.etaTime}>
              {progress >= 1 ? 'Tu médico ha llegado' : `${eta} minuto${eta !== 1 ? 's' : ''}`}
            </Text>
          </View>
        </View>
        <StatusBadge status={progress >= 1 ? 'visiting' : 'en_route'} small />
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <View style={styles.routeRow}>
          <View style={styles.locDot}>
            <Ionicons name="medkit" size={16} color={Colors.surface} />
          </View>
          <View style={styles.routeLine}>
            <View style={[styles.routeFill, { width: `${progress * 100}%` as any }]} />
            <View style={[styles.movingDot, { left: `${progress * 90}%` as any }]}>
              <Ionicons name="car" size={12} color={Colors.surface} />
            </View>
          </View>
          <View style={[styles.locDot, { backgroundColor: Colors.patientColor }]}>
            <Ionicons name="home" size={16} color={Colors.surface} />
          </View>
        </View>
        <View style={styles.routeLabels}>
          <Text style={styles.routeLabel}>Médico</Text>
          <Text style={styles.routeLabel}>Tu domicilio</Text>
        </View>
        <Text style={styles.placeholderNote}>
          <Ionicons name="information-circle-outline" size={13} color={Colors.textLight} /> El mapa interactivo está disponible en la app móvil
        </Text>
      </View>

      {/* Doctor Info */}
      <Card elevated style={styles.doctorCard}>
        <View style={styles.doctorRow}>
          <View style={[styles.avatar, { backgroundColor: Colors.doctorColor }]}>
            <Ionicons name="person" size={24} color={Colors.surface} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.doctorName}>{doctor?.firstName} {doctor?.lastName}</Text>
            <Text style={styles.doctorSpec}>{doctor?.specialty}</Text>
          </View>
          <TouchableOpacity style={styles.callBtn}>
            <Ionicons name="call" size={18} color={Colors.surface} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
          </View>
          <Text style={styles.progressLabel}>{Math.round(progress * 100)}% del trayecto completado</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color={Colors.accent} />
          <Text style={styles.infoText}>{patient?.address}</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, gap: 12 },
  etaBanner: {
    backgroundColor: Colors.primary,
    borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  etaLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  etaLabel: { fontSize: 11, color: Colors.surface + 'CC', fontWeight: '600' },
  etaTime: { fontSize: 16, color: Colors.surface, fontWeight: '800' },
  mapPlaceholder: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  locDot: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.doctorColor,
    alignItems: 'center', justifyContent: 'center',
  },
  routeLine: {
    flex: 1, height: 8, backgroundColor: Colors.border,
    borderRadius: 4, overflow: 'visible', position: 'relative',
  },
  routeFill: { height: 8, backgroundColor: Colors.primary, borderRadius: 4 },
  movingDot: {
    position: 'absolute', top: -10, width: 28, height: 28,
    borderRadius: 14, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.surface,
  },
  routeLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  routeLabel: { fontSize: 11, color: Colors.textSecondary },
  placeholderNote: { fontSize: 11, color: Colors.textLight, textAlign: 'center' },
  doctorCard: {},
  doctorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  doctorName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  doctorSpec: { fontSize: 12, color: Colors.textSecondary },
  callBtn: {
    backgroundColor: Colors.success, width: 40, height: 40,
    borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  progressContainer: { marginBottom: 12 },
  progressTrack: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: 8, backgroundColor: Colors.primary, borderRadius: 4 },
  progressLabel: { fontSize: 12, color: Colors.textSecondary },
  infoRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  infoText: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
});
