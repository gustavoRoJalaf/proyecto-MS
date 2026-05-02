import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { MOCK_PATIENTS, MOCK_DOCTORS } from '../../store/appStore';
import { Colors } from '../../constants/colors';

function interpolate(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function makeDivIcon(color: string, emoji: string, size = 36) {
  return L.divIcon({
    html: `<div style="
      background:${color};width:${size}px;height:${size}px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);
      font-size:${Math.round(size * 0.45)}px;line-height:1;
    ">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
    className: '',
  });
}

function MapAutoCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng]); }, [lat, lng]);
  return null;
}

export default function PatientTrackingScreen() {
  const { user } = useAuth();
  const patient = MOCK_PATIENTS.find(p => p.id === user?.id)!;
  const doctor = MOCK_DOCTORS.find(d => d.id === patient?.assignedDoctorId)!;

  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState(12);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const doctorLat = doctor
    ? interpolate(doctor.location.latitude, patient?.location.latitude ?? doctor.location.latitude, progress)
    : -33.44;
  const doctorLng = doctor
    ? interpolate(doctor.location.longitude, patient?.location.longitude ?? doctor.location.longitude, progress)
    : -70.604;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => {
    if (doctor?.visitStatus !== 'en_route') return;
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(prev + 0.012, 1);
        setEta(Math.round((1 - next) * 12));
        return next;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const midLat = patient ? (doctorLat + patient.location.latitude) / 2 : doctorLat;
  const midLng = patient ? (doctorLng + patient.location.longitude) / 2 : doctorLng;
  const arrived = progress >= 1;

  return (
    <View style={styles.container}>
      {/* Map */}
      <View style={styles.mapWrapper}>
        <MapContainer
          center={[midLat, midLng]}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapAutoCenter lat={midLat} lng={midLng} />

          {/* Patient marker (home) */}
          {patient && (
            <Marker
              position={[patient.location.latitude, patient.location.longitude]}
              icon={makeDivIcon(Colors.patientColor, '🏠', 38)}
            >
              <Popup>
                <strong>Mi domicilio</strong><br />
                {patient.address}
              </Popup>
            </Marker>
          )}

          {/* Animated doctor marker */}
          <Marker
            position={[doctorLat, doctorLng]}
            icon={makeDivIcon(arrived ? Colors.success : Colors.doctorColor, arrived ? '✅' : '🚗', 38)}
          >
            <Popup>
              <strong>Dr. {doctor?.firstName} {doctor?.lastName}</strong><br />
              {doctor?.specialty}<br />
              {arrived ? '¡Ha llegado!' : `ETA: ${eta} min`}
            </Popup>
          </Marker>

          {/* Route line */}
          {patient && !arrived && (
            <Polyline
              positions={[
                [doctorLat, doctorLng],
                [patient.location.latitude, patient.location.longitude],
              ]}
              color={Colors.primary}
              weight={3}
              dashArray="10, 6"
              opacity={0.7}
            />
          )}
        </MapContainer>
      </View>

      {/* Info panel */}
      <View style={styles.panel}>
        {/* ETA Banner */}
        <View style={[styles.etaBanner, { backgroundColor: arrived ? Colors.success : Colors.primary }]}>
          <Ionicons name={arrived ? 'checkmark-circle' : 'navigate'} size={22} color={Colors.surface} />
          <View style={{ flex: 1 }}>
            <Text style={styles.etaLabel}>
              {arrived ? '¡Tu médico ha llegado!' : 'Tiempo estimado de llegada'}
            </Text>
            {!arrived && <Text style={styles.etaTime}>{eta} minuto{eta !== 1 ? 's' : ''}</Text>}
          </View>
        </View>

        {/* Progress bar */}
        {!arrived && (
          <View style={styles.progressBox}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
            </View>
            <Text style={styles.progressLabel}>{Math.round(progress * 100)}% del trayecto completado</Text>
          </View>
        )}

        {/* Doctor card */}
        <View style={styles.doctorCard}>
          <View style={[styles.docAvatar, { backgroundColor: arrived ? Colors.success : Colors.doctorColor }]}>
            <Text style={{ fontSize: 20 }}>👨‍⚕️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.doctorName}>Dr. {doctor?.firstName} {doctor?.lastName}</Text>
            <Text style={styles.doctorSpec}>{doctor?.specialty}</Text>
          </View>
          <TouchableOpacity style={styles.callBtn}>
            <Ionicons name="call" size={18} color={Colors.surface} />
          </TouchableOpacity>
        </View>

        {/* Address */}
        {patient && (
          <View style={styles.addrRow}>
            <Ionicons name="location-outline" size={14} color={Colors.accent} />
            <Text style={styles.addrText}>{patient.address}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'column', backgroundColor: Colors.background },
  mapWrapper: { flex: 1, overflow: 'hidden' as any },
  panel: { backgroundColor: Colors.surface, padding: 16, borderTopWidth: 1, borderTopColor: Colors.border, gap: 12 },
  etaBanner: { borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  etaLabel: { fontSize: 12, color: Colors.surface + 'DD', fontWeight: '600' },
  etaTime: { fontSize: 20, color: Colors.surface, fontWeight: '800' },
  progressBox: { gap: 6 },
  progressTrack: { height: 8, backgroundColor: Colors.border, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: Colors.primary, borderRadius: 4 },
  progressLabel: { fontSize: 12, color: Colors.textSecondary },
  doctorCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  doctorName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  doctorSpec: { fontSize: 12, color: Colors.textSecondary },
  callBtn: { backgroundColor: Colors.success, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  addrRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  addrText: { flex: 1, fontSize: 13, color: Colors.textSecondary },
});
