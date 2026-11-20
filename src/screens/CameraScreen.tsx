import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEvent } from 'expo';
import { CameraType, CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useVideoPlayer, VideoView } from 'expo-video';
import { CloseIcon, FlipIcon, GalleryIcon } from '../components/icons';
import { MediaOverlays } from '../components/media/MediaOverlays';
import { TextEditorSheet, TextDraft } from '../components/media/TextEditorSheet';
import { CaptionsSheet } from '../components/media/CaptionsSheet';
import { MediaEdits, newEditId, TextOverlay } from '../media/edits';
import { useFrame } from '../layout';
import { feed, fonts } from '../theme';
import type { LocalVideo } from '../api';

/**
 * Camera from Demo13 (Update / Explore → camera).
 *
 * - Preview fills the screen between the status area and 120 px from the bottom.
 * - Close (×) top-left; "Cc" and "Aa" top-right.
 * - Bottom row: gallery, shutter, flip. The shutter starts and stops a clip;
 *   while recording its ring turns red and the centre becomes a red rounded square.
 * - Each finished clip appears as a 64 × 82 thumbnail along the bottom with its
 *   own delete ×; tapping a thumbnail plays it full screen (‹ goes back).
 * - Cc opens the captions sheet for the first clip (shown over its playback); Aa adds text,
 *   which can be dragged on the preview or the clip. Both live in `edits` (owned by App) and
 *   travel with the clip to the composer and the posted item.
 * - Camera-only controls (close, Cc, Aa, gallery, shutter, flip, thumbnails) show only while
 *   the camera itself is in front, never over the composer / selected-video preview.
 * - "Next" appears above flip once there is at least one clip and nothing is
 *   recording. As in Demo13, Next opens the composer with the first clip.
 * - Gallery picks a video from the library and opens the composer with it.
 * - Flip switches front/back (stopping a recording in progress). Starts on the
 *   front camera, as the demo does.
 */

export type Clip = LocalVideo & { id: string };

type Props = {
  /** False while the composer (pushed on top) covers the camera. */
  focused: boolean;
  onClose: () => void;
  onGallery: () => void;
  onNext: (clip: LocalVideo) => void;
  edits: MediaEdits;
  onEditsChange: (edits: MediaEdits) => void;
};

export function CameraScreen({ focused, onClose, onGallery, onNext, edits, onEditsChange }: Props) {
  const frame = useFrame();
  const camera = useRef<CameraView>(null);
  const [camPerm, requestCam] = useCameraPermissions();
  const [micPerm, requestMic] = useMicrophonePermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [ready, setReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [clips, setClips] = useState<Clip[]>([]);
  const [playing, setPlaying] = useState<Clip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [textEditing, setTextEditing] = useState<{ overlay: TextOverlay | null } | null>(null);
  const [captionsOpen, setCaptionsOpen] = useState(false);
  const [playTime, setPlayTime] = useState(0);

  // Ask for camera + microphone when the camera opens (the demo asks the browser the same way).
  useEffect(() => {
    if (camPerm && !camPerm.granted && camPerm.canAskAgain) requestCam();
    if (micPerm && !micPerm.granted && micPerm.canAskAgain) requestMic();
  }, [camPerm, micPerm, requestCam, requestMic]);

  const allowed = !!camPerm?.granted && !!micPerm?.granted;
  const denied = (camPerm && !camPerm.granted && !camPerm.canAskAgain) || (micPerm && !micPerm.granted && !micPerm.canAskAgain);

  const stop = useCallback(() => {
    camera.current?.stopRecording();
  }, []);

  const start = useCallback(async () => {
    if (!camera.current || !ready) return;
    setError(null);
    setRecording(true);
    const startedAt = Date.now();
    try {
      const res = await camera.current.recordAsync();
      const durationMs = Date.now() - startedAt;
      if (res?.uri) {
        setClips((c) => [...c, { id: `clip-${startedAt}`, uri: res.uri, durationMs, mimeType: 'video/mp4' }]);
      }
    } catch {
      setError('Could not start recording.');
    } finally {
      setRecording(false);
    }
  }, [ready]);

  const toggleRecord = () => (recording ? stop() : start());

  const flip = () => {
    if (recording) stop();
    setReady(false);
    setFacing((f) => (f === 'front' ? 'back' : 'front'));
  };

  // Leaving the camera (composer on top, or closing) ends any recording.
  useEffect(() => {
    if (!focused && recording) stop();
  }, [focused, recording, stop]);

  // Shutter: ring white → red, centre 58 px circle → 28 px rounded red square (0.2 s).
  const rec = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(rec, { toValue: recording ? 1 : 0, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: false }).start();
  }, [recording, rec]);

  const deleteClip = (id: string) => {
    setClips((c) => c.filter((x) => x.id !== id));
    if (playing?.id === id) setPlaying(null);
  };

  // ---------- AA / CC ----------
  const previewTop = frame.top(50);
  const previewBottom = frame.bottom(120);
  const previewH = frame.height - previewTop - previewBottom;

  const saveText = (draft: TextDraft) => {
    const existing = textEditing?.overlay;
    onEditsChange({
      ...edits,
      overlays: existing
        ? edits.overlays.map((o) => (o.id === existing.id ? { ...o, ...draft } : o))
        : [...edits.overlays, { id: newEditId('txt'), x: 0.5, y: 0.42, ...draft }],
    });
    setTextEditing(null);
  };
  const deleteText = () => {
    const existing = textEditing?.overlay;
    if (existing) onEditsChange({ ...edits, overlays: edits.overlays.filter((o) => o.id !== existing.id) });
    setTextEditing(null);
  };
  const moveText = (id: string, x: number, y: number) =>
    onEditsChange({ ...edits, overlays: edits.overlays.map((o) => (o.id === id ? { ...o, x, y } : o)) });
  const editable = { onMove: moveText, onEdit: (o: TextOverlay) => setTextEditing({ overlay: o }) };

  const openCaptions = () => {
    if (clips.length === 0) {
      Alert.alert('Record a clip first', 'Captions are timed to your video. Record a clip, then tap Cc.');
      return;
    }
    if (!playing || playing.id !== clips[0].id) setPlaying(clips[0]);
    setCaptionsOpen(true);
  };

  const showNext = clips.length > 0 && !recording;

  return (
    <View style={styles.screen}>
      <View style={[styles.preview, { top: previewTop, bottom: previewBottom }]}>
        {focused && allowed ? (
          <CameraView
            ref={camera}
            style={StyleSheet.absoluteFill}
            facing={facing}
            mode="video"
            onCameraReady={() => setReady(true)}
            onMountError={() => setError('Camera access denied or unavailable. Allow camera permission to record.')}
          />
        ) : null}
        {(error || (camPerm && micPerm && !allowed)) && (
          <Pressable
            style={styles.errorWrap}
            onPress={() => (denied ? Linking.openSettings() : (requestCam(), requestMic()))}
            accessibilityRole="button"
          >
            <Text style={styles.errorText}>
              {error ?? 'Camera access denied or unavailable. Allow camera permission to record.'}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Text added with Aa, over the preview. A sibling (not inside the preview box) so the native camera surface cannot draw over it. */}
      {focused && !playing && (
        <View style={{ position: 'absolute', left: 0, top: previewTop, width: frame.width, height: previewH, zIndex: 15 }} pointerEvents="box-none">
          <MediaOverlays edits={edits} width={frame.width} height={previewH} editable={editable} />
        </View>
      )}

      {focused && !playing && (
        <>
          <Pressable
            onPress={() => {
              if (recording) stop();
              onClose();
            }}
            style={({ pressed }) => [styles.close, { top: frame.top(62) }, pressed && styles.closePressed]}
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={6}
          >
            <CloseIcon />
          </Pressable>

          <View style={[styles.controls, { bottom: frame.bottom(118) }]}>
            <Pressable
              onPress={onGallery}
              style={({ pressed }) => [styles.gallery, pressed && { transform: [{ scale: 0.92 }] }]}
              accessibilityRole="button"
              accessibilityLabel="Gallery"
            >
              <GalleryIcon />
            </Pressable>

            <Pressable
              onPress={toggleRecord}
              disabled={!allowed || !ready}
              accessibilityRole="button"
              accessibilityLabel={recording ? 'Stop recording' : 'Record video'}
              style={({ pressed }) => [pressed && { transform: [{ scale: 0.94 }] }]}
            >
              <Animated.View
                style={[
                  styles.shutter,
                  { borderColor: rec.interpolate({ inputRange: [0, 1], outputRange: ['#FAFAFA', '#FF3B30'] }) },
                ]}
              >
                <Animated.View
                  style={{
                    width: rec.interpolate({ inputRange: [0, 1], outputRange: [58, 28] }),
                    height: rec.interpolate({ inputRange: [0, 1], outputRange: [58, 28] }),
                    borderRadius: rec.interpolate({ inputRange: [0, 1], outputRange: [29, 6] }),
                    backgroundColor: rec.interpolate({ inputRange: [0, 1], outputRange: ['#FAFAFA', '#FF3B30'] }),
                  }}
                />
              </Animated.View>
            </Pressable>

            <Pressable
              onPress={flip}
              style={({ pressed }) => [styles.flip, pressed && { transform: [{ scale: 0.9 }] }]}
              accessibilityRole="button"
              accessibilityLabel="Flip camera"
            >
              <FlipIcon />
            </Pressable>
          </View>

          {showNext && (
            <Pressable
              onPress={() => onNext(clips[0])}
              style={({ pressed }) => [styles.next, { bottom: frame.bottom(178) }, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
              accessibilityLabel="Next"
            >
              <Text style={styles.nextText}>Next</Text>
            </Pressable>
          )}
        </>
      )}

      {focused && playing && (
        <ClipPlayback
          clip={playing}
          top={frame.top(24)}
          onBack={() => {
            setPlaying(null);
            setCaptionsOpen(false);
          }}
          edits={edits}
          rect={{ top: previewTop, width: frame.width, height: previewH }}
          editable={editable}
          onTime={setPlayTime}
        />
      )}

      {/* Cc / Aa: camera and clip-review stage only (not on the composer selected-video preview). */}
      {focused && !textEditing && !captionsOpen && (
        <View style={[styles.tools, { top: frame.top(56) }]}>
          <Pressable onPress={openCaptions} hitSlop={8} accessibilityRole="button" accessibilityLabel="Closed captions" style={styles.toolBtn}>
            <Text style={[styles.tool, edits.captions.length > 0 && edits.captionsOn && styles.toolOn]}>Cc</Text>
          </Pressable>
          <Pressable onPress={() => setTextEditing({ overlay: null })} hitSlop={8} accessibilityRole="button" accessibilityLabel="Add text" style={styles.toolBtn}>
            <Text style={[styles.tool, edits.overlays.length > 0 && styles.toolOn]}>Aa</Text>
          </Pressable>
        </View>
      )}

      {focused && !playing && clips.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.thumbs, { bottom: frame.bottom(18) }]}
          contentContainerStyle={styles.thumbsContent}
        >
          {clips.map((clip) => (
            <ClipThumb
              key={clip.id}
              clip={clip}
              selected={false}
              onPress={() => setPlaying(clip)}
              onDelete={() => deleteClip(clip.id)}
            />
          ))}
        </ScrollView>
      )}

      {focused && textEditing && (
        <TextEditorSheet
          top={frame.top(50)}
          initial={textEditing.overlay}
          onDone={saveText}
          onDelete={textEditing.overlay ? deleteText : undefined}
          onClose={() => setTextEditing(null)}
        />
      )}
      {focused && captionsOpen && playing && (
        <CaptionsSheet edits={edits} videoUri={clips[0]?.uri ?? playing.uri} currentTime={playTime} onChange={onEditsChange} onClose={() => setCaptionsOpen(false)} />
      )}
    </View>
  );
}

function ClipThumb({ clip, selected, onPress, onDelete }: { clip: Clip; selected: boolean; onPress: () => void; onDelete: () => void }) {
  // A paused player parked just after the first frame stands in for a poster image.
  const player = useVideoPlayer(clip.uri, (p) => {
    p.muted = true;
    p.currentTime = 0.1;
  });
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Play clip"
      style={[styles.thumb, selected && { transform: [{ scale: 1.05 }] }]}
    >
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} pointerEvents="none" />
      <Pressable onPress={onDelete} style={styles.thumbX} hitSlop={6} accessibilityRole="button" accessibilityLabel="Delete recording">
        <CloseIcon size={12} color="#fff" strokeWidth={2.2} />
      </Pressable>
    </Pressable>
  );
}

type PlaybackProps = {
  clip: Clip;
  top: number;
  onBack: () => void;
  edits: MediaEdits;
  /** The same rectangle as the camera preview, so text sits where it was placed there. */
  rect: { top: number; width: number; height: number };
  editable: { onMove: (id: string, x: number, y: number) => void; onEdit: (o: TextOverlay) => void };
  onTime: (t: number) => void;
};

function ClipPlayback({ clip, top, onBack, edits, rect, editable, onTime }: PlaybackProps) {
  const player = useVideoPlayer(clip.uri, (p) => {
    p.loop = true;
    p.timeUpdateEventInterval = 0.2;
    p.play();
  });
  const time = useEvent(player, 'timeUpdate');
  const t = time?.currentTime ?? 0;
  useEffect(() => onTime(t), [t, onTime]);
  return (
    <View style={[StyleSheet.absoluteFill, styles.playback]}>
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls />
      <View style={{ position: 'absolute', left: 0, top: rect.top, width: rect.width, height: rect.height }} pointerEvents="box-none">
        <MediaOverlays edits={edits} width={rect.width} height={rect.height} currentTime={t} editable={editable} />
      </View>
      <Pressable onPress={onBack} style={[styles.playbackBack, { top }]} accessibilityRole="button" accessibilityLabel="Back to camera">
        <Text style={styles.playbackBackText}>‹</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: feed.black },
  preview: { position: 'absolute', left: 0, right: 0, backgroundColor: '#0A0A0C', overflow: 'hidden' },
  errorWrap: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorText: { color: 'rgba(250,250,250,0.8)', fontFamily: fonts.inter, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  close: { position: 'absolute', left: 22, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', zIndex: 20 },
  closePressed: { backgroundColor: 'rgba(255,255,255,0.12)', transform: [{ scale: 0.9 }] },
  tools: { position: 'absolute', right: 14, gap: 4, alignItems: 'center', zIndex: 50 },
  toolBtn: { minWidth: 36, minHeight: 32, alignItems: 'center', justifyContent: 'center' },
  toolOn: { color: '#22D3EE' },
  tool: {
    fontFamily: fonts.groteskSemiBold,
    fontSize: 15,
    color: '#FAFAFA',
    paddingVertical: 4,
    paddingHorizontal: 6,
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 74,
    paddingHorizontal: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  gallery: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(30,30,35,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: { width: 74, height: 74, borderRadius: 37, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  // The flip column is 44 wide in the demo; the 40 px button sits centred in it.
  flip: { width: 40, height: 40, marginRight: 2, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  next: {
    position: 'absolute',
    right: 22,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    zIndex: 30,
  },
  nextText: { fontFamily: fonts.interBold, fontSize: 15, color: '#111111' },
  thumbs: { position: 'absolute', left: 16, right: 16, height: 82, zIndex: 40, overflow: 'visible' },
  thumbsContent: { paddingHorizontal: 16, gap: 12, alignItems: 'center' },
  thumb: {
    width: 64,
    height: 82,
    borderRadius: 10,
    backgroundColor: '#1A1A22',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  thumbX: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playback: { backgroundColor: '#090C12', zIndex: 35 },
  playbackBack: {
    position: 'absolute',
    left: 18,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playbackBackText: { color: '#fff', fontSize: 28, lineHeight: 30, marginTop: -3 },
});
