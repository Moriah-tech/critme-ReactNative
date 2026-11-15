import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, dotGradient } from '../theme';

type Props = { count: number; index: number; onSelect?: (i: number) => void };

/** Low-contrast dots. The active one stretches into a faded gradient pill. */
export function PagerDots({ count, index, onSelect }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, i) => (
        <Dot key={i} active={i === index} onPress={onSelect ? () => onSelect(i) : undefined} />
      ))}
    </View>
  );
}

function Dot({ active, onPress }: { active: boolean; onPress?: () => void }) {
  const w = useRef(new Animated.Value(active ? 24 : 8)).current;
  useEffect(() => {
    Animated.spring(w, { toValue: active ? 24 : 8, friction: 8, tension: 120, useNativeDriver: false }).start();
  }, [active, w]);
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button">
      <Animated.View style={[styles.dot, { width: w }]}>
        {active ? (
          <LinearGradient
            colors={dotGradient.colors}
            locations={dotGradient.locations}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 22 },
  dot: { height: 8, borderRadius: 999, overflow: 'hidden', backgroundColor: colors.dot },
});
