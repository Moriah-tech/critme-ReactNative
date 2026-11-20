import React, { ComponentRef, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Line } from 'react-native-svg';
import { Backdrop } from '../components/Glass';
import { useFrame } from '../layout';
import { useKeyboardInset } from '../useKeyboardInset';
import { feed, fonts } from '../theme';
import type { StoryDraft } from '../feed/types';

/**
 * Story editor from Demo13 (+ → Story).
 *
 * Top bar: × (close) on the left; Topic and Next on the right. Topic opens a
 * dropdown of ten topics under it; the chosen topic replaces the "Topic" label
 * and is highlighted in cyan in the list. Below: the headline (Space Grotesk
 * 28/700, grey "Headline" placeholder), an image slot with a cyan-ringed + button,
 * then the body text (Inter 16.5, cyan caret), which has focus when the editor
 * opens, as in the demo.
 *
 * Next publishes the story (image, headline, text, topic) through onPublish; App
 * puts it in the shared feed store and Home slides to its Stories page.
 */

export const STORY_TOPICS = [
  'Business',
  'Health',
  'Sports',
  'Technology',
  'Entertainment',
  'News',
  'Education',
  'Lifestyle',
  'Science',
  'Politics',
] as const;
export type StoryTopic = (typeof STORY_TOPICS)[number];

const CYAN = '#22D3EE';

type Props = { onClose: () => void; onPublish: (story: StoryDraft) => void };

export function StoryEditorScreen({ onClose, onPublish }: Props) {
  const frame = useFrame();
  const root = useRef<ComponentRef<typeof View>>(null);
  const kbInset = useKeyboardInset(root);
  const [topic, setTopic] = useState<StoryTopic | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState<{ uri: string; width: number; height: number } | null>(null);
  const bodyInput = useRef<ComponentRef<typeof TextInput>>(null);

  // The demo opens with the caret in the body and the keyboard up. autoFocus alone
  // is unreliable on a screen that mounts mid-transition, so focus once it has settled.
  useEffect(() => {
    const t = setTimeout(() => bodyInput.current?.focus(), 250);
    return () => clearTimeout(t);
  }, []);

  const menu = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(menu, { toValue: menuOpen ? 1 : 0, duration: 180, useNativeDriver: true }).start();
  }, [menuOpen, menu]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow access to your photos.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1 });
    if (res.canceled || !res.assets[0]) return;
    const a = res.assets[0];
    setImage({ uri: a.uri, width: a.width || 1, height: a.height || 1 });
  };

  const publish = () => {
    const h = headline.trim();
    const b = body.trim();
    if (!h && !b && !image) {
      Alert.alert('Nothing to publish', 'Add a headline, some text or an image first.');
      return;
    }
    Keyboard.dismiss();
    onPublish({ topic, headline: h, body: b, image });
  };

  const navTop = frame.top(50);
  const contentWidth = frame.width - 48;

  return (
    <View ref={root} style={styles.screen}>
      {/* Top bar */}
      <View style={[styles.nav, { top: navTop }]}>
        <Pressable onPress={onClose} style={({ pressed }) => [styles.navBtn, styles.closeBtn, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Close" hitSlop={6}>
          <Text style={styles.closeText}>×</Text>
        </Pressable>
        <View style={styles.navRight}>
          <View>
            <Pressable
              onPress={() => setMenuOpen((o) => !o)}
              style={({ pressed }) => [styles.navBtn, menuOpen && styles.topicOpen, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={topic ? `Topic: ${topic}` : 'Choose topic'}
              accessibilityState={{ expanded: menuOpen }}
            >
              <Text style={styles.topicText}>{topic ?? 'Topic'}</Text>
            </Pressable>
          </View>
          <Pressable onPress={publish} style={({ pressed }) => [styles.navBtn, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Next">
            <Text style={styles.nextText}>Next</Text>
          </Pressable>
        </View>
      </View>

      {/* Editor */}
      <ScrollView
        style={[styles.editor, { top: navTop + 48, bottom: kbInset }]}
        contentContainerStyle={styles.editorContent}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          value={headline}
          onChangeText={setHeadline}
          placeholder="Headline"
          placeholderTextColor="#52525B"
          multiline
          style={styles.headline}
          selectionColor={CYAN}
          cursorColor={CYAN}
          keyboardAppearance="dark"
          accessibilityLabel="Headline"
        />

        <View style={styles.imageSlot}>
          {image ? (
            <Pressable onPress={pickImage} accessibilityRole="button" accessibilityLabel="Change image">
              <Image
                source={{ uri: image.uri }}
                style={{ width: contentWidth, height: (contentWidth * image.height) / image.width, borderRadius: 12 }}
                resizeMode="cover"
              />
            </Pressable>
          ) : (
            <Pressable
              onPress={pickImage}
              style={({ pressed }) => [styles.addImage, pressed && { transform: [{ scale: 0.94 }] }]}
              accessibilityRole="button"
              accessibilityLabel="Add image"
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" stroke={CYAN} strokeWidth={2} strokeLinecap="round">
                <Line x1="12" y1="5" x2="12" y2="19" />
                <Line x1="5" y1="12" x2="19" y2="12" />
              </Svg>
            </Pressable>
          )}
        </View>

        <TextInput
          ref={bodyInput}
          value={body}
          onChangeText={setBody}
          multiline
          scrollEnabled={false}
          style={styles.body}
          selectionColor={CYAN}
          cursorColor={CYAN}
          keyboardAppearance="dark"
          accessibilityLabel="Story text"
        />
      </ScrollView>

      {/* Topic dropdown (tap outside to close) */}
      {menuOpen && <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenuOpen(false)} accessibilityLabel="Close topics" />}
      <Animated.View
        pointerEvents={menuOpen ? 'auto' : 'none'}
        style={[
          styles.dropdown,
          {
            top: navTop + 48,
            opacity: menu,
            transform: [
              { translateY: menu.interpolate({ inputRange: [0, 1], outputRange: [-6, 0] }) },
              { scale: menu.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) },
            ],
          },
        ]}
      >
        <View style={[StyleSheet.absoluteFill, styles.dropdownGlass]} pointerEvents="none">
          <Backdrop blur={24} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(22,22,26,0.92)' }]} />
        </View>
        {STORY_TOPICS.map((t) => {
          const selected = topic === t;
          return (
            <Pressable
              key={t}
              onPress={() => {
                setTopic(t);
                setMenuOpen(false);
              }}
              style={({ pressed }) => [styles.topicItem, selected && styles.topicSelected, pressed && styles.topicPressed]}
              accessibilityRole="menuitem"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.topicItemText, selected && { color: CYAN }]}>{t}</Text>
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: feed.black },
  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 48,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  navBtn: { paddingVertical: 6, paddingHorizontal: 4, borderRadius: 8 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.96 }] },
  closeBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  closeText: { fontFamily: 'Inter_400Regular', fontSize: 22, lineHeight: 22, color: '#FAFAFA' },
  topicOpen: { backgroundColor: 'rgba(255,255,255,0.06)' },
  topicText: { fontFamily: fonts.interMedium, fontSize: 16, color: '#FAFAFA' },
  nextText: { fontFamily: fonts.interSemiBold, fontSize: 16, color: CYAN },
  editor: { position: 'absolute', left: 0, right: 0 },
  editorContent: { paddingTop: 12, paddingHorizontal: 24, paddingBottom: 24 },
  headline: {
    fontFamily: fonts.groteskBold,
    fontSize: 28,
    lineHeight: 35,
    letterSpacing: -0.3,
    color: '#FAFAFA',
    paddingTop: 4,
    paddingBottom: 8,
    paddingHorizontal: 0,
    minHeight: 36,
  },
  imageSlot: { paddingTop: 28, paddingBottom: 32, alignItems: 'center', justifyContent: 'center' },
  addImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(20,28,32,0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(34,211,238,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CYAN,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  body: {
    fontFamily: fonts.inter,
    fontSize: 16.5,
    lineHeight: 25.6,
    color: '#E4E4E7',
    paddingTop: 4,
    paddingHorizontal: 0,
    minHeight: 160,
    textAlignVertical: 'top',
  },
  dropdown: {
    position: 'absolute',
    // Right edge lines up with the Topic button (20 px padding + Next 44 px + 18 px gap).
    right: 20 + 44 + 18,
    width: 168,
    marginTop: 8,
    padding: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
    zIndex: 20,
  },
  dropdownGlass: { borderRadius: 13, overflow: 'hidden' },
  topicItem: { paddingVertical: 11, paddingHorizontal: 14, borderRadius: 9 },
  topicSelected: { backgroundColor: 'rgba(34,211,238,0.1)' },
  topicPressed: { backgroundColor: 'rgba(34,211,238,0.12)' },
  topicItemText: { fontFamily: fonts.interMedium, fontSize: 14.5, color: '#E4E4E7' },
});
