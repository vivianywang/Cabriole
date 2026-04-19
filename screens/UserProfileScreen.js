import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PURPLE = '#6B21A8';
const CREAM = '#FAF8F2';
const PURPLE_LIGHT = '#F3EEF9';
const BORDER = '#E8E0F0';

export default function UserProfileScreen({ route, navigation }) {
  const { userEmail, userName } = route.params;
  const [listings, setListings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const postsString = await AsyncStorage.getItem('posts');
      const allPosts = postsString ? JSON.parse(postsString) : [];
      setListings(allPosts.filter(p => p.userEmail === userEmail));
    } catch (error) {
      console.error('Error loading user listings:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadListings();
    setRefreshing(false);
  };

  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Seller Profile</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PURPLE} />
          }
        >
          {/* Avatar + Info */}
          <View style={styles.profileSection}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userEmail}>{userEmail}</Text>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{listings.length}</Text>
                <Text style={styles.statLabel}>Listings</Text>
              </View>
              {listings.length > 0 && (
                <>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      ${Math.min(...listings.map(p => p.price)).toFixed(0)}–
                      ${Math.max(...listings.map(p => p.price)).toFixed(0)}
                    </Text>
                    <Text style={styles.statLabel}>Price range</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Listings */}
          <View style={styles.listingsSection}>
            <Text style={styles.listingsSectionTitle}>LISTINGS</Text>

            {listings.length === 0 ? (
              <View style={styles.emptyListings}>
                <Text style={styles.emptyEmoji}>🩰</Text>
                <Text style={styles.emptyText}>No listings yet</Text>
              </View>
            ) : (
              listings.map(post => (
                <TouchableOpacity
                  key={post.id}
                  style={styles.listingRow}
                  onPress={() => navigation.navigate('PostDetail', { post })}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: post.images[0] }}
                    style={styles.listingImage}
                    resizeMode="cover"
                  />
                  <View style={styles.listingInfo}>
                    <Text style={styles.listingName} numberOfLines={1}>{post.name}</Text>
                    <View style={styles.listingBadge}>
                      <Text style={styles.listingBadgeText}>{post.category}</Text>
                    </View>
                    <Text style={styles.listingPrice}>${post.price.toFixed(2)}</Text>
                    <Text style={styles.listingDate}>
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
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

  profileSection: {
    alignItems: 'center',
    paddingTop: 30, paddingBottom: 24, paddingHorizontal: 20,
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
  emptyText: { fontSize: 16, fontWeight: '700', color: '#999' },

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
});