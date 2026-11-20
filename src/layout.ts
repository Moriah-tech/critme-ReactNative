import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Demo13 is drawn on a 390 × 844 phone with a 50 px status area and a 34 px
 * home-indicator area. These helpers map its measurements onto the real screen:
 * things measured from the top follow the top inset, things measured from the
 * bottom follow the bottom inset, and horizontal values stay in points.
 */
export const DEMO_W = 390;
export const DEMO_H = 844;
const DEMO_TOP = 50;
const DEMO_BOTTOM = 34;

export type Frame = {
  width: number;
  height: number;
  /** Demo y (from the top of the phone) → screen y. */
  top: (demoY: number) => number;
  /** Demo distance from the bottom of the phone → screen distance from the bottom. */
  bottom: (demoBottom: number) => number;
  /** Demo y measured from the top but anchored to the bottom (e.g. the bubble lane) → screen y. */
  fromBottom: (demoY: number) => number;
};

export function useFrame(): Frame {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return useMemo(() => {
    const t = Math.max(insets.top, 24);
    const b = Math.max(insets.bottom, 30);
    return {
      width,
      height,
      top: (y) => y - DEMO_TOP + t,
      bottom: (d) => d - DEMO_BOTTOM + b,
      fromBottom: (y) => height - ((DEMO_H - y) - DEMO_BOTTOM + b),
    };
  }, [width, height, insets.top, insets.bottom]);
}
