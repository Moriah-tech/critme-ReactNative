
import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeedPostCard } from '../components/FeedPostCard';
import { colors } from '../theme';
import type { Post } from '../api';

type Props = {
  posts: Post[];
  onCreate: () => void;
  onProfile: () => void;
  onNavigate?: (
    screen: 'home' | 'friends' | 'inbox' | 'profile'
  ) => void;
};

export function FeedScreen({
  posts,
  onCreate,
  onProfile,
  onNavigate,
}: Props) {
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
        getItemLayout={(_, i) => ({
          length: height,
          offset: height * i,
          index: i,
        })}
        onMomentumScrollEnd={(e) =>
          setActive(
            Math.round(e.nativeEvent.contentOffset.y / height)
          )
        }
        renderItem={({ item, index }) => (
          <FeedPostCard
            post={item}
            height={height}
            active={index === active}
          />
        )}
        ListEmptyComponent={
          <View style={[styles.empty, { height }]}>
            <Text style={styles.emptyText}>No posts yet</Text>
          </View>
        }
      />

      <View style={[styles.topBar, { top: insets.top + 8 }]}>
        <Text style={styles.tab}>Explore</Text>

        <View style={styles.topActions}>
          <Pressable onPress={onProfile} hitSlop={8}>
            <Text style={styles.profileButton}>Profile</Text>
          </Pressable>

          <Pressable
            onPress={onCreate}
            style={styles.plus}
            accessibilityLabel="New post"
            hitSlop={8}
          >
            <Text style={styles.plusText}>+</Text>
          </Pressable>
        </View>
      </View>

      <View
        style={[
          styles.bottomNav,
          { paddingBottom: insets.bottom + 8 },
        ]}
      >
        <Pressable onPress={() => onNavigate?.('home')}>
          <Text style={styles.activeNavText}>Home</Text>
        </Pressable>

        <Pressable onPress={() => onNavigate?.('friends')}>
          <Text style={styles.navText}>Friends</Text>
        </Pressable>

        <Pressable style={styles.createButton} onPress={onCreate}>
          <Text style={styles.createText}>+</Text>
        </Pressable>

        <Pressable onPress={() => onNavigate?.('inbox')}>
          <Text style={styles.navText}>Chat</Text>
        </Pressable>

        <Pressable onPress={() => onNavigate?.('profile')}>
          <Text style={styles.navText}>Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textMuted,
  },
  topBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tab: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileButton: {
    color: '#F4F4F5',
    fontSize: 15,
  },
  plus: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 24,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#101014',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 12,
  },
  navText: {
    color: '#888891',
    fontSize: 12,
  },
  activeNavText: {
    color: '#A855F7',
    fontSize: 12,
    fontWeight: '700',
  },
  createButton: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: '#A855F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createText: {
    color: '#fff',
    fontSize: 25,
    lineHeight: 29,
  },
});
