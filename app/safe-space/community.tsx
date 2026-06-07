/**
 * Community Feed
 *
 * Shows all publicly shared journal entries.
 * Users can heart posts, tap to read + comment, and report content.
 */
import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';
import { getValidToken as getToken } from '../../services/useAuth';

const API_BASE = 'https://inu3nb5lrfvftfyiwprftqshpy0zcegu.lambda-url.us-east-2.on.aws';

export interface ForumPost {
  id: string;
  title: string;
  body: string;
  authorDisplay: string;
  anonymous: boolean;
  createdAt: string;
  commentCount: number;
  heartCount: number;
}

function fmtDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = Math.floor(diffMs / 3600000);
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return ''; }
}

export default function CommunityFeedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hearted, setHearted] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');
  const toastTimer = useRef<any>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2400);
  };

  const loadPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/forum/posts`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => {
    loadPosts();
  }, [loadPosts]));

  const toggleHeart = async (post: ForumPost) => {
    const token = await getToken();
    if (!token) {
      Alert.alert('Sign in required', 'Please sign in to heart posts.');
      return;
    }
    // Optimistic update
    const alreadyHearted = hearted.has(post.id);
    const newHearted = new Set(hearted);
    if (alreadyHearted) newHearted.delete(post.id);
    else newHearted.add(post.id);
    setHearted(newHearted);
    setPosts(prev => prev.map(p =>
      p.id === post.id
        ? { ...p, heartCount: p.heartCount + (alreadyHearted ? -1 : 1) }
        : p
    ));
    try {
      await fetch(`${API_BASE}/api/forum/heart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: 'post', id: post.id }),
      });
    } catch {}
  };

  const reportPost = async (post: ForumPost) => {
    const token = await getToken();
    if (!token) {
      Alert.alert('Sign in required', 'Please sign in to report content.');
      return;
    }
    Alert.alert(
      'Report this post?',
      'Our team at contact@autismpathways.app will review it.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API_BASE}/api/forum/report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ type: 'post', id: post.id, reason: 'User reported' }),
              });
              showToast('Reported. Thank you for keeping our community safe. 💙');
            } catch {
              showToast('Could not submit report. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.dashText}>🏠 Home</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.rainbow} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
          <Text style={styles.loadingText}>Loading community posts…</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadPosts(true)} tintColor={COLORS.purple} />}
        >
          {/* Banner */}
          <View style={styles.banner}>
            <Text style={styles.bannerEmoji}>🌸</Text>
            <Text style={styles.bannerTitle}>You're not alone</Text>
            <Text style={styles.bannerSub}>
              Parents sharing their real experiences — the hard days, the wins, and everything in between.
            </Text>
            <View style={styles.safetyBadge}>
              <Text style={styles.safetyBadgeText}>🛡️ Moderated community</Text>
            </View>
          </View>

          {posts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🌱</Text>
              <Text style={styles.emptyTitle}>Be the first to share</Text>
              <Text style={styles.emptySub}>
                Open a journal entry and tap "Share with Community" to post it here.
              </Text>
            </View>
          ) : (
            <View style={styles.feed}>
              {posts.map(post => (
                <TouchableOpacity
                  key={post.id}
                  style={styles.postCard}
                  onPress={() => router.push({ pathname: '/safe-space/post-detail', params: { postId: post.id } })}
                  activeOpacity={0.85}
                >
                  <View style={styles.postHeader}>
                    <View style={styles.authorBadge}>
                      <Text style={styles.authorInitial}>
                        {post.anonymous ? '?' : post.authorDisplay.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.authorName}>{post.authorDisplay}</Text>
                      <Text style={styles.postDate}>{fmtDate(post.createdAt)}</Text>
                    </View>
                    <TouchableOpacity onPress={() => reportPost(post)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={styles.reportBtn}>⋯</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>
                  <Text style={styles.postPreview} numberOfLines={3}>{post.body}</Text>

                  <View style={styles.postFooter}>
                    <TouchableOpacity style={styles.heartBtn} onPress={() => toggleHeart(post)}>
                      <Text style={styles.heartIcon}>{hearted.has(post.id) ? '❤️' : '🤍'}</Text>
                      <Text style={styles.heartCount}>{post.heartCount}</Text>
                    </TouchableOpacity>
                    <View style={styles.commentCount}>
                      <Text style={styles.commentIcon}>💬</Text>
                      <Text style={styles.commentCountText}>{post.commentCount}</Text>
                    </View>
                    <Text style={styles.readMore}>Read more →</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: insets.bottom + SPACING.xl }} />
        </ScrollView>
      )}

      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  backBtn: { width: 60 },
  backText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  rainbow: { height: 3, backgroundColor: COLORS.purple, opacity: 0.3 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.sm },
  loadingText: { color: COLORS.textLight, fontSize: FONT_SIZES.sm },
  banner: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    backgroundColor: '#f9f5ff',
    marginBottom: SPACING.md,
  },
  bannerEmoji: { fontSize: 40, marginBottom: SPACING.sm },
  bannerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.xs },
  bannerSub: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, textAlign: 'center', lineHeight: 20, marginBottom: SPACING.sm },
  safetyBadge: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderWidth: 1, borderColor: '#e0d4f7' },
  safetyBadgeText: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xxl },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm, textAlign: 'center' },
  emptySub: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, textAlign: 'center', lineHeight: 20 },
  feed: { paddingHorizontal: SPACING.md, gap: SPACING.md },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: '#f0e8ff',
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  authorBadge: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.purple,
    justifyContent: 'center', alignItems: 'center',
  },
  authorInitial: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '700' },
  authorName: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  postDate: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  reportBtn: { fontSize: 20, color: COLORS.textLight, paddingHorizontal: SPACING.xs },
  postTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  postPreview: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 20, marginBottom: SPACING.sm },
  postFooter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: '#f5f0ff' },
  heartBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heartIcon: { fontSize: 16 },
  heartCount: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  commentCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  commentIcon: { fontSize: 16 },
  commentCountText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  readMore: { marginLeft: 'auto', fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  toast: {
    position: 'absolute', bottom: 32, left: SPACING.lg, right: SPACING.lg,
    backgroundColor: COLORS.text, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    alignItems: 'center',
  },
  toastText: { color: COLORS.white, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  dashText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
});
