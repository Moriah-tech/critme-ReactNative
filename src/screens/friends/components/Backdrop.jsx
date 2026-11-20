import React, { createContext, useContext } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

/**
 * Real background blur for the screen's glass surfaces (Demo13 uses CSS
 * backdrop-filter). iOS blurs whatever is behind the view. Android must be told
 * which view to blur: wrap that content in <BlurTargetView ref={…}> from
 * expo-blur and provide the ref with <BlurTargetContext.Provider>. Without a
 * target, Android shows the surface's fill only.
 */
export const BlurTargetContext = createContext(null);

/**
 * CSS blur radius (px) → expo-blur intensity. expo-blur draws intensity N as
 * roughly N × 0.2 px of blur on the web, so 5 × px matches Demo13's radii there
 * (10 px focus blur → 50; 28 px glass → 100, the maximum). iOS and Android
 * interpret intensity their own way: tune BLUR_SCALE on devices if needed.
 */
export const BLUR_SCALE = 5;
const intensityFor = (px) => Math.max(1, Math.min(100, Math.round(px * BLUR_SCALE)));

export function Backdrop({ blur, style }) {
  const target = useContext(BlurTargetContext);
  const android = Platform.OS === 'android';
  return (
    <BlurView
      pointerEvents="none"
      intensity={intensityFor(blur)}
      blurTarget={android && target ? target : undefined}
      blurMethod={android && target ? 'dimezisBlurViewSdk31Plus' : 'none'}
      style={[StyleSheet.absoluteFill, style]}
    />
  );
}
