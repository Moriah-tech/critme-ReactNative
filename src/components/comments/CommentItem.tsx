import React, { useEffect, useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PersonGlyph, SparkStar } from '../icons';
import { feed, fonts } from '../../theme';
import type { FeedComment } from '../../feed/types';

/**
 * One comment row (Demo13 sheet): 36 px avatar, name (Space Grotesk 13/600),
 * text (Inter 13 / 18.85, 78 % white), optional "View N more replies" row,
 * a wedge + mini bubble showing which bubble it answers (empty glass = the
 * creator, Crit's portrait = Crit), and a star on the right that lights up in
 * the Crit Meter gradient. New comments flash teal for 2.4 s.
 */
const crit = require('../../../assets/crit.png');

type Props = {
  comment: FeedComment;
  isNew: boolean;
  onToggleStar: () => void;
};

export function CommentItem({ comment, isNew, onToggleStar }: Props) {
  const flash = useRef(new Animated.Value(isNew ? 1 : 0)).current;
  const starScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isNew) return;
    flash.setValue(1);
    Animated.timing(flash, { toValue: 0, duration: 2400, useNativeDriver: false }).start();
  }, [isNew, flash]);

  const toggle = () => {
    Animated.sequence([
      Animated.timing(starScale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(starScale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 8 }),
    ]).start();
    onToggleStar();
  };

  const toCrit = comment.replyTo === 'crit';

  return (
    <Animated.View
      style={[
        styles.item,
        { backgroundColor: flash.interpolate({ inputRange: [0, 1], outputRange: ['rgba(94,234,212,0)', 'rgba(94,234,212,0.22)'] }) },
      ]}
    >
      {comment.isCrit ? (
        <Image source={crit} style={styles.avatar} />
      ) : (
        <LinearGradient colors={['#3a3a45', '#1e1e26']} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={styles.avatar}>
          {/* Demo13 draws the silhouette with two shapes: head 12 px at 8 px, shoulders 18 × 10 px 5 px from the bottom */}
          <View style={styles.head} />
          <View style={styles.shoulders} />
        </LinearGradient>
      )}
      <View style={styles.body}>
        <Text style={[styles.name, comment.isCrit && { color: feed.teal }]} numberOfLines={1}>
          {comment.authorName}
        </Text>
        <Text style={styles.text}>{comment.text}</Text>
        {comment.replyCount > 0 && (
          // Demo13 shows this row but opens nothing yet; it stays a label until the thread view is designed.
          <View style={styles.replies}>
            <View style={styles.repliesLine} />
            <Text style={styles.repliesText}>
              View {comment.replyCount} more repl{comment.replyCount === 1 ? 'y' : 'ies'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.badge} pointerEvents="none" accessibilityLabel={toCrit ? "Replying to Crit's take" : "Replying to the creator's bubble"}>
        <View style={styles.wedge} />
        {toCrit ? (
          <View style={[styles.mini, styles.miniLogo]}>
            <Image source={crit} style={styles.miniImg} />
          </View>
        ) : (
          <View style={[styles.mini, styles.miniCenter]}>
            <LinearGradient colors={['#888', '#444']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.miniUser}>
              <PersonGlyph size={9} />
            </LinearGradient>
          </View>
        )}
      </View>

      <Pressable
        onPress={toggle}
        style={styles.star}
        accessibilityRole="button"
        accessibilityLabel={comment.starred ? 'Remove star' : 'Star comment'}
        accessibilityState={{ selected: comment.starred }}
      >
        <Animated.View style={{ transform: [{ scale: starScale }] }}>
          <SparkStar size={22} lit={comment.starred} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', paddingVertical: 12, position: 'relative', borderRadius: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  head: { position: 'absolute', top: 8, width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.18)' },
  shoulders: {
    position: 'absolute',
    bottom: 5,
    width: 18,
    height: 10,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  body: { marginLeft: 10, width: 264, flexShrink: 1 },
  name: { fontFamily: fonts.groteskSemiBold, fontSize: 13, lineHeight: 15, color: '#fafafa', marginBottom: 3, paddingRight: 34 },
  text: { fontFamily: fonts.inter, fontSize: 13, lineHeight: 18.85, color: 'rgba(255,255,255,0.78)' },
  replies: { flexDirection: 'row', alignItems: 'center', marginTop: 6, height: 15 },
  repliesLine: { width: 22, height: 1, backgroundColor: 'rgba(255,255,255,0.28)' },
  repliesText: { marginLeft: 8, fontFamily: fonts.interMedium, fontSize: 12, color: 'rgba(255,255,255,0.45)' },
  badge: { position: 'absolute', top: 14, right: 38, height: 22, flexDirection: 'row', alignItems: 'center' },
  wedge: {
    width: 11,
    height: 15.4,
    borderWidth: 1.6,
    borderRightWidth: 0,
    borderColor: 'rgba(255,255,255,0.45)',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    marginRight: -2,
  },
  mini: {
    width: 19.8,
    height: 19.8,
    borderRadius: 9.9,
    borderWidth: 1.4,
    borderColor: 'rgba(232,240,255,0.38)',
    backgroundColor: 'rgba(210,225,255,0.16)',
  },
  miniCenter: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  miniUser: { width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  miniLogo: { borderWidth: 1.3, borderColor: 'rgba(232,240,255,0.35)', overflow: 'hidden' },
  miniImg: { width: '100%', height: '100%', borderRadius: 9.9, opacity: 0.9 },
  star: { position: 'absolute', right: 0, top: 14, width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
});
