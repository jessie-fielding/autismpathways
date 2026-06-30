/**
 * Provider Dashboard
 *
 * Home screen shown to users who signed up with role = "Provider".
 * Features:
 *   - Personalised greeting with specialty + county
 *   - Quick-stat mini cards (Families Connected, Resources Saved, County Waitlist, New Updates)
 *   - 2x2 feature grid (Advocate Hub, Learning Center, News Digest, Advocate Encyclopedia)
 *   - Recent Connections section with pending request queue
 *   - Bottom nav bar matching app style
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Dimensions, Platform, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setProviderAvailability, registerProviderProfile, registerPushToken } from '../../services/api';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import { getReceivedRequests, getPendingCount, ConnectionRequest } from '../../services/connections';

const { width } = Dimensions.get('window');
const CARD_W = (width - SPACING.lg * 2 - SPACING.md) / 2;

const FEATURE_CARDS = [
  {
    id: 'advocate-hub',
    title: 'Advocate Hub',
    sub: 'Waivers · Medicaid · IEP by county',
    icon: '📋',
    colors: ['#7C5CBF', '#9B7FD4'] as [string, string],
    route: '/provider-advocate-hub',
    lightText: true,
  },
  {
    id: 'learning',
    title: 'Learning Center',
    sub: 'Research · Guides · CEUs',
    icon: '📖',
    colors: ['#E3F7F1', '#C8EFE6'] as [string, string],
    route: '/provider-learning',
    lightText: false,
  },
  {
    id: 'news',
    title: 'News Digest',
    sub: 'Autism news · Policy updates',
    icon: '📰',
    colors: ['#EEF4FF', '#DDE8FF'] as [string, string],
    route: '/provider-news',
    lightText: false,
  },
  {
    id: 'encyclopedia',
    title: 'Advocate Encyclopedia',
    sub: 'Full resource database',
    icon: '🏛️',
    colors: ['#F3F0FF', '#E6E0FF'] as [string, string],
    route: '/provider-encyclopedia',
    lightText: false,
  },
  {
    id: 'provider-directory',
    title: 'Provider Directory',
    sub: 'Browse & connect with other providers',
    icon: '🗂️',
    colors: ['#FFF7ED', '#FFEDD5'] as [string, string],
    route: '/provider-directory',
    lightText: false,
  },
];

export default function ProviderDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [providerName, setProviderName]     = useState('');
  const [specialty, setSpecialty]           = useState('');
  const [county, setCounty]                 = useState('');
  const [pendingCount, setPendingCount]     = useState(0);
  const [recentRequests, setRecentRequests] = useState<ConnectionRequest[]>([]);
  const [readyToConnect, setReadyToConnect] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const raw = await AsyncStorage.getItem('profile');
        if (raw) {
          const p = JSON.parse(raw);
          // Build display name from title + first + last, fall back to parentName
          const nameParts = [p.providerTitle, p.providerFirstName, p.providerLastName].filter(Boolean);
          const displayName = nameParts.length > 0 ? nameParts.join(' ') : (p.parentName || '');
          setProviderName(displayName);
          setSpecialty(p.providerSpecialty || '');
          setCounty(p.county || '');
        }
        const count = await getPendingCount();
        setPendingCount(count);
        const all = await getReceivedRequests();
        setRecentRequests(all.slice(0, 3));
        const rtcRaw = await AsyncStorage.getItem('provider_ready_to_connect');
        if (rtcRaw !== null) setReadyToConnect(JSON.parse(rtcRaw));
        // Register push token so provider receives notifications for new connection requests
        try {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status === 'granted') {
            const tokenData = await Notifications.getExpoPushTokenAsync();
            if (tokenData?.data) {
              registerPushToken(tokenData.data).catch(() => {});
            }
          }
        } catch { /* non-blocking */ }
        // Sync provider profile to backend on each focus so availability stays current
        const profileRaw = await AsyncStorage.getItem('profile');
        if (profileRaw) {
          const p = JSON.parse(profileRaw);
          const nameParts2 = [p.providerTitle, p.providerFirstName, p.providerLastName].filter(Boolean);
          const displayName2 = nameParts2.length > 0 ? nameParts2.join(' ') : (p.parentName || 'Provider');
          // openToConnect: profile visibility setting OR the live toggle
          const profileOpenToConnect = p.providerVisibility === 'connect';
          const currentRtc = rtcRaw !== null ? JSON.parse(rtcRaw) : profileOpenToConnect;
          registerProviderProfile({
            providerName: displayName2,
            practiceName: p.practiceName || null,
            specialty: p.providerSpecialty || 'General',
            state: p.state || null,
            county: p.county || null,
            phone: p.providerPhone || null,
            website: p.providerWebsite || null,
            bio: p.providerBio || null,
            tags: p.providerTags
              ? p.providerTags.split(',').map((t: string) => t.trim()).filter(Boolean)
              : (p.providerReasons || []),
            openToConnect: profileOpenToConnect || currentRtc,
            acceptingNew: p.acceptingNew !== undefined ? !!p.acceptingNew : true,
            medicaidAccepted: !!p.medicaidAccepted,
            telehealth: !!p.telehealth,
          }).catch(() => {});
        }
      })();
    }, [])
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + SPACING.md, paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {providerName ? providerName.slice(0, 2).toUpperCase() : 'DR'}
            </Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{greeting()}{providerName ? `, ${providerName}` : ''}!</Text>
            <Text style={styles.greetingSub}>
              {[county, specialty].filter(Boolean).join(' · ') || 'Provider Mode'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.settingsBtn}>
            <Ionicons name="settings-outline" size={22} color={COLORS.textMid} />
          </TouchableOpacity>
        </View>

        {/* Availability toggle */}
        <View style={styles.availabilityCard}>
          <View style={styles.availabilityLeft}>
            <Text style={styles.availabilityTitle}>
              {readyToConnect ? '🟢 Ready to Connect' : '⚪ Browse Only'}
            </Text>
            <Text style={styles.availabilitySub}>
              {readyToConnect
                ? 'Families can send you introduction requests'
                : 'You are browsing only — families cannot request a connection'}
            </Text>
          </View>
          <Switch
            value={readyToConnect}
            onValueChange={async (val) => {
              setReadyToConnect(val);
              await AsyncStorage.setItem('provider_ready_to_connect', JSON.stringify(val));
              // Sync to shared backend so parents can see live availability
              setProviderAvailability(val).catch(() => {});
            }}
            trackColor={{ false: COLORS.border, true: COLORS.teal }}
            thumbColor={readyToConnect ? '#fff' : '#f4f3f4'}
          />
        </View>
        {/* Claim existing profile CTA */}
        <TouchableOpacity
          style={styles.claimBanner}
          onPress={() => router.push('/claim-profile' as any)}
          activeOpacity={0.85}
        >
          <Text style={styles.claimBannerIcon}>🔗</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.claimBannerTitle}>Already in the directory?</Text>
            <Text style={styles.claimBannerSub}>Claim your existing listing to manage it from the app</Text>
          </View>
          <Text style={styles.claimBannerArrow}>→</Text>
        </TouchableOpacity>

        {/* Quick stats */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll} contentContainerStyle={styles.statsContent}>
          {[
            { label: 'Families\nConnected', value: '0', icon: '👥', color: COLORS.purple },
            { label: 'Resources\nSaved', value: '0', icon: '🔖', color: COLORS.teal },
            { label: 'County\nWaitlist', value: '—', icon: '⏳', color: '#E67E22' },
            { label: 'New\nUpdates', value: '2', icon: '🔔', color: COLORS.teal, badge: true },
          ].map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Feature grid */}
        <View style={styles.grid}>
          {FEATURE_CARDS.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[styles.featureCard, { width: CARD_W }]}
              onPress={() => router.push(card.route as any)}
              activeOpacity={0.85}
            >
              <LinearGradient colors={card.colors} style={styles.featureGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.featureIcon}>{card.icon}</Text>
                <Text style={[styles.featureTitle, card.lightText && styles.featureTitleLight]}>{card.title}</Text>
                <Text style={[styles.featureSub, card.lightText && styles.featureSubLight]}>{card.sub}</Text>
                <View style={[styles.featureArrow, card.lightText && styles.featureArrowLight]}>
                  <Ionicons name="chevron-forward" size={14} color={card.lightText ? '#fff' : COLORS.purple} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Connections */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Connections</Text>
            {pendingCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingCount} pending</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => router.push('/provider-connections' as any)}>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>

          {recentRequests.length === 0 ? (
            <View style={styles.emptyConnections}>
              <Text style={styles.emptyIcon}>🤝</Text>
              <Text style={styles.emptyTitle}>No connections yet</Text>
              <Text style={styles.emptySub}>When families request an introduction, they'll appear here for you to review.</Text>
            </View>
          ) : (
            recentRequests.map((req) => (
              <View key={req.id} style={styles.connectionRow}>
                <View style={styles.connectionAvatar}>
                  <Text style={styles.connectionAvatarText}>
                    {req.requesterName.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.connectionBody}>
                  <Text style={styles.connectionName}>{req.requesterName}</Text>
                  <Text style={styles.connectionMeta}>
                    {req.status === 'pending' ? 'requested intro' : req.status} · {formatTime(req.createdAt)}
                  </Text>
                </View>
                {req.status === 'pending' && (
                  <TouchableOpacity
                    style={styles.respondBtn}
                    onPress={() => router.push('/provider-connections' as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.respondBtnText}>Respond</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom nav */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 4 }]}>
        {[
          { icon: 'home', label: 'Home', route: '/provider-dashboard', active: true },
          { icon: 'clipboard-outline', label: 'Advocate Hub', route: '/provider-advocate-hub' },
          { icon: 'book-outline', label: 'Learning', route: '/provider-learning' },
          { icon: 'newspaper-outline', label: 'News', route: '/provider-news' },
          { icon: 'person-outline', label: 'Profile', route: '/settings' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.label}
            style={styles.navTab}
            onPress={() => router.push(tab.route as any)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon as any}
              size={22}
              color={tab.active ? COLORS.purple : COLORS.textLight}
            />
            <Text style={[styles.navLabel, tab.active && styles.navLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: SPACING.lg, gap: SPACING.lg },
  // Header
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  avatarCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.lavender ?? '#EDE9FF', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.purple },
  avatarText: { fontSize: FONT_SIZES.md, fontWeight: '800', color: COLORS.purple },
  headerText: { flex: 1 },
  greeting: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },
  greetingSub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  settingsBtn: { padding: SPACING.xs },
  // Stats
  availabilityCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: SPACING.md, ...SHADOWS.sm },
  availabilityLeft: { flex: 1 },
  availabilityTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  availabilitySub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2, lineHeight: 16 },
  statsScroll: { marginHorizontal: -SPACING.lg },
  statsContent: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  statCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', minWidth: 88, ...SHADOWS.sm },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: FONT_SIZES.xl, fontWeight: '800' },
  statLabel: { fontSize: 10, color: COLORS.textLight, textAlign: 'center', marginTop: 2, lineHeight: 14 },
  // Feature grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  featureCard: { borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.sm },
  featureGradient: { padding: SPACING.md, minHeight: 130, justifyContent: 'space-between' },
  featureIcon: { fontSize: 28, marginBottom: SPACING.xs },
  featureTitle: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.text },
  featureTitleLight: { color: '#fff' },
  featureSub: { fontSize: 10, color: COLORS.textLight, marginTop: 2, lineHeight: 14 },
  featureSubLight: { color: 'rgba(255,255,255,0.8)' },
  featureArrow: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(108,78,255,0.12)', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  featureArrowLight: { backgroundColor: 'rgba(255,255,255,0.25)' },
  // Section
  section: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, ...SHADOWS.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, gap: SPACING.sm },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, flex: 1 },
  badge: { backgroundColor: COLORS.purple, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  viewAll: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' },
  // Empty state
  emptyConnections: { alignItems: 'center', paddingVertical: SPACING.lg, gap: SPACING.sm },
  emptyIcon: { fontSize: 36 },
  emptyTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  emptySub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, textAlign: 'center', lineHeight: 18 },
  // Connection rows
  connectionRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  connectionAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.lavender ?? '#EDE9FF', alignItems: 'center', justifyContent: 'center' },
  connectionAvatarText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.purple },
  connectionBody: { flex: 1 },
  connectionName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  connectionMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  respondBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs + 2 },
  respondBtnText: { fontSize: FONT_SIZES.xs, color: '#fff', fontWeight: '700' },
  // Claim banner
  claimBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F0FF', borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.sm, borderWidth: 1, borderColor: COLORS.purple + '30' },
  claimBannerIcon: { fontSize: 22 },
  claimBannerTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.purple },
  claimBannerSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginTop: 2 },
  claimBannerArrow: { fontSize: FONT_SIZES.md, color: COLORS.purple, fontWeight: '700' },
  // Bottom nav
  bottomNav: { flexDirection: 'row', backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm },
  navTab: { flex: 1, alignItems: 'center', gap: 2 },
  navLabel: { fontSize: 10, color: COLORS.textLight },
  navLabelActive: { color: COLORS.purple, fontWeight: '600' },
});
