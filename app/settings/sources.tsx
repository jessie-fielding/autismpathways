import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../lib/theme';

const SOURCES = [
  {
    category: 'Medicaid & Insurance',
    items: [
      {
        title: 'Colorado Department of Health Care Policy & Financing (HCPF)',
        description: 'Official source for Colorado Medicaid eligibility, waivers, and HCBS programs.',
        url: 'https://hcpf.colorado.gov',
      },
      {
        title: 'Colorado Children\'s Extensive Support (CES) Waiver',
        description: 'Eligibility criteria and services for children with developmental disabilities.',
        url: 'https://hcpf.colorado.gov/childrens-extensive-support-waiver-ces',
      },
      {
        title: 'Colorado Children with Chronic Health Needs (CwCHN) Waiver',
        description: 'Waiver program for children with complex medical needs.',
        url: 'https://hcpf.colorado.gov/childrens-chronic-health-needs',
      },
      {
        title: 'Colorado Children\'s Buy-In Program (CBwD)',
        description: 'Medicaid Buy-In program for working families of children with disabilities.',
        url: 'https://hcpf.colorado.gov/childrens-buy-in',
      },
      {
        title: 'Medicaid.gov — HCBS Waivers',
        description: 'Federal overview of Home and Community Based Services waiver programs.',
        url: 'https://www.medicaid.gov/medicaid/home-community-based-services/index.html',
      },
      {
        title: 'Centers for Medicare & Medicaid Services (CMS)',
        description: 'Federal agency overseeing Medicaid and CHIP programs.',
        url: 'https://www.cms.gov',
      },
    ],
  },
  {
    category: 'Autism & Developmental Disabilities',
    items: [
      {
        title: 'Centers for Disease Control and Prevention (CDC) — Autism Spectrum Disorder',
        description: 'Data, research, and resources on autism prevalence and characteristics.',
        url: 'https://www.cdc.gov/autism',
      },
      {
        title: 'American Academy of Pediatrics (AAP) — Autism',
        description: 'Clinical guidance and screening recommendations for autism.',
        url: 'https://www.aap.org/en/patient-care/autism/',
      },
      {
        title: 'Autism Speaks',
        description: 'Advocacy organization providing resources on diagnosis, services, and support.',
        url: 'https://www.autismspeaks.org',
      },
      {
        title: 'National Institute of Mental Health (NIMH) — Autism',
        description: 'Research-based information on autism spectrum disorder.',
        url: 'https://www.nimh.nih.gov/health/topics/autism-spectrum-disorders-asd',
      },
    ],
  },
  {
    category: 'IEP & Special Education',
    items: [
      {
        title: 'U.S. Department of Education — IDEA (Individuals with Disabilities Education Act)',
        description: 'Federal law governing special education services and IEP requirements.',
        url: 'https://sites.ed.gov/idea/',
      },
      {
        title: 'Wrightslaw — Special Education Law & Advocacy',
        description: 'Trusted resource for parents on IEP rights, IDEA, and Section 504.',
        url: 'https://www.wrightslaw.com',
      },
      {
        title: 'Colorado Department of Education — Special Education',
        description: 'Colorado-specific guidance on IEPs, evaluations, and parent rights.',
        url: 'https://www.cde.state.co.us/cdesped',
      },
    ],
  },
  {
    category: 'Toilet Training & Sensory',
    items: [
      {
        title: 'American Academy of Pediatrics — Toilet Training',
        description: 'Evidence-based guidance on toilet training readiness and approaches.',
        url: 'https://www.aap.org/en/patient-care/toilet-training/',
      },
      {
        title: 'STAR Institute for Sensory Processing',
        description: 'Research and clinical resources on sensory processing differences.',
        url: 'https://www.spdstar.org',
      },
    ],
  },
  {
    category: 'Diagnosis & Evaluation',
    items: [
      {
        title: 'DSM-5-TR — Diagnostic and Statistical Manual of Mental Disorders',
        description: 'American Psychiatric Association diagnostic criteria for autism and related conditions.',
        url: 'https://www.psychiatry.org/psychiatrists/practice/dsm',
      },
      {
        title: 'American Psychological Association (APA)',
        description: 'Professional standards for psychological evaluation and diagnosis.',
        url: 'https://www.apa.org',
      },
    ],
  },
];

export default function SourcesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sources & Citations</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Our Sources</Text>
          <Text style={styles.introText}>
            All information in Autism Pathways is based on publicly available, authoritative sources.
            This app is for educational purposes only and does not constitute medical, legal, or
            financial advice. Always consult qualified professionals for guidance specific to your
            child's situation.
          </Text>
        </View>

        {SOURCES.map((section) => (
          <View key={section.category} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.category}</Text>
            {section.items.map((item) => (
              <TouchableOpacity
                key={item.url}
                style={styles.sourceCard}
                onPress={() => Linking.openURL(item.url)}
              >
                <View style={styles.sourceContent}>
                  <Text style={styles.sourceTitle}>{item.title}</Text>
                  <Text style={styles.sourceDesc}>{item.description}</Text>
                  <Text style={styles.sourceUrl}>{item.url}</Text>
                </View>
                <Text style={styles.arrow}>↗</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Information is reviewed periodically for accuracy. If you believe any information is
            outdated or incorrect, please contact us at contact@autismpathways.app
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingTop: 56,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  backBtn: { paddingRight: SPACING.sm },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  scroll: { padding: SPACING.lg, paddingBottom: 40 },
  intro: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  introTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  introText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  section: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.purple,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  sourceCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sourceContent: { flex: 1 },
  sourceTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  sourceDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18, marginBottom: 6 },
  sourceUrl: { fontSize: FONT_SIZES.xs, color: COLORS.purple },
  arrow: { fontSize: 16, color: COLORS.purple, marginLeft: SPACING.sm, marginTop: 2 },
  footer: {
    backgroundColor: '#F0F4FF',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  footerText: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18, textAlign: 'center' },
});
