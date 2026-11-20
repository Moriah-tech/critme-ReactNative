import React, { ComponentRef, createContext, RefObject, useContext } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { feed } from '../theme';

/**
 * Glass surfaces from Demo13: a real background blur (CSS backdrop-filter)
 * under the demo's own translucent fill, border and radius.
 *
 * iOS blurs whatever is behind the view. Android needs to know which view to
 * blur: the nearest <BlurTargetProvider> supplies it (a BlurTargetView that
 * wraps the content behind the glass). Without one, Android shows the fill only.
 */

type TargetRef = RefObject<ComponentRef<typeof View> | null>;
const BlurTargetContext = createContext<TargetRef | null>(null);

export function BlurTargetProvider({ target, children }: { target: TargetRef; children: React.ReactNode }) {
  return <BlurTargetContext.Provider value={target}>{children}</BlurTargetContext.Provider>;
}

/**
 * CSS blur radius (px) → expo-blur intensity (1–100). The two scales don't map
 * exactly; 3 × px matched the demo best on paper and is the one number to tune
 * on devices.
 */
export const BLUR_SCALE = 3;
export const blurIntensity = (cssPx: number) => Math.max(1, Math.min(100, Math.round(cssPx * BLUR_SCALE)));

/** Just the blurred backdrop, filling its parent. Used inside Glass and by full-screen layers. */
export function Backdrop({ blur, style }: { blur: number; style?: StyleProp<ViewStyle> }) {
  const target = useContext(BlurTargetContext);
  const android = Platform.OS === 'android';
  return (
    <BlurView
      pointerEvents="none"
      // No tint: the blur alone, so the demo's own fill colour sits on top unchanged.
      intensity={blurIntensity(blur)}
      blurTarget={android && target ? target : undefined}
      blurMethod={android && target ? 'dimezisBlurViewSdk31Plus' : 'none'}
      style={[StyleSheet.absoluteFill, style]}
    />
  );
}

type Props = ViewProps & {
  fill?: string;
  border?: string;
  radius?: number;
  /** CSS blur radius from the demo (backdrop-filter: blur(Npx)). */
  blur?: number;
  style?: StyleProp<ViewStyle>;
};

export function Glass({ fill = feed.glassFill, border = feed.glassBorder, radius = 18, blur = 28, style, children, ...rest }: Props) {
  return (
    <View {...rest} style={[styles.base, { borderColor: border, borderRadius: radius }, style]}>
      <View style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]} pointerEvents="none">
        <Backdrop blur={blur} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: fill }]} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
});
