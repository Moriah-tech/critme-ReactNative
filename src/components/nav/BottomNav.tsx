import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { Glass } from '../Glass';
import { ChatIcon, FollowingIcon, HomeIcon, PlusIcon, ProfileIcon } from '../icons';
import { useFrame } from '../../layout';

/**
 * Shared bottom navigation from Demo13: a 330 × 64 glass pill 18 px above the
 * home indicator, five slots spaced evenly. The active icon is white, the rest
 * are 75 % white; pressing a slot briefly shows a light circle (scale 0.95).
 */
export type NavKey = 'home' | 'following' | 'inbox' | 'profile';

type Props = {
  active: NavKey | null;
  onSelect: (key: NavKey) => void;
  onCreate: () => void;
  /** Fades the nav out (comment sheet open, replying). */
  hidden?: boolean;
};

const INACTIVE = 'rgba(255,255,255,0.75)';

export function BottomNav({ active, onSelect, onCreate, hidden = false }: Props) {
  const frame = useFrame();
  const opacity = useRef(new Animated.Value(hidden ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: hidden ? 0 : 1, duration: 200, useNativeDriver: true }).start();
  }, [hidden, opacity]);

  const item = (key: NavKey, Icon: typeof HomeIcon, label: string) => (
    <Pressable
      key={key}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active === key }}
      onPress={() => onSelect(key)}
      hitSlop={4}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
    >
      <Icon color={active === key ? '#fff' : INACTIVE} />
    </Pressable>
  );

  return (
    <Animated.View
      pointerEvents={hidden ? 'none' : 'box-none'}
      style={[styles.wrap, { bottom: frame.bottom(18), opacity }]}
    >
      <Glass radius={32} style={styles.pill}>
        {item('home', HomeIcon, 'Home')}
        {item('following', FollowingIcon, 'Following')}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create"
          onPress={onCreate}
          style={({ pressed }) => [styles.post, pressed && { transform: [{ scale: 0.95 }] }]}
        >
          <PlusIcon />
        </Pressable>
        {item('inbox', ChatIcon, 'Inbox')}
        {item('profile', ProfileIcon, 'Profile')}
      </Glass>
    </Animated.View>
  );
}

/** Distance from the screen bottom to the top of the nav, for content padding. */
export function useNavClearance(): number {
  const frame = useFrame();
  return frame.bottom(18) + 64;
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 50 },
  pill: {
    width: 330,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  item: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  itemPressed: { backgroundColor: 'rgba(255,255,255,0.15)', transform: [{ scale: 0.95 }] },
  post: {
    width: 54,
    height: 46,
    borderRadius: 16,
    backgroundColor: 'rgba(90,90,95,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});
