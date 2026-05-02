import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  title: string;
  subtitle?: string;
  accent?: string;
}

export default function SectionHeader({ title, subtitle, accent }: Props) {
  return (
    <View style={styles.container}>
      {accent && <View style={[styles.accent, { backgroundColor: accent }]} />}
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  accent: { width: 4, height: 24, borderRadius: 2, marginRight: 10 },
  title: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
});
