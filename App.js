import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';

import LoginScreen from './screens/LoginScreen';
import FeedScreen from './screens/FeedScreen';
import PostScreen from './screens/PostScreen';
import PostDetailScreen from './screens/PostDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import { AuthContext } from './context/AuthContext';
import { ChatContext } from './context/ChatContext';

const Stack = createNativeStackNavigator();

//  Design tokens
const PURPLE       = '#6B21A8';
const PURPLE_LIGHT = '#F3EEF9';
const CREAM        = '#FAF8F2';
const BORDER       = '#E8E0F0';

//  Chat List 
function ChatList({ chats, onSelectChat, onClose }) {
  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <SafeAreaView style={styles.chatListContainer}>
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={onClose} style={styles.chatHeaderClose}>
          <Ionicons name="close" size={22} color={PURPLE} />
        </TouchableOpacity>
        <Text style={styles.chatHeaderTitle}>Messages</Text>
        <View style={{ width: 38 }} />
      </View>

      {chats.length === 0 ? (
        <View style={styles.chatEmpty}>
          <Text style={styles.chatEmptyEmoji}>💬</Text>
          <Text style={styles.chatEmptyText}>No messages yet</Text>
          <Text style={styles.chatEmptySubtext}>Start a conversation from a listing or seller profile</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.chatListItem} onPress={() => onSelectChat(item)} activeOpacity={0.8}>
              {/* Avatar */}
              <View style={styles.chatListAvatarRing}>
                <View style={styles.chatListAvatar}>
                  <Text style={styles.chatListAvatarText}>{getInitials(item.sellerName)}</Text>
                </View>
              </View>
              {/* Content */}
              <View style={styles.chatListContent}>
                <View style={styles.chatListHeaderRow}>
                  <Text style={styles.chatListName}>{item.sellerName}</Text>
                  <Text style={styles.chatListTime}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={styles.chatListBadge}>
                  <Text style={styles.chatListBadgeText}>{item.itemName}</Text>
                </View>
                <Text style={styles.chatListMessage} numberOfLines={1}>
                  {item.lastMessage || 'No messages yet'}
                </Text>
              </View>
              {/* Unread */}
              {item.unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unread}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

//  Chat Screen 
function ChatScreen({ chat, onSend, onBack, onClose }) {
  const [messageText, setMessageText] = useState('');
  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  const handleSend = () => {
    if (messageText.trim()) {
      onSend(chat.id, messageText.trim());
      setMessageText('');
    }
  };

  return (
    <SafeAreaView style={styles.chatScreen}>
      {/* Header */}
      <View style={styles.chatScreenHeader}>
        <TouchableOpacity onPress={onBack} style={styles.chatScreenBackBtn}>
          <Ionicons name="arrow-back" size={22} color={PURPLE} />
        </TouchableOpacity>
        <View style={styles.chatScreenAvatarSmall}>
          <Text style={styles.chatScreenAvatarSmallText}>{getInitials(chat.sellerName)}</Text>
        </View>
        <View style={styles.chatScreenHeaderInfo}>
          <Text style={styles.chatScreenTitle}>{chat.sellerName}</Text>
          <View style={styles.chatScreenSubtitleBadge}>
            <Text style={styles.chatScreenSubtitleText}>{chat.itemName}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.chatScreenCloseBtn}>
          <Ionicons name="close" size={22} color={PURPLE} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        data={chat.messages}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <View style={[styles.messageBubble, item.sender === 'buyer' ? styles.messageBuyer : styles.messageSeller]}>
            <Text style={[styles.messageText, item.sender === 'seller' && styles.messageTextSeller]}>
              {item.text}
            </Text>
            <Text style={[styles.messageTime, item.sender === 'seller' && styles.messageTimeSeller]}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type a message..."
          placeholderTextColor="#C4B5D4"
          value={messageText}
          onChangeText={setMessageText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, messageText.trim() ? styles.sendButtonActive : styles.sendButtonInactive]}
          onPress={handleSend}
          disabled={!messageText.trim()}
        >
          <Ionicons name="send" size={18} color={messageText.trim() ? '#fff' : '#C4B5D4'} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

//  App 
export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Chat state
  const [chats, setChats] = useState([
    {
      id: '1',
      sellerName: 'Viviona Tang',
      itemName: 'Pointe Shoes',
      lastMessage: 'Is this still available?',
      timestamp: new Date().toISOString(),
      unread: 2,
      messages: [
        { id: '1', text: 'Hi! Is this still available?', sender: 'buyer', timestamp: new Date().toISOString() },
        { id: '2', text: 'Yes it is! Would you like to meet up?', sender: 'seller', timestamp: new Date().toISOString() },
      ],
    },
  ]);
  const [showChat, setShowChat] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  //  Auth context 
  const authContext = {
    signIn: async (token, userData) => {
      try {
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        setUserToken(token);
      } catch (error) {
        console.error('Error saving auth data:', error);
      }
    },
    signOut: async () => {
      try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        setUserToken(null);
      } catch (error) {
        console.error('Error removing auth data:', error);
      }
    },
    signUp: async (token, userData) => {
      try {
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        setUserToken(token);
      } catch (error) {
        console.error('Error saving auth data:', error);
      }
    },
  };

  //  Chat helpers 
  const openChat = (itemName, sellerName, sellerEmail) => {
    const existing = chats.find((c) => c.itemName === itemName && c.sellerName === sellerName);
    if (existing) {
      setSelectedChat(existing);
    } else {
      const newChat = {
        id: Date.now().toString(),
        sellerName: sellerName || 'Seller',
        sellerEmail: sellerEmail || '',
        itemName: itemName || 'Item',
        lastMessage: '',
        timestamp: new Date().toISOString(),
        unread: 0,
        messages: [],
      };
      setChats((prev) => [...prev, newChat]);
      setSelectedChat(newChat);
    }
    setShowChat(true);
  };

  const sendMessage = (chatId, text) => {
    const newMessage = {
      id: Date.now().toString(),
      text,
      sender: 'buyer',
      timestamp: new Date().toISOString(),
    };
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, newMessage], lastMessage: text, timestamp: new Date().toISOString() }
          : chat
      )
    );
    // Keep selectedChat in sync
    setSelectedChat((prev) =>
      prev && prev.id === chatId
        ? { ...prev, messages: [...prev.messages, newMessage], lastMessage: text }
        : prev
    );
  };

  const totalUnread = chats.reduce((sum, c) => sum + c.unread, 0);

  const chatContext = {
    chats,
    openChat,
    showChat: () => setShowChat(true),
    totalUnread,
  };

  //  Render 
  if (isLoading) {
    return <View style={styles.loading} />;
  }

  return (
    <AuthContext.Provider value={authContext}>
      <ChatContext.Provider value={chatContext}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {userToken == null ? (
              <Stack.Screen name="Login" component={LoginScreen} />
            ) : (
              <>
                <Stack.Screen name="Feed" component={FeedScreen} />
                <Stack.Screen name="Post" component={PostScreen} />
                <Stack.Screen name="PostDetail" component={PostDetailScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="UserProfile" component={UserProfileScreen} />
              </>
            )}
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>

        {/* Chat overlay — sits above the navigator */}
        {showChat && (
          <View style={StyleSheet.absoluteFill}>
            {selectedChat ? (
              <ChatScreen
                chat={selectedChat}
                onSend={sendMessage}
                onBack={() => setSelectedChat(null)}
                onClose={() => { setShowChat(false); setSelectedChat(null); }}
              />
            ) : (
              <ChatList
                chats={chats}
                onSelectChat={setSelectedChat}
                onClose={() => setShowChat(false)}
              />
            )}
          </View>
        )}
      </ChatContext.Provider>
    </AuthContext.Provider>
  );
}

//  Styles 
const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: CREAM,
  },

  //  Chat list 
  chatListContainer: {
    flex: 1,
    backgroundColor: CREAM,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: CREAM,
  },
  chatHeaderClose: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: PURPLE_LIGHT,
    justifyContent: 'center', alignItems: 'center',
  },
  chatHeaderTitle: {
    fontSize: 18, fontWeight: '800', color: PURPLE, letterSpacing: 0.5,
  },
  chatEmpty: {
    flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40,
  },
  chatEmptyEmoji: { fontSize: 48, marginBottom: 14 },
  chatEmptyText: { fontSize: 18, fontWeight: '800', color: '#1a1a1a', marginBottom: 6 },
  chatEmptySubtext: { fontSize: 14, color: '#aaa', textAlign: 'center', lineHeight: 20 },

  chatListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: BORDER,
    padding: 14,
    marginBottom: 10,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  chatListAvatarRing: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 2, borderColor: PURPLE,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  chatListAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: PURPLE,
    justifyContent: 'center', alignItems: 'center',
  },
  chatListAvatarText: { fontSize: 16, color: '#fff', fontWeight: '800' },
  chatListContent: { flex: 1 },
  chatListHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4,
  },
  chatListName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  chatListTime: { fontSize: 11, color: '#aaa' },
  chatListBadge: {
    alignSelf: 'flex-start',
    backgroundColor: PURPLE_LIGHT,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 6, marginBottom: 4,
  },
  chatListBadgeText: { fontSize: 10, color: PURPLE, fontWeight: '700' },
  chatListMessage: { fontSize: 13, color: '#888' },

  unreadBadge: {
    backgroundColor: PURPLE,
    borderRadius: 12, width: 22, height: 22,
    justifyContent: 'center', alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  //  Chat screen 
  chatScreen: {
    flex: 1,
    backgroundColor: CREAM,
  },
  chatScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: CREAM,
    gap: 10,
  },
  chatScreenBackBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: PURPLE_LIGHT,
    justifyContent: 'center', alignItems: 'center',
  },
  chatScreenAvatarSmall: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: PURPLE,
    justifyContent: 'center', alignItems: 'center',
  },
  chatScreenAvatarSmallText: { fontSize: 14, color: '#fff', fontWeight: '800' },
  chatScreenHeaderInfo: { flex: 1 },
  chatScreenTitle: { fontSize: 16, fontWeight: '800', color: '#1a1a1a' },
  chatScreenSubtitleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: PURPLE_LIGHT,
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 6, marginTop: 2,
  },
  chatScreenSubtitleText: { fontSize: 10, color: PURPLE, fontWeight: '700' },
  chatScreenCloseBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: PURPLE_LIGHT,
    justifyContent: 'center', alignItems: 'center',
  },

  messageList: { flex: 1 },

  messagesEmpty: {
    flex: 1, alignItems: 'center', paddingTop: 60,
  },
  messagesEmptyEmoji: { fontSize: 40, marginBottom: 10 },
  messagesEmptyText: { fontSize: 16, fontWeight: '700', color: '#aaa' },

  messageBubble: {
    maxWidth: '72%',
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 8,
  },
  messageBuyer: {
    alignSelf: 'flex-end',
    backgroundColor: PURPLE,
    borderBottomRightRadius: 4,
  },
  messageSeller: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: BORDER,
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 15, color: '#fff', lineHeight: 20 },
  messageTextSeller: { color: '#1a1a1a' },
  messageTime: { fontSize: 10, marginTop: 4, opacity: 0.65, color: '#fff' },
  messageTimeSeller: { color: '#aaa' },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: CREAM,
    gap: 10,
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1a1a1a',
    maxHeight: 100,
  },
  sendButton: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
  },
  sendButtonActive: { backgroundColor: PURPLE },
  sendButtonInactive: { backgroundColor: PURPLE_LIGHT },
});