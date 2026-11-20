import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFrame } from '../../layout';
import { fonts } from '../../theme';

/**
 * The + menu from Demo13: "Update" on top, "Explore" and "Story" side by side
 * underneath, 110 px above the bottom of the phone (just above the nav).
 * Buttons are 108 × 44, radius 12, dark glass with a light border, Space
 * Grotesk 16/600. Opening pops each button in from scale 0.55 / 28 px lower
 * with a springy curve, staggered 20 / 70 / 120 ms; closing drops them back
 * quickly. Tapping anywhere outside closes the menu.
 */
export type CreateChoice = 'update' | 'explore' | 'story';

type Props = { open: boolean; onClose: () => void; onChoose: (choice: CreateChoice) => void };

const SPRING = Easing.bezier(0.34, 1.56, 0.64, 1);

function MenuButton({ label, open, delay, onPress }: { label: string; open: boolean; delay: number; onPress: () => void }) {
  const v = useRef(new Animated.Value(0)).current; // 0 closed → 1 open (transform)
  const o = useRef(new Animated.Value(0)).current; // opacity
  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(o, { toValue: 1, duration: 320, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(v, { toValue: 1, duration: 480, delay, easing: SPRING, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(o, { toValue: 0, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 220, easing: Easing.bezier(0.4, 0, 0.2, 1), useNativeDriver: true }),
      ]).start();
    }
  }, [open, delay, o, v]);

  return (
    <Animated.View
      style={{
        opacity: o,
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [open ? 28 : 22, 0] }) },
          { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }) },
        ],
      }}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
      >
        <Text style={styles.label}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

export function CreateMenu({ open, onClose, onChoose }: Props) {
  const frame = useFrame();
  const [mounted, setMounted] = useState(open);
  useEffect(() => {
    if (open) setMounted(true);
    else {
      const t = setTimeout(() => setMounted(false), 240);
      return () => clearTimeout(t);
    }
  }, [open]);
  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={open ? 'box-none' : 'none'}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close menu" />
      <View style={[styles.menu, { bottom: frame.bottom(110) }]} pointerEvents="box-none">
        <MenuButton label="Update" open={open} delay={20} onPress={() => onChoose('update')} />
        <View style={styles.row} pointerEvents="box-none">
          <MenuButton label="Explore" open={open} delay={70} onPress={() => onChoose('explore')} />
          <MenuButton label="Story" open={open} delay={120} onPress={() => onChoose('story')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  menu: { position: 'absolute', left: 0, right: 0, alignItems: 'center', gap: 14 },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 28 },
  btn: {
    minWidth: 108,
    height: 44,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: 'rgba(40,40,48,0.92)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  btnPressed: { backgroundColor: 'rgba(30,30,38,0.98)', transform: [{ scale: 0.96 }] },
  label: { fontFamily: fonts.groteskSemiBold, fontSize: 16, color: '#FAFAFA' },
});
