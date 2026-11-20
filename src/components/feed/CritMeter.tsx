import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { fonts, meterGradient } from '../../theme';

/**
 * Crit Meter from Demo13: the left half of a 116 × 120 dial (centre 58,60,
 * radius 50) pinned to the right edge of the screen. Score 5 is at the top,
 * 3 at the left, 1 at the bottom. A brighter arc fills from 1 up to the
 * current score with a breathing glow; the needle eases to the score.
 *
 * Double-tapping the video calls pop(): the meter scales from its right edge
 * (1 → 1.32 → 0.94 → 1 over 620 ms), a ring expands and seven sparks fan out
 * to the left, and the needle jumps up before settling a little higher.
 */

const W = 37.2; // 44 px × 0.845, as rendered in the demo
const H = 77.7; // 92 px × 0.845
const L = (Math.PI * 50) / 2; // length of each quarter arc
const CX = 58;
const CY = 60;
const TIP = 34;

function needleTip(score: number) {
  const th = ((-90 - (5 - score) * 45) * Math.PI) / 180;
  return { x: CX + TIP * Math.cos(th), y: CY + TIP * Math.sin(th) };
}

function arcDash(score: number, from: number) {
  const frac = Math.max(0, Math.min(1, (score - from) / 2));
  const vis = frac * L;
  return { vis, dash: `${vis.toFixed(2)} ${(L * 2).toFixed(2)}`, offset: -(L - vis) };
}

export type CritMeterHandle = { pop: () => void };

type Props = {
  /** Score from the post (1–5). */
  score: number;
  /** Top of the meter in screen coordinates. */
  top: number;
  /** Pauses the needle animation loop when the screen is not visible. */
  active: boolean;
};

const SPARK_COLORS = ['#67E8F9', '#A855F7', '#D946EF', '#67E8F9', '#A855F7', '#D946EF', '#fff'];

export const CritMeter = forwardRef<CritMeterHandle, Props>(function CritMeter({ score, top, active }, ref) {
  const [shown, setShown] = useState(Math.max(1, score - 0.4));
  const value = useRef(shown);
  const target = useRef(score);
  const boost = useRef(0);
  const raf = useRef<number | null>(null);

  const glow = useRef(new Animated.Value(0)).current;
  const popScale = useRef(new Animated.Value(1)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const [sparks, setSparks] = useState<{ key: number; dx: number; dy: number; color: string }[]>([]);
  const sparkAnim = useRef(new Animated.Value(0)).current;

  // Ease the needle toward its target, the same 4.5 % per frame as the demo.
  const tick = useCallback(() => {
    const t = target.current;
    const v = value.current + (t - value.current) * 0.045;
    value.current = v;
    setShown(v);
    if (Math.abs(t - v) > 0.002) raf.current = requestAnimationFrame(tick);
    else raf.current = null;
  }, []);

  const kick = useCallback(() => {
    if (raf.current == null && active) raf.current = requestAnimationFrame(tick);
  }, [active, tick]);

  useEffect(() => {
    target.current = Math.min(4.9, score + boost.current);
    kick();
  }, [score, kick]);

  useEffect(() => {
    if (!active && raf.current != null) {
      cancelAnimationFrame(raf.current);
      raf.current = null;
    } else kick();
  }, [active, kick]);

  useEffect(() => () => { if (raf.current != null) cancelAnimationFrame(raf.current); }, []);

  // Breathing glow on the live arc (the demo animates a blur 1.2 → 2.8 → 1.2 over 2.4 s).
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    if (active) loop.start();
    return () => loop.stop();
  }, [active, glow]);

  useImperativeHandle(ref, () => ({
    pop() {
      popScale.setValue(1);
      Animated.sequence([
        Animated.timing(popScale, { toValue: 1.32, duration: 186, easing: Easing.bezier(0.2, 0.9, 0.3, 1.35), useNativeDriver: true }),
        Animated.timing(popScale, { toValue: 0.94, duration: 155, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(popScale, { toValue: 1, duration: 279, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
      ring.setValue(0);
      Animated.timing(ring, { toValue: 1, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
      setSparks(
        SPARK_COLORS.map((color, i) => {
          const ang = Math.PI * (0.55 + 0.9 * (i / 6));
          const r = 34 + Math.random() * 16;
          return { key: Date.now() + i, color, dx: Math.cos(ang) * r, dy: Math.sin(ang) * -r };
        }),
      );
      sparkAnim.setValue(0);
      Animated.timing(sparkAnim, { toValue: 1, duration: 750, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() =>
        setSparks([]),
      );
      // Jump up, then settle slightly above where it was (demo: target +0.35, base +0.15).
      boost.current = Math.min(boost.current + 0.15, 1);
      target.current = Math.min(4.9, Math.max(target.current, value.current) + 0.35);
      kick();
      setTimeout(() => {
        target.current = Math.min(4.9, score + boost.current);
        kick();
      }, 1500);
    },
  }));

  const s = Math.max(1, Math.min(5, shown));
  const tip = needleTip(s);
  const upper = arcDash(s, 3);
  const lower = arcDash(s, 1);

  const liveArcs = (strokeWidth: number) => (
    <>
      {lower.vis >= 0.5 && (
        <Path d="M 8 60 A 50 50 0 0 0 58 110" fill="none" stroke="url(#mLower)" strokeLinecap="round"
          strokeWidth={strokeWidth} strokeDasharray={lower.dash} strokeDashoffset={lower.offset} />
      )}
      {upper.vis >= 0.5 && (
        <Path d="M 58 10 A 50 50 0 0 0 8 60" fill="none" stroke="url(#mUpper)" strokeLinecap="round"
          strokeWidth={strokeWidth} strokeDasharray={upper.dash} strokeDashoffset={upper.offset} />
      )}
    </>
  );

  const defs = (
    <Defs>
      <LinearGradient id="mUpper" x1="58" y1="10" x2="8" y2="60" gradientUnits="userSpaceOnUse">
        <Stop offset="0" stopColor={meterGradient[0]} />
        <Stop offset="1" stopColor={meterGradient[1]} />
      </LinearGradient>
      <LinearGradient id="mLower" x1="8" y1="60" x2="58" y2="110" gradientUnits="userSpaceOnUse">
        <Stop offset="0" stopColor={meterGradient[1]} />
        <Stop offset="1" stopColor={meterGradient[2]} />
      </LinearGradient>
    </Defs>
  );

  const label = (x: number, y: number, t: string) => (
    <SvgText x={x} y={y} fill="rgba(255,255,255,0.82)" fontFamily={fonts.groteskBold} fontSize={8}>
      {t}
    </SvgText>
  );

  const ringCx = W - 6;
  const ringCy = H / 2;

  return (
    <View pointerEvents="none" style={[styles.wrap, { top }]} accessibilityLabel={`Crit Meter ${s.toFixed(1)} out of 5`}>
      <Animated.View style={[styles.dial, { transform: [{ scale: popScale }], transformOrigin: 'right top' }]}>
        {/* Glow layer: thicker copy of the live arc, breathing */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.42] }) }]}>
          <Svg width={W} height={H} viewBox="0 0 58 120">
            {defs}
            {liveArcs(11)}
          </Svg>
        </Animated.View>
        <Svg width={W} height={H} viewBox="0 0 58 120">
          {defs}
          <Path d="M 58 10 A 50 50 0 0 0 8 60" fill="none" opacity={0.52} stroke="url(#mUpper)" strokeLinecap="round" strokeWidth={7} />
          <Path d="M 8 60 A 50 50 0 0 0 58 110" fill="none" opacity={0.52} stroke="url(#mLower)" strokeLinecap="round" strokeWidth={7} />
          {liveArcs(7)}
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
          <Line x1={CX} y1={CY} x2={tip.x} y2={tip.y} stroke="#fff" strokeWidth={2.4} strokeLinecap="round" opacity={0.95} />
          <Circle cx={CX} cy={CY} r={4} fill="#fff" opacity={0.9} />
          <Circle cx={CX} cy={CY} r={2} fill="rgba(0,0,0,0.6)" />
        </Svg>
      </Animated.View>

      {/* Pop ring */}
      <Animated.View
        style={[
          styles.ring,
          {
            left: ringCx - 20,
            top: ringCy - 20,
            opacity: ring.interpolate({ inputRange: [0, 0.01, 1], outputRange: [0, 1, 0] }),
            transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.3, 2.6] }) }],
          },
        ]}
      />
      {sparks.map((sp) => (
        <Animated.View
          key={sp.key}
          style={[
            styles.spark,
            {
              left: ringCx - 3.5,
              top: ringCy - 3.5,
              backgroundColor: sp.color,
              shadowColor: sp.color,
              opacity: sparkAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
              transform: [
                { translateX: sparkAnim.interpolate({ inputRange: [0, 1], outputRange: [0, sp.dx] }) },
                { translateY: sparkAnim.interpolate({ inputRange: [0, 1], outputRange: [0, sp.dy] }) },
                { scale: sparkAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }) },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 0, width: W, height: H, zIndex: 30, overflow: 'visible' },
  dial: {
    width: W,
    height: H,
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  ring: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(168,85,247,0.9)',
    shadowColor: '#67E8F9',
    shadowOpacity: 0.7,
    shadowRadius: 12,
  },
  spark: { position: 'absolute', width: 7, height: 7, borderRadius: 3.5, shadowOpacity: 1, shadowRadius: 6 },
});
