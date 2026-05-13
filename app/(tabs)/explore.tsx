/**
 * Learning / Resource Library screen
 * Fetches live articles from the WordPress REST API at info.autismpathways.app
 * Replaces the default Expo starter "Explore" tab.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, ActivityIndicator, Image, Linking, RefreshControl,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
// ── WordPress API ────────────────────────────────────────────────────────────
const WP_API   = 'https://info.autismpathways.app/wp-json/wp/v2';
const PER_PAGE = 10;

// ── Category metadata ────────────────────────────────────────────────────────
type CatMeta = { icon: string; label: string; color: string; bg: string };
const CAT_META: Record<string, CatMeta> = {
  'diagnosis':      { icon: '🧠', label: 'Diagnosis',          color: '#2C5F8A', bg: '#DCEEFF' },
  'medicaid':       { icon: '💳', label: 'Medicaid',           color: '#5C3EA8', bg: '#E9E3FF' },
  'waivers':        { icon: '🛡️', label: 'Waivers',            color: '#0A7A5A', bg: '#E3F7F1' },
  'waivers-hcbs':   { icon: '🛡️', label: 'Waivers & HCBS',    color: '#0A7A5A', bg: '#E3F7F1' },
  'hcbs':           { icon: '🛡️', label: 'HCBS',              color: '#0A7A5A', bg: '#E3F7F1' },
  'school':         { icon: '🏫', label: 'School & IEP',       color: '#7A6020', bg: '#FFF6D8' },
  'school-iep':     { icon: '🏫', label: 'School & IEP',       color: '#7A6020', bg: '#FFF6D8' },
  'iep':            { icon: '🏫', label: 'School & IEP',       color: '#7A6020', bg: '#FFF6D8' },
  'disability':     { icon: '♿', label: 'Disability',         color: '#5C3EA8', bg: '#E9E3FF' },
  'provider':       { icon: '🩺', label: 'Provider & Therapy', color: '#2C5F8A', bg: '#DCEEFF' },
  'therapy':        { icon: '🩺', label: 'Therapy',            color: '#2C5F8A', bg: '#DCEEFF' },
  'family':         { icon: '❤️', label: 'Family Support',     color: '#8A2C4A', bg: '#FFE8DC' },
  'family-support': { icon: '❤️', label: 'Family Support',     color: '#8A2C4A', bg: '#FFE8DC' },
  'appeals':        { icon: '⚖️', label: 'Appeals',            color: '#C0392B', bg: '#FFF0EE' },
  'denials':        { icon: '⚖️', label: 'Appeals & Denials',  color: '#C0392B', bg: '#FFF0EE' },
  'uncategorized':  { icon: '📖', label: 'General',            color: '#5A5A72', bg: '#F5F5FA' },
};

const DEFAULT_CAT: CatMeta = { icon: '📖', label: 'General', color: '#5A5A72', bg: '#F5F5FA' };

// ── In-App Tools ─────────────────────────────────────────────────────────────
const IN_APP_TOOLS = [
  { icon: '📚', title: 'IEP Pathway',        sub: 'Rights, scripts, goal tracker', route: '/iep',           bg: '#EFF6FF', border: '#BFDBFE' },
  { icon: '💳', title: 'Medicaid Pathway',   sub: 'Step-by-step guide',            route: '/medicaid',      bg: '#F0EDFC', border: '#D4D0EF' },
  { icon: '🗺️', title: 'Waiver Explorer',    sub: 'Find agencies in your state',   route: '/waiver',        bg: '#E3F7F4', border: '#A0D8CC' },
  { icon: '💬', title: 'Provider Prep',      sub: 'Scripts for every visit',       route: '/provider-prep', bg: '#FFF0F5', border: '#F0B0C8' },
  { icon: '📋', title: 'Daily Observations', sub: 'Track patterns for IEP',        route: '/observations',  bg: '#FDF8EE', border: '#F0D080' },
  { icon: '🧠', title: 'Diagnosis Pathway',  sub: 'Find evaluators + prepare',     route: '/diagnosis',     bg: '#EDF5FF', border: '#B0D4F0' },
];

// ── Types ─────────────────────────────────────────────────────────────────────
type WPPost = {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  date: string;
  link: string;
  categories: number[];
  jetpack_featured_media_url?: string;
};

type WPCategory = {
  id: number;
  name: string;
  slug: string;
  count: number;
};

type ChipItem = { id: number | 'all'; label: string; icon: string };

// ── Helpers ───────────────────────────────────────────────────────────────────
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').trim();
}

function decodeHtml(html: string): string {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8220;/g, '\u201C')
    .replace(/&#8221;/g, '\u201D')
    .replace(/&#8211;/g, '\u2013')
    .replace(/&#8212;/g, '\u2014');
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return ''; }
}

function estimateReadTime(html: string): string {
  const text = stripHtml(html);
  const words = text.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
}

function getCatMeta(catIds: number[], catMap: Record<number, WPCategory>): CatMeta {
  if (!catIds?.length) return DEFAULT_CAT;
  const cat = catMap[catIds[0]];
  if (!cat) return DEFAULT_CAT;
  return CAT_META[cat.slug] || { ...DEFAULT_CAT, label: cat.name };
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LearningScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [posts, setPosts]                     = useState<WPPost[]>([]);
  const [catMap, setCatMap]                   = useState<Record<number, WPCategory>>({});
  const [chips, setChips]                     = useState<ChipItem[]>([{ id: 'all', label: 'All', icon: '✨' }]);
  const [activeCat, setActiveCat]             = useState<number | 'all'>('all');
  const [search, setSearch]                   = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [loading, setLoading]                 = useState(true);
  const [loadingMore, setLoadingMore]         = useState(false);
  const [refreshing, setRefreshing]           = useState(false);
  const [error, setError]                     = useState(false);
  const [currentPage, setCurrentPage]         = useState(1);
  const [totalPages, setTotalPages]           = useState(1);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearchDebounced(search), 350);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  // Load categories once
  useEffect(() => {
    fetch(`${WP_API}/categories?per_page=100&hide_empty=true`)
      .then(r => r.json())
      .then((data: WPCategory[]) => {
        if (!Array.isArray(data)) return;
        const map: Record<number, WPCategory> = {};
        const newChips: ChipItem[] = [{ id: 'all', label: 'All', icon: '✨' }];
        data.forEach(cat => {
          map[cat.id] = cat;
          const meta = CAT_META[cat.slug];
          if (meta) newChips.push({ id: cat.id, label: meta.label, icon: meta.icon });
        });
        setCatMap(map);
        setChips(newChips);
      })
      .catch(() => {});
  }, []);

  // Load posts whenever filter/search changes
  useEffect(() => {
    loadPosts(1, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCat, searchDebounced]);

  const buildUrl = (page: number) => {
    let url = `${WP_API}/posts?per_page=${PER_PAGE}&page=${page}&orderby=date&order=desc`;
    if (activeCat !== 'all') url += `&categories=${activeCat}`;
    if (searchDebounced) url += `&search=${encodeURIComponent(searchDebounced)}`;
    return url;
  };

  const loadPosts = async (page: number, reset: boolean) => {
    if (reset) { setLoading(true); setError(false); }
    else setLoadingMore(true);

    try {
      const res = await fetch(buildUrl(page));
      const tp = parseInt(res.headers.get('X-WP-TotalPages') || '1');
      const data: WPPost[] = await res.json();
      setTotalPages(tp);
      setCurrentPage(page);
      setPosts(prev => reset ? data : [...prev, ...data]);
      setError(false);
    } catch {
      if (reset) setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadPosts(1, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCat, searchDebounced]);

  const loadMore = () => {
    if (loadingMore || currentPage >= totalPages) return;
    loadPosts(currentPage + 1, false);
  };

  // ── Render helpers ──────────────────────────────────────────────────────────
  const FeaturedCard = ({ post }: { post: WPPost }) => {
    const title    = decodeHtml(post.title.rendered);
    const excerpt  = stripHtml(post.excerpt.rendered);
    const meta     = getCatMeta(post.categories, catMap);
    const readTime = estimateReadTime(post.content?.rendered || '');

    return (
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={() => Linking.openURL(post.link)}
        activeOpacity={0.85}
      >
        {post.jetpack_featured_media_url ? (
          <Image source={{ uri: post.jetpack_featured_media_url }} style={styles.featuredImg} />
        ) : (
          <View style={[styles.featuredImgPlaceholder, { backgroundColor: meta.bg }]}>
            <Text style={styles.featuredImgEmoji}>{meta.icon}</Text>
          </View>
        )}
        <View style={styles.featuredBody}>
          <View style={[styles.catBadge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.catBadgeText, { color: meta.color }]}>{meta.icon} {meta.label}</Text>
          </View>
          <Text style={styles.featuredTitle} numberOfLines={2}>{title}</Text>
          <Text style={styles.featuredExcerpt} numberOfLines={3}>{excerpt}</Text>
          <View style={styles.featuredMeta}>
            <Text style={styles.metaText}>{formatDate(post.date)}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{readTime}</Text>
            <Text style={styles.readMore}>Read →</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const PostCard = ({ post }: { post: WPPost }) => {
    const title    = decodeHtml(post.title.rendered);
    const meta     = getCatMeta(post.categories, catMap);
    const readTime = estimateReadTime(post.content?.rendered || '');

    return (
      <TouchableOpacity
        style={styles.postCard}
        onPress={() => Linking.openURL(post.link)}
        activeOpacity={0.8}
      >
        {post.jetpack_featured_media_url ? (
          <Image source={{ uri: post.jetpack_featured_media_url }} style={styles.postThumb} />
        ) : (
          <View style={[styles.postThumbPlaceholder, { backgroundColor: meta.bg }]}>
            <Text style={styles.postThumbEmoji}>{meta.icon}</Text>
          </View>
        )}
        <View style={styles.postBody}>
          <View style={[styles.catBadge, { backgroundColor: meta.bg }]}>
            <Text style={[styles.catBadgeText, { color: meta.color }]}>{meta.icon} {meta.label}</Text>
          </View>
          <Text style={styles.postTitle} numberOfLines={2}>{title}</Text>
          <View style={styles.postMeta}>
            <Text style={styles.metaText}>{formatDate(post.date)}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{readTime}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Group posts by category when on "All" tab with no search
  const renderGroupedPosts = (postsToRender: WPPost[]) => {
    const groups: Record<string, WPPost[]> = {};
    const order: string[] = [];
    postsToRender.forEach(post => {
      const catId = String(post.categories?.[0] ?? 'general');
      if (!groups[catId]) { groups[catId] = []; order.push(catId); }
      groups[catId].push(post);
    });
    return order.map(catId => {
      const cat = catMap[Number(catId)];
      const meta = cat ? (CAT_META[cat.slug] || DEFAULT_CAT) : DEFAULT_CAT;
      return (
        <View key={catId}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{meta.icon} {meta.label}</Text>
            <Text style={styles.sectionCount}>{groups[catId].length}</Text>
          </View>
          {groups[catId].map(post => <PostCard key={post.id} post={post} />)}
        </View>
      );
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Sticky header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>
          Autism <Text style={styles.headerTitlePink}>Pathways</Text>
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.purple} />
        }
        onScrollEndDrag={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 200) {
            loadMore();
          }
        }}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>📚 Resource Library</Text>
          <Text style={styles.heroTitle}>Continue Learning</Text>
          <Text style={styles.heroSub}>
            Guides, explainers, and real talk for families navigating the autism journey — written for parents, not professionals.
          </Text>
          {/* Search */}
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search articles..."
              placeholderTextColor={COLORS.textLight}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={styles.searchClear}>
                <Text style={styles.searchClearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
        >
          {chips.map(chip => (
            <TouchableOpacity
              key={String(chip.id)}
              style={[styles.chip, activeCat === chip.id && styles.chipActive]}
              onPress={() => setActiveCat(chip.id)}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipText, activeCat === chip.id && styles.chipTextActive]}>
                {chip.icon} {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* In-App Tools grid */}
        <View style={styles.toolsSection}>
          <Text style={styles.sectionLabelText}>🛠️ In-App Tools</Text>
          <View style={styles.toolsGrid}>
            {IN_APP_TOOLS.map(tool => (
              <TouchableOpacity
                key={tool.title}
                style={[styles.toolTile, { backgroundColor: tool.bg, borderColor: tool.border }]}
                onPress={() => router.push(tool.route as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.toolTileIcon}>{tool.icon}</Text>
                <Text style={styles.toolTileTitle}>{tool.title}</Text>
                <Text style={styles.toolTileSub}>{tool.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Articles section label */}
        <View style={styles.articlesSectionLabel}>
          <Text style={styles.sectionLabelText}>📰 Articles & Guides</Text>
        </View>

        {/* Loading state */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={COLORS.purple} size="large" />
            <Text style={styles.loadingText}>Loading articles…</Text>
          </View>
        )}

        {/* Error state */}
        {!loading && error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Could not load articles</Text>
            <Text style={styles.errorSub}>Check your connection and try again.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => loadPosts(1, true)}>
              <Text style={styles.retryBtnText}>Try again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty state */}
        {!loading && !error && posts.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>No articles found</Text>
            <Text style={styles.emptySub}>Try a different category or search term.</Text>
          </View>
        )}

        {/* Posts */}
        {!loading && !error && posts.length > 0 && (
          <View style={styles.postsContainer}>
            {/* Featured first post */}
            <FeaturedCard post={posts[0]} />

            {/* Remaining posts */}
            {posts.length > 1 && (
              activeCat === 'all' && !searchDebounced
                ? renderGroupedPosts(posts.slice(1))
                : (
                  <View>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>All Articles</Text>
                      <Text style={styles.sectionCount}>{posts.length} articles</Text>
                    </View>
                    {posts.slice(1).map(post => <PostCard key={post.id} post={post} />)}
                  </View>
                )
            )}

            {/* Load more */}
            {currentPage < totalPages && (
              <TouchableOpacity
                style={styles.loadMoreBtn}
                onPress={loadMore}
                disabled={loadingMore}
                activeOpacity={0.8}
              >
                {loadingMore
                  ? <ActivityIndicator color={COLORS.purple} size="small" />
                  : <Text style={styles.loadMoreText}>Load more articles →</Text>
                }
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: '#1a1f5e',
  },
  headerTitlePink: { color: '#c47ab8' },

  scrollView: { flex: 1 },
  scroll: {
    paddingBottom: 40 },

  // Hero
  hero: {
    backgroundColor: COLORS.lavender,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  heroEyebrow: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: COLORS.purple,
    marginBottom: SPACING.xs,
    opacity: 0.8,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  heroSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },

  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? SPACING.sm : 4,
  },
  searchIcon: { fontSize: 14, marginRight: SPACING.sm, opacity: 0.5 },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    paddingVertical: 0,
  },
  searchClear: { padding: SPACING.xs },
  searchClearText: { fontSize: 12, color: COLORS.textLight, fontWeight: '600' },

  // Chips
  chipsScroll: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chipsContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  chipActive: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
  },
  chipText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textMid,
  },
  chipTextActive: { color: COLORS.white },

  // In-App Tools
  toolsSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: 0,
  },
  sectionLabelText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.textLight,
    marginBottom: SPACING.md,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  toolTile: {
    width: '48%',
    borderWidth: 1.5,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
  },
  toolTileIcon: { fontSize: 20, marginBottom: SPACING.xs },
  toolTileTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: '#1a1f5e',
    marginBottom: 2,
  },
  toolTileSub: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMid,
    lineHeight: 16,
  },

  // Articles section label
  articlesSectionLabel: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },

  // Loading / error / empty
  loadingBox: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    gap: SPACING.md,
  },
  loadingText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  errorBox: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxxl,
  },
  errorIcon: { fontSize: 32, marginBottom: SPACING.md },
  errorTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  errorSub: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, textAlign: 'center', marginBottom: SPACING.lg },
  retryBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  retryBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.sm },
  emptyBox: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyIcon: { fontSize: 36, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  emptySub: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },

  // Posts
  postsContainer: { paddingHorizontal: SPACING.lg },

  // Featured card
  featuredCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  featuredImg: { width: '100%', height: 160 },
  featuredImgPlaceholder: {
    width: '100%',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredImgEmoji: { fontSize: 48 },
  featuredBody: { padding: SPACING.lg },
  featuredTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 23,
    marginBottom: SPACING.xs,
    marginTop: SPACING.xs,
  },
  featuredExcerpt: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },

  // Post card
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  postThumb: { width: 72, height: 72, borderRadius: RADIUS.xs },
  postThumbPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postThumbEmoji: { fontSize: 26 },
  postBody: { flex: 1 },
  postTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 19,
    marginBottom: SPACING.xs,
    marginTop: SPACING.xs,
  },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },

  // Shared
  catBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
    marginBottom: SPACING.xs,
  },
  catBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  metaText: { fontSize: 11, color: COLORS.textLight },
  metaDot: { fontSize: 11, color: COLORS.textLight },
  readMore: { fontSize: 12, fontWeight: '600', color: COLORS.purple, marginLeft: 'auto' },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  sectionTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  sectionCount: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },

  // Load more
  loadMoreBtn: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  loadMoreText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.purple },
});
