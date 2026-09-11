import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path, Line, Rect, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, radius } from '../theme';

const W = 340, H = 160, PAD_L = 26, PAD_R = 8, PAD_T = 10, PAD_B = 22;

function DayChart({ hours, pv, load }) {
  const maxV = Math.max(...pv, ...load) * 1.15;
  const x = (i) => PAD_L + (i / (hours.length - 1)) * (W - PAD_L - PAD_R);
  const y = (v) => H - PAD_B - (v / maxV) * (H - PAD_T - PAD_B);

  const pvPath = pv.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const pvArea = `${pvPath} L ${x(pv.length - 1)} ${H - PAD_B} L ${x(0)} ${H - PAD_B} Z`;
  const loadPath = load.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');

  const ticks = [6, 9, 12, 15, 18, 21];

  return (
    <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height={160}>
      <Defs>
        <LinearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={colors.solar} stopOpacity={0.45} />
          <Stop offset="100%" stopColor={colors.solar} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {ticks.map((h) => (
        <React.Fragment key={h}>
          <Line x1={x(h)} y1={PAD_T} x2={x(h)} y2={H - PAD_B} stroke={colors.line} strokeWidth={1} strokeDasharray="2 4" />
          <SvgText x={x(h)} y={H - 6} textAnchor="middle" fontSize={9} fill={colors.inkFaint}>{h}:00</SvgText>
        </React.Fragment>
      ))}
      <Path d={pvArea} fill="url(#pvGrad)" />
      <Path d={loadPath} fill="none" stroke={colors.inkFaint} strokeWidth={1.6} strokeDasharray="4 3" />
      <Path d={pvPath} fill="none" stroke={colors.solar} strokeWidth={2.2} />
    </Svg>
  );
}

function WeekChart({ week }) {
  const maxV = Math.max(...week.map((d) => d.pv)) * 1.2;
  const gap = 12;
  const bw = (W - PAD_L - PAD_R - gap * (week.length - 1)) / week.length;

  return (
    <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height={160}>
      {week.map((d, i) => {
        const bx = PAD_L + i * (bw + gap);
        const bh = (d.pv / maxV) * (H - PAD_T - PAD_B);
        const by = H - PAD_B - bh;
        return (
          <React.Fragment key={d.day}>
            <Rect
              x={bx} y={by} width={bw} height={bh} rx={4}
              fill={d.isToday ? colors.solar : colors.surface2}
              stroke={d.isToday ? 'none' : colors.line}
            />
            <SvgText x={bx + bw / 2} y={H - 6} textAnchor="middle" fontSize={9} fill={d.isToday ? colors.ink : colors.inkFaint}>
              {d.day}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

export default function GenerationChart({ daySeries, weekSeries }) {
  const [tab, setTab] = useState('day');

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View>
          <Text style={styles.title}>Power generation</Text>
          <Text style={styles.sub}>{tab === 'day' ? "Today · updated live" : 'Last 7 days'}</Text>
        </View>
        <View style={styles.tabs}>
          <Pressable onPress={() => setTab('day')} style={[styles.tab, tab === 'day' && styles.tabActive]}>
            <Text style={[styles.tabText, tab === 'day' && styles.tabTextActive]}>Day</Text>
          </Pressable>
          <Pressable onPress={() => setTab('week')} style={[styles.tab, tab === 'week' && styles.tabActive]}>
            <Text style={[styles.tabText, tab === 'week' && styles.tabTextActive]}>Week</Text>
          </Pressable>
        </View>
      </View>

      {tab === 'day' ? (
        <DayChart hours={daySeries.hours} pv={daySeries.pv} load={daySeries.load} />
      ) : (
        <WeekChart week={weekSeries} />
      )}

      {tab === 'day' && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: colors.solar }]} />
            <Text style={styles.legendText}>Solar</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: colors.inkFaint }]} />
            <Text style={styles.legendText}>Consumption</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 16 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  title: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14.5, color: colors.ink },
  sub: { fontSize: 11, color: colors.inkFaint, marginTop: 2 },
  tabs: { flexDirection: 'row', backgroundColor: colors.surface2, borderRadius: 9, padding: 3, gap: 2 },
  tab: { paddingVertical: 5, paddingHorizontal: 11, borderRadius: 7 },
  tabActive: { backgroundColor: colors.surface },
  tabText: { fontSize: 11.5, fontWeight: '600', color: colors.inkDim },
  tabTextActive: { color: colors.ink },
  legend: { flexDirection: 'row', gap: 16, marginTop: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 9, height: 9, borderRadius: 2 },
  legendText: { fontSize: 11, color: colors.inkDim },
});
