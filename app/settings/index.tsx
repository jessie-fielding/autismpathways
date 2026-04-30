import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Switch, Alert, Linking, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';
import { useNotifications, NotifSettings } from '../../hooks/useNotifications';
import { useAuth } from '../../services/useAuth';
import { clearCredentials } from '../../services/secureCredentials';

// All AsyncStorage keys used across the app
const ALL_DATA_KEYS = [
  'ap_profile',
  'ap_child_name',
  'ap_child_age',
  'ap_state',
  'ap_observations',
  'ap_iep_flagged_obs',
  'ap_iep_goals',
  'ap_iep_meetings',
  'ap_iep_checklist',
  'ap_provider_sessions',
  'ap_visit_summaries',
  'ap_potty_quiz_result',
  'ap_potty_quiz_answers',
  'ap_bowel_diary',
  'ap_diagnosis_step',
  'ap_diagnosis_why',
  'ap_eval_type_filter',
  'ap_tried_evaluators',
  'ap_diagnosis_appointment_date',
  'ap_diagnosis_outcome',
  'ap_medicaid_progress',
  'ap_waiver_saved_agencies',
  'ap_notification_appeal',
  'ap_notification_appointment',
  'ap_notification_weekly',
  'ap_notification_waiver',
  'profile',
  'tried_evaluators',
  'diagnosis_appointment_date',
  'eval_type_filter',
];

type NotifKey = 'ap_notification_appeal' | 'ap_notification_appointment' | 'ap_notification_weekly' | 'ap_notification_waiver';

const NOTIF_ITEMS: { key: NotifKey; icon: string; title: string; desc: string }[] = [
  { key: 'ap_notification_appeal', icon: '🔔', title: 'Appeal deadlines', desc: 'Remind me before hearing dates' },
  { key: 'ap_notification_appointment', icon: '📅', title: 'Appointment reminders', desc: '24 hours before saved appointments' },
  { key: 'ap_notification_weekly', icon: '✅', title: 'Weekly check-in', desc: 'Sunday reminder to update your journey' },
  { key: 'ap_notification_waiver', icon: '🗺️', title: 'Waiver waitlist reminders', desc: 'Annual check-in reminders' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { isPremium } = useIsPremium();
  const { scheduleAll } = useNotifications();
  const { signOut, signOutAndForget } = useAuth();

  const [profile, setProfile] = useState<{ childName?: string; state?: string; email?: string } | null>(null);
  const [notifs, setNotifs] = useState<Record<NotifKey, boolean>>({
    ap_notification_appeal: true,
    ap_notification_appointment: true,
    ap_notification_weekly: true,
    ap_notification_waiver: true,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileRaw, ...notifValues] = await AsyncStorage.multiGet([
        'ap_profile',
        ...NOTIF_ITEMS.map(n => n.key),
      ]);
      if (profileRaw[1]) setProfile(JSON.parse(profileRaw[1]));
      const notifState = { ...notifs };
      NOTIF_ITEMS.forEach((item, i) => {
        const val = notifValues[i][1];
        if (val !== null) notifState[item.key] = val === 'true';
      });
      setNotifs(notifState);
    } catch (e) {
      console.log('Settings load error', e);
    }
  };

  const toggleNotif = async (key: NotifKey, value: boolean) => {
    const newNotifs = { ...notifs, [key]: value };
    setNotifs(newNotifs);
    await AsyncStorage.setItem(key, String(value));
    // Re-schedule notifications based on new settings
    scheduleAll(newNotifs as NotifSettings);
  };

  // ── Delete & Anonymize ────────────────────────────────────────────────────
  const handleDeleteData = () => {
    Alert.alert(
      'Delete All My Data',
      'This will permanently remove all your saved information from this device — observations, IEP notes, pathway progress, and profile data.\n\nThis cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await AsyncStorage.multiRemove(ALL_DATA_KEYS);
      // Anonymize: write a tombstone record so backend knows to purge if online
      await AsyncStorage.setItem('ap_deletion_requested', JSON.stringify({
        requestedAt: new Date().toISOString(),
        anonymized: true,
      }));
      Alert.alert(
        'Data Deleted',
        'All your data has been removed from this device. If you have an account, your server data will be purged within 30 days in accordance with our Privacy Policy.',
        [{ text: 'OK', onPress: () => router.replace('/') }]
      );
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleAnonymizeData = () => {
    Alert.alert(
      'Anonymize My Data',
      "This replaces your child's name and any identifying info with anonymous placeholders. Your pathway progress and notes are kept but can no longer be linked to you.\n\nThis is useful if you want to stop using the app but keep your data private.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Anonymize',
          style: 'destructive',
          onPress: confirmAnonymize,
        },
      ]
    );
  };

  const confirmAnonymize = async () => {
    try {
      // Replace identifying fields with anonymous placeholders
      const anonProfile = {
        childName: 'Anonymous Child',
        state: 'Unknown',
        email: 'anonymized@autismpathways.app',
        anonymized: true,
        anonymizedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem('ap_profile', JSON.stringify(anonProfile));
      await AsyncStorage.setItem('profile', JSON.stringify(anonProfile));
      setProfile(anonProfile);
      Alert.alert('Done', 'Your identifying information has been anonymized. Your notes and progress are still saved.');
    } catch (e) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'How would you like to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: async () => {
            await signOut();
            router.replace('/');
          },
        },
        {
          text: 'Sign Out & Forget Me',
          style: 'destructive',
          onPress: async () => {
            Alert.alert(
              'Forget Saved Login?',
              'This will remove your saved email, password, and Face ID / Touch ID login from this device. You will need to type your password next time.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Forget Me',
                  style: 'destructive',
                  onPress: async () => {
                    await signOutAndForget();
                    router.replace('/');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const Row = ({ icon, title, subtitle, onPress, value, isSwitch, destructive }: {
    icon: string; title: string; subtitle?: string;
    onPress?: () => void; value?: boolean;
    isSwitch?: boolean; destructive?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={!isSwitch ? onPress : undefined}
      activeOpacity={isSwitch ? 1 : 0.7}
    >
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, destructive && { color: COLORS.errorText }]}>{title}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={onPress as any}
          trackColor={{ false: COLORS.border, true: COLORS.purple }}
          thumbColor={COLORS.white}
        />
      ) : (
        <Text style={[styles.rowChevron, destructive && { color: COLORS.errorText }]}>›</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Dashboard</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>Settings</Text>
        {profile?.email && <Text style={styles.email}>{profile.email}</Text>}

        {/* Premium Banner */}
        {isPremium ? (
          <View style={styles.premiumBanner}>
            <Text style={styles.premiumStar}>⭐</Text>
            <Text style={styles.premiumTitle}>Premium Active</Text>
            <Text style={styles.premiumSub}>
              Thank you for supporting Autism Pathways. You have access to all features.
            </Text>
            <Text style={styles.premiumCheck}>✓ All features unlocked</Text>
          </View>
        ) : (
          <View style={[styles.premiumBanner, styles.freeBanner]}>
            <Text style={styles.premiumStar}>🌟</Text>
            <Text style={styles.premiumTitle}>Beta Access</Text>
            <Text style={styles.premiumSub}>
              You're using the beta — all features are fully unlocked. Thank you for helping us build this!
            </Text>
          </View>
        )}

        {/* ACCOUNT */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <Row
            icon="👧"
            title="Child's Profile"
            subtitle={profile?.childName || 'Not set'}
            onPress={() => router.push('/(tabs)/start-here')}
          />
          <View style={styles.divider} />
          <Row
            icon="📍"
            title="Your State"
            subtitle={profile?.state ? `Personalized for ${profile.state}` : 'Not set'}
            onPress={() => router.push('/(tabs)/start-here')}
          />
          <View style={styles.divider} />
          <Row
            icon="🚪"
            title="Sign Out"
            subtitle="You can sign back in anytime"
            onPress={handleSignOut}
          />
        </View>

        {/* NOTIFICATIONS */}
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          {NOTIF_ITEMS.map((item, idx) => (
            <React.Fragment key={item.key}>
              <Row
                icon={item.icon}
                title={item.title}
                subtitle={item.desc}
                isSwitch
                value={notifs[item.key]}
                onPress={(v: boolean) => toggleNotif(item.key, v)}
              />
              {idx < NOTIF_ITEMS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
        <Text style={styles.notifNote}>
          Notifications will be sent as local reminders on your device. You can change these anytime.
        </Text>

        {/* YOUR JOURNEY */}
        <Text style={styles.sectionLabel}>YOUR JOURNEY</Text>
        <View style={styles.card}>
          <Row
            icon="🗺️"
            title="Medicaid Pathway"
            subtitle="View your progress"
            onPress={() => router.push('/medicaid')}
          />
          <View style={styles.divider} />
          <Row
            icon="✅"
            title="Waiver Checklist"
            subtitle="View your progress"
            onPress={() => router.push('/waiver')}
          />
          <View style={styles.divider} />
          <Row
            icon="📋"
            title="Disability Quiz"
            subtitle="Check your readiness score"
            onPress={() => Alert.alert('Coming Soon', 'The Disability Quiz is coming in the next update!')}
          />
          <View style={styles.divider} />
          <Row
            icon="🔄"
            title="Reset Journey Progress"
            subtitle="Start your pathway over from the beginning"
            onPress={() => Alert.alert(
              'Reset Journey Progress',
              'This will clear all pathway progress. Your observations, IEP notes, and diary entries will be kept.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset Progress',
                  style: 'destructive',
                  onPress: async () => {
                    await AsyncStorage.multiRemove([
                      'ap_medicaid_progress',
                      'ap_diagnosis_step',
                      'ap_diagnosis_outcome',
                      'ap_potty_quiz_result',
                      'ap_potty_quiz_answers',
                    ]);
                    Alert.alert('Done', 'Journey progress has been reset.');
                  },
                },
              ]
            )}
          />
        </View>

        {/* PRIVACY & DATA */}
        <Text style={styles.sectionLabel}>PRIVACY & DATA</Text>
        <View style={styles.card}>
          <Row
            icon="🔒"
            title="Privacy Policy"
            subtitle="How we protect your data"
            onPress={() => Linking.openURL('https://autismpathways.app/privacy')}
          />
          <View style={styles.divider} />
          <Row
            icon="📄"
            title="Terms of Service"
            subtitle="Our terms and conditions"
            onPress={() => Linking.openURL('https://autismpathways.app/terms')}
          />
          <View style={styles.divider} />
          <Row
            icon="🕵️"
            title="Anonymize My Data"
            subtitle="Replace identifying info with anonymous placeholders"
            onPress={handleAnonymizeData}
          />
          <View style={styles.divider} />
          <Row
            icon="🗑️"
            title="Delete My Data"
            subtitle="Permanently remove all your data"
            onPress={handleDeleteData}
            destructive
          />
        </View>
        <View style={styles.privacyNote}>
          <Text style={styles.privacyNoteText}>
            🛡️ Your data is stored locally on your device. We never sell your personal information. You have the right to access, correct, or delete your data at any time under GDPR, CCPA, and COPPA.
          </Text>
        </View>

        {/* ABOUT */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.card}>
          <Row
            icon="🌐"
            title="Blog & Resources"
            subtitle="info.autismpathways.app"
            onPress={() => Linking.openURL('https://info.autismpathways.app')}
          />
          <View style={styles.divider} />
          <Row
            icon="✉️"
            title="Contact Support"
            subtitle="contact@autismpathways.app"
            onPress={() => Linking.openURL('mailto:contact@autismpathways.app')}
          />
          <View style={styles.divider} />
          <Row
            icon="⭐"
            title="Rate the App"
            subtitle="Help other families find us"
            onPress={() => Alert.alert('Coming Soon', 'App Store rating will be available after launch!')}
          />
        </View>

        <Text style={styles.version}>Autism Pathways · Beta v0.1.0</Text>
        <Text style={styles.copyright}>© 2026 Autism Pathways LLC</Text>

        {deleting && (
          <View style={styles.deletingOverlay}>
            <ActivityIndicator color={COLORS.purple} size="large" />
            <Text style={styles.deletingText}>Deleting your data...</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 56,
    paddingBottom: SPACING.sm,
  },
  backBtn: { paddingVertical: 6 },
  backText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 40 },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  email: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
  },

  // Premium banner
  premiumBanner: {
    backgroundColor: '#FFF8E1',
    borderWidth: 1.5,
    borderColor: '#FFD54F',
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xxl,
    ...SHADOWS.sm,
  },
  freeBanner: {
    backgroundColor: COLORS.lavender,
    borderColor: COLORS.lavenderAccent,
  },
  premiumStar: { fontSize: 28, marginBottom: SPACING.sm },
  premiumTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.purpleDark,
    marginBottom: SPACING.xs,
  },
  premiumSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: SPACING.sm,
  },
  premiumCheck: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.successText,
  },

  // Sections
  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginLeft: 56 },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  rowIcon: { fontSize: 22, width: 36, textAlign: 'center', marginRight: SPACING.md },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: FONT_SIZES.base, fontWeight: '600', color: COLORS.text },
  rowSub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  rowChevron: { fontSize: 20, color: COLORS.textLight, fontWeight: '300' },

  // Notes
  notifNote: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    lineHeight: 17,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  privacyNote: {
    backgroundColor: COLORS.infoBg,
    borderWidth: 1,
    borderColor: COLORS.infoBorder,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  privacyNoteText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.infoText,
    lineHeight: 17,
  },

  // Footer
  version: {
    textAlign: 'center',
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xs,
  },
  copyright: {
    textAlign: 'center',
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
  },

  // Deleting overlay
  deletingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  deletingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.purple,
    fontWeight: '600',
  },
});
