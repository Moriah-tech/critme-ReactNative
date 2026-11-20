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

/**
 * Font families loaded in src/fonts.ts. On Android a custom family must carry
 * its own weight, so use these names instead of fontWeight.
 */
export const fonts = {
  inter: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
  interBold: 'Inter_700Bold',
  grotesk: 'SpaceGrotesk_400Regular',
  groteskSemiBold: 'SpaceGrotesk_600SemiBold',
  groteskBold: 'SpaceGrotesk_700Bold',
  /** Sora: Explore/Stories tabs (700 active, 600 inactive) and the "CritMe" title, as in Demo13. */
  tabActive: 'Sora_700Bold',
  tabInactive: 'Sora_600SemiBold',
} as const;

/** Feed tokens measured from Demo13 (computed styles). */
export const feed = {
  black: '#050506',
  glassFill: 'rgba(30,30,35,0.62)',
  glassBorder: 'rgba(255,255,255,0.12)',
  critBarFill: 'rgba(16,18,26,0.92)',
  critBarBorder: 'rgba(255,255,255,0.14)',
  sheetFill: 'rgba(18,18,22,0.97)',
  sheetBorder: 'rgba(255,255,255,0.08)',
  teal: '#5EEAD4',
  nameGrey: '#858585',
} as const;

/** Crit Meter gradient stops (cyan → purple → magenta). */
export const meterGradient = ['#67E8F9', '#A855F7', '#D946EF'] as const;
