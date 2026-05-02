import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Dimensions, Platform, Alert,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { MOCK_DOCTORS, MOCK_PATIENTS } from '../../store/appStore';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';

const { width, height } = Dimensions.get('window');

const VISIT_STATUSES = [
  { key: 'available', label: 'Disponible', icon: 'checkmark-circle', color: Colors.success },
  { key: 'en_route', label: 'En Camino', icon: 'navigate', color: Colors.primary },
  { key: 'visiting', label: 'En Visita', icon: 'home', color: Colors.warning },
  { key: 'completed', label: 'Completado', icon: 'flag', color: Colors.textSecondary },
] as const;

export default function DoctorMapScreen() {
  const { user } = useAuth();
  const doctor = MOCK_DOCTORS.find(d => d.id === user?.id)!;
  const myPatients = MOCK_PATIENTS.filter(p => doctor?.assignedPatients.includes(p.id));

  const [doctorLocation, setDoctorLocation] = useState(doctor?.location);
  const [visitStatus, setVisitStatus] = useState(doctor?.visitStatus ?? 'available');
  const [selectedPatient, setSelectedPatient] = useState(myPatients[0]);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setDoctorLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    })();
  }, []);

  const focusPatient = (patient: typeof myPatients[0]) => {
    setSelectedPatient(patient);
    mapRef.current?.animateToRegion({
      latitude: (doctorLocation.latitude + patient.location.latitude) / 2,
      longitude: (doctorLocation.longitude + patient.location.longitude) / 2,
      latitudeDelta: Math.abs(doctorLocation.latitude - patient.location.latitude) * 2.5 + 0.02,
      longitudeDelta: Math.abs(doctorLocation.longitude - patient.location.longitude) * 2.5 + 0.02,
    }, 600);
  };

  const startRoute = () => {
    setVisitStatus('en_route');
    Alert.alert('Ruta Iniciada', `Navegando hacia ${selectedPatient.firstName} ${selectedPatient.lastName}`);
  };

  const markVisiting = () => setVisitStatus('visiting');
  const markCompleted = () => setVisitStatus('completed');

  const allLocations = [doctorLocation, ...myPatients.map(p => p.location)];
  const midLat = allLocations.reduce((s, l) => s + l.latitude, 0) / allLocations.length;
  const midLng = allLocations.reduce((s, l) => s + l.longitude, 0) / allLocations.length;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={{ latitude: midLat, longitude: midLng, latitudeDelta: 0.06, longitudeDelta: 0.06 }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Doctor Marker */}
        <Marker coordinate={doctorLocation} title="Mi Ubicación">
          <View style={[styles.markerDoctor]}>
            <Ionicons name="medkit" size={16} color={Colors.surface} />
          </View>
        </Marker>

        {/* Patient Markers */}
        {myPatients.map(patient => (
          <Marker
            key={patient.id}
            coordinate={patient.location}
            title={`${patient.firstName} ${patient.lastName}`}
            description={patient.address}
            onPress={() => focusPatient(patient)}
          >
            <View style={[styles.markerPatient, selectedPatient?.id === patient.id && styles.markerSelected]}>
              <Ionicons name="person" size={14} color={Colors.surface} />
            </View>
          </Marker>
        ))}

        {/* Route Line to selected patient */}
        {selectedPatient && (
          <Polyline
            coordinates={[doctorLocation, selectedPatient.location]}
            strokeColor={Colors.primary}
            strokeWidth={3}
            lineDashPattern={[8, 4]}
          />
        )}
      </MapView>

      {/* Bottom Panel */}
      <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
        {/* Visit Status */}
        <View style={styles.statusRow}>
          {VISIT_STATUSES.map(s => (
            <TouchableOpacity
              key={s.key}
              style={[styles.statusBtn, visitStatus === s.key && { backgroundColor: s.color }]}
              onPress={() => setVisitStatus(s.key)}
            >
              <Ionicons name={s.icon as any} size={14} color={visitStatus === s.key ? Colors.surface : s.color} />
              <Text style={[styles.statusBtnText, visitStatus === s.key && { color: Colors.surface }]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Patient Selector */}
        <Text style={styles.sectionLabel}>Seleccionar Paciente</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {myPatients.map(patient => (
            <TouchableOpacity
              key={patient.id}
              style={[styles.patientChip, selectedPatient?.id === patient.id && styles.patientChipActive]}
              onPress={() => focusPatient(patient)}
            >
              <Ionicons name="person" size={14} color={selectedPatient?.id === patient.id ? Colors.surface : Colors.patientColor} />
              <Text style={[styles.patientChipText, selectedPatient?.id === patient.id && { color: Colors.surface }]}>
                {patient.firstName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Selected Patient Info */}
        {selectedPatient && (
          <Card elevated style={styles.selectedCard}>
            <View style={styles.selectedHeader}>
              <View style={[styles.avatar, { backgroundColor: Colors.patientColor }]}>
                <Ionicons name="person" size={20} color={Colors.surface} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedName}>{selectedPatient.firstName} {selectedPatient.lastName}</Text>
                <Text style={styles.selectedRut}>{selectedPatient.rut}</Text>
              </View>
            </View>
            <View style={styles.selectedInfo}>
              <Ionicons name="medical-outline" size={13} color={Colors.doctorColor} />
              <Text style={styles.selectedDiag}>{selectedPatient.diagnosis}</Text>
            </View>
            <View style={styles.selectedInfo}>
              <Ionicons name="location-outline" size={13} color={Colors.accent} />
              <Text style={styles.selectedAddr}>{selectedPatient.address}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              {visitStatus === 'available' && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.primary }]} onPress={startRoute}>
                  <Ionicons name="navigate" size={16} color={Colors.surface} />
                  <Text style={styles.actionBtnText}>Iniciar Ruta</Text>
                </TouchableOpacity>
              )}
              {visitStatus === 'en_route' && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.warning }]} onPress={markVisiting}>
                  <Ionicons name="home" size={16} color={Colors.surface} />
                  <Text style={styles.actionBtnText}>Marcar En Visita</Text>
                </TouchableOpacity>
              )}
              {visitStatus === 'visiting' && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.success }]} onPress={markCompleted}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.surface} />
                  <Text style={styles.actionBtnText}>Finalizar Visita</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width, height: height * 0.45 },
  panel: { flex: 1, backgroundColor: Colors.background },
  panelContent: { padding: 14, paddingBottom: 24 },
  statusRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statusBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, borderRadius: 20, paddingVertical: 7,
    borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  statusBtnText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' },
  patientChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surface, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12, paddingVertical: 7, marginRight: 8,
  },
  patientChipActive: { backgroundColor: Colors.patientColor, borderColor: Colors.patientColor },
  patientChipText: { fontSize: 13, fontWeight: '600', color: Colors.patientColor },
  selectedCard: {},
  selectedHeader: { flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  selectedName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  selectedRut: { fontSize: 12, color: Colors.textSecondary },
  selectedInfo: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginBottom: 4 },
  selectedDiag: { flex: 1, fontSize: 13, color: Colors.doctorColor, fontWeight: '500' },
  selectedAddr: { flex: 1, fontSize: 12, color: Colors.textSecondary },
  actionRow: { marginTop: 10 },
  actionBtn: {
    borderRadius: 8, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 6, paddingVertical: 10,
  },
  actionBtnText: { color: Colors.surface, fontWeight: '700', fontSize: 14 },
  markerDoctor: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.doctorColor,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.surface,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
  markerPatient: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.patientColor,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.surface,
  },
  markerSelected: { width: 38, height: 38, borderRadius: 19, borderColor: Colors.warning, borderWidth: 3 },
});
