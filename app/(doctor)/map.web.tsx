import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { MOCK_DOCTORS, MOCK_PATIENTS } from '../../store/appStore';
import { Colors } from '../../constants/colors';

const VISIT_STATUSES = [
  { key: 'available', label: 'Disponible', color: Colors.success },
  { key: 'en_route', label: 'En Camino', color: Colors.primary },
  { key: 'visiting', label: 'En Visita', color: Colors.warning },
  { key: 'completed', label: 'Completado', color: Colors.textSecondary },
] as const;

function makeDivIcon(color: string, emoji: string, size = 34) {
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

export default function DoctorMapScreen() {
  const { user } = useAuth();
  const doctor = MOCK_DOCTORS.find(d => d.id === user?.id)!;
  const myPatients = MOCK_PATIENTS.filter(p => doctor?.assignedPatients.includes(p.id));

  const [visitStatus, setVisitStatus] = useState(doctor?.visitStatus ?? 'available');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(myPatients[0]?.id ?? null);
  const selectedPatient = myPatients.find(p => p.id === selectedPatientId);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const statusColor = VISIT_STATUSES.find(s => s.key === visitStatus)?.color ?? Colors.primary;
  const center = doctor
    ? [doctor.location.latitude, doctor.location.longitude] as [number, number]
    : [-33.44, -70.604] as [number, number];

  return (
    <View style={styles.container}>
      {/* Map */}
      <View style={styles.mapWrapper}>
        <MapContainer center={center} zoom={13} style={{ width: '100%', height: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Doctor marker */}
          {doctor && (
            <Marker
              position={[doctor.location.latitude, doctor.location.longitude]}
              icon={makeDivIcon(statusColor, '🏥', 40)}
            >
              <Popup>
                <strong>Dr. {doctor.firstName} {doctor.lastName}</strong><br />
                {doctor.specialty}<br />
                Estado: {VISIT_STATUSES.find(s => s.key === visitStatus)?.label}
              </Popup>
            </Marker>
          )}

          {/* Patient markers */}
          {myPatients.map(p => (
            <Marker
              key={p.id}
              position={[p.location.latitude, p.location.longitude]}
              icon={makeDivIcon(
                selectedPatientId === p.id ? Colors.warning : Colors.patientColor,
                '👤',
                selectedPatientId === p.id ? 40 : 32
              )}
              eventHandlers={{ click: () => setSelectedPatientId(p.id) }}
            >
              <Popup>
                <strong>{p.firstName} {p.lastName}</strong><br />
                {p.rut}<br />
                {p.diagnosis}<br />
                📍 {p.address}
              </Popup>
            </Marker>
          ))}

          {/* Route line to selected patient */}
          {doctor && selectedPatient && (
            <Polyline
              positions={[
                [doctor.location.latitude, doctor.location.longitude],
                [selectedPatient.location.latitude, selectedPatient.location.longitude],
              ]}
              color={statusColor}
              weight={3}
              dashArray="10, 6"
              opacity={0.85}
            />
          )}
        </MapContainer>
      </View>

      {/* Right panel */}
      <View style={styles.panel}>
        {/* Visit status */}
        <Text style={styles.sectionLabel}>Estado de Visita</Text>
        <View style={styles.statusGrid}>
          {VISIT_STATUSES.map(s => (
            <TouchableOpacity
              key={s.key}
              style={[styles.statusBtn, visitStatus === s.key && { backgroundColor: s.color, borderColor: s.color }]}
              onPress={() => setVisitStatus(s.key)}
            >
              <View style={[styles.statusDot, { backgroundColor: visitStatus === s.key ? Colors.surface : s.color }]} />
              <Text style={[styles.statusBtnText, visitStatus === s.key && { color: Colors.surface }]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Patient list */}
        <Text style={styles.sectionLabel}>Mis Pacientes</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {myPatients.map(p => (
            <TouchableOpacity
              key={p.id}
              style={[styles.patientCard, selectedPatientId === p.id && styles.patientCardSelected]}
              onPress={() => setSelectedPatientId(p.id)}
              activeOpacity={0.75}
            >
              <View style={[styles.avatar, { backgroundColor: selectedPatientId === p.id ? Colors.warning : Colors.patientColor }]}>
                <Text style={{ fontSize: 14 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.patientName}>{p.firstName} {p.lastName}</Text>
                <Text style={styles.patientRut}>{p.rut}</Text>
                <Text style={styles.patientDiag} numberOfLines={1}>{p.diagnosis}</Text>
              </View>
              {selectedPatientId === p.id && (
                <Ionicons name="navigate" size={16} color={statusColor} />
              )}
            </TouchableOpacity>
          ))}

          {/* Selected patient detail */}
          {selectedPatient && (
            <View style={styles.detailBox}>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={13} color={Colors.accent} />
                <Text style={styles.detailText}>{selectedPatient.address}</Text>
              </View>
              {visitStatus === 'available' && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.primary }]} onPress={() => setVisitStatus('en_route')}>
                  <Ionicons name="navigate" size={15} color={Colors.surface} />
                  <Text style={styles.actionBtnText}>Iniciar Ruta</Text>
                </TouchableOpacity>
              )}
              {visitStatus === 'en_route' && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.warning }]} onPress={() => setVisitStatus('visiting')}>
                  <Ionicons name="home" size={15} color={Colors.surface} />
                  <Text style={styles.actionBtnText}>Marcar En Visita</Text>
                </TouchableOpacity>
              )}
              {visitStatus === 'visiting' && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.success }]} onPress={() => setVisitStatus('completed')}>
                  <Ionicons name="checkmark-circle" size={15} color={Colors.surface} />
                  <Text style={styles.actionBtnText}>Finalizar Visita</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: Colors.background },
  mapWrapper: { flex: 1, overflow: 'hidden' as any },
  panel: { width: 260, backgroundColor: Colors.surface, padding: 14, borderLeftWidth: 1, borderLeftColor: Colors.border },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 4 },
  statusGrid: { gap: 6, marginBottom: 14 },
  statusBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  patientCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, marginBottom: 6, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  patientCardSelected: { borderColor: Colors.warning, backgroundColor: Colors.warning + '0A' },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  patientName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  patientRut: { fontSize: 10, color: Colors.textSecondary },
  patientDiag: { fontSize: 11, color: Colors.doctorColor, fontWeight: '500' },
  detailBox: { backgroundColor: Colors.background, borderRadius: 10, padding: 12, gap: 8, marginTop: 4 },
  detailRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  detailText: { flex: 1, fontSize: 12, color: Colors.textSecondary },
  actionBtn: { borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  actionBtnText: { color: Colors.surface, fontWeight: '700', fontSize: 13 },
});
