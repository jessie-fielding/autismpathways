/**
 * My Contacts Screen
 *
 * Freemium model:
 *  - Free: first 2 contacts
 *  - Premium: unlimited contacts
 *
 * Features:
 *  - Add / edit / delete contacts via bottom-sheet modal
 *  - 5 categories: Medical, Insurance, School, Legal, Other
 *  - Category filter chips + search
 *  - Pre-loaded resource contacts (maintained by AP team)
 *  - Tap phone → calls, tap email → opens mail app
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, Alert, Linking, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';

// ── Constants ─────────────────────────────────────────────────────────────────
const STORE_KEY   = 'ap_contacts';
const FREE_LIMIT  = 2;

const CATEGORIES = [
  { key: 'medical',   label: '🩺 Medical',   color: '#4BBFAD', gradient: ['#4BBFAD', '#2a9d8f'] },
  { key: 'insurance', label: '📋 Insurance', color: '#7C5CBF', gradient: ['#7C5CBF', '#9B7FD4'] },
  { key: 'school',    label: '🏫 School',    color: '#F5A623', gradient: ['#F5A623', '#e8940f'] },
  { key: 'legal',     label: '⚖️ Legal',     color: '#E74C3C', gradient: ['#E74C3C', '#c0392b'] },
  { key: 'other',     label: '📌 Other',     color: '#9090A8', gradient: ['#9090A8', '#6B6B80'] },
];

// ── Pre-loaded resources (AP team maintained) ─────────────────────────────────
const PRELOADED_CONTACTS = [
  { id: 'pre_1', name: 'Autism Society of America', org: 'National Advocacy', phone: '1-800-328-8476', email: 'info@autism-society.org', category: 'other', notes: 'National helpline and local chapter referrals.' },
  { id: 'pre_2', name: 'PACER Center', org: 'Parent Training & Info', phone: '952-838-9000', email: 'pacer@pacer.org', category: 'school', notes: 'Free IEP advocacy support for families.' },
  { id: 'pre_3', name: 'Autism Speaks Helpline', org: 'Autism Speaks', phone: '1-888-288-4762', email: 'familyservices@autismspeaks.org', category: 'other', notes: 'Resource navigator for newly diagnosed families.' },
  { id: 'pre_4', name: 'State Medicaid Office', org: 'Medicaid / CHIP', phone: '1-877-267-2323', email: '', category: 'insurance', notes: 'Federal Medicaid helpline — can direct to your state office.' },
  { id: 'pre_5', name: 'Wrightslaw', org: 'Special Education Law', phone: '', email: 'info@wrightslaw.com', category: 'legal', notes: 'Free legal information for parents navigating special education.' },
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface Contact {
  id: string;
  name: string;
  org: string;
  phone: string;
  email: string;
  category: string;
  notes: string;
  createdAt: string;
}

const EMPTY_FORM: Omit<Contact, 'id' | 'createdAt'> = {
  name: '', org: '', phone: '', email: '', category: '', notes: '',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name[0].toUpperCase();
}

function getCategoryColor(cat: string): string {
  return CATEGORIES.find(c => c.key === cat)?.color ?? '#9090A8';
}

function getCategoryLabel(cat: string): string {
  return CATEGORIES.find(c => c.key === cat)?.label ?? cat;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ContactsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();

  const [contacts, setContacts]       = useState<Contact[]>([]);
  const [filter, setFilter]           = useState('all');
  const [search, setSearch]           = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId]           = useState<string | null>(null);
  const [form, setForm]               = useState({ ...EMPTY_FORM });
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [toast, setToast]             = useState('');
  const toastTimer = React.useRef<any>(null);

  useFocusEffect(useCallback(() => {
    loadContacts();
  }, []));

  const loadContacts = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORE_KEY);
      if (raw) setContacts(JSON.parse(raw));
    } catch {}
  };

  const saveContacts = async (updated: Contact[]) => {
    try {
      await AsyncStorage.setItem(STORE_KEY, JSON.stringify(updated));
      setContacts(updated);
    } catch {
      showToast('Could not save — please try again.');
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2400);
  };

  // ── Modal ──────────────────────────────────────────────────────────────────
  const openModal = (contact?: Contact) => {
    if (!isPremium && !contact && contacts.length >= FREE_LIMIT) {
      // Freemium gate
      router.push('/paywall');
      return;
    }
    if (contact) {
      setEditId(contact.id);
      setForm({ name: contact.name, org: contact.org, phone: contact.phone, email: contact.email, category: contact.category, notes: contact.notes });
    } else {
      setEditId(null);
      setForm({ ...EMPTY_FORM });
    }
    setErrors({});
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim())     errs.name     = 'Name is required';
    if (!form.category.trim()) errs.category = 'Category is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    const now = new Date().toISOString();
    let updated: Contact[];

    if (editId) {
      updated = contacts.map(c =>
        c.id === editId
          ? { ...c, ...form, name: form.name.trim() }
          : c
      );
    } else {
      const newContact: Contact = {
        id: `c_${Date.now()}`,
        ...form,
        name: form.name.trim(),
        createdAt: now,
      };
      updated = [...contacts, newContact];
    }

    await saveContacts(updated);
    closeModal();
    showToast(editId ? 'Contact updated.' : 'Contact saved.');
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Remove Contact',
      'Are you sure you want to remove this contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updated = contacts.filter(c => c.id !== id);
            await saveContacts(updated);
            setExpandedId(null);
            showToast('Contact removed.');
          },
        },
      ]
    );
  };

  const savePreloaded = async (pre: typeof PRELOADED_CONTACTS[0]) => {
    if (!isPremium && contacts.length >= FREE_LIMIT) {
      router.push('/paywall');
      return;
    }
    const already = contacts.some(c => c.name === pre.name && c.org === pre.org);
    if (already) { showToast('Already in your contacts.'); return; }
    const newContact: Contact = {
      id: `c_${Date.now()}`,
      name: pre.name, org: pre.org, phone: pre.phone,
      email: pre.email, category: pre.category, notes: pre.notes,
      createdAt: new Date().toISOString(),
    };
    const updated = [...contacts, newContact];
    await saveContacts(updated);
    showToast('Saved to your contacts.');
  };

  // ── Filtered contacts ──────────────────────────────────────────────────────
  const filtered = contacts.filter(c => {
    const matchCat    = filter === 'all' || c.category === filter;
    const q           = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.org.toLowerCase().includes(q) || c.phone.includes(q);
    return matchCat && matchSearch;
  });

  const filteredPreloaded = PRELOADED_CONTACTS.filter(c => {
    const matchCat    = filter === 'all' || c.category === filter;
    const q           = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.org.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  // ── Render contact card ────────────────────────────────────────────────────
  const renderCard = (c: Contact | typeof PRELOADED_CONTACTS[0], isPreloaded = false) => {
    const color    = getCategoryColor(c.category);
    const initials = getInitials(c.name);
    const expanded = expandedId === c.id;
    const alreadySaved = isPreloaded && contacts.some(x => x.name === c.name && x.org === (c as any).org);

    return (
      <TouchableOpacity
        key={c.id}
        style={styles.card}
        onPress={() => setExpandedId(expanded ? null : c.id)}
        activeOpacity={0.85}
      >
        <View style={styles.cardMain}>
          <View style={[styles.avatar, { backgroundColor: color }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{c.name}</Text>
            {c.org ? <Text style={styles.cardOrg}>{c.org}</Text> : null}
            <View style={styles.cardCatRow}>
              <View style={[styles.cardCatBadgeWrap, { borderColor: color + '40', backgroundColor: color + '18' }]}>
                <Text style={[styles.cardCatBadge, { color }]}>
                  {getCategoryLabel(c.category)}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.cardActions}>
            {c.phone ? (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => Linking.openURL(`tel:${c.phone}`)}
              >
                <Text style={styles.actionBtnText}>📞</Text>
              </TouchableOpacity>
            ) : null}
            {c.email ? (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => Linking.openURL(`mailto:${c.email}`)}
              >
                <Text style={styles.actionBtnText}>✉️</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Expanded detail */}
        {expanded && (
          <View style={styles.cardDetail}>
            {c.phone ? (
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${c.phone}`)}>
                <Text style={styles.detailLink}>📞 {c.phone}</Text>
              </TouchableOpacity>
            ) : null}
            {c.email ? (
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${c.email}`)}>
                <Text style={styles.detailLink}>✉️ {c.email}</Text>
              </TouchableOpacity>
            ) : null}
            {c.notes ? <Text style={styles.detailNotes}>{c.notes}</Text> : null}

            {isPreloaded ? (
              <TouchableOpacity
                style={[styles.detailActionBtn, alreadySaved && styles.detailActionBtnDisabled]}
                onPress={() => savePreloaded(c as any)}
                disabled={alreadySaved}
              >
                <Text style={styles.detailActionBtnText}>
                  {alreadySaved ? '✓ Saved to my contacts' : '⭐ Save to my contacts'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.detailBtnRow}>
                <TouchableOpacity
                  style={styles.detailActionBtn}
                  onPress={() => openModal(c as Contact)}
                >
                  <Text style={styles.detailActionBtnText}>✏️ Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.detailActionBtn, styles.detailActionBtnDanger]}
                  onPress={() => handleDelete(c.id)}
                >
                  <Text style={[styles.detailActionBtnText, { color: COLORS.errorText }]}>🗑️ Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Contacts</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{isPremium ? '⭐ Premium' : `${contacts.length}/${FREE_LIMIT} Free`}</Text>
        </View>
      </View>

      {/* Rainbow bar */}
      <LinearGradient
        colors={['#FF6B6B', '#FFA500', '#FFD93D', '#6BCB77', '#4D96FF', '#9D84B7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.rainbow}
      />

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsRow}
      >
        {[{ key: 'all', label: 'All' }, ...CATEGORIES].map(cat => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.chip, filter === cat.key && styles.chipActive]}
            onPress={() => setFilter(cat.key)}
          >
            <Text style={[styles.chipText, filter === cat.key && styles.chipTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Add contact button */}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => openModal()}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>
              {!isPremium && contacts.length >= FREE_LIMIT
                ? '🔒 Upgrade to Add More Contacts'
                : '＋ Add Contact'}
            </Text>
          </TouchableOpacity>

          {/* Free limit notice */}
          {!isPremium && contacts.length >= FREE_LIMIT && (
            <View style={styles.limitBanner}>
              <Text style={styles.limitBannerText}>
                Free plan includes {FREE_LIMIT} contacts.{' '}
                <Text style={styles.limitBannerLink} onPress={() => router.push('/paywall')}>
                  Upgrade for unlimited →
                </Text>
              </Text>
            </View>
          )}

          {/* My contacts */}
          <Text style={styles.sectionLabel}>
            My Contacts ({filtered.length})
          </Text>

          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📒</Text>
              <Text style={styles.emptyTitle}>
                {contacts.length === 0 ? 'No contacts yet' : 'No results'}
              </Text>
              <Text style={styles.emptySub}>
                {contacts.length === 0
                  ? 'Tap the button above to save your first contact.'
                  : 'Try a different search or category.'}
              </Text>
            </View>
          ) : (
            filtered.map(c => renderCard(c))
          )}

          {/* Pre-loaded resources */}
          <Text style={[styles.sectionLabel, { marginTop: SPACING.xl }]}>
            Resources (Pre-loaded)
          </Text>
          <View style={styles.preloadedBanner}>
            <Text style={styles.preloadedBannerText}>
              ℹ️ These contacts are maintained by the Autism Pathways team. Tap ⭐ to save any to your personal list.
            </Text>
          </View>

          {filteredPreloaded.map(c => renderCard(c, true))}

        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <TouchableOpacity style={styles.modalDismiss} onPress={closeModal} />
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editId ? 'Edit Contact' : 'Add Contact'}</Text>
              <TouchableOpacity onPress={closeModal} style={styles.modalClose}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Name <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.formInput, errors.name && styles.formInputError]}
                  placeholder="e.g. Sarah Chen"
                  value={form.name}
                  onChangeText={v => setForm(f => ({ ...f, name: v }))}
                  autoCapitalize="words"
                />
                {errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}
              </View>

              {/* Org */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Organization / Role</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Regional Center Case Manager"
                  value={form.org}
                  onChangeText={v => setForm(f => ({ ...f, org: v }))}
                  autoCapitalize="words"
                />
              </View>

              {/* Category */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Category <Text style={styles.required}>*</Text></Text>
                <View style={styles.categoryGrid}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.categoryChip,
                        form.category === cat.key && { backgroundColor: cat.color + '20', borderColor: cat.color },
                      ]}
                      onPress={() => setForm(f => ({ ...f, category: cat.key }))}
                    >
                      <Text style={[styles.categoryChipText, form.category === cat.key && { color: cat.color, fontWeight: '700' }]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.category ? <Text style={styles.fieldError}>{errors.category}</Text> : null}
              </View>

              {/* Phone */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. 555-867-5309"
                  value={form.phone}
                  onChangeText={v => setForm(f => ({ ...f, phone: v }))}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Email */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. sarah@example.com"
                  value={form.email}
                  onChangeText={v => setForm(f => ({ ...f, email: v }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Notes */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Notes</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextarea]}
                  placeholder="e.g. Best time to call: mornings. Direct line ext. 204."
                  value={form.notes}
                  onChangeText={v => setForm(f => ({ ...f, notes: v }))}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Buttons */}
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>Save Contact</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Toast */}
      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 0,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: SPACING.xs },
  backText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.purple },
  headerTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  headerBadge: {
    backgroundColor: '#FFF6D8',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
  },
  headerBadgeText: { fontSize: 11, fontWeight: '700', color: '#7A6020' },

  rainbow: { height: 4 },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    paddingVertical: SPACING.xs,
  },
  searchClear: { fontSize: 14, color: COLORS.textLight, padding: SPACING.xs },

  // Chips
  chipsScroll: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    maxHeight: 48,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  chipActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
  chipText: { fontSize: 12, fontWeight: '600', color: COLORS.textMid },
  chipTextActive: { color: COLORS.white },

  // Content
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },

  // Add button
  addBtn: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.purple,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.lavender,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  addBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.purple },

  // Limit banner
  limitBanner: {
    backgroundColor: COLORS.warningBg,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.warningBorder,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  limitBannerText: { fontSize: FONT_SIZES.xs, color: COLORS.warningText, lineHeight: 18 },
  limitBannerLink: { fontWeight: '700', textDecorationLine: 'underline' },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: COLORS.textLight,
    marginBottom: SPACING.md,
  },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyIcon: { fontSize: 36, opacity: 0.4, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  emptySub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', lineHeight: 20, maxWidth: 260 },

  // Pre-loaded banner
  preloadedBanner: {
    backgroundColor: COLORS.infoBg,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.infoBorder,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  preloadedBannerText: { fontSize: FONT_SIZES.xs, color: COLORS.infoText, lineHeight: 18 },

  // Contact card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
  },
  avatar: {
    width: 44, height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 13, fontWeight: '800', color: COLORS.white, letterSpacing: 0.5 },
  cardInfo: { flex: 1, minWidth: 0 },
  cardName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  cardOrg: { fontSize: 11, color: COLORS.textMid, marginBottom: 4 },
  cardCatRow: { flexDirection: 'row' },
  cardCatBadgeWrap: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  cardCatBadge: {
    fontSize: 10, fontWeight: '700',
    lineHeight: 14,
  },
  cardActions: { flexDirection: 'row', gap: SPACING.xs },
  actionBtn: {
    width: 34, height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: { fontSize: 16 },

  // Card detail
  cardDetail: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.md,
    backgroundColor: COLORS.bg,
    gap: SPACING.sm,
  },
  detailLink: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  detailNotes: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18 },
  detailBtnRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  detailActionBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  detailActionBtnDisabled: { opacity: 0.5 },
  detailActionBtnDanger: { borderColor: COLORS.errorBorder },
  detailActionBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMid },

  // Modal
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalDismiss: { flex: 1 },
  modal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    paddingHorizontal: SPACING.xl,
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  modalClose: {
    width: 30, height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: { fontSize: 14, color: COLORS.textMid },

  // Form
  formGroup: { marginBottom: SPACING.lg },
  formLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMid, marginBottom: 6 },
  required: { color: COLORS.errorText },
  formInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  formInputError: { borderColor: COLORS.errorBorder },
  formTextarea: { minHeight: 80, textAlignVertical: 'top' },
  fieldError: { fontSize: 11, color: COLORS.errorText, fontWeight: '600', marginTop: 4 },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
  },
  categoryChipText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMid },

  // Modal footer
  modalFooter: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg, marginBottom: SPACING.md },
  cancelBtn: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  cancelBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textMid },
  saveBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  saveBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.white },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    backgroundColor: COLORS.text,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    ...SHADOWS.md,
  },
  toastText: { color: COLORS.white, fontSize: FONT_SIZES.xs, fontWeight: '600' },
});
