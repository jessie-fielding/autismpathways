/**
 * Appeal Tracker — Premium Only
 *
 * Shows a full-featured premium gate with a preview of what's inside.
 * When isPremium is true, renders the full tracker UI.
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Platform, Modal, TextInput, Alert, KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';

// ── Types ─────────────────────────────────────────────────────────────────────
type AppealStatus = 'preparing' | 'submitted' | 'pending' | 'approved' | 'denied' | 'escalated';

interface Appeal {
  id: string;
  title: string;
  insurer: string;
  serviceType: string;
  denialDate: string;
  deadlineDate: string;
  submittedDate: string;
  status: AppealStatus;
  notes: string;
  claimNumber: string;
  createdAt: string;
  updatedAt: string;
}

const STORE_KEY = 'ap_appeals';

const STATUS_META: Record<AppealStatus, { label: string; color: string; bg: string; icon: string }> = {
  preparing:  { label: 'Preparing',  color: '#7C5CBF', bg: '#f0ebff', icon: '✏️' },
  submitted:  { label: 'Submitted',  color: '#2C5F8A', bg: '#DCEEFF', icon: '📤' },
  pending:    { label: 'Pending',    color: '#a07800', bg: '#fff9c4', icon: '⏳' },
  approved:   { label: 'Approved',   color: '#2e7d32', bg: '#d4edda', icon: '✅' },
  denied:     { label: 'Denied',     color: '#c0392b', bg: '#ffe0e0', icon: '❌' },
  escalated:  { label: 'Escalated',  color: '#c45a00', bg: '#fff0e0', icon: '⚠️' },
};

const EMPTY_FORM: Omit<Appeal, 'id' | 'createdAt' | 'updatedAt'> = {
  title: '', insurer: '', serviceType: '', denialDate: '',
  deadlineDate: '', submittedDate: '', status: 'preparing',
  notes: '', claimNumber: '',
};

function fmtDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return iso; }
}

function daysUntil(iso: string): number | null {
  if (!iso) return null;
  try {
    const diff = new Date(iso).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch { return null; }
}

// ── Premium Gate Screen ───────────────────────────────────────────────────────
function PremiumGateView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const FEATURES = [
    { icon: '📋', title: 'Track every appeal', desc: 'Log insurance denials with claim numbers, service types, and denial dates.' },
    { icon: '⏰', title: 'Deadline alerts', desc: 'Never miss an appeal window — see exactly how many days you have left.' },
    { icon: '📊', title: 'Status pipeline', desc: 'Move appeals through Preparing → Submitted → Pending → Approved/Denied/Escalated.' },
    { icon: '📝', title: 'Notes per appeal', desc: 'Keep a running log of calls, names, and what was said — all in one place.' },
    { icon: '🔔', title: 'Deadline reminders', desc: 'Get push notifications before appeal deadlines expire.' },
    { icon: '📤', title: 'Export your appeals', desc: 'Share a summary with your attorney, advocate, or state insurance commissioner.' },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appeal Tracker</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.rainbow} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.gateHero}>
          <View style={styles.gateHeroIcon}>
            <Text style={styles.gateHeroIconText}>⚖️</Text>
          </View>
          <View style={styles.gatePremiumBadge}>
            <Text style={styles.gatePremiumBadgeText}>⭐ Premium Feature</Text>
          </View>
          <Text style={styles.gateHeroTitle}>Appeal Tracker</Text>
          <Text style={styles.gateHeroSub}>
            Insurance denials are not the final word. The Appeal Tracker keeps every deadline, document, and decision in one place so you never lose track of a fight you deserve to win.
          </Text>
        </View>

        {/* Feature list */}
        <View style={styles.gateFeatures}>
          <Text style={styles.gateFeaturesTitle}>What's included</Text>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.gateFeatureRow}>
              <View style={styles.gateFeatureIcon}>
                <Text style={styles.gateFeatureIconText}>{f.icon}</Text>
              </View>
              <View style={styles.gateFeatureBody}>
                <Text style={styles.gateFeatureTitle}>{f.title}</Text>
                <Text style={styles.gateFeatureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Stat callout */}
        <View style={styles.gateStatCard}>
          <Text style={styles.gateStatNumber}>40–60%</Text>
          <Text style={styles.gateStatLabel}>of insurance appeals are overturned when properly filed</Text>
          <Text style={styles.gateStatSource}>Source: American Medical Association</Text>
        </View>

        {/* CTA */}
        <View style={styles.gateCTA}>
          <TouchableOpacity
            style={styles.gateUpgradeBtn}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.85}
          >
            <Text style={styles.gateUpgradeBtnText}>Unlock Appeal Tracker →</Text>
          </TouchableOpacity>
          <Text style={styles.gateUpgradeNote}>
            Includes all premium tools — Talking Points, Contacts, and more.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ── Full Tracker (Premium) ────────────────────────────────────────────────────
function FullTracker() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [appeals, setAppeals]         = useState<Appeal[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId]           = useState<string | null>(null);
  const [form, setForm]               = useState({ ...EMPTY_FORM });
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<AppealStatus | 'all'>('all');
  const [toast, setToast]             = useState('');
  const toastTimer = React.useRef<any>(null);

  useFocusEffect(useCallback(() => { loadAppeals(); }, []));

  const loadAppeals = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORE_KEY);
      if (raw) setAppeals(JSON.parse(raw));
    } catch {}
  };

  const saveAppeals = async (updated: Appeal[]) => {
    try {
      await AsyncStorage.setItem(STORE_KEY, JSON.stringify(updated));
      setAppeals(updated);
    } catch {}
  };

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2400);
  };

  const openModal = (appeal?: Appeal) => {
    if (appeal) {
      setEditId(appeal.id);
      const { id, createdAt, updatedAt, ...rest } = appeal;
      setForm(rest);
    } else {
      setEditId(null);
      setForm({ ...EMPTY_FORM });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditId(null);
    setForm({ ...EMPTY_FORM });
  };

  const handleSave = async () => {
    if (!form.title.trim()) { showToast('Appeal name is required.'); return; }
    const now = new Date().toISOString();
    let updated: Appeal[];
    if (editId) {
      updated = appeals.map(a => a.id === editId ? { ...a, ...form, updatedAt: now } : a);
    } else {
      updated = [{ id: `ap_${Date.now()}`, ...form, createdAt: now, updatedAt: now }, ...appeals];
    }
    await saveAppeals(updated);
    closeModal();
    showToast(editId ? 'Appeal updated.' : 'Appeal added.');
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Appeal?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await saveAppeals(appeals.filter(a => a.id !== id));
        setExpandedId(null);
        showToast('Appeal deleted.');
      }},
    ]);
  };

  const filtered = appeals.filter(a => filterStatus === 'all' || a.status === filterStatus);

  // Stats
  const stats = {
    total:    appeals.length,
    approved: appeals.filter(a => a.status === 'approved').length,
    pending:  appeals.filter(a => ['submitted', 'pending', 'preparing'].includes(a.status)).length,
    urgent:   appeals.filter(a => {
      const d = daysUntil(a.deadlineDate);
      return d !== null && d <= 7 && d >= 0 && a.status !== 'approved' && a.status !== 'denied';
    }).length,
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appeal Tracker</Text>
        <TouchableOpacity style={styles.addHeaderBtn} onPress={() => openModal()}>
          <Text style={styles.addHeaderBtnText}>＋ Add</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.rainbow} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total', value: stats.total, color: COLORS.purple },
            { label: 'Active', value: stats.pending, color: '#2C5F8A' },
            { label: 'Won', value: stats.approved, color: '#2e7d32' },
            { label: 'Urgent', value: stats.urgent, color: '#c0392b' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
          {(['all', ...Object.keys(STATUS_META)] as Array<AppealStatus | 'all'>).map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.filterChip, filterStatus === s && styles.filterChipActive]}
              onPress={() => setFilterStatus(s)}
            >
              <Text style={[styles.filterChipText, filterStatus === s && styles.filterChipTextActive]}>
                {s === 'all' ? 'All' : STATUS_META[s as AppealStatus].icon + ' ' + STATUS_META[s as AppealStatus].label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.content}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>⚖️</Text>
              <Text style={styles.emptyTitle}>{appeals.length === 0 ? 'No appeals yet' : 'No results'}</Text>
              <Text style={styles.emptySub}>
                {appeals.length === 0
                  ? 'Tap ＋ Add to log your first insurance appeal.'
                  : 'Try a different filter.'}
              </Text>
            </View>
          ) : (
            filtered.map(appeal => {
              const sm = STATUS_META[appeal.status];
              const days = daysUntil(appeal.deadlineDate);
              const expanded = expandedId === appeal.id;
              const urgent = days !== null && days <= 7 && days >= 0 && appeal.status !== 'approved' && appeal.status !== 'denied';

              return (
                <TouchableOpacity
                  key={appeal.id}
                  style={[styles.appealCard, urgent && styles.appealCardUrgent]}
                  onPress={() => setExpandedId(expanded ? null : appeal.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.appealCardTop}>
                    <View style={[styles.statusBadge, { backgroundColor: sm.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: sm.color }]}>{sm.icon} {sm.label}</Text>
                    </View>
                    {urgent && (
                      <View style={styles.urgentBadge}>
                        <Text style={styles.urgentBadgeText}>⚠️ {days}d left</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.appealTitle}>{appeal.title}</Text>
                  {appeal.insurer ? <Text style={styles.appealInsurer}>{appeal.insurer}</Text> : null}
                  {appeal.serviceType ? <Text style={styles.appealService}>{appeal.serviceType}</Text> : null}

                  <View style={styles.appealDates}>
                    {appeal.denialDate ? (
                      <Text style={styles.appealDateText}>Denied: {fmtDate(appeal.denialDate)}</Text>
                    ) : null}
                    {appeal.deadlineDate ? (
                      <Text style={[styles.appealDateText, urgent && { color: '#c0392b', fontWeight: '700' }]}>
                        Deadline: {fmtDate(appeal.deadlineDate)}
                        {days !== null && days >= 0 ? ` (${days}d)` : days !== null && days < 0 ? ' (past)' : ''}
                      </Text>
                    ) : null}
                  </View>

                  {expanded && (
                    <View style={styles.appealDetail}>
                      {appeal.claimNumber ? <Text style={styles.detailRow}>Claim #: {appeal.claimNumber}</Text> : null}
                      {appeal.submittedDate ? <Text style={styles.detailRow}>Submitted: {fmtDate(appeal.submittedDate)}</Text> : null}
                      {appeal.notes ? <Text style={styles.detailNotes}>{appeal.notes}</Text> : null}
                      <View style={styles.detailBtnRow}>
                        <TouchableOpacity style={styles.detailBtn} onPress={() => openModal(appeal)}>
                          <Text style={styles.detailBtnText}>✏️ Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.detailBtn, styles.detailBtnDanger]} onPress={() => handleDelete(appeal.id)}>
                          <Text style={[styles.detailBtnText, { color: COLORS.errorText }]}>🗑️ Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBackdrop}>
          <TouchableOpacity style={styles.modalDismiss} onPress={closeModal} />
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editId ? 'Edit Appeal' : 'Log Appeal'}</Text>
              <TouchableOpacity onPress={closeModal} style={styles.modalClose}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {[
                { key: 'title',         label: 'Appeal Name *',    placeholder: 'e.g. ABA Therapy Denial — March 2025', keyboard: 'default' },
                { key: 'insurer',       label: 'Insurance Company', placeholder: 'e.g. Blue Cross Blue Shield',          keyboard: 'default' },
                { key: 'serviceType',   label: 'Service Type',      placeholder: 'e.g. ABA Therapy, OT, Speech',         keyboard: 'default' },
                { key: 'claimNumber',   label: 'Claim Number',      placeholder: 'e.g. CLM-2025-001234',                 keyboard: 'default' },
                { key: 'denialDate',    label: 'Denial Date',       placeholder: 'YYYY-MM-DD',                           keyboard: 'default' },
                { key: 'deadlineDate',  label: 'Appeal Deadline',   placeholder: 'YYYY-MM-DD',                           keyboard: 'default' },
                { key: 'submittedDate', label: 'Date Submitted',    placeholder: 'YYYY-MM-DD',                           keyboard: 'default' },
              ].map(field => (
                <View key={field.key} style={styles.formGroup}>
                  <Text style={styles.formLabel}>{field.label}</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder={field.placeholder}
                    placeholderTextColor={COLORS.textLight}
                    value={(form as any)[field.key]}
                    onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                    keyboardType={field.keyboard as any}
                    autoCapitalize={field.key === 'claimNumber' ? 'characters' : 'words'}
                  />
                </View>
              ))}

              {/* Status */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Status</Text>
                <View style={styles.statusGrid}>
                  {(Object.keys(STATUS_META) as AppealStatus[]).map(s => {
                    const sm = STATUS_META[s];
                    const sel = form.status === s;
                    return (
                      <TouchableOpacity
                        key={s}
                        style={[styles.statusChip, sel && { backgroundColor: sm.bg, borderColor: sm.color }]}
                        onPress={() => setForm(f => ({ ...f, status: s }))}
                      >
                        <Text style={[styles.statusChipText, sel && { color: sm.color, fontWeight: '700' }]}>
                          {sm.icon} {sm.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Notes */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Notes</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextarea]}
                  placeholder="Call notes, names, what was said..."
                  placeholderTextColor={COLORS.textLight}
                  value={form.notes}
                  onChangeText={v => setForm(f => ({ ...f, notes: v }))}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>Save Appeal</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function AppealTrackerScreen() {
  const { isPremium } = useIsPremium();
  return isPremium ? <FullTracker /> : <PremiumGateView />;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 0,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: SPACING.xs, minWidth: 60 },
  backText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.purple },
  headerTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  addHeaderBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md, paddingVertical: 6,
  },
  addHeaderBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.white },
  rainbow: { height: 4, backgroundColor: COLORS.purple },

  // Gate
  gateHero: {
    backgroundColor: COLORS.lavender, padding: SPACING.xl,
    alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  gateHeroIcon: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: COLORS.purple, alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md, ...SHADOWS.md,
  },
  gateHeroIconText: { fontSize: 30 },
  gatePremiumBadge: {
    backgroundColor: '#FFF6D8', borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md, paddingVertical: 4, marginBottom: SPACING.sm,
  },
  gatePremiumBadgeText: { fontSize: 11, fontWeight: '700', color: '#7A6020' },
  gateHeroTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  gateHeroSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', lineHeight: 21, maxWidth: 300 },

  gateFeatures: { padding: SPACING.xl },
  gateFeaturesTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  gateFeatureRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  gateFeatureIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.lavender, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  gateFeatureIconText: { fontSize: 20 },
  gateFeatureBody: { flex: 1 },
  gateFeatureTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  gateFeatureDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18 },

  gateStatCard: {
    marginHorizontal: SPACING.xl, marginBottom: SPACING.xl,
    backgroundColor: COLORS.purple, borderRadius: RADIUS.md,
    padding: SPACING.xl, alignItems: 'center', ...SHADOWS.lg,
  },
  gateStatNumber: { fontSize: 40, fontWeight: '900', color: COLORS.white, letterSpacing: -1 },
  gateStatLabel: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 20, marginTop: 4 },
  gateStatSource: { fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: SPACING.sm },

  gateCTA: { paddingHorizontal: SPACING.xl, alignItems: 'center' },
  gateUpgradeBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.pill,
    paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xxxl,
    width: '100%', alignItems: 'center', ...SHADOWS.lg,
  },
  gateUpgradeBtnText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.white },
  gateUpgradeNote: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: SPACING.md, textAlign: 'center' },

  // Stats
  statsRow: {
    flexDirection: 'row', gap: SPACING.sm,
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg,
  },
  statCard: {
    flex: 1, backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: COLORS.border,
    padding: SPACING.md, alignItems: 'center', ...SHADOWS.sm,
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600', color: COLORS.textLight, marginTop: 2 },

  // Filter
  filterScroll: { maxHeight: 46 },
  filterRow: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, alignItems: 'center' },
  filterChip: {
    paddingHorizontal: SPACING.md, paddingVertical: 5,
    borderRadius: RADIUS.pill, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bg,
  },
  filterChipActive: { backgroundColor: COLORS.text, borderColor: COLORS.text },
  filterChipText: { fontSize: 12, fontWeight: '600', color: COLORS.textMid },
  filterChipTextActive: { color: COLORS.white },

  // Content
  content: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyIcon: { fontSize: 36, opacity: 0.4, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  emptySub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', lineHeight: 20, maxWidth: 260 },

  // Appeal card
  appealCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border,
    padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.sm,
  },
  appealCardUrgent: { borderColor: '#ffcfca', borderLeftWidth: 4, borderLeftColor: '#c0392b' },
  appealCardTop: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  statusBadge: {
    paddingHorizontal: SPACING.sm, paddingVertical: 3,
    borderRadius: RADIUS.pill, alignSelf: 'flex-start',
  },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  urgentBadge: {
    backgroundColor: '#ffe0e0', paddingHorizontal: SPACING.sm,
    paddingVertical: 3, borderRadius: RADIUS.pill,
  },
  urgentBadgeText: { fontSize: 11, fontWeight: '700', color: '#c0392b' },
  appealTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  appealInsurer: { fontSize: FONT_SIZES.xs, color: COLORS.textMid },
  appealService: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  appealDates: { flexDirection: 'row', gap: SPACING.lg, marginTop: SPACING.sm, flexWrap: 'wrap' },
  appealDateText: { fontSize: 11, color: COLORS.textLight, fontWeight: '500' },
  appealDetail: {
    borderTopWidth: 1, borderTopColor: COLORS.border,
    marginTop: SPACING.md, paddingTop: SPACING.md, gap: SPACING.sm,
  },
  detailRow: { fontSize: FONT_SIZES.xs, color: COLORS.textMid },
  detailNotes: {
    fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18,
    backgroundColor: COLORS.bg, borderRadius: RADIUS.xs, padding: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  detailBtnRow: { flexDirection: 'row', gap: SPACING.sm },
  detailBtn: {
    flex: 1, paddingVertical: SPACING.sm, borderRadius: RADIUS.pill,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white, alignItems: 'center',
  },
  detailBtnDanger: { borderColor: COLORS.errorBorder },
  detailBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMid },

  // Modal
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalDismiss: { flex: 1 },
  modal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg,
    paddingHorizontal: SPACING.xl,
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  modalClose: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center',
  },
  modalCloseText: { fontSize: 14, color: COLORS.textMid },

  formGroup: { marginBottom: SPACING.lg },
  formLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMid, marginBottom: 6 },
  formInput: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    fontSize: FONT_SIZES.sm, color: COLORS.text, backgroundColor: COLORS.white,
  },
  formTextarea: { minHeight: 90, textAlignVertical: 'top' },

  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  statusChip: {
    paddingHorizontal: SPACING.md, paddingVertical: 7,
    borderRadius: RADIUS.pill, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bg,
  },
  statusChipText: { fontSize: 12, fontWeight: '500', color: COLORS.textMid },

  modalFooter: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg, marginBottom: SPACING.md },
  cancelBtn: {
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.pill, borderWidth: 1.5, borderColor: COLORS.border,
  },
  cancelBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textMid },
  saveBtn: {
    flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.pill,
    backgroundColor: COLORS.purple, alignItems: 'center', ...SHADOWS.md,
  },
  saveBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.white },

  toast: {
    position: 'absolute', bottom: 90, alignSelf: 'center',
    backgroundColor: COLORS.text, paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm, borderRadius: RADIUS.pill, ...SHADOWS.md,
  },
  toastText: { color: COLORS.white, fontSize: FONT_SIZES.xs, fontWeight: '600' },
});
