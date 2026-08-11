import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  label: string;
  color: string;
  icon: string;
}

interface Props {
  markers?: MarkerData[];
  height?: number;
  note?: string;
}

export default function MapPlaceholder({ markers = [], height = 280, note }: Props) {
  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.grid}>
        {Array.from({ length: 40 }).map((_, i) => (
          <View key={i} style={styles.cell} />
        ))}
      </View>
      <View style={styles.overlay}>
        <Ionicons name="map" size={40} color={Colors.primary + '60'} />
        <Text style={styles.title}>Mapa Interactivo</Text>
        <Text style={styles.subtitle}>
          {note ?? 'Disponible en la app móvil (iOS/Android)'}
        </Text>
        {markers.length > 0 && (
          <View style={styles.legendBox}>
            {markers.map(m => (
              <View key={m.id} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: m.color }]}>
                  <Ionicons name={m.icon as any} size={10} color="#fff" />
                </View>
                <Text style={styles.legendLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e8f0f7',
    position: 'relative',
  },
  grid: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '10%',
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#c5d5e8',
    aspectRatio: 1,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  title: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  subtitle: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },
  legendBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    justifyContent: 'center',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#fff',
  },
  legendLabel: { fontSize: 11, color: Colors.textSecondary },
});
