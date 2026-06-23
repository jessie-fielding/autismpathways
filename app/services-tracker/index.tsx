import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, TextInput, Alert, KeyboardAvoidingView, Platform,
  Linking, FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChildChanged } from '../../hooks/useChildChanged';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';
import CityCountyAutocomplete from '../../components/CityCountyAutocomplete';
import { useIsPremium } from '../../hooks/useIsPremium';
import { trackPaywallViewed, trackServicesTrackerOpened, logScreenView, useScreenTime} from '../../lib/analytics';
import {
  scheduleServiceReminders,
  cancelServiceReminders,
  nextAppointmentDate,
  ReminderOption,
} from '../../lib/serviceNotifications';

const STORAGE_KEY = 'ap_services_tracker_v2';
const FREE_SERVICES = 3;

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceStatus = 'active' | 'pending' | 'paused' | 'ended';
type ScheduleMode = 'weekly' | 'biweekly' | 'occasional';

interface Service {
  id: string;
  type: string;
  customType?: string;
  providerName: string;
  providerPhone?: string;
  providerEmail?: string;
  address?: string;
  // Schedule
  scheduleMode: ScheduleMode;
  scheduleDays: number[];    // 0=Sun … 6=Sat
  scheduleTime: string;      // "HH:MM" 24h — legacy / same-time-for-all fallback
  scheduleTimes?: Record<number, string>; // per-day times e.g. {2: '17:30', 4: '17:00'}
  scheduleDuration: string;  // e.g. "60" minutes
  occasionalDate?: string;   // "YYYY-MM-DD"
  // Reminders
  reminders: ReminderOption[];
  startingAddress?: string;  // for leave reminder
  // Admin
  hoursPerWeek?: string;
  renewalDate?: string;
  authorizationNumber?: string;
  fundingSource: string;
  status: ServiceStatus;
  notes?: string;
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICE_TYPES = [
  { value: 'ABA',           label: '🧠 ABA Therapy',         color: COLORS.lavenderAccent },
  { value: 'Speech',        label: '🗣️ Speech Therapy',       color: COLORS.blueAccent },
  { value: 'OT',            label: '🖐️ Occupational Therapy', color: COLORS.mintAccent },
  { value: 'PT',            label: '🦵 Physical Therapy',     color: COLORS.peachAccent },
  { value: 'Feeding',       label: '🍽️ Feeding Therapy',      color: COLORS.yellowAccent },
  { value: 'Behavioral',    label: '💬 Behavioral Support',   color: COLORS.lavenderAccent },
  { value: 'Personal Care', label: '🤝 Personal Care / PCA', color: COLORS.mintAccent },
  { value: 'Respite',       label: '🏡 Respite Care',         color: COLORS.peachAccent },
  { value: 'Social Skills', label: '👥 Social Skills Group',  color: COLORS.blueAccent },
  { value: 'Music/Art',     label: '🎨 Music / Art Therapy',  color: COLORS.yellowAccent },
  { value: 'Vision',        label: '👁️ Vision Therapy',       color: COLORS.blueAccent },
  { value: 'Other',         label: '➕ Other',                color: COLORS.border },
];

const FUNDING_SOURCES = ['Medicaid', 'Waiver', 'Insurance', 'School / IEP', 'Private Pay', 'Other'];

const STATUS_CONFIG: Record<ServiceStatus, { label: string; color: string; bg: string }> = {
  active:  { label: 'Active',   color: COLORS.successText, bg: COLORS.successBg },
  pending: { label: 'Pending',  color: COLORS.infoText,    bg: COLORS.infoBg },
  paused:  { label: 'Paused',   color: COLORS.warningText, bg: COLORS.warningBg },
  ended:   { label: 'Ended',    color: COLORS.textLight,   bg: COLORS.border },
};

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_FULL   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const REMINDER_OPTIONS: { key: ReminderOption; label: string; icon: string }[] = [
  { key: '1day',  label: '1 day before',    icon: '📅' },
  { key: '1hour', label: '1 hour before',   icon: '⏰' },
  { key: '30min', label: '30 min before',   icon: '⏱️' },
  { key: 'leave', label: 'Alert to leave',  icon: '🚗' },
];

const DURATION_OPTIONS = ['30 min', '45 min', '1 hr', '1.5 hrs', '2 hrs', '2.5 hrs', '3 hrs'];

const EMPTY_FORM: Omit<Service, 'id' | 'createdAt'> = {
  type: 'ABA',
  providerName: '',
  providerPhone: '',
  providerEmail: '',
  address: '',
  scheduleMode: 'weekly',
  scheduleDays: [],
  scheduleTime: '09:00',
  scheduleTimes: {},
  scheduleDuration: '60',
  occasionalDate: '',
  reminders: [],
  startingAddress: '',
  hoursPerWeek: '',
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
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

function formatDisplayTime(time24: string): string {
  if (!time24 || !time24.includes(':')) return '';
  const parts = time24.split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return '';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatDuration(mins: string): string {
  const n = parseInt(mins, 10);
  if (!n) return '';
  if (n < 60) return `${n} min`;
  const h = Math.floor(n / 60);
  const rem = n % 60;
  return rem ? `${h}h ${rem}m` : `${h} hr${h > 1 ? 's' : ''}`;
}

function typeInfo(type: string) {
  return SERVICE_TYPES.find((t) => t.value === type) ?? SERVICE_TYPES[SERVICE_TYPES.length - 1];
}

function todayDotDays(services: Service[]): Set<number> {
  const today = new Date().getDay();
  const set = new Set<number>();
  services.forEach((s) => {
    if (s.status !== 'active') return;
    if (s.scheduleMode === 'weekly' || s.scheduleMode === 'biweekly') {
      if (s.scheduleDays.includes(today)) set.add(today);
    }
  });
  return set;
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ServicesTrackerScreen() {
  useScreenTime('services_tracker');
  useEffect(() => { logScreenView('services_tracker'); trackServicesTrackerOpened(); }, []);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();

  const [services, setServices] = useState<Service[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Service, 'id' | 'createdAt'>>(EMPTY_FORM);
  const [filterStatus, setFilterStatus] = useState<ServiceStatus | 'all'>('all');
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<number | 'global'>('global'); // dow or 'global'
  const [saving, setSaving] = useState(false);

  // ── Data ──
  const loadData = useCallback(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      setServices(raw ? JSON.parse(raw) : []);
    });
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));
  useChildChanged(() => { loadData(); });

  const persist = async (updated: Service[]) => {
    setServices(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // ── Open/close modal ──
  const openAdd = () => {
    if (!isPremium && services.length >= FREE_SERVICES) {
      (trackPaywallViewed('services_tracker'), router.push('/paywall' as any));
      return;
    }
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  };

  const openEdit = (s: Service) => {
    setEditingId(s.id);
    setForm({
      type: s.type, customType: s.customType,
      providerName: s.providerName, providerPhone: s.providerPhone,
      providerEmail: s.providerEmail, address: s.address ?? '',
      scheduleMode: s.scheduleMode ?? 'weekly',
      scheduleDays: s.scheduleDays ?? [],
      scheduleTime: s.scheduleTime ?? '09:00',
      scheduleTimes: s.scheduleTimes ?? {},
      scheduleDuration: s.scheduleDuration ?? '60',
      occasionalDate: s.occasionalDate ?? '',
      reminders: s.reminders ?? [],
      startingAddress: s.startingAddress ?? '',
      hoursPerWeek: s.hoursPerWeek, renewalDate: s.renewalDate,
      authorizationNumber: s.authorizationNumber,
      fundingSource: s.fundingSource, status: s.status, notes: s.notes,
    });
    setModalVisible(true);
  };

  // ── Save ──
  const handleSave = async () => {
    if (!form.providerName.trim()) {
      Alert.alert('Required', 'Please enter a provider name.');
      return;
    }
    setSaving(true);
    try {
      let updated: Service[];
      const id = editingId ?? `svc_${Date.now()}`;
      const entry: Service = { ...form, id, createdAt: editingId ? (services.find((s) => s.id === editingId)?.createdAt ?? new Date().toISOString()) : new Date().toISOString() };

      if (editingId) {
        updated = services.map((s) => s.id === editingId ? entry : s);
      } else {
        updated = [entry, ...services];
      }
      await persist(updated);

      // Schedule notifications for active services with reminders
      if (entry.status === 'active' && entry.reminders.length > 0) {
        const nextDate = nextAppointmentDate(
          entry.scheduleMode,
          entry.scheduleDays,
          entry.scheduleTime,
          entry.occasionalDate,
        );
        if (nextDate) {
          const label = entry.type === 'Other' && entry.customType
            ? entry.customType
            : (typeInfo(entry.type).label.replace(/^[^\s]+ /, ''));
          await scheduleServiceReminders({
            serviceId: id,
            serviceName: `${label} – ${entry.providerName}`,
            serviceAddress: entry.address,
            startingAddress: entry.startingAddress,
            appointmentDate: nextDate,
            reminders: entry.reminders,
          });
        }
      } else {
        await cancelServiceReminders(id);
      }

      setModalVisible(false);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = (id: string) => {
    Alert.alert('Remove Service', 'Remove this service from your tracker?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        await cancelServiceReminders(id);
        await persist(services.filter((s) => s.id !== id));
      }},
    ]);
  };

  // ── Derived ──
  const filtered = filterStatus === 'all' ? services : services.filter((s) => s.status === filterStatus);
  const activeCount = services.filter((s) => s.status === 'active').length;
  const totalHours = services
    .filter((s) => s.status === 'active' && s.hoursPerWeek)
    .reduce((sum, s) => sum + parseFloat(s.hoursPerWeek || '0'), 0);
  const urgentRenewals = services.filter((s) => {
    const d = daysUntil(s.renewalDate);
    return d !== null && d <= 30 && d >= 0;
  });

  // Week strip dots
  const dotDays = useMemo(() => todayDotDays(services), [services]);
  const today = new Date();
  const todayDow = today.getDay();

  // Week strip: Mon–Sun starting from this week's Monday
  const weekDays = useMemo(() => {
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, []);

  // Dots per weekday (Mon=0 in strip, but Sun=0 in JS)
  const weekDotMap = useMemo(() => {
    const map: Record<number, string[]> = {};
    services.forEach((s) => {
      if (s.status !== 'active') return;
      const info = typeInfo(s.type);
      if (s.scheduleMode === 'weekly' || s.scheduleMode === 'biweekly') {
        s.scheduleDays.forEach((dow) => {
          if (!map[dow]) map[dow] = [];
          map[dow].push(info.color);
        });
      }
    });
    return map;
  }, [services]);

  // ── Form helpers ──
  const toggleDay = (dow: number) => {
    const days = form.scheduleDays.includes(dow)
      ? form.scheduleDays.filter((d) => d !== dow)
      : [...form.scheduleDays, dow];
    // Remove per-day time if day is deselected
    const newTimes = { ...(form.scheduleTimes ?? {}) };
    if (form.scheduleDays.includes(dow)) delete newTimes[dow];
    setForm({ ...form, scheduleDays: days, scheduleTimes: newTimes });
  };

  const toggleReminder = (key: ReminderOption) => {
    const reminders = form.reminders.includes(key)
      ? form.reminders.filter((r) => r !== key)
      : [...form.reminders, key];
    setForm({ ...form, reminders });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Services Tracker</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* This Week strip */}
        <View style={s.weekCard}>
          <Text style={s.weekTitle}>This Week</Text>
          <View style={s.weekRow}>
            {weekDays.map((d, i) => {
              const dow = d.getDay();
              const isToday = d.toDateString() === today.toDateString();
              const dots = weekDotMap[dow] ?? [];
              return (
                <View key={i} style={s.weekDayCol}>
                  <Text style={[s.weekDayLabel, isToday && s.weekDayLabelToday]}>
                    {['M','T','W','T','F','S','S'][i]}
                  </Text>
                  <View style={[s.weekDayCircle, isToday && s.weekDayCircleToday]}>
                    <Text style={[s.weekDayNum, isToday && s.weekDayNumToday]}>{d.getDate()}</Text>
                  </View>
                  <View style={s.weekDotRow}>
                    {dots.slice(0, 3).map((c, di) => (
                      <View key={di} style={[s.weekDot, { backgroundColor: c }]} />
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={[s.statCard, { borderTopColor: COLORS.mintAccent }]}>
            <Text style={s.statNum}>{activeCount}</Text>
            <Text style={s.statLabel}>Active</Text>
          </View>
          <View style={[s.statCard, { borderTopColor: COLORS.blueAccent }]}>
            <Text style={s.statNum}>{totalHours > 0 ? `${totalHours}h` : '—'}</Text>
            <Text style={s.statLabel}>Hrs / Week</Text>
          </View>
          <View style={[s.statCard, { borderTopColor: urgentRenewals.length > 0 ? COLORS.peachAccent : COLORS.yellowAccent }]}>
            <Text style={[s.statNum, urgentRenewals.length > 0 && { color: COLORS.errorText }]}>
              {urgentRenewals.length}
            </Text>
            <Text style={s.statLabel}>Renewals Due</Text>
          </View>
        </View>

        {/* Free tier nudge */}
        {!isPremium && services.length >= FREE_SERVICES - 1 && (
          <View style={s.upgradeNudge}>
            <Text style={s.upgradeNudgeText}>
              {services.length >= FREE_SERVICES
                ? `You're tracking ${services.length} services — most families have 6+. Upgrade to track them all. 💜`
                : `1 service slot left on the free plan — most families have 6+ services.`}
            </Text>
            <TouchableOpacity onPress={() => (trackPaywallViewed('services_tracker'), router.push('/paywall' as any))} style={s.upgradeBtn}>
              <Text style={s.upgradeBtnText}>Upgrade for unlimited →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Urgent renewal alerts */}
        {urgentRenewals.map((svc) => {
          const d = daysUntil(svc.renewalDate)!;
          return (
            <View key={svc.id} style={s.urgentCard}>
              <Text style={s.urgentIcon}>⚠️</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.urgentTitle}>{svc.type} renewal in {d} day{d !== 1 ? 's' : ''}</Text>
                <Text style={s.urgentSub}>{svc.providerName} · Auth #{svc.authorizationNumber || 'N/A'}</Text>
              </View>
            </View>
          );
        })}

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
          {(['all', 'active', 'pending', 'paused', 'ended'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[s.filterChip, filterStatus === f && s.filterChipOn]}
              onPress={() => setFilterStatus(f)}
            >
              <Text style={[s.filterChipText, filterStatus === f && s.filterChipTextOn]}>
                {f === 'all' ? `All (${services.length})` : `${STATUS_CONFIG[f as ServiceStatus].label} (${services.filter((sv) => sv.status === f).length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Empty state */}
        {filtered.length === 0 && (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🗂️</Text>
            <Text style={s.emptyTitle}>No services tracked yet</Text>
            <Text style={s.emptyBody}>Add therapies and support services to track schedules, providers, and renewal dates.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={openAdd}>
              <Text style={s.emptyBtnText}>+ Add First Service</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Service cards */}
        {filtered.map((svc) => {
          const info = typeInfo(svc.type);
          const renewal = daysUntil(svc.renewalDate);
          const statusCfg = STATUS_CONFIG[svc.status];
          const displayName = svc.type === 'Other' && svc.customType ? svc.customType : info.label;

          return (
            <View key={svc.id} style={[s.serviceCard, { borderLeftColor: info.color }]}>
              {/* Top row */}
              <View style={s.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardType}>{displayName}</Text>
                  <Text style={s.cardProvider}>{svc.providerName}</Text>
                </View>
                <View style={[s.statusBadge, { backgroundColor: statusCfg.bg }]}>
                  <Text style={[s.statusBadgeText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                </View>
              </View>

              {/* Schedule row */}
              {(svc.scheduleMode === 'weekly' || svc.scheduleMode === 'biweekly') && svc.scheduleDays.length > 0 && (
                <View style={s.scheduleRow}>
                  <View style={s.dayPillsRow}>
                    {[0,1,2,3,4,5,6].map((dow) => {
                      const active = svc.scheduleDays.includes(dow);
                      return (
                        <View key={dow} style={[s.dayPill, active && { backgroundColor: info.color }]}>
                          <Text style={[s.dayPillText, active && s.dayPillTextOn]}>{DAY_LABELS[dow]}</Text>
                        </View>
                      );
                    })}
                  </View>
                  <Text style={s.scheduleTime}>
                    {formatDisplayTime(svc.scheduleTime)}
                    {svc.scheduleDuration ? ` · ${formatDuration(svc.scheduleDuration)}` : ''}
                    {svc.scheduleMode === 'biweekly' ? ' · Biweekly' : ''}
                  </Text>
                </View>
              )}
              {svc.scheduleMode === 'occasional' && svc.occasionalDate && (
                <View style={s.scheduleRow}>
                  <View style={[s.occasionalBadge]}>
                    <Text style={s.occasionalBadgeText}>Occasional</Text>
                  </View>
                  <Text style={s.scheduleTime}>
                    Next: {svc.occasionalDate}
                    {svc.scheduleTime ? ` at ${formatDisplayTime(svc.scheduleTime)}` : ''}
                  </Text>
                </View>
              )}

              {/* Address */}
              {svc.address ? (
                <TouchableOpacity
                  style={s.addressRow}
                  onPress={() => Linking.openURL(`https://maps.apple.com/?q=${encodeURIComponent(svc.address!)}`)}
                >
                  <Text style={s.addressText}>📍 {svc.address}</Text>
                </TouchableOpacity>
              ) : null}

              {/* Meta row */}
              <View style={s.metaRow}>
                <Text style={s.metaText}>{svc.fundingSource}</Text>
                {svc.authorizationNumber ? <Text style={s.metaText}>· Auth #{svc.authorizationNumber}</Text> : null}
                {renewal !== null ? (
                  <Text style={[s.metaText, renewal <= 30 && { color: COLORS.errorText, fontWeight: '700' }]}>
                    · Renews {svc.renewalDate} ({renewal}d)
                  </Text>
                ) : null}
                {svc.reminders.length > 0 ? (
                  <Text style={s.metaText}>· 🔔 {svc.reminders.length} reminder{svc.reminders.length > 1 ? 's' : ''}</Text>
                ) : null}
              </View>

              {svc.notes ? <Text style={s.notes}>{svc.notes}</Text> : null}

              {/* Actions */}
              <View style={s.cardActions}>
                <TouchableOpacity onPress={() => handleDelete(svc.id)} style={s.cardActionBtn}>
                  <Text style={[s.cardActionText, { color: COLORS.errorText }]}>Remove</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openEdit(svc)} style={[s.cardActionBtn, s.editBtn]}>
                  <Text style={[s.cardActionText, { color: COLORS.purple }]}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={[s.fab, { bottom: insets.bottom + 24 }]} onPress={openAdd} activeOpacity={0.85}>
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>

      {/* ── Add / Edit Modal ── */}
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.modalBackdrop}>
          <View style={[s.modalSheet, { paddingBottom: insets.bottom + SPACING.md }]}>
            {/* Handle + title */}
            <View style={s.modalHandle} />
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{editingId ? 'Edit Service' : 'Add Service'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={s.modalCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

              {/* Service Type */}
              <Text style={s.sectionLabel}>Service Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.typeScroll}>
                {SERVICE_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    style={[s.typeChip, form.type === t.value && { backgroundColor: t.color, borderColor: t.color }]}
                    onPress={() => setForm({ ...form, type: t.value })}
                  >
                    <Text style={[s.typeChipText, form.type === t.value && s.typeChipTextOn]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {form.type === 'Other' && (
                <>
                  <Text style={s.fieldLabel}>Custom Service Name</Text>
                  <TextInput style={s.input} value={form.customType} onChangeText={(v) => setForm({ ...form, customType: v })} placeholder="e.g., Hippotherapy" placeholderTextColor={COLORS.textLight} />
                </>
              )}

              {/* Provider */}
              <Text style={s.fieldLabel}>Provider Name *</Text>
              <TextInput style={s.input} value={form.providerName} onChangeText={(v) => setForm({ ...form, providerName: v })} placeholder="e.g., Bright Futures ABA" placeholderTextColor={COLORS.textLight} />

              <Text style={s.fieldLabel}>Address / City</Text>
              <CityCountyAutocomplete
                value={form.address ?? ''}
                onChangeText={(v) => setForm({ ...form, address: v })}
                onSelect={({ address, city, state }) => setForm({ ...form, address: address || `${city}, ${state}` })}
                placeholder="e.g. Columbus, OH or 123 Main St"
              />

              <View style={s.twoCol}>
                <View style={{ flex: 1 }}>
                  <Text style={s.fieldLabel}>Phone</Text>
                  <TextInput style={s.input} value={form.providerPhone} onChangeText={(v) => setForm({ ...form, providerPhone: v })} keyboardType="phone-pad" placeholderTextColor={COLORS.textLight} placeholder="(555) 000-0000" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.fieldLabel}>Email</Text>
                  <TextInput style={s.input} value={form.providerEmail} onChangeText={(v) => setForm({ ...form, providerEmail: v })} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={COLORS.textLight} placeholder="provider@email.com" />
                </View>
              </View>

              {/* Funding */}
              <Text style={s.sectionLabel}>Funding Source</Text>
              <View style={s.chipGrid}>
                {FUNDING_SOURCES.map((fs) => (
                  <TouchableOpacity key={fs} style={[s.chip, form.fundingSource === fs && s.chipOn]} onPress={() => setForm({ ...form, fundingSource: fs })}>
                    <Text style={[s.chipText, form.fundingSource === fs && s.chipTextOn]}>{fs}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Status */}
              <Text style={s.sectionLabel}>Status</Text>
              <View style={s.chipGrid}>
                {(Object.keys(STATUS_CONFIG) as ServiceStatus[]).map((st) => (
                  <TouchableOpacity key={st} style={[s.chip, form.status === st && { backgroundColor: STATUS_CONFIG[st].bg, borderColor: STATUS_CONFIG[st].color }]} onPress={() => setForm({ ...form, status: st })}>
                    <Text style={[s.chipText, form.status === st && { color: STATUS_CONFIG[st].color }]}>{STATUS_CONFIG[st].label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ── Schedule ── */}
              <Text style={s.sectionLabel}>📅 Schedule</Text>
              <View style={s.chipGrid}>
                {(['weekly', 'biweekly', 'occasional'] as ScheduleMode[]).map((m) => (
                  <TouchableOpacity key={m} style={[s.chip, form.scheduleMode === m && s.chipOn]} onPress={() => setForm({ ...form, scheduleMode: m })}>
                    <Text style={[s.chipText, form.scheduleMode === m && s.chipTextOn]}>
                      {m === 'weekly' ? 'Weekly' : m === 'biweekly' ? 'Biweekly' : 'Occasional'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {(form.scheduleMode === 'weekly' || form.scheduleMode === 'biweekly') && (
                <>
                  <Text style={s.fieldLabel}>Days</Text>
                  <View style={s.dayPickerRow}>
                    {[0,1,2,3,4,5,6].map((dow) => {
                      const on = form.scheduleDays.includes(dow);
                      const info = typeInfo(form.type);
                      return (
                        <TouchableOpacity key={dow} style={[s.dayPickerCircle, on && { backgroundColor: info.color, borderColor: info.color }]} onPress={() => toggleDay(dow)}>
                          <Text style={[s.dayPickerText, on && s.dayPickerTextOn]}>{DAY_LABELS[dow]}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              {form.scheduleMode === 'occasional' && (
                <>
                  <Text style={s.fieldLabel}>Date (YYYY-MM-DD)</Text>
                  <TextInput style={s.input} value={form.occasionalDate} onChangeText={(v) => setForm({ ...form, occasionalDate: v })} placeholder="e.g., 2025-06-20" placeholderTextColor={COLORS.textLight} />
                </>
              )}

              {/* Per-day times when multiple days selected */}
              {form.scheduleDays.length > 1 ? (
                <>
                  <Text style={s.fieldLabel}>Start Times per Day</Text>
                  <Text style={[s.fieldLabel, { fontWeight: '400', marginBottom: SPACING.sm }]}>Each day can have a different time</Text>
                  {form.scheduleDays.slice().sort((a, b) => a - b).map((dow) => (
                    <View key={dow} style={[s.twoCol, { marginBottom: SPACING.sm }]}>
                      <Text style={[s.fieldLabel, { width: 44, marginBottom: 0, alignSelf: 'center' }]}>{DAY_FULL[dow]}</Text>
                      <TouchableOpacity
                        style={[s.input, s.pickerBtn, { flex: 1 }]}
                        onPress={() => { setTimePickerTarget(dow); setShowTimePicker(true); }}
                      >
                        <Text style={s.pickerBtnText}>
                          {formatDisplayTime((form.scheduleTimes ?? {})[dow] ?? form.scheduleTime) || 'Pick time'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <View style={{ marginTop: SPACING.xs }}>
                    <Text style={s.fieldLabel}>Duration</Text>
                    <TouchableOpacity style={[s.input, s.pickerBtn]} onPress={() => setShowDurationPicker(true)}>
                      <Text style={s.pickerBtnText}>{form.scheduleDuration ? formatDuration(form.scheduleDuration) : 'Select...'}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={s.twoCol}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.fieldLabel}>Start Time</Text>
                    <TouchableOpacity
                      style={[s.input, s.pickerBtn]}
                      onPress={() => { setTimePickerTarget('global'); setShowTimePicker(true); }}
                    >
                      <Text style={s.pickerBtnText}>
                        {formatDisplayTime(form.scheduleTime) || 'Pick time'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.fieldLabel}>Duration</Text>
                    <TouchableOpacity style={[s.input, s.pickerBtn]} onPress={() => setShowDurationPicker(true)}>
                      <Text style={s.pickerBtnText}>{form.scheduleDuration ? formatDuration(form.scheduleDuration) : 'Select...'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* ── Reminders ── */}
              <Text style={s.sectionLabel}>🔔 Reminders</Text>
              <View style={s.chipGrid}>
                {REMINDER_OPTIONS.map((r) => (
                  <TouchableOpacity key={r.key} style={[s.chip, form.reminders.includes(r.key) && s.chipOn]} onPress={() => toggleReminder(r.key)}>
                    <Text style={[s.chipText, form.reminders.includes(r.key) && s.chipTextOn]}>{r.icon} {r.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {form.reminders.includes('leave') && (
                <View style={s.leaveBox}>
                  <Text style={s.leaveBoxTitle}>🚗 Leave Reminder Setup</Text>
                  <Text style={s.leaveBoxSub}>We'll calculate your drive time and alert you when it's time to leave. Enter your starting address below.</Text>
                  <Text style={s.fieldLabel}>Your Starting Address</Text>
                  <CityCountyAutocomplete
                    value={form.startingAddress ?? ''}
                    onChangeText={(v) => setForm({ ...form, startingAddress: v })}
                    onSelect={({ address, city, state }) => setForm({ ...form, startingAddress: address || `${city}, ${state}` })}
                    placeholder="e.g., 456 Oak Ave, Denver CO 80204"
                  />
                  <Text style={s.leaveBoxNote}>
                    Stored only on your device. Used once to estimate drive time when saving.
                  </Text>
                </View>
              )}

              {/* Admin fields */}
              <Text style={s.sectionLabel}>Admin Details</Text>
              <View style={s.twoCol}>
                <View style={{ flex: 1 }}>
                  <Text style={s.fieldLabel}>Hours / Week</Text>
                  <TextInput style={s.input} value={form.hoursPerWeek} onChangeText={(v) => setForm({ ...form, hoursPerWeek: v })} keyboardType="numeric" placeholder="e.g., 10" placeholderTextColor={COLORS.textLight} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.fieldLabel}>Auth #</Text>
                  <TextInput style={s.input} value={form.authorizationNumber} onChangeText={(v) => setForm({ ...form, authorizationNumber: v })} placeholderTextColor={COLORS.textLight} placeholder="Optional" />
                </View>
              </View>

              <Text style={s.fieldLabel}>Renewal Date (YYYY-MM-DD)</Text>
              <TextInput style={s.input} value={form.renewalDate} onChangeText={(v) => setForm({ ...form, renewalDate: v })} placeholder="e.g., 2025-12-31" placeholderTextColor={COLORS.textLight} />

              <Text style={s.fieldLabel}>Notes</Text>
              <TextInput style={[s.input, s.textArea]} value={form.notes} onChangeText={(v) => setForm({ ...form, notes: v })} multiline placeholder="Contact person, portal URL, etc." placeholderTextColor={COLORS.textLight} />

              <View style={{ height: SPACING.md }} />
            </ScrollView>

            <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
              <Text style={s.saveBtnText}>{saving ? 'Saving…' : 'Save Service'}</Text>
            </TouchableOpacity>

            {/* ── Duration picker inline sheet — rendered INSIDE form modal so iOS shows it ── */}
            {showDurationPicker && (
              <TouchableOpacity style={s.inlinePickerBackdrop} onPress={() => setShowDurationPicker(false)} activeOpacity={1}>
                <View style={s.inlinePickerSheet}>
                  <Text style={s.durationTitle}>Select Duration</Text>
                  {DURATION_OPTIONS.map((opt) => {
                    const mins = opt.includes('hr')
                      ? (parseFloat(opt) * 60).toString()
                      : opt.replace(' min', '');
                    return (
                      <TouchableOpacity key={opt} style={[s.durationOption, form.scheduleDuration === mins && s.durationOptionOn]} onPress={() => { setForm({ ...form, scheduleDuration: mins }); setShowDurationPicker(false); }}>
                        <Text style={[s.durationOptionText, form.scheduleDuration === mins && s.durationOptionTextOn]}>{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </TouchableOpacity>
            )}

            {/* ── Time picker inline sheet — rendered INSIDE form modal so iOS shows it ── */}
            {showTimePicker && (
              <TouchableOpacity style={s.inlinePickerBackdrop} onPress={() => setShowTimePicker(false)} activeOpacity={1}>
                <View style={[s.inlinePickerSheet, { maxHeight: 400 }]}>
                  <View style={s.durationHandle} />
                  <Text style={s.durationTitle}>Select Time</Text>
                  <FlatList
                    data={['6:00 AM','6:30 AM','7:00 AM','7:30 AM','8:00 AM','8:30 AM','9:00 AM','9:30 AM',
                      '10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM',
                      '1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM',
                      '4:00 PM','4:30 PM','5:00 PM','5:30 PM','6:00 PM','6:30 PM',
                      '7:00 PM','7:30 PM','8:00 PM']}
                    keyExtractor={(item) => item}
                    showsVerticalScrollIndicator
                    keyboardShouldPersistTaps="always"
                    style={{ width: '100%' }}
                    renderItem={({ item: label }) => {
                      const [timePart, ampm] = label.split(' ');
                      const [hStr, mStr] = timePart.split(':');
                      let h24 = parseInt(hStr, 10);
                      const m24 = parseInt(mStr, 10);
                      if (ampm === 'PM' && h24 !== 12) h24 += 12;
                      if (ampm === 'AM' && h24 === 12) h24 = 0;
                      const val24 = `${String(h24).padStart(2,'0')}:${String(m24).padStart(2,'0')}`;
                      const currentVal = timePickerTarget === 'global'
                        ? form.scheduleTime
                        : ((form.scheduleTimes ?? {})[timePickerTarget as number] ?? form.scheduleTime);
                      const isSelected = currentVal === val24;
                      return (
                        <TouchableOpacity
                          style={[s.durationOption, isSelected && s.durationOptionOn]}
                          onPress={() => {
                            if (timePickerTarget === 'global') {
                              setForm(prev => ({ ...prev, scheduleTime: val24 }));
                            } else {
                              setForm(prev => ({ ...prev, scheduleTimes: { ...(prev.scheduleTimes ?? {}), [timePickerTarget as number]: val24 } }));
                            }
                            setShowTimePicker(false);
                          }}
                        >
                          <Text style={[s.durationOptionText, isSelected && s.durationOptionTextOn]}>{label}</Text>
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: FONT_SIZES.md, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md },

  // Week strip
  weekCard: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  weekTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.purple, marginBottom: SPACING.sm },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekDayCol: { alignItems: 'center', flex: 1 },
  weekDayLabel: { fontSize: 11, color: COLORS.textLight, fontWeight: '600', marginBottom: 4 },
  weekDayLabelToday: { color: COLORS.purple },
  weekDayCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  weekDayCircleToday: { backgroundColor: COLORS.purple },
  weekDayNum: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '500' },
  weekDayNumToday: { color: '#fff', fontWeight: '700' },
  weekDotRow: { flexDirection: 'row', gap: 2, marginTop: 3, height: 7 },
  weekDot: { width: 6, height: 6, borderRadius: 3 },

  // Stats
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  statCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md,
    alignItems: 'center', borderTopWidth: 4, ...SHADOWS.sm,
  },
  statNum: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, textAlign: 'center' },

  // Nudge
  upgradeNudge: {
    backgroundColor: '#F3F0FF', borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: '#E0D7FF',
  },
  upgradeNudgeText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, textAlign: 'center', marginBottom: 6 },
  upgradeBtn: { alignSelf: 'center' },
  upgradeBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '700', textDecorationLine: 'underline' },

  // Urgent
  urgentCard: {
    backgroundColor: COLORS.warningBg, borderRadius: RADIUS.lg, padding: SPACING.md,
    flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm,
    borderLeftWidth: 4, borderLeftColor: COLORS.warningText, gap: SPACING.sm,
  },
  urgentIcon: { fontSize: 20 },
  urgentTitle: { color: COLORS.warningText, fontWeight: '700', fontSize: FONT_SIZES.sm },
  urgentSub: { color: COLORS.warningText, fontSize: FONT_SIZES.xs },

  // Filter chips
  filterScroll: { flexGrow: 0, marginBottom: SPACING.md },
  filterChip: {
    paddingVertical: 7, paddingHorizontal: SPACING.md, borderRadius: RADIUS.pill,
    backgroundColor: COLORS.white, marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  filterChipOn: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  filterChipText: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '500' },
  filterChipTextOn: { color: '#fff' },

  // Empty
  emptyState: {
    alignItems: 'center', paddingVertical: SPACING.xl * 2,
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, marginTop: SPACING.md,
  },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  emptyBody: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, textAlign: 'center', maxWidth: '80%', marginBottom: SPACING.lg, lineHeight: 20 },
  emptyBtn: { backgroundColor: COLORS.purple, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, borderRadius: RADIUS.lg },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.md },

  // Service card
  serviceCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, marginBottom: SPACING.md,
    borderLeftWidth: 5, ...SHADOWS.sm, overflow: 'hidden',
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', padding: SPACING.md, paddingBottom: SPACING.sm },
  cardType: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  cardProvider: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginTop: 2 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: RADIUS.pill },
  statusBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },

  scheduleRow: {
    paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm,
    borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm,
  },
  dayPillsRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  dayPill: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bg,
  },
  dayPillText: { fontSize: 11, fontWeight: '700', color: COLORS.textLight },
  dayPillTextOn: { color: COLORS.white },
  scheduleTime: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, fontWeight: '500' },
  occasionalBadge: {
    alignSelf: 'flex-start', backgroundColor: COLORS.yellow, borderRadius: RADIUS.pill,
    paddingHorizontal: 10, paddingVertical: 3, marginBottom: 4,
  },
  occasionalBadgeText: { fontSize: 11, fontWeight: '700', color: '#7A6020' },

  addressRow: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  addressText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '500' },

  metaRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 4,
    paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm,
    borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm,
  },
  metaText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },

  notes: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm, fontStyle: 'italic', color: COLORS.textLight, fontSize: FONT_SIZES.sm },

  cardActions: {
    flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.sm,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  cardActionBtn: { paddingVertical: 6, paddingHorizontal: SPACING.md },
  editBtn: { backgroundColor: COLORS.lavender, borderRadius: RADIUS.sm },
  cardActionText: { fontSize: FONT_SIZES.sm, fontWeight: '700' },

  // FAB
  fab: {
    position: 'absolute', right: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.purple, alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.md,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 32 },

  // Modal
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  modalSheet: {
    backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg,
    padding: SPACING.lg, maxHeight: '92%', alignItems: 'center',
    position: 'relative', overflow: 'hidden',
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, marginBottom: SPACING.md },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: SPACING.md },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  modalCancel: { fontSize: FONT_SIZES.md, color: COLORS.purple, fontWeight: '600' },

  sectionLabel: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  fieldLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textMid, marginTop: SPACING.md, marginBottom: 6 },

  input: {
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.sm, padding: SPACING.md, fontSize: FONT_SIZES.sm,
    color: COLORS.text, width: '100%',
  },
  textArea: { minHeight: 72, textAlignVertical: 'top' },
  twoCol: { flexDirection: 'row', gap: SPACING.sm },

  typeScroll: { flexGrow: 0, marginBottom: SPACING.sm },
  typeChip: {
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADIUS.lg,
    backgroundColor: COLORS.white, marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  typeChipText: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '500' },
  typeChipTextOn: { color: COLORS.white },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm },
  chip: {
    paddingVertical: 7, paddingHorizontal: SPACING.md, borderRadius: RADIUS.pill,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
  },
  chipOn: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  chipText: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '500' },
  chipTextOn: { color: '#fff' },

  dayPickerRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.sm },
  dayPickerCircle: {
    width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bg,
  },
  dayPickerText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textLight },
  dayPickerTextOn: { color: COLORS.white },

  pickerBtn: { justifyContent: 'center' },
  pickerBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.text },

  leaveBox: {
    backgroundColor: '#EEF6FF', borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: '#BFDBFE', marginTop: SPACING.sm,
  },
  leaveBoxTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#1E40AF', marginBottom: 4 },
  leaveBoxSub: { fontSize: FONT_SIZES.xs, color: '#1E40AF', marginBottom: SPACING.sm, lineHeight: 18 },
  leaveBoxNote: { fontSize: FONT_SIZES.xs, color: '#6B7280', marginTop: 6, fontStyle: 'italic' },

  saveBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.lg, paddingVertical: 16,
    alignItems: 'center', width: '100%', marginTop: SPACING.md,
  },
  saveBtnText: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '700' },

  // Duration / Time picker — inline sheets rendered inside form modal (iOS requires this)
  inlinePickerBackdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  inlinePickerSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: SPACING.lg,
    paddingBottom: 32,
    ...SHADOWS.lg,
  },
  durationTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md, textAlign: 'center' },
  durationHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: SPACING.sm },
  durationOption: { paddingVertical: 12, paddingHorizontal: SPACING.md, borderRadius: RADIUS.sm, marginBottom: 4 },
  durationOptionOn: { backgroundColor: COLORS.lavender },
  durationOptionText: { fontSize: FONT_SIZES.md, color: COLORS.text, textAlign: 'center' },
  durationOptionTextOn: { color: COLORS.purple, fontWeight: '700' },
});
