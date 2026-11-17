import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle, Path, Line } from 'react-native-svg';

type Chat = {
  id: string;
  name: string;
  message: string;
  time: string;
};

const chats: Chat[] = [
  { id: '1', name: 'Treasure Okechukwu', message: 'You: Hey', time: '4 Apr' },
  { id: '2', name: 'Marcos Broley', message: 'You: Got it', time: '2h' },
  { id: '3', name: 'Alex Chen', message: 'See you tomorrow', time: '1d' },
  { id: '4', name: 'Jordan Lee', message: 'You: Thanks', time: '3d' },
  { id: '5', name: 'Sam Rivera', message: 'Message unavailable', time: '30 Mar' },
  { id: '6', name: 'Big Kelly', message: 'Message unavailable', time: '21 Jan' },
];

const notes = ['Your note', 'alex_c', 'jordan', 'sam_w', 'maya'];

type Props = {
  onNavigate?: (screen: 'home' | 'friends' | 'inbox' | 'profile') => void;
  onCreate?: () => void;
};

export function InboxScreen({ onNavigate, onCreate }: Props) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'notifications'>('chats');

  const filteredChats = useMemo(
    () =>
      chats.filter((chat) =>
        chat.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const openChat = (name: string) => {
    Alert.alert(name, 'The individual chat screen will be connected later.');
  };

  const openSettings = () => {
    Alert.alert('Settings', 'Inbox settings will be added later.');
  };

  return (
    <View style={styles.screen}>
     

{/* Header */}
<View style={styles.header}>
  <View style={styles.titles}>
    <Pressable onPress={() => {
      setActiveTab('chats');
      setSearch('');
    }}>
      <Text style={[
        styles.inactiveTitle,
        activeTab === 'chats' && styles.activeTitle
      ]}>
        Chats
      </Text>
    </Pressable>

    <Pressable onPress={() => {
      setActiveTab('notifications');
      setSearch('');
    }}>
      <Text style={[
        styles.inactiveTitle,
        activeTab === 'notifications' && styles.activeTitle
      ]}>
        Notifications
      </Text>
    </Pressable>
  </View>

  <Pressable onPress={openSettings} style={styles.settingsButton}>
    <Svg width={23} height={23} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3"
        stroke="#FAFAFA" strokeWidth="1.7" />
      <Path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke="#FAFAFA"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </Pressable>
</View>

{/* Search */}
<View style={[
  styles.searchContainer,
  activeTab === 'notifications' && styles.notificationSearch
]}>
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7"
      stroke="#888888" strokeWidth="2" />
    <Line x1="16.5" y1="16.5" x2="21" y2="21"
      stroke="#888888" strokeWidth="2"
      strokeLinecap="round" />
  </Svg>

  <TextInput
    style={styles.searchInput}
    placeholder="Search"
    placeholderTextColor="#888888"
    value={search}
    onChangeText={setSearch}
  />
</View>


{/* Main Content */}
{activeTab === 'chats' ? (
  <>
    {/* Notes */}
    <View style={styles.notesContainer}>
      {notes.map((note, index) => (
        <Pressable
          key={note}
          style={styles.noteItem}
          onPress={() =>
            Alert.alert(note, 'Notes interaction will be added later.')
          }
        >
          <View style={styles.noteAvatar}>
            {index === 0 && (
              <View style={styles.plusBadge}>
                <Text style={styles.plusText}>+</Text>
              </View>
            )}
          </View>
          <Text style={styles.noteName} numberOfLines={1}>
            {note}
          </Text>
        </Pressable>
      ))}
    </View>

    <FlatList
      data={filteredChats}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.chatList}
      renderItem={({ item }) => (
        <Pressable
          style={styles.chatRow}
          onPress={() => openChat(item.name)}
        >
          <View style={styles.chatAvatar}>
            <Svg width={25} height={25} viewBox="0 0 24 24">
              <Path
                d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.5"
                fill="none"
              />
              <Circle cx="12" cy="7" r="4"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.5" fill="none" />
            </Svg>
          </View>
          <View style={styles.chatBody}>
            <Text style={styles.chatName}>{item.name}</Text>
            <Text style={styles.chatPreview} numberOfLines={1}>
              {item.message} · {item.time}
            </Text>
          </View>
        </Pressable>
      )}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No conversations found.</Text>
      }
    />
  </>
) : (
  <FlatList
    style={styles.notificationFeed}
    data={[
      { id: '1', title: 'Elon on solar city' },
      { id: '2', title: 'My VC Funding Journey' },
    ].filter(item => item.title.toLowerCase().includes(search.toLowerCase()))}
    keyExtractor={item => item.id}
  
ListHeaderComponent={
  <View style={styles.contentsHeading}>
    <View style={styles.contentsLine} />
    <Text style={styles.contentsLabel}>CONTENTS</Text>
    <View style={styles.contentsLine} />
  </View>
}

   
renderItem={({ item, index }) => (
  <>
    <View style={styles.notificationRow}>
      
<LinearGradient
  colors={
    index === 0
      ? ['#1A2A3A', '#0D1520']
      : ['#2A1A3A', '#150D20']
  }
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.notificationThumb}
/>

      <Text style={styles.notificationTitle}>{item.title}</Text>
    </View>

    {index === 0 && <View style={styles.notificationSeparator} />}
  </>
)}

    ListFooterComponent={
      <View>
        <Text style={styles.seeMore}>— See More —</Text>
        <Text style={styles.activityTitle}>Activity</Text>

        <View style={styles.activityRow}>
          
<LinearGradient
  colors={['#1A2230', '#0C1018']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.activityAvatar}
/>
          <Text style={styles.activityText}>
            Marcos started following you
          </Text>
        </View>

        <View style={styles.activityRow}>
          
<LinearGradient
  colors={['#1A2230', '#0C1018']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.activityAvatar}
/>

          <Text style={styles.activityText}>
            Lucas shared your video
          </Text>
          
<LinearGradient
  colors={['#2A1A3A', '#150D20']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.activityThumb}
>
  <Text style={{ color: '#FFFFFF' }}>▶</Text>
</LinearGradient>
        </View>
      </View>
    }
  />
)}

     

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Pressable
          style={styles.navItem}
          onPress={() => onNavigate?.('home')}
        >
          <Text style={styles.navIcon}>⌂</Text>
          <Text style={styles.navText}>Home</Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => onNavigate?.('friends')}
        >
          <Text style={styles.navIcon}>♧</Text>
          <Text style={styles.navText}>Friends</Text>
        </Pressable>

        <Pressable style={styles.navItem} onPress={onCreate}>
          <View style={styles.createButton}>
            <Text style={styles.createText}>+</Text>
          </View>
        </Pressable>

        <View style={styles.navItem}>
          <Text style={styles.activeNavIcon}>▢</Text>
          <Text style={styles.activeNavText}>Chat</Text>
        </View>

        <Pressable
          style={styles.navItem}
          onPress={() => onNavigate?.('profile')}
        >
          <Text style={styles.navIcon}>◯</Text>
          <Text style={styles.navText}>Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#050506',
    paddingTop: 18,
  },
  header: {
    height: 55,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activeTitle: {
    color: '#FAFAFA',
    fontSize: 22,
    fontWeight: '700',
  },
  inactiveTitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 15,
    fontWeight: '500',
  },
  settingsButton: {
    padding: 5,
  },
  searchContainer: {
    height: 36,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: '#171719',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FAFAFA',
    fontSize: 13,
    paddingVertical: 0,
  },
  notesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 22,
    marginBottom: 20,
  },
  noteItem: {
    alignItems: 'center',
    width: 62,
  },
  noteAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#151B25',
    borderWidth: 1,
    borderColor: '#252A34',
    marginBottom: 6,
  },
  plusBadge: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: '#22D3EE',
    borderWidth: 2,
    borderColor: '#050506',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    color: '#050506',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 17,
  },
  noteName: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    maxWidth: 62,
  },
  chatList: {
    paddingBottom: 100,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  chatAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#111722',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBody: {
    flex: 1,
    minWidth: 0,
  },
  chatName: {
    color: '#FAFAFA',
    fontSize: 14.5,
    fontWeight: '600',
    marginBottom: 3,
  },
  chatPreview: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
  },
  emptyText: {
    color: '#888888',
    textAlign: 'center',
    marginTop: 30,
  },
  bottomNav: {
    height: 72,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#09090B',
    borderTopWidth: 1,
    borderTopColor: '#202024',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  navIcon: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 23,
  },
  navText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
  },
  activeNavIcon: {
    color: '#FAFAFA',
    fontSize: 23,
  },
  activeNavText: {
    color: '#FAFAFA',
    fontSize: 10,
  },
  createButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#22D3EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createText: {
    color: '#050506',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '400',
  },


notificationSearch: {
  flex: 0,
  width: 150,
  height: 38,
  marginTop: 0,
  marginLeft: 8,
  marginRight: 16,
  paddingHorizontal: 10,
  alignSelf: 'center',
},


notificationFeed: {
  flex: 1,
  marginTop: 0,
},

contentsLabel: {
  color: 'rgba(255,255,255,0.45)',
  fontSize: 13,
  fontWeight: '600',
  letterSpacing: 0.3,
  marginHorizontal: 16,
  marginTop: 18,
  marginBottom: 14,
  flexDirection: 'row',
  textAlign: 'center',
},

contentsHeading: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  marginHorizontal: 16,
  marginTop: 18,
  marginBottom: 14,
},

contentsLine: {
  flex: 1,
  height: 1,
  backgroundColor: 'rgba(255,255,255,0.12)',
},


notificationRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 14,
  paddingHorizontal: 16,
  paddingVertical: 10,
},

notificationSeparator: {
  height: 1,
  backgroundColor: 'rgba(255,255,255,0.1)',
  marginHorizontal: 16,
  marginVertical: 8,
},


notificationThumb: {
  width: 72,
  height: 72,
  borderRadius: 10,
  overflow: 'hidden',
  flexShrink: 0,
},

notificationTitle: {
  flex: 1,
  color: 'rgba(255,255,255,0.88)',
  fontSize: 14.5,
  fontWeight: '500',
  lineHeight: 20,
},

seeMore: {
  width: 'auto',
  textAlign: 'center',
  color: 'rgba(255,255,255,0.5)',
  marginHorizontal: 16,
  marginTop: 12,
  marginBottom: 18,
  paddingVertical: 10,
  fontSize: 13,
  fontWeight: '500',
  letterSpacing: 0.2,
},

activityTitle: {
  color: '#FAFAFA',
  fontSize: 16,
  fontWeight: '700',
  paddingHorizontal: 16,
  paddingTop: 4,
  paddingBottom: 12,
},

activityRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  paddingHorizontal: 16,
  paddingVertical: 10,
},

activityAvatar: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#1A2230',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  flexShrink: 0,
},

activityText: {
  flex: 1,
  color: 'rgba(255,255,255,0.75)',
  fontSize: 13.5,
  lineHeight: 18,
},

activityThumb: {
  width: 40,
  height: 40,
  borderRadius: 6,
  backgroundColor: '#2A1A3A',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
},

});
