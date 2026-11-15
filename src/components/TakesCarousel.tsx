import React, { useRef, useState } from 'react';
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View, useWindowDimensions } from 'react-native';
import { MessageBubble } from './MessageBubble';
import { PagerDots } from './PagerDots';
import type { CritTake } from '../api/types';

type Props = {
  takes: CritTake[];
  onIndexChange?: (index: number) => void;
};

/**
 * Swipe between Crit's takes. One page per take, the full width of the screen,
 * so only the current take is visible. There's no blurred preview of the next one.
 */
export function TakesCarousel({ takes, onIndexChange }: Props) {
  const { width } = useWindowDimensions();
  const list = useRef<FlatList<CritTake>>(null);
  const [index, setIndex] = useState(0);

  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) {
      setIndex(i);
      onIndexChange?.(i);
    }
  };

  const goTo = (i: number) => {
    list.current?.scrollToIndex({ index: i, animated: true });
    setIndex(i);
    onIndexChange?.(i);
  };

  return (
    <View>
      <FlatList
        ref={list}
        data={takes}
        keyExtractor={(t) => t.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={settle}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <View style={[styles.page, { width }]}>
            <MessageBubble text={item.text} variant="take" glow tail="right" style={styles.bubble} />
          </View>
        )}
      />
      {takes.length > 1 ? <PagerDots count={takes.length} index={index} onSelect={goTo} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { alignItems: 'center', paddingHorizontal: 32, paddingVertical: 12 },
  bubble: { maxWidth: '100%' },
});
