/**
 * dashboard.tsx — Autism Pathways main dashboard (redesigned)
 *
 * Layout:
 *  1. Header: "Good Morning / Hello, [parent]! / How can we help [child] today?"
 *  2. Brand rainbow accent bar
 *  3. Search bar
 *  4. Priority chips (from onboarding concerns, brand-colored)
 *  5. Upcoming Reminders (next 7 days from stored appointment dates)
 *  6. Your Pathways (transition-style blocks, Observations first)
 *  7. Pinned Tools (3 quick-access tiles)
 *  8. Upgrade banner (non-premium)
 *  9. 1:1 Support callout
 * 10. Bottom nav bar with raised SOS button
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Linking,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsPremium } from '../../hooks/useIsPremium';
import { useLanguage } from '../../lib/LanguageContext';
import { trackPathwayOpened, trackPaywallViewed } from '../../lib/analytics';
import { useActiveChild } from '../../services/childManager';
import { nextAppointmentDate } from '../../lib/serviceNotifications';
import HamburgerMenu from '../../components/HamburgerMenu';

// ─── Brand palette (aligned with lib/theme.ts) ────────────────────────────────
const C = {
  bg:             '#FAFAFC',
  white:          '#FFFFFF',
  purple:         '#7C5CBF',
  purpleDark:     '#5C3EA8',
  purpleLight:    '#B8A0E8',
  lavender:       '#E9E3FF',
  lavenderAccent: '#C5B8F0',
  teal:           '#3BBFA3',
  tealLight:      '#E3F7F1',
  mint:           '#E3F7F1',
  mintAccent:     '#7DD9C0',
  blue:           '#DCEEFF',
  blueAccent:     '#A8CFFF',
  peach:          '#FFE8DC',
  peachAccent:    '#FFBB9A',
  yellow:         '#FFF6D8',
  yellowAccent:   '#FFD97A',
  text:           '#2F2F3A',
  textMid:        '#5A5A72',
  textLight:      '#9090A8',
  border:         '#E8E8F0',
  sos:            '#E05252',
  sosDark:        '#C43A3A',
  // Pathway accent colors (from explore.tsx CAT_META)
  diagnosisAccent: '#5B9BD5',
  medicaidAccent:  '#7C5CBF',
  waiverAccent:    '#3BBFA3',
  iepAccent:       '#D97706',
  pottyAccent:     '#E07B54',
  transitionAccent:'#9D84B7',
};

// Brand rainbow gradient (from app/index.tsx)
const RAINBOW: readonly [string, string, ...string[]] = ['#FF6B6B', '#FFA500', '#FFD93D', '#6BCB77', '#4D96FF', '#9D84B7'];

const SP = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };
const R  = { xs: 6, sm: 10, md: 18, lg: 24, pill: 99 };

// ─── Pathway totals ────────────────────────────────────────────────────────────
const DIAGNOSIS_TOTAL = 8;
const MEDICAID_TOTAL  = 6;
const WAIVER_TOTAL    = 7;
const IEP_TOTAL       = 5;

// ─── Concern → chip config (matches start-here.tsx concerns list) ──────────────
const CONCERN_CHIPS: Record<string, { label: string; icon: string; bg: string; border: string; textColor: string }> = {
  // IDs match profile-setup.tsx journey option IDs exactly
  diagnosis:  { label: 'Diagnosis',  icon: '🔍', bg: C.blue,      border: C.blueAccent,     textColor: '#2C5F8A' },
  medicaid:   { label: 'Medicaid',   icon: '💳', bg: C.lavender,  border: C.lavenderAccent, textColor: C.purpleDark },
  waivers:    { label: 'Waiver',     icon: '🛡️', bg: C.mint,      border: C.mintAccent,     textColor: '#0A7A5A' },
  school:     { label: 'IEP/School', icon: '🏫', bg: C.yellow,    border: C.yellowAccent,   textColor: '#7A6020' },
  behavior:   { label: 'Behavior',   icon: '🧠', bg: C.lavender,  border: C.lavenderAccent, textColor: C.purpleDark },
  speech:     { label: 'Speech',     icon: '🗣️', bg: C.blue,      border: C.blueAccent,     textColor: '#2C5F8A' },
  sensory:    { label: 'Sensory',    icon: '🌊', bg: C.tealLight, border: C.mintAccent,     textColor: '#0A7A5A' },
  sleep:      { label: 'Sleep',      icon: '🌙', bg: C.yellow,    border: C.yellowAccent,   textColor: '#7A6020' },
  transition: { label: 'Transition', icon: '🎓', bg: C.peach,     border: C.peachAccent,    textColor: '#8A2C4A' },
  family:     { label: 'Family',     icon: '❤️', bg: C.peach,     border: C.peachAccent,    textColor: '#8A2C4A' },
  // legacy keys from old start-here flow (backwards compat)
  providers:  { label: 'Providers',  icon: '🩺', bg: C.blue,      border: C.blueAccent,     textColor: '#2C5F8A' },
  denied:     { label: 'Appeals',    icon: '📁', bg: C.peach,     border: C.peachAccent,    textColor: '#8A2C4A' },
};
const DEFAULT_CHIPS = ['diagnosis', 'medicaid', 'waivers', 'school', 'behavior'];

// ─── Tool tiles config ─────────────────────────────────────────────────────────
const ALL_TOOLS = [
  { id: 'sos',        icon: '🆘', name: 'In-the-Moment',      route: '/parenting-pathways', bg: C.peach,   border: C.peachAccent,    textColor: '#8A2C4A' },
  { id: 'translator', icon: '💬', name: 'Provider Translator', route: '/provider-translator', bg: C.blue,  border: C.blueAccent,     textColor: '#2C5F8A' },
  { id: 'safespace',  icon: '🧘', name: 'Safe Space',          route: '/safe-space',          bg: C.mint,  border: C.mintAccent,     textColor: '#0A7A5A' },
  { id: 'prep',       icon: '🩺', name: 'Provider Prep',       route: '/provider-prep',       bg: C.lavender, border: C.lavenderAccent, textColor: C.purpleDark },
  { id: 'learning',   icon: '📚', name: 'Learning',            route: '/(tabs)/explore',      bg: C.yellow, border: C.yellowAccent,  textColor: '#7A6020' },
];
const DEFAULT_PINNED = ['sos', 'translator', 'safespace'];

// ─── Greeting helper ───────────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning,';
  if (h < 17) return 'Good Afternoon,';
  return 'Good Evening,';
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const router        = useRouter();
  const insets        = useSafeAreaInsets();
  const { t }         = useLanguage();
  const { isPremium } = useIsPremium();
  const { child, childId } = useActiveChild();
  const [menuOpen, setMenuOpen] = useState(false);

  // ── Data state ──────────────────────────────────────────────────────────────
  const [parentName,       setParentName]       = useState('');
  const [profile,          setProfile]          = useState<any>(null);
  const [diagnosisStep,    setDiagnosisStep]    = useState(0);
  const [medicaidProgress, setMedicaidProgress] = useState(0);
  const [waiverProgress,   setWaiverProgress]   = useState(0);
  const [iepProgress,      setIepProgress]      = useState(0);
  const [obsCount,         setObsCount]         = useState(0);
  const [concerns,         setConcerns]         = useState<string[]>([]);
  const [diagApptDate,     setDiagApptDate]     = useState<string | null>(null);
  const [searchQuery,      setSearchQuery]      = useState('');
  const [pinnedTools,      setPinnedTools]      = useState<string[]>(DEFAULT_PINNED);
  const [serviceEvents,    setServiceEvents]    = useState<{ title: string; date: Date; icon: string; color: string }[]>([]);
  const [showPinManager,   setShowPinManager]   = useState(false);
  const [draftPinned,      setDraftPinned]      = useState<string[]>(DEFAULT_PINNED);

  // ── Load all data ────────────────────────────────────────────────────────────
  const loadData = useCallback(async (overrideChildId?: string) => {
    try {
      const resolvedId = overrideChildId ?? childId;
      const ck = (base: string) => resolvedId ? `${base}_${resolvedId}` : base;
      const obsKey = resolvedId ? `ap_observations_${resolvedId}` : 'ap_observations';

      const [
        rawProfile,
        rawParentName,
        rawDiag,      rawDiagFb,
        rawMedicaid,  rawMedicaidFb,
        rawWaiver,    rawWaiverFb,
        rawIep,       rawIepFb,
        rawObs,       rawObsFb,
        rawDiagAppt,
        rawPinned,
      ] = await Promise.all([
        AsyncStorage.getItem('profile'),
        AsyncStorage.getItem('ap_parent_first_name'),
        AsyncStorage.getItem(ck('ap_diagnosis_step')),    AsyncStorage.getItem('ap_diagnosis_step'),
        AsyncStorage.getItem(ck('ap_medicaid_progress')), AsyncStorage.getItem('ap_medicaid_progress'),
        AsyncStorage.getItem(ck('ap_waiver_progress')),   AsyncStorage.getItem('ap_waiver_progress'),
        AsyncStorage.getItem(ck('ap_iep_progress')),      AsyncStorage.getItem('ap_iep_progress'),
        AsyncStorage.getItem(obsKey),                     AsyncStorage.getItem('ap_observations'),
        AsyncStorage.getItem('diagnosis_appointment_date'),
        AsyncStorage.getItem('ap_pinned_tools'),
      ]);

      if (rawParentName) setParentName(rawParentName);

      // Provider Mode: redirect to provider dashboard
      // Cross-check against stored profile to prevent stale flag from affecting parent accounts
      const isProvider = await AsyncStorage.getItem('ap_is_provider');
      const profileIsProvider = rawProfile ? JSON.parse(rawProfile)?.isProvider === true : false;
      if (isProvider === 'true' && profileIsProvider) {
        router.replace('/provider-dashboard' as any);
        return;
      } else if (isProvider === 'true' && !profileIsProvider) {
        // Stale flag — clean it up
        await AsyncStorage.multiRemove(['ap_is_provider', 'ap_provider_visibility', 'ap_provider_connect_requested']);
      }

      if (rawProfile) {
        const p = JSON.parse(rawProfile);
        setProfile(p);
        if (p.concerns && Array.isArray(p.concerns)) setConcerns(p.concerns);
      }

      setDiagnosisStep(    (rawDiag     ?? rawDiagFb)     ? parseInt((rawDiag     ?? rawDiagFb)!,     10) : 0);
      setMedicaidProgress( (rawMedicaid  ?? rawMedicaidFb) ? parseInt((rawMedicaid  ?? rawMedicaidFb)!, 10) : 0);
      setWaiverProgress(   (rawWaiver   ?? rawWaiverFb)   ? parseInt((rawWaiver   ?? rawWaiverFb)!,   10) : 0);
      setIepProgress(      (rawIep      ?? rawIepFb)      ? parseInt((rawIep      ?? rawIepFb)!,      10) : 0);

      // Observations: count this week's entries
      const obsRaw = rawObs ?? rawObsFb;
      if (obsRaw) {
        try {
          const entries: any[] = JSON.parse(obsRaw);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          const thisWeek = entries.filter((e) => new Date(e.savedAt || e.date || 0) >= weekAgo);
          setObsCount(thisWeek.length);
        } catch { setObsCount(0); }
      } else {
        setObsCount(0);
      }

      if (rawDiagAppt) setDiagApptDate(rawDiagAppt);
      if (rawPinned) {
        try { setPinnedTools(JSON.parse(rawPinned)); } catch { /* keep default */ }
      }

      // Load service tracker events for the next 30 days
      try {
        const rawServices = await AsyncStorage.getItem('ap_services_tracker_v2');
        if (rawServices) {
          const services: any[] = JSON.parse(rawServices);
          const now = new Date();
          const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          const events: { title: string; date: Date; icon: string; color: string }[] = [];
          for (const svc of services) {
            if (svc.status === 'ended' || svc.status === 'paused') continue;
            const nextDate = nextAppointmentDate(
              svc.scheduleMode,
              svc.scheduleDays || [],
              svc.scheduleTime || '09:00',
              svc.occasionalDate,
            );
            if (nextDate && nextDate <= thirtyDays) {
              events.push({
                title: svc.customType || svc.type || 'Service',
                date: nextDate,
                icon: '📅',
                color: C.teal,
              });
            }
          }
          events.sort((a, b) => a.date.getTime() - b.date.getTime());
          setServiceEvents(events.slice(0, 5));
        }
      } catch { /* ignore */ }
    } catch (_) {}
  }, [childId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));
  useEffect(() => { if (childId) loadData(childId); }, [childId]);

  // ── Derived display values ───────────────────────────────────────────────────
  const displayName    = child?.name || profile?.childName || t('your child', 'tu hijo/a');
  const parentFirst    = parentName || '';
  const greeting       = getGreeting();
  const activeConcerns = concerns.length > 0 ? concerns : DEFAULT_CHIPS;

  // ── Upcoming reminders (next 30 days) ──────────────────────────────────────────
  const upcomingReminders: { title: string; date: Date; icon: string; color: string }[] = [];
  if (diagApptDate && diagApptDate !== 'pending') {
    const apptDate = new Date(diagApptDate);
    const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    if (apptDate <= thirtyDays && apptDate >= new Date()) {
      upcomingReminders.push({
        title: t('Diagnosis Appointment', 'Cita de Diagnóstico'),
        date: apptDate,
        icon: '\uD83D\uDD0D',
        color: C.diagnosisAccent,
      });
    }
  }
  for (const evt of serviceEvents) {
    upcomingReminders.push(evt);
  }
  upcomingReminders.sort((a, b) => a.date.getTime() - b.date.getTime());

  const formatReminderDate = (d: Date) => {
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    if (d.toDateString() === today.toDateString()) return t('Today', 'Hoy') + ', ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === tomorrow.toDateString()) return t('Tomorrow', 'Mañana') + ', ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ', ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const addToCalendar = (title: string, date: Date) => {
    const start = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const end = new Date(date.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const url = Platform.OS === 'ios'
      ? `calshow:${Math.floor(date.getTime() / 1000)}`
      : `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}`;
    Linking.openURL(url).catch(() => {});
  };

  // ── Pathway cards ─────────────────────────────────────────────────────────────
  const PATHWAY_CARDS = [
    {
      id: 'observations',
      icon: '📓',
      name: t('Observations', 'Observaciones'),
      route: '/observations',
      progress: Math.min(obsCount, 7),
      total: 7,
      sub: obsCount > 0
        ? t(`${obsCount} logged this week`, `${obsCount} registradas esta semana`)
        : t('Tap + to log today', 'Toca + para registrar hoy'),
      accent: 'rainbow' as const,
      iconBg: C.lavender,
      quickAdd: '/observations/new-entry',
    },
    ...(diagnosisStep > 0 ? [{
      id: 'diagnosis',
      icon: '🔍',
      name: t('Diagnosis Journey', 'Camino al Diagnóstico'),
      route: '/diagnosis',
      progress: diagnosisStep,
      total: DIAGNOSIS_TOTAL,
      sub: t(`Step ${Math.min(diagnosisStep + 1, DIAGNOSIS_TOTAL)} of ${DIAGNOSIS_TOTAL}`, `Paso ${Math.min(diagnosisStep + 1, DIAGNOSIS_TOTAL)} de ${DIAGNOSIS_TOTAL}`),
      accent: C.diagnosisAccent,
      iconBg: C.blue,
      quickAdd: null as null,
    }] : []),
    ...(medicaidProgress > 0 ? [{
      id: 'medicaid',
      icon: '💳',
      name: t('Medicaid', 'Medicaid'),
      route: '/medicaid',
      progress: medicaidProgress,
      total: MEDICAID_TOTAL,
      sub: t(`Step ${Math.min(medicaidProgress + 1, MEDICAID_TOTAL)} of ${MEDICAID_TOTAL}`, `Paso ${Math.min(medicaidProgress + 1, MEDICAID_TOTAL)} de ${MEDICAID_TOTAL}`),
      accent: C.medicaidAccent,
      iconBg: C.lavender,
      quickAdd: null as null,
    }] : []),
    ...(iepProgress > 0 ? [{
      id: 'iep',
      icon: '🏫',
      name: t('IEP Journey', 'Camino IEP'),
      route: '/iep',
      progress: iepProgress,
      total: IEP_TOTAL,
      sub: t(`Step ${Math.min(iepProgress + 1, IEP_TOTAL)} of ${IEP_TOTAL}`, `Paso ${Math.min(iepProgress + 1, IEP_TOTAL)} de ${IEP_TOTAL}`),
      accent: C.iepAccent,
      iconBg: C.yellow,
      quickAdd: null as null,
    }] : []),
    ...(waiverProgress > 0 ? [{
      id: 'waiver',
      icon: '🛡️',
      name: t('Waiver Programs', 'Programas de Waiver'),
      route: '/waiver',
      progress: waiverProgress,
      total: WAIVER_TOTAL,
      sub: t(`Step ${Math.min(waiverProgress + 1, WAIVER_TOTAL)} of ${WAIVER_TOTAL}`, `Paso ${Math.min(waiverProgress + 1, WAIVER_TOTAL)} de ${WAIVER_TOTAL}`),
      accent: C.waiverAccent,
      iconBg: C.mint,
      quickAdd: null as null,
    }] : []),
  ];

  // ── Pinned tool tiles ─────────────────────────────────────────────────────────
  const pinnedTileData = pinnedTools
    .map((id) => ALL_TOOLS.find((tool) => tool.id === id))
    .filter(Boolean)
    .slice(0, 3) as typeof ALL_TOOLS;

  // ── Manage Pinned Tools ──────────────────────────────────────────────────────
  const openPinManager = () => {
    setDraftPinned([...pinnedTools]);
    setShowPinManager(true);
  };

  const toggleDraftPin = (id: string) => {
    setDraftPinned((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) {
        Alert.alert('Limit reached', 'You can pin up to 3 tools. Remove one first.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const savePinnedTools = async () => {
    if (draftPinned.length === 0) {
      Alert.alert('Select at least one tool', 'Please pick at least 1 tool to pin.');
      return;
    }
    setPinnedTools(draftPinned);
    await AsyncStorage.setItem('ap_pinned_tools', JSON.stringify(draftPinned));
    setShowPinManager(false);
  };

  // ── Search handler ────────────────────────────────────────────────────────────
  const handleSearch = (q: string) => {
    if (!q.trim()) return;
    const lower = q.toLowerCase();
    if (lower.includes('medicaid') || lower.includes('insurance'))
      router.push('/medicaid' as any);
    else if (lower.includes('diagnosis') || lower.includes('eval'))
      router.push('/diagnosis' as any);
    else if (lower.includes('iep') || lower.includes('school'))
      router.push('/iep' as any);
    else if (lower.includes('waiver') || lower.includes('hcbs'))
      router.push('/waiver' as any);
    else if (lower.includes('transition') || lower.includes('adult'))
      router.push('/transition' as any);
    else if (lower.includes('observation') || lower.includes('log') || lower.includes('track'))
      router.push('/observations' as any);
    else if (lower.includes('sos') || lower.includes('moment') || lower.includes('meltdown'))
      router.push('/parenting-pathways' as any);
    else if (lower.includes('provider') || lower.includes('translator') || lower.includes('script'))
      router.push('/provider-translator' as any);
    else if (lower.includes('safe') || lower.includes('calm'))
      router.push('/safe-space' as any);
    else if (lower.includes('potty') || lower.includes('toilet'))
      router.push('/potty' as any);
    else
      router.push('/tools' as any);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + SP.md }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.greetingSmall}>{greeting}</Text>
          <Text style={styles.greetingName}>
            {t(`Hello, ${parentFirst || 'there'}!`, `¡Hola, ${parentFirst || 'amigo/a'}!`)}
          </Text>
          <Text style={styles.greetingSub}>
            {t(`How can we help ${displayName} today?`, `¿Cómo podemos ayudar a ${displayName} hoy?`)}
          </Text>
        </View>
        <TouchableOpacity style={styles.avatarCircle} onPress={() => setMenuOpen(true)}>
          {child?.avatar && (child.avatar.startsWith('file://') || child.avatar.startsWith('content://') || child.avatar.startsWith('http')) ? (
            <Image source={{ uri: child.avatar }} style={styles.avatarImage} />
          ) : child?.avatar && /\p{Emoji}/u.test(child.avatar) ? (
            <Text style={styles.avatarEmoji}>{child.avatar}</Text>
          ) : child?.name ? (
            <Text style={styles.avatarText}>
              {child.name.slice(0, 2).toUpperCase()}
            </Text>
          ) : (
            <Text style={styles.avatarText}>
              {(parentFirst || 'A').charAt(0).toUpperCase()}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── RAINBOW BAR ────────────────────────────────────────────────────── */}
      <LinearGradient
        colors={RAINBOW}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.rainbowBar}
      />

      {/* ── SCROLLABLE CONTENT ─────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + (isPremium ? 20 : 90) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={C.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('Search pathways, tools, resources...', 'Buscar caminos, herramientas...')}
            placeholderTextColor={C.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch(searchQuery)}
            returnKeyType="search"
          />
        </View>

        {/* Priority chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
        >
          {activeConcerns.map((id) => {
            const chip = CONCERN_CHIPS[id];
            if (!chip) return null;
            return (
              <TouchableOpacity
                key={id}
                style={[styles.chip, { backgroundColor: chip.bg, borderColor: chip.border }]}
                onPress={() => handleSearch(chip.label)}
                activeOpacity={0.75}
              >
                <Text style={styles.chipIcon}>{chip.icon}</Text>
                <Text style={[styles.chipLabel, { color: chip.textColor }]}>{chip.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── UPCOMING EVENTS (next 30 days) ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>{t('UPCOMING EVENTS', 'PRÓXIMOS EVENTOS')}</Text>
            <TouchableOpacity onPress={() => router.push('/services-tracker' as any)}>
              <Text style={styles.seeAll}>{t('Services Tracker', 'Rastreador')}</Text>
            </TouchableOpacity>
          </View>
          {upcomingReminders.length === 0 ? (
            <View style={styles.upcomingEmptyCard}>
              <Text style={styles.upcomingEmptyIcon}>✅</Text>
              <Text style={styles.upcomingEmptyTitle}>{t("You're all caught up!", '¡Estás al día!')}</Text>
              <Text style={styles.upcomingEmptySub}>{t('No events in the next 30 days.', 'Sin eventos en los próximos 30 días.')}</Text>
              <TouchableOpacity
                style={styles.upcomingAddBtn}
                onPress={() => router.push('/services-tracker' as any)}
              >
                <Text style={styles.upcomingAddBtnText}>{t('+ Add to Services Tracker', '+ Agregar al Rastreador')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            upcomingReminders.map((r, i) => (
              <View key={i} style={styles.reminderCard}>
                <View style={[styles.reminderAccent, { backgroundColor: r.color }]} />
                <View style={[styles.reminderIconWrap, { backgroundColor: r.color + '22' }]}>
                  <Text style={styles.reminderIcon}>{r.icon}</Text>
                </View>
                <View style={styles.reminderBody}>
                  <Text style={styles.reminderTitle}>{r.title}</Text>
                  <Text style={styles.reminderDate}>{formatReminderDate(r.date)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.calendarBtn}
                  onPress={() => addToCalendar(r.title, r.date)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.calendarBtnText}>{t('+ Cal', '+ Cal')}</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* ── YOUR PATHWAYS ──────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>{t('YOUR PATHWAYS', 'TUS CAMINOS')}</Text>
            <TouchableOpacity onPress={() => router.push('/tools' as any)}>
              <Text style={styles.seeAll}>{t('See All', 'Ver Todo')}</Text>
            </TouchableOpacity>
          </View>

          {PATHWAY_CARDS.map((p) => {
            const pct = p.total > 0 ? Math.round((p.progress / p.total) * 100) : 0;
            return (
              <TouchableOpacity
                key={p.id}
                style={styles.pathwayCard}
                onPress={() => { trackPathwayOpened(p.id); router.push(p.route as any); }}
                activeOpacity={0.85}
              >
                {/* Left accent stripe */}
                {p.accent === 'rainbow' ? (
                  <LinearGradient
                    colors={RAINBOW}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.pathwayAccent}
                  />
                ) : (
                  <View style={[styles.pathwayAccent, { backgroundColor: p.accent as string }]} />
                )}

                {/* Icon */}
                <View style={[styles.pathwayIconWrap, { backgroundColor: p.iconBg }]}>
                  <Text style={styles.pathwayIcon}>{p.icon}</Text>
                </View>

                {/* Body */}
                <View style={styles.pathwayBody}>
                  <Text style={styles.pathwayName}>{p.name}</Text>
                  <Text style={styles.pathwaySub}>{p.sub}</Text>
                  <View style={styles.progressTrack}>
                    {p.accent === 'rainbow' ? (
                      <LinearGradient
                        colors={RAINBOW}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressFill, { width: `${Math.max(pct, 4)}%` as any }]}
                      />
                    ) : (
                      <View style={[styles.progressFill, { width: `${Math.max(pct, 4)}%` as any, backgroundColor: p.accent as string }]} />
                    )}
                  </View>
                </View>

                {/* Right: quick-add or resume */}
                {p.quickAdd ? (
                  <TouchableOpacity
                    style={styles.quickAddBtn}
                    onPress={(e) => { e.stopPropagation(); router.push(p.quickAdd as any); }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.quickAddText}>+</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={[styles.resumeLink, { color: p.accent as string }]}>
                    {t('Resume', 'Continuar')} →
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Prompt to start a pathway if only Observations is showing */}
          {PATHWAY_CARDS.length === 1 && (
            <TouchableOpacity
              style={styles.startPathwayPrompt}
              onPress={() => router.push('/tools' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.startPathwayText}>
                🗺️ {t('Start a pathway — tap to explore', 'Comienza un camino — toca para explorar')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── PINNED TOOLS ───────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>{t('PINNED TOOLS', 'HERRAMIENTAS FIJADAS')}</Text>
            <TouchableOpacity onPress={openPinManager} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.seeAll}>{t('Edit', 'Editar')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pinnedRow}>
            {pinnedTileData.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={[styles.pinnedTile, { backgroundColor: tool.bg, borderColor: tool.border }]}
                onPress={() => router.push(tool.route as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.pinnedIcon}>{tool.icon}</Text>
                <Text style={[styles.pinnedLabel, { color: tool.textColor }]}>{tool.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── UPGRADE BANNER (non-premium) / PREMIUM TOOLS BAR (premium) ── */}
        {!isPremium ? (
          <TouchableOpacity
            style={styles.upgradeBannerWrap}
            onPress={() => { trackPaywallViewed('dashboard'); router.push('/paywall/premium-features' as any); }}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[C.purpleDark, C.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeBannerInner}
            >
              <View style={styles.upgradeLeft}>
                <Text style={styles.upgradeTitle}>⭐ {t('Unlock Premium Access', 'Desbloquea el Acceso Premium')}</Text>
                <Text style={styles.upgradeSub}>
                  {t('891+ providers, AI Transition Guide, IEP Recorder, and more.', '891+ proveedores, Guía de Transición IA, y más.')}
                </Text>
              </View>
              <Text style={styles.upgradeArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>⭐ {t('PREMIUM TOOLS', 'HERRAMIENTAS PREMIUM')}</Text>
            </View>
            <View style={styles.premiumToolsRow}>
              {[
                { icon: '🗺️', label: t('Transition\nGuide', 'Guía de\nTransición'), route: '/transition' },
                { icon: '🎙️', label: t('IEP\nRecorder', 'Grabadora\nIEP'), route: '/iep/meeting-recorder' },
                { icon: '🏥', label: t('Provider\nDirectory', 'Directorio'), route: '/provider-directory' },
                { icon: '📊', label: t('Trends', 'Tendencias'), route: '/observations/trends' },
              ].map((tool) => (
                <TouchableOpacity
                  key={tool.route}
                  style={styles.premiumToolTile}
                  onPress={() => router.push(tool.route as any)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.premiumToolIcon}>{tool.icon}</Text>
                  <Text style={styles.premiumToolLabel}>{tool.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── 1:1 SUPPORT CALLOUT ────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.supportCallout}
          onPress={() => router.push('/support' as any)}
          activeOpacity={0.9}
        >
          <View style={styles.supportLeft}>
            <Text style={styles.supportTitle}>💜 {t('Talk to Me Directly', 'Habla Conmigo Directamente')}</Text>
            <Text style={styles.supportSub}>
              {t('Need guidance from a parent who has lived this? Book a 1:1 call.', '¿Necesitas orientación de un padre que lo ha vivido? Reserva una llamada.')}
            </Text>
          </View>
          <Text style={styles.supportArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── BOTTOM NAV BAR ─────────────────────────────────────────────────── */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + SP.xs }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => {}} activeOpacity={0.7}>
          <Ionicons name="home" size={22} color={C.purple} />
          <Text style={[styles.navLabel, { color: C.purple }]}>{t('Home', 'Inicio')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/tools' as any)} activeOpacity={0.7}>
          <Ionicons name="map-outline" size={22} color={C.textLight} />
          <Text style={styles.navLabel}>{t('Pathways', 'Caminos')}</Text>
        </TouchableOpacity>

        {/* SOS — raised center button */}
        <View style={styles.navSosWrap}>
          <TouchableOpacity
            style={styles.sosBtn}
            onPress={() => router.push('/parenting-pathways' as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.sosBtnText}>SOS</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/tools' as any)} activeOpacity={0.7}>
          <Ionicons name="construct-outline" size={22} color={C.textLight} />
          <Text style={styles.navLabel}>{t('Tools', 'Herramientas')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/settings' as any)} activeOpacity={0.7}>
          <Ionicons name="person-outline" size={22} color={C.textLight} />
          <Text style={styles.navLabel}>{t('Profile', 'Perfil')}</Text>
        </TouchableOpacity>
      </View>

      <HamburgerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ── MANAGE PINNED TOOLS MODAL ───────────────────────────────────────────────────── */}
      <Modal visible={showPinManager} animationType="slide" transparent>
        <View style={styles.pinModalOverlay}>
          <View style={styles.pinModalCard}>
            <Text style={styles.pinModalTitle}>{t('Manage Pinned Tools', 'Administrar Herramientas')}</Text>
            <Text style={styles.pinModalSub}>
              {t('Pick up to 3 tools to pin to your dashboard.', 'Elige hasta 3 herramientas para fijar.')}
            </Text>
            {ALL_TOOLS.map((tool) => {
              const isPinned = draftPinned.includes(tool.id);
              return (
                <TouchableOpacity
                  key={tool.id}
                  style={[styles.pinToolRow, isPinned && styles.pinToolRowSelected, { borderColor: isPinned ? C.purple : C.border }]}
                  onPress={() => toggleDraftPin(tool.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.pinToolIcon, { backgroundColor: tool.bg }]}>
                    <Text style={{ fontSize: 22 }}>{tool.icon}</Text>
                  </View>
                  <Text style={[styles.pinToolName, isPinned && { color: C.purple }]}>{tool.name}</Text>
                  <View style={[styles.pinToolCheck, isPinned && styles.pinToolCheckSelected]}>
                    {isPinned && <Text style={styles.pinToolCheckText}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
            <View style={styles.pinModalBtns}>
              <TouchableOpacity style={styles.pinModalCancel} onPress={() => setShowPinManager(false)}>
                <Text style={styles.pinModalCancelText}>{t('Cancel', 'Cancelar')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pinModalSave} onPress={savePinnedTools}>
                <Text style={styles.pinModalSaveText}>{t('Save', 'Guardar')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SP.lg,
    paddingBottom: SP.md,
    backgroundColor: C.white,
  },
  headerLeft: { flex: 1 },
  greetingSmall: { fontSize: 12, color: C.textMid, fontWeight: '500', marginBottom: 2 },
  greetingName:  { fontSize: 24, fontWeight: '700', color: C.text, marginBottom: 2 },
  greetingSub:   { fontSize: 14, color: C.purple, fontWeight: '500' },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.lavender,
    borderWidth: 2,
    borderColor: C.lavenderAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SP.md,
    marginTop: SP.xs,
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: C.purpleDark },
  avatarEmoji: { fontSize: 26 },
  avatarImage: { width: 48, height: 48, borderRadius: 24 },

  // Rainbow bar
  rainbowBar: { height: 3, width: '100%' },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingTop: SP.lg },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: C.border,
    marginHorizontal: SP.lg,
    marginBottom: SP.md,
    paddingHorizontal: SP.md,
    paddingVertical: Platform.OS === 'ios' ? SP.md : SP.sm,
    shadowColor: C.purple,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: { marginRight: SP.sm },
  searchInput: { flex: 1, fontSize: 14, color: C.text },

  // Priority chips
  chipsScroll: { marginBottom: SP.lg },
  chipsContent: { paddingHorizontal: SP.lg, gap: SP.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: R.pill,
    borderWidth: 1,
    paddingHorizontal: SP.md,
    paddingVertical: SP.sm - 1,
    gap: SP.xs,
  },
  chipIcon: { fontSize: 13 },
  chipLabel: { fontSize: 13, fontWeight: '600' },

  // Section
  section: { marginBottom: SP.lg, paddingHorizontal: SP.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SP.md },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: C.textLight, letterSpacing: 0.8 },
  seeAll: { fontSize: 12, color: C.purple, fontWeight: '600' },

  // Reminder card
  upcomingEmptyCard: {
    backgroundColor: C.white,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    padding: SP.lg,
    alignItems: 'center',
    marginBottom: SP.sm,
  },
  upcomingEmptyIcon: { fontSize: 28, marginBottom: SP.xs },
  upcomingEmptyTitle: { fontSize: 15, fontWeight: '700', color: C.textDark, marginBottom: 4 },
  upcomingEmptySub: { fontSize: 13, color: C.textMid, textAlign: 'center', marginBottom: SP.md },
  upcomingAddBtn: {
    backgroundColor: C.lavender,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: C.lavenderAccent,
    paddingHorizontal: SP.md,
    paddingVertical: SP.xs,
  },
  upcomingAddBtnText: { fontSize: 13, fontWeight: '700', color: C.purpleDark },
  calendarBtn: {
    backgroundColor: C.lavender,
    borderRadius: R.sm,
    paddingHorizontal: SP.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.lavenderAccent,
    marginLeft: SP.sm,
  },
  calendarBtnText: { fontSize: 11, fontWeight: '700', color: C.purpleDark },

  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    marginBottom: SP.sm,
    shadowColor: C.purple,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  reminderAccent: { width: 4, alignSelf: 'stretch' },
  reminderIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SP.md,
  },
  reminderIcon: { fontSize: 20 },
  reminderBody: { flex: 1, paddingVertical: SP.md, paddingRight: SP.md },
  reminderTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 2 },
  reminderDate: { fontSize: 13, color: C.textMid },

  // Pathway card (transition-screen block style)
  pathwayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    marginBottom: SP.sm,
    shadowColor: C.purple,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  pathwayAccent: { width: 5, alignSelf: 'stretch' },
  pathwayIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SP.md,
  },
  pathwayIcon: { fontSize: 20 },
  pathwayBody: { flex: 1, paddingVertical: SP.md },
  pathwayName: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 2 },
  pathwaySub:  { fontSize: 12, color: C.textMid, marginBottom: SP.sm },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: C.border,
    overflow: 'hidden',
    marginRight: SP.md,
  },
  progressFill: { height: 5, borderRadius: 3 },
  quickAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SP.md,
  },
  quickAddText: { fontSize: 20, color: C.white, lineHeight: 24, marginTop: -1 },
  resumeLink: { fontSize: 13, fontWeight: '600', marginRight: SP.md },

  // Start pathway prompt
  startPathwayPrompt: {
    backgroundColor: C.lavender,
    borderRadius: R.md,
    padding: SP.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.lavenderAccent,
  },
  startPathwayText: { fontSize: 14, color: C.purpleDark, fontWeight: '600' },

  // Pinned tools
  pinnedRow: { flexDirection: 'row', gap: SP.sm },
  pinnedTile: {
    flex: 1,
    borderRadius: R.sm,
    borderWidth: 1,
    padding: SP.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    shadowColor: C.purple,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  pinnedIcon:  { fontSize: 26, marginBottom: SP.xs },
  pinnedLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },

  // Upgrade banner
  premiumToolsRow: { flexDirection: 'row', gap: SP.sm },
  premiumToolTile: {
    flex: 1,
    backgroundColor: C.lavender,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.lavenderAccent,
    paddingVertical: SP.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
  },
  premiumToolIcon: { fontSize: 22, marginBottom: 4 },
  premiumToolLabel: { fontSize: 10, fontWeight: '700', color: C.purpleDark, textAlign: 'center' },

  upgradeBannerWrap: { marginHorizontal: SP.lg, marginBottom: SP.md, borderRadius: R.md, overflow: 'hidden' },
  upgradeBannerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SP.lg,
  },
  upgradeLeft: { flex: 1 },
  upgradeTitle: { fontSize: 15, fontWeight: '700', color: C.white, marginBottom: 4 },
  upgradeSub:   { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 18 },
  upgradeArrow: { fontSize: 20, color: C.white, marginLeft: SP.md },

  // Support callout
  supportCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SP.lg,
    marginBottom: SP.md,
    backgroundColor: C.lavender,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.lavenderAccent,
    padding: SP.lg,
  },
  supportLeft: { flex: 1 },
  supportTitle: { fontSize: 15, fontWeight: '700', color: C.purpleDark, marginBottom: 4 },
  supportSub:   { fontSize: 13, color: C.textMid, lineHeight: 18 },
  supportArrow: { fontSize: 20, color: C.purple, marginLeft: SP.md },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: SP.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: SP.xs,
  },
  navLabel: { fontSize: 10, color: C.textLight, marginTop: 2, fontWeight: '500' },
  navSosWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: -SP.sm,
  },
  sosBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.sos,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.sosDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 3,
    borderColor: C.white,
  },
  sosBtnText: { fontSize: 13, fontWeight: '800', color: C.white, letterSpacing: 0.5 },

  // Manage Pinned Tools modal
  pinModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  pinModalCard: {
    backgroundColor: C.white, borderTopLeftRadius: R.lg, borderTopRightRadius: R.lg,
    padding: SP.xl, paddingBottom: 40,
  },
  pinModalTitle: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: SP.xs, textAlign: 'center' },
  pinModalSub: { fontSize: 13, color: C.textMid, textAlign: 'center', marginBottom: SP.lg },
  pinToolRow: {
    flexDirection: 'row', alignItems: 'center', gap: SP.md,
    borderWidth: 1.5, borderRadius: R.md, padding: SP.md, marginBottom: SP.sm,
    backgroundColor: C.bg,
  },
  pinToolRowSelected: { backgroundColor: '#F0EDFF' },
  pinToolIcon: { width: 44, height: 44, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center' },
  pinToolName: { flex: 1, fontSize: 15, fontWeight: '600', color: C.text },
  pinToolCheck: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center', backgroundColor: C.white,
  },
  pinToolCheckSelected: { backgroundColor: C.purple, borderColor: C.purple },
  pinToolCheckText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  pinModalBtns: { flexDirection: 'row', gap: SP.md, marginTop: SP.xl },
  pinModalCancel: {
    flex: 1, paddingVertical: SP.md, borderRadius: R.sm,
    backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, alignItems: 'center',
  },
  pinModalCancelText: { fontSize: 15, color: C.textMid, fontWeight: '600' },
  pinModalSave: {
    flex: 2, paddingVertical: SP.md, borderRadius: R.sm,
    backgroundColor: C.purple, alignItems: 'center',
  },
  pinModalSaveText: { fontSize: 15, color: '#fff', fontWeight: '700' },
});
