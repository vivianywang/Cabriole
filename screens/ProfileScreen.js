import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  FlatList,
  Image,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';

const PURPLE = '#6B21A8';
const CREAM = '#FAF8F2';
const PURPLE_LIGHT = '#F3EEF9';
const BORDER = '#E8E0F0';

export default function ProfileScreen({ navigation }) {
  const { signOut } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const user = JSON.parse(data);
        setUserData(user);
        const postsString = await AsyncStorage.getItem('posts');
        const allPosts = postsString ? JSON.parse(postsString) : [];
        setMyPosts(allPosts.filter(p => p.userEmail === user.email));
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleDeletePost = (postId) => {
    Alert.alert('Delete Listing', 'Are you sure you want to remove this listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            const postsString = await AsyncStorage.getItem('posts');
            const allPosts = postsString ? JSON.parse(postsString) : [];
            const updated = allPosts.filter(p => p.id !== postId);
            await AsyncStorage.setItem('posts', JSON.stringify(updated));
            setMyPosts(myPosts.filter(p => p.id !== postId));
          } catch (e) {
            Alert.alert('Error', 'Could not delete listing.');
          }
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', onPress: signOut, style: 'destructive' },
    ]);
  };

  const initials = userData?.name
    ? userData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutBtnText}>Log out</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PURPLE} />}
        >
          {/* Avatar + Info */}
          <View style={styles.profileSection}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>
            {userData && (
              <>
                <Text style={styles.userName}>{userData.name}</Text>
                <Text style={styles.userEmail}>{userData.email}</Text>
              </>
            )}

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{myPosts.length}</Text>
                <Text style={styles.statLabel}>Listings</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {myPosts.length > 0
                    ? `$${Math.min(...myPosts.map(p => p.price)).toFixed(0)}–$${Math.max(...myPosts.map(p => p.price)).toFixed(0)}`
                    : '—'}
                </Text>
                <Text style={styles.statLabel}>Price range</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Feed')}>
              <Text style={styles.actionBtnIcon}>🏠</Text>
              <Text style={styles.actionBtnText}>Browse</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={() => navigation.navigate('Post')}>
              <Text style={styles.actionBtnIconWhite}>+</Text>
              <Text style={styles.actionBtnTextWhite}>New Listing</Text>
            </TouchableOpacity>
          </View>

          {/* My Listings */}
          <View style={styles.listingsSection}>
            <Text style={styles.listingsSectionTitle}>MY LISTINGS</Text>

            {myPosts.length === 0 ? (
              <View style={styles.emptyListings}>
                <Text style={styles.emptyEmoji}>🩰</Text>
                <Text style={styles.emptyText}>No listings yet</Text>
                <Text style={styles.emptySubtext}>Tap + to post your first item</Text>
              </View>
            ) : (
              myPosts.map(post => (
                <TouchableOpacity
                  key={post.id}
                  style={styles.listingRow}
                  onPress={() => navigation.navigate('PostDetail', { post })}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: post.images[0] }} style={styles.listingImage} resizeMode="cover" />
                  <View style={styles.listingInfo}>
                    <Text style={styles.listingName} numberOfLines={1}>{post.name}</Text>
                    <View style={styles.listingBadge}>
                      <Text style={styles.listingBadgeText}>{post.category}</Text>
                    </View>
                    <Text style={styles.listingPrice}>${post.price.toFixed(2)}</Text>
                    <Text style={styles.listingDate}>
                      {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeletePost(post.id)}>
                    <Text style={styles.deleteBtnText}>🗑</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Bottom Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem} onPress={() => {}}>
            <View style={[styles.tabIconWrap, styles.tabIconWrapActive]}>
              <Text style={styles.tabIconText}>👤</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Feed')}>
            <View style={styles.tabIconWrap}>
              <Text style={styles.tabIconText}>🏠</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Feed')}>
            <View style={styles.tabIconWrap}>
              <Text style={styles.tabIconText}>➕</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: CREAM },
  container: { flex: 1, backgroundColor: CREAM },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  backBtnText: { fontSize: 26, color: PURPLE, fontWeight: '300' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: PURPLE, letterSpacing: 0.5 },
  logoutBtn: { paddingHorizontal: 4 },
  logoutBtnText: { fontSize: 14, color: '#C4B5D4', fontWeight: '600' },

  profileSection: {
    alignItems: 'center',
    paddingTop: 30, paddingBottom: 24,
    paddingHorizontal: 20,
  },
  avatarRing: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: PURPLE,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
    shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 10, elevation: 4,
  },
  avatar: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: PURPLE, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 28, color: '#fff', fontWeight: '800' },
  userName: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  userEmail: { fontSize: 14, color: '#aaa', marginBottom: 24 },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1.5, borderColor: BORDER,
    paddingVertical: 16, paddingHorizontal: 24,
    width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: '800', color: PURPLE, marginBottom: 2 },
  statLabel: { fontSize: 11, color: '#aaa', fontWeight: '600', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 36, backgroundColor: BORDER },

  actionsRow: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 20, marginTop: 20, marginBottom: 4,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 13, borderRadius: 12,
    borderWidth: 1.5, borderColor: BORDER, backgroundColor: '#fff',
  },
  actionBtnPrimary: { backgroundColor: PURPLE, borderColor: PURPLE },
  actionBtnIcon: { fontSize: 18, color: PURPLE },
  actionBtnIconWhite: { fontSize: 22, color: '#fff', fontWeight: '300', lineHeight: 24 },
  actionBtnText: { fontSize: 14, fontWeight: '700', color: PURPLE },
  actionBtnTextWhite: { fontSize: 14, fontWeight: '700', color: '#fff' },

  listingsSection: { paddingHorizontal: 20, marginTop: 28 },
  listingsSectionTitle: {
    fontSize: 11, fontWeight: '700', color: '#aaa',
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 14,
  },
  emptyListings: {
    alignItems: 'center', paddingVertical: 40,
    backgroundColor: '#fff', borderRadius: 16,
    borderWidth: 1.5, borderColor: BORDER,
  },
  emptyEmoji: { fontSize: 36, marginBottom: 10 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#999', marginBottom: 4 },
  emptySubtext: { fontSize: 13, color: '#ccc' },
  listingRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1.5, borderColor: BORDER,
    padding: 12, marginBottom: 10,
    shadowColor: PURPLE, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  listingImage: {
    width: 72, height: 72, borderRadius: 10,
    backgroundColor: PURPLE_LIGHT, marginRight: 12,
  },
  listingInfo: { flex: 1 },
  listingName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  listingBadge: {
    alignSelf: 'flex-start', backgroundColor: PURPLE_LIGHT,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 5,
  },
  listingBadgeText: { fontSize: 10, color: PURPLE, fontWeight: '700' },
  listingPrice: { fontSize: 15, fontWeight: '800', color: PURPLE, marginBottom: 2 },
  listingDate: { fontSize: 11, color: '#bbb' },
  deleteBtn: { padding: 8 },
  deleteBtnText: { fontSize: 18 },

  // Tab Bar
  tabBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 72, backgroundColor: CREAM,
    borderTopWidth: 1, borderTopColor: BORDER,
    flexDirection: 'row', justifyContent: 'space-around',
    alignItems: 'center', paddingBottom: 10,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  tabIconWrapActive: { backgroundColor: PURPLE_LIGHT },
  tabIconText: { fontSize: 24 },
  plusButton: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: PURPLE, justifyContent: 'center', alignItems: 'center',
    shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  plusIcon: { fontSize: 32, color: '#fff', lineHeight: 34, fontWeight: '300' },
});