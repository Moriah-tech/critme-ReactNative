
import React, { useEffect, useState } from 'react';
import { Alert, BackHandler } from 'react-native';
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
    'home' | 'profile' | 'inbox'
  >('home');

  // One handler for every bottom nav. There is no Friends screen yet,
  // so Friends shows the same "Coming soon" alert from every screen.
  const navigate = (screen: 'home' | 'friends' | 'inbox' | 'profile') => {
    if (screen === 'friends') {
      Alert.alert('Coming soon', 'Friends screen is not connected yet.');
      return;
    }
    setCurrentScreen(screen);
  };

  // Android hardware back: Profile and Inbox return to Home.
  // On Home it's not handled, so Android does its default (leave the app).
  // While a video is open, CreateScreen handles back itself.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (video) return false;
      if (currentScreen !== 'home') {
        setCurrentScreen('home');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [video, currentScreen]);

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
          onNavigate={navigate}
          onCreate={pickVideo}
        />
      ) : currentScreen === 'inbox' ? (
        <InboxScreen
          onNavigate={navigate}
          onCreate={pickVideo}
        />
      ) : (
      <FeedScreen
  posts={posts}
  onCreate={pickVideo}
  onProfile={() => setCurrentScreen('profile')}
  onNavigate={navigate}
/>
      )}
    </SafeAreaProvider>
  );
}
