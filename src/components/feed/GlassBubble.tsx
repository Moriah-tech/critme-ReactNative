import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLinear, RadialGradient, Stop } from 'react-native-svg';
import { PersonGlyph } from '../icons';

/**
 * Demo13's transparent glass bubble (42 px). The CSS uses a soft radial fill,
 * a faint border and four inset shadows (pink on top, blue underneath, cyan on
 * the right, pink on the left). Here those inset shadows are drawn as gradient
 * rim strokes. Inside sits Crit's portrait or the creator's grey avatar at
 * 82 % of the bubble.
 */
export const BUBBLE_SIZE = 42;
const crit = require('../../../assets/crit.png');

export type BubbleKind = 'crit' | 'creator';

export function GlassBubble({ kind, size = BUBBLE_SIZE }: { kind: BubbleKind; size?: number }) {
  const r = size / 2;
  const inner = size * 0.82;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="bFill" cx="33%" cy="30%" r="75%">
            <Stop offset="0" stopColor="#fff" stopOpacity={0.1} />
            <Stop offset="0.4" stopColor="rgb(190,224,255)" stopOpacity={0.05} />
            <Stop offset="0.7" stopColor="rgb(255,192,234)" stopOpacity={0.035} />
            <Stop offset="1" stopColor="rgb(130,182,255)" stopOpacity={0.016} />
          </RadialGradient>
          <SvgLinear id="bRimV" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="rgb(255,138,218)" stopOpacity={0.32} />
            <Stop offset="0.35" stopColor="rgb(255,138,218)" stopOpacity={0} />
            <Stop offset="0.65" stopColor="rgb(72,178,255)" stopOpacity={0} />
            <Stop offset="1" stopColor="rgb(72,178,255)" stopOpacity={0.32} />
          </SvgLinear>
          <SvgLinear id="bRimH" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="rgb(255,112,198)" stopOpacity={0.18} />
            <Stop offset="0.35" stopColor="rgb(255,112,198)" stopOpacity={0} />
            <Stop offset="0.65" stopColor="rgb(128,210,255)" stopOpacity={0} />
            <Stop offset="1" stopColor="rgb(128,210,255)" stopOpacity={0.18} />
          </SvgLinear>
        </Defs>
        <Circle cx={r} cy={r} r={r - 0.5} fill="url(#bFill)" />
        <Circle cx={r} cy={r} r={r - 2.5} fill="none" stroke="url(#bRimV)" strokeWidth={4} />
        <Circle cx={r} cy={r} r={r - 2.5} fill="none" stroke="url(#bRimH)" strokeWidth={3} />
        <Circle cx={r} cy={r} r={r - 0.5} fill="none" stroke="rgba(232,240,255,0.07)" strokeWidth={1} />
      </Svg>
      <View style={styles.center}>
        {kind === 'crit' ? (
          <Image source={crit} style={{ width: inner, height: inner, borderRadius: inner / 2, opacity: 0.98 }} />
        ) : (
          <LinearGradient
            colors={['#888', '#444']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.userAv, { width: inner, height: inner, borderRadius: inner / 2, opacity: 0.98 }]}
          >
            <PersonGlyph size={inner * 0.52} />
          </LinearGradient>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  userAv: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
});
