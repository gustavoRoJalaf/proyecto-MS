import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_PATIENTS, MOCK_DOCTORS } from '../../store/appStore';
import { Colors } from '../../constants/colors';

const STATUS_COLORS: Record<string, string> = {
  available: Colors.success,
  en_route: Colors.primary,
  visiting: Colors.warning,
  completed: Colors.textSecondary,
};

const STATUS_LABELS: Record<string, string> = {
  available: 'Disponible',
  en_route: 'En Camino',
  visiting: 'En Visita',
  completed: 'Completado',
};

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

type LayerFilter = 'all' | 'patients' | 'doctors';

export default function AdminTrackingScreen() {
  const [layer, setLayer] = useState<LayerFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const showPatients = layer === 'all' || layer === 'patients';
  const showDoctors = layer === 'all' || layer === 'doctors';

  const selectedPatient = MOCK_PATIENTS.find(p => p.id === selectedId);
  const selectedDoctor = MOCK_DOCTORS.find(d => d.id === selectedId);

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <Text style={styles.sidebarTitle}>Seguimiento Global</Text>

        {/* Filters */}
        <View style={styles.filterRow}>
          {(['all', 'doctors', 'patients'] as LayerFilter[]).map(l => (
            <TouchableOpacity
              key={l}
              style={[styles.filterBtn, layer === l && styles.filterBtnActive]}
              onPress={() => setLayer(l)}
            >
              <Text style={[styles.filterText, layer === l && styles.filterTextActive]}>
                {l === 'all' ? 'Todo' : l === 'doctors' ? 'Médicos' : 'Pacientes'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <View key={key} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS[key] }]} />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          {/* Selected detail card */}
          {(selectedPatient || selectedDoctor) && (
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <View style={[styles.detailAvatar, {
                  backgroundColor: selectedPatient ? Colors.patientColor : STATUS_COLORS[selectedDoctor!.visitStatus],
                }]}>
                  <Text style={{ fontSize: 16 }}>{selectedPatient ? '👤' : '🏥'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailName}>
                    {selectedPatient
                      ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                      : `Dr. ${selectedDoctor!.firstName} ${selectedDoctor!.lastName}`}
                  </Text>
                  <Text style={styles.detailSub}>
                    {selectedPatient ? selectedPatient.rut : selectedDoctor!.specialty}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedId(null)} style={styles.closeBtn}>
                  <Ionicons name="close" size={16} color={Colors.textLight} />
                </TouchableOpacity>
              </View>
              {selectedPatient && (
                <>
                  <Text style={styles.detailDiag}>{selectedPatient.diagnosis}</Text>
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={12} color={Colors.accent} />
                    <Text style={styles.detailAddr}>{selectedPatient.address}</Text>
                  </View>
                </>
              )}
              {selectedDoctor && (
                <>
                  <View style={[styles.statusPill, { backgroundColor: STATUS_COLORS[selectedDoctor.visitStatus] + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[selectedDoctor.visitStatus] }]} />
                    <Text style={[styles.statusLabel, { color: STATUS_COLORS[selectedDoctor.visitStatus] }]}>
                      {STATUS_LABELS[selectedDoctor.visitStatus]}
                    </Text>
                  </View>
                  <Text style={styles.detailDiag}>{selectedDoctor.assignedPatients.length} pacientes asignados</Text>
                </>
              )}
            </View>
          )}

          {/* Doctors list */}
          {showDoctors && (
            <>
              <Text style={styles.listTitle}>Médicos ({MOCK_DOCTORS.length})</Text>
              {MOCK_DOCTORS.map(d => (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.listItem, selectedId === d.id && styles.listItemSelected]}
                  onPress={() => setSelectedId(d.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.listDot, { backgroundColor: STATUS_COLORS[d.visitStatus] }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listName}>{d.firstName} {d.lastName}</Text>
                    <Text style={styles.listSub}>{d.specialty}</Text>
                  </View>
                  <Text style={[styles.listStatus, { color: STATUS_COLORS[d.visitStatus] }]}>
                    {STATUS_LABELS[d.visitStatus]}
                  </Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Patients list */}
          {showPatients && (
            <>
              <Text style={styles.listTitle}>Pacientes ({MOCK_PATIENTS.length})</Text>
              {MOCK_PATIENTS.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.listItem, selectedId === p.id && styles.listItemSelected]}
                  onPress={() => setSelectedId(p.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.listDot, { backgroundColor: Colors.patientColor }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listName}>{p.firstName} {p.lastName}</Text>
                    <Text style={styles.listSub} numberOfLines={1}>{p.diagnosis}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </View>

      {/* Map */}
      <View style={styles.mapWrapper}>
        <MapContainer
          center={[-33.44, -70.604]}
          zoom={12}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Patient markers */}
          {showPatients && MOCK_PATIENTS.map(p => (
            <Marker
              key={p.id}
              position={[p.location.latitude, p.location.longitude]}
              icon={makeDivIcon(Colors.patientColor, '👤', selectedId === p.id ? 42 : 34)}
              eventHandlers={{ click: () => setSelectedId(p.id) }}
            >
              <Popup>
                <strong>{p.firstName} {p.lastName}</strong><br />
                <em>{p.rut}</em><br />
                {p.diagnosis}<br />
                📍 {p.address}
              </Popup>
            </Marker>
          ))}

          {/* Doctor markers */}
          {showDoctors && MOCK_DOCTORS.map(d => (
            <Marker
              key={d.id}
              position={[d.location.latitude, d.location.longitude]}
              icon={makeDivIcon(STATUS_COLORS[d.visitStatus], '🏥', selectedId === d.id ? 42 : 34)}
              eventHandlers={{ click: () => setSelectedId(d.id) }}
            >
              <Popup>
                <strong>Dr. {d.firstName} {d.lastName}</strong><br />
                {d.specialty}<br />
                <span style={{ color: STATUS_COLORS[d.visitStatus], fontWeight: 'bold' }}>
                  ● {STATUS_LABELS[d.visitStatus]}
                </span>
              </Popup>
            </Marker>
          ))}

          {/* Route lines: doctors en_route or visiting → their first patient */}
          {showDoctors && showPatients && MOCK_DOCTORS
            .filter(d => d.visitStatus === 'en_route' || d.visitStatus === 'visiting')
            .flatMap(d => d.assignedPatients.slice(0, 1).map(pid => {
              const p = MOCK_PATIENTS.find(pt => pt.id === pid);
              if (!p) return null;
              return (
                <Polyline
                  key={`route-${d.id}-${pid}`}
                  positions={[
                    [d.location.latitude, d.location.longitude],
                    [p.location.latitude, p.location.longitude],
                  ]}
                  color={STATUS_COLORS[d.visitStatus]}
                  weight={3}
                  dashArray="10, 6"
                  opacity={0.8}
                />
              );
            }))}
        </MapContainer>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: Colors.background },
  sidebar: { width: 270, backgroundColor: Colors.surface, borderRightWidth: 1, borderRightColor: Colors.border, padding: 14, display: 'flex' as any },
  sidebarTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, marginBottom: 10 },
  filterRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  filterBtn: { flex: 1, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', backgroundColor: Colors.surface },
  filterBtnActive: { backgroundColor: Colors.adminColor, borderColor: Colors.adminColor },
  filterText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: Colors.surface },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10, padding: 8, backgroundColor: Colors.background, borderRadius: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: Colors.textSecondary },
  detailCard: { backgroundColor: Colors.adminColor + '08', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: Colors.adminColor + '30' },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  detailAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  detailName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  detailSub: { fontSize: 11, color: Colors.textSecondary },
  closeBtn: { padding: 4 },
  detailDiag: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  detailRow: { flexDirection: 'row', gap: 4, alignItems: 'flex-start' },
  detailAddr: { fontSize: 11, color: Colors.textLight, flex: 1 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 6, alignSelf: 'flex-start' as any },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusLabel: { fontSize: 12, fontWeight: '700' },
  listTitle: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8, marginBottom: 6 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 7, paddingHorizontal: 8, borderRadius: 8, marginBottom: 2 },
  listItemSelected: { backgroundColor: Colors.adminColor + '18' },
  listDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  listName: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },
  listSub: { fontSize: 10, color: Colors.textSecondary },
  listStatus: { fontSize: 10, fontWeight: '600' },
  mapWrapper: { flex: 1, overflow: 'hidden' as any },
});
