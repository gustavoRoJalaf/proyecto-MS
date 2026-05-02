import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_PATIENTS, MOCK_DOCTORS } from '../../store/appStore';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';

const { width, height } = Dimensions.get('window');
const SANTIAGO = { latitude: -33.44, longitude: -70.604, latitudeDelta: 0.12, longitudeDelta: 0.12 };

type LayerFilter = 'all' | 'patients' | 'doctors';

export default function AdminTrackingScreen() {
  const [layer, setLayer] = useState<LayerFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const showPatients = layer === 'all' || layer === 'patients';
  const showDoctors = layer === 'all' || layer === 'doctors';

  const selectedPatient = MOCK_PATIENTS.find(p => p.id === selectedId);
  const selectedDoctor = MOCK_DOCTORS.find(d => d.id === selectedId);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={SANTIAGO}
      >
        {/* Patient Markers */}
        {showPatients && MOCK_PATIENTS.map(patient => (
          <Marker
            key={patient.id}
            coordinate={patient.location}
            title={`${patient.firstName} ${patient.lastName}`}
            description={patient.diagnosis}
            onPress={() => setSelectedId(patient.id)}
          >
            <View style={[styles.marker, { backgroundColor: Colors.patientColor }, selectedId === patient.id && styles.markerActive]}>
              <Ionicons name="person" size={14} color={Colors.surface} />
            </View>
          </Marker>
        ))}

        {/* Doctor Markers */}
        {showDoctors && MOCK_DOCTORS.map(doctor => (
          <Marker
            key={doctor.id}
            coordinate={doctor.location}
            title={`${doctor.firstName} ${doctor.lastName}`}
            description={doctor.visitStatus}
            onPress={() => setSelectedId(doctor.id)}
          >
            <View style={[styles.marker, { backgroundColor: Colors.doctorColor }, selectedId === doctor.id && styles.markerActive]}>
              <Ionicons name="medkit" size={14} color={Colors.surface} />
            </View>
          </Marker>
        ))}

        {/* Route Lines: doctors to their patients */}
        {showDoctors && showPatients && MOCK_DOCTORS
          .filter(d => d.visitStatus === 'en_route')
          .map(doctor =>
            doctor.assignedPatients.slice(0, 1).map(patientId => {
              const patient = MOCK_PATIENTS.find(p => p.id === patientId);
              if (!patient) return null;
              return (
                <Polyline
                  key={`route-${doctor.id}-${patientId}`}
                  coordinates={[doctor.location, patient.location]}
                  strokeColor={Colors.primary}
                  strokeWidth={2}
                  lineDashPattern={[6, 3]}
                />
              );
            })
          )}
      </MapView>

      {/* Bottom Panel */}
      <View style={styles.panel}>
        {/* Layer Filters */}
        <View style={styles.layerRow}>
          {(['all', 'doctors', 'patients'] as LayerFilter[]).map(l => (
            <TouchableOpacity
              key={l}
              style={[styles.layerBtn, layer === l && styles.layerBtnActive]}
              onPress={() => { setLayer(l); setSelectedId(null); }}
            >
              <Ionicons
                name={l === 'all' ? 'layers' : l === 'doctors' ? 'medkit' : 'people'}
                size={14}
                color={layer === l ? Colors.surface : Colors.textSecondary}
              />
              <Text style={[styles.layerBtnText, layer === l && { color: Colors.surface }]}>
                {l === 'all' ? 'Todo' : l === 'doctors' ? 'Médicos' : 'Pacientes'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Selected Info */}
          {(selectedPatient || selectedDoctor) && (
            <Card elevated style={styles.selectedCard}>
              <View style={styles.selectedHeader}>
                <View style={[styles.selAvatar, { backgroundColor: selectedPatient ? Colors.patientColor : Colors.doctorColor }]}>
                  <Ionicons name={selectedPatient ? 'person' : 'medkit'} size={20} color={Colors.surface} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.selName}>
                    {selectedPatient
                      ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
                      : `${selectedDoctor!.firstName} ${selectedDoctor!.lastName}`}
                  </Text>
                  <Text style={styles.selSub}>
                    {selectedPatient ? selectedPatient.rut : selectedDoctor!.specialty}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedId(null)}>
                  <Ionicons name="close-circle" size={20} color={Colors.textLight} />
                </TouchableOpacity>
              </View>
              {selectedPatient && (
                <Text style={styles.selDetail}>{selectedPatient.diagnosis}</Text>
              )}
              {selectedDoctor && (
                <StatusBadge status={selectedDoctor.visitStatus as any} />
              )}
            </Card>
          )}

          {/* Doctors List */}
          {showDoctors && (
            <>
              <Text style={styles.sectionTitle}>Médicos ({MOCK_DOCTORS.length})</Text>
              {MOCK_DOCTORS.map(doctor => (
                <TouchableOpacity key={doctor.id} onPress={() => setSelectedId(doctor.id)} activeOpacity={0.8}>
                  <Card style={[styles.listCard, selectedId === doctor.id ? styles.listCardSelected : undefined]}>
                    <View style={styles.listRow}>
                      <View style={[styles.listAvatar, { backgroundColor: Colors.doctorColor }]}>
                        <Ionicons name="medkit" size={16} color={Colors.surface} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.listName}>{doctor.firstName} {doctor.lastName}</Text>
                        <Text style={styles.listSub}>{doctor.specialty} · {doctor.assignedPatients.length} pacientes</Text>
                      </View>
                      <StatusBadge status={doctor.visitStatus as any} small />
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Patients List */}
          {showPatients && (
            <>
              <Text style={styles.sectionTitle}>Pacientes ({MOCK_PATIENTS.length})</Text>
              {MOCK_PATIENTS.map(patient => (
                <TouchableOpacity key={patient.id} onPress={() => setSelectedId(patient.id)} activeOpacity={0.8}>
                  <Card style={[styles.listCard, selectedId === patient.id ? styles.listCardSelected : undefined]}>
                    <View style={styles.listRow}>
                      <View style={[styles.listAvatar, { backgroundColor: Colors.patientColor }]}>
                        <Ionicons name="person" size={16} color={Colors.surface} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.listName}>{patient.firstName} {patient.lastName}</Text>
                        <Text style={styles.listSub} numberOfLines={1}>{patient.diagnosis}</Text>
                      </View>
                      <Ionicons name="location" size={16} color={Colors.accent} />
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width, height: height * 0.42 },
  panel: { flex: 1, backgroundColor: Colors.background, padding: 12 },
  layerRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  layerBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, borderRadius: 20, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface,
  },
  layerBtnActive: { backgroundColor: Colors.adminColor, borderColor: Colors.adminColor },
  layerBtnText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  selectedCard: { marginBottom: 10, borderColor: Colors.adminColor + '40', backgroundColor: Colors.adminColor + '06' },
  selectedHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  selAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  selName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  selSub: { fontSize: 12, color: Colors.textSecondary },
  selDetail: { fontSize: 13, color: Colors.textSecondary },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  listCard: { marginBottom: 8 },
  listCardSelected: { borderColor: Colors.adminColor, borderWidth: 1.5 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  listAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  listName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  listSub: { fontSize: 11, color: Colors.textSecondary },
  marker: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.surface,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, shadowRadius: 3, elevation: 3,
  },
  markerActive: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: Colors.warning },
});
