import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

/**
 * The "orbit" mark at the top right of the feed (Demo13 layer 6).
 * Four half-white dots; over each one a gradient dot lights up in turn,
 * clockwise from the top, every 3.2 s, behind a breathing cyan/purple halo.
 * Every 60 s (and once 2 s after mount) the two dot pairs spin in opposite
 * directions for 2.1 s. Pressing scales it to 0.88 for 140 ms and opens Explore.
 */

const BOX = 22;
const DOT = 5.7; // r = 2.85
const DOTS = [
  { key: 'top', x: 11, y: 4.8, ring: 'a', delay: 0, colors: ['#67E8F9', '#D946EF'] },
  { key: 'right', x: 17.2, y: 11, ring: 'b', delay: 800, colors: ['#22D3EE', '#A855F7'] },
  { key: 'bottom', x: 11, y: 17.2, ring: 'a', delay: 1600, colors: ['#67E8F9', '#D946EF'] },
  { key: 'left', x: 4.8, y: 11, ring: 'b', delay: 2400, colors: ['#22D3EE', '#A855F7'] },
] as const;
const PERIOD = 3200;

type Props = {
  top: number;
  onPress?: () => void;
  active: boolean;
};

function useLight(delay: number, active: boolean) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active) return;
    // Keyframes: 0% → 10% peak (1, 1.18) → 30% (0.9, 1) → 55% off → hold until 100%.
    const ease = Easing.bezier(0.3, 0, 0.2, 1);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: PERIOD * 0.1, easing: ease, useNativeDriver: true }),
        Animated.timing(v, { toValue: 2, duration: PERIOD * 0.2, easing: ease, useNativeDriver: true }),
        Animated.timing(v, { toValue: 3, duration: PERIOD * 0.25, easing: ease, useNativeDriver: true }),
        Animated.timing(v, { toValue: 4, duration: PERIOD * 0.45, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    const t = setTimeout(() => loop.start(), delay);
    return () => {
      clearTimeout(t);
      loop.stop();
    };
  }, [active, delay, v]);
  return {
    opacity: v.interpolate({ inputRange: [0, 1, 2, 3, 4], outputRange: [0, 1, 0.9, 0, 0] }),
    scale: v.interpolate({ inputRange: [0, 1, 2, 3, 4], outputRange: [0.85, 1.18, 1, 0.9, 0.85] }),
  };
}

function ColorDot({ d, active }: { d: (typeof DOTS)[number]; active: boolean }) {
  const { opacity, scale } = useLight(d.delay, active);
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: d.x - DOT / 2,
        top: d.y - DOT / 2,
        width: DOT,
        height: DOT,
        opacity,
        transform: [{ scale }],
      }}
    >
      {/* Emissive glow (the demo uses two blurred copies) */}
      <View style={[styles.glow, { backgroundColor: d.colors[1], shadowColor: d.colors[0] }]} />
      <LinearGradient colors={[...d.colors]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={styles.dot} />
    </Animated.View>
  );
}

export function OrbitButton({ top, onPress, active }: Props) {
  const press = useRef(new Animated.Value(1)).current;
  const halo = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(halo, { toValue: 1, duration: PERIOD / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(halo, { toValue: 0, duration: PERIOD / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    const sweep = () => {
      spin.setValue(0);
      Animated.timing(spin, { toValue: 1, duration: 2100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start();
    };
    const first = setTimeout(sweep, 2000);
    const every = setInterval(sweep, 60000);
    return () => {
      loop.stop();
      clearTimeout(first);
      clearInterval(every);
    };
  }, [active, halo, spin]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(press, { toValue: 0.88, duration: 70, useNativeDriver: true }),
      Animated.timing(press, { toValue: 1, duration: 70, useNativeDriver: true }),
    ]).start();
    onPress?.();
  };

  const cw = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const ccw = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-360deg'] });

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="Open Explore"
      hitSlop={8}
      style={[styles.btn, { top }]}
    >
      <Animated.View style={[styles.inner, { transform: [{ scale: press }] }]}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.halo,
            {
              opacity: halo.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
              transform: [{ scale: halo.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.1] }) }],
            },
          ]}
        >
          <Svg width={30} height={30}>
            <Defs>
              <RadialGradient id="orbitHalo" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor="#67E8F9" stopOpacity={0.22} />
                <Stop offset="0.64" stopColor="#A855F7" stopOpacity={0.14} />
                <Stop offset="1" stopColor="#000" stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={15} cy={15} r={15} fill="url(#orbitHalo)" />
          </Svg>
        </Animated.View>
        <View style={styles.box}>
          {DOTS.map((d) => (
            <View key={d.key} style={[styles.white, { left: d.x - DOT / 2, top: d.y - DOT / 2 }]} />
          ))}
          <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: cw }] }]}>
            {DOTS.filter((d) => d.ring === 'a').map((d) => <ColorDot key={d.key} d={d} active={active} />)}
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: ccw }] }]}>
            {DOTS.filter((d) => d.ring === 'b').map((d) => <ColorDot key={d.key} d={d} active={active} />)}
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { position: 'absolute', right: 16, width: 30, height: 30, zIndex: 22 },
  inner: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', left: 0, top: 0, width: 30, height: 30 },
  box: { width: BOX, height: BOX },
  white: { position: 'absolute', width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: '#F5F5F7', opacity: 0.5 },
  dot: { width: DOT, height: DOT, borderRadius: DOT / 2 },
  glow: {
    position: 'absolute',
    left: -2,
    top: -2,
    width: DOT + 4,
    height: DOT + 4,
    borderRadius: (DOT + 4) / 2,
    opacity: 0.35,
    shadowOpacity: 0.9,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
  },
});
