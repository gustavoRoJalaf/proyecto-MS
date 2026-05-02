import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: Colors.warning, bg: '#FEF9E7' },
  confirmed: { label: 'Confirmada', color: Colors.primary, bg: '#EBF5FB' },
  completed: { label: 'Completada', color: Colors.success, bg: '#EAFAF1' },
  cancelled: { label: 'Cancelada', color: Colors.accent, bg: '#FDEDEC' },
  reviewed: { label: 'Revisado', color: Colors.success, bg: '#EAFAF1' },
  en_route: { label: 'En Camino', color: Colors.primary, bg: '#EBF5FB' },
  available: { label: 'Disponible', color: Colors.success, bg: '#EAFAF1' },
  visiting: { label: 'En Visita', color: Colors.warning, bg: '#FEF9E7' },
};

interface Props {
  status: keyof typeof STATUS_CONFIG;
  small?: boolean;
}

export default function StatusBadge({ status, small }: Props) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }, small && styles.small]}>
      <Text style={[styles.text, { color: cfg.color }, small && styles.smallText]}>
        {cfg.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 13, fontWeight: '600' },
  small: { paddingHorizontal: 8, paddingVertical: 2 },
  smallText: { fontSize: 11 },
});
