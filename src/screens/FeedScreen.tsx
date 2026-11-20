import React, { ComponentRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Keyboard, PanResponder, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurTargetView } from 'expo-blur';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { BubbleMessageBar } from '../components/feed/BubbleMessageBar';
import { CreatorStrip } from '../components/feed/CreatorStrip';
import { CritMeter, CritMeterHandle } from '../components/feed/CritMeter';
import { FeedHeader, FeedTab } from '../components/feed/FeedHeader';
import { StoriesPage, StoryViewer } from '../components/feed/StoriesPage';
import { MediaOverlays } from '../components/media/MediaOverlays';
import { BubbleRect, BubbleSpec, FloatingBubbles, FloatingBubblesHandle } from '../components/feed/FloatingBubbles';
import { OrbitButton } from '../components/feed/OrbitButton';
import { ProgressBar } from '../components/feed/ProgressBar';
import { ReplyField } from '../components/feed/ReplyField';
import { Toast } from '../components/feed/Toast';
import { CommentSheet } from '../components/comments/CommentSheet';
import { Backdrop, BlurTargetProvider } from '../components/Glass';
import { useFrame } from '../layout';
import { useKeyboardInset } from '../useKeyboardInset';
import { feed } from '../theme';
import type { FeedStore } from '../feed/useFeedStore';
import type { ReplyTarget, Story } from '../feed/types';

/**
 * Home: a two-page pager. Page 0 is the Explore feed below; page 1 is the Stories
 * page (StoriesPage). Both tabs stay in the header and their emphasis follows the
 * swipe. Home feed (Explore), rebuilt from Demo13's "3.7 — Comments" phone.
 *
 * Layers, back to front: video (cover) → vignette → gesture layer → drifting
 * bubbles → orbit button → focus backdrop → Crit Meter → tabs → creator strip
 * and time bar → message bar → reply field → comment sheet → toast.
 * The bottom nav is App's shared BottomNav; this screen tells App when to hide
 * it (comment sheet open, replying).
 *
 * Gestures on the video (same thresholds as the demo): swipe up ≥ 56 px →
 * "CritMe" header; swipe left ≥ 56 px → slide to the Stories page (and bring the
 * tabs back; swiping right on Stories slides back to Explore); double tap (< 320 ms, < 40 px apart) → Crit Meter pop.
 */

/**
 * Demo y of the Explore / Stories row (and the CritMe title that replaces it). The Orbit button
 * sits 3 px lower so both share a centre line (30 px tall each). Demo13 has 60; 72 puts the row
 * 12 px lower while still ending 6 px above the Crit Meter (top 108).
 */
const HEADER_ROW_Y = 72;

const BUBBLES: BubbleSpec[] = [
  // Demo13 start positions and headings: creator (200,540) at 0.4π, Crit (280,540) at 1.25π.
  { id: 'creator', kind: 'creator', start: { x: 200, y: 540 }, angle: Math.PI * 0.4 },
  { id: 'crit', kind: 'crit', start: { x: 280, y: 540 }, angle: Math.PI * 1.25 },
];

type Props = {
  store: FeedStore;
  /** False while another tab or a pushed screen covers the feed. */
  focused: boolean;
  onChromeHiddenChange: (hidden: boolean) => void;
  /** Bumped by App after Upload, so the feed can show the toast and open Crit's bar. */
  postedKey: number;
  /** + menu open: Demo13 hides the creator strip's contents and the time bar so the menu sits clear. */
  menuOpen: boolean;
  /** Bumped by App after the Story Editor publishes, so Home slides to the Stories page. */
  storiesKey: number;
};

export function FeedScreen({ store, focused, onChromeHiddenChange, postedKey, menuOpen, storiesKey }: Props) {
  const frame = useFrame();
  const root = useRef<ComponentRef<typeof View>>(null);
  // What the feed's glass (focus backdrop, message bar, reply field, sheet) blurs on Android.
  const blurTarget = useRef<ComponentRef<typeof View>>(null);
  const kbInset = useKeyboardInset(root);
  const item = store.items[0];
  const comments = store.comments[item.id] ?? [];

  // ---------- video ----------
  const player = useVideoPlayer(item.video, (p) => {
    p.loop = true;
    p.timeUpdateEventInterval = 0.1;
  });
  // The video plays only while Home is showing its Explore page.
  const [page, setPage] = useState<FeedTab>('explore');
  const exploreActive = focused && page === 'explore';
  useEffect(() => {
    if (exploreActive) player.play();
    else player.pause();
  }, [exploreActive, player]);
  const time = useEvent(player, 'timeUpdate');
  const progress = time && player.duration > 0 ? time.currentTime / player.duration : 0;

  // ---------- header / gestures ----------
  // Pager position: 0 = Explore, 1 = Stories. Drives both page slides and the header emphasis.
  const pageAnim = useRef(new Animated.Value(0)).current;
  const pageRef = useRef<FeedTab>('explore');
  const widthRef = useRef(frame.width);
  widthRef.current = frame.width;
  const settle = useCallback(
    (p: FeedTab) => {
      Animated.timing(pageAnim, { toValue: p === 'stories' ? 1 : 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    },
    [pageAnim],
  );
  const goTo = useCallback(
    (p: FeedTab) => {
      pageRef.current = p;
      setPage(p);
      settle(p);
    },
    [settle],
  );
  const [critMe, setCritMe] = useState(false);
  const meter = useRef<CritMeterHandle>(null);
  const lastTap = useRef({ t: 0, x: 0, y: 0 });
  const gesture = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_e, g) => {
          // The page follows a left drag, as a pager does.
          if (g.dx < 0 && Math.abs(g.dx) > Math.abs(g.dy) * 1.15 && Math.abs(g.dx) > 14) {
            pageAnim.setValue(Math.min(1, -g.dx / widthRef.current));
          }
        },
        onPanResponderTerminate: () => settle(pageRef.current),
        onPanResponderRelease: (e, g) => {
          const adx = Math.abs(g.dx);
          const ady = Math.abs(g.dy);
          const { pageX, pageY, timestamp } = e.nativeEvent;
          if (adx < 14 && ady < 14) {
            const prev = lastTap.current;
            if (timestamp - prev.t < 320 && Math.abs(pageX - prev.x) < 40 && Math.abs(pageY - prev.y) < 40) {
              lastTap.current = { t: 0, x: 0, y: 0 };
              meter.current?.pop();
            } else {
              lastTap.current = { t: timestamp, x: pageX, y: pageY };
            }
            return;
          }
          if (ady >= 56 && ady > adx * 1.15 && g.dy < 0) {
            setCritMe(true);
            settle(pageRef.current);
            return;
          }
          if (adx >= 56 && adx > ady * 1.15 && g.dx < 0) {
            goTo('stories');
            setCritMe(false);
            return;
          }
          settle(pageRef.current);
        },
      }),
    [pageAnim, settle, goTo],
  );

  // Swiping right on the Stories page slides back to Explore. A vertical drag is left to its ScrollView.
  // PanResponder resets dx to 0 when it grants the gesture, so the distance already travelled when
  // it claimed (preDx) is added back; otherwise a fast swipe reads as almost no movement.
  const preDx = useRef(0);
  const storiesGesture = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) => {
          const claim = g.dx > 12 && g.dx > Math.abs(g.dy) * 1.5;
          if (claim) preDx.current = g.dx;
          return claim;
        },
        onPanResponderMove: (_e, g) => pageAnim.setValue(Math.max(0, Math.min(1, 1 - (preDx.current + g.dx) / widthRef.current))),
        onPanResponderTerminate: () => settle(pageRef.current),
        onPanResponderRelease: (_e, g) => {
          if (preDx.current + g.dx >= 56) goTo('explore');
          else settle(pageRef.current);
        },
      }),
    [pageAnim, settle, goTo],
  );

  /**
   * Orbit button → Explore. Demo13 meant it to open a separate "3.8 — Explore"
   * screen that is not in the file, so it brings the feed to its Explore view:
   * Explore tab selected and the tabs shown (leaving CritMe mode).
   */
  const openExplore = useCallback(() => {
    goTo('explore');
    setCritMe(false);
  }, [goTo]);

  // ---------- bubbles & message bar ----------
  const bubbles = useRef<FloatingBubblesHandle>(null);
  const [focus, setFocus] = useState<{ id: ReplyTarget; rect: BubbleRect } | null>(null);
  const [replying, setReplying] = useState(false);
  const [fieldTop, setFieldTop] = useState<number | null>(null);

  const closeBar = useCallback(() => {
    setReplying(false);
    setFocus(null);
    setFieldTop(null);
    Keyboard.dismiss();
  }, []);

  const onBubble = useCallback(
    (id: string, rect: BubbleRect) => {
      if (replying) return;
      setFocus((f) => (f?.id === id ? null : { id: id as ReplyTarget, rect }));
    },
    [replying],
  );

  // A keyboard closed by the system (Android back) ends the reply.
  useEffect(() => {
    const sub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => {
      setReplying((r) => {
        if (r) {
          setFocus(null);
          setFieldTop(null);
        }
        return false;
      });
    });
    return () => sub.remove();
  }, []);

  // ---------- comments ----------
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scrollTopKey, setScrollTopKey] = useState(0);

  const send = useCallback(
    (text: string) => {
      if (!focus) return;
      store.addComment(item.id, text, focus.id);
      closeBar();
      setTimeout(() => {
        setSheetOpen(true);
        setScrollTopKey((k) => k + 1);
      }, 380);
    },
    [focus, store, item.id, closeBar],
  );

  // ---------- stories ----------
  const [viewing, setViewing] = useState<Story | null>(null);
  useEffect(() => {
    if (!storiesKey) return;
    goTo('stories');
    setCritMe(false);
  }, [storiesKey, goTo]);
  useEffect(() => {
    if (!focused) setViewing(null);
  }, [focused]);
  const closeStory = useCallback(() => setViewing(null), []);

  // ---------- after Upload ----------
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!postedKey) return;
    setSheetOpen(false);
    closeBar();
    setToast('Posted to Explore');
    const t = setTimeout(() => {
      const rect = bubbles.current?.rectOf('crit');
      if (rect) setFocus({ id: 'crit', rect });
    }, 1400);
    return () => clearTimeout(t);
  }, [postedKey, closeBar]);

  // Leaving the feed (or sliding to Stories) closes transient UI.
  useEffect(() => {
    if (!exploreActive) {
      closeBar();
      setSheetOpen(false);
    }
  }, [exploreActive, closeBar]);

  const chromeHidden = sheetOpen || replying || !!viewing;
  useEffect(() => onChromeHiddenChange(chromeHidden), [chromeHidden, onChromeHiddenChange]);

  // ---------- layout ----------
  const lane = useMemo(
    () => ({ top: frame.fromBottom(502), bottom: frame.fromBottom(690), left: 14, right: frame.width - 14 }),
    [frame],
  );
  const replyBottom =replying && fieldTop != null ? fieldTop - 10 : null;
  const stats = { ...item.stats, comments: item.isOwn ? comments.length : item.stats.comments };

  return (
    <BlurTargetProvider target={blurTarget}>
    <View ref={root} style={styles.screen}>
      {/* Page 0: Explore. Slides left as the pager moves to Stories. */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { transform: [{ translateX: pageAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -frame.width] }) }] }]}
        pointerEvents={page === 'explore' ? 'auto' : 'none'}
      >
      <BlurTargetView ref={blurTarget} style={StyleSheet.absoluteFill} pointerEvents="none">
        <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
        <Vignette />
        {item.edits && <MediaOverlays edits={item.edits} width={frame.width} height={frame.height} currentTime={time?.currentTime ?? 0} captionBottom={frame.bottom(190)} />}
      </BlurTargetView>

      <View style={StyleSheet.absoluteFill} {...gesture.panHandlers} />

      {!sheetOpen && (
        <FloatingBubbles
          ref={bubbles}
          bubbles={BUBBLES}
          lane={lane}
          frozen={!exploreActive || !!focus}
          selectedId={focus?.id ?? null}
          onPress={onBubble}
        />
      )}

      <OrbitButton top={frame.top(HEADER_ROW_Y + 3)} onPress={openExplore} active={focused} />

      {focus && (
        <Pressable
          style={[StyleSheet.absoluteFill, styles.focusLayer]}
          onPress={closeBar}
          accessibilityRole="button"
          accessibilityLabel="Close message"
        >
          <FocusBackdrop fadeTop={frame.height - frame.bottom(215)} fadeBottom={frame.height - frame.bottom(165)} height={frame.height} />
        </Pressable>
      )}

      <CritMeter key={item.id} ref={meter} score={item.meterScore} top={frame.top(108)} active={focused} />

      {!sheetOpen && !menuOpen && (
        <>
          <CreatorStrip
            name={item.creatorName}
            bottom={frame.bottom(100)}
            stats={stats}
            onOpenComments={() => {
              closeBar();
              setSheetOpen(true);
            }}
          />
          <ProgressBar
            progress={progress}
            bottom={frame.bottom(88.7)}
            onSeek={(f) => {
              if (player.duration > 0) player.currentTime = f * player.duration;
            }}
          />
        </>
      )}

      {focus && (
        <BubbleMessageBar
          key={`${item.id}-${focus.id}`}
          variant={focus.id === 'crit' ? 'crit' : 'creator'}
          name={focus.id === 'crit' ? 'Crit' : item.creatorShortName}
          text={focus.id === 'crit' ? item.critTake : item.creatorMessage}
          anchor={focus.rect}
          screen={{ width: frame.width, height: frame.height, topLimit: frame.top(52) }}
          replyBottom={replyBottom}
          onPress={() => {
            if (!replying) setReplying(true);
          }}
        />
      )}

      {replying && <ReplyField bottom={kbInset + 8} onSend={send} onLayoutTop={setFieldTop} />}

      <CommentSheet
        open={sheetOpen}
        screenHeight={frame.height}
        comments={comments}
        newIds={store.newIds}
        scrollToTopKey={scrollTopKey}
        onClose={() => setSheetOpen(false)}
        onToggleStar={(id) => store.toggleStar(item.id, id)}
      />

      </Animated.View>

      {/* Page 1: Stories. Slides in from the right. */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { transform: [{ translateX: pageAnim.interpolate({ inputRange: [0, 1], outputRange: [frame.width, 0] }) }] }]}
        pointerEvents={page === 'stories' ? 'auto' : 'none'}
        {...storiesGesture.panHandlers}
      >
        <StoriesPage stories={store.stories} top={frame.top(108)} bottom={frame.bottom(120)} width={frame.width} onOpen={setViewing} />
      </Animated.View>

      <FeedHeader
        top={frame.top(HEADER_ROW_Y)}
        tab={page}
        progress={pageAnim}
        critMeMode={critMe}
        onTab={(t) => {
          goTo(t);
          setCritMe(false);
        }}
      />

      {viewing && <StoryViewer story={viewing} top={frame.top(62)} width={frame.width} onClose={closeStory} />}

      <Toast message={toast} top={frame.top(110)} onDone={() => setToast(null)} />
    </View>
    </BlurTargetProvider>
  );
}

/**
 * Bubble-focus backdrop: 42 % black plus a 12 px blur, both fading out between
 * 215 and 165 px from the bottom so the creator strip and nav stay sharp
 * (Demo13 uses a CSS mask). A blur can't take a gradient mask here, so the
 * fade is five strips of decreasing blur.
 */
function FocusBackdrop({ fadeTop, fadeBottom, height }: { fadeTop: number; fadeBottom: number; height: number }) {
  const band = (fadeBottom - fadeTop) / 5;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: fadeTop }}>
        <Backdrop blur={12} />
      </View>
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={i} style={{ position: 'absolute', left: 0, right: 0, top: fadeTop + i * band, height: band }}>
          <Backdrop blur={12 * (1 - (i + 0.5) / 5)} />
        </View>
      ))}
      <LinearGradient
        colors={['rgba(0,0,0,0.42)', 'rgba(0,0,0,0.42)', 'rgba(0,0,0,0)']}
        locations={[0, fadeTop / height, fadeBottom / height]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

/** Demo13 vignette: dark at the top and bottom edges plus a soft radial falloff. */
function Vignette() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['rgba(5,5,6,0.55)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(5,5,6,0.5)']}
        locations={[0, 0.18, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <RadialGradient id="vig" cx="50%" cy="40%" rx="80%" ry="50%">
            <Stop offset="0.4" stopColor="#000" stopOpacity={0} />
            <Stop offset="1" stopColor="rgb(5,5,6)" stopOpacity={0.25} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#vig)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: feed.black, overflow: 'hidden' },
  focusLayer: { zIndex: 25 },
});
