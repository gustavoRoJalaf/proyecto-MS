import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppData } from '../../store/AppDataContext';
import { Patient } from '../../store/appStore';
import { Colors } from '../../constants/colors';
import Card from '../../components/Card';
import StatusBadge from '../../components/StatusBadge';
import InfoRow from '../../components/InfoRow';

const EMPTY_FORM = {
  firstName: '', lastName: '', rut: '', diagnosis: '',
  address: '', phone: '', email: '',
};

export default function AdminPatientsScreen() {
  const { patients, doctors, appointments, exams, addPatient, updatePatient, deletePatient } = useAppData();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Patient | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = patients.filter(p =>
    `${p.firstName} ${p.lastName} ${p.rut} ${p.diagnosis}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (p: Patient) => {
    setEditTarget(p);
    setForm({
      firstName: p.firstName, lastName: p.lastName, rut: p.rut,
      diagnosis: p.diagnosis, address: p.address, phone: p.phone, email: p.email,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.rut.trim()) {
      Alert.alert('Faltan datos', 'Nombre, apellido y RUT son obligatorios.');
      return;
    }
    if (editTarget) {
      updatePatient(editTarget.id, form);
    } else {
      addPatient({
        ...form,
        location: { latitude: -33.44 + (Math.random() - 0.5) * 0.1, longitude: -70.6 + (Math.random() - 0.5) * 0.1 },
      });
    }
    setShowForm(false);
  };

  const handleDelete = (p: Patient) => {
    Alert.alert(
      'Eliminar paciente',
      `¿Estás seguro de eliminar a ${p.firstName} ${p.lastName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deletePatient(p.id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={17} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, RUT o diagnóstico..."
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
        <Text style={styles.countLabel}>{filtered.length} paciente{filtered.length !== 1 ? 's' : ''} registrado{filtered.length !== 1 ? 's' : ''}</Text>

        {filtered.map(patient => {
          const assignedDoctor = doctors.find(d => d.id === patient.assignedDoctorId);
          const patientExams = exams.filter(e => e.patientId === patient.id);
          const patientAppts = appointments.filter(a => a.patientId === patient.id);
          const isOpen = expanded === patient.id;

          return (
            <Card elevated key={patient.id} style={styles.card}>
              <TouchableOpacity onPress={() => setExpanded(isOpen ? null : patient.id)} activeOpacity={0.8}>
                <View style={styles.patientHeader}>
                  <View style={[styles.avatar, { backgroundColor: Colors.patientColor }]}>
                    <Ionicons name="person" size={20} color={Colors.surface} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.patientName}>{patient.firstName} {patient.lastName}</Text>
                    <Text style={styles.patientRut}>{patient.rut}</Text>
                  </View>
                  <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => openEdit(patient)} style={styles.iconBtn}>
                      <Ionicons name="pencil" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(patient)} style={styles.iconBtn}>
                      <Ionicons name="trash" size={16} color={Colors.accent} />
                    </TouchableOpacity>
                    <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textLight} />
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.diagRow}>
                <Ionicons name="medical-outline" size={13} color={Colors.doctorColor} />
                <Text style={styles.diagText} numberOfLines={isOpen ? undefined : 1}>{patient.diagnosis || '—'}</Text>
              </View>

              {isOpen && (
                <View style={styles.detail}>
                  <View style={styles.divider} />
                  <InfoRow icon="call-outline" label="Teléfono" value={patient.phone} />
                  <InfoRow icon="mail-outline" label="Email" value={patient.email} />
                  <InfoRow icon="location-outline" label="Dirección" value={patient.address} iconColor={Colors.accent} />

                  {assignedDoctor ? (
                    <View style={styles.docRow}>
                      <Ionicons name="medkit-outline" size={14} color={Colors.doctorColor} />
                      <Text style={styles.docLabel}>Médico: </Text>
                      <Text style={styles.docName}>{assignedDoctor.firstName} {assignedDoctor.lastName}</Text>
                    </View>
                  ) : (
                    <View style={styles.docRow}>
                      <Ionicons name="alert-circle-outline" size={14} color={Colors.warning} />
                      <Text style={[styles.docLabel, { color: Colors.warning }]}>Sin médico asignado</Text>
                    </View>
                  )}

                  <Text style={styles.subTitle}>Exámenes</Text>
                  {patientExams.length === 0
                    ? <Text style={styles.emptyHint}>Sin exámenes registrados</Text>
                    : patientExams.map(e => (
                      <View key={e.id} style={styles.listRow}>
                        <Text style={styles.listText}>{e.name}</Text>
                        <StatusBadge status={e.status} small />
                      </View>
                    ))}

                  <Text style={styles.subTitle}>Citas</Text>
                  {patientAppts.length === 0
                    ? <Text style={styles.emptyHint}>Sin citas registradas</Text>
                    : patientAppts.map(a => (
                      <View key={a.id} style={styles.listRow}>
                        <Text style={styles.listText}>{a.date} {a.time}</Text>
                        <StatusBadge status={a.status} small />
                      </View>
                    ))}
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>

      <Modal visible={showForm} animationType="slide" onRequestClose={() => setShowForm(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowForm(false)} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editTarget ? 'Editar Paciente' : 'Nuevo Paciente'}</Text>
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.formContent}>
            <Text style={styles.formSection}>Datos Personales</Text>
            {([
              { key: 'firstName', label: 'Nombre *', placeholder: 'Ej: María' },
              { key: 'lastName', label: 'Apellido *', placeholder: 'Ej: González López' },
              { key: 'rut', label: 'RUT *', placeholder: 'Ej: 12.345.678-9' },
              { key: 'phone', label: 'Teléfono', placeholder: 'Ej: +56 9 1234 5678' },
              { key: 'email', label: 'Email', placeholder: 'Ej: paciente@email.com', keyboard: 'email-address' },
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

            <Text style={styles.formSection}>Información Clínica</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Diagnóstico</Text>
              <TextInput
                style={[styles.fieldInput, styles.textArea]}
                placeholder="Descripción del diagnóstico..."
                placeholderTextColor={Colors.textLight}
                value={form.diagnosis}
                onChangeText={v => setForm(prev => ({ ...prev, diagnosis: v }))}
                multiline
                numberOfLines={3}
              />
            </View>

            <Text style={styles.formSection}>Domicilio</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Dirección</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Ej: Av. Las Condes 1234, Santiago"
                placeholderTextColor={Colors.textLight}
                value={form.address}
                onChangeText={v => setForm(prev => ({ ...prev, address: v }))}
              />
            </View>
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
    backgroundColor: Colors.adminColor, borderRadius: 10,
    paddingHorizontal: 14, height: 44,
  },
  addBtnText: { color: Colors.surface, fontWeight: '700', fontSize: 14 },
  content: { padding: 16, paddingBottom: 30 },
  countLabel: { fontSize: 13, color: Colors.textSecondary, marginBottom: 12 },
  card: { marginBottom: 12 },
  patientHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  patientName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  patientRut: { fontSize: 12, color: Colors.textSecondary },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: { padding: 6, borderRadius: 6 },
  diagRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  diagText: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  detail: { marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 12 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  docLabel: { fontSize: 13, color: Colors.textSecondary },
  docName: { fontSize: 13, color: Colors.doctorColor, fontWeight: '600' },
  subTitle: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', marginBottom: 6, marginTop: 8 },
  emptyHint: { fontSize: 12, color: Colors.textLight, marginBottom: 4 },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  listText: { fontSize: 13, color: Colors.textPrimary },
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 50,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4, marginRight: 8 },
  modalTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  saveBtn: { backgroundColor: Colors.adminColor, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  saveBtnText: { color: Colors.surface, fontWeight: '700', fontSize: 14 },
  formContent: { padding: 16, paddingBottom: 40 },
  formSection: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 16, marginBottom: 10 },
  fieldGroup: { marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6 },
  fieldInput: {
    backgroundColor: Colors.surface, borderRadius: 10, borderWidth: 1,
    borderColor: Colors.border, paddingHorizontal: 14, height: 46,
    fontSize: 15, color: Colors.textPrimary,
  },
  textArea: { height: 90, paddingTop: 12, textAlignVertical: 'top' },
});
