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
import { useChildChanged } from '../../hooks/useChildChanged';

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
  denied:     { label: '#c0392b', bg: '#ffe0e0', icon: '❌' },
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
  useChildChanged(() => { loadAppeals(); });

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
    toastTimer.current = setTimeout(() => setToast('', 2400));
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
              <Text style={[styles.statNumber, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Filter buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {[ 'all', 'preparing', 'submitted', 'pending', 'approved', 'denied', 'escalated' ].map(s => (
            <TouchableOpacity
              key={s}
              style={[styles.filterBtn, filterStatus === s && styles.filterBtnActive]}
              onPress={() => setFilterStatus(s as AppealStatus | 'all')}
            >
              <Text style={[styles.filterBtnText, filterStatus === s && styles.filterBtnTextActive]}>
                {s === 'all' ? 'All' : STATUS_META[s as AppealStatus].label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Appeal list */}
        <View style={styles.appealList}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No appeals yet. Tap '＋ Add' to get started.</Text>
            </View>
          ) : (
            filtered.map(appeal => (
              <View key={appeal.id} style={styles.appealCard}>
                <TouchableOpacity onPress={() => setExpandedId(expandedId === appeal.id ? null : appeal.id)} activeOpacity={0.85}>
                  <View style={styles.appealSummary}>
                    <View style={styles.appealSummaryLeft}>
                      <Text style={styles.appealTitle}>{appeal.title}</Text>
                      <Text style={styles.appealMeta}>{appeal.insurer} — {appeal.serviceType}</Text>
                    </View>
                    <View style={styles.appealSummaryRight}>
                      <View style={[styles.statusBadge, { backgroundColor: STATUS_META[appeal.status].bg }]}>
                        <Text style={[styles.statusBadgeText, { color: STATUS_META[appeal.status].color }]}>
                          {STATUS_META[appeal.status].icon} {STATUS_META[appeal.status].label}
                        </Text>
                      </View>
                      {daysUntil(appeal.deadlineDate) !== null && (
                        <Text style={styles.deadlineText}>
                          {daysUntil(appeal.deadlineDate) === 0 ? 'Due Today!' : daysUntil(appeal.deadlineDate) > 0 ? `${daysUntil(appeal.deadlineDate)} days left` : `${Math.abs(daysUntil(appeal.deadlineDate)!)} days overdue`}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {expandedId === appeal.id && (
                  <View style={styles.appealDetails}>
                    <View style={styles.detailRow}><Text style={styles.detailLabel}>Claim #:</Text><Text style={styles.detailValue}>{appeal.claimNumber || '—'}</Text></View>
                    <View style={styles.detailRow}><Text style={styles.detailLabel}>Denial Date:</Text><Text style={styles.detailValue}>{fmtDate(appeal.denialDate)}</Text></View>
                    <View style={styles.detailRow}><Text style={styles.detailLabel}>Deadline:</Text><Text style={styles.detailValue}>{fmtDate(appeal.deadlineDate)}</Text></View>
                    <View style={styles.detailRow}><Text style={styles.detailLabel}>Submitted:</Text><Text style={styles.detailValue}>{fmtDate(appeal.submittedDate)}</Text></View>
                    <View style={styles.detailRow}><Text style={styles.detailLabel}>Notes:</Text><Text style={styles.detailValue}>{appeal.notes || '—'}</Text></View>
                    <View style={styles.detailRow}><Text style={styles.detailLabel}>Created:</Text><Text style={styles.detailValue}>{fmtDate(appeal.createdAt)}</Text></View>
                    <View style={styles.detailRow}><Text style={styles.detailLabel}>Last Updated:</Text><Text style={styles.detailValue}>{fmtDate(appeal.updatedAt)}</Text></View>

                    <View style={styles.appealActions}>
                      <TouchableOpacity style={styles.actionBtn} onPress={() => openModal(appeal)}>
                        <Text style={styles.actionBtnText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDestructive]} onPress={() => handleDelete(appeal.id)}>
                        <Text style={styles.actionBtnText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Toast */}
      {toast && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editId ? 'Edit Appeal' : 'Add New Appeal'}</Text>

            <Text style={styles.formLabel}>Appeal Name</Text>
            <TextInput
              style={styles.formInput}
              value={form.title}
              onChangeText={t => setForm({ ...form, title: t })}
              placeholder="e.g., ABA Therapy Denial"
            />

            <Text style={styles.formLabel}>Insurer</Text>
            <TextInput
              style={styles.formInput}
              value={form.insurer}
              onChangeText={t => setForm({ ...form, insurer: t })}
              placeholder="e.g., Blue Cross Blue Shield"
            />

            <Text style={styles.formLabel}>Service Type</Text>
            <TextInput
              style={styles.formInput}
              value={form.serviceType}
              onChangeText={t => setForm({ ...form, serviceType: t })}
              placeholder="e.g., Speech Therapy"
            />

            <Text style={styles.formLabel}>Claim Number</Text>
            <TextInput
              style={styles.formInput}
              value={form.claimNumber}
              onChangeText={t => setForm({ ...form, claimNumber: t })}
              placeholder="e.g., 1234567890"
            />

            <Text style={styles.formLabel}>Denial Date</Text>
            <TextInput
              style={styles.formInput}
              value={form.denialDate}
              onChangeText={t => setForm({ ...form, denialDate: t })}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.formLabel}>Deadline Date</Text>
            <TextInput
              style={styles.formInput}
              value={form.deadlineDate}
              onChangeText={t => setForm({ ...form, deadlineDate: t })}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.formLabel}>Submitted Date</Text>
            <TextInput
              style={styles.formInput}
              value={form.submittedDate}
              onChangeText={t => setForm({ ...form, submittedDate: t })}
              placeholder="YYYY-MM-DD"
            />

            <Text style={styles.formLabel}>Status</Text>
            <View style={styles.statusPicker}>
              {Object.entries(STATUS_META).map(([key, meta]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.statusPickerBtn, form.status === key && { backgroundColor: meta.bg }]}
                  onPress={() => setForm({ ...form, status: key as AppealStatus })}
                >
                  <Text style={[styles.statusPickerBtnText, form.status === key && { color: meta.color }]}>
                    {meta.icon} {meta.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>Notes</Text>
            <TextInput
              style={[styles.formInput, { minHeight: 80, textAlignVertical: 'top' }]}
              value={form.notes}
              onChangeText={t => setForm({ ...form, notes: t })}
              placeholder="Add any relevant notes here..."
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtn} onPress={closeModal}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={handleSave}>
                <Text style={styles.modalBtnText}>{editId ? 'Save Changes' : 'Add Appeal'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

export default function AppealTrackerScreen() {
  const { isPremium, isLoading } = useIsPremium();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return isPremium ? <FullTracker /> : <PremiumGateView />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  backText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addHeaderBtn: {
    padding: SPACING.xs,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
  },
  addHeaderBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  rainbow: {
    height: 3,
    width: '100%',
    backgroundColor: COLORS.primary,
    // A nice rainbow gradient for premium features
    // TODO: Replace with LinearGradient from expo-linear-gradient
    // background: 'linear-gradient(to right, #6200EE, #03DAC6, #FF4081, #FFC107)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.md,
    backgroundColor: COLORS.lightGray,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
  },
  filterScroll: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  filterBtn: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.lightGray,
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
  },
  filterBtnText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
  },
  filterBtnTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  appealList: {
    padding: SPACING.md,
  },
  appealCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    ...SHADOWS.sm,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  appealSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  appealSummaryLeft: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  appealTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  appealMeta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginTop: SPACING.xs / 2,
  },
  appealSummaryRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingVertical: SPACING.xs / 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  statusBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  deadlineText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginTop: SPACING.xs / 2,
    fontWeight: 'bold',
  },
  appealDetails: {
    padding: SPACING.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginRight: SPACING.xs,
    color: COLORS.text,
  },
  detailValue: {
    color: COLORS.text,
    flex: 1,
  },
  appealActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
  },
  actionBtn: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.lightGray,
  },
  actionBtnText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  actionBtnDestructive: {
    backgroundColor: COLORS.errorLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textLight,
  },
  // Premium Gate Styles
  gateHero: {
    padding: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.purple,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    paddingTop: SPACING.lg,
  },
  gateHeroIcon: {
    backgroundColor: COLORS.white,
    borderRadius: 40,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  gateHeroIconText: {
    fontSize: 48,
  },
  gatePremiumBadge: {
    backgroundColor: COLORS.yellowAccent,
    paddingVertical: SPACING.xs / 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
    gatePremiumBadgeText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.sm,
  },
  gateHeroTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  gateHeroSub: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: FONT_SIZES.md * 1.4,
  },
  gateFeatures: {
    padding: SPACING.md,
  },
  gateFeaturesTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  gateFeatureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  gateFeatureIcon: {
    marginRight: SPACING.sm,
    fontSize: FONT_SIZES.lg,
  },
  gateFeatureIconText: {
    fontSize: FONT_SIZES.lg,
  },
  gateFeatureBody: {
    flex: 1,
  },
  gateFeatureTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },
  gateFeatureDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  gateStatCard: {
    backgroundColor: COLORS.blue,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  gateStatNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.infoText,
  },
  gateStatLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.infoText,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  gateStatSource: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.infoText,
    opacity: 0.7,
    marginTop: SPACING.sm,
  },
  gateCTA: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  gateUpgradeBtn: {
    backgroundColor: COLORS.purple,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
    ...SHADOWS.md,
  },
  gateUpgradeBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  gateUpgradeNote: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    width: '90%',
    maxHeight: '90%',
    ...SHADOWS.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    textAlign: 'center',
    color: COLORS.text,
  },
  formLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginBottom: SPACING.xs / 2,
    marginTop: SPACING.sm,
  },
  formInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  statusPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  statusPickerBtn: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.lightGray,
  },
  statusPickerBtnText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
  },
  modalBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.lightGray,
  },
  modalBtnText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  modalBtnPrimary: {
    backgroundColor: COLORS.primary,
  },
});
