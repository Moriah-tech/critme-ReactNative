import React, { useState } from 'react';
import { Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { CreateScreen } from './src/screens/CreateScreen';
import { FeedScreen } from './src/screens/FeedScreen';
import type { LocalVideo, Post } from './src/api';

/**
 * Demo wiring: Explore feed → "+" → pick a video from the gallery → create flow →
 * the post lands at the top of Explore. In the real app, replace this with your
 * navigator and render CreateScreen / FeedScreen as routes.
 */
export default function App() {
  const [video, setVideo] = useState<LocalVideo | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  const pickVideo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Allow access to your videos to post one.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 1,
      videoMaxDuration: 180,
    });
    if (res.canceled || !res.assets[0]) return;
    const a = res.assets[0];
    setVideo({
      uri: a.uri,
      durationMs: a.duration ?? undefined,
      width: a.width,
      height: a.height,
      mimeType: a.mimeType ?? undefined,
      fileName: a.fileName ?? undefined,
    });
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {video ? (
        <CreateScreen
          key={video.uri}
          video={video}
          onClose={() => setVideo(null)}
          onPosted={(post) => {
            setPosts((p) => [post, ...p]);
            setVideo(null);
          }}
        />
      ) : (
        <FeedScreen posts={posts} onCreate={pickVideo} />
      )}
    </SafeAreaProvider>
  );
}
