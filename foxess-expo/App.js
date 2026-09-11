import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaView, ScrollView, View, Text, StyleSheet, Platform,
} from 'react-native';
import {
  useFonts,
  SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';

import { colors } from './theme';
import { solarAt, loadAt, buildDaySeries, buildWeekSeries, rnd } from './data/mock';
import FlowDiagram from './components/FlowDiagram';
import StatCard from './components/StatCard';
import GenerationChart from './components/GenerationChart';
import BatteryRing from './components/BatteryRing';
import ConnectPanel from './components/ConnectPanel';

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_500Medium, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold,
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold,
  });

  const [live, setLive] = useState(false);
  const [connection, setConnection] = useState(null); // {apiKey, sn}
  const [reading, setReading] = useState(null); // {pv, load, battFlow, gridFlow, soc}
  const [soc, setSoc] = useState(71);
  const [daySeries] = useState(buildDaySeries());
  const [weekSeries] = useState(buildWeekSeries());

  const tick = useCallback(() => {
    if (live && reading) return; // live readings come from ConnectPanel/polling instead
    const h = new Date().getHours() + new Date().getMinutes() / 60 + rnd(-0.05, 0.05);
    const pv = Math.max(0, solarAt(h) + rnd(-0.15, 0.15));
    const load = Math.max(0.2, loadAt(h) + rnd(-0.1, 0.1));
    const diff = pv - load;

    let battFlow, gridFlow;
    if (diff >= 0) {
      if (soc < 97) {
        battFlow = Math.min(diff, 3.0);
        gridFlow = diff - battFlow;
      } else {
        battFlow = 0.05;
        gridFlow = diff;
      }
    } else {
      battFlow = -Math.min(-diff, 3.0);
      gridFlow = diff - battFlow;
    }

    setReading({ pv, load, battFlow, gridFlow });
    setSoc((s) => {
      const delta = battFlow > 0 ? 0.15 : battFlow < -0.02 ? -0.12 : 0;
      return Math.max(8, Math.min(100, s + delta));
    });
  }, [live, reading, soc]);

  useEffect(() => {
    tick();
    const id = setInterval(tick, 3000);
    return () => clearInterval(id);
  }, [tick]);

  // Poll the real FoxESS endpoint every 30s once connected.
  useEffect(() => {
    if (!live || !connection) return;
    let cancelled = false;
    const { fetchRealtime } = require('./lib/foxess');

    async function poll() {
      try {
        const r = await fetchRealtime({ apiKey: connection.apiKey, sn: connection.sn });
        if (!cancelled) {
          setReading(r);
          if (r.soc != null) setSoc(r.soc);
        }
      } catch (e) {
        // keep showing the last good reading on transient failures
      }
    }
    poll();
    const id = setInterval(poll, 30000);
    return () => { cancelled = true; clearInterval(id); };
  }, [live, connection]);

  if (!fontsLoaded || !reading) return null;

  const battStatus = reading.battFlow > 0.05 ? 'Charging' : reading.battFlow < -0.05 ? 'Discharging' : 'Standby';
  const remainingKwh = ((100 - soc) / 100) * 10.4;
  const etaHrs = reading.battFlow > 0.05 ? remainingKwh / reading.battFlow : null;
  const etaText = etaHrs ? `${Math.floor(etaHrs)}h ${Math.round((etaHrs % 1) * 60)}m` : '—';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark} />
            <View>
              <Text style={styles.brandName}>Solstice</Text>
              <Text style={styles.brandSub}>Inverter SH10-RT · SN F0A2C9</Text>
            </View>
          </View>
          <View style={styles.statusPill}>
            <View style={[styles.dot, { backgroundColor: live ? colors.batt : colors.solar }]} />
            <Text style={styles.statusText}>{live ? 'Live' : 'Demo data'}</Text>
          </View>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={{ alignItems: 'center', marginBottom: 6 }}>
            <Text style={styles.heroNum}>
              {reading.pv.toFixed(2)}<Text style={styles.heroUnit}> kW</Text>
            </Text>
            <Text style={styles.heroLabel}>
              {reading.pv > 0.05 ? "Solar output right now" : 'No solar output (nighttime)'}
            </Text>
          </View>
          <FlowDiagram pv={reading.pv} home={reading.load} battFlow={reading.battFlow} gridFlow={reading.gridFlow} />
        </View>

        {/* Stat grid */}
        <View style={styles.statsGrid}>
          <StatCard swatch={colors.solar} title="Today's yield" value="18.4" unit="kWh" sub="+6% vs. yesterday" />
          <StatCard swatch={colors.inkDim} title="Home usage" value="11.2" unit="kWh" sub="62% self-supplied" />
          <StatCard
            swatch={colors.grid} title="Grid exchange" value="2.1" unit="kWh"
            sub={reading.gridFlow >= 0 ? 'Net exported today' : 'Net imported today'}
          />
          <StatCard swatch={colors.warn} title="CO₂ avoided" value="9.6" unit="kg" sub="Estimated, today" />
        </View>

        <View style={{ height: 14 }} />
        <GenerationChart daySeries={daySeries} weekSeries={weekSeries} />

        <View style={{ height: 14 }} />
        <BatteryRing soc={soc} status={battStatus} rateKw={Math.abs(reading.battFlow)} etaText={etaText} />

        <View style={{ height: 14 }} />
        <ConnectPanel
          onConnected={({ apiKey, sn, reading: r }) => {
            setConnection({ apiKey, sn });
            setReading(r);
            if (r.soc != null) setSoc(r.soc);
            setLive(true);
          }}
        />

        <Text style={styles.footer}>Not affiliated with FoxESS.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 14, paddingTop: Platform.OS === 'android' ? 28 : 8, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 34, height: 34, borderRadius: 9, backgroundColor: colors.solar },
  brandName: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 16.5, color: colors.ink },
  brandSub: { fontSize: 11.5, color: colors.inkFaint, marginTop: 1 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.line, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 100,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11.5, color: colors.inkDim },
  hero: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, borderRadius: 20,
    padding: 18, marginTop: 4, marginBottom: 14, alignItems: 'center',
  },
  heroNum: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 40, color: colors.ink },
  heroUnit: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 19, color: colors.inkDim },
  heroLabel: { fontSize: 12.5, color: colors.inkDim, marginTop: 6 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  footer: { textAlign: 'center', fontSize: 11, color: colors.inkFaint, marginTop: 16 },
});
