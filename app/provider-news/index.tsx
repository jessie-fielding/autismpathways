/**
 * Provider News Digest
 *
 * Digest-style news feed grouped by week (This Week / Last Week / Older).
 * Fetches from the WordPress REST API news category.
 * Subscribe to weekly digest CTA at the bottom.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Linking, RefreshControl, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';

const WP_API   = 'https://info.autismpathways.app/wp-json/wp/v2';
const PER_PAGE = 20;

type WPPost = {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  link: string;
};

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, ' ').trim();
}

function getWeekGroup(iso: string): 'this_week' | 'last_week' | 'older' {
  const now  = new Date();
  const date = new Date(iso);
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 7)  return 'this_week';
  if (diffDays < 14) return 'last_week';
  return 'older';
}

const GROUP_LABELS: Record<string, string> = {
  this_week: 'This Week',
  last_week: 'Last Week',
  older:     'Earlier',
};

const GROUP_COLORS: Record<string, string> = {
  this_week: COLORS.purple,
  last_week: COLORS.teal,
  older:     COLORS.textMid,
};

export default function ProviderNews() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();

  const [posts, setPosts]         = useState<WPPost[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [readIds, setReadIds]     = useState<Set<number>>(new Set());

  const fetchPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const url = `${WP_API}/posts?per_page=${PER_PAGE}&orderby=date&order=desc`;
      const res = await fetch(url);
      if (res.ok) {
        const data: WPPost[] = await res.json();
        setPosts(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Group posts by week
  const grouped: Record<string, WPPost[]> = {};
  for (const post of posts) {
    const group = getWeekGroup(post.date);
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(post);
  }

  const handleSubscribe = () => {
    Alert.alert(
      'Weekly Digest',
      'Subscribe to the weekly autism news digest and receive a curated summary every Monday morning.',
      [
        { text: 'Not now', style: 'cancel' },
        { text: 'Subscribe', onPress: () => Linking.openURL('https://info.autismpathways.app') },
      ]
    );
  };

  const markRead = (id: number) => {
    setReadIds((prev) => { const n = new Set(prev); n.add(id); return n; });
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>News Digest</Text>
          <Text style={styles.headerSub}>Autism · Policy · Research · Advocacy</Text>
        </View>
        <TouchableOpacity onPress={handleSubscribe} style={styles.subscribeBtn}>
          <Ionicons name="mail-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchPosts(true)} tintColor={COLORS.purple} />}
      >
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={COLORS.purple} />
            <Text style={styles.loaderText}>Loading digest…</Text>
          </View>
        ) : (
          <>
            {(['this_week', 'last_week', 'older'] as const).map((group) => {
              const items = grouped[group];
              if (!items || items.length === 0) return null;
              return (
                <View key={group} style={styles.groupSection}>
                  <View style={styles.groupHeader}>
                    <View style={[styles.groupDot, { backgroundColor: GROUP_COLORS[group] }]} />
                    <Text style={[styles.groupLabel, { color: GROUP_COLORS[group] }]}>{GROUP_LABELS[group]}</Text>
                    <Text style={styles.groupCount}>{items.length} articles</Text>
                  </View>
                  {items.map((post, i) => {
                    const isRead = readIds.has(post.id);
                    const excerpt = stripHtml(post.excerpt.rendered).slice(0, 100);
                    return (
                      <TouchableOpacity
                        key={post.id}
                        style={[styles.digestRow, i === items.length - 1 && styles.digestRowLast, isRead && styles.digestRowRead]}
                        onPress={() => { markRead(post.id); Linking.openURL(post.link); }}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.digestDot, isRead && styles.digestDotRead]} />
                        <View style={styles.digestBody}>
                          <Text style={[styles.digestTitle, isRead && styles.digestTitleRead]} numberOfLines={2}>
                            {stripHtml(post.title.rendered)}
                          </Text>
                          <Text style={styles.digestExcerpt} numberOfLines={2}>{excerpt}</Text>
                          <Text style={styles.digestDate}>
                            {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}

            {/* Subscribe CTA */}
            <TouchableOpacity style={styles.subscribeCta} onPress={handleSubscribe} activeOpacity={0.85}>
              <Ionicons name="mail" size={22} color={COLORS.purple} />
              <View style={styles.subscribeCtaText}>
                <Text style={styles.subscribeCtaTitle}>Subscribe to weekly digest</Text>
                <Text style={styles.subscribeCtaSub}>Get a curated summary every Monday morning</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.purple} />
            </TouchableOpacity>
          </>
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
  subscribeBtn: { padding: SPACING.xs },
  scroll: { padding: SPACING.lg, gap: SPACING.md },
  loader: { alignItems: 'center', paddingTop: 60, gap: SPACING.sm },
  loaderText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  // Groups
  groupSection: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.sm },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  groupDot: { width: 10, height: 10, borderRadius: 5 },
  groupLabel: { fontSize: FONT_SIZES.sm, fontWeight: '800', flex: 1 },
  groupCount: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  // Digest rows
  digestRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  digestRowLast: { borderBottomWidth: 0 },
  digestRowRead: { opacity: 0.6 },
  digestDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.purple, marginTop: 2, flexShrink: 0 },
  digestDotRead: { backgroundColor: COLORS.border },
  digestBody: { flex: 1, gap: 2 },
  digestTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, lineHeight: 18 },
  digestTitleRead: { fontWeight: '500', color: COLORS.textMid },
  digestExcerpt: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, lineHeight: 16 },
  digestDate: { fontSize: 10, color: COLORS.textLight, marginTop: 2 },
  // Subscribe CTA
  subscribeCta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1.5, borderColor: COLORS.purple + '44', ...SHADOWS.sm },
  subscribeCtaText: { flex: 1 },
  subscribeCtaTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  subscribeCtaSub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
});
