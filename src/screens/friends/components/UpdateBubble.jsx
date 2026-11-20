import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgLinear, RadialGradient, Stop } from 'react-native-svg';
import { PersonFilled } from './icons';
import { CRIT_AVATAR } from '../data/updatesData';

/**
 * One floating bubble on an Updates post.
 *
 * Look (Demo13): a transparent glass circle — soft radial fill, faint border and
 * four inset glows (pink top, blue bottom, cyan right, pink left) — with Crit's
 * portrait or the poster's grey avatar inside at 82 % of the bubble.
 *
 * Motion (Demo13 keyframes):
 *  - float: up 10 px and back, 5 s, ease-in-out, forever; each bubble starts
 *    part-way through using its (negative) delay;
 *  - selected: frozen where it was, then a 0.9 s pulse (up 2 px) at scale 1.06
 *    with a soft cyan glow.
 */
const FLOAT_MS = 5000;
const easeInOut = Easing.inOut(Easing.ease);

/** Float offset (0 → -10 → 0) for a phase in [0, 1). */
function floatOffset(phase) {
  if (phase < 0.5) return -10 * easeInOut(phase / 0.5);
  return -10 + 10 * easeInOut((phase - 0.5) / 0.5);
}

export function UpdateBubble({ bubble, left, top, selected, dimmed, onPress, onFrozen }) {
  const { size, kind, delay } = bubble;
  const phase = useRef(new Animated.Value(0)).current;
  const frozenY = useRef(0);
  const frozen = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  // Float loop (restarts from the bubble's own delay whenever it is released).
  useEffect(() => {
    if (selected) return undefined;
    let loop;
    const start = (((-delay % 5) + 5) % 5) / 5;
    phase.setValue(start);
    const first = Animated.timing(phase, {
      toValue: 1,
      duration: (1 - start) * FLOAT_MS,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    first.start(({ finished }) => {
      if (!finished) return;
      phase.setValue(0);
      loop = Animated.loop(Animated.timing(phase, { toValue: 1, duration: FLOAT_MS, easing: Easing.linear, useNativeDriver: true }));
      loop.start();
    });
    return () => {
      first.stop();
      if (loop) loop.stop();
    };
  }, [selected, delay, phase]);

  // Selected: freeze where the float currently is (works whether the bubble or
  // the meter was tapped), report that offset so the message bar lines up, then pulse.
  useEffect(() => {
    if (!selected) {
      pulse.setValue(0);
      return undefined;
    }
    phase.stopAnimation((p) => {
      frozenY.current = floatOffset(p);
      frozen.setValue(frozenY.current);
      if (onFrozen) onFrozen(frozenY.current);
    });
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 450, easing: easeInOut, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 450, easing: easeInOut, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
    // onFrozen is read once per selection on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, pulse, phase, frozen]);

  const handlePress = () => {
    if (selected) return; // tapping the selected bubble again does nothing (demo)
    onPress({ x: left, y: top, size });
  };

  const floatY = phase.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -10, 0], easing: easeInOut });
  const translateY = selected
    ? Animated.add(frozen, pulse.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }))
    : floatY;

  const r = size / 2;
  const inner = size * 0.82;

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          left,
          top,
          width: size,
          height: size,
          // Other bubbles stay tappable above the blur (tapping one switches focus, as in the demo)
          // but are darkened; React Native views can't be blurred individually.
          zIndex: selected ? 95 : 50,
          opacity: dimmed ? 0.5 : 1,
          transform: [{ translateY }, { scale: selected ? 1.06 : 1 }],
        },
        selected && styles.selectedGlow,
      ]}
    >
      <Pressable
        onPress={handlePress}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={kind === 'crit' ? "Open Crit's take" : "Open the poster's message"}
      >
        <View style={{ width: size, height: size }}>
          <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id="ubFill" cx="33%" cy="30%" r="75%">
                <Stop offset="0" stopColor="#fff" stopOpacity={0.1} />
                <Stop offset="0.4" stopColor="rgb(190,224,255)" stopOpacity={0.05} />
                <Stop offset="0.7" stopColor="rgb(255,192,234)" stopOpacity={0.035} />
                <Stop offset="1" stopColor="rgb(130,182,255)" stopOpacity={0.016} />
              </RadialGradient>
              <SvgLinear id="ubRimV" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="rgb(255,138,218)" stopOpacity={0.32} />
                <Stop offset="0.35" stopColor="rgb(255,138,218)" stopOpacity={0} />
                <Stop offset="0.65" stopColor="rgb(72,178,255)" stopOpacity={0} />
                <Stop offset="1" stopColor="rgb(72,178,255)" stopOpacity={0.32} />
              </SvgLinear>
              <SvgLinear id="ubRimH" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor="rgb(255,112,198)" stopOpacity={0.18} />
                <Stop offset="0.35" stopColor="rgb(255,112,198)" stopOpacity={0} />
                <Stop offset="0.65" stopColor="rgb(128,210,255)" stopOpacity={0} />
                <Stop offset="1" stopColor="rgb(128,210,255)" stopOpacity={0.18} />
              </SvgLinear>
            </Defs>
            <Circle cx={r} cy={r} r={r - 0.5} fill="url(#ubFill)" />
            <Circle cx={r} cy={r} r={r - 2.5} fill="none" stroke="url(#ubRimV)" strokeWidth={4} />
            <Circle cx={r} cy={r} r={r - 2.5} fill="none" stroke="url(#ubRimH)" strokeWidth={3} />
            <Circle cx={r} cy={r} r={r - 0.5} fill="none" stroke="rgba(232,240,255,0.07)" strokeWidth={1} />
          </Svg>
          <View style={styles.center}>
            {kind === 'crit' ? (
              <Image source={CRIT_AVATAR} style={{ width: inner, height: inner, borderRadius: inner / 2, opacity: 0.98 }} />
            ) : (
              <LinearGradient
                colors={['#888888', '#444444']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.userAv, { width: inner, height: inner, borderRadius: inner / 2 }]}
              >
                <PersonFilled size={inner * 0.56} />
              </LinearGradient>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
  center: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  userAv: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', opacity: 0.98 },
  selectedGlow: {
    shadowColor: '#67E8F9',
    shadowOpacity: 0.34,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
});
