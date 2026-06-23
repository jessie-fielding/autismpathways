/**
 * Post Detail — nested replies (MySpace-style)
 *
 * Shows a full post with:
 *  - Full post body
 *  - Top-level comments
 *  - Nested replies under each comment (2 levels)
 *  - Heart on comments
 *  - Report on comments
 *  - Anonymous or named posting
 */
import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';
import type { ForumPost } from './community';

import { lambdaFetch, getValidToken as getToken } from '../../services/useAuth';
const API_BASE = 'https://inu3nb5lrfvftfyiwprftqshpy0zcegu.lambda-url.us-east-2.on.aws';

interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  body: string;
  authorDisplay: string;
  anonymous: boolean;
  createdAt: string;
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

export default function PostDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { postId } = useLocalSearchParams<{ postId: string }>();

  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [heartedComments, setHeartedComments] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');
  const toastTimer = useRef<any>(null);
  const inputRef = useRef<TextInput>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2400);
  };

  const loadData = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const [postsRes, commentsRes] = await Promise.all([
        fetch(`${API_BASE}/api/forum/posts`),
        fetch(`${API_BASE}/api/forum/comments?postId=${postId}`),
      ]);
      if (postsRes.ok) {
        const data = await postsRes.json();
        const found = (data.posts || []).find((p: ForumPost) => p.id === postId);
        setPost(found || null);
      }
      if (commentsRes.ok) {
        const data = await commentsRes.json();
        setComments(data.comments || []);
      }
    } catch {}
    setLoading(false);
  }, [postId]);

  useFocusEffect(useCallback(() => {
    loadData();
  }, [loadData]));

  const submitComment = async () => {
    if (!commentText.trim()) return;
    const token = await getToken();
    if (!token) {
      Alert.alert('Sign in required', 'Please sign in to comment.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/forum/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          postId,
          body: commentText.trim(),
          parentId: replyTo?.id || null,
          anonymous,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments(prev => [...prev, data.comment]);
        setCommentText('');
        setReplyTo(null);
        showToast('Comment posted 💙');
      } else {
        const err = await res.json();
        showToast(err.error || 'Could not post comment.');
      }
    } catch {
      showToast('Network error. Please try again.');
    }
    setSubmitting(false);
  };

  const heartComment = async (comment: Comment) => {
    const token = await getToken();
    if (!token) return;
    const alreadyHearted = heartedComments.has(comment.id);
    const newHearted = new Set(heartedComments);
    if (alreadyHearted) newHearted.delete(comment.id);
    else newHearted.add(comment.id);
    setHeartedComments(newHearted);
    setComments(prev => prev.map(c =>
      c.id === comment.id
        ? { ...c, heartCount: c.heartCount + (alreadyHearted ? -1 : 1) }
        : c
    ));
    try {
      await fetch(`${API_BASE}/api/forum/heart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: 'comment', id: comment.id, postId }),
      });
    } catch {}
  };

  const reportComment = async (comment: Comment) => {
    const token = await getToken();
    if (!token) {
      Alert.alert('Sign in required', 'Please sign in to report content.');
      return;
    }
    Alert.alert(
      'Report this comment?',
      'Our team will review it.',
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
                body: JSON.stringify({ type: 'comment', id: comment.id, reason: 'User reported' }),
              });
              showToast('Reported. Thank you 💙');
            } catch {}
          },
        },
      ]
    );
  };

  const startReply = (comment: Comment) => {
    setReplyTo({ id: comment.id, author: comment.authorDisplay });
    inputRef.current?.focus();
  };

  // Build nested comment tree (2 levels)
  const topLevel = comments.filter(c => !c.parentId);
  const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId);

  const renderComment = (comment: Comment, isReply = false) => (
    <View key={comment.id} style={[styles.commentCard, isReply && styles.replyCard]}>
      <View style={styles.commentHeader}>
        <View style={[styles.authorBadge, isReply && styles.authorBadgeSmall]}>
          <Text style={[styles.authorInitial, isReply && styles.authorInitialSmall]}>
            {comment.anonymous ? '?' : comment.authorDisplay.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.commentAuthor}>{comment.authorDisplay}</Text>
          <Text style={styles.commentDate}>{fmtDate(comment.createdAt)}</Text>
        </View>
        <TouchableOpacity onPress={() => reportComment(comment)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.reportBtn}>⋯</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.commentBody}>{comment.body}</Text>

      <View style={styles.commentActions}>
        <TouchableOpacity style={styles.heartBtn} onPress={() => heartComment(comment)}>
          <Text style={styles.heartIcon}>{heartedComments.has(comment.id) ? '❤️' : '🤍'}</Text>
          <Text style={styles.heartCount}>{comment.heartCount}</Text>
        </TouchableOpacity>
        {!isReply && (
          <TouchableOpacity onPress={() => startReply(comment)} style={styles.replyBtn}>
            <Text style={styles.replyBtnText}>↩ Reply</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Nested replies */}
      {!isReply && getReplies(comment.id).map(reply => renderComment(reply, true))}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.dashText}>🏠 Home</Text>
        </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
        </View>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Post not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.bottom}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.rainbow} />

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Post */}
          <View style={styles.postSection}>
            <View style={styles.postHeader}>
              <View style={styles.authorBadge}>
                <Text style={styles.authorInitial}>
                  {post.anonymous ? '?' : post.authorDisplay.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.commentAuthor}>{post.authorDisplay}</Text>
                <Text style={styles.commentDate}>{fmtDate(post.createdAt)}</Text>
              </View>
            </View>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postBody}>{post.body}</Text>
          </View>

          <View style={styles.divider} />

          {/* Comments */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsSectionTitle}>
              {comments.length === 0 ? 'No comments yet' : `${comments.length} comment${comments.length !== 1 ? 's' : ''}`}
            </Text>
            {topLevel.map(c => renderComment(c))}
          </View>

          <View style={{ height: 120 + insets.bottom }} />
        </ScrollView>

        {/* Comment input */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + SPACING.sm }]}>
          {replyTo && (
            <View style={styles.replyingTo}>
              <Text style={styles.replyingToText}>↩ Replying to {replyTo.author}</Text>
              <TouchableOpacity onPress={() => setReplyTo(null)}>
                <Text style={styles.cancelReply}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder={replyTo ? `Reply to ${replyTo.author}…` : 'Add a comment…'}
              placeholderTextColor={COLORS.textLight}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!commentText.trim() || submitting) && styles.sendBtnDisabled]}
              onPress={submitComment}
              disabled={!commentText.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.sendBtnText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.anonToggle} onPress={() => setAnonymous(!anonymous)}>
            <Text style={styles.anonToggleText}>
              {anonymous ? '🙈 Posting anonymously' : '👤 Posting as you'}
            </Text>
          </TouchableOpacity>
        </View>

        {toast ? (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: COLORS.white,
  },
  backBtn: { width: 60 },
  backText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  rainbow: { height: 3, backgroundColor: COLORS.purple, opacity: 0.3 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: COLORS.textLight, fontSize: FONT_SIZES.md },
  postSection: { padding: SPACING.md },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  authorBadge: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.purple, justifyContent: 'center', alignItems: 'center',
  },
  authorBadgeSmall: { width: 28, height: 28, borderRadius: 14 },
  authorInitial: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '700' },
  authorInitialSmall: { fontSize: FONT_SIZES.sm },
  commentAuthor: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  commentDate: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  postTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  postBody: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 22 },
  divider: { height: 1, backgroundColor: '#f0e8ff', marginVertical: SPACING.sm },
  commentsSection: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  commentsSectionTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textLight, marginBottom: SPACING.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  commentCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    padding: SPACING.sm, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: '#f0e8ff',
    ...SHADOWS.sm,
  },
  replyCard: {
    marginLeft: SPACING.lg, marginTop: SPACING.xs,
    backgroundColor: '#faf7ff', borderColor: '#e8d8ff',
  },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  reportBtn: { fontSize: 18, color: COLORS.textLight, paddingHorizontal: SPACING.xs },
  commentBody: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20, marginBottom: SPACING.xs },
  commentActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingTop: SPACING.xs },
  heartBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heartIcon: { fontSize: 14 },
  heartCount: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  replyBtn: {},
  replyBtnText: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' },
  inputBar: {
    borderTopWidth: 1, borderTopColor: '#f0e8ff',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  replyingTo: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#f5f0ff', borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm, paddingVertical: 4,
    marginBottom: SPACING.xs,
  },
  replyingToText: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' },
  cancelReply: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.sm },
  input: {
    flex: 1, minHeight: 40, maxHeight: 100,
    borderWidth: 1, borderColor: '#e0d4f7',
    borderRadius: RADIUS.lg, paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs, fontSize: FONT_SIZES.sm,
    color: COLORS.text, backgroundColor: '#faf7ff',
  },
  sendBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    minWidth: 60, alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: COLORS.white, fontSize: FONT_SIZES.sm, fontWeight: '700' },
  anonToggle: { paddingTop: SPACING.xs },
  anonToggleText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  toast: {
    position: 'absolute', bottom: 100, left: SPACING.lg, right: SPACING.lg,
    backgroundColor: COLORS.text, borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, alignItems: 'center',
  },
  toastText: { color: COLORS.white, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  dashText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
});
