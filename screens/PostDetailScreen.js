import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  Linking,
  SafeAreaView,
} from 'react-native';

const { width } = Dimensions.get('window');
const PURPLE = '#6B21A8';
const CREAM = '#FAF8F2';
const PURPLE_LIGHT = '#F3EEF9';
const BORDER = '#E8E0F0';

export default function PostDetailScreen({ route, navigation }) {
  const { post } = route.params;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleContact = () => {
    const subject = encodeURIComponent(`Interested in: ${post.name}`);
    const body = encodeURIComponent(`Hi ${post.userName},\n\nI'm interested in your ${post.name} listed for $${post.price}.\n\n`);
    const mailtoUrl = `mailto:${post.userEmail}?subject=${subject}&body=${body}`;
    Linking.canOpenURL(mailtoUrl).then((supported) => {
      if (supported) {
        Linking.openURL(mailtoUrl);
      } else {
        Alert.alert('Contact Seller', `Email: ${post.userEmail}`, [{ text: 'OK' }]);
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Item Details</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Image Gallery */}
          <View style={styles.galleryContainer}>
            <ScrollView
              horizontal pagingEnabled showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                setSelectedImageIndex(Math.round(e.nativeEvent.contentOffset.x / width));
              }}
            >
              {post.images.map((uri, index) => (
                <Image key={index} source={{ uri }} style={styles.mainImage} resizeMode="cover" />
              ))}
            </ScrollView>
            {post.images.length > 1 && (
              <View style={styles.dots}>
                {post.images.map((_, i) => (
                  <View key={i} style={[styles.dot, i === selectedImageIndex && styles.dotActive]} />
                ))}
              </View>
            )}
          </View>

          <View style={styles.content}>
            {/* Price + Title */}
            <Text style={styles.price}>${post.price.toFixed(2)}</Text>
            <Text style={styles.itemName}>{post.name}</Text>

            {/* Badges row */}
            <View style={styles.badgesRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{post.category}</Text>
              </View>
              {post.size ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Size {post.size}</Text>
                </View>
              ) : null}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Description */}
            {post.description ? (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>DESCRIPTION</Text>
                <Text style={styles.description}>{post.description}</Text>
              </View>
            ) : null}

            {/* Tags */}
            {post.tags && post.tags.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>TAGS</Text>
                <View style={styles.tagsRow}>
                  {post.tags.map((tag, i) => (
                    <View key={i} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Seller */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>SELLER</Text>
              <View style={styles.sellerCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {post.userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerName}>{post.userName}</Text>
                  <Text style={styles.sellerEmail}>{post.userEmail}</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
            <Text style={styles.contactButtonText}>Contact Seller</Text>
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
    borderBottomWidth: 1, borderBottomColor: BORDER, backgroundColor: CREAM,
  },
  backButton: { width: 44, height: 44, justifyContent: 'center' },
  backButtonText: { fontSize: 26, color: PURPLE, fontWeight: '300' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: PURPLE, letterSpacing: 0.5 },
  scrollView: { flex: 1 },
  galleryContainer: { position: 'relative', backgroundColor: PURPLE_LIGHT },
  mainImage: { width, height: width * 0.9, backgroundColor: PURPLE_LIGHT },
  dots: {
    position: 'absolute', bottom: 14,
    left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  dot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: 'rgba(107,33,168,0.25)',
  },
  dotActive: { backgroundColor: PURPLE, width: 20 },
  content: { padding: 20, paddingBottom: 30 },
  price: { fontSize: 32, fontWeight: '900', color: PURPLE, marginBottom: 4 },
  itemName: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 14 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  badge: {
    backgroundColor: PURPLE_LIGHT, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: BORDER,
  },
  badgeText: { fontSize: 12, color: PURPLE, fontWeight: '600' },
  divider: { height: 1, backgroundColor: BORDER, marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#aaa',
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10,
  },
  description: { fontSize: 15, color: '#555', lineHeight: 23 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 16, borderWidth: 1.5, borderColor: BORDER,
  },
  tagText: { fontSize: 13, color: PURPLE, fontWeight: '600' },
  sellerCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', padding: 16, borderRadius: 14,
    borderWidth: 1.5, borderColor: BORDER,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: PURPLE, justifyContent: 'center',
    alignItems: 'center', marginRight: 14,
  },
  avatarText: { fontSize: 20, color: '#fff', fontWeight: '800' },
  sellerInfo: { flex: 1 },
  sellerName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 2 },
  sellerEmail: { fontSize: 13, color: '#aaa' },
  footer: {
    padding: 16, paddingBottom: 20,
    backgroundColor: CREAM, borderTopWidth: 1, borderTopColor: BORDER,
  },
  contactButton: {
    backgroundColor: PURPLE, paddingVertical: 16, borderRadius: 14,
    alignItems: 'center',
    shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  contactButtonText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
});