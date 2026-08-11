import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { MOCK_PATIENTS, MOCK_DOCTORS } from '../../store/appStore';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import MapPlaceholder from '../../components/MapPlaceholder';

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

  const markers = [
    { id: 'patient', lat: patient.location.latitude, lng: patient.location.longitude, label: 'Tu domicilio', color: Colors.patientColor, icon: 'home' },
    { id: 'doctor', lat: doctor?.location.latitude, lng: doctor?.location.longitude, label: doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Médico', color: Colors.doctorColor, icon: 'medkit' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ETA Banner */}
      <View style={styles.etaBanner}>
        <Ionicons name="navigate" size={20} color={Colors.surface} />
        <View style={{ flex: 1 }}>
          <Text style={styles.etaLabel}>Tiempo estimado de llegada</Text>
          <Text style={styles.etaTime}>
            {progress >= 1 ? 'Tu médico ha llegado' : `${eta} minuto${eta !== 1 ? 's' : ''}`}
          </Text>
        </View>
        <StatusBadge status={progress >= 1 ? 'visiting' : 'en_route'} small />
      </View>

      <MapPlaceholder markers={markers} height={220} note="Mapa de ruta disponible en la app móvil" />

      <Card elevated style={styles.card}>
        <View style={styles.doctorRow}>
          <View style={[styles.avatar, { backgroundColor: Colors.doctorColor }]}>
            <Ionicons name="person" size={24} color={Colors.surface} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.doctorName}>{doctor?.firstName} {doctor?.lastName}</Text>
            <Text style={styles.doctorSpec}>{doctor?.specialty}</Text>
          </View>
          <View style={styles.callBtn}>
            <Ionicons name="call" size={18} color={Colors.surface} />
          </View>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
          </View>
          <Text style={styles.progressLabel}>{Math.round(progress * 100)}% del trayecto completado</Text>
        </View>
        <View style={styles.steps}>
          <View style={styles.step}>
            <View style={[styles.stepDot, { backgroundColor: Colors.doctorColor }]} />
            <Text style={styles.stepText}>Origen médico</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.step}>
            <View style={[styles.stepDot, { backgroundColor: progress >= 1 ? Colors.success : Colors.border }]} />
            <Text style={[styles.stepText, progress >= 1 && { color: Colors.success, fontWeight: '700' }]}>
              Tu domicilio
            </Text>
          </View>
        </View>
      </Card>

      <Card elevated style={styles.card}>
        <Text style={styles.sectionTitle}>Ubicaciones</Text>
        <View style={styles.locRow}>
          <View style={[styles.locDot, { backgroundColor: Colors.patientColor }]}>
            <Ionicons name="home" size={12} color={Colors.surface} />
          </View>
          <View>
            <Text style={styles.locLabel}>Tu domicilio</Text>
            <Text style={styles.locAddr}>{patient.address}</Text>
          </View>
        </View>
        <View style={styles.locRow}>
          <View style={[styles.locDot, { backgroundColor: Colors.doctorColor }]}>
            <Ionicons name="medkit" size={12} color={Colors.surface} />
          </View>
          <View>
            <Text style={styles.locLabel}>Origen del médico</Text>
            <Text style={styles.locAddr}>
              {doctor?.location.latitude.toFixed(4)}, {doctor?.location.longitude.toFixed(4)}
            </Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 14, paddingBottom: 30, gap: 12 },
  etaBanner: {
    backgroundColor: Colors.primary, borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  etaLabel: { fontSize: 11, color: Colors.surface + 'CC', fontWeight: '600' },
  etaTime: { fontSize: 16, color: Colors.surface, fontWeight: '800' },
  card: {},
  doctorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  doctorName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  doctorSpec: { fontSize: 12, color: Colors.textSecondary },
  callBtn: {
    backgroundColor: Colors.success, width: 40, height: 40,
    borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  progressContainer: { marginBottom: 14 },
  progressTrack: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: 8, backgroundColor: Colors.primary, borderRadius: 4 },
  progressLabel: { fontSize: 12, color: Colors.textSecondary },
  steps: { flexDirection: 'row', alignItems: 'center' },
  step: { flex: 1, alignItems: 'center', gap: 4 },
  stepDot: { width: 12, height: 12, borderRadius: 6 },
  stepText: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },
  stepLine: { flex: 1, height: 2, backgroundColor: Colors.border, marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  locRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  locDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  locLabel: { fontSize: 12, color: Colors.textSecondary },
  locAddr: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
});
