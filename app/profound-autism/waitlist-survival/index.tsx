/**
 * Waitlist Survival — What to do while waiting for services.
 * Covers: what to do TODAY, waiver applications, school rights, parent training.
 */
import { useEffect } from 'react';
import {
  Linking,
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
import PathwayDisclaimer from '../../../components/PathwayDisclaimer';

const SECTIONS = [
  {
    emoji: '📋',
    title: 'Apply for the Waiver — Today',
    urgency: 'URGENT',
    body: 'Medicaid waivers for autism and intellectual disability have waitlists measured in years — sometimes a decade or more. The most important thing you can do right now is apply, even if you don\'t think you\'ll qualify.',
    bullets: [
      'Contact your state\'s IDD (Intellectual and Developmental Disabilities) agency to apply for the Medicaid waiver. Search "[your state] IDD waiver application."',
      'Apply for every waiver your child might qualify for — there are often multiple waivers (autism-specific, IDD, HCBS) with different eligibility criteria.',
      'The waitlist clock starts the day you apply — not the day you think you need it.',
      'Ask about emergency or crisis waiver slots — some states have expedited processes for families in crisis.',
      'Keep copies of all applications and follow up every 3–6 months.',
    ],
    link: { label: 'Find Your State IDD Agency →', url: 'https://www.aucd.org/template/page.cfm?id=667' },
  },
  {
    emoji: '🏫',
    title: 'Maximize School Services',
    urgency: 'HIGH',
    body: 'Your child\'s IEP is a legally binding document. Schools must provide a Free and Appropriate Public Education (FAPE) — including behavioral support, speech therapy, OT, and more. Many families are not getting everything they\'re entitled to.',
    bullets: [
      'Request an IEP meeting to review your child\'s current services and add behavioral support if needed.',
      'Ask specifically for a Functional Behavior Assessment (FBA) and Behavior Intervention Plan (BIP) if your child has significant behavioral challenges.',
      'Request Extended School Year (ESY) services if your child regresses during breaks.',
      'Ask about 1:1 paraprofessional support if your child needs it for safety.',
      'If the school is not meeting your child\'s needs, contact your state\'s Parent Training and Information Center (PTI) for free advocacy support.',
    ],
    link: { label: 'Find Your State PTI →', url: 'https://www.parentcenterhub.org/find-your-center/' },
  },
  {
    emoji: '📚',
    title: 'Parent Training — Free Resources',
    urgency: 'MEDIUM',
    body: 'While you wait for professional services, parent training in ABA principles is one of the highest-impact things you can do. Research shows parent-implemented ABA is effective.',
    bullets: [
      'Rethink Ed — free parent training modules in ABA for autism. Available through many school districts.',
      'Autism Speaks Family Services — free online parent training resources.',
      'EIBI (Early Intensive Behavioral Intervention) parent training videos — available through many university autism programs.',
      'Ask your child\'s BCBA (if you have one) to train you directly in the techniques they\'re using.',
      'Join a parent support group — other parents of children with profound autism are often the best source of practical strategies.',
    ],
    link: { label: 'Autism Speaks Family Services →', url: 'https://www.autismspeaks.org/family-services' },
  },
  {
    emoji: '💊',
    title: 'Medical Evaluation — Don\'t Wait',
    urgency: 'HIGH',
    body: 'While you wait for behavioral services, medical evaluation should not wait. Pain, GI issues, sleep disorders, and medication needs can be addressed now.',
    bullets: [
      'Request a developmental pediatrician or child psychiatrist evaluation — these specialists understand autism and can address medical and medication needs.',
      'Ask your pediatrician for a GI referral if you suspect GI issues (constipation, reflux, GI pain).',
      'Ask for a sleep study referral if your child has significant sleep issues.',
      'Request a dental evaluation — dental pain is a commonly missed cause of behavioral escalation.',
      'Use the "Is It Pain?" tool in this pathway to systematically rule out medical causes.',
    ],
  },
  {
    emoji: '🤝',
    title: 'Respite — Ask for It',
    urgency: 'HIGH',
    body: 'Respite care — temporary relief for caregivers — is available through multiple sources even without a waiver. You deserve a break.',
    bullets: [
      'Contact the ARCH National Respite Network to find respite resources in your state.',
      'Ask your state\'s IDD agency about emergency respite options.',
      'Contact local autism organizations — many offer respite programs or can connect you with families who do respite sharing.',
      'Ask your child\'s school about after-school programs or extended day options.',
      'Contact your local YMCA or recreation department about inclusive programs.',
    ],
    link: { label: 'ARCH National Respite Network →', url: 'https://archrespite.org' },
  },
  {
    emoji: '📝',
    title: 'Document Everything',
    urgency: 'MEDIUM',
    body: 'Documentation is your most powerful tool for accessing services. Start now.',
    bullets: [
      'Keep a behavior log — date, time, behavior, antecedent, consequence. This is the ABC data your BCBA will need.',
      'Document every service request, every denial, every meeting. Keep copies of all correspondence.',
      'Document injuries — if your child is injuring themselves or others, this is critical data for accessing intensive services.',
      'Keep a medical log — every appointment, every medication change, every new symptom.',
      'Take photos and videos (with appropriate privacy protections) — visual documentation of behaviors can be compelling for service authorization.',
    ],
  },
];

const URGENCY_COLORS: Record<string, string> = {
  URGENT: '#C0392B',
  HIGH: '#F5A623',
  MEDIUM: COLORS.purple,
};

export default function WaitlistSurvival() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    logScreenView('waitlist_survival');
    logEvent('tool_opened', { tool: 'Waitlist Survival' });
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Waitlist Survival</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerEmoji}>⏳</Text>
          <Text style={styles.bannerTitle}>While You Wait for Services</Text>
          <Text style={styles.bannerSub}>
            The waitlists are real. The gaps are real. This guide tells you what to do right now — not what to hope for.
          </Text>
        </View>

        {/* Warm note */}
        <View style={styles.warmCard}>
          <Text style={styles.warmText}>
            "I know what it feels like to be told 'the waitlist is 3 years.' This guide is for the families who can't wait 3 years. There are things you can do right now that will make a real difference."
          </Text>
          <Text style={styles.warmAttr}>— Jessie, Founder of Autism Pathways</Text>
        </View>

        {/* Sections */}
        {SECTIONS.map((section, idx) => (
          <View key={idx} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>{section.emoji}</Text>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={[styles.urgencyBadge, { backgroundColor: URGENCY_COLORS[section.urgency] + '20' }]}>
                  <Text style={[styles.urgencyText, { color: URGENCY_COLORS[section.urgency] }]}>
                    {section.urgency}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.sectionBody}>{section.body}</Text>
            {section.bullets.map((bullet, bIdx) => (
              <View key={bIdx} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
            {'link' in section && section.link && (
              <TouchableOpacity
                style={styles.linkBtn}
                onPress={() => Linking.openURL(section.link!.url)}
                activeOpacity={0.8}
              >
                <Text style={styles.linkBtnText}>{section.link!.label}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <PathwayDisclaimer type="general" />
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
  scroll: { flex: 1 },
  scrollContent: { gap: SPACING.md },
  banner: {
    backgroundColor: '#2D1B4E',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  bannerEmoji: { fontSize: 40 },
  bannerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: '#fff', textAlign: 'center', lineHeight: 26 },
  bannerSub: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 20, maxWidth: 300 },
  warmCard: {
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.purple,
    ...SHADOWS.sm,
  },
  warmText: { fontSize: 13.5, color: '#4a4570', lineHeight: 22 },
  warmAttr: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: SPACING.sm, fontWeight: '500' },
  sectionCard: {
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  sectionEmoji: { fontSize: 22, marginTop: 2 },
  sectionHeaderText: { flex: 1, gap: SPACING.xs },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },
  urgencyBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  urgencyText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  sectionBody: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  bulletRow: { flexDirection: 'row', gap: SPACING.sm },
  bulletDot: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '800', marginTop: 2 },
  bulletText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  linkBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.purple,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    alignSelf: 'flex-start',
  },
  linkBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '700' },
});
