import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurTargetView } from 'expo-blur';

import { UpdatePost } from './components/UpdatePost';
import { SearchIcon } from './components/icons';
import { UPDATE_POSTS } from './data/updatesData';
import { colors, demoBottom, demoTop, fonts } from './theme';

/**
 * FriendsScreen — standalone React Native version of Demo13's Friends screen
 * (bottom nav "Following" → the "Updates" feed).
 *
 * What it does (all taken from Demo13):
 *  - Header: "Updates" (Sora 22/700) cross-fades to "CritMe" 1.1 s after the
 *    screen opens; search icon on the right. Scrolling down more than 18 px
 *    slides the header up and out (0.24 s); scrolling up brings it back.
 *  - A vertical feed of posts (2 images, 2 looping muted videos) with each post's
 *    Crit Meter and floating bubbles; see components/UpdatePost.jsx.
 *  - Tap a bubble → that post's media blurs, the bubble pulses and its message
 *    bar opens. Tap the bar → it moves to the centre (and back). Tap anything
 *    else in the post, or outside the posts → closes. Tap the meter → opens the
 *    post's first bubble. Scrolling the focused post (nearly) out of view closes it.
 *
 * Props (all optional):
 *  - posts           feed data; defaults to Demo13's four posts (data/updatesData.js)
 *  - isActive        false pauses videos and animations-heavy work while the screen is hidden
 *  - onSearch()      optional callback when the search icon opens the search field
 *                    (the icon itself always works: field + keyboard + filtering)
 *
 * Needs: react-native-safe-area-context (a SafeAreaProvider above it), expo-video,
 * expo-blur, expo-linear-gradient, react-native-svg. The app's shared BottomNav is drawn by App.tsx.
 */

const HEADER_HIDE_DISTANCE = 72;

export default function FriendsScreen({
  posts = UPDATE_POSTS,
  isActive = true,
  onSearch = undefined,
}) {
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();

  // ---------- header ----------
  // Search: the icon swaps the title for a text field that takes focus (keyboard opens).
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const searchInput = useRef(null);
  const openSearch = useCallback(() => {
    setSearching(true);
    onSearch?.();
  }, [onSearch]);
  const closeSearch = useCallback(() => {
    setSearching(false);
    setQuery('');
    Keyboard.dismiss();
  }, []);
  useEffect(() => {
    if (!searching) return undefined;
    // The field mounts this render; focus once it has settled so the keyboard reliably opens.
    const t = setTimeout(() => searchInput.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [searching]);

  const [critMeTitle, setCritMeTitle] = useState(false);
  const titleFade = useRef(new Animated.Value(0)).current; // 0 "Updates" → 1 "CritMe"
  const headerHide = useRef(new Animated.Value(0)).current; // 0 shown → 1 hidden
  const headerHidden = useRef(false);
  const [headerGone, setHeaderGone] = useState(false); // drives pointerEvents only

  useEffect(() => {
    if (!isActive) {
      setSearching(false);
      setQuery('');
      setCritMeTitle(false);
      titleFade.setValue(0);
      return undefined;
    }
    const t = setTimeout(() => setCritMeTitle(true), 1100);
    return () => clearTimeout(t);
  }, [isActive, titleFade]);

  useEffect(() => {
    Animated.timing(titleFade, { toValue: critMeTitle ? 1 : 0, duration: 450, useNativeDriver: true }).start();
  }, [critMeTitle, titleFade]);

  const setHeaderHidden = useCallback(
    (hide) => {
      if (headerHidden.current === hide) return;
      headerHidden.current = hide;
      setHeaderGone(hide);
      Animated.timing(headerHide, { toValue: hide ? 1 : 0, duration: 240, useNativeDriver: true }).start();
    },
    [headerHide],
  );

  // ---------- focus (one bubble at a time across the feed) ----------
  const [focus, setFocus] = useState(null);
  const closeFocus = useCallback(() => setFocus(null), []);
  const onFocus = useCallback((f) => setFocus(f), []);
  const onFrozen = useCallback((postId, bubbleIndex, y) => {
    setFocus((f) => (f && f.postId === postId && f.bubbleIndex === bubbleIndex ? { ...f, rect: { ...f.rect, y } } : f));
  }, []);
  const toggleCentered = useCallback(() => setFocus((f) => (f ? { ...f, centered: !f.centered } : f)), []);

  useEffect(() => {
    if (!isActive) setFocus(null);
  }, [isActive]);

  // ---------- scrolling ----------
  const layouts = useRef({}); // postId → { y, height } inside the scroll content
  const [viewport, setViewport] = useState({ y: 0, h: screenH });
  const lastY = useRef(0);
  const focusRef = useRef(focus);
  focusRef.current = focus;

  const onScroll = useCallback(
    (e) => {
      const y = e.nativeEvent.contentOffset.y;
      const h = e.nativeEvent.layoutMeasurement.height;
      const delta = y - lastY.current;
      if (Math.abs(delta) > 3) {
        if (delta > 0 && y > 18) setHeaderHidden(true);
        else if (delta < 0) setHeaderHidden(false);
      }
      lastY.current = y;
      // A focused post that scrolls (nearly) out of view closes, as in the demo.
      const f = focusRef.current;
      const l = f && layouts.current[f.postId];
      if (l && (l.y + l.height < y + 60 || l.y > y + h - 60)) setFocus(null);
      setViewport((v) => (Math.abs(v.y - y) > 24 || v.h !== h ? { y, h } : v));
    },
    [setHeaderHidden],
  );

  const isOnScreen = useCallback(
    (postId) => {
      const l = layouts.current[postId];
      if (!l) return false;
      return l.y < viewport.y + viewport.h && l.y + l.height > viewport.y;
    },
    [viewport],
  );

  const needle = query.trim().toLowerCase();
  const shown = needle
    ? posts.filter((p) => p.name.toLowerCase().includes(needle) || p.bubbles.some((b) => b.text.toLowerCase().includes(needle)))
    : posts;

  const contentTop = demoTop(92, insets.top);
  const contentBottom = demoBottom(118, insets.bottom);
  const headerTop = demoTop(54, insets.top);

  const scrollTarget = useRef(null);

  const header = (
      <Animated.View
        pointerEvents={headerGone ? 'none' : 'box-none'}
        style={[
          styles.header,
          {
            top: headerTop,
            opacity: headerHide.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
            transform: [{ translateY: headerHide.interpolate({ inputRange: [0, 1], outputRange: [0, -HEADER_HIDE_DISTANCE] }) }],
          },
        ]}
      >
        {searching ? (
          <TextInput
            ref={searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search updates"
            placeholderTextColor="rgba(255,255,255,0.4)"
            style={styles.searchInput}
            selectionColor={colors.cyanGlow}
            cursorColor={colors.cyanGlow}
            keyboardAppearance="dark"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={() => Keyboard.dismiss()}
            accessibilityLabel="Search updates"
          />
        ) : (
          <Pressable style={styles.titleBox} onPress={closeFocus} accessibilityRole="header">
            <Animated.Text style={[styles.title, { opacity: titleFade.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>
              Updates
            </Animated.Text>
            <Animated.Text style={[styles.title, { opacity: titleFade }]}>CritMe</Animated.Text>
          </Pressable>
        )}
        <Pressable
          onPress={searching ? closeSearch : openSearch}
          style={styles.search}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={searching ? 'Close search' : 'Search'}
        >
          <SearchIcon />
        </Pressable>
      </Animated.View>
  );

  return (
    <View style={styles.screen}>
      <BlurTargetView ref={scrollTarget} style={StyleSheet.absoluteFill}>
        <ScrollView
          style={StyleSheet.absoluteFill}
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          onLayout={(e) => setViewport((v) => ({ ...v, h: e.nativeEvent.layout.height }))}
        >
          {/* Taps in the gaps between posts close an open message (demo: tap outside a post). */}
          <Pressable
            onPress={closeFocus}
            disabled={!focus}
            style={[styles.feed, { paddingTop: contentTop, paddingBottom: contentBottom }]}
          >
            {shown.map((post, i) => (
              <View
                key={post.id}
                onLayout={(e) => {
                  const { y, height } = e.nativeEvent.layout;
                  layouts.current[post.id] = { y, height };
                  if (i === shown.length - 1) setViewport((v) => ({ ...v }));
                }}
              >
                <UpdatePost
                  post={post}
                  index={i}
                  isLast={i === shown.length - 1}
                  focus={focus}
                  onFocus={onFocus}
                  onFrozen={onFrozen}
                  onToggleCentered={toggleCentered}
                  onClose={closeFocus}
                  mediaPlaying={isActive && isOnScreen(post.id)}
                />
              </View>
            ))}
          </Pressable>
        </ScrollView>
      </BlurTargetView>

      {header}

    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.black },
  feed: { width: '100%' },
  header: {
    position: 'absolute',
    left: 18,
    right: 18,
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 50,
  },
  titleBox: { width: 110, height: 28, justifyContent: 'center' },
  title: {
    position: 'absolute',
    left: 0,
    top: 0,
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 26.4,
    letterSpacing: -0.5,
    color: colors.white,
  },
  searchInput: { flex: 1, height: 36, marginRight: 12, fontFamily: fonts.body, fontSize: 16, color: colors.white, paddingVertical: 0 },
  search: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
});
