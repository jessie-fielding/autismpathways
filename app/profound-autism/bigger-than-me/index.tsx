/**
 * Bigger Than Me — Physical safety guide for profound autism.
 * For families whose child is physically larger or stronger.
 * Covers: de-escalation, CPI/Safety-Care training, adaptive equipment, respite.
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
    emoji: '🧠',
    title: 'De-escalation First',
    body: 'The most effective physical safety strategy is preventing escalation before it starts. Understanding your child\'s triggers, early warning signs, and preferred de-escalation strategies reduces the frequency and intensity of physical incidents.',
    bullets: [
      'Learn your child\'s escalation cycle — identify the early warning signs before a full episode.',
      'Reduce demands during high-risk times (tired, hungry, transitioning, overstimulated).',
      'Create a "calm-down kit" with preferred sensory items accessible at all times.',
      'Ensure your child has adequate sleep, nutrition, and physical activity — these dramatically affect behavior.',
      'Work with your BCBA on a behavior intervention plan that addresses the function of aggressive behavior.',
    ],
  },
  {
    emoji: '🎓',
    title: 'Crisis Prevention Training',
    body: 'If you are regularly managing physical aggression, formal crisis prevention training is essential. These programs teach safe, trauma-informed techniques for managing physical crises.',
    bullets: [
      'CPI (Crisis Prevention Institute) — Nonviolent Crisis Intervention training. Many schools and agencies use this. Ask your child\'s school if they offer parent training.',
      'Safety-Care — Behavioral Safety Training specifically designed for autism and intellectual disability. More autism-specific than CPI.',
      'TAME (Therapeutic Aggression Management Education) — another evidence-based option.',
      'Ask your BCBA or behavior support team to train you in safe physical management techniques specific to your child.',
    ],
    link: { label: 'CPI Training →', url: 'https://www.crisisprevention.com' },
  },
  {
    emoji: '🛡️',
    title: 'Personal Protective Equipment',
    body: 'For families managing regular physical aggression, personal protective equipment can reduce injury while you work on longer-term strategies. This is not a long-term solution, but it is a legitimate short-term tool.',
    bullets: [
      'Bite-resistant gloves — for children who bite. Cut-resistant gloves (Kevlar) provide significant protection.',
      'Protective arm sleeves — for children who scratch or bite arms.',
      'Padded clothing — for children who hit or scratch specific areas.',
      'Protective eyewear — if your child targets the face.',
      'Helmet for your child — if SIB involves head-banging, a protective helmet reduces injury.',
    ],
    products: 'Saebo Gloves, Hatch Cut-Resistant Gloves, Protective Industrial Products (PIP)',
  },
  {
    emoji: '🏠',
    title: 'Environmental Modifications',
    body: 'Modifying your environment reduces the risk of injury during physical incidents.',
    bullets: [
      'Remove hard-edged furniture from high-risk areas — replace with rounded or padded alternatives.',
      'Pad walls in areas where SIB or aggression is most likely (bedroom, living room).',
      'Remove breakable items and objects that can become projectiles.',
      'Create a designated "safe room" with padded walls and minimal hazards for high-risk periods.',
      'Install door alarms so you know when your child is moving through the house.',
    ],
    waiver: 'Environmental modifications are often covered by Medicaid waivers. Ask your coordinator about "environmental accessibility adaptations."',
  },
  {
    emoji: '😮‍💨',
    title: 'Caregiver Safety & Respite',
    body: 'You cannot provide safe care if you are injured, exhausted, or in crisis yourself. Caregiver safety is not optional — it is a prerequisite for your child\'s safety.',
    bullets: [
      'Request respite services through your Medicaid waiver — this is one of the most important waiver services for families managing severe behaviors.',
      'If you don\'t have a waiver, contact your state\'s IDD agency about emergency respite options.',
      'Build a support network of people who can provide relief during high-risk periods.',
      'Document injuries — if you are being regularly injured, document this for your child\'s medical and behavioral team. It is important data.',
      'Seek your own mental health support — caregiver trauma is real and treatable.',
      'Contact the ARCH National Respite Network for respite resources in your state.',
    ],
    link: { label: 'ARCH National Respite Network →', url: 'https://archrespite.org' },
  },
  {
    emoji: '⚖️',
    title: 'Legal & Placement Considerations',
    body: 'When behaviors reach a level that cannot be safely managed at home, families deserve honest information about their options.',
    bullets: [
      'Document everything — every incident, every injury, every request for services. This documentation is critical for accessing intensive services.',
      'Request an emergency IEP meeting if school placement is not meeting your child\'s needs.',
      'Contact your state\'s IDD agency about crisis stabilization services and intensive residential options.',
      'Consult with a special education attorney if you are not getting appropriate services.',
      'Contact the National Council on Severe Autism (NCSA) for advocacy resources.',
    ],
    link: { label: 'NCSA Resources →', url: 'https://www.ncsautism.org' },
  },
];

export default function BiggerThanMe() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    logScreenView('bigger_than_me');
    logEvent('tool_opened', { tool: 'Bigger Than Me' });
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
        <Text style={styles.headerTitle}>Bigger Than Me</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerEmoji}>💪</Text>
          <Text style={styles.bannerTitle}>When Your Child Is Bigger Than You Can Safely Manage</Text>
          <Text style={styles.bannerSub}>
            This is one of the most isolating experiences in autism parenting. You are not alone, and there are real strategies and resources.
          </Text>
        </View>

        {/* Warm note */}
        <View style={styles.warmCard}>
          <Text style={styles.warmText}>
            "The families I hear from most often are the ones managing physical aggression from a child who is now bigger than they are. This is a safety crisis, not a parenting failure. The system has failed these families — and this guide is my attempt to give you the information you deserve."
          </Text>
          <Text style={styles.warmAttr}>— Jessie, Founder of Autism Pathways</Text>
        </View>

        {/* Sections */}
        {SECTIONS.map((section, idx) => (
          <View key={idx} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>{section.emoji}</Text>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <Text style={styles.sectionBody}>{section.body}</Text>
            {section.bullets.map((bullet, bIdx) => (
              <View key={bIdx} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
            {'products' in section && section.products && (
              <View style={styles.productsBox}>
                <Text style={styles.productsLabel}>Products:</Text>
                <Text style={styles.productsText}>{section.products}</Text>
              </View>
            )}
            {'waiver' in section && section.waiver && (
              <View style={styles.waiverBox}>
                <Text style={styles.waiverText}>💜 {section.waiver}</Text>
              </View>
            )}
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

        {/* 988 reminder */}
        <TouchableOpacity
          style={styles.crisisCard}
          onPress={() => Linking.openURL('tel:988')}
          activeOpacity={0.85}
        >
          <Text style={styles.crisisTitle}>📞 If you are in crisis right now</Text>
          <Text style={styles.crisisText}>
            Call or text <Text style={styles.crisisBold}>988</Text> — the Suicide & Crisis Lifeline also supports caregivers in crisis. No police unless you ask.
          </Text>
        </TouchableOpacity>

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
    backgroundColor: '#3D2F00',
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
    borderLeftColor: '#7A6020',
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
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  sectionEmoji: { fontSize: 22 },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text, flex: 1 },
  sectionBody: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  bulletRow: { flexDirection: 'row', gap: SPACING.sm },
  bulletDot: { fontSize: FONT_SIZES.sm, color: '#7A6020', fontWeight: '800', marginTop: 2 },
  bulletText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  productsBox: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productsLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textLight, marginBottom: 2 },
  productsText: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18 },
  waiverBox: {
    backgroundColor: '#F0EDFF',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: '#C4B5FD',
  },
  waiverText: { fontSize: FONT_SIZES.xs, color: '#4C1D95', lineHeight: 18 },
  linkBtn: {
    borderWidth: 1.5,
    borderColor: '#7A6020',
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    alignSelf: 'flex-start',
  },
  linkBtnText: { fontSize: FONT_SIZES.sm, color: '#7A6020', fontWeight: '700' },
  crisisCard: {
    marginHorizontal: SPACING.md,
    backgroundColor: '#FFF0EE',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: '#FFCFCA',
    ...SHADOWS.sm,
  },
  crisisTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: '#C0392B', marginBottom: SPACING.xs },
  crisisText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  crisisBold: { fontWeight: '800', color: '#C0392B' },
});
