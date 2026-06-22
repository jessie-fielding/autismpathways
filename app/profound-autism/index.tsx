/**
 * Profound Autism Pathway — Dashboard
 * Entry point for all 10 tools for families of children with profound autism / extreme behaviors.
 * Includes one-time "You Are Not Alone" popup (Jessie's personal note).
 */
import { useEffect, useState } from 'react';
import {
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { logEvent, logScreenView } from '../../lib/analytics';

const POPUP_SEEN_KEY = 'ap_profound_popup_seen';

const TOOLS = [
  {
    emoji: '🆘',
    title: 'SOS+',
    sub: 'Right now help',
    route: '/profound-autism/sos-plus',
    accent: '#C0392B',
    bg: '#FFF0EE',
  },
  {
    emoji: '🗺️',
    title: 'Program Finder',
    sub: 'Specialized programs',
    route: '/profound-autism/program-finder',
    accent: COLORS.purple,
    bg: '#F0EDFF',
  },
  {
    emoji: '🏠',
    title: 'Safety at Home',
    sub: 'Equipment & planning',
    route: '/profound-autism/safety-at-home',
    accent: COLORS.teal,
    bg: '#E3F7F1',
  },
  {
    emoji: '💩',
    title: 'Poop Smearing',
    sub: 'Quiz + tracker',
    route: '/profound-autism/poop-smearing',
    accent: '#8B5E3C',
    bg: '#FDF3E7',
  },
  {
    emoji: '🤔',
    title: 'Is It Pain?',
    sub: 'Medical checklist',
    route: '/profound-autism/is-it-pain',
    accent: '#2C7BE5',
    bg: '#DCEEFF',
  },
  {
    emoji: '💪',
    title: 'Bigger Than Me',
    sub: 'Physical safety guide',
    route: '/profound-autism/bigger-than-me',
    accent: '#7A6020',
    bg: '#FFF6D8',
  },
  {
    emoji: '💊',
    title: 'Medication Guide',
    sub: 'Interactive quiz',
    route: '/profound-autism/medication-guide',
    accent: '#1A6B5A',
    bg: '#E3F7F1',
  },
  {
    emoji: '⏳',
    title: 'Waitlist Survival',
    sub: 'While you wait',
    route: '/profound-autism/waitlist-survival',
    accent: '#6B4F8A',
    bg: '#F0EDFF',
  },
  {
    emoji: '🤝',
    title: 'Community',
    sub: 'Organizations & support',
    route: '/profound-autism/community',
    accent: COLORS.teal,
    bg: '#E3F7F1',
  },
  {
    emoji: '📋',
    title: 'ABC Logger',
    sub: 'Coming Soon',
    route: '/profound-autism/abc-logger',
    accent: COLORS.textLight,
    bg: COLORS.bg,
    comingSoon: true,
  },
];

export default function ProfoundAutismDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    logScreenView('profound_pathway_dashboard');
    logEvent('profound_pathway_opened');
    AsyncStorage.getItem(POPUP_SEEN_KEY).then((seen) => {
      if (!seen) setShowPopup(true);
    });
  }, []);

  const dismissPopup = async () => {
    await AsyncStorage.setItem(POPUP_SEEN_KEY, 'true');
    setShowPopup(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profound Autism</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Text style={styles.bannerEmoji}>🧩</Text>
          </View>
          <Text style={styles.eyebrow}>PROFOUND AUTISM PATHWAY</Text>
          <Text style={styles.bannerTitle}>
            Tools Built for the{'\n'}
            <Text style={styles.bannerTitleAccent}>Hardest Challenges</Text>
          </Text>
          <Text style={styles.bannerSub}>
            For families navigating extreme behaviors, profound autism, and the gaps the system leaves behind.
          </Text>
        </View>

        {/* 988 Banner */}
        <TouchableOpacity
          style={styles.crisisBanner}
          onPress={() => Linking.openURL('tel:988')}
          activeOpacity={0.85}
        >
          <Text style={styles.crisisBannerText}>
            📞 <Text style={styles.crisisBold}>988</Text> — Crisis support, one tap away
          </Text>
          <Text style={styles.crisisSub}>Call or text · No police unless you ask</Text>
        </TouchableOpacity>

        {/* Tools Grid */}
        <Text style={styles.sectionLabel}>YOUR TOOLS</Text>
        <View style={styles.grid}>
          {TOOLS.map((tool) => (
            <TouchableOpacity
              key={tool.title}
              style={[
                styles.toolCard,
                { backgroundColor: tool.bg, borderColor: tool.accent + '40' },
                tool.comingSoon && styles.toolCardDimmed,
              ]}
              onPress={() => {
                logEvent('tool_opened', { tool: tool.title });
                router.push(tool.route as any);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.toolEmoji}>{tool.emoji}</Text>
              <Text style={[styles.toolTitle, { color: tool.accent }]}>{tool.title}</Text>
              <Text style={styles.toolSub}>{tool.sub}</Text>
              {tool.comingSoon && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Soon</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom 988 reminder */}
        <View style={styles.bottomNote}>
          <Text style={styles.bottomNoteText}>
            Throughout this pathway, <Text style={styles.bottomNoteBold}>988</Text> is always one tap away.{'\n'}
            Call or text 988 for yourself or your child — no judgment, no police unless you ask.
          </Text>
        </View>
      </ScrollView>

      {/* You Are Not Alone Popup */}
      <Modal
        visible={showPopup}
        transparent
        animationType="fade"
        onRequestClose={dismissPopup}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🫂</Text>
            <Text style={styles.modalTitle}>You are not alone.</Text>
            <Text style={styles.modalBody}>
              Raising a child with profound autism or extreme behaviors is one of the hardest things a person can do.{'\n\n'}
              These tools were built specifically for families like yours — because you deserve real answers, not platitudes.{'\n\n'}
              We see you.
            </Text>
            <Text style={styles.modalSignoff}>With all the love, Jessie 💜</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={dismissPopup} activeOpacity={0.85}>
              <Text style={styles.modalBtnText}>I'm ready →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  // Banner
  banner: {
    backgroundColor: '#2D1B4E',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  bannerIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  bannerEmoji: { fontSize: 32 },
  eyebrow: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 30,
  },
  bannerTitleAccent: { color: '#FF9B9B' },
  bannerSub: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  // Crisis Banner
  crisisBanner: {
    backgroundColor: '#C0392B',
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  crisisBannerText: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '600' },
  crisisBold: { fontWeight: '800' },
  crisisSub: { color: 'rgba(255,255,255,0.8)', fontSize: FONT_SIZES.xs, marginTop: 2 },
  // Section label
  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: COLORS.textLight,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
  },
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  toolCard: {
    width: '47.5%',
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    padding: SPACING.md,
    gap: SPACING.xs,
    ...SHADOWS.sm,
    position: 'relative',
  },
  toolCardDimmed: { opacity: 0.6 },
  toolEmoji: { fontSize: 26 },
  toolTitle: { fontSize: FONT_SIZES.md, fontWeight: '800', lineHeight: 20 },
  toolSub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, lineHeight: 16 },
  comingSoonBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.textLight,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  comingSoonText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  // Bottom note
  bottomNote: {
    marginHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  bottomNoteText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
    textAlign: 'center',
  },
  bottomNoteBold: { fontWeight: '800', color: '#C0392B' },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xxl,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  modalEmoji: { fontSize: 48, marginBottom: SPACING.md },
  modalTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  modalSignoff: {
    fontSize: FONT_SIZES.md,
    color: COLORS.purple,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  modalBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.pill,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxxl,
    ...SHADOWS.md,
  },
  modalBtnText: { color: '#fff', fontWeight: '800', fontSize: FONT_SIZES.md },
});
