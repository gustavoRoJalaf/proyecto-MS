import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { MOCK_DOCTORS, MOCK_PATIENTS, MOCK_APPOINTMENTS, MOCK_EXAMS, Patient } from '../../store/appStore';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import InfoRow from '../../components/InfoRow';
import StatusBadge from '../../components/StatusBadge';

export default function PatientsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const doctor = MOCK_DOCTORS.find(d => d.id === user?.id)!;
  const myPatients = MOCK_PATIENTS.filter(p => doctor?.assignedPatients.includes(p.id));

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Patient | null>(null);

  const filtered = myPatients.filter(p =>
    `${p.firstName} ${p.lastName} ${p.rut} ${p.diagnosis}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const PatientModal = () => {
    if (!selected) return null;
    const patientExams = MOCK_EXAMS.filter(e => e.patientId === selected.id);
    const patientAppts = MOCK_APPOINTMENTS.filter(a => a.patientId === selected.id);
    return (
      <Modal visible animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ficha del Paciente</Text>
            <TouchableOpacity onPress={() => { setSelected(null); router.push('/(doctor)/map'); }} style={styles.navBtn}>
              <Ionicons name="navigate" size={20} color={Colors.doctorColor} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {/* Avatar */}
            <View style={styles.modalAvatar}>
              <View style={[styles.bigAvatar, { backgroundColor: Colors.patientColor }]}>
                <Ionicons name="person" size={36} color={Colors.surface} />
              </View>
              <Text style={styles.modalName}>{selected.firstName} {selected.lastName}</Text>
              <Text style={styles.modalRut}>{selected.rut}</Text>
            </View>

            <Card elevated style={styles.card}>
              <Text style={styles.cardSectionTitle}>Información Personal</Text>
              <InfoRow icon="person-outline" label="Nombre Completo" value={`${selected.firstName} ${selected.lastName}`} />
              <InfoRow icon="card-outline" label="RUT" value={selected.rut} />
              <InfoRow icon="call-outline" label="Teléfono" value={selected.phone} />
              <InfoRow icon="mail-outline" label="Email" value={selected.email} />
              <InfoRow icon="location-outline" label="Dirección" value={selected.address} iconColor={Colors.accent} />
            </Card>

            <Card elevated style={styles.card}>
              <Text style={styles.cardSectionTitle}>Información Clínica</Text>
              <View style={styles.diagnosisBox}>
                <Ionicons name="medical" size={16} color={Colors.doctorColor} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.diagnosisLabel}>Diagnóstico</Text>
                  <Text style={styles.diagnosisText}>{selected.diagnosis}</Text>
                </View>
              </View>
            </Card>

            {/* Exams */}
            <Card elevated style={styles.card}>
              <Text style={styles.cardSectionTitle}>Exámenes ({patientExams.length})</Text>
              {patientExams.map(exam => (
                <View key={exam.id} style={styles.examRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.examName}>{exam.name}</Text>
                    <Text style={styles.examDate}>{exam.date}</Text>
                  </View>
                  <StatusBadge status={exam.status} small />
                </View>
              ))}
            </Card>

            {/* Appointments */}
            <Card elevated style={styles.card}>
              <Text style={styles.cardSectionTitle}>Citas ({patientAppts.length})</Text>
              {patientAppts.map(appt => (
                <View key={appt.id} style={styles.apptRow}>
                  <Text style={styles.apptDate}>{appt.date} {appt.time}</Text>
                  <StatusBadge status={appt.status} small />
                </View>
              ))}
            </Card>

            {/* Location */}
            <Card elevated style={styles.card}>
              <View style={styles.locHeader}>
                <Ionicons name="location" size={16} color={Colors.accent} />
                <Text style={styles.cardSectionTitle}>Geolocalización</Text>
              </View>
              <Text style={styles.locCoords}>
                Lat: {selected.location.latitude.toFixed(5)}{'\n'}
                Lng: {selected.location.longitude.toFixed(5)}
              </Text>
              <TouchableOpacity
                style={styles.mapBtn}
                onPress={() => { setSelected(null); router.push('/(doctor)/map'); }}
              >
                <Ionicons name="map" size={16} color={Colors.surface} />
                <Text style={styles.mapBtnText}>Ver en Mapa</Text>
              </TouchableOpacity>
            </Card>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, RUT o diagnóstico..."
          placeholderTextColor={Colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.countLabel}>{filtered.length} paciente{filtered.length !== 1 ? 's' : ''} asignado{filtered.length !== 1 ? 's' : ''}</Text>

        {filtered.map(patient => (
          <TouchableOpacity key={patient.id} onPress={() => setSelected(patient)} activeOpacity={0.8}>
            <Card elevated style={styles.patientCard}>
              <View style={styles.patientRow}>
                <View style={[styles.avatar, { backgroundColor: Colors.patientColor }]}>
                  <Ionicons name="person" size={22} color={Colors.surface} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.patientName}>{patient.firstName} {patient.lastName}</Text>
                  <Text style={styles.patientRut}>{patient.rut}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
              </View>
              <View style={styles.diagRow}>
                <Ionicons name="medical-outline" size={13} color={Colors.doctorColor} />
                <Text style={styles.diagText} numberOfLines={2}>{patient.diagnosis}</Text>
              </View>
              <View style={styles.addrRow}>
                <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.addrText} numberOfLines={1}>{patient.address}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <PatientModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surface, margin: 16, marginBottom: 0,
    borderRadius: 10, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, height: 46,
  },
  searchIcon: {},
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  content: { padding: 16, paddingBottom: 30 },
  countLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  patientCard: { marginBottom: 12 },
  patientRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  patientName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  patientRut: { fontSize: 12, color: Colors.textSecondary },
  diagRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginBottom: 4 },
  diagText: { flex: 1, fontSize: 13, color: Colors.doctorColor, fontWeight: '500' },
  addrRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  addrText: { flex: 1, fontSize: 12, color: Colors.textSecondary },
  // Modal
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    paddingTop: 50, backgroundColor: Colors.surface,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4, marginRight: 8 },
  modalTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  navBtn: { padding: 8, backgroundColor: Colors.doctorColor + '15', borderRadius: 8 },
  modalContent: { padding: 16, paddingBottom: 30 },
  modalAvatar: { alignItems: 'center', marginBottom: 20 },
  bigAvatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  modalName: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  modalRut: { fontSize: 14, color: Colors.textSecondary },
  card: { marginBottom: 14 },
  cardSectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  diagnosisBox: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  diagnosisLabel: { fontSize: 11, color: Colors.textSecondary, marginBottom: 2 },
  diagnosisText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  examRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  examName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  examDate: { fontSize: 12, color: Colors.textSecondary },
  apptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  apptDate: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
  locCard: {},
  locHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  locCoords: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12, lineHeight: 20 },
  mapBtn: {
    backgroundColor: Colors.doctorColor, borderRadius: 8,
    flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10,
  },
  mapBtnText: { color: Colors.surface, fontWeight: '600', fontSize: 14 },
});
