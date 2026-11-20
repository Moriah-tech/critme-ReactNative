import React, { ComponentRef, useCallback, useEffect, useRef, useState } from 'react';
import { Alert, BackHandler, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { BlurTargetView } from 'expo-blur';

import { CreateScreen } from './src/screens/CreateScreen';
import { CameraScreen } from './src/screens/CameraScreen';
import { StoryEditorScreen } from './src/screens/StoryEditorScreen';
import { FeedScreen } from './src/screens/FeedScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { InboxScreen } from './src/screens/InboxScreen';
import FriendsScreen from './src/screens/friends/FriendsScreen';
import { BottomNav, NavKey } from './src/components/nav/BottomNav';
import { CreateChoice, CreateMenu } from './src/components/nav/CreateMenu';
import { BlurTargetProvider } from './src/components/Glass';
import { useScreenStack } from './src/navigation/useScreenStack';
import { useFeedStore } from './src/feed/useFeedStore';
import { useAppFonts } from './src/fonts';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { AuthFlow } from './src/auth/AuthFlow';
import { CURRENT_USER_NAME } from './src/session';
import { EMPTY_EDITS, MediaEdits } from './src/media/edits';
import { feed } from './src/theme';

import type { LocalVideo } from './src/api';

type Tab = 'home' | 'friends' | 'inbox' | 'profile';
type Route =
  | { name: 'tabs' }
  | { name: 'camera' }
  | { name: 'story' }
  | { name: 'create'; video: LocalVideo; edits: MediaEdits };

/**
 * Entry gate. Signed-out users see the auth flow (Onboarding → Create Account /
 * Log In); a valid stored session or a successful sign-in shows the CritMe app.
 * Signing out unmounts CritMeApp, so its state resets and Android back cannot
 * reach the auth screens while signed in (and vice versa).
 */
export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}

function Root() {
  const fontsReady = useAppFonts();
  const { status } = useAuth();
  if (!fontsReady || status === 'loading') return <View style={styles.root} />;
  if (status === 'signedIn') return <CritMeApp />;
  return (
    <SafeAreaProvider>
      <AuthFlow />
    </SafeAreaProvider>
  );
}

function CritMeApp() {
  const fontsReady = useAppFonts();
  const nav = useScreenStack<Route>({ name: 'tabs' });
  const [tab, setTab] = useState<Tab>('home');
  // Inbox and Profile mount the first time they are opened, then stay mounted
  // so their state (search text, open tab, edits) survives switching tabs.
  const [visited, setVisited] = useState<Record<Tab, boolean>>({ home: true, friends: false, inbox: false, profile: false });
  const [feedChromeHidden, setFeedChromeHidden] = useState(false);
  const [postedKey, setPostedKey] = useState(0);
  const [storiesKey, setStoriesKey] = useState(0);
  // AA text and CC captions added on the camera; they follow the clip to the composer and the post.
  const [edits, setEdits] = useState<MediaEdits>(EMPTY_EDITS);
  const [menuOpen, setMenuOpen] = useState(false);
  const store = useFeedStore(CURRENT_USER_NAME);
  // The tab screens, which the shared nav blurs on Android.
  const tabsBlurTarget = useRef<ComponentRef<typeof View>>(null);

  const openTab = useCallback((t: Tab) => {
    setTab(t);
    setVisited((v) => (v[t] ? v : { ...v, [t]: true }));
  }, []);

  // One handler for every nav (the shared nav's Following icon opens Friends).
  const navigate = useCallback(
    (screen: Tab) => {
      openTab(screen);
    },
    [openTab],
  );

  // Android back on Inbox or Profile returns to Home (as before). On Home it
  // falls through to the system (leave the app). Pushed screens pop first.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (menuOpen) {
        setMenuOpen(false);
        return true;
      }
      if (nav.stack.length === 1 && tab !== 'home') {
        openTab('home');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [nav.stack.length, tab, openTab, menuOpen]);

  const onNavSelect = (key: NavKey) => {
    setMenuOpen(false);
    navigate(key === 'following' ? 'friends' : key);
  };

  // + opens the create menu (Demo13): Update and Explore → camera, Story → editor.
  // Both camera options post to Explore, as in the demo.
  const toggleMenu = () => setMenuOpen((o) => !o);
  const onChoose = (choice: CreateChoice) => {
    setMenuOpen(false);
    if (choice !== 'story') setEdits(EMPTY_EDITS);
    nav.push(choice === 'story' ? { name: 'story' } : { name: 'camera' });
  };

  // Video library → composer. Used by the camera's gallery button.
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

    nav.push({
      name: 'create',
      video: {
        uri: a.uri,
        durationMs: a.duration ?? undefined,
        width: a.width,
        height: a.height,
        mimeType: a.mimeType ?? undefined,
        fileName: a.fileName ?? undefined,
      },
      edits,
    });
  };

  if (!fontsReady) return <View style={styles.root} />;

  const top = nav.top;
  const onTabs = top.name === 'tabs';

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.root}>
        <BlurTargetView ref={tabsBlurTarget} style={StyleSheet.absoluteFill}>
        <View style={[StyleSheet.absoluteFill, !(onTabs && tab === 'home') && styles.hidden]} pointerEvents={onTabs && tab === 'home' ? 'auto' : 'none'}>
          <FeedScreen
            store={store}
            focused={onTabs && tab === 'home'}
            onChromeHiddenChange={setFeedChromeHidden}
            postedKey={postedKey}
            menuOpen={menuOpen}
            storiesKey={storiesKey}
          />
        </View>

        {visited.friends && (
          <View style={[StyleSheet.absoluteFill, tab !== 'friends' && styles.hidden]} pointerEvents={tab === 'friends' ? 'auto' : 'none'}>
            <FriendsScreen isActive={onTabs && tab === 'friends'} />
          </View>
        )}

        {visited.inbox && (
          <View style={[StyleSheet.absoluteFill, tab !== 'inbox' && styles.hidden]} pointerEvents={tab === 'inbox' ? 'auto' : 'none'}>
            <InboxScreen onNavigate={navigate} onCreate={toggleMenu} hideOwnNav />
          </View>
        )}

        {visited.profile && (
          <View style={[StyleSheet.absoluteFill, tab !== 'profile' && styles.hidden]} pointerEvents={tab === 'profile' ? 'auto' : 'none'}>
            <ProfileScreen onNavigate={navigate} onCreate={toggleMenu} hideOwnNav />
          </View>
        )}
        </BlurTargetView>

        {onTabs && <CreateMenu open={menuOpen} onClose={() => setMenuOpen(false)} onChoose={onChoose} />}

        {onTabs && (
          <BlurTargetProvider target={tabsBlurTarget}>
            <BottomNav
              active={tab === 'friends' ? 'following' : tab}
              onSelect={onNavSelect}
              onCreate={toggleMenu}
              hidden={tab === 'home' && feedChromeHidden}
            />
          </BlurTargetProvider>
        )}

        {nav.stack.some((r) => r.name === 'camera') && (
          // Explicit stacking: a screen pushed later always sits above the camera and its controls.
          <View style={[StyleSheet.absoluteFill, { zIndex: 10 }]}>
            <CameraScreen
              focused={top.name === 'camera'}
              onClose={() => {
                setEdits(EMPTY_EDITS);
                nav.popToRoot();
              }}
              onGallery={pickVideo}
              onNext={(clip) => nav.push({ name: 'create', video: clip, edits })}
              edits={edits}
              onEditsChange={setEdits}
            />
          </View>
        )}

        {top.name === 'story' && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 20 }]}>
            <StoryEditorScreen
              onClose={nav.pop}
              onPublish={(draft) => {
                store.addStory(draft);
                nav.popToRoot();
                openTab('home');
                setStoriesKey((k) => k + 1);
              }}
            />
          </View>
        )}

        {top.name === 'create' && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 20 }]}>
            <CreateScreen
              key={top.video.uri}
              video={top.video}
              edits={top.edits}
              onClose={nav.pop}
              onPosted={(post) => {
                store.addPosted(post, top.edits);
                setEdits(EMPTY_EDITS);
                nav.popToRoot();
                openTab('home');
                setPostedKey((k) => k + 1);
              }}
            />
          </View>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: feed.black },
  // display: none (not just opacity 0) so a hidden screen's native video surface cannot draw over the visible one.
  hidden: { opacity: 0, display: 'none' },
});
