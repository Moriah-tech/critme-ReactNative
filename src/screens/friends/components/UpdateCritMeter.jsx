import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { fonts, meterGradient } from '../theme';

/**
 * The Crit Meter on each Updates post. Demo13 clones the Home-feed meter into
 * every post (static, no live movement): the left half of a 116 × 120 dial
 * (centre 58,60, radius 50) pinned to the right edge of the media, 8 px from
 * its top, drawn at 33 × 69. Score 5 is at the top, 3 at the left, 1 at the
 * bottom; the brighter arc fills from 1 up to the score and the needle points
 * at it. Tapping it opens the post's first bubble (as in the demo).
 */
const W = 33;
const H = 69;
const L = (Math.PI * 50) / 2; // length of each quarter arc
const CX = 58;
const CY = 60;
const TIP = 34;

function tip(score) {
  const th = ((-90 - (5 - score) * 45) * Math.PI) / 180;
  return { x: CX + TIP * Math.cos(th), y: CY + TIP * Math.sin(th) };
}

function dash(score, from) {
  const vis = Math.max(0, Math.min(1, (score - from) / 2)) * L;
  return { vis, array: `${vis.toFixed(2)} ${(L * 2).toFixed(2)}`, offset: -(L - vis) };
}

export function UpdateCritMeter({ score = 3.8, onPress, idSuffix }) {
  const s = Math.max(1, Math.min(5, score));
  const t = tip(s);
  const upper = dash(s, 3);
  const lower = dash(s, 1);
  const up = `mU_${idSuffix}`;
  const lo = `mL_${idSuffix}`;
  const label = (x, y, txt) => (
    <SvgText x={x} y={y} fill="rgba(255,255,255,0.82)" fontFamily={fonts.name} fontSize={8}>
      {txt}
    </SvgText>
  );
  return (
    <Pressable
      onPress={onPress}
      style={styles.wrap}
      accessibilityRole="button"
      accessibilityLabel={`Crit Meter ${s.toFixed(1)} out of 5`}
      hitSlop={4}
    >
      <View style={styles.shadow}>
        <Svg width={W} height={H} viewBox="0 0 58 120">
          <Defs>
            <LinearGradient id={up} x1="58" y1="10" x2="8" y2="60" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={meterGradient[0]} />
              <Stop offset="1" stopColor={meterGradient[1]} />
            </LinearGradient>
            <LinearGradient id={lo} x1="8" y1="60" x2="58" y2="110" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={meterGradient[1]} />
              <Stop offset="1" stopColor={meterGradient[2]} />
            </LinearGradient>
          </Defs>
          <Path d="M 58 10 A 50 50 0 0 0 8 60" fill="none" opacity={0.52} stroke={`url(#${up})`} strokeLinecap="round" strokeWidth={7} />
          <Path d="M 8 60 A 50 50 0 0 0 58 110" fill="none" opacity={0.52} stroke={`url(#${lo})`} strokeLinecap="round" strokeWidth={7} />
          {lower.vis > 0.5 && (
            <Path d="M 8 60 A 50 50 0 0 0 58 110" fill="none" stroke={`url(#${lo})`} strokeLinecap="round" strokeWidth={7}
              strokeDasharray={lower.array} strokeDashoffset={lower.offset} />
          )}
          {upper.vis > 0.5 && (
            <Path d="M 58 10 A 50 50 0 0 0 8 60" fill="none" stroke={`url(#${up})`} strokeLinecap="round" strokeWidth={7}
              strokeDasharray={upper.array} strokeDashoffset={upper.offset} />
          )}
          <Line x1="58" y1="10" x2="58" y2="18" stroke="#fff" strokeWidth={2} opacity={0.85} />
          {label(52, 30, '5')}
          <Line x1="22.6" y1="24.6" x2="27.8" y2="29.8" stroke="#fff" strokeWidth={2} opacity={0.85} />
          {label(29, 38, '4')}
          <Line x1="8" y1="60" x2="17" y2="60" stroke="#fff" strokeWidth={2} opacity={0.85} />
          {label(21, 58.5, '3')}
          <Line x1="22.6" y1="95.4" x2="27.8" y2="90.2" stroke="#fff" strokeWidth={2} opacity={0.85} />
          {label(28, 85, '2')}
          <Line x1="58" y1="110" x2="58" y2="102" stroke="#fff" strokeWidth={2} opacity={0.85} />
          {label(52, 99, '1')}
          <Line x1="38.9" y1="13.8" x2="40.4" y2="17.0" stroke="#fff" strokeWidth={1.1} opacity={0.5} />
          <Line x1="11.8" y1="40.9" x2="15.0" y2="42.2" stroke="#fff" strokeWidth={1.1} opacity={0.5} />
          <Line x1="11.8" y1="79.2" x2="15.0" y2="77.9" stroke="#fff" strokeWidth={1.1} opacity={0.5} />
          <Line x1="38.9" y1="106.2" x2="40.4" y2="103.0" stroke="#fff" strokeWidth={1.1} opacity={0.5} />
          <Line x1={CX} y1={CY} x2={t.x} y2={t.y} stroke="#fff" strokeWidth={2.4} strokeLinecap="round" opacity={0.95} />
          <Circle cx={CX} cy={CY} r={4} fill="#fff" opacity={0.9} />
          <Circle cx={CX} cy={CY} r={2} fill="rgba(0,0,0,0.6)" />
        </Svg>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 0, top: 8, width: W, height: H, zIndex: 60 },
  shadow: {
    width: W,
    height: H,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
});
