import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, GLOW_PERIOD_MS } from '../theme';

/**
 * CritMe message bar: a rounded bar with a small pointer tail, same as the HTML demo.
 *
 * Sizing follows WhatsApp: the bar hugs its text, so one word gives a small bar
 * and longer text grows wider, then wraps. A minimum width (64) and padding
 * that's wider than it is tall (16 × 7–8) keep a single short word from
 * collapsing into a circle.
 */

const RADIUS = 20;
const TAIL = 11; // side of the rotated square that forms the pointer
const TAIL_INSET = 16; // distance from the bar's left/right edge

type Props = {
  text: string;
  /** Pulsing cyan↔purple outline and glow. */
  glow?: boolean;
  /** Which bottom corner the pointer sits near. */
  tail?: 'left' | 'right' | 'none';
  variant?: 'message' | 'take';
  onPress?: () => void;
  /** Re-run the pop-in animation whenever this changes. */
  popKey?: string | number;
  style?: StyleProp<ViewStyle>;
};

export function MessageBubble({
  text,
  glow = true,
  tail = 'left',
  variant = 'message',
  onPress,
  popKey,
  style,
}: Props) {
  const pulse = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!glow) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: GLOW_PERIOD_MS / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: GLOW_PERIOD_MS / 2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glow, pulse]);

  useEffect(() => {
    if (popKey === undefined) return;
    pop.setValue(0.86);
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 160, useNativeDriver: true }).start();
  }, [popKey, pop]);

  const isTake = variant === 'take';
  const Container = onPress ? Pressable : View;
  const tailPos: ViewStyle | null =
    tail === 'none' ? null : tail === 'left' ? { left: TAIL_INSET } : { right: TAIL_INSET };

  return (
    <Animated.View style={[{ transform: [{ scale: pop }] }, style]}>
      <Container
        onPress={onPress}
        style={[styles.body, isTake ? styles.takeBody : styles.messageBody]}
        accessibilityRole={onPress ? 'button' : 'text'}
      >
        {tailPos ? <View style={[styles.tail, tailPos]} pointerEvents="none" /> : null}
        {glow ? (
          <>
            {/* Two outline rings, cyan and purple, cross-fading on the native driver. */}
            <Animated.View
              pointerEvents="none"
              style={[styles.ring, styles.ringCyan, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}
            />
            <Animated.View pointerEvents="none" style={[styles.ring, styles.ringPurple, { opacity: pulse }]} />
          </>
        ) : null}
        <Text style={[styles.text, isTake ? styles.takeText : styles.messageText]}>{text}</Text>
      </Container>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  body: {
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bubble,
    borderRadius: RADIUS,
    borderWidth: 1,
    borderColor: colors.bubbleBorder,
    boxShadow: '0 6px 20px rgba(0,0,0,0.28)',
  },
  messageBody: {
    minWidth: 64,
    paddingHorizontal: 16,
    paddingTop: 7,
    paddingBottom: 8,
  },
  takeBody: {
    minWidth: 120,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'flex-start',
  },
  tail: {
    position: 'absolute',
    bottom: -5,
    width: TAIL,
    height: TAIL,
    backgroundColor: colors.bubble,
    transform: [{ rotate: '45deg' }],
  },
  ring: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: RADIUS,
    borderWidth: 1.5,
  },
  ringCyan: {
    borderColor: 'rgba(103,232,249,0.35)',
    boxShadow: '0 0 6px rgba(103,232,249,0.12)',
  },
  ringPurple: {
    borderColor: 'rgba(168,85,247,0.85)',
    boxShadow: '0 0 16px rgba(168,85,247,0.38), 0 0 30px rgba(103,232,249,0.16)',
  },
  text: { color: colors.text },
  messageText: { fontSize: 16, lineHeight: 21 },
  takeText: { fontSize: 15, lineHeight: 22 },
});
