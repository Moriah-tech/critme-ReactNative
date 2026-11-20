/**
 * Design tokens for the standalone Friends screen, measured from Demo13
 * (Following → "Updates" feed, computed styles on the 390 × 844 demo phone).
 */

export const colors = {
  black: '#050506',
  white: '#FAFAFA',
  bodyTop: '#121218', // post media background gradient (160deg) start
  bodyBottom: '#0A0A0E', // … end
  timeGrey: 'rgba(161,161,170,0.75)',
  statText: 'rgba(255,255,255,0.72)',
  statIcon: 'rgba(255,255,255,0.8)',
  nameGrey: '#858585', // message-bar name
  glassFill: 'rgba(30,30,35,0.62)',
  glassBorder: 'rgba(255,255,255,0.12)',
  cyanGlow: '#67E8F9',
};

/** Font family names. The app already loads these families (src/fonts.ts). */
export const fonts = {
  title: 'Sora_700Bold', // "Updates" / "CritMe"
  name: 'SpaceGrotesk_700Bold', // post author names, meter numbers
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
};

/** Crit Meter gradient (cyan → purple → magenta). */
export const meterGradient = ['#67E8F9', '#A855F7', '#D946EF'];

/**
 * Demo13 is drawn with a 50 px status area and a 34 px home-indicator area.
 * These map its numbers onto the real device's safe-area insets.
 */
export const DEMO_TOP_INSET = 50;
export const DEMO_BOTTOM_INSET = 34;
export const demoTop = (demoY, insetTop) => demoY - DEMO_TOP_INSET + Math.max(insetTop, 24);
export const demoBottom = (demoDist, insetBottom) => demoDist - DEMO_BOTTOM_INSET + Math.max(insetBottom, 30);
