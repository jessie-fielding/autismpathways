import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChildChanged } from '../../hooks/useChildChanged';
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

  const loadData = useCallback(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setServices(JSON.parse(raw));
      else setServices([]);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  useChildChanged(() => {
    loadData();
  });

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

              <View style={styles.serviceCardMiddle}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Funding:</Text>
                  <Text style={styles.infoValue}>{s.fundingSource}</Text>
                </View>
                {s.hoursPerWeek && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Hours:</Text>
                    <Text style={styles.infoValue}>{s.hoursPerWeek} / week</Text>
                  </View>
                )}
                {s.authorizationNumber && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Auth #:</Text>
                    <Text style={styles.infoValue}>{s.authorizationNumber}</Text>
                  </View>
                )}
                {renewal !== null && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Renewal:</Text>
                    <Text style={[styles.infoValue, renewal <= 30 && styles.renewalUrgent]}>
                      {s.renewalDate} ({renewal} day{renewal !== 1 ? 's' : ''})
                    </Text>
                  </View>
                )}
              </View>

              {s.notes && <Text style={styles.notes}>{s.notes}</Text>}

              <View style={styles.serviceCardBottom}>
                <TouchableOpacity onPress={() => handleDelete(s.id)} style={styles.cardBtn}>
                  <Text style={[styles.cardBtnText, { color: COLORS.errorText }]}>Remove</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openEdit(s)} style={styles.cardBtn}>
                  <Text style={styles.cardBtnText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{editingId ? 'Edit Service' : 'Add Service'}</Text>

            <ScrollView style={{ width: '100%' }}>
              <Text style={styles.label}>Service Type</Text>
              <View style={styles.typeGrid}>
                {SERVICE_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    style={[
                      styles.typeChip,
                      form.type === t.value && { backgroundColor: t.color, borderColor: t.color },
                    ]}
                    onPress={() => setForm({ ...form, type: t.value })}
                  >
                    <Text style={[styles.typeChipText, form.type === t.value && styles.typeChipTextOn]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {form.type === 'Other' && (
                <>
                  <Text style={styles.label}>Custom Service Name</Text>
                  <TextInput
                    style={styles.input}
                    value={form.customType}
                    onChangeText={(v) => setForm({ ...form, customType: v })}
                    placeholder="e.g., Hippotherapy"
                  />
                </>
              )}

              <Text style={styles.label}>Provider Name</Text>
              <TextInput
                style={styles.input}
                value={form.providerName}
                onChangeText={(v) => setForm({ ...form, providerName: v })}
                placeholder="e.g., ABC Therapy Center"
              />

              <Text style={styles.label}>Funding Source</Text>
              <View style={styles.fundingGrid}>
                {FUNDING_SOURCES.map((fs) => (
                  <TouchableOpacity
                    key={fs}
                    style={[styles.fundingChip, form.fundingSource === fs && styles.fundingChipOn]}
                    onPress={() => setForm({ ...form, fundingSource: fs })}
                  >
                    <Text style={[styles.fundingChipText, form.fundingSource === fs && styles.fundingChipTextOn]}>
                      {fs}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Status</Text>
              <View style={styles.fundingGrid}>
                {(Object.keys(STATUS_CONFIG) as ServiceStatus[]).map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.fundingChip, form.status === st && { backgroundColor: STATUS_CONFIG[st].bg, borderColor: STATUS_CONFIG[st].color }]}
                    onPress={() => setForm({ ...form, status: st })}
                  >
                    <Text style={[styles.fundingChipText, form.status === st && { color: STATUS_CONFIG[st].color }]}>
                      {STATUS_CONFIG[st].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Hours per Week</Text>
              <TextInput
                style={styles.input}
                value={form.hoursPerWeek}
                onChangeText={(v) => setForm({ ...form, hoursPerWeek: v })}
                placeholder="e.g., 10"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Renewal Date</Text>
              <TextInput
                style={styles.input}
                value={form.renewalDate}
                onChangeText={(v) => setForm({ ...form, renewalDate: v })}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.label}>Authorization Number</Text>
              <TextInput
                style={styles.input}
                value={form.authorizationNumber}
                onChangeText={(v) => setForm({ ...form, authorizationNumber: v })}
              />

              <Text style={styles.label}>Provider Phone</Text>
              <TextInput
                style={styles.input}
                value={form.providerPhone}
                onChangeText={(v) => setForm({ ...form, providerPhone: v })}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Provider Email</Text>
              <TextInput
                style={styles.input}
                value={form.providerEmail}
                onChangeText={(v) => setForm({ ...form, providerEmail: v })}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.notes}
                onChangeText={(v) => setForm({ ...form, notes: v })}
                multiline
                placeholder="Contact person, portal URL, etc."
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnSave]} onPress={handleSave}>
                <Text style={[styles.modalBtnText, styles.modalBtnSaveText]}>Save</Text>
              </TouchableOpacity>
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
    paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm,
    backgroundColor: COLORS.bg, ...SHADOWS.sm,
  },
  backBtn: { padding: SPACING.xs },
  backText: { fontSize: FONT_SIZES.md, color: COLORS.text },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.text },
  addBtn: { backgroundColor: COLORS.primary, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md },
  addBtnText: { color: 'white', fontWeight: 'bold' },
  scroll: { padding: SPACING.md, paddingBottom: 100 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.lg },
  statCard: {
    flex: 1, backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.sm, alignItems: 'center', borderTopWidth: 4,
  },
  statNum: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.xs },
  statLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, textAlign: 'center' },
  urgentCard: {
    backgroundColor: COLORS.warningBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warningText,
  },
  urgentIcon: { fontSize: FONT_SIZES.lg, marginRight: SPACING.md },
  urgentTitle: { color: COLORS.warningText, fontWeight: 'bold', marginBottom: 2 },
  urgentSub: { color: COLORS.warningText, fontSize: FONT_SIZES.sm },
  filterRow: { flexGrow: 0, marginBottom: SPACING.md },
  filterChip: { 
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.xl, 
    backgroundColor: COLORS.card, marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.border
  },
  filterChipOn: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  filterChipText: { color: COLORS.text, fontWeight: '500' },
  filterChipTextOn: { color: 'white' },
  emptyState: {
    alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.xl,
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, marginVertical: SPACING.md,
  },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.sm },
  emptyBody: { color: COLORS.textLight, textAlign: 'center', maxWidth: '80%', marginBottom: SPACING.lg },
  emptyBtn: { backgroundColor: COLORS.primary, paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, borderRadius: RADIUS.lg },
  emptyBtnText: { color: 'white', fontWeight: 'bold', fontSize: FONT_SIZES.md },
  serviceCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.lg, marginBottom: SPACING.md,
    ...SHADOWS.sm, borderTopWidth: 4,
  },
  serviceCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: SPACING.md },
  serviceCardLeft: { flex: 1, marginRight: SPACING.sm },
  serviceType: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.text, marginBottom: 2 },
  serviceProvider: { color: COLORS.textLight, fontSize: FONT_SIZES.sm },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: RADIUS.sm },
  statusBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: 'bold' },
  serviceCardMiddle: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  infoLabel: { color: COLORS.textLight, fontWeight: '500' },
  infoValue: { color: COLORS.text, fontWeight: '500' },
  renewalUrgent: { color: COLORS.errorText, fontWeight: 'bold' },
  notes: { padding: SPACING.md, fontStyle: 'italic', color: COLORS.textLight, borderTopWidth: 1, borderTopColor: COLORS.border },
  serviceCardBottom: { flexDirection: 'row', justifyContent: 'flex-end', padding: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  cardBtn: { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md },
  cardBtnText: { color: COLORS.primary, fontWeight: 'bold' },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: {
    backgroundColor: COLORS.card, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg, alignItems: 'center', ...SHADOWS.lg, maxHeight: '90%',
  },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', marginBottom: SPACING.lg },
  label: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.text, marginTop: SPACING.md, marginBottom: SPACING.sm },
  input: { 
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, 
    padding: SPACING.md, fontSize: FONT_SIZES.md, width: '100%', color: COLORS.text
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', marginBottom: SPACING.sm },
  typeChip: {
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card, marginRight: SPACING.sm, marginBottom: SPACING.sm, 
    borderWidth: 1, borderColor: COLORS.border
  },
  typeChipText: { color: COLORS.text, fontWeight: '500' },
  typeChipTextOn: { color: 'white' },
  fundingGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: SPACING.sm },
  fundingChip: {
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card, marginRight: SPACING.sm, marginBottom: SPACING.sm, 
    borderWidth: 1, borderColor: COLORS.border
  },
  fundingChipOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  fundingChipText: { color: COLORS.text, fontWeight: '500' },
  fundingChipTextOn: { color: 'white' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: SPACING.lg, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border },
  modalBtn: { flex: 1, padding: SPACING.md, alignItems: 'center' },
  modalBtnSave: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md },
  modalBtnText: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.primary },
  modalBtnSaveText: { color: 'white' },
});
