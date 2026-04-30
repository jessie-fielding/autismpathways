import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';

const STORAGE_KEY = 'ap_services_tracker';

// ─── Types ────────────────────────────────────────────────────────────────────
type ServiceStatus = 'active' | 'pending' | 'paused' | 'ended';

interface Service {
  id: string;
  type: string;
  customType?: string;
  providerName: string;
  providerPhone?: string;
  providerEmail?: string;
  hoursPerWeek?: string;
  startDate?: string;
  renewalDate?: string;
  authorizationNumber?: string;
  fundingSource: string;
  status: ServiceStatus;
  notes?: string;
  createdAt: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const SERVICE_TYPES = [
  { value: 'ABA', label: '🧠 ABA Therapy', color: COLORS.lavenderAccent },
  { value: 'Speech', label: '🗣️ Speech Therapy', color: COLORS.blueAccent },
  { value: 'OT', label: '🖐️ Occupational Therapy', color: COLORS.mintAccent },
  { value: 'PT', label: '🦵 Physical Therapy', color: COLORS.peachAccent },
  { value: 'Feeding', label: '🍽️ Feeding Therapy', color: COLORS.yellowAccent },
  { value: 'Behavioral', label: '💬 Behavioral Support', color: COLORS.lavenderAccent },
  { value: 'Personal Care', label: '🤝 Personal Care / PCA', color: COLORS.mintAccent },
  { value: 'Respite', label: '🏡 Respite Care', color: COLORS.peachAccent },
  { value: 'Social Skills', label: '👥 Social Skills Group', color: COLORS.blueAccent },
  { value: 'Music/Art', label: '🎨 Music / Art Therapy', color: COLORS.yellowAccent },
  { value: 'Vision', label: '👁️ Vision Therapy', color: COLORS.blueAccent },
  { value: 'Other', label: '➕ Other', color: COLORS.border },
];

const FUNDING_SOURCES = ['Medicaid', 'Waiver', 'Insurance', 'School / IEP', 'Private Pay', 'Other'];

const STATUS_CONFIG: Record<ServiceStatus, { label: string; color: string; bg: string }> = {
  active:  { label: 'Active',   color: COLORS.successText,  bg: COLORS.successBg },
  pending: { label: 'Pending',  color: COLORS.infoText,     bg: COLORS.infoBg },
  paused:  { label: 'Paused',   color: COLORS.warningText,  bg: COLORS.warningBg },
  ended:   { label: 'Ended',    color: COLORS.textLight,    bg: COLORS.border },
};

const EMPTY_FORM: Omit<Service, 'id' | 'createdAt'> = {
  type: 'ABA',
  providerName: '',
  providerPhone: '',
  providerEmail: '',
  hoursPerWeek: '',
  startDate: '',
  renewalDate: '',
  authorizationNumber: '',
  fundingSource: 'Medicaid',
  status: 'active',
  notes: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const diff = Math.ceil((d.getTime() - Date.now()) / 86400000);
  return diff;
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ServicesTrackerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [services, setServices] = useState<Service[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Service, 'id' | 'createdAt'>>(EMPTY_FORM);
  const [filterStatus, setFilterStatus] = useState<ServiceStatus | 'all'>('all');

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
        if (raw) setServices(JSON.parse(raw));
      });
    }, [])
  );

  const save = async (updated: Service[]) => {
    setServices(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (s: Service) => {
    setEditingId(s.id);
    setForm({
      type: s.type, customType: s.customType, providerName: s.providerName,
      providerPhone: s.providerPhone, providerEmail: s.providerEmail,
      hoursPerWeek: s.hoursPerWeek, startDate: s.startDate, renewalDate: s.renewalDate,
      authorizationNumber: s.authorizationNumber, fundingSource: s.fundingSource,
      status: s.status, notes: s.notes,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.providerName.trim()) {
      Alert.alert('Required', 'Please enter a provider name.');
      return;
    }
    if (editingId) {
      const updated = services.map((s) => s.id === editingId ? { ...s, ...form } : s);
      await save(updated);
    } else {
      const newService: Service = {
        ...form, id: `svc_${Date.now()}`, createdAt: new Date().toISOString(),
      };
      await save([newService, ...services]);
    }
    setModalVisible(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Service', 'Remove this service from your tracker?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        await save(services.filter((s) => s.id !== id));
      }},
    ]);
  };

  const filtered = filterStatus === 'all' ? services : services.filter((s) => s.status === filterStatus);
  const activeCount = services.filter((s) => s.status === 'active').length;
  const totalHours = services
    .filter((s) => s.status === 'active' && s.hoursPerWeek)
    .reduce((sum, s) => sum + parseFloat(s.hoursPerWeek || '0'), 0);
  const urgentRenewals = services.filter((s) => {
    const d = daysUntil(s.renewalDate);
    return d !== null && d <= 30 && d >= 0;
  });

  const typeInfo = (type: string) => SERVICE_TYPES.find((t) => t.value === type) || SERVICE_TYPES[SERVICE_TYPES.length - 1];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Services Tracker</Text>
        <TouchableOpacity onPress={openAdd} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderTopColor: COLORS.mintAccent }]}>
            <Text style={styles.statNum}>{activeCount}</Text>
            <Text style={styles.statLabel}>Active Services</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: COLORS.blueAccent }]}>
            <Text style={styles.statNum}>{totalHours > 0 ? `${totalHours}h` : '—'}</Text>
            <Text style={styles.statLabel}>Hours / Week</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: urgentRenewals.length > 0 ? COLORS.peachAccent : COLORS.yellowAccent }]}>
            <Text style={[styles.statNum, urgentRenewals.length > 0 && { color: COLORS.errorText }]}>
              {urgentRenewals.length}
            </Text>
            <Text style={styles.statLabel}>Renewals Due</Text>
          </View>
        </View>

        {/* Urgent renewal alerts */}
        {urgentRenewals.map((s) => {
          const d = daysUntil(s.renewalDate)!;
          return (
            <View key={s.id} style={styles.urgentCard}>
              <Text style={styles.urgentIcon}>⚠️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.urgentTitle}>{s.type} renewal due in {d} day{d !== 1 ? 's' : ''}</Text>
                <Text style={styles.urgentSub}>{s.providerName} · Auth #{s.authorizationNumber || 'N/A'}</Text>
              </View>
            </View>
          );
        })}

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {(['all', 'active', 'pending', 'paused', 'ended'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filterStatus === f && styles.filterChipOn]}
              onPress={() => setFilterStatus(f)}
            >
              <Text style={[styles.filterChipText, filterStatus === f && styles.filterChipTextOn]}>
                {f === 'all' ? `All (${services.length})` : `${STATUS_CONFIG[f].label} (${services.filter((s) => s.status === f).length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Empty state */}
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🗂️</Text>
            <Text style={styles.emptyTitle}>No services tracked yet</Text>
            <Text style={styles.emptyBody}>
              Add your child's therapies and support services to track hours, providers, and renewal dates all in one place.
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={openAdd}>
              <Text style={styles.emptyBtnText}>+ Add First Service</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Service cards */}
        {filtered.map((s) => {
          const info = typeInfo(s.type);
          const renewal = daysUntil(s.renewalDate);
          const statusCfg = STATUS_CONFIG[s.status];
          return (
            <View key={s.id} style={[styles.serviceCard, { borderTopColor: info.color }]}>
              <View style={styles.serviceCardTop}>
                <View style={styles.serviceCardLeft}>
                  <Text style={styles.serviceType}>{s.type === 'Other' && s.customType ? s.customType : info.label}</Text>
                  <Text style={styles.serviceProvider}>{s.providerName}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                </View>
              </View>

              <View style={styles.serviceMetaRow}>
                {s.hoursPerWeek ? <Text style={styles.serviceMeta}>⏱️ {s.hoursPerWeek}h/week</Text> : null}
                {s.fundingSource ? <Text style={styles.serviceMeta}>💳 {s.fundingSource}</Text> : null}
                {s.authorizationNumber ? <Text style={styles.serviceMeta}>📋 Auth #{s.authorizationNumber}</Text> : null}
              </View>

              {renewal !== null && (
                <View style={[styles.renewalRow, renewal <= 30 && renewal >= 0 ? styles.renewalUrgent : styles.renewalNormal]}>
                  <Text style={[styles.renewalText, renewal <= 30 && renewal >= 0 ? { color: COLORS.errorText } : { color: COLORS.textMid }]}>
                    {renewal < 0
                      ? `⚠️ Authorization expired ${Math.abs(renewal)} days ago`
                      : renewal === 0
                      ? '🔴 Authorization expires today!'
                      : renewal <= 30
                      ? `⚠️ Renewal due in ${renewal} days`
                      : `🗓️ Renewal: ${new Date(s.renewalDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                    }
                  </Text>
                </View>
              )}

              {s.notes ? <Text style={styles.serviceNotes}>{s.notes}</Text> : null}

              <View style={styles.serviceActions}>
                {s.providerPhone ? (
                  <TouchableOpacity style={styles.actionChip}>
                    <Text style={styles.actionChipText}>📞 Call</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity style={styles.actionChip} onPress={() => openEdit(s)}>
                  <Text style={styles.actionChipText}>✏️ Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionChip, styles.actionChipDanger]} onPress={() => handleDelete(s.id)}>
                  <Text style={[styles.actionChipText, { color: COLORS.errorText }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* How to get services info card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>💡 How to get services funded</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Medicaid / EPSDT</Text>
            <Text style={styles.infoRowBody}>ABA, speech, OT, PT are covered for children under 21. Ask your doctor for a referral and PMIP form.</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Waiver Programs</Text>
            <Text style={styles.infoRowBody}>Cover personal care, respite, and behavioral support. Apply through your state's DD waiver program.</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>School / IEP</Text>
            <Text style={styles.infoRowBody}>Speech, OT, PT, and behavioral support can be included in your child's IEP at no cost to you.</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoRowLabel}>Insurance</Text>
            <Text style={styles.infoRowBody}>Most states mandate autism insurance coverage. Check your plan and appeal denials — 40–60% are overturned.</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>{editingId ? 'Edit Service' : 'Add Service'}</Text>

              <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
                {/* Service type */}
                <Text style={styles.formLabel}>Service Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.lg }}>
                  {SERVICE_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t.value}
                      style={[styles.typeChip, form.type === t.value && { borderColor: COLORS.purple, backgroundColor: COLORS.lavender }]}
                      onPress={() => setForm({ ...form, type: t.value })}
                    >
                      <Text style={[styles.typeChipText, form.type === t.value && { color: COLORS.purpleDark }]}>{t.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {form.type === 'Other' && (
                  <>
                    <Text style={styles.formLabel}>Custom Service Name</Text>
                    <TextInput
                      style={styles.input}
                      value={form.customType}
                      onChangeText={(v) => setForm({ ...form, customType: v })}
                      placeholder="e.g. Hippotherapy"
                      placeholderTextColor={COLORS.textLight}
                    />
                  </>
                )}

                <Text style={styles.formLabel}>Provider / Agency Name *</Text>
                <TextInput
                  style={styles.input}
                  value={form.providerName}
                  onChangeText={(v) => setForm({ ...form, providerName: v })}
                  placeholder="e.g. Sunshine ABA Center"
                  placeholderTextColor={COLORS.textLight}
                />

                <Text style={styles.formLabel}>Provider Phone</Text>
                <TextInput
                  style={styles.input}
                  value={form.providerPhone}
                  onChangeText={(v) => setForm({ ...form, providerPhone: v })}
                  placeholder="(303) 555-0100"
                  keyboardType="phone-pad"
                  placeholderTextColor={COLORS.textLight}
                />

                <Text style={styles.formLabel}>Provider Email</Text>
                <TextInput
                  style={styles.input}
                  value={form.providerEmail}
                  onChangeText={(v) => setForm({ ...form, providerEmail: v })}
                  placeholder="provider@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={COLORS.textLight}
                />

                <Text style={styles.formLabel}>Hours Per Week</Text>
                <TextInput
                  style={styles.input}
                  value={form.hoursPerWeek}
                  onChangeText={(v) => setForm({ ...form, hoursPerWeek: v })}
                  placeholder="e.g. 20"
                  keyboardType="decimal-pad"
                  placeholderTextColor={COLORS.textLight}
                />

                <Text style={styles.formLabel}>Start Date</Text>
                <TextInput
                  style={styles.input}
                  value={form.startDate}
                  onChangeText={(v) => setForm({ ...form, startDate: v })}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor={COLORS.textLight}
                />

                <Text style={styles.formLabel}>Authorization / Renewal Date</Text>
                <TextInput
                  style={styles.input}
                  value={form.renewalDate}
                  onChangeText={(v) => setForm({ ...form, renewalDate: v })}
                  placeholder="MM/DD/YYYY"
                  placeholderTextColor={COLORS.textLight}
                />

                <Text style={styles.formLabel}>Authorization Number</Text>
                <TextInput
                  style={styles.input}
                  value={form.authorizationNumber}
                  onChangeText={(v) => setForm({ ...form, authorizationNumber: v })}
                  placeholder="e.g. AUTH-2024-00123"
                  placeholderTextColor={COLORS.textLight}
                />

                <Text style={styles.formLabel}>Funding Source</Text>
                <View style={styles.fundingRow}>
                  {FUNDING_SOURCES.map((f) => (
                    <TouchableOpacity
                      key={f}
                      style={[styles.fundingChip, form.fundingSource === f && styles.fundingChipOn]}
                      onPress={() => setForm({ ...form, fundingSource: f })}
                    >
                      <Text style={[styles.fundingChipText, form.fundingSource === f && styles.fundingChipTextOn]}>{f}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.formLabel}>Status</Text>
                <View style={styles.fundingRow}>
                  {(Object.keys(STATUS_CONFIG) as ServiceStatus[]).map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.fundingChip, form.status === s && styles.fundingChipOn]}
                      onPress={() => setForm({ ...form, status: s })}
                    >
                      <Text style={[styles.fundingChipText, form.status === s && styles.fundingChipTextOn]}>{STATUS_CONFIG[s].label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.formLabel}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.inputMulti]}
                  value={form.notes}
                  onChangeText={(v) => setForm({ ...form, notes: v })}
                  placeholder="Any notes about this service..."
                  multiline
                  numberOfLines={3}
                  placeholderTextColor={COLORS.textLight}
                />

                <View style={styles.sheetActions}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveBtnText}>{editingId ? 'Save Changes' : 'Add Service'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: SPACING.xs, minWidth: 60 },
  backText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.purple },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  addBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.lg, paddingVertical: 6,
  },
  addBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.sm },
  scroll: { padding: SPACING.lg },

  statsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  statCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center', borderWidth: 1,
    borderColor: COLORS.border, borderTopWidth: 3, ...SHADOWS.sm,
  },
  statNum: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 10, color: COLORS.textLight, textAlign: 'center', marginTop: 2 },

  urgentCard: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.errorBg, borderRadius: RADIUS.sm, padding: SPACING.md,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.errorBorder,
  },
  urgentIcon: { fontSize: 20 },
  urgentTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.errorText },
  urgentSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginTop: 2 },

  filterRow: { marginBottom: SPACING.lg },
  filterChip: {
    borderRadius: RADIUS.pill, paddingHorizontal: SPACING.lg, paddingVertical: 7,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white,
    marginRight: SPACING.sm,
  },
  filterChipOn: { backgroundColor: COLORS.lavender, borderColor: COLORS.lavenderAccent },
  filterChipText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMid },
  filterChipTextOn: { color: COLORS.purpleDark },

  emptyState: { alignItems: 'center', paddingVertical: SPACING.xxxl },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.lg, opacity: 0.5 },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  emptyBody: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', lineHeight: 20, marginBottom: SPACING.xl },
  emptyBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
  },
  emptyBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.sm },

  serviceCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
    borderTopWidth: 4, ...SHADOWS.sm,
  },
  serviceCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  serviceCardLeft: { flex: 1 },
  serviceType: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  serviceProvider: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, marginTop: 2 },
  statusBadge: { borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md, paddingVertical: 4 },
  statusBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  serviceMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.sm },
  serviceMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textMid },
  renewalRow: { borderRadius: RADIUS.xs, padding: SPACING.sm, marginBottom: SPACING.sm },
  renewalUrgent: { backgroundColor: COLORS.errorBg },
  renewalNormal: { backgroundColor: COLORS.infoBg },
  renewalText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  serviceNotes: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, fontStyle: 'italic', marginBottom: SPACING.sm },
  serviceActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  actionChip: {
    borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md, paddingVertical: 5,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg,
  },
  actionChipDanger: { borderColor: COLORS.errorBorder, backgroundColor: COLORS.errorBg },
  actionChipText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMid },

  infoCard: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.lg, borderWidth: 1, borderColor: COLORS.lavenderAccent,
  },
  infoCardTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.purpleDark, marginBottom: SPACING.md },
  infoRow: { marginBottom: SPACING.md },
  infoRowLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purpleDark, marginBottom: 2 },
  infoRowBody: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg, maxHeight: '92%',
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border,
    alignSelf: 'center', marginTop: SPACING.md, marginBottom: SPACING.sm,
  },
  sheetTitle: {
    fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text,
    textAlign: 'center', marginBottom: SPACING.lg, paddingHorizontal: SPACING.lg,
  },
  sheetScroll: { paddingHorizontal: SPACING.lg },
  formLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMid, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.base, color: COLORS.text, backgroundColor: COLORS.white,
    marginBottom: SPACING.lg,
  },
  inputMulti: { height: 80, textAlignVertical: 'top' },
  typeChip: {
    borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md, paddingVertical: 7,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bg,
    marginRight: SPACING.sm,
  },
  typeChipText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMid },
  fundingRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  fundingChip: {
    borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bg,
  },
  fundingChipOn: { backgroundColor: COLORS.lavender, borderColor: COLORS.lavenderAccent },
  fundingChipText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMid },
  fundingChipTextOn: { color: COLORS.purpleDark },
  sheetActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md, alignItems: 'center',
  },
  cancelBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textMid },
  saveBtn: {
    flex: 2, backgroundColor: COLORS.purple, borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md, alignItems: 'center',
  },
  saveBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.sm },
});
