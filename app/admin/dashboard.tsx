/**
 * Admin Dashboard — accessible only to jessienrabe@gmail.com
 * Tabs: Provider Submissions | Hardship Apps | Forum Reports | Forum Posts | Registered Providers
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import { getValidToken } from '../../services/useAuth';

const LAMBDA = 'https://inu3nb5lrfvftfyiwprftqshpy0zcegu.lambda-url.us-east-2.on.aws';

type Tab = 'submissions' | 'hardship' | 'reports' | 'posts' | 'providers';

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'submissions', label: 'Submissions', emoji: '🏅' },
  { id: 'hardship',    label: 'Hardship',    emoji: '💜' },
  { id: 'reports',     label: 'Reports',     emoji: '🚩' },
  { id: 'posts',       label: 'Posts',       emoji: '💬' },
  { id: 'providers',   label: 'Providers',   emoji: '🏥' },
];

async function adminFetch(path: string, options: RequestInit = {}) {
  const token = await getValidToken();
  const res = await fetch(`${LAMBDA}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('submissions');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Data state
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [hardship, setHardship] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);

  const fetchAll = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [subRes, hrdRes, rptRes, pstRes, prvRes] = await Promise.allSettled([
        adminFetch('/api/admin/submissions'),
        adminFetch('/api/admin/hardship'),
        adminFetch('/api/admin/forum-reports'),
        adminFetch('/api/admin/forum-posts'),
        adminFetch('/api/admin/providers'),
      ]);
      if (subRes.status === 'fulfilled') setSubmissions(subRes.value.submissions || []);
      if (hrdRes.status === 'fulfilled') setHardship(hrdRes.value.applications || []);
      if (rptRes.status === 'fulfilled') setReports(rptRes.value.reports || []);
      if (pstRes.status === 'fulfilled') setPosts(pstRes.value.posts || []);
      if (prvRes.status === 'fulfilled') setProviders(prvRes.value.providers || []);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load admin data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchAll(); }, [fetchAll]));

  const registerAdmin = useCallback(async () => {
    try {
      const token = await getValidToken();
      const res = await fetch(`${LAMBDA}/api/admin/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Admin Registered ✅', 'Your account is now registered as admin. The dashboard will work on any login method going forward.');
        fetchAll();
      } else {
        Alert.alert('Error', data.error || 'Failed to register admin.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Network error.');
    }
  }, [fetchAll]);

  const handleApproveSubmission = async (sub: any) => {
    Alert.alert('Approve Submission', `Add "${sub.providerName}" to the directory?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: async () => {
          try {
            await adminFetch(`/api/admin/submissions/${sub.id}`, {
              method: 'PUT',
              body: JSON.stringify({ status: 'approved' }),
            });
            setSubmissions(prev => prev.map(s => s.id === sub.id ? { ...s, status: 'approved' } : s));
          } catch (e: any) { Alert.alert('Error', e.message); }
        },
      },
    ]);
  };

  const handleDeclineSubmission = async (sub: any) => {
    Alert.alert('Decline Submission', `Decline "${sub.providerName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminFetch(`/api/admin/submissions/${sub.id}`, {
              method: 'PUT',
              body: JSON.stringify({ status: 'declined' }),
            });
            setSubmissions(prev => prev.map(s => s.id === sub.id ? { ...s, status: 'declined' } : s));
          } catch (e: any) { Alert.alert('Error', e.message); }
        },
      },
    ]);
  };

  const handleApproveHardship = async (app: any) => {
    Alert.prompt
      ? Alert.prompt('Approve Hardship', `Enter promo code for ${app.email}:`, [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Approve',
            onPress: async (promoCode) => {
              try {
                await adminFetch(`/api/admin/hardship/${app.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({ status: 'approved', promoCode: promoCode || '' }),
                });
                setHardship(prev => prev.map(a => a.id === app.id ? { ...a, status: 'approved', promoCode } : a));
              } catch (e: any) { Alert.alert('Error', e.message); }
            },
          },
        ])
      : Alert.alert('Approve Hardship', `Approve application for ${app.email}?`, [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Approve',
            onPress: async () => {
              try {
                await adminFetch(`/api/admin/hardship/${app.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({ status: 'approved' }),
                });
                setHardship(prev => prev.map(a => a.id === app.id ? { ...a, status: 'approved' } : a));
              } catch (e: any) { Alert.alert('Error', e.message); }
            },
          },
        ]);
  };

  const handleDeclineHardship = async (app: any) => {
    Alert.alert('Decline Application', `Decline hardship application for ${app.email}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminFetch(`/api/admin/hardship/${app.id}`, {
              method: 'PUT',
              body: JSON.stringify({ status: 'declined' }),
            });
            setHardship(prev => prev.map(a => a.id === app.id ? { ...a, status: 'declined' } : a));
          } catch (e: any) { Alert.alert('Error', e.message); }
        },
      },
    ]);
  };

  const handleDeletePost = async (post: any) => {
    Alert.alert('Delete Post', `Delete this post by ${post.authorName || 'unknown'}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminFetch(`/api/admin/forum-posts/${post.id}`, { method: 'DELETE' });
            setPosts(prev => prev.filter(p => p.id !== post.id));
          } catch (e: any) { Alert.alert('Error', e.message); }
        },
      },
    ]);
  };

  const statusColor = (status: string) => {
    if (status === 'approved') return COLORS.successBg;
    if (status === 'declined') return COLORS.errorBg;
    return COLORS.warningBg;
  };
  const statusTextColor = (status: string) => {
    if (status === 'approved') return COLORS.successText;
    if (status === 'declined') return COLORS.errorText;
    return COLORS.warningText;
  };
  const statusLabel = (status: string) => {
    if (status === 'approved') return 'Approved';
    if (status === 'declined') return 'Declined';
    if (status === 'pending_review') return 'Pending';
    return status || 'Pending';
  };

  const pendingCount = (arr: any[]) => arr.filter(i => !i.status || i.status === 'pending_review' || i.status === 'pending').length;

  const renderSubmissions = () => (
    <ScrollView
      contentContainerStyle={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchAll(true)} tintColor={COLORS.purple} />}
    >
      <Text style={styles.tabTitle}>Provider Submissions</Text>
      <Text style={styles.tabSub}>{submissions.length} total · {pendingCount(submissions)} pending review</Text>
      {submissions.length === 0 && <Text style={styles.empty}>No submissions yet.</Text>}
      {submissions.map(sub => (
        <View key={sub.id} style={[styles.card, sub.status === 'pending_review' && styles.cardHighlight]}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{sub.providerName}</Text>
              <Text style={styles.cardMeta}>{sub.specialty} · {sub.state}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: statusColor(sub.status || 'pending_review') }]}>
              <Text style={[styles.statusText, { color: statusTextColor(sub.status || 'pending_review') }]}>
                {statusLabel(sub.status || 'pending_review')}
              </Text>
            </View>
          </View>
          {sub.description ? <Text style={styles.cardDesc} numberOfLines={2}>{sub.description}</Text> : null}
          <Text style={styles.cardDetail}>📞 {sub.phone || '—'} · 🌐 {sub.website || '—'}</Text>
          <Text style={styles.cardDetail}>💳 Medicaid: {sub.medicaidAccepted ? 'Yes' : 'No'} · 👥 Accepting: {sub.acceptingPatients ? 'Yes' : 'No'}</Text>
          <Text style={styles.cardMeta}>Submitted by {sub.submittedBy || 'Anonymous'} · {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : '—'}</Text>
          {(!sub.status || sub.status === 'pending_review') && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.approveBtn} onPress={() => handleApproveSubmission(sub)}>
                <Text style={styles.approveBtnText}>✅ Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.declineBtn} onPress={() => handleDeclineSubmission(sub)}>
                <Text style={styles.declineBtnText}>Decline</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderHardship = () => (
    <ScrollView
      contentContainerStyle={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchAll(true)} tintColor={COLORS.purple} />}
    >
      <Text style={styles.tabTitle}>Hardship Applications</Text>
      <Text style={styles.tabSub}>{hardship.length} total · {pendingCount(hardship)} pending</Text>
      {hardship.length === 0 && <Text style={styles.empty}>No applications yet.</Text>}
      {hardship.map(app => (
        <View key={app.id} style={[styles.card, (!app.status || app.status === 'pending') && styles.cardHighlight]}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{app.email}</Text>
              <Text style={styles.cardMeta}>{app.incomeLabel || app.income} · {app.state}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: statusColor(app.status || 'pending') }]}>
              <Text style={[styles.statusText, { color: statusTextColor(app.status || 'pending') }]}>
                {statusLabel(app.status || 'pending')}
              </Text>
            </View>
          </View>
          <Text style={styles.cardDetail}>Waiver: {app.waiverStatus || '—'}</Text>
          {app.explanation ? <Text style={styles.cardDesc} numberOfLines={3}>{app.explanation}</Text> : null}
          {app.promoCode ? <Text style={[styles.cardDetail, { color: COLORS.successText, fontWeight: '700' }]}>Promo: {app.promoCode}</Text> : null}
          <Text style={styles.cardMeta}>{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '—'}</Text>
          <TouchableOpacity onPress={() => Linking.openURL(`mailto:${app.email}?subject=Your Autism Pathways Hardship Application`)}>
            <Text style={[styles.cardDetail, { color: COLORS.purple, textDecorationLine: 'underline' }]}>✉️ Email {app.email}</Text>
          </TouchableOpacity>
          {(!app.status || app.status === 'pending') && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.approveBtn} onPress={() => handleApproveHardship(app)}>
                <Text style={styles.approveBtnText}>✅ Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.declineBtn} onPress={() => handleDeclineHardship(app)}>
                <Text style={styles.declineBtnText}>Decline</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderReports = () => (
    <ScrollView
      contentContainerStyle={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchAll(true)} tintColor={COLORS.purple} />}
    >
      <Text style={styles.tabTitle}>Forum Reports</Text>
      <Text style={styles.tabSub}>{reports.length} total</Text>
      {reports.length === 0 && <Text style={styles.empty}>No reports yet. 🎉</Text>}
      {reports.map(rpt => (
        <View key={rpt.id} style={styles.card}>
          <Text style={styles.cardName}>{rpt.type === 'post' ? '📝 Post' : '💬 Comment'} reported</Text>
          <Text style={styles.cardDetail}>ID: {rpt.contentId}</Text>
          <Text style={styles.cardDesc}>{rpt.reason}</Text>
          <Text style={styles.cardMeta}>By {rpt.reportedBy} · {rpt.reportedAt ? new Date(rpt.reportedAt).toLocaleDateString() : '—'}</Text>
          <TouchableOpacity
            style={[styles.approveBtn, { backgroundColor: COLORS.errorBg, marginTop: SPACING.sm }]}
            onPress={() => {
              const post = posts.find(p => p.id === rpt.contentId);
              if (post) handleDeletePost(post);
              else Alert.alert('Post not found', 'The reported post may have already been deleted.');
            }}
          >
            <Text style={[styles.approveBtnText, { color: COLORS.errorText }]}>🗑️ Delete Reported Post</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderPosts = () => (
    <ScrollView
      contentContainerStyle={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchAll(true)} tintColor={COLORS.purple} />}
    >
      <Text style={styles.tabTitle}>Forum Posts</Text>
      <Text style={styles.tabSub}>{posts.length} total</Text>
      {posts.length === 0 && <Text style={styles.empty}>No posts yet.</Text>}
      {posts.map(post => (
        <View key={post.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName} numberOfLines={2}>{post.content || post.text || '(no content)'}</Text>
              <Text style={styles.cardMeta}>by {post.authorName || post.author || 'Anonymous'} · {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '—'}</Text>
            </View>
          </View>
          {post.hearts !== undefined && <Text style={styles.cardDetail}>❤️ {post.hearts} · 💬 {post.commentCount || 0}</Text>}
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeletePost(post)}>
            <Text style={styles.deleteBtnText}>🗑️ Delete Post</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderProviders = () => (
    <ScrollView
      contentContainerStyle={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchAll(true)} tintColor={COLORS.purple} />}
    >
      <Text style={styles.tabTitle}>Registered Providers</Text>
      <Text style={styles.tabSub}>{providers.length} self-registered on the app</Text>
      {providers.length === 0 && <Text style={styles.empty}>No self-registered providers yet.</Text>}
      {providers.map((prov, idx) => (
        <View key={prov.id || idx} style={styles.card}>
          <Text style={styles.cardName}>{prov.providerName || prov.provider_name || '—'}</Text>
          <Text style={styles.cardMeta}>{prov.specialty} · {prov.state || prov.city || '—'}</Text>
          {prov.bio ? <Text style={styles.cardDesc} numberOfLines={2}>{prov.bio}</Text> : null}
          <Text style={styles.cardDetail}>
            💳 Medicaid: {prov.medicaidAccepted ? 'Yes' : 'No'} · 📡 Telehealth: {prov.telehealth ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.cardDetail}>
            👥 Accepting: {prov.acceptingNew ? 'Yes' : 'No'} · 🕐 Last seen: {prov.lastSeenAt ? new Date(prov.lastSeenAt).toLocaleDateString() : '—'}
          </Text>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={() => Alert.alert('Register as Admin', 'Tap OK to register your current Cognito account as admin. Do this once after signing in via Apple.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Register', onPress: registerAdmin },
            ])}
            style={[styles.refreshBtn, { backgroundColor: COLORS.purpleLight, paddingHorizontal: 8 }]}
          >
            <Text style={[styles.refreshText, { fontSize: 12 }]}>🔑</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => fetchAll()} style={styles.refreshBtn}>
            <Text style={styles.refreshText}>↻</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={styles.tabBarContent}>
        {TABS.map(t => {
          const count = t.id === 'submissions' ? pendingCount(submissions)
            : t.id === 'hardship' ? pendingCount(hardship)
            : t.id === 'reports' ? reports.length
            : 0;
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.tabBtn, tab === t.id && styles.tabBtnActive]}
              onPress={() => setTab(t.id)}
            >
              <Text style={[styles.tabBtnText, tab === t.id && styles.tabBtnTextActive]}>
                {t.emoji} {t.label}
              </Text>
              {count > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={COLORS.purple} size="large" />
          <Text style={styles.loadingText}>Loading admin data...</Text>
        </View>
      ) : (
        <>
          {tab === 'submissions' && renderSubmissions()}
          {tab === 'hardship'    && renderHardship()}
          {tab === 'reports'     && renderReports()}
          {tab === 'posts'       && renderPosts()}
          {tab === 'providers'   && renderProviders()}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: COLORS.purple,
  },
  backBtn: {},
  backText: { fontSize: FONT_SIZES.sm, color: '#fff', fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: '#fff' },
  refreshBtn: { padding: SPACING.xs },
  refreshText: { fontSize: 20, color: '#fff' },
  tabBar: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border, maxHeight: 52 },
  tabBarContent: { paddingHorizontal: SPACING.sm, gap: SPACING.xs, alignItems: 'center', paddingVertical: SPACING.sm },
  tabBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill, backgroundColor: COLORS.bg,
  },
  tabBtnActive: { backgroundColor: COLORS.purple },
  tabBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMid },
  tabBtnTextActive: { color: '#fff' },
  badge: { backgroundColor: '#FF6B6B', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.sm },
  loadingText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid },
  tabContent: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: 60 },
  tabTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },
  tabSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginTop: -SPACING.xs },
  empty: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, textAlign: 'center', paddingTop: 40 },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, gap: SPACING.xs, ...SHADOWS.sm },
  cardHighlight: { borderWidth: 2, borderColor: COLORS.purple },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  cardName: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },
  cardMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  cardDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 17 },
  cardDetail: { fontSize: FONT_SIZES.xs, color: COLORS.textMid },
  statusPill: { borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 3, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  approveBtn: { flex: 1, backgroundColor: COLORS.purple, borderRadius: RADIUS.pill, paddingVertical: SPACING.sm, alignItems: 'center' },
  approveBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#fff' },
  declineBtn: { backgroundColor: COLORS.bg, borderRadius: RADIUS.pill, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  declineBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textMid },
  deleteBtn: { backgroundColor: COLORS.errorBg, borderRadius: RADIUS.pill, paddingVertical: SPACING.sm, alignItems: 'center', marginTop: SPACING.xs },
  deleteBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.errorText },
});
