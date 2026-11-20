import React, { memo, useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurTargetView } from 'expo-blur';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Backdrop, BlurTargetContext } from './Backdrop';
import { UpdateBubble } from './UpdateBubble';
import { UpdateCritMeter } from './UpdateCritMeter';
import { UpdateMessageBar } from './UpdateMessageBar';
import { AnalyticsIcon, CommentIcon, FollowPlus, PersonOutline, SaveIcon, ShareIcon } from './icons';
import { colors, fonts } from '../theme';

/**
 * One post in the Updates (Friends) feed — Demo13 "cm-upost".
 *
 * Head (36 px): avatar with a white follow badge, name (Space Grotesk 14/700),
 * time (Inter 11, grey). Media: full width, image or looping muted video
 * (cover), with the Crit Meter at the top right and the floating bubbles.
 * Stats row: four icon + count pairs, centred, 22 px apart.
 *
 * Focus (a bubble tapped): the media is blurred and darkened (10 px blur,
 * 32 % black), the other bubbles sink under that blur, the tapped bubble
 * pulses above it and its message bar opens. The meter, head and stats stay
 * sharp. Tapping anywhere else in the post closes it; tapping the bar toggles
 * it to the centre and back.
 */

function PostVideo({ source, playing }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
  });
  useEffect(() => {
    if (playing) player.play();
    else player.pause();
  }, [playing, player]);
  return <VideoView player={player} style={styles.fill} contentFit="cover" nativeControls={false} pointerEvents="none" />;
}

function Stat({ Icon, value, label }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label} ${value}`}>
      <Icon color={colors.statIcon} />
      <Text style={styles.statText}>{value}</Text>
    </View>
  );
}

function UpdatePostImpl({ post, index, isLast, focus, onFocus, onFrozen, onToggleCentered, onClose, mediaPlaying }) {
  const { width } = useWindowDimensions();
  const mediaH = Math.round(width * post.mediaRatio);
  const box = { width, height: mediaH };
  const mediaTarget = useRef(null);
  const focused = focus && focus.postId === post.id;

  const overlay = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(overlay, { toValue: focused ? 1 : 0, duration: 280, useNativeDriver: true }).start();
  }, [focused, overlay]);

  const [overlayMounted, setOverlayMounted] = useState(false);
  useEffect(() => {
    if (focused) setOverlayMounted(true);
    else {
      const t = setTimeout(() => setOverlayMounted(false), 300);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [focused]);

  const bubbleLeft = (b) => b.x * width;
  const bubbleTop = (b) => b.y * mediaH;

  const openBubble = (i, rect) => onFocus({ postId: post.id, bubbleIndex: i, rect, centered: false });
  const selected = focused ? post.bubbles[focus.bubbleIndex] : null;

  return (
    // Taps inside the focused post close it; taps inside other posts do nothing (demo).
    <Pressable onPress={focused ? onClose : undefined} style={[styles.post, isLast && styles.postLast]}>
      {/* Head */}
      <View style={styles.head}>
        <View style={styles.avWrap}>
          <LinearGradient colors={['#3A3A44', '#1A1A22']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.av}>
            <PersonOutline size={18} />
          </LinearGradient>
          {/* Demo13 shows the follow badge but gives it no action yet. */}
          <View style={styles.follow}>
            <FollowPlus size={8} />
          </View>
        </View>
        <View style={styles.meta}>
          <Text style={styles.name} numberOfLines={1}>
            {post.name}
          </Text>
          <Text style={styles.time}>{post.time}</Text>
        </View>
      </View>

      {/* Media */}
      <BlurTargetContext.Provider value={mediaTarget}>
        <View style={[styles.body, { height: mediaH }]}>
          <BlurTargetView ref={mediaTarget} style={StyleSheet.absoluteFill} pointerEvents="none">
            <LinearGradient
              colors={[colors.bodyTop, colors.bodyBottom]}
              start={{ x: 0.33, y: 0 }}
              end={{ x: 0.67, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            {post.media.type === 'video' ? (
              <PostVideo source={post.media.source} playing={mediaPlaying} />
            ) : (
              <Image source={post.media.source} style={styles.fill} resizeMode="cover" />
            )}
          </BlurTargetView>

          {post.bubbles.map((b, i) => (
            <UpdateBubble
              key={`${post.id}-${i}`}
              bubble={b}
              left={bubbleLeft(b)}
              top={bubbleTop(b)}
              selected={focused && focus.bubbleIndex === i}
              dimmed={focused && focus.bubbleIndex !== i}
              onPress={(rect) => openBubble(i, rect)}
              onFrozen={(offset) => onFrozen(post.id, i, bubbleTop(b) + offset)}
            />
          ))}

          {overlayMounted && (
            <Animated.View pointerEvents={focused ? 'auto' : 'none'} style={[StyleSheet.absoluteFill, styles.overlay, { opacity: overlay }]}>
              <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close message">
                <Backdrop blur={10} />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.32)' }]} />
              </Pressable>
            </Animated.View>
          )}

          <UpdateCritMeter
            score={post.meterScore}
            idSuffix={index}
            onPress={() => {
              // Demo13: tapping the meter opens the post's first bubble.
              const b = post.bubbles[0];
              if (!b || (focused && focus.bubbleIndex === 0)) return;
              openBubble(0, { x: bubbleLeft(b), y: bubbleTop(b), size: b.size });
            }}
          />

          {focused && selected && (
            <UpdateMessageBar
              key={`${post.id}-${focus.bubbleIndex}`}
              variant={selected.kind}
              name={selected.kind === 'crit' ? 'Crit' : post.name}
              text={selected.text}
              anchor={focus.rect}
              box={box}
              centered={focus.centered}
              onPress={onToggleCentered}
            />
          )}
        </View>
      </BlurTargetContext.Provider>

      {/* Stats (no actions in Demo13) */}
      <View style={styles.actions}>
        <Stat Icon={CommentIcon} value={post.stats.comments} label="Comments" />
        <Stat Icon={SaveIcon} value={post.stats.saves} label="Saves" />
        <Stat Icon={AnalyticsIcon} value={post.stats.views} label="Views" />
        <Stat Icon={ShareIcon} value={post.stats.shares} label="Shares" />
      </View>
    </Pressable>
  );
}

export const UpdatePost = memo(UpdatePostImpl);

const styles = StyleSheet.create({
  post: { marginBottom: 28 },
  postLast: { marginBottom: 12 },
  head: { height: 36, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avWrap: { width: 36, height: 36 },
  av: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  follow: {
    position: 'absolute',
    left: -2,
    top: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  meta: { marginLeft: 10, flex: 1 },
  name: { fontFamily: fonts.name, fontSize: 14, lineHeight: 16.8, color: colors.white },
  time: { fontFamily: fonts.body, fontSize: 11, lineHeight: 14, marginTop: 2, color: colors.timeGrey },
  body: { width: '100%', overflow: 'hidden' },
  // Explicit size (not only edges) so images and videos fill the media box on every platform.
  fill: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' },
  overlay: { zIndex: 40 },
  actions: {
    marginTop: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 22,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 17 },
  statText: { fontFamily: fonts.medium, fontSize: 11, color: colors.statText },
});
