import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PersonGlyph } from '../icons';
import { feed, fonts } from '../../theme';
import type { BubbleRect } from './FloatingBubbles';
import { Backdrop } from '../Glass';

/**
 * The message bar that opens from a feed bubble (Demo13 "Bubble Focus").
 *
 * Two looks, both 150–240 px wide and hugging their text:
 *  - creator: glass (rgba 30,30,35,.62), radius 18, avatar top-left with the
 *    first name beside it, text full width underneath;
 *  - crit: dark (rgba 16,18,26,.92), radius 16, Crit's portrait on the left,
 *    grey "Crit" name and the take beside it.
 *
 * Placement follows the demo: above the bubble when there is room
 * (bubble top > bar height + 48), otherwise below; 10 px from the screen edges;
 * the pointer sits over the bubble's centre. Long text scrolls inside the bar
 * (max 260 px). In reply mode the bar is centred above the reply field instead
 * and loses its pointer.
 */

const crit = require('../../../assets/crit.png');
const MAX_W = 240;
const MIN_W = 150;

type Props = {
  variant: 'creator' | 'crit';
  name: string;
  text: string;
  anchor: BubbleRect;
  screen: { width: number; height: number; topLimit: number };
  /** When set, the bar is centred and its bottom sits at this y (reply mode). */
  replyBottom?: number | null;
  onPress: () => void;
};

export function BubbleMessageBar({ variant, name, text, anchor, screen, replyBottom, onPress }: Props) {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (!size) return;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [size, opacity, scale]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (!size || Math.abs(size.w - width) > 0.5 || Math.abs(size.h - height) > 0.5) setSize({ w: width, h: height });
  };

  const maxInner = Math.min(260, screen.height * 0.4);
  const replying = replyBottom != null;

  let left = 0;
  let top = 0;
  let pointer: { x: number; side: 'top' | 'bottom' } | null = null;
  let maxHeight: number | undefined;
  if (size) {
    if (replying) {
      left = (screen.width - size.w) / 2;
      const room = replyBottom! - screen.topLimit;
      maxHeight = Math.max(80, room - 40);
      top = replyBottom! - Math.min(size.h, maxHeight);
    } else {
      const bubbleTop = anchor.y;
      const bubbleBottom = anchor.y + anchor.size;
      const bcx = anchor.x + anchor.size / 2;
      const above = bubbleTop > size.h + 48;
      top = above ? bubbleTop - size.h - 8 : bubbleBottom + 8;
      top = Math.max(screen.topLimit, Math.min(top, screen.height - 90 - size.h));
      left = Math.max(10, Math.min(bcx - size.w / 2, screen.width - size.w - 10));
      pointer = { x: Math.max(14, Math.min(bcx - left, size.w - 14)), side: above ? 'bottom' : 'top' };
    }
  }

  const isCrit = variant === 'crit';
  const fill = isCrit ? feed.critBarFill : feed.glassFill;

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        styles.bar,
        isCrit ? styles.critBar : styles.creatorBar,
        { left, top, opacity: size ? opacity : 0, transform: [{ scale }], maxHeight },
      ]}
    >
      {/* Blur (28 px creator / 14 px Crit, as in the demo) under the bar's fill */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: isCrit ? 15 : 17, overflow: 'hidden' }]}>
        <Backdrop blur={isCrit ? 14 : 28} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: fill }]} />
      </View>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Reply to ${name}`}>
        <ScrollView
          style={{ maxHeight: maxHeight ? maxHeight - 20 : maxInner }}
          showsVerticalScrollIndicator={false}
          bounces={false}
          nestedScrollEnabled
        >
          {isCrit ? (
            <View style={styles.critRow}>
              <Image source={crit} style={styles.critAvatar} />
              <View style={styles.critBody}>
                <Text style={styles.critName}>{name}</Text>
                <Text style={styles.critText}>{text}</Text>
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.creatorHead}>
                <LinearGradient colors={['#888', '#444']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.creatorAvatar}>
                  <PersonGlyph size={15} />
                </LinearGradient>
                <Text style={styles.creatorName}>{name}</Text>
              </View>
              <Text style={styles.creatorText}>{text}</Text>
            </View>
          )}
        </ScrollView>
      </Pressable>
      {pointer && (
        <View
          pointerEvents="none"
          style={[
            styles.pointer,
            { backgroundColor: fill, left: pointer.x - 5.5 },
            pointer.side === 'bottom' ? styles.pointerBottom : styles.pointerTop,
          ]}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    maxWidth: MAX_W,
    minWidth: MIN_W,
    zIndex: 70,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  creatorBar: {
    paddingTop: 10,
    paddingRight: 14,
    paddingBottom: 12,
    paddingLeft: 12,
    borderRadius: 18,
    borderColor: feed.glassBorder,
    shadowOpacity: 0.35,
    shadowRadius: 32,
  },
  critBar: {
    paddingTop: 7,
    paddingRight: 7,
    paddingBottom: 8,
    paddingLeft: 4,
    borderRadius: 16,
    borderColor: feed.critBarBorder,
    shadowOpacity: 0.5,
    shadowRadius: 36,
  },
  creatorHead: { flexDirection: 'row', alignItems: 'center', minHeight: 28, marginBottom: 6 },
  creatorAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  creatorName: { fontFamily: fonts.interSemiBold, fontSize: 12, color: 'rgba(250,250,250,0.95)', letterSpacing: 0.1 },
  creatorText: { fontFamily: fonts.inter, fontSize: 12.5, lineHeight: 17.25, color: 'rgba(250,250,250,0.88)' },
  critRow: { flexDirection: 'row', alignItems: 'flex-start' },
  critAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: '#1a2230',
  },
  critBody: { flexShrink: 1 },
  critName: {
    fontFamily: fonts.interSemiBold,
    fontSize: 12,
    color: feed.nameGrey,
    marginBottom: 3,
    letterSpacing: 0.1,
    transform: [{ translateY: 1.5 }],
  },
  critText: { fontFamily: fonts.inter, fontSize: 12.5, lineHeight: 17.5, color: 'rgba(250,250,250,0.88)' },
  pointer: {
    position: 'absolute',
    width: 11,
    height: 11,
    borderColor: feed.glassBorder,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    transform: [{ rotate: '45deg' }],
  },
  pointerBottom: { bottom: -6 },
  pointerTop: { top: -6, transform: [{ rotate: '225deg' }] },
});
