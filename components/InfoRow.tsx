import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  iconColor?: string;
}

export default function InfoRow({ icon, label, value, iconColor }: Props) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={18} color={iconColor ?? Colors.primary} style={styles.icon} />
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  icon: { marginTop: 2, marginRight: 10, width: 20 },
  content: { flex: 1 },
  label: { fontSize: 12, color: Colors.textSecondary, marginBottom: 1 },
  value: { fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },
});
