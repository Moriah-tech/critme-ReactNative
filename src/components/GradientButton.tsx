import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { brightGradient, mutedGradient } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  /** "bright" = Initialize, "muted" = Upload. Both have the same shape. */
  tone?: 'bright' | 'muted';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Initialize and Upload share one shape: 12px radius, 10×22 padding, 15px bold label. */
export function GradientButton({ label, onPress, tone = 'bright', loading, disabled, style }: Props) {
  const g = tone === 'bright' ? brightGradient : mutedGradient;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.wrap, tone === 'bright' && styles.softGlow, pressed && styles.pressed, style]}
    >
      <LinearGradient
        colors={g.colors}
        locations={g.locations}
        start={{ x: 0, y: 0.2 }}
        end={{ x: 1, y: 0.8 }}
        style={styles.fill}
      >
        {loading ? (
          <ActivityIndicator color="#FAFAFA" size="small" />
        ) : (
          <Text style={[styles.label, tone === 'muted' && styles.mutedLabel]}>{label}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 12 },
  softGlow: { boxShadow: '0 2px 6px rgba(168,85,247,0.16)' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  fill: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 39,
  },
  label: { color: '#FAFAFA', fontSize: 15, fontWeight: '700' },
  mutedLabel: { color: 'rgba(250,250,250,0.92)' },
});
