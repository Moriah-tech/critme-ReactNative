import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { CritAvatar } from './CritAvatar';
import { MessageBubble } from './MessageBubble';
import { colors } from '../theme';
import type { Post } from '../api/types';

type Props = { post: Post; height: number; active: boolean };

/** One full-screen Explore post: the video, the creator's message, and Crit's take. */
export function FeedPostCard({ post, height, active }: Props) {
  const player = useVideoPlayer(post.videoUrl, (p) => {
    p.loop = true;
  });
  React.useEffect(() => {
    if (active) player.play();
    else player.pause();
  }, [active, player]);

  return (
    <View style={{ height, backgroundColor: '#000' }}>
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={styles.shade} pointerEvents="none" />
      <View style={styles.overlay}>
        <Text style={styles.author}>{post.authorName}</Text>
        <MessageBubble text={post.message} glow={false} tail="left" style={styles.userMsg} />
        <View style={styles.critRow}>
          <CritAvatar size={28} />
          <MessageBubble text={post.take.text} variant="take" glow={false} tail="left" style={styles.critMsg} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%' },
  overlay: { position: 'absolute', left: 16, right: 16, bottom: 96, gap: 12 },
  author: { color: colors.text, fontSize: 15, fontWeight: '700' },
  userMsg: { alignSelf: 'flex-end', maxWidth: '78%' },
  critRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 14 },
  critMsg: { flexShrink: 1, maxWidth: '86%' },
});
