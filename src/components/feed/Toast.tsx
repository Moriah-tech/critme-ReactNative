import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { fonts } from '../../theme';

/** Pill toast from Demo13 ("Posted to Explore"): dark fill, teal outline, fades in and out. */
export function Toast({ message, top, onDone }: { message: string | null; top: number; onDone: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!message) return;
    opacity.setValue(0);
    const a = Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]);
    a.start(({ finished }) => finished && onDone());
    return () => a.stop();
  }, [message, opacity, onDone]);
  if (!message) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.toast, { top, opacity }]} accessibilityLiveRegion="polite">
      <Animated.Text style={styles.text}>{message}</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 100,
    backgroundColor: 'rgba(20,22,26,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(94,234,212,0.5)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  text: { color: '#fff', fontFamily: fonts.interSemiBold, fontSize: 13, lineHeight: 13 },
});
