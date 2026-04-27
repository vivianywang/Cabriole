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
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PURPLE = '#6B21A8';
const CREAM = '#FAF8F2';
const PURPLE_LIGHT = '#F3EEF9';
const BORDER = '#E8E0F0';
const RED = '#DC2626';
const RED_LIGHT = '#FEF2F2';

const REPORT_REASONS = [
  'Fake or misleading listing',
  'Inappropriate content',
  'Spam or scam',
  'Harassment',
  'Wrong category',
  'Other',
];

export default function UserProfileScreen({ route, navigation }) {
  const { userEmail, userName } = route.params;
  const { openChat } = useContext(ChatContext);
  const [listings, setListings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState([]);
  const [myReport, setMyReport] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [extraNote, setExtraNote] = useState('');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const me = userData ? JSON.parse(userData) : null;
      setCurrentUserEmail(me?.email || null);

      const postsString = await AsyncStorage.getItem('posts');
      const allPosts = postsString ? JSON.parse(postsString) : [];
      setListings(allPosts.filter(p => p.userEmail === userEmail));

      const reportsKey = `reports:${userEmail}`;
      const reportsString = await AsyncStorage.getItem(reportsKey);
      const allReports = reportsString ? JSON.parse(reportsString) : [];
      setReports(allReports);

      if (me?.email) {
        setMyReport(allReports.find(r => r.reporterEmail === me.email) || null);
      }
    } catch (error) {
      console.error('Error loading user profile data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const handleSubmitReport = async () => {
    if (!selectedReason) {
      Alert.alert('Select a reason', 'Please choose a reason for your report.');
      return;
    }
    if (!currentUserEmail) {
      Alert.alert('Error', 'You must be logged in to report a user.');
      return;
    }
    try {
      const reportsKey = `reports:${userEmail}`;
      const reportsString = await AsyncStorage.getItem(reportsKey);
      const allReports = reportsString ? JSON.parse(reportsString) : [];

      if (allReports.find(r => r.reporterEmail === currentUserEmail)) {
        Alert.alert('Already reported', 'You have already reported this seller.');
        setShowReportModal(false);
        return;
      }

      const newReport = {
        id: Date.now().toString(),
        reporterEmail: currentUserEmail,
        reason: selectedReason,
        note: extraNote.trim(),
        createdAt: new Date().toISOString(),
      };

      const updated = [...allReports, newReport];
      await AsyncStorage.setItem(reportsKey, JSON.stringify(updated));
      setReports(updated);
      setMyReport(newReport);
      setShowReportModal(false);
      setSelectedReason('');
      setExtraNote('');
      Alert.alert('Report submitted', 'Thank you. We will review this seller.');
    } catch (e) {
      Alert.alert('Error', 'Could not submit report. Please try again.');
    }
  };

  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const isOwnProfile = currentUserEmail === userEmail;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Seller Profile</Text>
          {!isOwnProfile ? (
            <TouchableOpacity
              style={[styles.reportHeaderBtn, myReport && styles.reportHeaderBtnDone]}
              onPress={() => myReport ? setShowReportsModal(true) : setShowReportModal(true)}
            >
              <Text style={[styles.reportHeaderBtnText, myReport && styles.reportHeaderBtnTextDone]}>
                {myReport ? 'Reported' : 'Report'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}
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
                      ${Math.min(...listings.map(p => p.price)).toFixed(0)}–${Math.max(...listings.map(p => p.price)).toFixed(0)}
                    </Text>
                    <Text style={styles.statLabel}>Price range</Text>
                  </View>
                </>
              )}
              {reports.length > 0 && (
                <>
                  <View style={styles.statDivider} />
                  <TouchableOpacity style={styles.statItem} onPress={() => setShowReportsModal(true)}>
                    <Text style={[styles.statNumber, styles.statNumberRed]}>{reports.length}</Text>
                    <Text style={[styles.statLabel, styles.statLabelRed]}>Reports ›</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Warning banner if 3+ reports */}
            {reports.length >= 3 && (
              <View style={styles.warningBanner}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.warningText}>
                  This seller has been reported {reports.length} time{reports.length !== 1 ? 's' : ''} by the community. Proceed with caution.
                </Text>
              </View>
            )}

            {/* Message button */}
            {!isOwnProfile && (
              <TouchableOpacity
                style={styles.messageBtn}
                onPress={() => openChat('General inquiry', userName, userEmail)}
                activeOpacity={0.85}
              >
                <Text style={styles.messageBtnIcon}>💬</Text>
                <Text style={styles.messageBtnText}>Message {userName.split(' ')[0]}</Text>
              </TouchableOpacity>
            )}
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
                  <Image source={{ uri: post.images[0] }} style={styles.listingImage} resizeMode="cover" />
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

      {/* ── Report submission modal ── */}
      <Modal visible={showReportModal} animationType="slide" transparent onRequestClose={() => setShowReportModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Seller</Text>
              <TouchableOpacity
                onPress={() => { setShowReportModal(false); setSelectedReason(''); setExtraNote(''); }}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Why are you reporting <Text style={{ fontWeight: '700' }}>{userName}</Text>?
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.reasonsList}>
                {REPORT_REASONS.map(reason => (
                  <TouchableOpacity
                    key={reason}
                    style={[styles.reasonRow, selectedReason === reason && styles.reasonRowActive]}
                    onPress={() => setSelectedReason(reason)}
                  >
                    <View style={[styles.radioOuter, selectedReason === reason && styles.radioOuterActive]}>
                      {selectedReason === reason && <View style={styles.radioInner} />}
                    </View>
                    <Text style={[styles.reasonText, selectedReason === reason && styles.reasonTextActive]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.noteLabel}>Additional details (optional)</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="Describe the issue..."
                placeholderTextColor="#C4B5D4"
                value={extraNote}
                onChangeText={setExtraNote}
                multiline
                numberOfLines={3}
                maxLength={300}
                textAlignVertical="top"
              />
              <View style={{ height: 16 }} />
            </ScrollView>

            <TouchableOpacity style={styles.submitReportBtn} onPress={handleSubmitReport}>
              <Text style={styles.submitReportBtnText}>Submit Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── View all reports modal ── */}
      <Modal visible={showReportsModal} animationType="slide" transparent onRequestClose={() => setShowReportsModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Community Reports</Text>
              <TouchableOpacity onPress={() => setShowReportsModal(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              {reports.length} report{reports.length !== 1 ? 's' : ''} submitted for this seller.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {reports.map(r => (
                <View key={r.id} style={styles.reportCard}>
                  <View style={styles.reportCardHeader}>
                    <View style={styles.reportReasonBadge}>
                      <Text style={styles.reportReasonBadgeText}>{r.reason}</Text>
                    </View>
                    <Text style={styles.reportDate}>
                      {new Date(r.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </Text>
                  </View>
                  {r.note ? <Text style={styles.reportNote}>"{r.note}"</Text> : null}
                </View>
              ))}
              <View style={{ height: 16 }} />
            </ScrollView>

            {!isOwnProfile && !myReport && (
              <TouchableOpacity
                style={styles.addReportBtn}
                onPress={() => { setShowReportsModal(false); setShowReportModal(true); }}
              >
                <Text style={styles.addReportBtnText}>Add My Report</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
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
  reportHeaderBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, borderWidth: 1.5, borderColor: RED,
  },
  reportHeaderBtnDone: { borderColor: '#ccc' },
  reportHeaderBtnText: { fontSize: 13, fontWeight: '700', color: RED },
  reportHeaderBtnTextDone: { color: '#aaa' },

  profileSection: {
    alignItems: 'center',
    paddingTop: 30, paddingBottom: 24, paddingHorizontal: 20,
  },
  avatarRing: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: PURPLE,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
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
    paddingVertical: 16, paddingHorizontal: 24, width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: '800', color: PURPLE, marginBottom: 2 },
  statNumberRed: { color: RED },
  statLabel: { fontSize: 11, color: '#aaa', fontWeight: '600', letterSpacing: 0.5 },
  statLabelRed: { color: RED },
  statDivider: { width: 1, height: 36, backgroundColor: BORDER },

  warningBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: RED_LIGHT, borderRadius: 12,
    borderWidth: 1.5, borderColor: '#FECACA',
    padding: 12, marginTop: 14, width: '100%', gap: 8,
  },
  warningIcon: { fontSize: 18 },
  warningText: { flex: 1, fontSize: 13, color: RED, fontWeight: '500', lineHeight: 18 },

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

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: CREAM, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 34, maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: PURPLE },
  modalSubtitle: { fontSize: 14, color: '#888', marginBottom: 20 },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: BORDER, justifyContent: 'center', alignItems: 'center',
  },
  closeBtnText: { fontSize: 13, color: PURPLE, fontWeight: '700' },

  reasonsList: { marginBottom: 20 },
  reasonRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: 12, borderWidth: 1.5, borderColor: BORDER,
    backgroundColor: '#fff', marginBottom: 8, gap: 12,
  },
  reasonRowActive: { borderColor: RED, backgroundColor: RED_LIGHT },
  radioOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#ccc',
    justifyContent: 'center', alignItems: 'center',
  },
  radioOuterActive: { borderColor: RED },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: RED },
  reasonText: { fontSize: 14, color: '#555', fontWeight: '500' },
  reasonTextActive: { color: RED, fontWeight: '700' },
  noteLabel: {
    fontSize: 11, fontWeight: '700', color: '#aaa',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8,
  },
  noteInput: {
    backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 12, fontSize: 14, borderWidth: 1.5, borderColor: BORDER,
    color: '#1a1a1a', minHeight: 80,
  },
  submitReportBtn: {
    backgroundColor: RED, paddingVertical: 16,
    borderRadius: 14, alignItems: 'center', marginTop: 8,
  },
  submitReportBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  reportCard: {
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1.5, borderColor: BORDER,
    padding: 14, marginBottom: 10,
  },
  reportCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  reportReasonBadge: {
    backgroundColor: RED_LIGHT, paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 20,
  },
  reportReasonBadgeText: { fontSize: 12, color: RED, fontWeight: '700' },
  reportDate: { fontSize: 11, color: '#bbb' },
  reportNote: { fontSize: 13, color: '#666', fontStyle: 'italic', lineHeight: 18 },
  addReportBtn: {
    borderWidth: 1.5, borderColor: RED, paddingVertical: 14,
    borderRadius: 14, alignItems: 'center', marginTop: 8,
  },
  addReportBtnText: { color: RED, fontSize: 16, fontWeight: '700' },

  messageBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: PURPLE, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 28,
    marginTop: 18, width: '100%', gap: 8,
    shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 4,
  },
  messageBtnIcon: { fontSize: 18 },
  messageBtnText: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
});