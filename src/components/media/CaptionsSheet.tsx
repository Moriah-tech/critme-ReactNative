import React, { ComponentRef, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { CaptionLine, formatTime, MediaEdits, newEditId } from '../../media/edits';
import { captionService, CaptionsNotConfiguredError } from '../../media/captionService';
import { useKeyboardInset } from '../../useKeyboardInset';
import { fonts } from '../../theme';

/**
 * CC: turn captions on or off, add / edit / delete timed caption lines, and (when a
 * speech-to-text service is connected, see media/captionService.ts) auto-generate them.
 * Sits over the playing clip so the line shows live; the sheet rides above the keyboard.
 */

type Props = {
  edits: MediaEdits;
  videoUri: string;
  /** Current playback position (seconds), used for new lines. */
  currentTime: number;
  onChange: (next: MediaEdits) => void;
  onClose: () => void;
};

const num = (s: string, fallback: number) => {
  const n = parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

export function CaptionsSheet({ edits, videoUri, currentTime, onChange, onClose }: Props) {
  const root = useRef<ComponentRef<typeof View>>(null);
  const kbInset = useKeyboardInset(root);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose]);

  const setLines = (captions: CaptionLine[]) => onChange({ ...edits, captions });
  const patch = (id: string, p: Partial<CaptionLine>) => setLines(edits.captions.map((l) => (l.id === id ? { ...l, ...p } : l)));

  const add = () => {
    const start = Math.round(currentTime * 10) / 10;
    setLines([...edits.captions, { id: newEditId('cap'), start, end: start + 3, text: '' }].sort((a, b) => a.start - b.start));
    setNotice(null);
  };

  const generate = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const lines = await captionService.transcribe(videoUri);
      onChange({ ...edits, captions: lines, captionsOn: true });
    } catch (e) {
      setNotice(e instanceof CaptionsNotConfiguredError ? `${e.message} You can still add captions by hand below.` : 'Could not generate captions.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View ref={root} style={styles.root} pointerEvents="box-none">
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close captions" />
      <View style={[styles.sheet, { bottom: kbInset }]}>
        <View style={styles.head}>
          <Text style={styles.title}>Captions</Text>
          <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Done with captions">
            <Text style={styles.done}>Done</Text>
          </Pressable>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.label}>Show captions</Text>
          <Switch
            value={edits.captionsOn}
            onValueChange={(v) => onChange({ ...edits, captionsOn: v })}
            trackColor={{ false: 'rgba(255,255,255,0.18)', true: '#0E7490' }}
            thumbColor={edits.captionsOn ? '#22D3EE' : '#A1A1AA'}
            accessibilityLabel="Show captions"
          />
        </View>

        <Pressable onPress={generate} disabled={busy} style={[styles.btn, busy && { opacity: 0.6 }]} accessibilityRole="button" accessibilityLabel="Auto-generate captions">
          {busy ? <ActivityIndicator color="#FAFAFA" /> : <Text style={styles.btnText}>Auto-generate from speech</Text>}
        </Pressable>
        {notice && <Text style={styles.notice}>{notice}</Text>}

        <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
          {edits.captions.length === 0 && <Text style={styles.empty}>No captions yet. Add one at the current time ({formatTime(currentTime)}).</Text>}
          {edits.captions.map((l) => (
            <View key={l.id} style={styles.line}>
              <View style={styles.times}>
                <TimeInput value={l.start} onCommit={(v) => patch(l.id, { start: v, end: Math.max(l.end, v + 0.5) })} label="Start seconds" />
                <Text style={styles.dash}>–</Text>
                <TimeInput value={l.end} onCommit={(v) => patch(l.id, { end: Math.max(v, l.start + 0.5) })} label="End seconds" />
              </View>
              <TextInput
                value={l.text}
                onChangeText={(t) => patch(l.id, { text: t })}
                placeholder="Caption text"
                placeholderTextColor="rgba(255,255,255,0.35)"
                style={styles.textInput}
                selectionColor="#22D3EE"
                cursorColor="#22D3EE"
                keyboardAppearance="dark"
                accessibilityLabel="Caption text"
              />
              <Pressable onPress={() => setLines(edits.captions.filter((x) => x.id !== l.id))} hitSlop={8} accessibilityRole="button" accessibilityLabel="Delete caption">
                <Text style={styles.del}>✕</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>

        <Pressable onPress={add} style={styles.addBtn} accessibilityRole="button" accessibilityLabel="Add caption">
          <Text style={styles.addText}>+ Add caption at {formatTime(currentTime)}</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** Seconds field that keeps what the user types and commits a valid number on blur. */
function TimeInput({ value, onCommit, label }: { value: number; onCommit: (v: number) => void; label: string }) {
  const [txt, setTxt] = useState(String(Math.round(value * 10) / 10));
  return (
    <TextInput
      value={txt}
      onChangeText={setTxt}
      onEndEditing={() => {
        const v = num(txt, value);
        setTxt(String(Math.round(v * 10) / 10));
        onCommit(v);
      }}
      keyboardType="decimal-pad"
      style={styles.timeInput}
      selectionColor="#22D3EE"
      keyboardAppearance="dark"
      accessibilityLabel={label}
    />
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill, zIndex: 60 },
  sheet: { position: 'absolute', left: 0, right: 0, maxHeight: '70%', backgroundColor: 'rgba(18,18,22,0.98)', borderTopLeftRadius: 22, borderTopRightRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 18, gap: 12 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: fonts.groteskBold, fontSize: 20, color: '#FAFAFA' },
  done: { fontFamily: fonts.interBold, fontSize: 16, color: '#22D3EE' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontFamily: fonts.interMedium, fontSize: 15, color: '#E4E4E7' },
  btn: { height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: fonts.interSemiBold, fontSize: 14.5, color: '#FAFAFA' },
  notice: { fontFamily: fonts.inter, fontSize: 12.5, lineHeight: 18, color: '#FACC15' },
  list: { flexGrow: 0 },
  empty: { fontFamily: fonts.inter, fontSize: 13, color: 'rgba(255,255,255,0.5)', paddingVertical: 8 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 },
  times: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dash: { color: 'rgba(255,255,255,0.5)' },
  timeInput: { width: 46, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', color: '#FAFAFA', textAlign: 'center', fontSize: 13, paddingVertical: 0 },
  textInput: { flex: 1, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', color: '#FAFAFA', fontFamily: fonts.inter, fontSize: 14, paddingHorizontal: 10, paddingVertical: 0 },
  del: { color: '#F87171', fontSize: 16, paddingHorizontal: 4 },
  addBtn: { height: 42, borderRadius: 21, backgroundColor: '#FAFAFA', alignItems: 'center', justifyContent: 'center' },
  addText: { fontFamily: fonts.interBold, fontSize: 14.5, color: '#111111' },
});
