import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../services/useAuth';
import { usePmipProviderStore } from '../../lib/pmip/pmipProviderStore';

// Exact colors from your web app
const COLORS = {
  bg: '#F5F4FB',
  card: '#ECEAF8',
  navy: '#1a1f5e',
  purple: '#7c6fd4',
  purpleDk: '#4a3f8f',
  textMid: '#6b6490',
  textLight: '#a09cbf',
  border: '#d4d0ef',
  borderLt: '#ede9fc',
  white: '#ffffff',
  teal: '#3BBFA3',
  tealLt: '#e3f7f1',
  green: '#2e7d32',
  red: '#c0392b',
  redLt: '#fde8e8',
};

const SPACING = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  // TOP NAV
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,208,239,0.5)',
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  navLogo: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#c4b8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
  },
  navTitlePurple: {
    color: COLORS.purple,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  navGear: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(124,111,212,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navGearIcon: {
    fontSize: 16,
  },
  navAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.purpleDk,
  },
  // CHILD SELECTOR
  childSelector: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212,208,239,0.5)',
  },
  childAv: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 2,
  },
  childMeta: {
    fontSize: 11,
    color: COLORS.textMid,
  },
  // HERO
  hero: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.55)',
    marginBottom: SPACING.xs,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.02,
    color: COLORS.white,
    marginBottom: SPACING.lg,
  },
  statRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
  },
  statPillNum: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 2,
  },
  statPillNumTeal: {
    color: COLORS.teal,
  },
  statPillLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  // CONTENT
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  // SECTION HEADER
  secHeader: {
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  secTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: COLORS.textLight,
  },
  // TRACKER CARDS
  trackerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.borderLt,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  tcTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tcTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navy,
  },
  tcBadge: {
    fontSize: 10,
    fontWeight: '700',
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 20,
  },
  tcBadgePurple: {
    backgroundColor: COLORS.card,
    color: COLORS.purpleDk,
  },
  tcBadgeTeal: {
    backgroundColor: COLORS.tealLt,
    color: '#0F6E56',
  },
  tcSteps: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: SPACING.md,
  },
  tcStep: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.card,
  },
  tcStepDone: {
    backgroundColor: COLORS.purple,
  },
  tcStepDoneTeal: {
    backgroundColor: COLORS.teal,
  },
  tcBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tcPhase: {
    fontSize: 11,
    color: COLORS.textMid,
  },
  tcNext: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.purple,
  },
  // PROFILE CARD
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.borderLt,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  pcAv: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.purple,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  pcBody: {
    flex: 1,
  },
  pcName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: SPACING.xs,
  },
  pcMeta: {
    fontSize: 12,
    color: COLORS.textMid,
    marginBottom: SPACING.xs,
  },
  pcTags: {
    flexDirection: 'row',
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  pcTag: {
    fontSize: 10,
    fontWeight: '600',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  pcTagPurple: {
    backgroundColor: COLORS.card,
    color: COLORS.purpleDk,
  },
  pcTagTeal: {
    backgroundColor: COLORS.tealLt,
    color: '#0F6E56',
  },
  // PATHWAY SCROLL
  pathwayScroll: {
    marginBottom: SPACING.md,
  },
  pathwayTile: {
    minWidth: 86,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.borderLt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  ptIcon: {
    fontSize: 22,
    marginBottom: SPACING.xs,
  },
  ptName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.navy,
    textAlign: 'center',
    lineHeight: 15,
  },
  doneBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: COLORS.green,
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '700',
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 10,
  },
  // DUAL GRID
  dualGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  miniCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.borderLt,
    padding: SPACING.md,
  },
  miniTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: SPACING.md,
  },
  miniLink: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.purple,
    marginTop: SPACING.xs,
  },
  // APPEALS MINI
  amRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  amBar: {
    width: 3,
    height: 32,
    borderRadius: 2,
  },
  amBarRed: {
    backgroundColor: COLORS.red,
  },
  amBarTeal: {
    backgroundColor: COLORS.teal,
  },
  amName: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.navy,
    flex: 1,
  },
  amSub: {
    fontSize: 9,
    color: COLORS.textMid,
  },
  // THIS WEEK
  twItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  twChk: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  twChkDone: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  twChkText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: '700',
  },
  twText: {
    fontSize: 10,
    color: COLORS.navy,
    flex: 1,
  },
  twTextDone: {
    color: COLORS.textLight,
    textDecorationLine: 'line-through',
  },
  // TOOLS GRID
  toolsGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  toolTile: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.borderLt,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolIcon: {
    fontSize: 20,
    marginBottom: SPACING.xs,
  },
  toolName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navy,
    textAlign: 'center',
  },
});

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { childName } = usePmipProviderStore();
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Review Medicaid application', checked: false },
    { id: 2, text: 'Schedule provider appointment', checked: false },
    { id: 3, text: 'Update child profile', checked: true },
  ]);

  const toggleChecklistItem = (id: number) => {
    setChecklist(checklist.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const initials = (childName || 'AP')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* TOP NAV */}
      <View style={styles.topNav}>
        <View style={styles.navLeft}>
          <View style={styles.navLogo} />
          <Text style={styles.navTitle}>
            Autism<Text style={styles.navTitlePurple}> Pathways</Text>
          </Text>
        </View>
        <View style={styles.navRight}>
          <TouchableOpacity
            onPress={() => router.push('/settings' as any)}
            style={styles.navGear}
          >
            <Text style={styles.navGearIcon}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navAvatar}>
            <Text>{initials}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CHILD SELECTOR */}
      <View style={styles.childSelector}>
        <View style={styles.childAv}>
          <Text style={{ color: COLORS.white, fontWeight: '700' }}>E</Text>
        </View>
        <View style={styles.childInfo}>
          <Text style={styles.childName}>{childName || 'Child Name'}</Text>
          <Text style={styles.childMeta}>Autism Spectrum Disorder</Text>
        </View>
      </View>

      {/* HERO */}
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>Welcome back</Text>
        <Text style={styles.heroName}>Hi {childName || 'Friend'}</Text>
        <View style={styles.statRow}>
          <View style={styles.statPill}>
            <Text style={styles.statPillNum}>60%</Text>
            <Text style={styles.statPillLabel}>Waiver</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statPillNum}>2</Text>
            <Text style={styles.statPillLabel}>Appeals</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statPillNum}>1</Text>
            <Text style={styles.statPillLabel}>Waitlist</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={[styles.statPillNum, styles.statPillNumTeal]}>5</Text>
            <Text style={styles.statPillLabel}>Done</Text>
          </View>
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        {/* MEDICAID PATHWAY */}
        <View style={styles.secHeader}>
          <Text style={styles.secTitle}>📊 Medicaid Pathway</Text>
        </View>
        <View style={styles.trackerCard}>
          <View style={styles.tcTop}>
            <Text style={styles.tcTitle}>Medicaid Application</Text>
            <Text style={[styles.tcBadge, styles.tcBadgePurple]}>IN PROGRESS</Text>
          </View>
          <View style={styles.tcSteps}>
            <View style={[styles.tcStep, styles.tcStepDone]} />
            <View style={[styles.tcStep, styles.tcStepDone]} />
            <View style={[styles.tcStep, styles.tcStepDone]} />
            <View style={styles.tcStep} />
          </View>
          <View style={styles.tcBottom}>
            <Text style={styles.tcPhase}>Step 3 of 4</Text>
            <Text style={styles.tcNext}>Continue</Text>
          </View>
        </View>

        {/* DIAGNOSIS PATHWAY */}
        <View style={styles.secHeader}>
          <Text style={styles.secTitle}>📈 Diagnosis Pathway</Text>
        </View>
        <TouchableOpacity style={styles.trackerCard} onPress={() => router.push('/diagnosis')} activeOpacity={0.75}>
          <View style={styles.tcTop}>
            <Text style={styles.tcTitle}>Diagnosis Process</Text>
            <Text style={[styles.tcBadge, styles.tcBadgeTeal]}>IN PROGRESS</Text>
          </View>
          <View style={styles.tcSteps}>
            <View style={[styles.tcStep, styles.tcStepDoneTeal]} />
            <View style={[styles.tcStep, styles.tcStepDoneTeal]} />
            <View style={styles.tcStep} />
          </View>
          <View style={styles.tcBottom}>
            <Text style={styles.tcPhase}>Step 2 of 6</Text>
            <Text style={styles.tcNext}>Continue →</Text>
          </View>
        </TouchableOpacity>

        {/* PROFILE CARD */}
        <View style={styles.secHeader}>
          <Text style={styles.secTitle}>👤 Profile</Text>
        </View>
        <View style={styles.profileCard}>
          <View style={styles.pcAv}>
            <Text style={{ color: COLORS.white }}>👧</Text>
          </View>
          <View style={styles.pcBody}>
            <Text style={styles.pcName}>{childName || 'Emma Rose'}, 8</Text>
            <Text style={styles.pcMeta}>Autism Spectrum Disorder</Text>
            <View style={styles.pcTags}>
              <Text style={[styles.pcTag, styles.pcTagPurple]}>Level 1</Text>
              <Text style={[styles.pcTag, styles.pcTagTeal]}>School Age</Text>
            </View>
          </View>
        </View>

        {/* YOUR PATHWAYS */}
        <View style={styles.secHeader}>
          <Text style={styles.secTitle}>🎯 Your Pathways</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pathwayScroll}>
          <TouchableOpacity style={styles.pathwayTile} onPress={() => router.push('/medicaid')} activeOpacity={0.75}>
            <Text style={styles.ptIcon}>🏥</Text>
            <Text style={styles.ptName}>Medicaid</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pathwayTile} onPress={() => router.push('/diagnosis')} activeOpacity={0.75}>
            <Text style={styles.ptIcon}>🧠</Text>
            <Text style={styles.ptName}>Diagnosis</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pathwayTile} onPress={() => router.push('/potty')} activeOpacity={0.75}>
            <Text style={styles.ptIcon}>🚽</Text>
            <Text style={styles.ptName}>Potty</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pathwayTile} onPress={() => router.push('/observations')} activeOpacity={0.75}>
            <Text style={styles.ptIcon}>📋</Text>
            <Text style={styles.ptName}>Observations</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pathwayTile} onPress={() => router.push('/provider-prep')} activeOpacity={0.75}>
            <Text style={styles.ptIcon}>🩺</Text>
            <Text style={styles.ptName}>Provider Prep</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pathwayTile} onPress={() => router.push('/iep')} activeOpacity={0.75}>
            <Text style={styles.ptIcon}>📚</Text>
            <Text style={styles.ptName}>IEP</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pathwayTile} onPress={() => router.push('/waiver')} activeOpacity={0.75}>
            <Text style={styles.ptIcon}>🗺️</Text>
            <Text style={styles.ptName}>Waiver</Text>
          </TouchableOpacity>
          <View style={styles.pathwayTile}>
            <Text style={styles.ptIcon}>💼</Text>
            <Text style={styles.ptName}>Employment</Text>
            <View style={styles.doneBadge}>
              <Text style={{ color: COLORS.white }}>✓</Text>
            </View>
          </View>
        </ScrollView>

        {/* COMPLETED PATHWAYS */}
        <View style={styles.secHeader}>
          <Text style={styles.secTitle}>✅ Completed</Text>
        </View>
        <View style={styles.trackerCard}>
          <Text style={styles.tcTitle}>Early Intervention</Text>
          <Text style={styles.tcPhase}>Completed in 2023</Text>
        </View>

        {/* DUAL GRID: APPEALS + THIS WEEK */}
        <View style={styles.dualGrid}>
          {/* APPEALS */}
          <View style={styles.miniCard}>
            <Text style={styles.miniTitle}>🔔 Appeals</Text>
            <View style={styles.amRow}>
              <View style={[styles.amBar, styles.amBarRed]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.amName}>Appeal #1</Text>
                <Text style={styles.amSub}>Under review</Text>
              </View>
            </View>
            <View style={styles.amRow}>
              <View style={[styles.amBar, styles.amBarTeal]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.amName}>Appeal #2</Text>
                <Text style={styles.amSub}>Pending</Text>
              </View>
            </View>
          </View>

          {/* THIS WEEK */}
          <View style={styles.miniCard}>
            <Text style={styles.miniTitle}>☑️ This Week</Text>
            {checklist.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.twItem}
                onPress={() => toggleChecklistItem(item.id)}
              >
                <View
                  style={[
                    styles.twChk,
                    item.checked && styles.twChkDone,
                  ]}
                >
                  {item.checked && <Text style={styles.twChkText}>✓</Text>}
                </View>
                <Text
                  style={[
                    styles.twText,
                    item.checked && styles.twTextDone,
                  ]}
                >
                  {item.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* TOOLS */}
        <View style={styles.secHeader}>
          <Text style={styles.secTitle}>🛠️ Tools & Resources</Text>
        </View>
        <View style={styles.toolsGrid}>
          <TouchableOpacity
            style={styles.toolTile}
            onPress={() => router.push('/tools' as any)}
            activeOpacity={0.75}
          >
            <Text style={styles.toolIcon}>📖</Text>
            <Text style={styles.toolName}>All Tools</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolTile}
            onPress={() => Linking.openURL('mailto:contact@autismpathways.app')}
            activeOpacity={0.75}
          >
            <Text style={styles.toolIcon}>📞</Text>
            <Text style={styles.toolName}>Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolTile}
            onPress={() => router.push('/tools' as any)}
            activeOpacity={0.75}
          >
            <Text style={styles.toolIcon}>📝</Text>
            <Text style={styles.toolName}>Forms</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolTile}
            onPress={() => router.push('/settings' as any)}
            activeOpacity={0.75}
          >
            <Text style={styles.toolIcon}>⚙️</Text>
            <Text style={styles.toolName}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
