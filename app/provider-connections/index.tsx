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
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking, Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import { getDeviceId } from '../../services/api';
import {
  getReceivedRequests,
  respondToRequest,
  ConnectionRequest,
} from '../../services/connections';

type Tab = 'pending' | 'accepted' | 'declined';

const DENIAL_REASONS = [
  'Not currently accepting new clients',
  'Practice is full',
  'Not in network / insurance not accepted',
  'Outside our service area',
  'Age range not served',
  'Specialty does not match needs',
  'Waitlist is too long to be helpful',
  'Other',
] as const;
type DenialReason = typeof DENIAL_REASONS[number];

export default function ProviderConnections() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab]   = useState<Tab>('pending');
  const [requests, setRequests]     = useState<ConnectionRequest[]>([]);

  const [providerId, setProviderId] = useState<string | null>(null);
  const [denialModalReq, setDenialModalReq] = useState<ConnectionRequest | null>(null);
  const [selectedDenialReason, setSelectedDenialReason] = useState<DenialReason | null>(null);

  const load = useCallback(async () => {
    const pid = await getDeviceId();
    setProviderId(pid);
    const all = await getReceivedRequests(pid);
    setRequests(all);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = requests.filter((r) => r.status === activeTab);

  const handleDecline = (req: ConnectionRequest) => {
    setSelectedDenialReason(null);
    setDenialModalReq(req);
  };

  const confirmDecline = async () => {
    if (!denialModalReq) return;
    await respondToRequest(denialModalReq.id, 'declined', providerId ?? undefined, selectedDenialReason ?? undefined);
    setDenialModalReq(null);
    await load();
  };

  const handleRespond = (req: ConnectionRequest, status: 'accepted' | 'declined') => {
    if (status === 'declined') { handleDecline(req); return; }
    const verb = 'accept';
    Alert.alert(
      `Accept Request`,
      `Accept the introduction request from ${req.requesterName}? Their contact preference will be revealed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          style: 'default',
          onPress: async () => {
            await respondToRequest(req.id, status, providerId ?? undefined);
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

              {/* Insurance & Payment info */}
              {(req.insurance || req.hasMedicaid != null || req.okOutOfPocket != null) ? (
                <View style={[styles.messageBox, { backgroundColor: '#F0FDF4', borderLeftWidth: 3, borderLeftColor: '#22C55E' }]}>
                  <Text style={[styles.messageLabel, { color: '#166534' }]}>💳 Insurance & Payment</Text>
                  {req.insurance ? <Text style={styles.messageText}>Insurance: {req.insurance}</Text> : null}
                  {req.hasMedicaid === true ? <Text style={styles.messageText}>Medicaid: Yes ✓</Text> : req.hasMedicaid === false ? <Text style={styles.messageText}>Medicaid: No</Text> : null}
                  {req.okOutOfPocket === true ? <Text style={styles.messageText}>Open to private pay: Yes ✓</Text> : req.okOutOfPocket === false ? <Text style={styles.messageText}>Open to private pay: No</Text> : null}
                </View>
              ) : null}
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
                    <View style={{ flex: 1 }}>
                      {req.shareEmail && req.senderEmail ? (
                        <>
                          <Text style={styles.contactText}>📧 Email: <Text style={{ fontWeight: '700', color: COLORS.text }}>{req.senderEmail}</Text></Text>
                          <TouchableOpacity onPress={() => Linking.openURL(`mailto:${req.senderEmail}`)} style={{ marginTop: 4 }}>
                            <Text style={{ fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' }}>Tap to email →</Text>
                          </TouchableOpacity>
                        </>
                      ) : req.sharePhone && req.requesterPhone ? (
                        <>
                          <Text style={styles.contactText}>📞 Phone: <Text style={{ fontWeight: '700', color: COLORS.text }}>{req.requesterPhone}</Text></Text>
                          <TouchableOpacity onPress={() => Linking.openURL(`tel:${req.requesterPhone}`)} style={{ marginTop: 4 }}>
                            <Text style={{ fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' }}>Tap to call →</Text>
                          </TouchableOpacity>
                        </>
                      ) : req.shareEmail ? (
                        <Text style={styles.contactText}>Prefers email — contact info loading…</Text>
                      ) : req.sharePhone ? (
                        <Text style={styles.contactText}>Prefers phone — contact info loading…</Text>
                      ) : (
                        <Text style={styles.contactText}>They chose not to share contact info — they will reach out to you.</Text>
                      )}
                    </View>
                  </View>

                  {/* Forward to My Team button */}
                  <TouchableOpacity
                    style={styles.forwardBtn}
                    activeOpacity={0.8}
                    onPress={() => {
                      const contactLine = req.shareEmail && req.senderEmail
                        ? `Email: ${req.senderEmail}`
                        : req.sharePhone && req.requesterPhone
                        ? `Phone: ${req.requesterPhone}`
                        : req.shareEmail
                        ? `Contact preference: Email (address not yet loaded)`
                        : req.sharePhone
                        ? `Contact preference: Phone (number not yet loaded)`
                        : `Contact preference: Not shared`;
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

      {/* Denial Reason Modal */}
      <Modal
        visible={!!denialModalReq}
        transparent
        animationType="slide"
        onRequestClose={() => setDenialModalReq(null)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }}
          activeOpacity={1}
          onPress={() => setDenialModalReq(null)}
        />
        <View style={styles.denialSheet}>
          <View style={styles.denialHandle} />
          <Text style={styles.denialTitle}>Reason for Declining</Text>
          <Text style={styles.denialSub}>This helps families understand next steps. It will be shared with them.</Text>
          {DENIAL_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[styles.denialOption, selectedDenialReason === reason && styles.denialOptionActive]}
              onPress={() => setSelectedDenialReason(reason)}
              activeOpacity={0.8}
            >
              <View style={[styles.denialRadio, selectedDenialReason === reason && styles.denialRadioActive]}>
                {selectedDenialReason === reason && <View style={styles.denialRadioDot} />}
              </View>
              <Text style={[styles.denialOptionText, selectedDenialReason === reason && styles.denialOptionTextActive]}>{reason}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.denialConfirmBtn, !selectedDenialReason && { opacity: 0.4 }]}
            onPress={confirmDecline}
            disabled={!selectedDenialReason}
            activeOpacity={0.85}
          >
            <Text style={styles.denialConfirmText}>Decline Request</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.denialCancelBtn} onPress={() => setDenialModalReq(null)}>
            <Text style={styles.denialCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  // Denial modal
  denialSheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: SPACING.lg, paddingBottom: 40, paddingTop: SPACING.md },
  denialHandle: { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: SPACING.md },
  denialTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  denialSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginBottom: SPACING.md, lineHeight: 18 },
  denialOption: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  denialOptionActive: { borderColor: COLORS.purple, backgroundColor: COLORS.lavender },
  denialRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  denialRadioActive: { borderColor: COLORS.purple },
  denialRadioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.purple },
  denialOptionText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text },
  denialOptionTextActive: { color: COLORS.purple, fontWeight: '700' },
  denialConfirmBtn: { backgroundColor: '#EF4444', borderRadius: RADIUS.md, paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.md },
  denialConfirmText: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: '#fff' },
  denialCancelBtn: { paddingVertical: SPACING.sm, alignItems: 'center', marginTop: 4 },
  denialCancelText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, fontWeight: '600' },
});
