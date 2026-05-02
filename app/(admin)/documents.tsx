import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_PATIENTS } from '../../store/appStore';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';

interface MedicalDoc {
  id: string;
  patientId: string;
  patientName: string;
  type: 'orden' | 'resultado' | 'receta' | 'informe';
  fileName: string;
  uploadedAt: string;
  status: 'pending' | 'reviewed' | 'processed';
  notes?: string;
}

const INITIAL_DOCS: MedicalDoc[] = [
  {
    id: 'doc1', patientId: 'p1', patientName: 'Carlos Mendoza García',
    type: 'orden', fileName: 'orden_medica_mayo.pdf',
    uploadedAt: '2026-05-01 09:15', status: 'pending',
  },
  {
    id: 'doc2', patientId: 'p2', patientName: 'María López Fernández',
    type: 'resultado', fileName: 'eco_cardiograma_resultado.pdf',
    uploadedAt: '2026-04-28 14:30', status: 'reviewed',
    notes: 'FEVI 50% — revisado por Dr. Vidal',
  },
  {
    id: 'doc3', patientId: 'p1', patientName: 'Carlos Mendoza García',
    type: 'receta', fileName: 'receta_metformina.pdf',
    uploadedAt: '2026-04-20 11:00', status: 'processed',
  },
  {
    id: 'doc4', patientId: 'p3', patientName: 'Juan Pérez Silva',
    type: 'informe', fileName: 'informe_reumatologia.pdf',
    uploadedAt: '2026-05-02 08:45', status: 'pending',
  },
];

const DOC_TYPES = { orden: 'Orden Médica', resultado: 'Resultado', receta: 'Receta', informe: 'Informe' };
const DOC_COLORS = { orden: Colors.primary, resultado: Colors.success, receta: Colors.secondary, informe: Colors.warning };
const STATUS_COLORS = { pending: Colors.warning, reviewed: Colors.primary, processed: Colors.success };
const STATUS_LABELS = { pending: 'Pendiente', reviewed: 'Revisado', processed: 'Procesado' };

type DocFilter = 'all' | 'pending' | 'reviewed' | 'processed';

export default function AdminDocumentsScreen() {
  const [docs, setDocs] = useState<MedicalDoc[]>(INITIAL_DOCS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<DocFilter>('all');
  const [notes, setNotes] = useState<Record<string, string>>({});

  const filtered = docs.filter(d => {
    const matchSearch = `${d.patientName} ${d.fileName} ${DOC_TYPES[d.type]}`
      .toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || d.status === filter;
    return matchSearch && matchFilter;
  });

  const updateStatus = (id: string, status: MedicalDoc['status']) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, status, notes: notes[id] || d.notes } : d));
    Alert.alert('Estado actualizado', `Documento marcado como "${STATUS_LABELS[status]}"`);
  };

  const DOC_FILTERS: { key: DocFilter; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'pending', label: 'Pendientes' },
    { key: 'reviewed', label: 'Revisados' },
    { key: 'processed', label: 'Procesados' },
  ];

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar documentos..."
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

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {DOC_FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.countLabel}>{filtered.length} documento{filtered.length !== 1 ? 's' : ''}</Text>

        {filtered.map(doc => {
          const typeColor = DOC_COLORS[doc.type];
          const statusColor = STATUS_COLORS[doc.status];

          return (
            <Card elevated key={doc.id} style={styles.card}>
              {/* Doc Header */}
              <View style={styles.docHeader}>
                <View style={[styles.docIconBox, { backgroundColor: typeColor + '15' }]}>
                  <Ionicons name="document-text" size={22} color={typeColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docFileName} numberOfLines={1}>{doc.fileName}</Text>
                  <Text style={[styles.docType, { color: typeColor }]}>{DOC_TYPES[doc.type]}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>{STATUS_LABELS[doc.status]}</Text>
                </View>
              </View>

              {/* Patient Info */}
              <View style={styles.patRow}>
                <Ionicons name="person-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.patName}>{doc.patientName}</Text>
              </View>
              <View style={styles.patRow}>
                <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.uploadedAt}>{doc.uploadedAt}</Text>
              </View>

              {/* Existing Notes */}
              {doc.notes && (
                <View style={styles.existingNotes}>
                  <Ionicons name="chatbubble-ellipses-outline" size={13} color={Colors.primary} />
                  <Text style={styles.existingNotesText}>{doc.notes}</Text>
                </View>
              )}

              {/* Notes Input */}
              {doc.status === 'pending' && (
                <TextInput
                  style={styles.notesInput}
                  placeholder="Agregar notas de revisión..."
                  placeholderTextColor={Colors.textLight}
                  value={notes[doc.id] ?? ''}
                  onChangeText={t => setNotes(prev => ({ ...prev, [doc.id]: t }))}
                  multiline
                />
              )}

              {/* Action Buttons */}
              {doc.status === 'pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
                    onPress={() => updateStatus(doc.id, 'reviewed')}
                  >
                    <Ionicons name="eye" size={14} color={Colors.surface} />
                    <Text style={styles.actionBtnText}>Marcar Revisado</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.success }]}
                    onPress={() => updateStatus(doc.id, 'processed')}
                  >
                    <Ionicons name="checkmark-circle" size={14} color={Colors.surface} />
                    <Text style={styles.actionBtnText}>Procesar</Text>
                  </TouchableOpacity>
                </View>
              )}
              {doc.status === 'reviewed' && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: Colors.success, marginTop: 10 }]}
                  onPress={() => updateStatus(doc.id, 'processed')}
                >
                  <Ionicons name="checkmark-circle" size={14} color={Colors.surface} />
                  <Text style={styles.actionBtnText}>Marcar como Procesado</Text>
                </TouchableOpacity>
              )}
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="folder-open-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>No hay documentos en esta categoría</Text>
          </View>
        )}
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
  filterScroll: { marginTop: 12 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.adminColor, borderColor: Colors.adminColor },
  filterText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  filterTextActive: { color: Colors.surface },
  content: { padding: 16, paddingBottom: 30 },
  countLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  card: { marginBottom: 14 },
  docHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  docIconBox: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  docFileName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  docType: { fontSize: 12, fontWeight: '600', marginTop: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700' },
  patRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 3 },
  patName: { fontSize: 13, color: Colors.textPrimary, fontWeight: '500' },
  uploadedAt: { fontSize: 12, color: Colors.textSecondary },
  existingNotes: {
    flexDirection: 'row', gap: 6, alignItems: 'flex-start',
    backgroundColor: Colors.primary + '08', borderRadius: 8,
    padding: 8, marginTop: 8,
  },
  existingNotesText: { flex: 1, fontSize: 12, color: Colors.primary },
  notesInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    padding: 10, fontSize: 13, color: Colors.textPrimary,
    marginTop: 10, minHeight: 60, textAlignVertical: 'top',
  },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderRadius: 8, paddingVertical: 9,
  },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: Colors.surface },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textSecondary },
});
