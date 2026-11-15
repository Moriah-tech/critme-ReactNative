// Design tokens taken from the HTML demo (CritMe_Demo.html).

export const colors = {
  bg: '#0E0F13',
  sheet: '#111117',
  sheetBorder: 'rgba(255,255,255,0.08)',
  bubble: '#1A1A20', // message bar fill
  bubbleBorder: 'rgba(255,255,255,0.12)',
  text: '#F4F4F5',
  textMuted: '#8A8A93',
  cyan: '#67E8F9',
  purple: '#A855F7',
  magenta: '#D946EF',
  dot: 'rgba(255,255,255,0.13)',
};

/** Crit Meter gradient, used on Initialize. */
export const brightGradient = {
  colors: ['#67E8F9', '#A855F7', '#D946EF'] as const,
  locations: [0, 0.55, 1] as const,
};

/** Muted version of the same gradient, used on Upload. */
export const mutedGradient = {
  colors: ['#3E8E9C', '#6E4A9E', '#85479A'] as const,
  locations: [0, 0.55, 1] as const,
};

/** Muted gradient for the active pager dot. */
export const dotGradient = {
  colors: ['rgba(103,232,249,0.5)', 'rgba(168,85,247,0.55)', 'rgba(217,70,239,0.5)'] as const,
  locations: [0, 0.7, 1] as const,
};

/** One full pulse of the message-bar glow (cyan, then purple, then cyan). */
export const GLOW_PERIOD_MS = 2600;
