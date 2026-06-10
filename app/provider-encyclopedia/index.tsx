/**
 * Provider Advocate Encyclopedia
 *
 * Full resource database for providers — searchable glossary of terms,
 * waiver types, Medicaid categories, IEP rights, and advocacy frameworks.
 * This is a placeholder screen that will be expanded in a future build.
 */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';

const CATEGORIES = [
  { id: 'waivers',   label: 'Waivers & HCBS',   icon: '🛡️', count: 42 },
  { id: 'medicaid',  label: 'Medicaid',          icon: '💳', count: 38 },
  { id: 'iep',       label: 'IEP & School',      icon: '🏫', count: 55 },
  { id: 'therapy',   label: 'Therapy Types',     icon: '🩺', count: 29 },
  { id: 'legal',     label: 'Legal & Rights',    icon: '⚖️', count: 24 },
  { id: 'glossary',  label: 'Glossary',          icon: '📖', count: 120 },
];

const FEATURED = [
  { title: 'HCBS Waiver vs. State Plan Medicaid', category: 'Waivers & HCBS', preview: 'Understand the key differences between HCBS waivers and standard Medicaid state plan services...' },
  { title: 'FAPE: Free Appropriate Public Education', category: 'IEP & School', preview: 'Every child with a disability is entitled to a free appropriate public education under IDEA...' },
  { title: 'ABA Therapy: Evidence Base & Billing', category: 'Therapy Types', preview: 'Applied Behavior Analysis is the most widely covered autism therapy under Medicaid and private insurance...' },
  { title: 'Prior Authorization Appeals Process', category: 'Legal & Rights', preview: 'When a service is denied, providers have the right to appeal on behalf of patients...' },
];

export default function ProviderEncyclopedia() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Advocate Encyclopedia</Text>
          <Text style={styles.headerSub}>The complete provider resource database</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={COLORS.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search terms, topics, or categories…"
          placeholderTextColor={COLORS.textLight}
        />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Coming soon banner */}
        <View style={styles.comingSoonBanner}>
          <Text style={styles.comingSoonIcon}>🏛️</Text>
          <View style={styles.comingSoonText}>
            <Text style={styles.comingSoonTitle}>Full database coming soon</Text>
            <Text style={styles.comingSoonSub}>We're building a comprehensive encyclopedia of 300+ terms, waiver types, and advocacy frameworks. Browse categories below to see what's coming.</Text>
          </View>
        </View>

        {/* Category grid */}
        <Text style={styles.sectionLabel}>Browse by Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryCard} activeOpacity={0.8}>
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
              <Text style={styles.categoryCount}>{cat.count} entries</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured articles */}
        <Text style={styles.sectionLabel}>Featured Articles</Text>
        {FEATURED.map((item, i) => (
          <View key={i} style={styles.featuredCard}>
            <View style={styles.featuredCatTag}>
              <Text style={styles.featuredCatText}>{item.category}</Text>
            </View>
            <Text style={styles.featuredTitle}>{item.title}</Text>
            <Text style={styles.featuredPreview} numberOfLines={2}>{item.preview}</Text>
            <Text style={styles.featuredCta}>Coming soon →</Text>
          </View>
        ))}
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
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: SPACING.sm },
  searchIcon: { flexShrink: 0 },
  searchInput: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, paddingVertical: SPACING.xs },
  scroll: { padding: SPACING.lg, gap: SPACING.md },
  comingSoonBanner: { backgroundColor: '#F0EDFF', borderRadius: RADIUS.lg, padding: SPACING.lg, flexDirection: 'row', gap: SPACING.md, alignItems: 'flex-start', borderWidth: 1, borderColor: COLORS.lavenderAccent ?? '#C5B8F0' },
  comingSoonIcon: { fontSize: 36 },
  comingSoonText: { flex: 1, gap: 4 },
  comingSoonTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.purple },
  comingSoonSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18 },
  sectionLabel: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.text, marginTop: SPACING.xs },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  categoryCard: { width: '47%', backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', gap: 4, ...SHADOWS.sm, borderWidth: 1, borderColor: COLORS.border },
  categoryIcon: { fontSize: 28, marginBottom: 2 },
  categoryLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  categoryCount: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  featuredCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, gap: SPACING.sm, ...SHADOWS.sm },
  featuredCatTag: { backgroundColor: COLORS.lavender ?? '#E9E3FF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  featuredCatText: { fontSize: 11, color: COLORS.purple, fontWeight: '700' },
  featuredTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },
  featuredPreview: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, lineHeight: 17 },
  featuredCta: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '700' },
});
