import React, { useEffect } from 'react';
import { BackHandler, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { feed, fonts } from '../../theme';
import type { Story } from '../../feed/types';

/**
 * Home's Stories page (the second page of the Explore ⇄ Stories pager) and the
 * full-screen viewer a story opens in. Stories come from the shared feed store,
 * which the Story Editor publishes into, so a published story appears here
 * immediately. Newest first.
 */

type PageProps = {
  stories: Story[];
  /** Screen y where the content may start (below the Explore / Stories tabs). */
  top: number;
  /** Space to keep clear at the bottom (the shared bottom nav). */
  bottom: number;
  width: number;
  onOpen: (story: Story) => void;
};

export function StoriesPage({ stories, top, bottom, width, onOpen }: PageProps) {
  const cardWidth = width - 32;
  return (
    <View style={styles.page}>
      <ScrollView
        style={StyleSheet.absoluteFill}
        contentContainerStyle={{ paddingTop: top, paddingBottom: bottom, paddingHorizontal: 16, gap: 14, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {stories.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No stories yet</Text>
            <Text style={styles.emptyText}>Tap + and choose Story to publish one. It will show up here.</Text>
          </View>
        ) : (
          stories.map((s) => (
            <Pressable
              key={s.id}
              onPress={() => onOpen(s)}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
              accessibilityLabel={`Open story${s.headline ? `: ${s.headline}` : ''}`}
            >
              {s.image && (
                <Image
                  source={{ uri: s.image.uri }}
                  style={{ width: cardWidth, height: Math.min(cardWidth * 1.25, (cardWidth * s.image.height) / s.image.width) }}
                  resizeMode="cover"
                />
              )}
              <View style={styles.cardBody}>
                <Meta story={s} />
                {!!s.headline && <Text style={styles.headline} numberOfLines={3}>{s.headline}</Text>}
                {!!s.body && <Text style={styles.body} numberOfLines={4}>{s.body}</Text>}
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function Meta({ story }: { story: Story }) {
  return (
    <Text style={styles.meta} numberOfLines={1}>
      {story.authorName}
      {story.topic ? `  ·  ${story.topic}` : ''}
    </Text>
  );
}

type ViewerProps = { story: Story; top: number; width: number; onClose: () => void };

export function StoryViewer({ story, top, width, onClose }: ViewerProps) {
  // Android back closes the viewer first (this handler is registered after the app's).
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [onClose]);

  const contentWidth = width - 48;
  return (
    <View style={styles.viewer}>
      <ScrollView contentContainerStyle={{ paddingTop: top + 56, paddingHorizontal: 24, paddingBottom: 48 }}>
        <Meta story={story} />
        {!!story.headline && <Text style={styles.viewerHeadline}>{story.headline}</Text>}
        {story.image && (
          <Image
            source={{ uri: story.image.uri }}
            style={{ width: contentWidth, height: (contentWidth * story.image.height) / story.image.width, borderRadius: 12, marginVertical: 18 }}
            resizeMode="cover"
          />
        )}
        {!!story.body && <Text style={styles.viewerBody}>{story.body}</Text>}
      </ScrollView>
      <Pressable
        onPress={onClose}
        style={[styles.close, { top }]}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Close story"
      >
        <Text style={styles.closeText}>×</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { ...StyleSheet.absoluteFill, backgroundColor: feed.black },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 8 },
  emptyTitle: { fontFamily: fonts.groteskBold, fontSize: 20, color: '#FAFAFA' },
  emptyText: { fontFamily: fonts.inter, fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.55)', textAlign: 'center' },
  card: { borderRadius: 16, overflow: 'hidden', backgroundColor: 'rgba(30,30,35,0.8)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardBody: { padding: 14, gap: 6 },
  meta: { fontFamily: fonts.interMedium, fontSize: 12.5, color: 'rgba(255,255,255,0.55)' },
  headline: { fontFamily: fonts.groteskBold, fontSize: 20, lineHeight: 26, color: '#FAFAFA' },
  body: { fontFamily: fonts.inter, fontSize: 14.5, lineHeight: 21, color: '#E4E4E7' },
  viewer: { ...StyleSheet.absoluteFill, backgroundColor: feed.black, zIndex: 40 },
  viewerHeadline: { fontFamily: fonts.groteskBold, fontSize: 28, lineHeight: 35, letterSpacing: -0.3, color: '#FAFAFA', marginTop: 8 },
  viewerBody: { fontFamily: fonts.inter, fontSize: 16.5, lineHeight: 25.6, color: '#E4E4E7' },
  close: { position: 'absolute', left: 18, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
  closeText: { fontFamily: 'Inter_400Regular', fontSize: 24, lineHeight: 26, color: '#FAFAFA' },
});
