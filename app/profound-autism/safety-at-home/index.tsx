/**
 * Safety at Home — Equipment & planning guide for profound autism.
 * Covers: door alarms, window locks, pool safety, bedroom safety, kitchen safety.
 * Includes Medicaid/waiver funding notes.
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

interface SafetyItem {
  emoji: string;
  title: string;
  body: string;
  products?: string;
  waiver?: string;
}

interface SafetySection {
  id: string;
  emoji: string;
  title: string;
  items: SafetyItem[];
}

const SECTIONS: SafetySection[] = [
  {
    id: 'elopement',
    emoji: '🚪',
    title: 'Elopement Prevention',
    items: [
      {
        emoji: '🔔',
        title: 'Door & Window Alarms',
        body: 'Install door chime alarms on all exterior doors and windows. These alert you immediately when a door or window is opened — critical for children who elope silently.',
        products: 'GE Door/Window Alarm, Doberman Security SE-0106, SimpliSafe door sensors',
        waiver: 'Some waivers cover door alarms as assistive technology — ask your coordinator.',
      },
      {
        emoji: '🔒',
        title: 'High Door Locks',
        body: 'Install deadbolts or door locks at the top of exterior doors, out of reach. Children who elope often cannot reach locks installed at adult height.',
        products: 'Defender Security Door Reinforcement Lock, Top-mount door bolt',
      },
      {
        emoji: '📍',
        title: 'GPS Tracker',
        body: 'A GPS tracker worn on the wrist, ankle, or in a shoe provides real-time location if your child does elope. Critical for children who are fast or who head toward water.',
        products: 'AngelSense (autism-specific), Jiobit, Apple AirTag in shoe',
        waiver: 'Many Medicaid waivers cover GPS trackers — ask your coordinator. AngelSense has a waiver team.',
      },
      {
        emoji: '🏊',
        title: 'Pool & Water Safety',
        body: 'Children with autism are significantly more likely to drown. If you have a pool or live near water, a pool fence with self-closing gate is non-negotiable. Consider swim lessons specifically designed for autism.',
        products: 'Life Saver Pool Fence, Katchakid Pool Safety Net, YMCA autism swim programs',
        waiver: 'Pool fencing may be covered as environmental modification — ask your coordinator.',
      },
    ],
  },
  {
    id: 'bedroom',
    emoji: '🛏️',
    title: 'Bedroom Safety',
    items: [
      {
        emoji: '🛡️',
        title: 'Bed Rails & Padding',
        body: 'For children who fall out of bed, roll, or engage in SIB at night, padded bed rails or a floor bed with padding can prevent injury.',
        products: 'Hiccapop Foam Bed Rail, Safety Sleeper enclosed bed, floor mattress with foam surround',
        waiver: 'Adaptive beds (Safety Sleeper, Nickel Bed) are often covered by waiver as durable medical equipment.',
      },
      {
        emoji: '🔒',
        title: 'Door Knob Covers / Locks',
        body: 'Prevent nighttime wandering with door knob covers or a door alarm on the bedroom door. Some families use a Dutch door so the top half can be open for supervision.',
        products: 'Safety 1st Door Knob Covers, MUNCHKIN Door Knob Covers, Dutch door conversion',
      },
      {
        emoji: '🪟',
        title: 'Window Guards',
        body: 'Install window guards or window stops on second-floor windows. Children with autism may not understand the danger of open windows.',
        products: 'KidCo Window Guard, Dreambaby Window Stop, Window wedge locks',
      },
      {
        emoji: '💡',
        title: 'Night Lights & Sensory Lighting',
        body: 'Reduce nighttime disorientation with motion-activated night lights. Some children with autism are calmed by specific light colors — red-spectrum lights can support melatonin production.',
        products: 'VAVA Night Light, Hatch Rest+ (red light mode), Govee smart bulbs',
      },
    ],
  },
  {
    id: 'kitchen',
    emoji: '🍳',
    title: 'Kitchen & Household Safety',
    items: [
      {
        emoji: '🔒',
        title: 'Cabinet Locks',
        body: 'Install magnetic cabinet locks on cabinets containing cleaning supplies, medications, sharp objects, and unsafe foods. Magnetic locks are harder to defeat than traditional latches.',
        products: 'Safety 1st Magnetic Cabinet Locks, Jool Baby Cabinet Locks',
      },
      {
        emoji: '🚫',
        title: 'Stove Knob Covers',
        body: 'Cover stove knobs to prevent your child from turning on burners unsupervised. This is a critical fire and burn prevention measure.',
        products: 'Stove Knob Covers (Safety 1st), Stove Guard',
      },
      {
        emoji: '🔐',
        title: 'Refrigerator Lock',
        body: 'For children who engage in pica (eating non-food items) or who have food restriction issues, a refrigerator lock prevents unsupervised access.',
        products: 'Jambini Refrigerator Lock, Wappa Baby Fridge Lock',
      },
    ],
  },
  {
    id: 'bathroom',
    emoji: '🚿',
    title: 'Bathroom Safety',
    items: [
      {
        emoji: '🌡️',
        title: 'Hot Water Scald Prevention',
        body: 'Set your water heater to 120°F or below to prevent scalding. Children who don\'t feel pain normally or who can\'t regulate water temperature are at high risk.',
        products: 'Anti-scald device for faucet, Thermostatic mixing valve',
      },
      {
        emoji: '🔒',
        title: 'Toilet Lock',
        body: 'For children who engage in pica or who play in toilet water, a toilet lock prevents unsupervised access.',
        products: 'Safety 1st Toilet Lock, Dreambaby Toilet Lock',
      },
      {
        emoji: '🚪',
        title: 'Bathroom Door Alarm',
        body: 'Install a door alarm on the bathroom door so you know when your child enters unsupervised.',
        products: 'GE Door Alarm, Doberman Security alarm',
      },
    ],
  },
  {
    id: 'identification',
    emoji: '🪪',
    title: 'Identification & Emergency Prep',
    items: [
      {
        emoji: '🆔',
        title: 'ID Bracelet / Shoe Tag',
        body: 'Ensure your child always has identification with their name, diagnosis, and your phone number. Medical ID bracelets and shoe tags are the most reliable options.',
        products: 'American Medical ID, Road ID, Lauren\'s Hope autism ID bracelet',
        waiver: 'ID bracelets may be covered by some waivers as safety equipment.',
      },
      {
        emoji: '📱',
        title: 'Smart911 Registration',
        body: 'Register your child on Smart911 (smart911.com) so that when you call 911, dispatchers automatically see your child\'s photo, diagnosis, and behavioral information before they arrive.',
        products: 'Smart911 (free), First Responder Autism Registry (varies by state)',
      },
      {
        emoji: '🚒',
        title: 'Notify First Responders',
        body: 'Contact your local fire and police departments to register your child. Many departments have autism awareness programs and will note your address for dispatchers.',
      },
      {
        emoji: '📋',
        title: 'Emergency Information Sheet',
        body: 'Create a one-page emergency information sheet with your child\'s photo, diagnosis, communication level, triggers, calming strategies, and emergency contacts. Post it on your refrigerator and share with neighbors.',
      },
    ],
  },
];

export default function SafetyAtHome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    logScreenView('safety_at_home');
    logEvent('tool_opened', { tool: 'Safety at Home' });
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
        <Text style={styles.headerTitle}>Safety at Home</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>🏠 Home Safety for Profound Autism</Text>
          <Text style={styles.introText}>
            Children with profound autism face unique safety risks — elopement, drowning, and injury from self-injurious behavior are among the leading causes of death and serious injury. This guide covers the most important equipment and planning steps.
          </Text>
        </View>

        {/* Waiver note */}
        <View style={styles.waiverNote}>
          <Text style={styles.waiverNoteText}>
            💜 <Text style={styles.waiverNoteBold}>Waiver funding tip:</Text> Many home safety modifications can be covered by Medicaid waivers as "environmental modifications" or "assistive technology." Always ask your waiver coordinator before purchasing.
          </Text>
        </View>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <View key={section.id}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionEmoji}>{section.emoji}</Text>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            {section.items.map((item, idx) => (
              <View key={idx} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                </View>
                <Text style={styles.itemBody}>{item.body}</Text>
                {item.products && (
                  <View style={styles.productsBox}>
                    <Text style={styles.productsLabel}>Products:</Text>
                    <Text style={styles.productsText}>{item.products}</Text>
                  </View>
                )}
                {item.waiver && (
                  <View style={styles.waiverBox}>
                    <Text style={styles.waiverBoxText}>💜 {item.waiver}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}

        {/* NAA Big Red Safety Box */}
        <TouchableOpacity
          style={styles.naaCard}
          onPress={() => Linking.openURL('https://nationalautismassociation.org/resources/big-red-safety-box/')}
          activeOpacity={0.85}
        >
          <Text style={styles.naaTitle}>📦 NAA Big Red Safety Box — Free</Text>
          <Text style={styles.naaText}>
            The National Autism Association offers a free Big Red Safety Box with ID tools, door/window alarms, and safety resources for families of children who elope.
          </Text>
          <Text style={styles.naaLink}>Request yours at nationalautismassociation.org →</Text>
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
  waiverNote: {
    backgroundColor: '#F0EDFF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#C4B5FD',
  },
  waiverNoteText: { fontSize: FONT_SIZES.sm, color: '#4C1D95', lineHeight: 20 },
  waiverNoteBold: { fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  sectionEmoji: { fontSize: 22 },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.text },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
    ...SHADOWS.sm,
  },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  itemEmoji: { fontSize: 20 },
  itemTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, flex: 1 },
  itemBody: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
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
  waiverBoxText: { fontSize: FONT_SIZES.xs, color: '#4C1D95', lineHeight: 18 },
  naaCard: {
    backgroundColor: '#FFF6D8',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: '#FFE58A',
    ...SHADOWS.sm,
    marginTop: SPACING.sm,
  },
  naaTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', color: '#7A6020', marginBottom: SPACING.xs },
  naaText: { fontSize: FONT_SIZES.sm, color: '#7A6020', lineHeight: 20, marginBottom: SPACING.sm },
  naaLink: { fontSize: FONT_SIZES.sm, color: '#7A6020', fontWeight: '600', textDecorationLine: 'underline' },
});
