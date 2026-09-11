import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme';

// Straight-line particle: interpolates x/y between two points on a loop.
function FlowParticle({ from, to, color, duration, active }) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loop;
    if (active) {
      t.setValue(0);
      loop = Animated.loop(
        Animated.timing(t, {
          toValue: 1,
          duration,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loop.start();
    }
    return () => loop && loop.stop();
  }, [active, duration]);

  const x = t.interpolate({ inputRange: [0, 1], outputRange: [from.x, to.x] });
  const y = t.interpolate({ inputRange: [0, 1], outputRange: [from.y, to.y] });

  if (!active) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: color,
        transform: [{ translateX: x }, { translateY: y }],
      }}
    />
  );
}

export default function FlowDiagram({ pv, home, battFlow, gridFlow }) {
  // Layout matches a 380x210 canvas.
  const solar = { x: 190, y: 26 };
  const homeN = { x: 190, y: 112 };
  const gridN = { x: 46, y: 163 };
  const battN = { x: 334, y: 163 };

  const battCharging = battFlow > 0.05;
  const battDischarging = battFlow < -0.05;
  const gridExporting = gridFlow > 0.05;
  const gridImporting = gridFlow < -0.05;

  return (
    <View style={styles.wrap}>
      <Svg viewBox="0 0 380 210" width={380} height={210}>
        <Path d="M 190 40 L 190 100" stroke={colors.solarDim} strokeWidth={2} fill="none" />
        <Path d="M 190 100 L 60 150" stroke={colors.gridDim} strokeWidth={2} fill="none" />
        <Path d="M 190 100 L 320 150" stroke={colors.battDim} strokeWidth={2} fill="none" />

        {/* Solar node */}
        <Circle cx={solar.x} cy={solar.y} r={22} fill="#231A0C" stroke={colors.solar} strokeWidth={1.4} />
        <Circle cx={solar.x} cy={solar.y} r={6.5} fill="none" stroke={colors.solar} strokeWidth={1.6} />
        <SvgText x={solar.x} y={60} textAnchor="middle" fontSize={9.5} fill={colors.inkDim}>Solar</SvgText>
        <SvgText x={solar.x} y={74} textAnchor="middle" fontSize={12.5} fontWeight="600" fill={colors.ink}>
          {pv.toFixed(2)} kW
        </SvgText>

        {/* Home node */}
        <Circle cx={homeN.x} cy={homeN.y} r={24} fill="#161F2E" stroke={colors.inkFaint} strokeWidth={1.2} />
        <SvgText x={homeN.x} y={146} textAnchor="middle" fontSize={9.5} fill={colors.inkDim}>Home</SvgText>
        <SvgText x={homeN.x} y={160} textAnchor="middle" fontSize={12.5} fontWeight="600" fill={colors.ink}>
          {home.toFixed(2)} kW
        </SvgText>

        {/* Grid node */}
        <Circle cx={gridN.x} cy={gridN.y} r={20} fill="#161F2E" stroke={colors.grid} strokeWidth={1.3} />
        <SvgText x={gridN.x} y={195} textAnchor="middle" fontSize={9.5} fill={colors.inkDim}>Grid</SvgText>
        <SvgText x={gridN.x} y={208} textAnchor="middle" fontSize={12.5} fontWeight="600" fill={colors.ink}>
          {Math.abs(gridFlow).toFixed(2)} kW
        </SvgText>

        {/* Battery node */}
        <Circle cx={battN.x} cy={battN.y} r={20} fill="#111E1A" stroke={colors.batt} strokeWidth={1.3} />
        <Rect x={battN.x - 8} y={battN.y - 9} width={16} height={20} rx={2.5} fill="none" stroke={colors.batt} strokeWidth={1.5} />
        <SvgText x={battN.x} y={195} textAnchor="middle" fontSize={9.5} fill={colors.inkDim}>Battery</SvgText>
        <SvgText x={battN.x} y={208} textAnchor="middle" fontSize={12.5} fontWeight="600" fill={colors.ink}>
          {Math.abs(battFlow).toFixed(2)} kW
        </SvgText>
      </Svg>

      {/* Particles overlay. Positions are raw pixels in the same 380x210
          box as the Svg above, so this only lines up because the Svg is
          rendered at a fixed 380x210 rather than a percentage width. */}
      <View style={[StyleSheet.absoluteFill, { width: 380, height: 210 }]} pointerEvents="none">
        <FlowParticle from={solar} to={homeN} color={colors.solar} duration={1500} active={pv > 0.05} />
        <FlowParticle
          from={battDischarging ? battN : homeN}
          to={battDischarging ? homeN : battN}
          color={colors.batt}
          duration={1800}
          active={battCharging || battDischarging}
        />
        <FlowParticle
          from={gridImporting ? gridN : homeN}
          to={gridImporting ? homeN : gridN}
          color={colors.grid}
          duration={2000}
          active={gridExporting || gridImporting}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 380, height: 210, alignSelf: 'center', position: 'relative' },
});
