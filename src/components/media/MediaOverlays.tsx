import React, { useRef } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { captionAt, MediaEdits, TextOverlay, TextStyleKey } from '../../media/edits';
import { fonts } from '../../theme';

/**
 * Draws a clip's AA text and CC caption over a media box. Positions are fractions of
 * the box and font sizes scale with its width (designed on 390), so the same edits read
 * the same on the camera, the composer preview and the feed.
 */

/** A box 84 % of the media width, centred on the text's position (x, y are fractions of the media box). */
function boxStyle(o: TextOverlay, width: number, height: number) {
  return {
    position: 'absolute' as const,
    width: width * 0.84,
    left: o.x * width - width * 0.42,
    top: o.y * height,
    alignItems: 'center' as const,
    transform: [{ translateY: '-50%' as const }],
  };
}

export function textStyleFor(style: TextStyleKey, color: string, size: number) {
  const base = { color, fontSize: size, lineHeight: size * 1.2, textAlign: 'center' as const };
  switch (style) {
    case 'bold':
      return { ...base, fontFamily: fonts.interBold, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4, textShadowOffset: { width: 0, height: 1 } };
    case 'display':
      return { ...base, fontFamily: fonts.tabActive, letterSpacing: -0.5, textShadowColor: 'rgba(0,0,0,0.55)', textShadowRadius: 5, textShadowOffset: { width: 0, height: 1 } };
    case 'label':
      return { ...base, fontFamily: fonts.groteskBold, backgroundColor: color === '#111111' ? '#FFFFFF' : 'rgba(0,0,0,0.62)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' as const };
    default:
      return { ...base, fontFamily: fonts.interMedium, textShadowColor: 'rgba(0,0,0,0.55)', textShadowRadius: 4, textShadowOffset: { width: 0, height: 1 } };
  }
}

type Props = {
  edits: MediaEdits;
  width: number;
  height: number;
  /** Playback position in seconds, for captions. */
  currentTime?: number;
  /** Distance from the bottom of the box to the caption. */
  captionBottom?: number;
  /** When set, text can be dragged and tapped (camera editing). */
  editable?: { onMove: (id: string, x: number, y: number) => void; onEdit: (o: TextOverlay) => void };
};

export function MediaOverlays({ edits, width, height, currentTime = 0, captionBottom, editable }: Props) {
  const scale = width / 390;
  const caption = edits.captionsOn ? captionAt(edits.captions, currentTime) : null;
  return (
    <View pointerEvents={editable ? 'box-none' : 'none'} style={StyleSheet.absoluteFill}>
      {edits.overlays.map((o) =>
        editable ? (
          <DraggableText key={o.id} o={o} width={width} height={height} scale={scale} onMove={editable.onMove} onEdit={editable.onEdit} />
        ) : (
          <View key={o.id} pointerEvents="none" style={boxStyle(o, width, height)}>
            <Text style={textStyleFor(o.style, o.color, o.size * scale)}>{o.text}</Text>
          </View>
        ),
      )}
      {caption && (
        <View pointerEvents="none" style={[styles.caption, { bottom: captionBottom ?? height * 0.12 }]}>
          <Text style={[styles.captionText, { fontSize: 16 * Math.max(scale, 0.75), lineHeight: 22 * Math.max(scale, 0.75) }]}>{caption.text}</Text>
        </View>
      )}
    </View>
  );
}

function DraggableText({ o, width, height, scale, onMove, onEdit }: { o: TextOverlay; width: number; height: number; scale: number; onMove: (id: string, x: number, y: number) => void; onEdit: (o: TextOverlay) => void }) {
  const start = useRef({ x: o.x, y: o.y });
  // The responder is created once, so it reads the latest props through this ref.
  const latest = useRef({ o, width, height, onMove, onEdit });
  latest.current = { o, width, height, onMove, onEdit };
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        start.current = { x: latest.current.o.x, y: latest.current.o.y };
      },
      onPanResponderMove: (_e, g) => {
        const c = latest.current;
        const x = Math.min(0.95, Math.max(0.05, start.current.x + g.dx / c.width));
        const y = Math.min(0.95, Math.max(0.05, start.current.y + g.dy / c.height));
        c.onMove(c.o.id, x, y);
      },
      onPanResponderRelease: (_e, g) => {
        if (Math.abs(g.dx) < 6 && Math.abs(g.dy) < 6) latest.current.onEdit(latest.current.o);
      },
    }),
  ).current;
  return (
    <View
      style={boxStyle(o, width, height)}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Text: ${o.text}. Drag to move, tap to edit`}
      {...pan.panHandlers}
    >
      <Text style={textStyleFor(o.style, o.color, o.size * scale)}>{o.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caption: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  captionText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.62)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
