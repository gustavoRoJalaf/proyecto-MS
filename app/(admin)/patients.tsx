import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_PATIENTS, MOCK_DOCTORS, MOCK_APPOINTMENTS, MOCK_EXAMS } from '../../store/appStore';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import InfoRow from '../../components/InfoRow';

export default function AdminPatientsScreen() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = MOCK_PATIENTS.filter(p =>
    `${p.firstName} ${p.lastName} ${p.rut} ${p.diagnosis}`
      .toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar paciente..."
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
        <Text style={styles.countLabel}>{filtered.length} paciente{filtered.length !== 1 ? 's' : ''} registrado{filtered.length !== 1 ? 's' : ''}</Text>

        {filtered.map(patient => {
          const assignedDoctor = MOCK_DOCTORS.find(d => d.id === patient.assignedDoctorId);
          const patientExams = MOCK_EXAMS.filter(e => e.patientId === patient.id);
          const patientAppts = MOCK_APPOINTMENTS.filter(a => a.patientId === patient.id);
          const isOpen = expanded === patient.id;

          return (
            <Card elevated key={patient.id} style={styles.card}>
              {/* Header Row */}
              <TouchableOpacity onPress={() => setExpanded(isOpen ? null : patient.id)} activeOpacity={0.8}>
                <View style={styles.patientHeader}>
                  <View style={[styles.avatar, { backgroundColor: Colors.patientColor }]}>
                    <Ionicons name="person" size={20} color={Colors.surface} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.patientName}>{patient.firstName} {patient.lastName}</Text>
                    <Text style={styles.patientRut}>{patient.rut}</Text>
                  </View>
                  <View style={styles.headerRight}>
                    <View style={styles.countBadges}>
                      <View style={styles.countBadge}>
                        <Text style={styles.countBadgeNum}>{patientExams.length}</Text>
                        <Text style={styles.countBadgeLabel}>Ex.</Text>
                      </View>
                      <View style={[styles.countBadge, { backgroundColor: Colors.primary + '15' }]}>
                        <Text style={[styles.countBadgeNum, { color: Colors.primary }]}>{patientAppts.length}</Text>
                        <Text style={styles.countBadgeLabel}>Citas</Text>
                      </View>
                    </View>
                    <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textLight} />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Diagnosis snippet */}
              <View style={styles.diagRow}>
                <Ionicons name="medical-outline" size={13} color={Colors.doctorColor} />
                <Text style={styles.diagText} numberOfLines={isOpen ? undefined : 1}>{patient.diagnosis}</Text>
              </View>

              {/* Expanded Detail */}
              {isOpen && (
                <View style={styles.detail}>
                  <View style={styles.divider} />
                  <InfoRow icon="call-outline" label="Teléfono" value={patient.phone} />
                  <InfoRow icon="mail-outline" label="Email" value={patient.email} />
                  <InfoRow icon="location-outline" label="Dirección" value={patient.address} iconColor={Colors.accent} />

                  {assignedDoctor && (
                    <View style={styles.docAssigned}>
                      <Ionicons name="medkit-outline" size={14} color={Colors.doctorColor} />
                      <Text style={styles.docAssignedLabel}>Médico Asignado: </Text>
                      <Text style={styles.docAssignedName}>{assignedDoctor.firstName} {assignedDoctor.lastName}</Text>
                    </View>
                  )}

                  <Text style={styles.subSectionTitle}>Exámenes</Text>
                  {patientExams.map(e => (
                    <View key={e.id} style={styles.examRow}>
                      <Text style={styles.examName}>{e.name}</Text>
                      <StatusBadge status={e.status} small />
                    </View>
                  ))}

                  <Text style={styles.subSectionTitle}>Citas</Text>
                  {patientAppts.map(a => (
                    <View key={a.id} style={styles.apptRow}>
                      <Text style={styles.apptInfo}>{a.date} {a.time}</Text>
                      <StatusBadge status={a.status} small />
                    </View>
                  ))}

                  <View style={styles.coordRow}>
                    <Ionicons name="globe-outline" size={13} color={Colors.textSecondary} />
                    <Text style={styles.coordText}>
                      GPS: {patient.location.latitude.toFixed(5)}, {patient.location.longitude.toFixed(5)}
                    </Text>
                  </View>
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>
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
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  content: { padding: 16, paddingBottom: 30 },
  countLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  card: { marginBottom: 12 },
  patientHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  patientName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  patientRut: { fontSize: 12, color: Colors.textSecondary },
  headerRight: { alignItems: 'flex-end', gap: 6 },
  countBadges: { flexDirection: 'row', gap: 6 },
  countBadge: {
    backgroundColor: Colors.patientColor + '15', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4, alignItems: 'center',
  },
  countBadgeNum: { fontSize: 14, fontWeight: '800', color: Colors.patientColor },
  countBadgeLabel: { fontSize: 9, color: Colors.textSecondary },
  diagRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  diagText: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  detail: { marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  docAssigned: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  docAssignedLabel: { fontSize: 13, color: Colors.textSecondary },
  docAssignedName: { fontSize: 13, color: Colors.doctorColor, fontWeight: '600' },
  subSectionTitle: {
    fontSize: 11, fontWeight: '700', color: Colors.textSecondary,
    textTransform: 'uppercase', marginBottom: 6, marginTop: 4,
  },
  examRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  examName: { fontSize: 13, color: Colors.textPrimary },
  apptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  apptInfo: { fontSize: 13, color: Colors.textPrimary },
  coordRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  coordText: { fontSize: 12, color: Colors.textSecondary },
});
