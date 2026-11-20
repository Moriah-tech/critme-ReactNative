import React from 'react';
import Svg, { Circle, Defs, LinearGradient, Line, Path, Polyline, Rect, Stop } from 'react-native-svg';

/** Line icons copied from Demo13's inline SVGs (24 × 24 grid, round caps). */
type IconProps = { size?: number; color?: string; strokeWidth?: number };

const base = (size: number, color: string, sw: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  strokeWidth: sw,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function HomeIcon({ size = 24, color = '#fff', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <Polyline points="9 22 9 12 15 12 15 22" />
    </Svg>
  );
}

export function FollowingIcon({ size = 24, color = '#fff', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
}

export function PlusIcon({ size = 22, color = '#fff', strokeWidth = 2 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Line x1="12" y1="5" x2="12" y2="19" />
      <Line x1="5" y1="12" x2="19" y2="12" />
    </Svg>
  );
}

export function ChatIcon({ size = 24, color = '#fff', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Path d="M17 8h1a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-1v2.5l-2.5-2.5" />
      <Path d="M3 5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H8l-3 3v-3H6a3 3 0 0 1-3-3z" />
    </Svg>
  );
}

export function ProfileIcon({ size = 24, color = '#fff', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Svg>
  );
}

/** Filled silhouette used inside grey avatars. */
export function PersonGlyph({ size = 18, color = 'rgba(255,255,255,0.6)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2z" />
      <Circle cx="12" cy="7" r="4" />
    </Svg>
  );
}

export function CommentIcon({ size = 16, color = '#fff', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

export function BookmarkIcon({ size = 16, color = '#fff', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

export function AnalyticsIcon({ size = 16, color = '#fff', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Line x1="18" y1="20" x2="18" y2="10" />
      <Line x1="12" y1="20" x2="12" y2="4" />
      <Line x1="6" y1="20" x2="6" y2="14" />
    </Svg>
  );
}

export function ShareIcon({ size = 16, color = '#fff', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <Polyline points="16 6 12 2 8 6" />
      <Line x1="12" y1="2" x2="12" y2="15" />
    </Svg>
  );
}

/** The small "+" inside the follow badge (10 × 10 grid). */
export function FollowPlus({ size = 9 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 10 10" stroke="#000" strokeWidth={3} strokeLinecap="round">
      <Line x1="5" y1="2" x2="5" y2="8" />
      <Line x1="2" y1="5" x2="8" y2="5" />
    </Svg>
  );
}

/** The four-point star (✦) on each comment. Lit = Crit Meter gradient. */
export function SparkStar({ size = 22, lit = false }: { size?: number; lit?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="starGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#67E8F9" />
          <Stop offset="0.55" stopColor="#A855F7" />
          <Stop offset="1" stopColor="#D946EF" />
        </LinearGradient>
      </Defs>
      <Path
        d="M12 0.5C12.9 7.4 16.6 11.1 23.5 12C16.6 12.9 12.9 16.6 12 23.5C11.1 16.6 7.4 12.9 0.5 12C7.4 11.1 11.1 7.4 12 0.5Z"
        fill={lit ? 'url(#starGrad)' : 'rgba(255,255,255,0.5)'}
      />
    </Svg>
  );
}

/** Close "×" drawn as two strokes (camera, thumbnails). */
export function CloseIcon({ size = 20, color = '#FAFAFA', strokeWidth = 2.2 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Line x1="6" y1="6" x2="18" y2="18" />
      <Line x1="18" y1="6" x2="6" y2="18" />
    </Svg>
  );
}

export function GalleryIcon({ size = 22, color = '#FAFAFA', strokeWidth = 1.6 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <Circle cx="8.5" cy="8.5" r="1.5" />
      <Polyline points="21 15 16 10 5 21" />
    </Svg>
  );
}

export function FlipIcon({ size = 26, color = '#FAFAFA', strokeWidth = 1.8 }: IconProps) {
  return (
    <Svg {...base(size, color, strokeWidth)}>
      <Path d="M17 1l4 4-4 4" />
      <Path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <Path d="M7 23l-4-4 4-4" />
      <Path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </Svg>
  );
}
