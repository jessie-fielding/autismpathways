import React, { useState, useCallback } from 'react';
import {
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useActiveChild } from '../../services/childManager';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';

const TRACKER_KEY = 'ap_waiver_tracker';

interface TrackerData {
  applicationDate: string;
  agencyName: string;
  confirmationNumber: string;
  lastCheckIn: string;
  notes: string;
  checkIns: { date: string; note: string }[];
}

const EMPTY: TrackerData = {
  applicationDate: '',
  agencyName: '',
  confirmationNumber: '',
  lastCheckIn: '',
  notes: '',
  checkIns: [],
};

export default function WaiverTrackerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { key: childKey } = useActiveChild();
  const [data, setData] = useState<TrackerData>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [newCheckInNote, setNewCheckInNote] = useState('');

  const loadData = useCallback(async () => {
    const raw = await AsyncStorage.getItem(TRACKER_KEY);
    if (raw) setData(JSON.parse(raw));
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const save = async (updated: TrackerData) => {
    setData(updated);
    await AsyncStorage.setItem(TRACKER_KEY, JSON.stringify(updated));
    // Update waiver progress to 7 (max) once tracker is used
    const cur = parseInt(await AsyncStorage.getItem(childKey('ap_waiver_progress')) || '0', 10);
    if (cur < 7) await AsyncStorage.setItem(childKey('ap_waiver_progress'), '7');
  };

  const addCheckIn = async () => {
    if (!newCheckInNote.trim()) return;
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const updated: TrackerData = {
      ...data,
      lastCheckIn: today,
      checkIns: [{ date: today, note: newCheckInNote.trim() }, ...data.checkIns],
    };
    await save(updated);
    setNewCheckInNote('');
  };

  const field = (label: string, key: keyof TrackerData, placeholder: string) => (
    <View style={styles.fieldRow} key={key}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {editing ? (
        <TextInput
          style={styles.fieldInput}
          value={data[key] as string}
          onChangeText={(v) => setData({ ...data, [key]: v })}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
        />
      ) : (
        <Text style={[styles.fieldValue, !(data[key] as string) && styles.fieldEmpty]}>
          {(data[key] as string) || placeholder}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Waitlist Tracker</Text>
        <TouchableOpacity
          onPress={() => {
            if (editing) save(data);
            setEditing(!editing);
          }}
          style={styles.editBtn}
        >
          <Text style={styles.editBtnText}>{editing ? 'Save' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoEmoji}>📋</Text>
          <Text style={styles.infoText}>
            Keep all your waiver application details in one place. Tap <Text style={styles.infoBold}>Edit</Text> to fill in your information.
          </Text>
        </View>

        {/* Application details */}
        <Text style={styles.sectionLabel}>APPLICATION DETAILS</Text>
        <View style={styles.card}>
          {field('Agency Name', 'agencyName', 'e.g. Southeast Community Connections')}
          {field('Application Date', 'applicationDate', 'e.g. May 1, 2026')}
          {field('Confirmation #', 'confirmationNumber', 'e.g. WL-2026-00123')}
          {field('Last Check-In', 'lastCheckIn', 'Not yet')}
        </View>

        {/* Notes */}
        <Text style={styles.sectionLabel}>NOTES</Text>
        <View style={styles.card}>
          {editing ? (
            <TextInput
              style={[styles.fieldInput, styles.notesInput]}
              value={data.notes}
              onChangeText={(v) => setData({ ...data, notes: v })}
              placeholder="Add any notes about your application, who you spoke with, etc."
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={4}
            />
          ) : (
            <Text style={[styles.fieldValue, !data.notes && styles.fieldEmpty]}>
              {data.notes || 'Tap Edit to add notes'}
            </Text>
          )}
        </View>

        {/* Annual check-in log */}
        <Text style={styles.sectionLabel}>ANNUAL CHECK-IN LOG</Text>
        <View style={styles.card}>
          <Text style={styles.checkInHint}>
            Log each time you confirm your spot on the waitlist. Missing an annual check-in can remove you from the list.
          </Text>
          <View style={styles.checkInRow}>
            <TextInput
              style={styles.checkInInput}
              value={newCheckInNote}
              onChangeText={setNewCheckInNote}
              placeholder="Note (e.g. Called agency, confirmed active)"
              placeholderTextColor={COLORS.textLight}
            />
            <TouchableOpacity style={styles.checkInBtn} onPress={addCheckIn}>
              <Text style={styles.checkInBtnText}>+ Log</Text>
            </TouchableOpacity>
          </View>
          {data.checkIns.length === 0 ? (
            <Text style={styles.emptyLog}>No check-ins logged yet</Text>
          ) : (
            data.checkIns.map((ci, i) => (
              <View key={i} style={styles.checkInEntry}>
                <Text style={styles.checkInDate}>{ci.date}</Text>
                <Text style={styles.checkInNote}>{ci.note}</Text>
              </View>
            ))
          )}
        </View>

        {/* Reminder tip */}
        <View style={styles.reminderCard}>
          <Text style={styles.reminderTitle}>📅 Set a yearly reminder</Text>
          <Text style={styles.reminderBody}>
            Add a recurring reminder to your calendar every year to check in with your agency. Title it "Waiver Waitlist Check-In" so you never forget.
          </Text>
        </View>

        <View style={{ height: 40 }} />
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
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.purple,
  },
  backBtn: { padding: SPACING.xs },
  backText: { color: COLORS.white, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  headerTitle: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '700' },
  editBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.sm,
  },
  editBtnText: { color: COLORS.white, fontSize: FONT_SIZES.sm, fontWeight: '700' },
  scroll: {
    flex: 1, paddingBottom: SPACING.xl },
  infoCard: {
    flexDirection: 'row',
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: '#e8f4fd',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#90caf9',
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  infoEmoji: { fontSize: 20 },
  infoText: { flex: 1, fontSize: FONT_SIZES.sm, color: '#1565c0', lineHeight: 20 },
  infoBold: { fontWeight: '700' },
  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  card: {
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  fieldRow: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  fieldLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textLight, marginBottom: 2 },
  fieldValue: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  fieldEmpty: { color: COLORS.textLight, fontStyle: 'italic' },
  fieldInput: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.purple,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    marginTop: 2,
  },
  notesInput: { height: 80, textAlignVertical: 'top' },
  checkInHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    lineHeight: 18,
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  checkInRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  checkInInput: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 8,
  },
  checkInBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
  },
  checkInBtnText: { color: COLORS.white, fontSize: FONT_SIZES.sm, fontWeight: '700' },
  emptyLog: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    fontStyle: 'italic',
    padding: SPACING.md,
    paddingTop: 0,
  },
  checkInEntry: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  checkInDate: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple },
  checkInNote: { fontSize: FONT_SIZES.sm, color: COLORS.text, marginTop: 2 },
  reminderCard: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: '#f3e5f5',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#ce93d8',
    gap: SPACING.xs,
  },
  reminderTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#6a1b9a' },
  reminderBody: { fontSize: FONT_SIZES.sm, color: '#4a148c', lineHeight: 20 },
});
