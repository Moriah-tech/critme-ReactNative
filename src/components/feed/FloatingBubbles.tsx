import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { BUBBLE_SIZE, BubbleKind, GlassBubble } from './GlassBubble';

/**
 * Drifting bubbles from Demo13: each bubble moves in a straight line at
 * 0.55 px per frame (33 px/s), bounces off the lane edges with a little random
 * jitter, and bounces off the other bubbles. The lane runs from y 502 to 690 on
 * the demo phone, 14 px in from each side. Movement freezes while a message bar
 * is open; the pressed bubble scales to 1.06 and sits above the blur.
 */

const SPEED = 33; // px per second
const JITTER = Math.PI * 0.35;

export type BubbleSpec = { id: string; kind: BubbleKind; start: { x: number; y: number }; angle: number };
export type BubbleRect = { x: number; y: number; size: number };

type Props = {
  bubbles: BubbleSpec[];
  /** Lane in screen coordinates. */
  lane: { top: number; bottom: number; left: number; right: number };
  frozen: boolean;
  selectedId: string | null;
  onPress: (id: string, rect: BubbleRect) => void;
};

export type FloatingBubblesHandle = { rectOf: (id: string) => BubbleRect | null };

type Body = { id: string; x: number; y: number; vx: number; vy: number; pos: Animated.ValueXY };

export const FloatingBubbles = forwardRef<FloatingBubblesHandle, Props>(function FloatingBubbles(
  { bubbles, lane, frozen, selectedId, onPress },
  ref,
) {
  const bodies = useRef<Body[]>([]);
  if (bodies.current.length !== bubbles.length || bodies.current.some((b, i) => b.id !== bubbles[i].id)) {
    bodies.current = bubbles.map((b) => ({
      id: b.id,
      x: b.start.x,
      y: b.start.y,
      vx: Math.cos(b.angle) * SPEED,
      vy: Math.sin(b.angle) * SPEED,
      pos: new Animated.ValueXY({ x: b.start.x, y: b.start.y }),
    }));
  }
  const scales = useRef<Record<string, Animated.Value>>({});
  bubbles.forEach((b) => {
    if (!scales.current[b.id]) scales.current[b.id] = new Animated.Value(1);
  });

  useImperativeHandle(ref, () => ({
    rectOf(id) {
      const b = bodies.current.find((x) => x.id === id);
      return b ? { x: b.x, y: b.y, size: BUBBLE_SIZE } : null;
    },
  }));

  useEffect(() => {
    bubbles.forEach((b) => {
      Animated.timing(scales.current[b.id], {
        toValue: selectedId === b.id ? 1.06 : 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [selectedId, bubbles]);

  useEffect(() => {
    if (frozen) return;
    let raf = 0;
    let last = 0;
    const size = BUBBLE_SIZE;
    const r = size / 2;
    const jitter = (b: Body) => {
      const a = Math.atan2(b.vy, b.vx) + (Math.random() - 0.5) * JITTER;
      b.vx = Math.cos(a) * SPEED;
      b.vy = Math.sin(a) * SPEED;
    };
    const step = (t: number) => {
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 1 / 60;
      last = t;
      const list = bodies.current;
      for (const b of list) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.y < lane.top) { b.y = lane.top; b.vy = Math.abs(b.vy); jitter(b); }
        if (b.y > lane.bottom - size) { b.y = lane.bottom - size; b.vy = -Math.abs(b.vy); jitter(b); }
        if (b.x < lane.left) { b.x = lane.left; b.vx = Math.abs(b.vx); jitter(b); }
        if (b.x > lane.right - size) { b.x = lane.right - size; b.vx = -Math.abs(b.vx); jitter(b); }
      }
      for (let i = 0; i < list.length; i++) {
        for (let k = i + 1; k < list.length; k++) {
          const a = list[i];
          const c = list[k];
          const dx = c.x - a.x;
          const dy = c.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0 && dist < r * 2) {
            const nx = dx / dist;
            const ny = dy / dist;
            const overlap = (r * 2 - dist) / 2;
            a.x -= nx * overlap; a.y -= ny * overlap;
            c.x += nx * overlap; c.y += ny * overlap;
            const ad = a.vx * nx + a.vy * ny;
            const cd = c.vx * nx + c.vy * ny;
            const norm = (vx: number, vy: number) => {
              const m = Math.sqrt(vx * vx + vy * vy) || 1;
              return [(vx / m) * SPEED, (vy / m) * SPEED];
            };
            [a.vx, a.vy] = norm(a.vx + (cd - ad) * nx, a.vy + (cd - ad) * ny);
            [c.vx, c.vy] = norm(c.vx + (ad - cd) * nx, c.vy + (ad - cd) * ny);
          }
        }
      }
      for (const b of list) b.pos.setValue({ x: b.x, y: b.y });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [frozen, lane.top, lane.bottom, lane.left, lane.right]);

  return (
    <>
      {bubbles.map((spec) => {
        const body = bodies.current.find((b) => b.id === spec.id)!;
        const selected = selectedId === spec.id;
        return (
          <Animated.View
            key={spec.id}
            style={[
              styles.bubble,
              {
                zIndex: selected ? 60 : 20,
                transform: [...body.pos.getTranslateTransform(), { scale: scales.current[spec.id] }],
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={spec.kind === 'crit' ? "Open Crit's take" : "Open the creator's message"}
              onPress={() => onPress(spec.id, { x: body.x, y: body.y, size: BUBBLE_SIZE })}
              hitSlop={6}
            >
              <GlassBubble kind={spec.kind} />
            </Pressable>
          </Animated.View>
        );
      })}
    </>
  );
});

const styles = StyleSheet.create({
  bubble: { position: 'absolute', left: 0, top: 0, width: BUBBLE_SIZE, height: BUBBLE_SIZE },
});
