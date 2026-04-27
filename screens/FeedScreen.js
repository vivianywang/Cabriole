import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';

const PURPLE = '#6B21A8';
const CREAM = '#FAF8F2';
const PURPLE_LIGHT = '#F3EEF9';
const BORDER = '#E8E0F0';

const CATEGORIES = ['All', 'Costume', 'Dancewear', 'Shoes', 'Accessories', 'Other'];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'date_desc' },
  { label: 'Oldest First', value: 'date_asc' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
];

const AGE_OPTIONS = [
  { label: 'Any time', value: null },
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
];

export default function FeedScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date_desc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [maxAgeDays, setMaxAgeDays] = useState(null);

  const [pendingCategory, setPendingCategory] = useState('All');
  const [pendingSortBy, setPendingSortBy] = useState('date_desc');
  const [pendingMinPrice, setPendingMinPrice] = useState('');
  const [pendingMaxPrice, setPendingMaxPrice] = useState('');
  const [pendingMaxAgeDays, setPendingMaxAgeDays] = useState(null);

  const { showChat, totalUnread } = useContext(ChatContext);

  useEffect(() => {
    loadPosts();
    const unsubscribe = navigation.addListener('focus', () => loadPosts());
    return unsubscribe;
  }, [navigation]);

  const loadPosts = async () => {
    try {
      const postsString = await AsyncStorage.getItem('posts');
      setPosts(postsString ? JSON.parse(postsString) : []);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  }, []);

  const openFilters = () => {
    setPendingCategory(selectedCategory);
    setPendingSortBy(sortBy);
    setPendingMinPrice(minPrice);
    setPendingMaxPrice(maxPrice);
    setPendingMaxAgeDays(maxAgeDays);
    setShowFilters(true);
  };

  const closeFilters = () => setShowFilters(false);

  const applyFilters = () => {
    setSelectedCategory(pendingCategory);
    setSortBy(pendingSortBy);
    setMinPrice(pendingMinPrice);
    setMaxPrice(pendingMaxPrice);
    setMaxAgeDays(pendingMaxAgeDays);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setPendingCategory('All');
    setPendingSortBy('date_desc');
    setPendingMinPrice('');
    setPendingMaxPrice('');
    setPendingMaxAgeDays(null);
  };

  const activeFilterCount = [
    selectedCategory !== 'All',
    minPrice !== '',
    maxPrice !== '',
    maxAgeDays !== null,
    sortBy !== 'date_desc',
  ].filter(Boolean).length;

  const getFilteredPosts = () => {
    let result = [...posts];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== 'All') result = result.filter(p => p.category === selectedCategory);
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) result = result.filter(p => p.price >= min);
    if (!isNaN(max)) result = result.filter(p => p.price <= max);
    if (maxAgeDays !== null) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - maxAgeDays);
      result = result.filter(p => new Date(p.createdAt) >= cutoff);
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'date_asc': return new Date(a.createdAt) - new Date(b.createdAt);
        default: return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
    return result;
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => navigation.navigate('PostDetail', { post: item })}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.images[0] }} style={styles.postImage} resizeMode="cover" />
      <View style={styles.postInfo}>
        <Text style={styles.postName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.postPrice}>${item.price.toFixed(2)}</Text>
        {item.size ? <Text style={styles.postSize}>Size: {item.size}</Text> : null}
        <Text style={styles.postUser}>by {item.userName}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No items found</Text>
      <Text style={styles.emptySubtext}>Try adjusting your filters or be the first to post!</Text>
    </View>
  );

  return (
    // Outer view: CREAM so the status bar inset area is cream
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: 0}]}>
      {/* Inner view: BORDER so the home indicator inset area matches the tab bar */}
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.brandName}>CABRIOLE</Text>
          <Text style={styles.brandSub}>marketplace</Text>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search items..."
              placeholderTextColor="#C4B5D4"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Text style={styles.searchIcon}>⌕</Text>
          </View>
          <TouchableOpacity style={styles.filterRow} onPress={openFilters}>
            <Text style={styles.filterIconText}>≡</Text>
            <Text style={styles.filterLabel}>Filters</Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <FlatList
          data={getFilteredPosts()}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.postsContainer}
          ListEmptyComponent={renderEmpty}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PURPLE} />}
        />

        {/* Tab bar — paddingBottom pushes content up, BORDER fills the home indicator zone */}
        <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Profile')}>
            <View style={styles.tabIconWrap}>
              <Text style={styles.tabIconText}>👤</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={showChat}>
            <View style={styles.tabIconWrap}>
              <Text style={styles.tabIconText}>💬</Text>

              {totalUnread > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  backgroundColor: '#6B21A8',
                  borderRadius: 10,
                  minWidth: 18,
                  height: 18,
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 4,
                }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
                    {totalUnread}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => {}}>
            <View style={styles.tabIconWrap}>
              <Text style={styles.tabIconText}>🏠</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Post')}>
            <View style={styles.tabIconWrap}>
              <Text style={styles.tabIconText}>➕</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Filter Modal — no swipe, just X button to close */}
        <Modal
          visible={showFilters}
          animationType="slide"
          transparent
          onRequestClose={closeFilters}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filters</Text>
                <View style={styles.modalHeaderRight}>
                  <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
                    <Text style={styles.resetText}>Reset all</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={closeFilters} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.filterSectionTitle}>Category</Text>
                <View style={styles.chipGrid}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.chip, pendingCategory === cat && styles.chipActive]}
                      onPress={() => setPendingCategory(cat)}
                    >
                      <Text style={[styles.chipText, pendingCategory === cat && styles.chipTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.filterSectionTitle}>Price Range</Text>
                <View style={styles.priceRow}>
                  <View style={styles.priceInputWrapper}>
                    <Text style={styles.pricePrefix}>$</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="Min"
                      placeholderTextColor="#C4B5D4"
                      keyboardType="decimal-pad"
                      value={pendingMinPrice}
                      onChangeText={setPendingMinPrice}
                    />
                  </View>
                  <Text style={styles.priceDash}>—</Text>
                  <View style={styles.priceInputWrapper}>
                    <Text style={styles.pricePrefix}>$</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="Max"
                      placeholderTextColor="#C4B5D4"
                      keyboardType="decimal-pad"
                      value={pendingMaxPrice}
                      onChangeText={setPendingMaxPrice}
                    />
                  </View>
                </View>

                <Text style={styles.filterSectionTitle}>Listing Age</Text>
                <View style={styles.chipGrid}>
                  {AGE_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={String(opt.value)}
                      style={[styles.chip, pendingMaxAgeDays === opt.value && styles.chipActive]}
                      onPress={() => setPendingMaxAgeDays(opt.value)}
                    >
                      <Text style={[styles.chipText, pendingMaxAgeDays === opt.value && styles.chipTextActive]}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.filterSectionTitle}>Sort By</Text>
                <View style={styles.sortList}>
                  {SORT_OPTIONS.map((opt, index) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.sortRow,
                        pendingSortBy === opt.value && styles.sortRowActive,
                        index === SORT_OPTIONS.length - 1 && styles.sortRowLast,
                      ]}
                      onPress={() => setPendingSortBy(opt.value)}
                    >
                      <Text style={[styles.sortText, pendingSortBy === opt.value && styles.sortTextActive]}>{opt.label}</Text>
                      {pendingSortBy === opt.value && <Text style={styles.sortCheck}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={{ height: 20 }} />
              </ScrollView>

              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: CREAM },
  container: { flex: 1, backgroundColor: CREAM },

  header: {
    backgroundColor: CREAM,
    paddingTop: 18,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  brandName: {
    fontSize: 28, fontWeight: '900', color: PURPLE,
    letterSpacing: 3, textAlign: 'center',
  },
  brandSub: {
    fontSize: 13, color: PURPLE, textAlign: 'center',
    letterSpacing: 2, marginBottom: 14, fontWeight: '400',
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 25,
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 16, paddingVertical: 8, marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },
  searchIcon: { fontSize: 20, color: '#C4B5D4', marginLeft: 6 },
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  filterIconText: { fontSize: 18, color: PURPLE, marginRight: 6, fontWeight: '600' },
  filterLabel: { fontSize: 14, color: PURPLE, fontWeight: '500' },
  filterBadge: {
    marginLeft: 6, backgroundColor: PURPLE,
    borderRadius: 10, width: 18, height: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  filterBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  postsContainer: { padding: 10, paddingBottom: 20 },
  postCard: {
    flex: 1, margin: 5, backgroundColor: '#fff',
    borderRadius: 14, overflow: 'hidden',
    shadowColor: PURPLE, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
    borderWidth: 1, borderColor: BORDER,
  },
  postImage: { width: '100%', height: 170, backgroundColor: PURPLE_LIGHT },
  postInfo: { padding: 10 },
  postName: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 5 },
  categoryBadge: {
    alignSelf: 'flex-start', backgroundColor: PURPLE_LIGHT,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, marginBottom: 5,
  },
  categoryText: { fontSize: 10, color: PURPLE, fontWeight: '600' },
  postPrice: { fontSize: 16, fontWeight: '800', color: PURPLE, marginBottom: 3 },
  postSize: { fontSize: 12, color: '#888', marginBottom: 2 },
  postUser: { fontSize: 11, color: '#bbb' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#999', marginBottom: 6 },
  emptySubtext: { fontSize: 14, color: '#bbb', textAlign: 'center', paddingHorizontal: 40 },

  tabBar: {
    height: 100,
    backgroundColor: BORDER,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  tabIconText: { fontSize: 24 },


  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: CREAM,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 34,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: PURPLE, letterSpacing: 0.5 },
  modalHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  resetButton: { paddingVertical: 4 },
  resetText: { fontSize: 14, color: '#aaa', fontWeight: '500' },
  closeButton: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: BORDER,
    justifyContent: 'center', alignItems: 'center',
  },
  closeButtonText: { fontSize: 13, color: PURPLE, fontWeight: '700' },

  filterSectionTitle: {
    fontSize: 11, fontWeight: '700', color: '#aaa',
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10, marginTop: 20,
  },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: BORDER, backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  chipText: { fontSize: 13, color: '#666', fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  priceInputWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1.5, borderColor: BORDER, paddingHorizontal: 12, paddingVertical: 10,
  },
  pricePrefix: { fontSize: 15, color: PURPLE, fontWeight: '600', marginRight: 4 },
  priceInput: { flex: 1, fontSize: 15, color: '#333' },
  priceDash: { fontSize: 16, color: '#ccc' },
  sortList: {
    borderRadius: 14, overflow: 'hidden',
    borderWidth: 1.5, borderColor: BORDER, backgroundColor: '#fff',
  },
  sortRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  sortRowLast: { borderBottomWidth: 0 },
  sortRowActive: { backgroundColor: PURPLE_LIGHT },
  sortText: { fontSize: 15, color: '#555', fontWeight: '500' },
  sortTextActive: { color: PURPLE, fontWeight: '700' },
  sortCheck: { fontSize: 16, color: PURPLE, fontWeight: '700' },
  applyButton: {
    backgroundColor: PURPLE, paddingVertical: 16, borderRadius: 14,
    alignItems: 'center', marginTop: 20,
    shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  applyButtonText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
});