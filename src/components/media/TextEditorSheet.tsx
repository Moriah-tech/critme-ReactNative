import React, { ComponentRef, useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MAX_TEXT_SIZE, MIN_TEXT_SIZE, TEXT_COLORS, TEXT_STYLES, TextOverlay, TextStyleKey } from '../../media/edits';
import { useKeyboardInset } from '../../useKeyboardInset';
import { textStyleFor } from './MediaOverlays';
import { fonts } from '../../theme';

/**
 * AA: write text, pick its colour, size and style. Full-screen over the camera / clip; the
 * toolbar rides above the keyboard (same useKeyboardInset the rest of the app uses).
 * Done hands the result back; the text is then dragged into place on the media itself.
 */

export type TextDraft = Pick<TextOverlay, 'text' | 'color' | 'size' | 'style'>;

type Props = {
  initial?: TextOverlay | null;
  onDone: (draft: TextDraft) => void;
  onDelete?: () => void;
  onClose: () => void;
  top: number;
};

export function TextEditorSheet({ initial, onDone, onDelete, onClose, top }: Props) {
  const root = useRef<ComponentRef<typeof View>>(null);
  const kbInset = useKeyboardInset(root);
  const [text, setText] = useState(initial?.text ?? '');
  const [color, setColor] = useState(initial?.color ?? '#FFFFFF');
  const [size, setSize] = useState(initial?.size ?? 32);
  const [style, setStyle] = useState<TextStyleKey>(initial?.style ?? 'bold');
  const ready = text.trim().length > 0;

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose]);

  return (
    <View ref={root} style={styles.root}>
      <View style={[styles.bar, { top: top + 60 }]}>
        <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Cancel text">
          <Text style={styles.barBtn}>Cancel</Text>
        </Pressable>
        {onDelete && (
          <Pressable onPress={onDelete} hitSlop={10} accessibilityRole="button" accessibilityLabel="Delete text">
            <Text style={[styles.barBtn, { color: '#F87171' }]}>Delete</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => ready && onDone({ text: text.trim(), color, size, style })}
          disabled={!ready}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Done"
        >
          <Text style={[styles.barBtn, styles.done, !ready && { opacity: 0.4 }]}>Done</Text>
        </Pressable>
      </View>

      <View style={[styles.inputWrap, { top: top + 124, bottom: kbInset + 150 }]}>
        <TextInput
          autoFocus
          multiline
          value={text}
          onChangeText={setText}
          placeholder="Type something"
          placeholderTextColor="rgba(255,255,255,0.4)"
          style={[styles.input, textStyleFor(style, color, size)]}
          selectionColor="#22D3EE"
          cursorColor="#22D3EE"
          keyboardAppearance="dark"
          accessibilityLabel="Text to add"
        />
      </View>

      <View style={[styles.tools, { bottom: kbInset }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={styles.row}>
          {TEXT_COLORS.map((c) => (
            <Pressable
              key={c}
              onPress={() => setColor(c)}
              accessibilityRole="button"
              accessibilityLabel={`Colour ${c}`}
              style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchOn]}
            />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={styles.row}>
          <Pressable onPress={() => setSize((s) => Math.max(MIN_TEXT_SIZE, s - 4))} hitSlop={8} accessibilityRole="button" accessibilityLabel="Smaller text" style={styles.step}>
            <Text style={styles.stepText}>A−</Text>
          </Pressable>
          <Text style={styles.sizeText}>{size}</Text>
          <Pressable onPress={() => setSize((s) => Math.min(MAX_TEXT_SIZE, s + 4))} hitSlop={8} accessibilityRole="button" accessibilityLabel="Larger text" style={styles.step}>
            <Text style={[styles.stepText, { fontSize: 20 }]}>A+</Text>
          </Pressable>
          <View style={styles.divider} />
          {TEXT_STYLES.map((s) => (
            <Pressable key={s.key} onPress={() => setStyle(s.key)} accessibilityRole="button" accessibilityState={{ selected: style === s.key }} style={[styles.chip, style === s.key && styles.chipOn]}>
              <Text style={[styles.chipText, style === s.key && { color: '#050506' }]}>{s.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5,5,6,0.88)', zIndex: 60 },
  bar: { position: 'absolute', left: 0, right: 0, height: 44, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  barBtn: { fontFamily: fonts.interMedium, fontSize: 16, color: '#FAFAFA' },
  done: { fontFamily: fonts.interBold, color: '#22D3EE' },
  inputWrap: { position: 'absolute', left: 24, right: 24, justifyContent: 'center' },
  input: { paddingHorizontal: 0, paddingVertical: 0, minHeight: 48, textAlignVertical: 'center' },
  tools: { position: 'absolute', left: 0, right: 0, paddingTop: 10, paddingBottom: 12, gap: 14, backgroundColor: 'rgba(18,18,22,0.97)' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20 },
  swatch: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)' },
  swatchOn: { borderColor: '#22D3EE', transform: [{ scale: 1.12 }] },
  step: { minWidth: 40, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  stepText: { fontFamily: fonts.interSemiBold, fontSize: 15, color: '#FAFAFA' },
  sizeText: { width: 28, textAlign: 'center', fontFamily: fonts.interMedium, fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  divider: { width: 1, height: 22, backgroundColor: 'rgba(255,255,255,0.18)' },
  chip: { paddingHorizontal: 12, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  chipOn: { backgroundColor: '#FAFAFA' },
  chipText: { fontFamily: fonts.interMedium, fontSize: 13, color: '#FAFAFA' },
});
