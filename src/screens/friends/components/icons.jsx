import React from 'react';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';

/**
 * Icons used by the Friends screen, drawn from the same SVG paths as Demo13
 * (the raw .svg files are in ../assets/icons for reference).
 */
const line = (size, color, sw) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  strokeWidth: sw,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

export const SearchIcon = ({ size = 18, color = '#FAFAFA', strokeWidth = 2 }) => (
  <Svg {...line(size, color, strokeWidth)}>
    <Circle cx="11" cy="11" r="7" />
    <Line x1="16.5" y1="16.5" x2="21" y2="21" />
  </Svg>
);

export const PersonOutline = ({ size = 18, color = 'rgba(255,255,255,0.55)', strokeWidth = 1.6 }) => (
  <Svg {...line(size, color, strokeWidth)}>
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

/** Filled silhouette inside grey avatar discs. */
export const PersonFilled = ({ size = 21, color = 'rgba(255,255,255,0.6)' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2z" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

export const FollowPlus = ({ size = 8 }) => (
  <Svg width={size} height={size} viewBox="0 0 10 10" stroke="#000" strokeWidth={2.4} strokeLinecap="round">
    <Line x1="5" y1="2" x2="5" y2="8" />
    <Line x1="2" y1="5" x2="8" y2="5" />
  </Svg>
);

export const CommentIcon = ({ size = 17, color, strokeWidth = 1.7 }) => (
  <Svg {...line(size, color, strokeWidth)}>
    <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </Svg>
);

export const SaveIcon = ({ size = 17, color, strokeWidth = 1.7 }) => (
  <Svg {...line(size, color, strokeWidth)}>
    <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </Svg>
);

export const AnalyticsIcon = ({ size = 17, color, strokeWidth = 1.7 }) => (
  <Svg {...line(size, color, strokeWidth)}>
    <Line x1="18" y1="20" x2="18" y2="10" />
    <Line x1="12" y1="20" x2="12" y2="4" />
    <Line x1="6" y1="20" x2="6" y2="14" />
  </Svg>
);

export const ShareIcon = ({ size = 17, color, strokeWidth = 1.7 }) => (
  <Svg {...line(size, color, strokeWidth)}>
    <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <Polyline points="16 6 12 2 8 6" />
    <Line x1="12" y1="2" x2="12" y2="15" />
  </Svg>
);

export const NavHome = ({ size = 24, color }) => (
  <Svg {...line(size, color, 1.8)}>
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <Polyline points="9 22 9 12 15 12 15 22" />
  </Svg>
);

export const NavFollowing = ({ size = 24, color }) => (
  <Svg {...line(size, color, 1.8)}>
    <Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <Circle cx="9" cy="7" r="4" />
    <Path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

export const NavPlus = ({ size = 22, color = '#fff' }) => (
  <Svg {...line(size, color, 2)}>
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

export const NavChat = ({ size = 24, color }) => (
  <Svg {...line(size, color, 1.8)}>
    <Path d="M17 8h1a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-1v2.5l-2.5-2.5" />
    <Path d="M3 5a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H8l-3 3v-3H6a3 3 0 0 1-3-3z" />
  </Svg>
);

export const NavProfile = ({ size = 24, color }) => (
  <Svg {...line(size, color, 1.8)}>
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);
