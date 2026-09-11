import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, radius } from '../theme';

const R = 44;
const CIRCUMFERENCE = 2 * Math.PI * R;

export default function BatteryRing({ soc, status, rateKw, etaText }) {
  const offset = CIRCUMFERENCE * (1 - soc / 100);
  const ringColor = soc < 20 ? colors.warn : colors.batt;
  const statusColor =
    status === 'Charging' ? colors.batt : status === 'Discharging' ? colors.warn : colors.inkDim;

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View>
          <Text style={styles.title}>Battery storage</Text>
          <Text style={styles.sub}>10.4 kWh capacity</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.ringWrap}>
          <Svg width={104} height={104} viewBox="0 0 104 104">
            <Circle cx={52} cy={52} r={R} fill="none" stroke={colors.surface2} strokeWidth={10} />
            <Circle
              cx={52} cy={52} r={R} fill="none" stroke={ringColor} strokeWidth={10}
              strokeLinecap="round" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset}
              rotation={-90} originX={52} originY={52}
            />
          </Svg>
          <View style={styles.ringCenter}>
            <Text style={styles.socPct}>{Math.round(soc)}%</Text>
            <Text style={styles.socLabel}>charged</Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.k}>Status</Text>
            <Text style={[styles.v, { color: statusColor }]}>{status}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.k}>Rate</Text>
            <Text style={styles.v}>{rateKw.toFixed(2)} kW</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.k}>Est. full</Text>
            <Text style={styles.v}>{etaText}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 16 },
  head: { marginBottom: 14 },
  title: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14.5, color: colors.ink },
  sub: { fontSize: 11, color: colors.inkFaint, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  ringWrap: { width: 104, height: 104, alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  socPct: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: colors.ink },
  socLabel: { fontSize: 9.5, color: colors.inkFaint, marginTop: -2 },
  details: { flex: 1, gap: 9 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  k: { fontSize: 12.5, color: colors.inkDim },
  v: { fontSize: 12.5, fontWeight: '600', color: colors.ink },
});
