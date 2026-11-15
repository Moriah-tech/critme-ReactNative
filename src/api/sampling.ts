/**
 * Which frames to send to the model when generating Takes.
 *
 * - N depends on the video's length: 60 s or less → 4 frames, 120 s or more → 8,
 *   linear in between and rounded (75 s → 5, 90 s → 6).
 * - Frames are spread with interval = duration / (N - 1), so the first and
 *   last frames are always included.
 *
 * On the server, read the real duration and fps with ffprobe (don't assume
 * 30 fps). Snap each timestamp to the nearest frame: round(t * fps) / fps.
 */
export function frameCountFor(durationSec: number): number {
  if (durationSec <= 60) return 4;
  if (durationSec >= 120) return 8;
  return Math.round(4 + ((durationSec - 60) / 60) * 4);
}

export function frameTimestamps(durationSec: number, fps?: number): number[] {
  if (!(durationSec > 0)) return [0];
  const n = frameCountFor(durationSec);
  const interval = durationSec / (n - 1);
  const lastFrame = fps ? Math.max(0, durationSec - 1 / fps) : durationSec;
  return Array.from({ length: n }, (_, i) => {
    let t = Math.min(i * interval, lastFrame);
    if (fps) t = Math.round(t * fps) / fps;
    return Number(t.toFixed(3));
  });
}

/** "#medschool #study vibes" → ["medschool", "study"] */
export function extractHashtags(message: string): string[] {
  const tags = message.match(/#[\p{L}\p{N}_]+/gu) ?? [];
  return Array.from(new Set(tags.map((t) => t.slice(1).toLowerCase())));
}
