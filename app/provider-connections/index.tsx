/**
 * Provider Connections — Pending Queue
 *
 * Providers see all incoming connection requests here.
 * They can Accept or Decline each request.
 * Only after accepting does the parent's contact info become visible.
 *
 * Tabs: Pending | Accepted | Declined
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import {
  getReceivedRequests,
  respondToRequest,
  ConnectionRequest,
} from '../../services/connections';

type Tab = 'pending' | 'accepted' | 'declined';

export default function ProviderConnections() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab]   = useState<Tab>('pending');
  const [requests, setRequests]     = useState<ConnectionRequest[]>([]);

  const load = useCallback(async () => {
    const all = await getReceivedRequests();
    setRequests(all);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = requests.filter((r) => r.status === activeTab);

  const handleRespond = (req: ConnectionRequest, status: 'accepted' | 'declined') => {
    const verb = status === 'accepted' ? 'accept' : 'decline';
    Alert.alert(
      `${verb.charAt(0).toUpperCase() + verb.slice(1)} Request`,
      status === 'accepted'
        ? `Accept the introduction request from ${req.requesterName}? Their contact preference will be revealed.`
        : `Decline the request from ${req.requesterName}? They will be notified.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: status === 'accepted' ? 'Accept' : 'Decline',
          style: status === 'declined' ? 'destructive' : 'default',
          onPress: async () => {
            await respondToRequest(req.id, status);
            await load();

            if (status === 'accepted') {
              // Option C: notify both sides simultaneously
              // 1. Notify the owner/provider (in-app confirmation)
              const contactDetail = req.shareEmail
                ? `Email: ${req.requesterEmail || 'shared via app'}`
                : req.sharePhone
                ? `Phone: ${req.requesterPhone || 'shared via app'}`
                : 'They have chosen not to share contact info yet — reach out through the app.';

              // 2. Notify the family (via owner notification API)
              try {
                const profileRaw = await AsyncStorage.getItem('profile');
                const profile = profileRaw ? JSON.parse(profileRaw) : {};
                const API_BASE = 'https://inu3nb5lrfvftfyiwprftqshpq.supabase.co';
                await fetch(`${API_BASE}/api/notify/owner`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    subject: `🤝 Connection Accepted — ${req.requesterName}`,
                    body: [
                      `Great news! ${profile?.name || 'A provider'} has accepted ${req.requesterName}'s introduction request.`,
                      ``,
                      `Family contact preference: ${contactDetail}`,
                      `Their message: ${req.message || '(none)'}`,
                      ``,
                      `Next step: reach out to the family through their preferred contact method.`,
                    ].join('\n'),
                  }),
                });
              } catch { /* non-blocking */ }

              Alert.alert(
                '🤝 Connection Made!',
                `You've accepted ${req.requesterName}'s request.\n\n${req.shareEmail || req.sharePhone ? 'Their contact info is now visible in the Accepted tab.' : 'They\'ve chosen not to share contact info yet.'}\n\nExpect them to reach out, or use the \"Forward to My Team\" button to pass this along to your intake coordinator.`,
                [{ text: 'Got it', style: 'default' }]
              );
            }
          },
        },
      ]
    );
  };

  const formatTime = (iso: string) => {
    const d    = new Date(iso);
    const now  = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const TABS: { id: Tab; label: string; color: string }[] = [
    { id: 'pending',  label: 'Pending',  color: COLORS.purple },
    { id: 'accepted', label: 'Accepted', color: COLORS.teal },
    { id: 'declined', label: 'Declined', color: COLORS.textMid },
  ];

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Connection Requests</Text>
          {pendingCount > 0 && (
            <Text style={styles.headerSub}>{pendingCount} pending review</Text>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const count = requests.filter((r) => r.status === tab.id).length;
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, active && { borderBottomColor: tab.color, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab(tab.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabLabel, active && { color: tab.color }]}>{tab.label}</Text>
              {count > 0 && (
                <View style={[styles.tabBadge, { backgroundColor: active ? tab.color : COLORS.border }]}>
                  <Text style={[styles.tabBadgeText, active && { color: '#fff' }]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
              {activeTab === 'pending' ? '📬' : activeTab === 'accepted' ? '🤝' : '📭'}
            </Text>
            <Text style={styles.emptyTitle}>
              {activeTab === 'pending' ? 'No pending requests' : activeTab === 'accepted' ? 'No accepted connections yet' : 'No declined requests'}
            </Text>
            <Text style={styles.emptySub}>
              {activeTab === 'pending'
                ? 'When families request an introduction, they\'ll appear here for you to review.'
                : activeTab === 'accepted'
                ? 'Accepted connections will show the family\'s contact preference.'
                : 'Declined requests are kept here for your records.'}
            </Text>
          </View>
        ) : (
          filtered.map((req) => (
            <View key={req.id} style={styles.requestCard}>
              {/* Requester info */}
              <View style={styles.requesterRow}>
                <View style={styles.requesterAvatar}>
                  <Text style={styles.requesterAvatarText}>
                    {req.requesterName.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.requesterInfo}>
                  <Text style={styles.requesterName}>{req.requesterName}</Text>
                  <Text style={styles.requesterMeta}>Requested {formatTime(req.createdAt)}</Text>
                </View>
                {req.status === 'pending' && (
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>Pending</Text>
                  </View>
                )}
                {req.status === 'accepted' && (
                  <View style={styles.acceptedBadge}>
                    <Text style={styles.acceptedBadgeText}>✓ Accepted</Text>
                  </View>
                )}
              </View>

              {/* Message */}
              {req.message ? (
                <View style={styles.messageBox}>
                  <Text style={styles.messageLabel}>Their message:</Text>
                  <Text style={styles.messageText}>{req.message}</Text>
                </View>
              ) : null}

              {/* Contact preference (only shown after accept) */}
              {req.status === 'accepted' && (
                <>
                  <View style={styles.contactBox}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.teal} />
                    <Text style={styles.contactText}>
                      {req.shareEmail
                        ? 'Prefers to be contacted by email'
                        : req.sharePhone
                        ? 'Prefers to be contacted by phone'
                        : 'Waiting for you to reach out through the app'}
                    </Text>
                  </View>

                  {/* Forward to My Team button */}
                  <TouchableOpacity
                    style={styles.forwardBtn}
                    activeOpacity={0.8}
                    onPress={() => {
                      const contactLine = req.shareEmail
                        ? `Contact preference: Email`
                        : req.sharePhone
                        ? `Contact preference: Phone`
                        : `Contact preference: Not shared yet`;
                      const subject = encodeURIComponent(`New Patient Intro Request — ${req.requesterName}`);
                      const body = encodeURIComponent(
                        `Hi,\n\nA family has sent an introduction request through Autism Pathways.\n\nFamily name: ${req.requesterName}\n${contactLine}\nMessage: ${req.message || '(none)'}\nDate: ${new Date(req.createdAt).toLocaleDateString()}\n\nPlease follow up through your normal intake process.\n\nNote: This is a warm introduction request, not a clinical referral. No PHI was shared through the app.`
                      );
                      Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
                    }}
                  >
                    <Ionicons name="mail-outline" size={14} color={COLORS.purple} />
                    <Text style={styles.forwardBtnText}>📧 Forward to My Team</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Actions */}
              {req.status === 'pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => handleRespond(req, 'declined')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.declineBtnText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => handleRespond(req, 'accepted')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.acceptBtnText}>Accept →</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: COLORS.purple, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  backBtn: { padding: SPACING.xs },
  headerText: { flex: 1 },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  // Tabs
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: SPACING.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textMid },
  tabBadge: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 1, backgroundColor: COLORS.border },
  tabBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.textMid },
  // Scroll
  scroll: { padding: SPACING.lg, gap: SPACING.md },
  // Empty
  emptyState: { alignItems: 'center', paddingTop: 60, gap: SPACING.sm },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  emptySub: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, textAlign: 'center', lineHeight: 20, paddingHorizontal: SPACING.xl },
  // Request card
  requestCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, gap: SPACING.md, ...SHADOWS.sm },
  requesterRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  requesterAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.lavender ?? '#EDE9FF', alignItems: 'center', justifyContent: 'center' },
  requesterAvatarText: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.purple },
  requesterInfo: { flex: 1 },
  requesterName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  requesterMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  pendingBadge: { backgroundColor: '#FFF7E6', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: '#FDE68A' },
  pendingBadgeText: { fontSize: 11, color: '#92400E', fontWeight: '700' },
  acceptedBadge: { backgroundColor: '#E3F7F1', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: '#A7F3D0' },
  acceptedBadgeText: { fontSize: 11, color: '#065F46', fontWeight: '700' },
  messageBox: { backgroundColor: COLORS.bg, borderRadius: RADIUS.md, padding: SPACING.md, gap: 4 },
  messageLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMid },
  messageText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  contactBox: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center', backgroundColor: '#E3F7F1', borderRadius: RADIUS.md, padding: SPACING.sm },
  contactText: { fontSize: FONT_SIZES.sm, color: '#0A5A42', flex: 1 },
  forwardBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: COLORS.purple, borderRadius: RADIUS.md, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, alignSelf: 'flex-start', marginTop: 4 },
  forwardBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.purple },
  actionRow: { flexDirection: 'row', gap: SPACING.sm },
  declineBtn: { flex: 1, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, paddingVertical: SPACING.sm, alignItems: 'center' },
  declineBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textMid },
  acceptBtn: { flex: 2, borderRadius: RADIUS.md, backgroundColor: COLORS.purple, paddingVertical: SPACING.sm, alignItems: 'center', ...SHADOWS.sm },
  acceptBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: '#fff' },
});
