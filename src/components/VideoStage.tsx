import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { MediaOverlays } from './media/MediaOverlays';
import type { MediaEdits } from '../media/edits';

type Props = { uri: string; size?: number; muted?: boolean; /** AA text / CC captions drawn over the preview. */ edits?: MediaEdits };

/** Looping, muted preview of the creator's video (the square at the top of the composer). */
export function VideoStage({ uri, size = 210, muted = true, edits }: Props) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = muted;
    p.timeUpdateEventInterval = 0.25;
    p.play();
  });
  const time = useEvent(player, 'timeUpdate');
  return (
    <View style={[styles.frame, { width: size * 0.72, height: size }]}>
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
      {edits && <MediaOverlays edits={edits} width={size * 0.72} height={size} currentTime={time?.currentTime ?? 0} captionBottom={size * 0.08} />}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
});
