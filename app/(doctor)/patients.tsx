import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../store/AuthContext';
import { useAppData } from '../../store/AppDataContext';
import { MOCK_APPOINTMENTS, MOCK_EXAMS, Patient } from '../../store/appStore';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import InfoRow from '../../components/InfoRow';

export default function PatientsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { patients, doctors, notes, addNote } = useAppData();

  const doctor = doctors.find(d => d.id === user?.id)!;
  const myPatients = patients.filter(p => doctor?.assignedPatients.includes(p.id));

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Patient | null>(null);
  const [noteText, setNoteText] = useState('');
  const [attachment, setAttachment] = useState<{ name: string; uri: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'notes'>('info');

  const filtered = myPatients.filter(p =>
    `${p.firstName} ${p.lastName} ${p.rut} ${p.diagnosis}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (!result.canceled && result.assets?.[0]) {
        setAttachment({ name: result.assets[0].name, uri: result.assets[0].uri });
      }
    } catch {
      Alert.alert('Error', 'No se pudo seleccionar el archivo.');
    }
  };

  const handleAddNote = () => {
    if (!noteText.trim()) { Alert.alert('Escribe una nota', 'La anotación no puede estar vacía.'); return; }
    if (!selected || !doctor) return;
    addNote({
      patientId: selected.id,
      doctorId: doctor.id,
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      text: noteText.trim(),
      date: new Date().toLocaleDateString('es-CL'),
      attachmentName: attachment?.name,
      attachmentUri: attachment?.uri,
    });
    setNoteText('');
    setAttachment(null);
  };

  const PatientModal = () => {
    if (!selected) return null;
    const patientExams = MOCK_EXAMS.filter(e => e.patientId === selected.id);
    const patientAppts = MOCK_APPOINTMENTS.filter(a => a.patientId === selected.id);
    const patientNotes = notes.filter(n => n.patientId === selected.id).reverse();

    return (
      <Modal visible animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle} numberOfLines={1}>{selected.firstName} {selected.lastName}</Text>
            <TouchableOpacity onPress={() => { setSelected(null); router.push('/(doctor)/map'); }} style={styles.navBtn}>
              <Ionicons name="navigate" size={20} color={Colors.doctorColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabRow}>
            {(['info', 'notes'] as const).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Ionicons
                  name={tab === 'info' ? 'person' : 'document-text'}
                  size={15}
                  color={activeTab === tab ? Colors.doctorColor : Colors.textSecondary}
                />
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab === 'info' ? 'Ficha' : `Anotaciones (${patientNotes.length})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {activeTab === 'info' && (
              <>
                <View style={styles.modalAvatar}>
                  <View style={[styles.bigAvatar, { backgroundColor: Colors.patientColor }]}>
                    <Ionicons name="person" size={36} color={Colors.surface} />
                  </View>
                  <Text style={styles.modalName}>{selected.firstName} {selected.lastName}</Text>
                  <Text style={styles.modalRut}>{selected.rut}</Text>
                </View>

                <Card elevated style={styles.card}>
                  <Text style={styles.cardTitle}>Información Personal</Text>
                  <InfoRow icon="call-outline" label="Teléfono" value={selected.phone} />
                  <InfoRow icon="mail-outline" label="Email" value={selected.email} />
                  <InfoRow icon="location-outline" label="Dirección" value={selected.address} iconColor={Colors.accent} />
                </Card>

                <Card elevated style={styles.card}>
                  <Text style={styles.cardTitle}>Diagnóstico</Text>
                  <View style={styles.diagBox}>
                    <Ionicons name="medical" size={16} color={Colors.doctorColor} />
                    <Text style={styles.diagText}>{selected.diagnosis}</Text>
                  </View>
                </Card>

                <Card elevated style={styles.card}>
                  <Text style={styles.cardTitle}>Exámenes ({patientExams.length})</Text>
                  {patientExams.map(e => (
                    <View key={e.id} style={styles.listRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.listItemTitle}>{e.name}</Text>
                        <Text style={styles.listSub}>{e.date}</Text>
                      </View>
                      <StatusBadge status={e.status} small />
                    </View>
                  ))}
                </Card>

                <Card elevated style={styles.card}>
                  <Text style={styles.cardTitle}>Citas ({patientAppts.length})</Text>
                  {patientAppts.map(a => (
                    <View key={a.id} style={styles.listRow}>
                      <Text style={styles.listItemTitle}>{a.date} {a.time}</Text>
                      <StatusBadge status={a.status} small />
                    </View>
                  ))}
                </Card>
              </>
            )}

            {activeTab === 'notes' && (
              <>
                <Card elevated style={styles.card}>
                  <Text style={styles.cardTitle}>Nueva Anotación Clínica</Text>
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Escribe tu anotación clínica aquí..."
                    placeholderTextColor={Colors.textLight}
                    value={noteText}
                    onChangeText={setNoteText}
                    multiline
                    numberOfLines={4}
                  />
                  {attachment && (
                    <View style={styles.attachRow}>
                      <Ionicons name="document-attach" size={15} color={Colors.primary} />
                      <Text style={styles.attachName} numberOfLines={1}>{attachment.name}</Text>
                      <TouchableOpacity onPress={() => setAttachment(null)}>
                        <Ionicons name="close-circle" size={16} color={Colors.textLight} />
                      </TouchableOpacity>
                    </View>
                  )}
                  <View style={styles.noteActions}>
                    <TouchableOpacity style={styles.attachBtn} onPress={pickFile}>
                      <Ionicons name="attach" size={16} color={Colors.primary} />
                      <Text style={styles.attachBtnText}>Adjuntar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveNoteBtn} onPress={handleAddNote}>
                      <Ionicons name="checkmark" size={16} color={Colors.surface} />
                      <Text style={styles.saveNoteBtnText}>Guardar Nota</Text>
                    </TouchableOpacity>
                  </View>
                </Card>

                {patientNotes.length === 0 ? (
                  <View style={styles.emptyNotes}>
                    <Ionicons name="document-text-outline" size={40} color={Colors.textLight} />
                    <Text style={styles.emptyNotesText}>Sin anotaciones registradas</Text>
                  </View>
                ) : patientNotes.map(note => (
                  <Card key={note.id} style={styles.noteCard}>
                    <View style={styles.noteHeader}>
                      <View style={[styles.noteAvatar, { backgroundColor: Colors.doctorColor }]}>
                        <Ionicons name="medkit" size={14} color={Colors.surface} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.noteDoctorName}>{note.doctorName}</Text>
                        <Text style={styles.noteDate}>{note.date}</Text>
                      </View>
                    </View>
                    <Text style={styles.noteText}>{note.text}</Text>
                    {note.attachmentName && (
                      <View style={styles.attachRow}>
                        <Ionicons name="document-attach" size={13} color={Colors.primary} />
                        <Text style={styles.attachName}>{note.attachmentName}</Text>
                      </View>
                    )}
                  </Card>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} />
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
        {filtered.map(patient => {
          const noteCount = notes.filter(n => n.patientId === patient.id).length;
          return (
            <TouchableOpacity key={patient.id} onPress={() => { setSelected(patient); setActiveTab('info'); }} activeOpacity={0.8}>
              <Card elevated style={styles.patientCard}>
                <View style={styles.patientRow}>
                  <View style={[styles.avatar, { backgroundColor: Colors.patientColor }]}>
                    <Ionicons name="person" size={22} color={Colors.surface} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.patientName}>{patient.firstName} {patient.lastName}</Text>
                    <Text style={styles.patientRut}>{patient.rut}</Text>
                  </View>
                  {noteCount > 0 && (
                    <View style={styles.noteBadge}>
                      <Ionicons name="document-text" size={11} color={Colors.doctorColor} />
                      <Text style={styles.noteBadgeText}>{noteCount}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
                </View>
                <View style={styles.diagRow}>
                  <Ionicons name="medical-outline" size={13} color={Colors.doctorColor} />
                  <Text style={styles.diagText} numberOfLines={2}>{patient.diagnosis}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
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
    borderRadius: 10, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, height: 46,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  content: { padding: 16, paddingBottom: 30 },
  countLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  patientCard: { marginBottom: 12 },
  patientRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  patientName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  patientRut: { fontSize: 12, color: Colors.textSecondary },
  noteBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.doctorColor + '15', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 },
  noteBadgeText: { fontSize: 11, color: Colors.doctorColor, fontWeight: '700' },
  diagRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  diagText: { flex: 1, fontSize: 13, color: Colors.doctorColor, fontWeight: '500' },
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 50,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4, marginRight: 8 },
  modalTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  navBtn: { padding: 8, backgroundColor: Colors.doctorColor + '15', borderRadius: 8 },
  tabRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.doctorColor },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.doctorColor },
  modalContent: { padding: 16, paddingBottom: 30 },
  modalAvatar: { alignItems: 'center', marginBottom: 16 },
  bigAvatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  modalName: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  modalRut: { fontSize: 14, color: Colors.textSecondary },
  card: { marginBottom: 14 },
  cardTitle: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  diagBox: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  diagText: { flex: 1, fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  listItemTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  listSub: { fontSize: 11, color: Colors.textSecondary },
  noteInput: {
    backgroundColor: Colors.background, borderRadius: 10, borderWidth: 1,
    borderColor: Colors.border, padding: 12, fontSize: 14, color: Colors.textPrimary,
    minHeight: 90, textAlignVertical: 'top', marginBottom: 10,
  },
  attachRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  attachName: { flex: 1, fontSize: 12, color: Colors.primary },
  noteActions: { flexDirection: 'row', gap: 10 },
  attachBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: 8, paddingVertical: 10, borderWidth: 1,
    borderColor: Colors.primary + '50', backgroundColor: Colors.primary + '08',
  },
  attachBtnText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  saveNoteBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: 8, paddingVertical: 10, backgroundColor: Colors.doctorColor,
  },
  saveNoteBtnText: { fontSize: 13, color: Colors.surface, fontWeight: '700' },
  emptyNotes: { alignItems: 'center', gap: 10, padding: 40 },
  emptyNotesText: { fontSize: 14, color: Colors.textLight },
  noteCard: { marginBottom: 10, borderColor: Colors.doctorColor + '30', borderWidth: 1 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  noteAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  noteDoctorName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  noteDate: { fontSize: 11, color: Colors.textSecondary },
  noteText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 20 },
});
