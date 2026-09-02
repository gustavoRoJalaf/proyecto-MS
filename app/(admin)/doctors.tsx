import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../../store/AppDataContext';
import { Doctor } from '../../store/appStore';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';

const STATUS_COLORS: Record<string, string> = {
  available: Colors.success,
  en_route: Colors.primary,
  visiting: Colors.warning,
  completed: Colors.textSecondary,
};

const EMPTY_FORM = { firstName: '', lastName: '', specialty: '', phone: '', email: '' };

export default function AdminDoctorsScreen() {
  const { doctors, patients, addDoctor, updateDoctor, deleteDoctor, assignPatient, unassignPatient } = useAppData();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Doctor | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Doctor | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = doctors.filter(d =>
    `${d.firstName} ${d.lastName} ${d.specialty}`.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setShowForm(true); };

  const openEdit = (d: Doctor) => {
    setEditTarget(d);
    setForm({ firstName: d.firstName, lastName: d.lastName, specialty: d.specialty, phone: d.phone, email: d.email });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      Alert.alert('Faltan datos', 'Nombre y apellido son obligatorios.');
      return;
    }
    if (editTarget) {
      updateDoctor(editTarget.id, form);
      if (selected?.id === editTarget.id) setSelected(d => d ? { ...d, ...form } : d);
    } else {
      addDoctor(form);
    }
    setShowForm(false);
  };

  const handleDelete = (d: Doctor) => {
    Alert.alert(
      'Eliminar médico',
      `¿Estás seguro de eliminar a ${d.firstName} ${d.lastName}? Sus pacientes quedarán sin asignar.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => { deleteDoctor(d.id); setSelected(null); } },
      ]
    );
  };

  const toggleAssign = (doctorId: string, patientId: string, isAssigned: boolean) => {
    if (isAssigned) unassignPatient(doctorId, patientId);
    else assignPatient(doctorId, patientId);
  };

  const DetailModal = () => {
    if (!selected) return null;
    const doc = doctors.find(d => d.id === selected.id) ?? selected;
    const assignedPatients = patients.filter(p => doc.assignedPatients.includes(p.id));
    const unassignedPatients = patients.filter(p => !doc.assignedPatients.includes(p.id));

    return (
      <Modal visible animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelected(null)} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Gestión de Médico</Text>
            <TouchableOpacity onPress={() => openEdit(doc)} style={styles.editBtn}>
              <Ionicons name="pencil" size={18} color={Colors.adminColor} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.detailContent}>
            <View style={styles.docHeader}>
              <View style={[styles.bigAvatar, { backgroundColor: STATUS_COLORS[doc.visitStatus] }]}>
                <Ionicons name="medkit" size={32} color={Colors.surface} />
              </View>
              <Text style={styles.docName}>{doc.firstName} {doc.lastName}</Text>
              <Text style={styles.docSpec}>{doc.specialty}</Text>
              <StatusBadge status={doc.visitStatus as any} />
            </View>

            <Card elevated style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={15} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{doc.phone || '—'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={15} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{doc.email || '—'}</Text>
              </View>
            </Card>

            <Text style={styles.sectionTitle}>Pacientes Asignados ({assignedPatients.length})</Text>
            {assignedPatients.length === 0
              ? <Text style={styles.emptyHint}>Sin pacientes asignados</Text>
              : assignedPatients.map(p => (
                <Card key={p.id} style={styles.patientCard}>
                  <View style={styles.patientRow}>
                    <View style={[styles.patAvatar, { backgroundColor: Colors.patientColor }]}>
                      <Ionicons name="person" size={16} color={Colors.surface} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.patName}>{p.firstName} {p.lastName}</Text>
                      <Text style={styles.patRut}>{p.rut}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => toggleAssign(doc.id, p.id, true)}
                      style={styles.unassignBtn}
                    >
                      <Ionicons name="close-circle" size={20} color={Colors.accent} />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}

            {unassignedPatients.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Agregar Pacientes</Text>
                {unassignedPatients.map(p => (
                  <Card key={p.id} style={[styles.patientCard, styles.unassignedCard]}>
                    <View style={styles.patientRow}>
                      <View style={[styles.patAvatar, { backgroundColor: Colors.textLight }]}>
                        <Ionicons name="person" size={16} color={Colors.surface} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.patName}>{p.firstName} {p.lastName}</Text>
                        <Text style={styles.patRut}>{p.rut}</Text>
                        <Text style={styles.patDiag} numberOfLines={1}>{p.diagnosis}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => toggleAssign(doc.id, p.id, false)}
                        style={styles.assignBtn}
                      >
                        <Ionicons name="add-circle" size={20} color={Colors.success} />
                        <Text style={styles.assignBtnText}>Asignar</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                ))}
              </>
            )}

            <TouchableOpacity onPress={() => handleDelete(doc)} style={styles.deleteBtn}>
              <Ionicons name="trash" size={16} color={Colors.accent} />
              <Text style={styles.deleteBtnText}>Eliminar médico</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={17} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar médico..."
            placeholderTextColor={Colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={17} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
          <Ionicons name="add" size={20} color={Colors.surface} />
          <Text style={styles.addBtnText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.countLabel}>{filtered.length} médico{filtered.length !== 1 ? 's' : ''} registrado{filtered.length !== 1 ? 's' : ''}</Text>

        {filtered.map(d => {
          const assignedCount = d.assignedPatients.length;
          return (
            <TouchableOpacity key={d.id} onPress={() => setSelected(d)} activeOpacity={0.8}>
              <Card elevated style={styles.card}>
                <View style={styles.docRow}>
                  <View style={[styles.avatar, { backgroundColor: STATUS_COLORS[d.visitStatus] }]}>
                    <Ionicons name="medkit" size={20} color={Colors.surface} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.docCardName}>{d.firstName} {d.lastName}</Text>
                    <Text style={styles.docCardSpec}>{d.specialty}</Text>
                  </View>
                  <View style={styles.cardRight}>
                    <StatusBadge status={d.visitStatus as any} small />
                    <Text style={styles.patCount}>{assignedCount} pac.</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textLight} style={{ marginLeft: 6 }} />
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <DetailModal />

      <Modal visible={showForm} animationType="slide" onRequestClose={() => setShowForm(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowForm(false)} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editTarget ? 'Editar Médico' : 'Nuevo Médico'}</Text>
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Guardar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.formContent}>
            {([
              { key: 'firstName', label: 'Nombre *', placeholder: 'Ej: Patricia' },
              { key: 'lastName', label: 'Apellido *', placeholder: 'Ej: Vidal Morales' },
              { key: 'specialty', label: 'Especialidad', placeholder: 'Ej: Medicina Interna' },
              { key: 'phone', label: 'Teléfono', placeholder: 'Ej: +56 9 1111 2222' },
              { key: 'email', label: 'Email', placeholder: 'Ej: doctor@clinica.cl', keyboard: 'email-address' },
            ] as any[]).map(f => (
              <View key={f.key} style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>{f.label}</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder={f.placeholder}
                  placeholderTextColor={Colors.textLight}
                  value={(form as any)[f.key]}
                  onChangeText={v => setForm(prev => ({ ...prev, [f.key]: v }))}
                  keyboardType={f.keyboard ?? 'default'}
                  autoCapitalize={f.key === 'email' ? 'none' : 'words'}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16, marginBottom: 0 },
  searchRow: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, height: 44,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.adminColor, borderRadius: 10, paddingHorizontal: 14, height: 44,
  },
  addBtnText: { color: Colors.surface, fontWeight: '700', fontSize: 14 },
  content: { padding: 16, paddingBottom: 30 },
  countLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  card: { marginBottom: 10 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  docCardName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  docCardSpec: { fontSize: 12, color: Colors.textSecondary },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  patCount: { fontSize: 11, color: Colors.textSecondary },
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 50,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4, marginRight: 8 },
  modalTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  editBtn: { padding: 8, backgroundColor: Colors.adminColor + '15', borderRadius: 8 },
  saveBtn: { backgroundColor: Colors.adminColor, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  saveBtnText: { color: Colors.surface, fontWeight: '700', fontSize: 14 },
  detailContent: { padding: 16, paddingBottom: 40 },
  docHeader: { alignItems: 'center', marginBottom: 20, gap: 6 },
  bigAvatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  docName: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  docSpec: { fontSize: 14, color: Colors.textSecondary },
  infoCard: { marginBottom: 16, gap: 8 },
  infoRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  infoText: { fontSize: 14, color: Colors.textPrimary },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 4 },
  emptyHint: { fontSize: 12, color: Colors.textLight, marginBottom: 8 },
  patientCard: { marginBottom: 8 },
  unassignedCard: { opacity: 0.75, borderStyle: 'dashed' },
  patientRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  patAvatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  patName: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  patRut: { fontSize: 11, color: Colors.textSecondary },
  patDiag: { fontSize: 11, color: Colors.doctorColor },
  unassignBtn: { padding: 4 },
  assignBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.success + '15', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  assignBtnText: { fontSize: 12, color: Colors.success, fontWeight: '600' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: Colors.accent + '40', backgroundColor: Colors.accent + '08' },
  deleteBtnText: { color: Colors.accent, fontWeight: '600', fontSize: 14 },
  formContent: { padding: 16, paddingBottom: 40 },
  fieldGroup: { marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6 },
  fieldInput: {
    backgroundColor: Colors.surface, borderRadius: 10, borderWidth: 1,
    borderColor: Colors.border, paddingHorizontal: 14, height: 46,
    fontSize: 15, color: Colors.textPrimary,
  },
});
