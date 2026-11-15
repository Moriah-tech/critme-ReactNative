import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { CritAvatar } from './CritAvatar';
import { colors } from '../theme';

/** Shown while Crit generates takes: the avatar with a spinning gradient ring. */
export function InitializingView({ label = 'Crit is watching your video…' }: { label?: string }) {
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const S = 96;
  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      <View style={{ width: S, height: S, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
          <Svg width={S} height={S}>
            <Defs>
              <SvgGradient id="ring" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={colors.cyan} />
                <Stop offset="0.55" stopColor={colors.purple} />
                <Stop offset="1" stopColor={colors.magenta} stopOpacity="0" />
              </SvgGradient>
            </Defs>
            <Circle cx={S / 2} cy={S / 2} r={S / 2 - 3} stroke="url(#ring)" strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray={`${Math.PI * (S - 6) * 0.7} 999`} />
          </Svg>
        </Animated.View>
        <CritAvatar size={S - 22} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: 18 },
  label: { color: colors.textMuted, fontSize: 14 },
});
