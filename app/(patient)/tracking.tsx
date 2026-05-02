import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform,
} from 'react-native';
const _maps = Platform.OS !== 'web' ? require('react-native-maps') : {};
const MapView: any = _maps.default ?? (() => null);
const Marker: any = _maps.Marker ?? (() => null);
const Polyline: any = _maps.Polyline ?? (() => null);
const PROVIDER_GOOGLE: any = _maps.PROVIDER_GOOGLE ?? null;
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { MOCK_PATIENTS, MOCK_DOCTORS } from '../../store/appStore';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';

const { width, height } = Dimensions.get('window');

function interpolate(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export default function PatientTrackingScreen() {
  const { user } = useAuth();
  const patient = MOCK_PATIENTS.find(p => p.id === user?.id)!;
  const doctor = MOCK_DOCTORS.find(d => d.id === patient?.assignedDoctorId)!;

  const [doctorLoc, setDoctorLoc] = useState(doctor?.location ?? { latitude: -33.428, longitude: -70.61 });
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(12);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (doctor?.visitStatus !== 'en_route') return;

    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(prev + 0.015, 1);
        const newLat = interpolate(doctor.location.latitude, patient.location.latitude, next);
        const newLng = interpolate(doctor.location.longitude, patient.location.longitude, next);
        setDoctorLoc({ latitude: newLat, longitude: newLng });
        setEta(Math.round((1 - next) * 12));
        return next;
      });
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const midLat = (doctorLoc.latitude + patient.location.latitude) / 2;
  const midLng = (doctorLoc.longitude + patient.location.longitude) / 2;
  const latDelta = Math.abs(doctorLoc.latitude - patient.location.latitude) * 2 + 0.02;
  const lngDelta = Math.abs(doctorLoc.longitude - patient.location.longitude) * 2 + 0.02;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        region={{ latitude: midLat, longitude: midLng, latitudeDelta: latDelta, longitudeDelta: lngDelta }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Patient Marker */}
        <Marker coordinate={patient.location} title="Mi Ubicación" description={patient.address}>
          <View style={[styles.marker, { backgroundColor: Colors.patientColor }]}>
            <Ionicons name="home" size={16} color={Colors.surface} />
          </View>
        </Marker>

        {/* Doctor Marker */}
        <Marker coordinate={doctorLoc} title={`${doctor?.firstName} ${doctor?.lastName}`} description="Médico en camino">
          <View style={[styles.marker, { backgroundColor: Colors.doctorColor }]}>
            <Ionicons name="medkit" size={16} color={Colors.surface} />
          </View>
        </Marker>

        {/* Route */}
        <Polyline
          coordinates={[doctorLoc, patient.location]}
          strokeColor={Colors.primary}
          strokeWidth={3}
          lineDashPattern={[8, 4]}
        />
      </MapView>

      {/* Status Panel */}
      <View style={styles.panel}>
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

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{Math.round(progress * 100)}% del trayecto completado</Text>
          </View>

          {/* Route Steps */}
          <View style={styles.steps}>
            <View style={styles.step}>
              <View style={[styles.stepDot, { backgroundColor: Colors.doctorColor }]} />
              <Text style={styles.stepText}>Origen del médico</Text>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width, height: height * 0.55 },
  panel: { flex: 1, backgroundColor: Colors.background, padding: 14 },
  etaBanner: {
    backgroundColor: Colors.primary,
    borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 12,
  },
  etaLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  etaLabel: { fontSize: 11, color: Colors.surface + 'CC', fontWeight: '600' },
  etaTime: { fontSize: 16, color: Colors.surface, fontWeight: '800' },
  doctorCard: { flex: 1 },
  doctorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  doctorName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  doctorSpec: { fontSize: 12, color: Colors.textSecondary },
  callBtn: {
    backgroundColor: Colors.success, width: 40, height: 40,
    borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  progressContainer: { marginBottom: 14 },
  progressTrack: {
    height: 8, backgroundColor: Colors.border,
    borderRadius: 4, overflow: 'hidden', marginBottom: 6,
  },
  progressFill: { height: 8, backgroundColor: Colors.primary, borderRadius: 4 },
  progressLabel: { fontSize: 12, color: Colors.textSecondary },
  steps: { flexDirection: 'row', alignItems: 'center' },
  step: { flex: 1, alignItems: 'center', gap: 4 },
  stepDot: { width: 12, height: 12, borderRadius: 6 },
  stepText: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center' },
  stepLine: { flex: 1, height: 2, backgroundColor: Colors.border, marginBottom: 16 },
  marker: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.surface,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
});
