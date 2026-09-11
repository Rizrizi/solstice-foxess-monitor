import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

export default function StatCard({ swatch, title, value, unit, sub }) {
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={[styles.swatch, { backgroundColor: swatch }]} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.value}>
        {value}
        <Text style={styles.unit}> {unit}</Text>
      </Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 14,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 9 },
  swatch: { width: 8, height: 8, borderRadius: 2 },
  title: { fontSize: 11.5, color: colors.inkDim },
  value: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 21, color: colors.ink },
  unit: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.inkDim },
  sub: { fontSize: 11, color: colors.inkFaint, marginTop: 3 },
});
