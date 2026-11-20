import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

/**
 * Live time bar under the creator strip: 2.5 px, 24 px from each side, 18 %
 * white track with a 90 % white fill that follows playback. Tapping it seeks.
 */
type Props = { progress: number; bottom: number; onSeek: (fraction: number) => void };

export function ProgressBar({ progress, bottom, onSeek }: Props) {
  const [width, setWidth] = useState(0);
  return (
    <Pressable
      accessibilityRole="adjustable"
      accessibilityLabel="Playback position"
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      onPress={(e) => width > 0 && onSeek(Math.max(0, Math.min(1, e.nativeEvent.locationX / width)))}
      style={[styles.hit, { bottom: bottom - 8 }]}
    >
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(0, Math.min(1, progress)) * 100}%` }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { position: 'absolute', left: 24, right: 24, height: 18.5, justifyContent: 'center', zIndex: 36 },
  track: { height: 2.5, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' },
  fill: { height: 2.5, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.9)' },
});
