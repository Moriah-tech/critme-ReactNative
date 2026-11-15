import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { brightGradient, colors } from '../theme';

export type InputBarHandle = { focus: () => void; blur: () => void };

type Props = {
  initialText?: string;
  onSend: (text: string) => void;
};

/**
 * DM-style input bar that sits on top of the system keyboard: a translucent
 * field, a # button that inserts a hashtag, and a round send button with an icon.
 */
export const InputBar = forwardRef<InputBarHandle, Props>(function InputBar({ initialText = '', onSend }, ref) {
  const input = useRef<React.ComponentRef<typeof TextInput>>(null);
  const [text, setText] = useState(initialText);

  useImperativeHandle(ref, () => ({
    focus: () => input.current?.focus(),
    blur: () => input.current?.blur(),
  }));

  const insertHash = () => {
    setText((t) => (t.length === 0 || /\s$/.test(t) ? `${t}#` : `${t} #`));
    input.current?.focus();
  };

  const send = () => {
    const clean = text.trim();
    if (!clean) return;
    onSend(clean);
  };

  const canSend = text.trim().length > 0;

  return (
    <View style={styles.row}>
      <View style={styles.field}>
        <TextInput
          ref={input}
          value={text}
          onChangeText={setText}
          placeholder="Say something about your video…"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          multiline
          maxLength={280}
          autoFocus
          keyboardAppearance="dark"
          selectionColor={colors.purple}
        />
      </View>
      <Pressable onPress={insertHash} style={styles.hash} hitSlop={6} accessibilityLabel="Add hashtag">
        <Text style={styles.hashText}>#</Text>
      </Pressable>
      <Pressable onPress={send} disabled={!canSend} hitSlop={6} accessibilityLabel="Send" style={{ opacity: canSend ? 1 : 0.4 }}>
        <LinearGradient colors={brightGradient.colors} locations={brightGradient.locations} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.send}>
          <Svg width={18} height={18} viewBox="0 0 24 24">
            <Path d="M12 19V5M5 12l7-7 7 7" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        </LinearGradient>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  field: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
  },
  input: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 21,
    paddingHorizontal: 14,
    paddingTop: 9,
    paddingBottom: 9,
  },
  hash: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hashText: { color: colors.text, fontSize: 18, fontWeight: '700' },
  send: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
