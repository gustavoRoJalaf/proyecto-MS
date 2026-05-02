import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, TextInput, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../store/AuthContext';
import { UserRole } from '../../store/appStore';
import { Colors } from '../../constants/colors';

const CREDENTIALS: Record<UserRole, { email: string; password: string }> = {
  patient: { email: 'paciente@demo.cl', password: '1234' },
  doctor: { email: 'medico@demo.cl', password: '1234' },
  admin: { email: 'admin@demo.cl', password: '1234' },
};

const ROLE_CONFIG = [
  { role: 'patient' as UserRole, label: 'Paciente', icon: 'person', color: Colors.patientColor, desc: 'Ver mis exámenes y citas' },
  { role: 'doctor' as UserRole, label: 'Médico', icon: 'medkit', color: Colors.doctorColor, desc: 'Gestionar pacientes asignados' },
  { role: 'admin' as UserRole, label: 'Administrador', icon: 'shield-checkmark', color: Colors.adminColor, desc: 'Panel de control general' },
];

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [email, setEmail] = useState(CREDENTIALS.patient.email);
  const [password, setPassword] = useState('1234');
  const [showPass, setShowPass] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(CREDENTIALS[role].email);
  };

  const handleLogin = () => {
    const creds = CREDENTIALS[selectedRole];
    if (email === creds.email && password === creds.password) {
      login(selectedRole);
    } else {
      Alert.alert('Error', 'Credenciales incorrectas. Use las credenciales de demo.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="medical" size={40} color={Colors.surface} />
          </View>
          <Text style={styles.title}>MedTrack MS</Text>
          <Text style={styles.subtitle}>Sistema de Gestión Médica Domiciliaria</Text>
        </View>

        {/* Role Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ingresar como</Text>
          <View style={styles.roleRow}>
            {ROLE_CONFIG.map(({ role, label, icon, color, desc }) => {
              const active = selectedRole === role;
              return (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleCard, active && { borderColor: color, backgroundColor: color + '10' }]}
                  onPress={() => handleRoleSelect(role)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.roleIcon, { backgroundColor: active ? color : Colors.border }]}>
                    <Ionicons name={icon as any} size={22} color={Colors.surface} />
                  </View>
                  <Text style={[styles.roleLabel, active && { color }]}>{label}</Text>
                  <Text style={styles.roleDesc}>{desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Credentials */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Credenciales</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Correo electrónico"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.textLight}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Contraseña"
              secureTextEntry={!showPass}
              placeholderTextColor={Colors.textLight}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Demo Hint */}
        <View style={styles.demoHint}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.demoText}>  Demo: email predefinido / contraseña 1234</Text>
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.85}>
          <Text style={styles.loginBtnText}>Ingresar al Sistema</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.surface} />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.background,
    padding: 24,
    paddingTop: 60,
  },
  header: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  roleRow: { flexDirection: 'row', gap: 10 },
  roleCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: 12,
    alignItems: 'center',
  },
  roleIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  roleLabel: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center' },
  roleDesc: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center', marginTop: 3 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  eyeBtn: { padding: 4 },
  demoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  demoText: { fontSize: 12, color: Colors.textSecondary },
  loginBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: Colors.surface },
});
