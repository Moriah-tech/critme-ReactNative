/**
 * Edits a creator adds on the camera (AA text, CC captions). They travel with the
 * clip through the composer to the posted Explore item and are drawn over the video
 * wherever it plays (MediaOverlays). They are metadata, not burned into the file:
 * rendering them into the mp4 needs a native encoder (see README note in the report).
 */

export type TextStyleKey = 'classic' | 'bold' | 'display' | 'label';

export type TextOverlay = {
  id: string;
  text: string;
  color: string;
  /** Font size in points on a 390-wide screen; scaled with the media box width. */
  size: number;
  style: TextStyleKey;
  /** Centre of the text as a fraction (0–1) of the media box. */
  x: number;
  y: number;
};

export type CaptionLine = {
  id: string;
  /** Seconds into the video. */
  start: number;
  end: number;
  text: string;
};

export type MediaEdits = {
  overlays: TextOverlay[];
  captions: CaptionLine[];
  /** Show the captions over the video. */
  captionsOn: boolean;
};

export const EMPTY_EDITS: MediaEdits = { overlays: [], captions: [], captionsOn: true };

export const TEXT_COLORS = ['#FFFFFF', '#FACC15', '#22D3EE', '#F472B6', '#4ADE80', '#F87171', '#111111'] as const;
export const TEXT_STYLES: { key: TextStyleKey; label: string }[] = [
  { key: 'classic', label: 'Classic' },
  { key: 'bold', label: 'Bold' },
  { key: 'display', label: 'Display' },
  { key: 'label', label: 'Label' },
];
export const MIN_TEXT_SIZE = 16;
export const MAX_TEXT_SIZE = 64;

let seq = 0;
export const newEditId = (prefix: string) => `${prefix}-${Date.now()}-${++seq}`;

export function hasEdits(e: MediaEdits): boolean {
  return e.overlays.length > 0 || e.captions.length > 0;
}

/** The caption to show at time t (seconds), or null. */
export function captionAt(lines: CaptionLine[], t: number): CaptionLine | null {
  return lines.find((l) => t >= l.start && t < l.end) ?? null;
}

export function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
