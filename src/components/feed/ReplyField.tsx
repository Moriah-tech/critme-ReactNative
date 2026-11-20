import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { fonts } from '../../theme';
import { Backdrop } from '../Glass';

/**
 * Reply field shown when the open message bar is tapped (Demo13 layer 15).
 * Sits 20 px from each side and 8 px above the keyboard; grows one line at a
 * time up to six lines (143 px), then scrolls. Return inserts a new line.
 * "Send" is dim until there is text.
 */
type Props = {
  bottom: number;
  onSend: (text: string) => void;
  onLayoutTop?: (top: number) => void;
};

export function ReplyField({ bottom, onSend, onLayoutTop }: Props) {
  const [text, setText] = useState('');
  const [lines, setLines] = useState(1);
  const ready = text.trim().length > 0;

  return (
    <View
      style={[styles.field, lines > 1 && styles.multi, { bottom }]}
      onLayout={(e) => onLayoutTop?.(e.nativeEvent.layout.y)}
    >
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.glass, lines > 1 && styles.multi]}>
        <Backdrop blur={18} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(58,60,68,0.52)' }]} />
      </View>
      <TextInput
        autoFocus
        multiline
        value={text}
        onChangeText={setText}
        onContentSizeChange={(e) => setLines(Math.max(1, Math.round(e.nativeEvent.contentSize.height / 21)))}
        style={styles.input}
        placeholderTextColor="rgba(255,255,255,0.4)"
        selectionColor="#5C7CFA"
        cursorColor="#5C7CFA"
        keyboardAppearance="dark"
        scrollEnabled
        accessibilityLabel="Reply"
      />
      <Pressable
        onPress={() => ready && onSend(text.trim())}
        disabled={!ready}
        accessibilityRole="button"
        accessibilityLabel="Send reply"
        style={styles.sendWrap}
      >
        <Text style={[styles.send, ready && styles.sendReady]}>Send</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    position: 'absolute',
    left: 20,
    right: 20,
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingLeft: 16,
    paddingRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
    borderRadius: 19,
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    zIndex: 90,
  },
  multi: { borderRadius: 18 },
  glass: { borderRadius: 19, overflow: 'hidden' },
  input: {
    flex: 1,
    color: '#fff',
    fontFamily: fonts.inter,
    fontSize: 16,
    lineHeight: 21,
    paddingTop: 8.5,
    paddingBottom: 8.5,
    paddingHorizontal: 0,
    maxHeight: 143,
    textAlignVertical: 'top',
  },
  sendWrap: { height: 38, justifyContent: 'center', paddingLeft: 16 },
  send: { fontFamily: fonts.interSemiBold, fontSize: 17, color: 'rgba(255,255,255,0.32)' },
  sendReady: { color: 'rgba(255,255,255,0.95)' },
});
