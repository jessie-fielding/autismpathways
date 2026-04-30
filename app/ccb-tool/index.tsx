import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';

// ─── Types ────────────────────────────────────────────────────────────────────
type Section = 'what' | 'eligibility' | 'apply' | 'funds' | 'tips';

const SECTIONS: { id: Section; icon: string; title: string }[] = [
  { id: 'what',        icon: '🏢', title: 'What is a CCB?' },
  { id: 'eligibility', icon: '✅', title: 'Eligibility' },
  { id: 'apply',       icon: '📋', title: 'How to Apply' },
  { id: 'funds',       icon: '💰', title: 'What It Funds' },
  { id: 'tips',        icon: '💡', title: 'Parent Tips' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function CCBToolScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState<Section>('what');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CCB Tool</Text>
        <View style={{ minWidth: 60 }} />
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Community Centered Boards</Text>
        <Text style={styles.heroSub}>Your gateway to Colorado's DD waiver services, respite, and long-term supports</Text>
      </View>

      {/* Section tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow} contentContainerStyle={{ paddingHorizontal: SPACING.lg }}>
        {SECTIONS.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.tab, active === s.id && styles.tabOn]}
            onPress={() => setActive(s.id)}
          >
            <Text style={styles.tabIcon}>{s.icon}</Text>
            <Text style={[styles.tabText, active === s.id && styles.tabTextOn]}>{s.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll}>
        {active === 'what' && <WhatSection />}
        {active === 'eligibility' && <EligibilitySection />}
        {active === 'apply' && <ApplySection />}
        {active === 'funds' && <FundsSection />}
        {active === 'tips' && <TipsSection />}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ─── Section Components ───────────────────────────────────────────────────────

function WhatSection() {
  return (
    <>
      <InfoCard color={COLORS.blueAccent} bg={COLORS.blue}>
        <Text style={infoStyles.title}>What is a CCB?</Text>
        <Text style={infoStyles.body}>
          A Community Centered Board (CCB) is a private, non-profit organization designated by the state of Colorado to provide case management and connect individuals with intellectual and developmental disabilities (IDD) to services and supports.
        </Text>
        <Text style={[infoStyles.body, { marginTop: SPACING.md }]}>
          There are 20 CCBs across Colorado, each serving a specific geographic region. Your CCB is determined by the county you live in — not by your choice.
        </Text>
      </InfoCard>

      <InfoCard color={COLORS.lavenderAccent} bg={COLORS.lavender}>
        <Text style={infoStyles.title}>What does a CCB do?</Text>
        {[
          { icon: '🗺️', text: 'Determines eligibility for Colorado\'s DD waiver programs' },
          { icon: '📋', text: 'Assigns a case manager (called a Support Coordinator) to your family' },
          { icon: '🔗', text: 'Connects you to waiver-funded services like respite, behavioral support, and personal care' },
          { icon: '📝', text: 'Helps develop your child\'s Individual Support Plan (ISP)' },
          { icon: '⏳', text: 'Manages waitlists for Home and Community Based Services (HCBS) waivers' },
          { icon: '🏫', text: 'Coordinates with schools, Medicaid, and other agencies' },
        ].map((item, i) => (
          <View key={i} style={infoStyles.bulletRow}>
            <Text style={infoStyles.bulletIcon}>{item.icon}</Text>
            <Text style={infoStyles.bulletText}>{item.text}</Text>
          </View>
        ))}
      </InfoCard>

      <InfoCard color={COLORS.mintAccent} bg={COLORS.mint}>
        <Text style={infoStyles.title}>CCB vs. Medicaid — What's the difference?</Text>
        <View style={infoStyles.tableRow}>
          <Text style={infoStyles.tableHeader}>Medicaid</Text>
          <Text style={infoStyles.tableHeader}>CCB / DD Waiver</Text>
        </View>
        {[
          ['Medical services (doctors, therapy, prescriptions)', 'Non-medical supports (respite, personal care, day programs)'],
          ['Applied through PEAK (state Medicaid portal)', 'Applied through your county CCB'],
          ['No waitlist for eligible children', 'Often has a waitlist of months to years'],
          ['Covers ABA, speech, OT, PT via EPSDT', 'Covers services Medicaid doesn\'t fund'],
        ].map(([left, right], i) => (
          <View key={i} style={[infoStyles.tableRow, { borderTopWidth: 1, borderTopColor: COLORS.mintAccent }]}>
            <Text style={infoStyles.tableCell}>{left}</Text>
            <Text style={infoStyles.tableCell}>{right}</Text>
          </View>
        ))}
      </InfoCard>
    </>
  );
}

function EligibilitySection() {
  return (
    <>
      <InfoCard color={COLORS.mintAccent} bg={COLORS.mint}>
        <Text style={infoStyles.title}>Who qualifies?</Text>
        <Text style={infoStyles.body}>To be eligible for CCB services in Colorado, your child must meet all three criteria:</Text>
        {[
          { num: '1', title: 'Colorado resident', body: 'Must live in Colorado and be a U.S. citizen or qualified immigrant.' },
          { num: '2', title: 'Developmental disability diagnosis', body: 'Must have a diagnosis of intellectual disability, autism spectrum disorder, cerebral palsy, epilepsy, or a related condition that occurred before age 22.' },
          { num: '3', title: 'Functional limitations', body: 'Must have substantial limitations in three or more areas of major life activity (self-care, language, learning, mobility, self-direction, independent living, economic self-sufficiency).' },
        ].map((item) => (
          <View key={item.num} style={infoStyles.numRow}>
            <View style={infoStyles.numBadge}><Text style={infoStyles.numText}>{item.num}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={infoStyles.numTitle}>{item.title}</Text>
              <Text style={infoStyles.numBody}>{item.body}</Text>
            </View>
          </View>
        ))}
      </InfoCard>

      <InfoCard color={COLORS.yellowAccent} bg={COLORS.yellow}>
        <Text style={infoStyles.title}>Age considerations</Text>
        <View style={infoStyles.bulletRow}>
          <Text style={infoStyles.bulletIcon}>👶</Text>
          <Text style={infoStyles.bulletText}>Children can be referred to the CCB at any age, including infancy through Early Intervention.</Text>
        </View>
        <View style={infoStyles.bulletRow}>
          <Text style={infoStyles.bulletIcon}>🎓</Text>
          <Text style={infoStyles.bulletText}>Transition planning (age 14–21) is a critical time to connect with your CCB before school services end.</Text>
        </View>
        <View style={infoStyles.bulletRow}>
          <Text style={infoStyles.bulletIcon}>🔄</Text>
          <Text style={infoStyles.bulletText}>Adults (18+) can self-refer. Parents can refer on behalf of minor children.</Text>
        </View>
      </InfoCard>

      <InfoCard color={COLORS.peachAccent} bg={COLORS.peach}>
        <Text style={infoStyles.title}>Income & insurance</Text>
        <Text style={infoStyles.body}>
          CCB eligibility is <Text style={{ fontWeight: '700' }}>not income-based</Text>. Families of all income levels can qualify. However, some waiver services require Medicaid enrollment. If your child doesn't currently have Medicaid, your CCB can help you apply.
        </Text>
      </InfoCard>
    </>
  );
}

function ApplySection() {
  return (
    <>
      <InfoCard color={COLORS.lavenderAccent} bg={COLORS.lavender}>
        <Text style={infoStyles.title}>Step-by-step application process</Text>
        {[
          { step: '1', title: 'Find your CCB', body: 'Your CCB is based on your county of residence. Search "Colorado CCB [your county]" or visit the CDHS website.' },
          { step: '2', title: 'Call or submit a referral', body: 'Contact your CCB directly and request an intake appointment. You can self-refer — no doctor referral required.' },
          { step: '3', title: 'Intake interview', body: 'A CCB staff member will gather information about your child\'s diagnosis, functional needs, and current supports.' },
          { step: '4', title: 'Eligibility determination', body: 'The CCB will review your child\'s records and conduct a functional assessment. This typically takes 30–60 days.' },
          { step: '5', title: 'Eligibility decision', body: 'If approved, your child is enrolled in the CCB system and assigned a Support Coordinator.' },
          { step: '6', title: 'Individual Support Plan (ISP)', body: 'Your Support Coordinator helps develop an ISP identifying your child\'s needs, goals, and services.' },
          { step: '7', title: 'Waiver enrollment or waitlist', body: 'If waiver funding is available, services begin. If not, your child is placed on the waitlist — the clock starts NOW, so apply early.' },
        ].map((item) => (
          <View key={item.step} style={infoStyles.stepRow}>
            <View style={infoStyles.stepBadge}><Text style={infoStyles.stepNum}>{item.step}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={infoStyles.stepTitle}>{item.title}</Text>
              <Text style={infoStyles.stepBody}>{item.body}</Text>
            </View>
          </View>
        ))}
      </InfoCard>

      <InfoCard color={COLORS.peachAccent} bg={COLORS.peach}>
        <Text style={infoStyles.title}>Documents to bring</Text>
        {[
          'Proof of Colorado residency (utility bill, lease, etc.)',
          'Child\'s birth certificate or proof of age',
          'Diagnosis documentation (psychological evaluation, medical records)',
          'Proof of citizenship or immigration status',
          'Current IEP (if applicable)',
          'Insurance cards (Medicaid, private insurance)',
          'List of current services and providers',
        ].map((item, i) => (
          <View key={i} style={infoStyles.bulletRow}>
            <Text style={infoStyles.bulletIcon}>📄</Text>
            <Text style={infoStyles.bulletText}>{item}</Text>
          </View>
        ))}
      </InfoCard>

      <View style={styles.ctaCard}>
        <Text style={styles.ctaTitle}>⏰ Apply as early as possible</Text>
        <Text style={styles.ctaBody}>
          Waiver waitlists in Colorado can be 3–10+ years long. The date you apply determines your place in line. Even if your child is young or you don't need services yet, getting on the waitlist now is one of the most important things you can do.
        </Text>
      </View>
    </>
  );
}

function FundsSection() {
  const services = [
    { category: 'Respite Care', icon: '🏡', items: ['In-home respite', 'Out-of-home respite', 'Camp programs', 'Crisis respite'] },
    { category: 'Personal Care', icon: '🤝', items: ['Personal care attendant (PCA)', 'Supported living', 'Homemaker services'] },
    { category: 'Behavioral Support', icon: '💬', items: ['Behavioral consultation', 'Crisis intervention', 'Positive behavior support plans'] },
    { category: 'Day Programs', icon: '🌞', items: ['Day habilitation', 'Supported employment', 'Prevocational services', 'Community integration'] },
    { category: 'Residential', icon: '🏠', items: ['Group homes', 'Host homes', 'Supported living arrangements'] },
    { category: 'Transportation', icon: '🚌', items: ['Non-medical transportation to waiver services'] },
    { category: 'Assistive Technology', icon: '📱', items: ['Communication devices (AAC)', 'Adaptive equipment', 'Home modifications'] },
    { category: 'Family Support', icon: '👨‍👩‍👧', items: ['Family support services', 'Parent training', 'Sibling support'] },
  ];

  return (
    <>
      <InfoCard color={COLORS.mintAccent} bg={COLORS.mint}>
        <Text style={infoStyles.title}>Important note</Text>
        <Text style={infoStyles.body}>
          CCB/waiver services are designed to fund things Medicaid does <Text style={{ fontWeight: '700' }}>not</Text> cover. Medicaid covers medical services (therapy, doctors, prescriptions). Waivers cover the non-medical supports that help your child live in the community.
        </Text>
      </InfoCard>

      {services.map((cat) => (
        <View key={cat.category} style={styles.serviceCategory}>
          <View style={styles.serviceCatHeader}>
            <Text style={styles.serviceCatIcon}>{cat.icon}</Text>
            <Text style={styles.serviceCatTitle}>{cat.category}</Text>
          </View>
          {cat.items.map((item, i) => (
            <View key={i} style={infoStyles.bulletRow}>
              <Text style={infoStyles.bulletIcon}>•</Text>
              <Text style={infoStyles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      ))}
    </>
  );
}

function TipsSection() {
  const tips = [
    {
      icon: '📅',
      title: 'Apply the day of diagnosis',
      body: 'The moment you have a diagnosis, call your CCB. Waitlist time starts from your application date, not your diagnosis date. Every month you wait is a month lost.',
    },
    {
      icon: '📞',
      title: 'Call your CCB every 6 months',
      body: 'Check in to confirm your child is still on the waitlist and update your contact info. Families who don\'t respond to outreach can be removed from the list.',
    },
    {
      icon: '📝',
      title: 'Document everything',
      body: 'Keep records of every call, email, and meeting with your CCB. Note the date, name of the person you spoke with, and what was discussed.',
    },
    {
      icon: '🤝',
      title: 'Build a relationship with your Support Coordinator',
      body: 'Your Support Coordinator is your advocate inside the system. A good relationship means they go to bat for you when services are limited or denied.',
    },
    {
      icon: '⚖️',
      title: 'Know your rights',
      body: 'You have the right to appeal eligibility denials and service reductions. Ask for decisions in writing and request an appeal within 30 days if you disagree.',
    },
    {
      icon: '🔄',
      title: 'Request a different Support Coordinator if needed',
      body: 'If your relationship with your Support Coordinator isn\'t working, you can request a different one. You don\'t have to stay with someone who isn\'t advocating for your family.',
    },
    {
      icon: '🏫',
      title: 'Connect CCB with your school',
      body: 'Your CCB can attend IEP meetings and help coordinate services between school and waiver. Ask your Support Coordinator to be part of your IEP team.',
    },
    {
      icon: '💰',
      title: 'Medicaid + Waiver = maximum coverage',
      body: 'Having both Medicaid and a waiver gives your child access to the full range of services. If your child has a waiver but not Medicaid, apply for Medicaid too.',
    },
  ];

  return (
    <>
      {tips.map((tip, i) => (
        <View key={i} style={styles.tipCard}>
          <Text style={styles.tipIcon}>{tip.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>{tip.title}</Text>
            <Text style={styles.tipBody}>{tip.body}</Text>
          </View>
        </View>
      ))}

      <View style={styles.ctaCard}>
        <Text style={styles.ctaTitle}>📣 You are your child's best advocate</Text>
        <Text style={styles.ctaBody}>
          The CCB system can feel overwhelming, but you don't have to navigate it alone. Connect with other autism families in your area — they often know the local system better than anyone.
        </Text>
      </View>
    </>
  );
}

// ─── Shared Info Card ─────────────────────────────────────────────────────────
function InfoCard({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return (
    <View style={[styles.infoCard, { borderTopColor: color, backgroundColor: bg }]}>
      {children}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const infoStyles = StyleSheet.create({
  title: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  body: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
  bulletIcon: { fontSize: 14, marginRight: SPACING.sm, marginTop: 1 },
  bulletText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 19 },
  numRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md },
  numBadge: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.purple,
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md, marginTop: 2,
  },
  numText: { color: COLORS.white, fontWeight: '800', fontSize: FONT_SIZES.sm },
  numTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  numBody: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 19 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.lg },
  stepBadge: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.purpleDark,
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md, marginTop: 2,
  },
  stepNum: { color: COLORS.white, fontWeight: '800', fontSize: FONT_SIZES.sm },
  stepTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  stepBody: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 19 },
  tableRow: { flexDirection: 'row', paddingVertical: SPACING.sm },
  tableHeader: { flex: 1, fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purpleDark, paddingHorizontal: SPACING.sm },
  tableCell: { flex: 1, fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 17, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs },
});

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
  hero: {
    backgroundColor: COLORS.lavender, paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl, borderBottomWidth: 1, borderBottomColor: COLORS.lavenderAccent,
  },
  heroTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.purpleDark, marginBottom: SPACING.xs },
  heroSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  tabRow: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: SPACING.sm },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill, marginRight: SPACING.sm,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  tabOn: { backgroundColor: COLORS.lavender, borderColor: COLORS.lavenderAccent },
  tabIcon: { fontSize: 14 },
  tabText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMid },
  tabTextOn: { color: COLORS.purpleDark },
  scroll: { padding: SPACING.lg },
  infoCard: {
    borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border, borderTopWidth: 4, ...SHADOWS.sm,
  },
  ctaCard: {
    backgroundColor: COLORS.purpleDark, borderRadius: RADIUS.md,
    padding: SPACING.lg, marginBottom: SPACING.md,
  },
  ctaTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.white, marginBottom: SPACING.sm },
  ctaBody: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },
  serviceCategory: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  serviceCatHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  serviceCatIcon: { fontSize: 20 },
  serviceCatTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
    backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  tipIcon: { fontSize: 24, marginTop: 2 },
  tipTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  tipBody: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
});
