/**
 * Community — Organizations and support for profound autism families.
 * NCSA, NAA, ASAT, TACA, and online communities.
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

interface Org {
  emoji: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  category: string;
}

const ORGS: Org[] = [
  {
    emoji: '🏛️',
    name: 'National Council on Severe Autism (NCSA)',
    tagline: 'Advocacy for the most affected',
    description: 'The leading advocacy organization specifically focused on profound autism and severe behavioral needs. Maintains a national program directory, publishes research, and advocates for appropriate services.',
    url: 'https://www.ncsautism.org',
    category: 'Advocacy',
  },
  {
    emoji: '🦺',
    name: 'National Autism Association (NAA)',
    tagline: 'Safety, elopement, and family support',
    description: 'Focused on safety, elopement prevention, and family support. Offers the free Big Red Safety Box with ID tools and door alarms. Maintains a wandering/elopement resource center.',
    url: 'https://nationalautismassociation.org',
    category: 'Safety & Support',
  },
  {
    emoji: '🔬',
    name: 'Association for Science in Autism Treatment (ASAT)',
    tagline: 'Evidence-based treatment guidance',
    description: 'Provides evidence-based information about autism treatments. Helps families evaluate treatment claims and avoid ineffective or harmful interventions.',
    url: 'https://www.asatonline.org',
    category: 'Research & Evidence',
  },
  {
    emoji: '🤝',
    name: 'TACA (Talk About Curing Autism)',
    tagline: 'Medical and family support',
    description: 'Provides support, education, and resources for families of children with autism, with a focus on medical approaches and family navigation.',
    url: 'https://tacanow.org',
    category: 'Family Support',
  },
  {
    emoji: '⚖️',
    name: 'Autism Society of America',
    tagline: 'Local chapters nationwide',
    description: 'The oldest autism organization in the US. Has local chapters in most states that provide community support, resources, and advocacy.',
    url: 'https://autismsociety.org',
    category: 'Community',
  },
  {
    emoji: '🧠',
    name: 'Autism Science Foundation',
    tagline: 'Research funding and science communication',
    description: 'Funds autism research and communicates science to families. Provides accessible summaries of current research.',
    url: 'https://autismsciencefoundation.org',
    category: 'Research & Evidence',
  },
  {
    emoji: '🏥',
    name: 'Kennedy Krieger Institute',
    tagline: 'Severe behavior treatment center',
    description: 'Nationally recognized for treatment of severe challenging behaviors in autism and intellectual disability. Inpatient and outpatient programs.',
    url: 'https://www.kennedykrieger.org',
    category: 'Clinical',
  },
  {
    emoji: '📚',
    name: 'ARCH National Respite Network',
    tagline: 'Respite resources by state',
    description: 'Helps families find respite care in their state. Maintains a national directory of respite providers and crisis respite resources.',
    url: 'https://archrespite.org',
    category: 'Respite',
  },
];

const ONLINE_COMMUNITIES = [
  {
    emoji: '👥',
    name: 'Profound Autism Alliance (Facebook)',
    description: 'Private Facebook group for families of individuals with profound autism. Moderated, supportive community.',
    url: 'https://www.facebook.com/groups/profoundautismalliance',
  },
  {
    emoji: '💬',
    name: 'Autism Parenting Magazine Community',
    description: 'Online community with resources and peer support for autism families.',
    url: 'https://www.autismparentingmagazine.com',
  },
  {
    emoji: '🔴',
    name: 'r/Autism_Parenting (Reddit)',
    description: 'Active Reddit community for autism parents. Includes a dedicated thread for severe/profound autism.',
    url: 'https://www.reddit.com/r/Autism_Parenting/',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Advocacy: COLORS.purple,
  'Safety & Support': '#C0392B',
  'Research & Evidence': '#2C7BE5',
  'Family Support': COLORS.teal,
  Community: '#F5A623',
  Clinical: '#1A6B5A',
  Respite: '#6B4F8A',
};

export default function Community() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    logScreenView('community');
    logEvent('tool_opened', { tool: 'Community' });
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
        <Text style={styles.headerTitle}>Community</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>🤝 You Are Not Alone</Text>
          <Text style={styles.introText}>
            These organizations and communities are specifically relevant to families navigating profound autism and severe behavioral needs. They are not generic autism resources — they are for families like yours.
          </Text>
        </View>

        {/* Organizations */}
        <Text style={styles.sectionLabel}>ORGANIZATIONS</Text>
        {ORGS.map((org) => (
          <TouchableOpacity
            key={org.name}
            style={styles.orgCard}
            onPress={() => {
              logEvent('community_org_tapped', { org: org.name });
              Linking.openURL(org.url);
            }}
            activeOpacity={0.85}
          >
            <View style={styles.orgHeader}>
              <Text style={styles.orgEmoji}>{org.emoji}</Text>
              <View style={styles.orgHeaderText}>
                <Text style={styles.orgName}>{org.name}</Text>
                <Text style={styles.orgTagline}>{org.tagline}</Text>
              </View>
              <View style={[styles.categoryBadge, { backgroundColor: (CATEGORY_COLORS[org.category] || COLORS.purple) + '20' }]}>
                <Text style={[styles.categoryBadgeText, { color: CATEGORY_COLORS[org.category] || COLORS.purple }]}>
                  {org.category}
                </Text>
              </View>
            </View>
            <Text style={styles.orgDesc}>{org.description}</Text>
            <Text style={styles.orgLink}>{org.url.replace('https://', '')} →</Text>
          </TouchableOpacity>
        ))}

        {/* Online Communities */}
        <Text style={styles.sectionLabel}>ONLINE COMMUNITIES</Text>
        {ONLINE_COMMUNITIES.map((community) => (
          <TouchableOpacity
            key={community.name}
            style={styles.communityCard}
            onPress={() => {
              logEvent('community_group_tapped', { group: community.name });
              Linking.openURL(community.url);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.communityEmoji}>{community.emoji}</Text>
            <View style={styles.communityText}>
              <Text style={styles.communityName}>{community.name}</Text>
              <Text style={styles.communityDesc}>{community.description}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Bottom note */}
        <View style={styles.bottomNote}>
          <Text style={styles.bottomNoteText}>
            Finding your people — other parents who truly understand what you're living — can be one of the most healing things in this journey.
          </Text>
        </View>
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
  scrollContent: { padding: SPACING.md, gap: SPACING.sm },
  introCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  introTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.xs },
  introText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: COLORS.textLight,
    paddingTop: SPACING.md,
  },
  orgCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  orgHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  orgEmoji: { fontSize: 24, marginTop: 2 },
  orgHeaderText: { flex: 1, gap: 2 },
  orgName: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text, lineHeight: 20 },
  orgTagline: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontStyle: 'italic' },
  categoryBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  categoryBadgeText: { fontSize: 11, fontWeight: '700' },
  orgDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  orgLink: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' },
  communityCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'flex-start',
    ...SHADOWS.sm,
  },
  communityEmoji: { fontSize: 24 },
  communityText: { flex: 1, gap: SPACING.xs },
  communityName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  communityDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 18 },
  bottomNote: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.teal,
    ...SHADOWS.sm,
  },
  bottomNoteText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20, fontStyle: 'italic' },
});
