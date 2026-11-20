import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Backdrop } from './Backdrop';
import { PersonOutline } from './icons';
import { CRIT_AVATAR } from '../data/updatesData';
import { colors, fonts } from '../theme';

/**
 * Message bar shown inside an Updates post when a bubble is tapped (Demo13
 * "cm37-shared-update-msg"). Glass (rgba 30,30,35,.62 + 28 px blur), radius 18,
 * 150–240 px wide (never wider than the media minus 20 px).
 *
 *  - Crit bubble: Crit's portrait on the left, grey "Crit", the take beside it.
 *  - Poster bubble: dark avatar top-left with the poster's name next to it,
 *    the message underneath.
 *
 * Placed above the bubble when there is room (bubble top ≥ bar height + 14),
 * otherwise below, 6 px from the bubble, kept 10 px inside the media; the
 * pointer sits over the bubble's centre. Tapping the bar toggles it between
 * that position and the centre of the media (no pointer when centred).
 */
const PAD = 10;
const GAP = 6;

export function UpdateMessageBar({ variant, name, text, anchor, box, centered, onPress }) {
  const [size, setSize] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (size) Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [size, opacity]);

  const maxW = Math.min(240, box.width - PAD * 2);
  const maxH = Math.min(180, box.height - PAD * 2);

  let left = PAD;
  let top = PAD;
  let pointer = null;
  if (size) {
    const bw = Math.min(size.w, maxW);
    const bh = Math.min(size.h, maxH);
    if (centered) {
      left = (box.width - bw) / 2;
      top = (box.height - bh) / 2;
    } else {
      const scaled = anchor.size * 1.06;
      const bTop = anchor.y - (scaled - anchor.size) / 2;
      const bBottom = bTop + scaled;
      const bx = anchor.x + anchor.size / 2;
      const above = bTop >= bh + GAP + 8;
      top = above ? bTop - bh - GAP : bBottom + GAP;
      left = bx - bw / 2;
      pointer = { side: above ? 'bottom' : 'top', x: 0, bx };
    }
    left = Math.max(PAD, Math.min(left, box.width - PAD - bw));
    top = Math.max(PAD, Math.min(top, box.height - PAD - bh));
    if (pointer) pointer.x = Math.max(12, Math.min(pointer.bx - left, bw - 12));
  }

  const isCrit = variant === 'crit';

  return (
    <Animated.View
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (!size || Math.abs(size.w - width) > 0.5 || Math.abs(size.h - height) > 0.5) setSize({ w: width, h: height });
      }}
      style={[
        styles.bar,
        isCrit ? styles.critPad : styles.creatorPad,
        { left, top, maxWidth: maxW, minWidth: Math.min(150, maxW), maxHeight: maxH, opacity: size ? opacity : 0 },
      ]}
    >
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.glass]}>
        <Backdrop blur={28} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.glassFill }]} />
      </View>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={centered ? 'Move message back' : 'Centre message'}>
        {isCrit ? (
          <View style={styles.critRow}>
            <Image source={CRIT_AVATAR} style={styles.avatar} />
            <View style={styles.critBody}>
              <Text style={[styles.name, styles.critName]}>{name}</Text>
              <Text style={styles.text}>{text}</Text>
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.creatorHead}>
              <View style={[styles.avatar, styles.creatorAvatar]}>
                <PersonOutline size={16} />
              </View>
              <Text style={[styles.name, styles.creatorName]} numberOfLines={1}>
                {name}
              </Text>
            </View>
            <Text style={styles.text}>{text}</Text>
          </View>
        )}
      </Pressable>
      {pointer && !centered && (
        <View
          pointerEvents="none"
          style={[styles.pointer, { left: pointer.x - 5.5 }, pointer.side === 'bottom' ? styles.pointerBottom : styles.pointerTop]}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    zIndex: 130,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  glass: { borderRadius: 17, overflow: 'hidden' },
  creatorPad: { paddingTop: 7, paddingRight: 12, paddingBottom: 12, paddingLeft: 12 },
  critPad: { paddingTop: 7, paddingRight: 7, paddingBottom: 8, paddingLeft: 4 },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: '#1A2230',
  },
  creatorAvatar: { alignItems: 'center', justifyContent: 'center' },
  creatorHead: { flexDirection: 'row', alignItems: 'center', minHeight: 28, marginBottom: 6 },
  name: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.nameGrey, letterSpacing: 0.1 },
  creatorName: { marginLeft: 8, transform: [{ translateY: 3 }], flexShrink: 1 },
  critRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 3 },
  critBody: { flexShrink: 1 },
  critName: { marginBottom: 3, transform: [{ translateY: 1.5 }] },
  text: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 17.25, color: 'rgba(250,250,250,0.88)' },
  pointer: {
    position: 'absolute',
    width: 11,
    height: 11,
    backgroundColor: colors.glassFill,
    borderColor: colors.glassBorder,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    transform: [{ rotate: '45deg' }],
  },
  pointerBottom: { bottom: -6 },
  pointerTop: { top: -6, transform: [{ rotate: '225deg' }] },
});
