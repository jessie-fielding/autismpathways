/**
 * Service Scheduler (Premium)
 *
 * For each selected waiver service, parents can set:
 *  - Days of week
 *  - Start/end time
 *  - Location / provider
 *  - Notification settings (day before, hour before, 30 min before)
 */
import React, { useState, useCallback } from 'react';
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal,
  TextInput, Switch, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';
import { trackPaywallViewed } from '../../lib/analytics';

const STORAGE_KEY = 'ap_waiver_service_schedules';
const SELECTED_KEY = 'ap_waiver_services_selected';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SERVICE_NAMES: Record<string, { name: string; emoji: string }> = {
  aba: { name: 'ABA Therapy', emoji: '🧠' },
  speech: { name: 'Speech Therapy', emoji: '🗣️' },
  ot: { name: 'Occupational Therapy', emoji: '🖐️' },
  pt: { name: 'Physical Therapy', emoji: '🦵' },
  feeding: { name: 'Feeding Therapy', emoji: '🍽️' },
  behavioral: { name: 'Behavioral Support', emoji: '💬' },
  music_art: { name: 'Music / Art Therapy', emoji: '🎨' },
  personal_care: { name: 'Personal Care / PCA', emoji: '🤝' },
  respite: { name: 'Respite Care', emoji: '🏡' },
  companion: { name: 'Companion Services', emoji: '👥' },
  homemaker: { name: 'Homemaker Services', emoji: '🏠' },
  day_program: { name: 'Day Habilitation', emoji: '🏫' },
  social_skills: { name: 'Social Skills Training', emoji: '🌟' },
  community_access: { name: 'Community Access', emoji: '🚌' },
  supported_employment: { name: 'Supported Employment', emoji: '💼' },
  assistive_tech: { name: 'Assistive Technology', emoji: '📱' },
  home_mod: { name: 'Home Modifications', emoji: '🔧' },
  vehicle_mod: { name: 'Vehicle Modifications', emoji: '🚗' },
  service_coord: { name: 'Service Coordination', emoji: '📋' },
  family_training: { name: 'Family Training', emoji: '📚' },
  crisis: { name: 'Crisis Intervention', emoji: '🆘' },
};

interface ServiceSchedule {
  id: string;
  days: string[];
  startTime: string;
  endTime: string;
  location: string;
  providerName: string;
  notifyDayBefore: boolean;
  notifyHourBefore: boolean;
  notify30Min: boolean;
  notes: string;
}

const EMPTY_SCHEDULE = (id: string): ServiceSchedule => ({
  id,
  days: [],
  startTime: '',
  endTime: '',
  location: '',
  providerName: '',
  notifyDayBefore: false,
  notifyHourBefore: true,
  notify30Min: false,
  notes: '',
});

export default function ServiceSchedulerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [schedules, setSchedules] = useState<Record<string, ServiceSchedule>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ServiceSchedule | null>(null);

  useFocusEffect(useCallback(() => {
    AsyncStorage.multiGet([SELECTED_KEY, STORAGE_KEY]).then(pairs => {
      const ids: string[] = pairs[0][1] ? JSON.parse(pairs[0][1]) : [];
      setSelectedServiceIds(ids);
      const saved: Record<string, ServiceSchedule> = pairs[1][1] ? JSON.parse(pairs[1][1]) : {};
      setSchedules(saved);
    });
  }, []));

  const saveSchedule = async (schedule: ServiceSchedule) => {
    const next = { ...schedules, [schedule.id]: schedule };
    setSchedules(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const openEdit = (id: string) => {
    setDraft(schedules[id] || EMPTY_SCHEDULE(id));
    setEditingId(id);
  };

  const handleSave = async () => {
    if (!draft) return;
    await saveSchedule(draft);
    setEditingId(null);
    setDraft(null);
  };

  if (!isPremium) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Scheduler</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.dashText}>🏠 Home</Text>
        </TouchableOpacity>
        </View>
        <View style={styles.paywallContainer}>
          <Text style={styles.paywallEmoji}>🔒</Text>
          <Text style={styles.paywallTitle}>Premium Feature</Text>
          <Text style={styles.paywallBody}>
            The Service Scheduler lets you track days, times, locations, and set reminders for each of your child's waiver services.
          </Text>
          <TouchableOpacity style={styles.paywallBtn} onPress={() => (trackPaywallViewed('waiver_service_scheduler'), router.push('/paywall'))}>
            <Text style={styles.paywallBtnText}>Unlock with Premium</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (selectedServiceIds.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Scheduler</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.paywallContainer}>
          <Text style={styles.paywallEmoji}>📋</Text>
          <Text style={styles.paywallTitle}>No Services Selected</Text>
          <Text style={styles.paywallBody}>
            Go back to the Services List and check off the services you want to schedule.
          </Text>
          <TouchableOpacity style={styles.paywallBtn} onPress={() => router.back()}>
            <Text style={styles.paywallBtnText}>← Go to Services List</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Scheduler</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.introText}>
          Tap a service to set its schedule, location, and reminder notifications.
        </Text>

        {selectedServiceIds.map(id => {
          const info = SERVICE_NAMES[id] || { name: id, emoji: '📌' };
          const sched = schedules[id];
          const hasSchedule = sched && (sched.days.length > 0 || sched.startTime || sched.location);

          return (
            <TouchableOpacity key={id} style={styles.serviceCard} onPress={() => openEdit(id)} activeOpacity={0.75}>
              <View style={styles.serviceCardRow}>
                <Text style={styles.serviceEmoji}>{info.emoji}</Text>
                <View style={styles.serviceCardText}>
                  <Text style={styles.serviceCardName}>{info.name}</Text>
                  {hasSchedule ? (
                    <View style={styles.schedSummary}>
                      {sched.days.length > 0 && <Text style={styles.schedChip}>{sched.days.join(', ')}</Text>}
                      {sched.startTime ? <Text style={styles.schedChip}>{sched.startTime}{sched.endTime ? ` – ${sched.endTime}` : ''}</Text> : null}
                      {sched.location ? <Text style={styles.schedChip}>📍 {sched.location}</Text> : null}
                    </View>
                  ) : (
                    <Text style={styles.noSchedText}>Tap to add schedule</Text>
                  )}
                </View>
                <Text style={styles.editArrow}>›</Text>
              </View>
              {hasSchedule && (
                <View style={styles.notifRow}>
                  {sched.notifyDayBefore && <Text style={styles.notifChip}>🔔 Day before</Text>}
                  {sched.notifyHourBefore && <Text style={styles.notifChip}>🔔 1 hour before</Text>}
                  {sched.notify30Min && <Text style={styles.notifChip}>🔔 30 min before</Text>}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editingId !== null} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {draft && editingId && (
            <View style={[styles.modalContainer, { paddingTop: insets.top + 16 }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {SERVICE_NAMES[editingId]?.emoji} {SERVICE_NAMES[editingId]?.name || editingId}
                </Text>
                <TouchableOpacity onPress={() => { setEditingId(null); setDraft(null); }}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalScroll}>
                {/* Days */}
                <Text style={styles.fieldLabel}>Days of Week</Text>
                <View style={styles.daysRow}>
                  {DAYS.map(d => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.dayChip, draft.days.includes(d) && styles.dayChipActive]}
                      onPress={() => {
                        const days = draft.days.includes(d)
                          ? draft.days.filter(x => x !== d)
                          : [...draft.days, d];
                        setDraft({ ...draft, days });
                      }}
                    >
                      <Text style={[styles.dayChipText, draft.days.includes(d) && styles.dayChipTextActive]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Times */}
                <View style={styles.timeRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Start Time</Text>
                    <TextInput
                      style={styles.input}
                      value={draft.startTime}
                      onChangeText={v => setDraft({ ...draft, startTime: v })}
                      placeholder="e.g. 9:00 AM"
                      placeholderTextColor={COLORS.textLight}
                    />
                  </View>
                  <View style={{ width: SPACING.md }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>End Time</Text>
                    <TextInput
                      style={styles.input}
                      value={draft.endTime}
                      onChangeText={v => setDraft({ ...draft, endTime: v })}
                      placeholder="e.g. 10:00 AM"
                      placeholderTextColor={COLORS.textLight}
                    />
                  </View>
                </View>

                {/* Location */}
                <Text style={styles.fieldLabel}>Location / Clinic Name</Text>
                <TextInput
                  style={styles.input}
                  value={draft.location}
                  onChangeText={v => setDraft({ ...draft, location: v })}
                  placeholder="e.g. Sunshine Therapy Center"
                  placeholderTextColor={COLORS.textLight}
                />

                {/* Provider */}
                <Text style={styles.fieldLabel}>Provider / Therapist Name</Text>
                <TextInput
                  style={styles.input}
                  value={draft.providerName}
                  onChangeText={v => setDraft({ ...draft, providerName: v })}
                  placeholder="e.g. Dr. Sarah Kim"
                  placeholderTextColor={COLORS.textLight}
                />

                {/* Notifications */}
                <Text style={styles.fieldLabel}>Reminder Notifications</Text>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Day before</Text>
                  <Switch
                    value={draft.notifyDayBefore}
                    onValueChange={v => setDraft({ ...draft, notifyDayBefore: v })}
                    trackColor={{ false: COLORS.border, true: COLORS.lavenderAccent }}
                    thumbColor={draft.notifyDayBefore ? COLORS.purple : COLORS.white}
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>1 hour before</Text>
                  <Switch
                    value={draft.notifyHourBefore}
                    onValueChange={v => setDraft({ ...draft, notifyHourBefore: v })}
                    trackColor={{ false: COLORS.border, true: COLORS.lavenderAccent }}
                    thumbColor={draft.notifyHourBefore ? COLORS.purple : COLORS.white}
                  />
                </View>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>30 minutes before</Text>
                  <Switch
                    value={draft.notify30Min}
                    onValueChange={v => setDraft({ ...draft, notify30Min: v })}
                    trackColor={{ false: COLORS.border, true: COLORS.lavenderAccent }}
                    thumbColor={draft.notify30Min ? COLORS.purple : COLORS.white}
                  />
                </View>

                {/* Notes */}
                <Text style={styles.fieldLabel}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  value={draft.notes}
                  onChangeText={v => setDraft({ ...draft, notes: v })}
                  placeholder="Any notes about this service..."
                  placeholderTextColor={COLORS.textLight}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                  <Text style={styles.saveBtnText}>Save Schedule</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.white,
  },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  scroll: { padding: SPACING.lg, paddingBottom: 48 },
  introText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginBottom: SPACING.lg, lineHeight: 19 },
  serviceCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.md,
    marginBottom: SPACING.sm, ...SHADOWS.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  serviceCardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  serviceEmoji: { fontSize: 22, marginTop: 2 },
  serviceCardText: { flex: 1 },
  serviceCardName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  schedSummary: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  schedChip: { fontSize: FONT_SIZES.xs, color: COLORS.purple, backgroundColor: COLORS.lavender, borderRadius: RADIUS.pill, paddingHorizontal: 8, paddingVertical: 2 },
  noSchedText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontStyle: 'italic' },
  editArrow: { fontSize: 20, color: COLORS.textLight },
  notifRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: SPACING.xs, paddingLeft: 34 },
  notifChip: { fontSize: FONT_SIZES.xs, color: COLORS.infoText, backgroundColor: COLORS.infoBg, borderRadius: RADIUS.pill, paddingHorizontal: 8, paddingVertical: 2 },
  // Paywall
  paywallContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  paywallEmoji: { fontSize: 48, marginBottom: SPACING.lg },
  paywallTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm, textAlign: 'center' },
  paywallBody: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, textAlign: 'center', lineHeight: 20, marginBottom: SPACING.xl },
  paywallBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingVertical: 14, paddingHorizontal: SPACING.xl },
  paywallBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },
  // Modal
  modalContainer: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  modalClose: { fontSize: 18, color: COLORS.textLight, padding: SPACING.sm },
  modalScroll: { padding: SPACING.lg, paddingBottom: 48 },
  fieldLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs, marginTop: SPACING.md },
  daysRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  dayChip: {
    paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: RADIUS.sm,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white,
  },
  dayChipActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  dayChipText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontWeight: '600' },
  dayChipTextActive: { color: COLORS.white },
  timeRow: { flexDirection: 'row' },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.sm, color: COLORS.text, backgroundColor: COLORS.white,
  },
  notesInput: { minHeight: 72 },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  switchLabel: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  saveBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingVertical: 14,
    alignItems: 'center', marginTop: SPACING.xl,
  },
  saveBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },
});
