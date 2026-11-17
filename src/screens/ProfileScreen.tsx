
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  onNavigate?: (screen: 'home' | 'friends' | 'inbox' | 'profile') => void;
  onCreate?: () => void;
};

export function ProfileScreen({ onNavigate, onCreate }: Props) {
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('Marcus Bronley');
  const [handle, setHandle] = useState('@marcus_bronley');
  const [bio, setBio] = useState('Builder · CritiqueMe · Ideas over noise');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const [draftName, setDraftName] = useState(name);
  const [draftHandle, setDraftHandle] = useState(handle);
  const [draftBio, setDraftBio] = useState(bio);

  const chooseImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const openEditor = () => {
    setDraftName(name);
    setDraftHandle(handle);
    setDraftBio(bio);
    setEditing(true);
  };

  const saveProfile = () => {
    if (!draftName.trim() || !draftHandle.trim()) {
      Alert.alert('Missing information', 'Enter your name and username.');
      return;
    }

    setName(draftName.trim());
    setHandle(
      draftHandle.trim().startsWith('@')
        ? draftHandle.trim()
        : `@${draftHandle.trim()}`
    );
    setBio(draftBio.trim());
    setEditing(false);
  };

  const shareProfile = async () => {
    try {
      await Share.share({
        message: `Check out ${name}'s profile on CritMe! ${handle}`,
      });
    } catch {
      Alert.alert('Sharing unavailable', 'Could not share this profile.');
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 18, paddingBottom: 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={styles.settings}
          onPress={() =>
            Alert.alert('Settings', 'Settings options will be added here.')
          }
        >
          <Text style={styles.settingsText}>⚙</Text>
        </Pressable>

        <Pressable onPress={chooseImage} style={styles.avatar}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarInitials}>MB</Text>
          )}
          <View style={styles.cameraBadge}>
            <Text style={styles.cameraText}>+</Text>
          </View>
        </Pressable>

        <Text style={styles.name}>{name}</Text>

        <View style={styles.handleRow}>
          <Text style={styles.handle}>{handle}</Text>
          <View style={styles.stats}>
            <Text style={styles.stat}>
              <Text style={styles.statNumber}>6 </Text>
              followers
            </Text>
            <Text style={styles.stat}>
              <Text style={styles.statNumber}>83 </Text>
              following
            </Text>
          </View>
        </View>

        <Text style={styles.bio}>{bio}</Text>

        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={openEditor}>
            <Text style={styles.actionText}>Edit Profile</Text>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={shareProfile}>
            <Text style={styles.actionText}>Share Profile</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
        <Pressable onPress={() => onNavigate?.('home')}>
          <Text style={styles.navText}>Home</Text>
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
          <Text style={styles.activeNavText}>Profile</Text>
        </Pressable>
      </View>

      <Modal
        visible={editing}
        transparent
        animationType="slide"
        onRequestClose={() => setEditing(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <TextInput
              style={styles.input}
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Your name"
              placeholderTextColor="#777"
            />

            <TextInput
              style={styles.input}
              value={draftHandle}
              onChangeText={setDraftHandle}
              placeholder="Username"
              placeholderTextColor="#777"
            />

            <TextInput
              style={[styles.input, styles.bioInput]}
              value={draftBio}
              onChangeText={setDraftBio}
              placeholder="Your bio"
              placeholderTextColor="#777"
              multiline
            />

            <Pressable style={styles.saveButton} onPress={saveProfile}>
              <Text style={styles.saveText}>Save Changes</Text>
            </Pressable>

            <Pressable onPress={() => setEditing(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#050506',
  },
  content: {
    paddingHorizontal: 20,
  },
  settings: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 2,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsText: {
    color: '#F4F4F5',
    fontSize: 22,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#202938',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 43,
  },
  avatarInitials: {
    color: '#F4F4F5',
    fontSize: 24,
    fontWeight: '700',
  },
  cameraBadge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#A855F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
  },
  name: {
    color: '#FAFAFA',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  handle: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 14,
  },
  stats: {
    flexDirection: 'row',
    gap: 14,
  },
  stat: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
  },
  statNumber: {
    color: '#FAFAFA',
    fontSize: 15,
    fontWeight: '700',
  },
  bio: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#FAFAFA',
    fontSize: 13,
    fontWeight: '600',
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
    paddingTop: 14,
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
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 22,
  },
  modal: {
    backgroundColor: '#17171D',
    borderRadius: 18,
    padding: 22,
    gap: 14,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#24242C',
    color: '#fff',
    borderRadius: 10,
    padding: 13,
    fontSize: 14,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#A855F7',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
  },
  cancelText: {
    color: '#aaa',
    textAlign: 'center',
    padding: 8,
  },
});
