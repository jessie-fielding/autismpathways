import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';
import type { DictionaryItem } from './index';

const HISTORY_KEY = 'ap_provider_translator_history';

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function ProviderDictionaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<DictionaryItem[]>([]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(HISTORY_KEY).then((val) => {
        setItems(val ? JSON.parse(val) : []);
      });
    }, [])
  );

  const handleDelete = (id: string) => {
    Alert.alert(
      'Remove entry?',
      'This will remove this translation from your dictionary.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updated = items.filter((i) => i.id !== id);
            setItems(updated);
            await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear all entries?',
      'This will permanently delete your entire Provider Dictionary.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setItems([]);
            await AsyncStorage.removeItem(HISTORY_KEY);
          },
        },
      ]
    );
  };

  const filtered = search.trim()
    ? items.filter(
        (item) =>
          item.input.toLowerCase().includes(search.toLowerCase()) ||
          item.output.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Dictionary</Text>
        {items.length > 0 ? (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearAllBtn}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search terms or translations..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {/* Count */}
      {items.length > 0 && (
        <Text style={styles.countLabel}>
          {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
          {search.trim() ? ` matching "${search}"` : ' saved'}
        </Text>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📖</Text>
            <Text style={styles.emptyTitle}>Your dictionary is empty</Text>
            <Text style={styles.emptySub}>
              Every translation you run gets saved here automatically — so you can look up terms again anytime.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.emptyBtnText}>Translate something →</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No matches</Text>
            <Text style={styles.emptySub}>Try a different search term.</Text>
          </View>
        ) : (
          filtered.map((item) => {
            const isExpanded = expanded === item.id;
            const isTranslate = item.mode === 'translate';
            const modeColor = isTranslate ? COLORS.blueAccent : COLORS.lavenderAccent;
            const modeLabel = isTranslate ? '🔤 Jargon Translation' : '🔍 Intent Decoded';

            return (
              <View key={item.id} style={[styles.card, { borderLeftColor: modeColor }]}>
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => setExpanded(isExpanded ? null : item.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeaderLeft}>
                    <Text style={[styles.cardMode, { color: modeColor }]}>{modeLabel}</Text>
                    <Text style={styles.cardDate}>{fmtDate(item.savedAt)}</Text>
                  </View>
                  <Text style={styles.cardArrow}>{isExpanded ? '↑' : '›'}</Text>
                </TouchableOpacity>

                <Text style={styles.cardInput} numberOfLines={isExpanded ? undefined : 2}>
                  "{item.input}{item.input.length >= 200 ? '...' : ''}"
                </Text>

                {isExpanded && (
                  <View style={styles.cardExpanded}>
                    <View style={styles.divider} />
                    <Text style={styles.cardOutputLabel}>TRANSLATION</Text>
                    <Text style={styles.cardOutput}>{item.output}</Text>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(item.id)}
                    >
                      <Text style={styles.deleteBtnText}>Remove from dictionary</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.sm,
  },
  backBtn: { paddingVertical: 6, paddingRight: 12, minWidth: 60 },
  backText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  clearAllBtn: { minWidth: 60, alignItems: 'flex-end' },
  clearAllText: { color: '#e74c3c', fontSize: FONT_SIZES.sm, fontWeight: '600' },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  searchIcon: { fontSize: 16, marginRight: SPACING.sm },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
  },

  countLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg },

  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  emptyBtn: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.pill,
  },
  emptyBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.sm },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  cardHeaderLeft: { flex: 1 },
  cardMode: { fontSize: FONT_SIZES.xs, fontWeight: '700', marginBottom: 2 },
  cardDate: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  cardArrow: { fontSize: 20, color: COLORS.textLight, marginLeft: SPACING.sm },
  cardInput: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    fontStyle: 'italic',
    lineHeight: 20,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },

  cardExpanded: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: SPACING.md },
  cardOutputLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  cardOutput: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  deleteBtn: { alignSelf: 'flex-start' },
  deleteBtnText: {
    fontSize: FONT_SIZES.xs,
    color: '#e74c3c',
    fontWeight: '600',
  },
});
