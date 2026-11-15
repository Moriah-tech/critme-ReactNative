import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

/** The glossy bubble the creator taps to start writing. */
export function Orb({ size = 36, onPress }: { size?: number; onPress?: () => void }) {
  const breathe = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breathe]);
  const scale = breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
  const r = size / 2;
  return (
    <Pressable onPress={onPress} hitSlop={14} accessibilityRole="button" accessibilityLabel="Write a message">
      <Animated.View style={{ transform: [{ scale }] }}>
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="orbBody" cx="40%" cy="35%" r="70%">
              <Stop offset="0" stopColor="#4A4A55" />
              <Stop offset="0.55" stopColor="#1B1B22" />
              <Stop offset="1" stopColor="#0B0B0F" />
            </RadialGradient>
            <RadialGradient id="orbShine" cx="35%" cy="28%" r="30%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.75" />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={r} cy={r} r={r - 1} fill="url(#orbBody)" stroke="rgba(168,85,247,0.45)" strokeWidth={1} />
          <Circle cx={r} cy={r} r={r - 1} fill="url(#orbShine)" />
        </Svg>
      </Animated.View>
    </Pressable>
  );
}
