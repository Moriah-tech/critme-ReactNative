
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { CreateScreen } from './src/screens/CreateScreen';
import { FeedScreen } from './src/screens/FeedScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { InboxScreen } from './src/screens/InboxScreen';

import type { LocalVideo, Post } from './src/api';

export default function App() {
  const [video, setVideo] = useState<LocalVideo | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentScreen, setCurrentScreen] = useState<
    'home' | 'profile' | 'inbox'|'friends'
  >('home');

  const pickVideo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow access to your videos.');
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
            setCurrentScreen('home');
          }}
        />
      ) : currentScreen === 'profile' ? (
        <ProfileScreen
          onNavigate={(screen) => {
            setCurrentScreen(screen);
          }}
          onCreate={pickVideo}
        />
      ) : currentScreen === 'inbox' ? (
        <InboxScreen
          onNavigate={(screen) => {
            setCurrentScreen(screen);
          }}
          onCreate={pickVideo}
        />
      ) : (
      <FeedScreen
  posts={posts}
  onCreate={pickVideo}
  onProfile={() => setCurrentScreen('profile')}
  onNavigate={(screen) => {
    if (screen === 'friends') {
      Alert.alert('Coming soon', 'Friends screen is not connected yet.');
    } else {
      setCurrentScreen(screen);
    }
  }}
/>
      )}
    </SafeAreaProvider>
  );
}
