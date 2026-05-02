import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { MOCK_EXAMS } from '../../store/appStore';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';

type Filter = 'all' | 'pending' | 'completed' | 'reviewed';

export default function ExamsScreen() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>('all');

  const myExams = MOCK_EXAMS.filter(e => e.patientId === user?.id);
  const filtered = filter === 'all' ? myExams : myExams.filter(e => e.status === filter);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'pending', label: 'Pendientes' },
    { key: 'completed', label: 'Completados' },
    { key: 'reviewed', label: 'Revisados' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Mis Exámenes Médicos</Text>
      <Text style={styles.pageSubtitle}>{myExams.length} exámenes registrados</Text>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtered.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="flask-outline" size={48} color={Colors.textLight} />
          <Text style={styles.emptyText}>No hay exámenes en esta categoría</Text>
        </View>
      )}

      {filtered.map(exam => (
        <Card elevated key={exam.id} style={styles.card}>
          <View style={styles.examHeader}>
            <View style={[styles.examIcon, { backgroundColor: exam.status === 'pending' ? Colors.warning + '20' : Colors.success + '20' }]}>
              <Ionicons
                name={exam.status === 'pending' ? 'time' : 'checkmark-circle'}
                size={24}
                color={exam.status === 'pending' ? Colors.warning : Colors.success}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.examName}>{exam.name}</Text>
              <Text style={styles.examDate}>
                <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
                {'  '}{exam.date}
              </Text>
            </View>
            <StatusBadge status={exam.status} small />
          </View>

          {exam.result && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Resultado</Text>
              <Text style={styles.resultText}>{exam.result}</Text>
            </View>
          )}

          {exam.doctorNotes && (
            <View style={styles.notesBox}>
              <View style={styles.notesHeader}>
                <Ionicons name="medkit-outline" size={14} color={Colors.primary} />
                <Text style={styles.notesLabel}>Notas del médico</Text>
              </View>
              <Text style={styles.notesText}>{exam.doctorNotes}</Text>
            </View>
          )}

          {exam.status === 'pending' && (
            <View style={styles.pendingInfo}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.warning} />
              <Text style={styles.pendingText}>Resultado pendiente de carga</Text>
            </View>
          )}
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 30 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  pageSubtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16 },
  filterScroll: { marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: Colors.patientColor, borderColor: Colors.patientColor },
  filterText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  filterTextActive: { color: Colors.surface },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textSecondary },
  card: { marginBottom: 14 },
  examHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  examIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  examName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  examDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  resultBox: {
    backgroundColor: Colors.background,
    borderRadius: 8, padding: 10, marginBottom: 8,
  },
  resultLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, marginBottom: 4 },
  resultText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  notesBox: {
    borderLeftWidth: 3, borderLeftColor: Colors.primary,
    paddingLeft: 10, marginBottom: 4,
  },
  notesHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  notesLabel: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  notesText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  pendingInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  pendingText: { fontSize: 12, color: Colors.warning },
});
