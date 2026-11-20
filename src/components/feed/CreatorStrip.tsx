import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnalyticsIcon, BookmarkIcon, CommentIcon, FollowPlus, PersonGlyph, ShareIcon } from '../icons';
import { fonts } from '../../theme';

/**
 * Creator row above the progress bar: 36 px grey avatar with a white follow
 * badge, the creator's name (Space Grotesk 13/700), and four stats on the
 * right (16 px icon, 10.5 px count, 10 px apart). The comments stat opens the
 * comment sheet.
 */
export function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k';
  return String(n);
}

type Props = {
  name: string;
  bottom: number;
  stats: { comments: number; saves: number; views: number; shares: number };
  onOpenComments: () => void;
};

function Stat({ icon, value, onPress, label }: { icon: React.ReactNode; value: number; onPress?: () => void; label: string }) {
  const content = (
    <>
      {icon}
      <Text style={styles.statText}>{formatCount(value)}</Text>
    </>
  );
  if (!onPress) {
    return (
      <View style={styles.stat} accessibilityLabel={`${label} ${value}`}>
        {content}
      </View>
    );
  }
  return (
    <Pressable onPress={onPress} hitSlop={10} style={styles.stat} accessibilityRole="button" accessibilityLabel={`${label} ${value}`}>
      {content}
    </Pressable>
  );
}

export function CreatorStrip({ name, bottom, stats, onOpenComments }: Props) {
  return (
    <View style={[styles.strip, { bottom }]} pointerEvents="box-none">
      <View style={styles.avatarWrap}>
        <LinearGradient colors={['#888', '#444']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
          <PersonGlyph size={20} />
        </LinearGradient>
        <View style={styles.badge}>
          <FollowPlus size={7} />
        </View>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <View style={styles.stats}>
        <Stat label="Comments" icon={<CommentIcon />} value={stats.comments} onPress={onOpenComments} />
        <Stat label="Saves" icon={<BookmarkIcon />} value={stats.saves} />
        <Stat label="Views" icon={<AnalyticsIcon />} value={stats.views} />
        <Stat label="Shares" icon={<ShareIcon />} value={stats.shares} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 35,
  },
  avatarWrap: { width: 36, height: 36 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    left: 24,
    top: -3,
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { marginLeft: 8, flexShrink: 1, fontFamily: fonts.groteskBold, fontSize: 13, lineHeight: 14.3, color: '#fff' },
  stats: { marginLeft: 'auto', marginRight: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 16 },
  statText: { fontFamily: fonts.interMedium, fontSize: 10.5, color: 'rgba(255,255,255,0.75)' },
});
