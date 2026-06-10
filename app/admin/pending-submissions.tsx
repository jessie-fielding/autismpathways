/**
 * Admin: Pending Provider Submissions
 *
 * Owner-only screen to review, approve, or decline provider directory
 * submissions. Accessible via Settings → Admin → Pending Submissions
 * or via deep link: autismpathways://admin/approve-submission?id=xxx
 *
 * On approval:
 *  - Marks the submission as approved in AsyncStorage
 *  - Adds the provider to a local ap_approved_providers list
 *  - Sends a notification to the submitter (if email stored)
 *  - Grants the Verified badge when the provider signs up with Provider Mode
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';

const PENDING_KEY   = 'ap_provider_submissions';
const APPROVED_KEY  = 'ap_approved_providers';
const OWNER_EMAIL   = 'jessie@autismpathways.app'; // update as needed

type Submission = {
  id: string;
  providerName: string;
  providerType: string;
  specialty: string;
  state: string;
  phone?: string;
  website?: string;
  description?: string;
  medicaidAccepted: boolean;
  acceptingPatients: boolean;
  submittedBy: string;
  submitterRelation?: string;
  submittedAt: string;
  status: 'pending_review' | 'approved' | 'declined';
};

export default function PendingSubmissions() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string }>();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending_review' | 'approved' | 'declined'>('pending_review');

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(PENDING_KEY);
      const all: Submission[] = raw ? JSON.parse(raw) : [];
      setSubmissions(all);
      // If deep-linked to a specific ID, auto-scroll / highlight it
      if (params.id) {
        const match = all.find((s) => s.id === params.id);
        if (match && match.status === 'pending_review') {
          // Already in pending — just show the list
        }
      }
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useFocusEffect(useCallback(() => { loadSubmissions(); }, [loadSubmissions]));

  const handleApprove = async (sub: Submission) => {
    Alert.alert(
      'Approve Submission',
      `Add "${sub.providerName}" to the directory with a Verified badge?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve ✅',
          onPress: async () => {
            // Update status in pending list
            const raw = await AsyncStorage.getItem(PENDING_KEY);
            const all: Submission[] = raw ? JSON.parse(raw) : [];
            const updated = all.map((s) =>
              s.id === sub.id ? { ...s, status: 'approved' as const } : s
            );
            await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(updated));

            // Add to approved providers list (used for Verified badge lookup)
            const approvedRaw = await AsyncStorage.getItem(APPROVED_KEY);
            const approved: Submission[] = approvedRaw ? JSON.parse(approvedRaw) : [];
            approved.push({ ...sub, status: 'approved' });
            await AsyncStorage.setItem(APPROVED_KEY, JSON.stringify(approved));

            // Grant the On the App! badge — write provider ID to ap_on_app_provider_ids
            if (sub.providerId) {
              const onAppRaw = await AsyncStorage.getItem('ap_on_app_provider_ids');
              const onAppIds: string[] = onAppRaw ? JSON.parse(onAppRaw) : [];
              if (!onAppIds.includes(sub.providerId)) {
                onAppIds.push(sub.providerId);
                await AsyncStorage.setItem('ap_on_app_provider_ids', JSON.stringify(onAppIds));
              }
            }

            setSubmissions(updated);
            Alert.alert('Approved! 🏅', `${sub.providerName} has been approved and will appear in the directory with the On the App! badge.`);
          },
        },
      ]
    );
  };

  const handleDecline = async (sub: Submission) => {
    Alert.alert(
      'Decline Submission',
      `Decline "${sub.providerName}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            const raw = await AsyncStorage.getItem(PENDING_KEY);
            const all: Submission[] = raw ? JSON.parse(raw) : [];
            const updated = all.map((s) =>
              s.id === sub.id ? { ...s, status: 'declined' as const } : s
            );
            await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(updated));
            setSubmissions(updated);
          },
        },
      ]
    );
  };

  const filtered = submissions.filter((s) => s.status === filter);
  const pendingCount = submissions.filter((s) => s.status === 'pending_review').length;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Pending Submissions</Text>
          <Text style={styles.headerSub}>Admin — Provider Directory</Text>
        </View>
        {pendingCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{pendingCount}</Text>
          </View>
        )}
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {(['pending_review', 'approved', 'declined'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f === 'pending_review' ? `Pending (${submissions.filter(s => s.status === 'pending_review').length})` : f === 'approved' ? 'Approved' : 'Declined'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.purple} />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>{filter === 'pending_review' ? '✅' : filter === 'approved' ? '🏅' : '❌'}</Text>
          <Text style={styles.emptyTitle}>
            {filter === 'pending_review' ? 'No pending submissions' : filter === 'approved' ? 'No approved providers yet' : 'No declined submissions'}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {filtered.map((sub) => (
            <View key={sub.id} style={[styles.card, params.id === sub.id && styles.cardHighlighted]}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName}>{sub.providerName}</Text>
                  <Text style={styles.cardMeta}>{sub.providerType} · {sub.specialty} · {sub.state}</Text>
                </View>
                <View style={[styles.statusPill, sub.status === 'approved' ? styles.statusApproved : sub.status === 'declined' ? styles.statusDeclined : styles.statusPending]}>
                  <Text style={styles.statusText}>
                    {sub.status === 'pending_review' ? 'Pending' : sub.status === 'approved' ? 'Approved' : 'Declined'}
                  </Text>
                </View>
              </View>

              {sub.description ? <Text style={styles.cardDesc} numberOfLines={3}>{sub.description}</Text> : null}

              <View style={styles.cardDetails}>
                {sub.phone ? <Text style={styles.detailItem}>📞 {sub.phone}</Text> : null}
                {sub.website ? <Text style={styles.detailItem} numberOfLines={1}>🌐 {sub.website}</Text> : null}
                <Text style={styles.detailItem}>💳 Medicaid: {sub.medicaidAccepted ? 'Yes' : 'No'}</Text>
                <Text style={styles.detailItem}>👥 Accepting: {sub.acceptingPatients ? 'Yes' : 'No'}</Text>
              </View>

              <Text style={styles.submittedBy}>
                Submitted by {sub.submittedBy}{sub.submitterRelation ? ` (${sub.submitterRelation})` : ''} · {new Date(sub.submittedAt).toLocaleDateString()}
              </Text>

              {sub.status === 'pending_review' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(sub)} activeOpacity={0.8}>
                    <Text style={styles.approveBtnText}>✅ Approve + Add to Directory</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.declineBtn} onPress={() => handleDecline(sub)} activeOpacity={0.8}>
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: COLORS.purple, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  backBtn: { padding: SPACING.xs },
  headerText: { flex: 1 },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  badge: { backgroundColor: '#FF6B6B', borderRadius: 12, minWidth: 24, height: 24, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  badgeText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  filterRow: { flexDirection: 'row', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filterTab: { flex: 1, paddingVertical: SPACING.md, alignItems: 'center' },
  filterTabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.purple },
  filterTabText: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, fontWeight: '600' },
  filterTabTextActive: { color: COLORS.purple, fontWeight: '800' },
  scroll: { padding: SPACING.lg, gap: SPACING.md },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.sm, paddingTop: 80 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: FONT_SIZES.md, color: COLORS.textMid, fontWeight: '600' },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, gap: SPACING.sm, ...SHADOWS.sm },
  cardHighlighted: { borderWidth: 2, borderColor: COLORS.purple },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  cardName: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },
  cardMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginTop: 2 },
  statusPill: { borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 3 },
  statusPending: { backgroundColor: '#FFF8E1' },
  statusApproved: { backgroundColor: '#E3F7F1' },
  statusDeclined: { backgroundColor: '#FFE8E8' },
  statusText: { fontSize: 11, fontWeight: '700', color: COLORS.text },
  cardDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 17 },
  cardDetails: { gap: 3 },
  detailItem: { fontSize: FONT_SIZES.xs, color: COLORS.textMid },
  submittedBy: { fontSize: 11, color: COLORS.textLight, fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  approveBtn: { flex: 1, backgroundColor: COLORS.purple, borderRadius: RADIUS.pill, paddingVertical: SPACING.sm, alignItems: 'center' },
  approveBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#fff' },
  declineBtn: { backgroundColor: COLORS.bg, borderRadius: RADIUS.pill, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  declineBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textMid },
});
