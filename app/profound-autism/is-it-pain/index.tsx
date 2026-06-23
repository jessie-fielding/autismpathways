/**
 * Is It Pain? — Medical checklist for nonverbal children.
 * 6 sections: Dental, GI, Ear/Sinus, Sleep, Skin, Medications.
 * Based on Dr. Bilder's Sources of Distress framework.
 */
import { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../../lib/theme';
import { logEvent, logScreenView } from '../../../lib/analytics';
import { PathwayDisclaimer } from '../../../components/PathwayDisclaimer';

interface CheckItem {
  id: string;
  text: string;
}

interface Section {
  id: string;
  emoji: string;
  title: string;
  items: CheckItem[];
  tip: string;
}

const SECTIONS: Section[] = [
  {
    id: 'dental',
    emoji: '🦷',
    title: 'Dental',
    items: [
      { id: 'd1', text: 'When did your child last see a dentist?' },
      { id: 'd2', text: 'Do they resist having their mouth touched or teeth brushed?' },
      { id: 'd3', text: 'Have you noticed any swelling, redness, or changes in eating?' },
      { id: 'd4', text: 'Do they grind their teeth?' },
    ],
    tip: 'Dental pain is one of the most commonly missed causes of behavior escalation in nonverbal children. Many children with profound autism need sedation dentistry — ask for a referral to a pediatric dentist experienced with special needs.',
  },
  {
    id: 'gi',
    emoji: '🫃',
    title: 'GI / Stomach',
    items: [
      { id: 'g1', text: 'Has your child\'s bowel pattern changed recently (more constipated, more loose)?' },
      { id: 'g2', text: 'Do they seem uncomfortable before, during, or after bowel movements?' },
      { id: 'g3', text: 'Have you noticed bloating, gas, or stomach distension?' },
      { id: 'g4', text: 'Do they press their stomach against furniture or the floor?' },
      { id: 'g5', text: 'Have they been eating less or refusing foods they usually like?' },
    ],
    tip: 'GI issues affect up to 70% of children with autism. Constipation and reflux are the most common and most treatable. Ask your pediatrician for a GI referral if you suspect this.',
  },
  {
    id: 'ear',
    emoji: '👂',
    title: 'Ear / Sinus',
    items: [
      { id: 'e1', text: 'Has your child had a cold or upper respiratory infection recently?' },
      { id: 'e2', text: 'Do they pull at their ears or rub the side of their face?' },
      { id: 'e3', text: 'Have you noticed changes in hearing or responsiveness?' },
      { id: 'e4', text: 'Is there any discharge from the ears?' },
    ],
    tip: 'Ear infections are often missed in nonverbal children because they can\'t report pain. Any behavior escalation following a cold should prompt an ear check.',
  },
  {
    id: 'sleep',
    emoji: '😴',
    title: 'Sleep',
    items: [
      { id: 's1', text: 'Is your child sleeping significantly less than usual?' },
      { id: 's2', text: 'Are they waking frequently at night?' },
      { id: 's3', text: 'Do they snore loudly or seem to stop breathing during sleep?' },
      { id: 's4', text: 'Are they more irritable in the morning than usual?' },
    ],
    tip: 'Sleep apnea is significantly more common in autism and intellectual disability. Chronic sleep deprivation dramatically worsens behavior. Ask your pediatrician about a sleep study if snoring or apnea is present.',
  },
  {
    id: 'skin',
    emoji: '🩹',
    title: 'Skin / Physical',
    items: [
      { id: 'sk1', text: 'Any new rashes, sores, or areas of redness?' },
      { id: 'sk2', text: 'Are they scratching or rubbing a specific area repeatedly?' },
      { id: 'sk3', text: 'Any recent injuries that may not have been noticed?' },
      { id: 'sk4', text: 'Do they seem to protect a specific body part?' },
    ],
    tip: 'Children with profound autism often can\'t localize pain verbally. Repeated scratching or guarding a body part is a significant signal worth investigating.',
  },
  {
    id: 'meds',
    emoji: '💊',
    title: 'Medications / Recent Changes',
    items: [
      { id: 'm1', text: 'Has any medication been started, stopped, or changed recently?' },
      { id: 'm2', text: 'Have there been any changes in diet, supplements, or vitamins?' },
      { id: 'm3', text: 'Any recent vaccinations?' },
      { id: 'm4', text: 'Any recent illnesses, even mild ones?' },
    ],
    tip: 'Medication changes — including starting, stopping, or dose changes — can cause significant behavioral changes. Always document timing relative to behavior changes.',
  },
];

export default function IsItPain() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [expandedSection, setExpandedSection] = useState<string | null>('dental');

  useEffect(() => {
    logScreenView('is_it_pain');
    logEvent('tool_opened', { tool: 'Is It Pain' });
  }, []);

  const toggleItem = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getSectionCount = (section: Section) =>
    section.items.filter((item) => checked[item.id]).length;

  const totalChecked = Object.values(checked).filter(Boolean).length;
  const totalItems = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);

  const getHighAlertSections = () =>
    SECTIONS.filter((s) => getSectionCount(s) >= 3);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Is It Pain?</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${(totalChecked / totalItems) * 100}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{totalChecked} of {totalItems} items reviewed</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            When a child with profound autism can't tell you they're in pain, <Text style={styles.introBold}>behavior is often the only signal</Text>. This checklist helps you systematically rule out common medical causes of increased or new behaviors.
          </Text>
          <Text style={styles.introAttr}>Based on Dr. Bilder's Sources of Distress framework</Text>
        </View>

        {/* Sections */}
        {SECTIONS.map((section) => {
          const count = getSectionCount(section);
          const isExpanded = expandedSection === section.id;
          const isHighAlert = count >= 3;

          return (
            <View key={section.id} style={[styles.sectionCard, isHighAlert && styles.sectionCardAlert]}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => setExpandedSection(isExpanded ? null : section.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.sectionEmoji}>{section.emoji}</Text>
                <View style={styles.sectionHeaderText}>
                  <Text style={[styles.sectionTitle, isHighAlert && styles.sectionTitleAlert]}>
                    {section.title}
                  </Text>
                  {count > 0 && (
                    <Text style={[styles.sectionCount, isHighAlert && styles.sectionCountAlert]}>
                      {count} item{count !== 1 ? 's' : ''} checked
                    </Text>
                  )}
                </View>
                {isHighAlert && (
                  <View style={styles.alertBadge}>
                    <Text style={styles.alertBadgeText}>⚠️ Discuss</Text>
                  </View>
                )}
                <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.sectionBody}>
                  {section.items.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.checkItem, checked[item.id] && styles.checkItemChecked]}
                      onPress={() => toggleItem(item.id)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.checkbox, checked[item.id] && styles.checkboxChecked]}>
                        {checked[item.id] && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text style={[styles.checkItemText, checked[item.id] && styles.checkItemTextChecked]}>
                        {item.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <View style={styles.tipBox}>
                    <Text style={styles.tipText}>💡 {section.tip}</Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* Results */}
        {totalChecked > 0 && (
          <View style={styles.resultsCard}>
            <Text style={styles.resultsTitle}>📋 Bring This to Your Doctor</Text>
            {getHighAlertSections().length > 0 ? (
              <>
                <Text style={styles.resultsText}>
                  Based on your answers, these areas may be worth discussing with your child's doctor:
                </Text>
                {getHighAlertSections().map((s) => (
                  <Text key={s.id} style={styles.resultsItem}>
                    {s.emoji} {s.title} — {getSectionCount(s)} items checked
                  </Text>
                ))}
              </>
            ) : (
              <Text style={styles.resultsText}>
                You've checked {totalChecked} item{totalChecked !== 1 ? 's' : ''}. Share this completed checklist with your child's doctor — it gives them a clear picture of what you're observing.
              </Text>
            )}
            <Text style={styles.resultsDisclaimer}>
              This checklist is a communication tool, not a diagnosis. Always work with your child's medical team.
            </Text>
          </View>
        )}

        <PathwayDisclaimer type="medical" />
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  progressTrack: { height: 4, backgroundColor: COLORS.border, marginHorizontal: SPACING.lg, borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: '#2C7BE5', borderRadius: 2 },
  progressLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, textAlign: 'center', marginTop: SPACING.xs, marginBottom: SPACING.sm },
  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.md, gap: SPACING.sm },
  introCard: {
    backgroundColor: '#DCEEFF',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#A8CFFF',
  },
  introText: { fontSize: FONT_SIZES.sm, color: '#2C5F8A', lineHeight: 20 },
  introBold: { fontWeight: '700' },
  introAttr: { fontSize: FONT_SIZES.xs, color: '#2C5F8A', marginTop: SPACING.sm, fontStyle: 'italic' },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  sectionCardAlert: { borderColor: '#F5A623' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  sectionEmoji: { fontSize: 22 },
  sectionHeaderText: { flex: 1 },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  sectionTitleAlert: { color: '#7A6020' },
  sectionCount: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  sectionCountAlert: { color: '#F5A623', fontWeight: '700' },
  alertBadge: {
    backgroundColor: '#FFF6D8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#FFE58A',
  },
  alertBadgeText: { fontSize: 11, color: '#7A6020', fontWeight: '700' },
  chevron: { fontSize: 12, color: COLORS.textLight },
  sectionBody: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.md, gap: SPACING.xs },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  checkItemChecked: { backgroundColor: '#DCEEFF', borderColor: '#A8CFFF' },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: '#2C7BE5', borderColor: '#2C7BE5' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '800' },
  checkItemText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  checkItemTextChecked: { color: '#2C5F8A', fontWeight: '600' },
  tipBox: {
    backgroundColor: '#DCEEFF',
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: '#A8CFFF',
  },
  tipText: { fontSize: FONT_SIZES.xs, color: '#2C5F8A', lineHeight: 18 },
  resultsCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: '#2C7BE5',
    ...SHADOWS.sm,
  },
  resultsTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  resultsText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20, marginBottom: SPACING.sm },
  resultsItem: { fontSize: FONT_SIZES.sm, color: '#7A6020', fontWeight: '600', marginBottom: SPACING.xs },
  resultsDisclaimer: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, lineHeight: 18, marginTop: SPACING.sm, fontStyle: 'italic' },
});
