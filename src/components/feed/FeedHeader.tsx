import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { fonts } from '../../theme';

/**
 * Explore / Stories tabs, centred at the top of the feed. Both stay visible:
 * the active tab is 15.5 px bold at full white, the other 15 px semibold at
 * 48 % white, slightly smaller. `progress` is the pager position (0 = Explore,
 * 1 = Stories); it follows the swipe, so the emphasis cross-fades smoothly
 * from one tab to the other instead of jumping.
 * In "CritMe mode" (after swiping up) the tabs fade out and "CritMe" (19 px
 * bold) takes their place; swiping left brings the tabs back.
 */
export type FeedTab = 'explore' | 'stories';

type Props = {
  top: number;
  tab: FeedTab;
  /** Pager position: 0 = Explore page, 1 = Stories page (native-driven). */
  progress: Animated.Value;
  critMeMode: boolean;
  onTab: (tab: FeedTab) => void;
};

export function FeedHeader({ top, tab, progress, critMeMode, onTab }: Props) {
  const mode = useRef(new Animated.Value(critMeMode ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(mode, { toValue: critMeMode ? 1 : 0, duration: 220, useNativeDriver: true }).start();
  }, [critMeMode, mode]);

  const tabEl = (key: FeedTab, label: string) => {
    const selected = tab === key;
    // 1 when this tab's page is showing, 0 when the other one is.
    const toActive = key === 'explore' ? [1, 0] : [0, 1];
    const activeness = progress.interpolate({ inputRange: [0, 1], outputRange: toActive });
    const inactiveness = progress.interpolate({ inputRange: [0, 1], outputRange: [toActive[1], toActive[0]] });
    const scale = progress.interpolate({ inputRange: [0, 1], outputRange: key === 'explore' ? [1, 0.97] : [0.97, 1] });
    return (
      <Pressable
        key={key}
        onPress={() => onTab(key)}
        accessibilityRole="tab"
        accessibilityState={{ selected }}
        style={styles.tab}
        hitSlop={6}
      >
        <Animated.View style={[styles.label, { transform: [{ scale }] }]}>
          {/* Both weights are drawn and cross-faded; the bold one sets the width. */}
          <Animated.Text style={[styles.active, { opacity: activeness }]}>{label}</Animated.Text>
          <Animated.Text style={[styles.inactive, styles.inactiveLayer, { opacity: inactiveness }]}>{label}</Animated.Text>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.wrap, { top }]} pointerEvents="box-none">
      <Animated.View
        pointerEvents={critMeMode ? 'none' : 'box-none'}
        style={[styles.tabs, { opacity: mode.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}
      >
        {tabEl('explore', 'Explore')}
        {tabEl('stories', 'Stories')}
      </Animated.View>
      <Animated.Text pointerEvents="none" style={[styles.critme, { opacity: mode }]}>
        CritMe
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, height: 30, alignItems: 'center', justifyContent: 'center', zIndex: 32 },
  tabs: { flexDirection: 'row', gap: 24, alignItems: 'center' },
  tab: { paddingVertical: 6, paddingHorizontal: 4, borderRadius: 18 },
  label: { alignItems: 'center', justifyContent: 'center' },
  active: { fontFamily: fonts.tabActive, fontSize: 15.5, lineHeight: 22, letterSpacing: -0.45, color: '#fafafa' },
  inactive: { fontFamily: fonts.tabInactive, fontSize: 15, lineHeight: 22, letterSpacing: -0.35, color: 'rgba(255,255,255,0.48)' },
  inactiveLayer: { position: 'absolute', left: 0, right: 0, textAlign: 'center' },
  critme: { position: 'absolute', fontFamily: fonts.tabActive, fontSize: 19, lineHeight: 26, letterSpacing: -0.5, color: '#fafafa' },
});
