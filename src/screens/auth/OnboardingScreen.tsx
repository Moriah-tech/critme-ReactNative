import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useFrame } from '../../layout';
import { fonts } from '../../theme';
import { AuthBackground, AuthButton, auth } from '../../components/auth/AuthParts';

/**
 * 1.1 Onboarding (slide 1). Logo, headline, pager dots and Next, centred as a
 * single column, with four slowly floating ambient bubbles behind.
 *
 * The reference file contains only slide 1 (its "Build, Validate and Grow"
 * slide is an empty comment), so the second dot is shown but there is no
 * second slide yet. Next goes to Create Account.
 */
const logo = require('../../../assets/auth/onboarding-logo.png');

type Props = { onNext: () => void };

/** floatSlow: 8 s ease-in-out loop, up 14 px and back. `delay` mirrors the CSS negative animation-delay. */
function useFloat(delaySec: number) {
  const v = useRef(new Animated.Value(((-delaySec) % 8) / 4)).current;
  useEffect(() => {
    const phase = (-delaySec) % 8; // seconds into the 8 s cycle
    const half = 4000;
    const leg = (to: number, ms: number) =>
      Animated.timing(v, { toValue: to, duration: ms, easing: Easing.inOut(Easing.ease), useNativeDriver: true });
    const cycle = Animated.loop(Animated.sequence([leg(1, half), leg(0, half)]));
    const first = phase < 4 ? Animated.sequence([leg(1, (1 - phase / 4) * half), leg(0, half), cycle]) : Animated.sequence([leg(0, (1 - (phase - 4) / 4) * half), cycle]);
    v.setValue(phase < 4 ? phase / 4 : 1 - (phase - 4) / 4);
    first.start();
    return () => v.stopAnimation();
  }, [delaySec, v]);
  return v.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
}

function Bubble({ size, delay, style }: { size: number; delay: number; style: object }) {
  const y = useFloat(delay);
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.bubble, { width: size, height: size, borderRadius: size / 2, transform: [{ translateY: y }] }, style]}
    />
  );
}

export function OnboardingScreen({ onNext }: Props) {
  const frame = useFrame();
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <AuthBackground />

      <Bubble size={30} delay={0} style={{ top: frame.top(100), left: 40 }} />
      <Bubble size={20} delay={-2.5} style={{ top: frame.top(150), right: 50 }} />
      <Bubble size={24} delay={-4} style={{ bottom: frame.bottom(260), left: 56 }} />
      <Bubble size={16} delay={-1.2} style={{ bottom: frame.bottom(300), right: 44 }} />

      <View style={styles.stack} pointerEvents="none">
        <View style={styles.logo}>
          <Image source={logo} style={styles.logoImg} accessibilityLabel="CritMe" />
        </View>
        <Text style={styles.headline}>
          Explore <Text style={styles.sep}> · </Text> Engage <Text style={styles.sep}> · </Text> Evolve{'\n'}
          <Text style={styles.accent}>beyond the obvious</Text>
        </Text>
        <View style={styles.dots}>
          <LinearGradient colors={['#2A9BAF', '#9B4FA8']} start={{ x: 0, y: 0.2 }} end={{ x: 1, y: 0.8 }} style={styles.dotActive} />
          <View style={styles.dot} />
        </View>
      </View>

      <View style={[styles.next, { bottom: frame.bottom(44) }]}>
        <AuthButton label="Next" onPress={onNext} grotesk />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: auth.bg },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(100,150,170,0.06)',
    boxShadow: 'inset 0 1.5px 4px rgba(34,211,238,0.06), inset 0 -1.5px 4px rgba(150,80,180,0.04), 0 0 8px rgba(0,0,0,0.1)',
  },
  stack: { ...StyleSheet.absoluteFill as object, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 44 },
  logo: {
    width: 112,
    height: 112,
    borderRadius: 56,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(100,150,170,0.15)',
    boxShadow: '0 0 0 6px rgba(34,211,238,0.025), 0 0 30px rgba(150,80,180,0.05), 0 0 50px rgba(0,0,0,0.4), 0 14px 40px rgba(0,0,0,0.6)',
  },
  logoImg: { width: '100%', height: '100%' },
  headline: {
    marginTop: 28,
    fontFamily: fonts.groteskBold,
    fontSize: 19,
    lineHeight: 29.5,
    color: auth.text,
    textAlign: 'center',
  },
  sep: { color: 'rgba(161,161,170,0.4)' },
  accent: { color: '#67A8B8', fontStyle: 'italic' },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 36 },
  dotActive: { width: 20, height: 7, borderRadius: 4, boxShadow: '0 0 6px rgba(42,155,175,0.18)' },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: 'rgba(255,255,255,0.15)' },
  next: { position: 'absolute', left: 24, right: 24 },
});
