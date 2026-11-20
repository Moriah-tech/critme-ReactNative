import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { CommentItem } from './CommentItem';
import { feed } from '../../theme';
import { Backdrop } from '../Glass';
import type { FeedComment } from '../../feed/types';

/**
 * Comment sheet from Demo13: slides up over the lower 60 % of the screen
 * (0.35 s, cubic-bezier(.22,.68,0,1.1)) over a 25 % black backdrop. It is not
 * draggable; tapping anywhere above it closes it. The video keeps playing.
 */
type Props = {
  open: boolean;
  screenHeight: number;
  comments: FeedComment[];
  /** Ids added in this session; they flash teal once. */
  newIds: Set<string>;
  /** Changes when the list should jump back to the top (e.g. after replying). */
  scrollToTopKey: number;
  onClose: () => void;
  onToggleStar: (id: string) => void;
};

export function CommentSheet({ open, screenHeight, comments, newIds, scrollToTopKey, onClose, onToggleStar }: Props) {
  const sheetHeight = screenHeight * 0.6;
  const y = useRef(new Animated.Value(open ? 0 : 1)).current;
  const [mounted, setMounted] = useState(open);
  const list = useRef<FlatList<FeedComment>>(null);

  useEffect(() => {
    if (open) setMounted(true);
    Animated.timing(y, {
      toValue: open ? 0 : 1,
      duration: 350,
      easing: Easing.bezier(0.22, 0.68, 0, 1.1),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !open) setMounted(false);
    });
  }, [open, y]);

  useEffect(() => {
    if (scrollToTopKey) setTimeout(() => list.current?.scrollToOffset({ offset: 0, animated: false }), 60);
  }, [scrollToTopKey]);

  if (!mounted) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 80 }]} pointerEvents={open ? 'auto' : 'none'}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: y.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close comments" />
      </Animated.View>
      <Animated.View
        style={[
          styles.sheet,
          { height: sheetHeight, transform: [{ translateY: y.interpolate({ inputRange: [0, 1], outputRange: [0, sheetHeight] }) }] },
        ]}
      >
        <Backdrop blur={28} />
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: feed.sheetFill }]} />
        <FlatList
          ref={list}
          data={comments}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <CommentItem comment={item} isNew={newIds.has(item.id)} onToggleStar={() => onToggleStar(item.id)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0,0,0,0.25)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    borderColor: feed.sheetBorder,
    overflow: 'hidden',
  },
  // 21 px = Demo13’s empty topic header (16 px + 1 px border) plus the list’s own 4 px top padding
  listContent: { paddingTop: 21, paddingHorizontal: 14, paddingBottom: 80 },
});
