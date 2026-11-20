import React, { ComponentRef, useEffect, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardInset } from '../useKeyboardInset';
import Svg, { Path } from 'react-native-svg';
import { CritHeader } from '../components/CritAvatar';
import { GradientButton } from '../components/GradientButton';
import { InitializingView } from '../components/InitializingView';
import { InputBar, InputBarHandle } from '../components/InputBar';
import { MessageBubble } from '../components/MessageBubble';
import { Orb } from '../components/Orb';
import { TakesCarousel } from '../components/TakesCarousel';
import { VideoStage } from '../components/VideoStage';
import { useCritFlow } from '../hooks/useCritFlow';
import { colors } from '../theme';
import type { LocalVideo, Post } from '../api';
import type { MediaEdits } from '../media/edits';

type Props = {
  video: LocalVideo;
  /** AA text / CC captions from the camera, shown over the preview and kept with the post. */
  edits?: MediaEdits;
  onClose: () => void;
  onPosted: (post: Post) => void;
};

/**
 * Composer → Crit's takes → Upload, all on one screen. The video stays at the
 * top and the sheet below it changes with each step.
 */
export function CreateScreen({ video, edits, onClose, onPosted }: Props) {
  const insets = useSafeAreaInsets();
  const flow = useCritFlow(video);
  const [editing, setEditing] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const inputRef = useRef<InputBarHandle>(null);
  const root = useRef<ComponentRef<typeof View>>(null);
  // Same keyboard handling as the feed and story editor: measure how much of this screen the
  // keyboard covers. KeyboardAvoidingView does nothing on Android (edge-to-edge window), so the
  // caption bar stayed at the bottom behind the keyboard.
  const kbInset = useKeyboardInset(root);

  useEffect(() => {
    flow.startUpload().catch(() => {}); // upload in the background while they type
  }, [flow.startUpload]);

  const onSend = (text: string) => {
    flow.setMessage(text);
    setSentCount((c) => c + 1);
    setEditing(false);
  };

  // Shared by the on-screen ← arrow and Android's hardware back button.
  const onBack = () => {
    // Publishing (or just posted): let it finish, so nothing is half-posted.
    if (flow.phase === 'publishing' || flow.phase === 'posted') return;
    if (editing) return setEditing(false);
    if (flow.phase === 'takes') return flow.backToCompose();
    if (flow.message) {
      Alert.alert('Discard this post?', 'Your video and message will be lost.', [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: onClose },
      ]);
      return;
    }
    onClose();
  };

  // Android hardware back. Always handled here, so the app never closes mid-post.
  // No dependency list: re-registers each render so it always sees the latest state.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  });

  const upload = async () => {
    const post = await flow.publish();
    if (post) onPosted(post);
  };

  const inCompose = flow.phase === 'compose';
  const showTakes = flow.phase === 'takes' || flow.phase === 'publishing';
  const hasMessage = flow.message.length > 0;

  return (
    <View ref={root} style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.top}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.back} accessibilityLabel="Back">
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path d="M15 5l-7 7 7 7" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        </Pressable>
        <VideoStage uri={video.uri} edits={edits} />
      </View>

      <View style={[styles.sheet, { paddingBottom: kbInset }]}>
        <View style={styles.sheetBody}>
          {inCompose ? (
            <View style={styles.compose}>
              <Orb onPress={() => setEditing(true)} />
              {hasMessage && !editing ? (
                <MessageBubble
                  text={flow.message}
                  glow
                  tail="left"
                  popKey={sentCount}
                  onPress={() => setEditing(true)}
                  style={styles.messageGap}
                />
              ) : !editing ? (
                <Text style={styles.hint}>Tap the bubble to say something</Text>
              ) : null}
              {flow.error ? <Text style={styles.error}>{flow.error}</Text> : null}
            </View>
          ) : null}

          {flow.phase === 'initializing' ? (
            <View style={styles.center}>
              <InitializingView />
            </View>
          ) : null}

          {showTakes ? (
            <View style={styles.center}>
              <CritHeader />
              <TakesCarousel takes={flow.takes} onIndexChange={flow.setTakeIndex} />
              {flow.error ? <Text style={styles.error}>{flow.error}</Text> : null}
            </View>
          ) : null}
        </View>

        {editing ? (
          <View style={{ paddingBottom: kbInset > 0 ? 0 : Math.max(insets.bottom, 8) }}>
            <InputBar ref={inputRef} initialText={flow.message} onSend={onSend} />
          </View>
        ) : (
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
            {showTakes ? (
              <>
                <Text style={styles.caption}>{'You can always reply me\nin the comment section.'}</Text>
                <GradientButton label="Upload" tone="muted" onPress={upload} loading={flow.phase === 'publishing'} />
              </>
            ) : inCompose && hasMessage ? (
              <>
                <View />
                <GradientButton label="Initialize" tone="bright" onPress={flow.initialize} />
              </>
            ) : null}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  top: { alignItems: 'center', paddingTop: 14, paddingBottom: 18 },
  back: { position: 'absolute', left: 16, top: 18, zIndex: 2, padding: 4 },
  sheet: {
    flex: 1,
    backgroundColor: colors.sheet,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: colors.sheetBorder,
  },
  sheetBody: { flex: 1, justifyContent: 'center' },
  compose: { alignItems: 'center', paddingHorizontal: 24 },
  messageGap: { marginTop: 22, maxWidth: '82%' },
  hint: { marginTop: 16, color: colors.textMuted, fontSize: 13 },
  center: { alignItems: 'center' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 26,
    paddingTop: 8,
    minHeight: 60,
  },
  caption: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  error: { marginTop: 12, color: '#F87171', fontSize: 12, textAlign: 'center' },
});
