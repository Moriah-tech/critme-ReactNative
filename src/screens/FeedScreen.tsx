import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeedPostCard } from '../components/FeedPostCard';
import { colors } from '../theme';
import type { Post } from '../api';

type Props = { posts: Post[]; onCreate: () => void };

/** Vertical, one-post-per-screen Explore feed. New posts go on top. */
export function FeedScreen({ posts, onCreate }: Props) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState(0);

  return (
    <View style={styles.screen}>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, i) => ({ length: height, offset: height * i, index: i })}
        onMomentumScrollEnd={(e) => setActive(Math.round(e.nativeEvent.contentOffset.y / height))}
        renderItem={({ item, index }) => <FeedPostCard post={item} height={height} active={index === active} />}
        ListEmptyComponent={
          <View style={[styles.empty, { height }]}>
            <Text style={styles.emptyText}>No posts yet</Text>
          </View>
        }
      />
      <View style={[styles.topBar, { top: insets.top + 8 }]}>
        <Text style={styles.tab}>Explore</Text>
        <Pressable onPress={onCreate} style={styles.plus} accessibilityLabel="New post" hitSlop={8}>
          <Text style={styles.plusText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  empty: { alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.textMuted },
  topBar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tab: { color: colors.text, fontSize: 17, fontWeight: '700' },
  plus: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: { color: colors.text, fontSize: 22, lineHeight: 24 },
});
