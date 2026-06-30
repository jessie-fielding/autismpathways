import React, { useState, useMemo, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, Linking, Alert, Animated, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import { PROVIDERS, MEDICAL_PROVIDERS, Provider } from '../../lib/providerData';
import { fetchLiveProviders, LiveProvider, LiveProvidersResponse } from '../../services/api';
import { useIsPremium } from '../../hooks/useIsPremium';
import NearMeButton from '../../components/NearMeButton';
import {trackPaywallViewed, trackProviderDirectoryOpened, logScreenView, useScreenTime} from '../../lib/analytics';

const US_STATES = [
  { code: 'ALL', name: 'All States' },
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }, { code: 'DC', name: 'Washington D.C.' },
];

const SPECIALTY_TABS = ['All', 'ABA Therapy', 'Speech & OT', 'Psychiatry', 'Advocacy', 'National Directory', 'Medical'] as const;
type SpecialtyTab = typeof SPECIALTY_TABS[number];

const SPECIALTY_COLORS: Record<string, string> = {
  'ABA Therapy':        COLORS.purple,
  'Speech & OT':        COLORS.teal,
  'Psychiatry':         '#E07B6A',
  'Advocacy':           '#F59E0B',
  'National Directory': '#6366F1',
  'Medical':            '#10B981',
};

const SPECIALTY_EMOJIS: Record<string, string> = {
  'ABA Therapy':        '🧩',
  'Speech & OT':        '🗣️',
  'Psychiatry':         '🧠',
  'Advocacy':           '🤝',
  'National Directory': '🌐',
  'Medical':            '🏥',
};

const MEDICAL_TYPE_LABELS = ['All', 'Pediatrician', 'Dentist', 'Orthodontist'] as const;
type MedicalType = typeof MEDICAL_TYPE_LABELS[number];

const ALL_PROVIDERS = [...PROVIDERS, ...MEDICAL_PROVIDERS];
// Free users see only these 2 featured national providers per specialty
const FREE_FEATURED_IDS = ALL_PROVIDERS
  .filter(p => p.featured || p.states.includes('ALL'))
  .slice(0, 6)
  .map(p => p.id);

// Providers registered through Provider Mode get the On the App! badge.
// Loaded dynamically from AsyncStorage (ap_on_app_provider_ids key).
let _onAppIds = new Set<string>();

function ProviderCard({
  provider,
  onPress,
  isPremium,
  isLocked,
  onAppIds,
}: {
  provider: Provider;
  onPress: () => void;
  isPremium: boolean;
  isLocked: boolean;
  onAppIds: Set<string>;
}) {
  const router = useRouter();
  const isOnApp = onAppIds.has(provider.id);
  const accentColor = SPECIALTY_COLORS[provider.specialty] || COLORS.purple;

  return (
    <TouchableOpacity
      style={[styles.card, isLocked && styles.cardLocked]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Left accent */}
      <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />

      <View style={styles.cardBody}>
        {/* Top row */}
        <View style={styles.cardTopRow}>
          <View style={[styles.cardAvatar, { backgroundColor: accentColor + '18' }]}>
            <Text style={styles.cardEmoji}>{SPECIALTY_EMOJIS[provider.specialty] || '🏥'}</Text>
          </View>
          <View style={styles.cardTitleBlock}>
            <Text style={styles.cardName} numberOfLines={2}>{provider.name}</Text>
            <Text style={styles.cardType} numberOfLines={1}>{provider.type}</Text>
          </View>
          {isLocked && (
            <View style={styles.lockBadge}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          )}
        </View>

        {/* Badges */}
        <View style={styles.cardBadges}>
          {provider.acceptingPatients ? (
            <View style={styles.acceptingBadge}>
              <Text style={styles.acceptingText}>✓ Accepting</Text>
            </View>
          ) : (
            <View style={styles.waitlistBadge}>
              <Text style={styles.waitlistText}>⏳ Waitlist</Text>
            </View>
          )}
          {provider.medicaidAccepted && (
            <View style={styles.medicaidBadge}>
              <Text style={styles.medicaidText}>Medicaid ✓</Text>
            </View>
          )}
          {provider.caregiverVerified && isPremium && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>🏅 Verified</Text>
            </View>
          )}
          {isOnApp && (
            <View style={styles.onAppBadge}>
              <Text style={styles.onAppBadgeText}>💜 On the App!</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {!isLocked && (
          <Text style={styles.cardDesc} numberOfLines={2}>{provider.description}</Text>
        )}

        {/* Tags */}
        {!isLocked && provider.tags.length > 0 && (
          <View style={styles.cardTags}>
            {provider.tags.slice(0, 3).map((tag, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action row */}
        {!isLocked ? (
          <View style={styles.cardActions}>
            {provider.phone && (
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => Linking.openURL(`tel:${provider.phone!.replace(/[^0-9+]/g, '')}`)}
              >
                <Text style={styles.callBtnText}>📞 Call</Text>
              </TouchableOpacity>
            )}
            {isOnApp && (
              <TouchableOpacity
                style={styles.connectBtn}
                onPress={() => router.push({
                  pathname: '/request-connection',
                  params: {
                    providerId: provider.id,
                    providerName: provider.name,
                    providerSpecialty: provider.specialty,
                    providerCounty: (provider as any).county ?? '',
                  },
                })}
                activeOpacity={0.85}
              >
                <Text style={styles.connectBtnText}>💜 Request a Connection</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.detailBtn} onPress={onPress}>
              <Text style={styles.detailBtnText}>View Details →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.lockedHint}>⭐ Unlock with Premium to view details</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ProviderDirectoryScreen() {
  useScreenTime('provider_directory');
  useEffect(() => { logScreenView('provider_directory'); trackProviderDirectoryOpened(); }, []);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isPremium } = useIsPremium();
  const [onAppIds, setOnAppIds] = useState<Set<string>>(new Set());
  const [liveProviders, setLiveProviders] = useState<LiveProvider[]>([]);
  const [adminApprovedProviders, setAdminApprovedProviders] = useState<LiveProvider[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('ap_on_app_provider_ids').then((raw) => {
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        _onAppIds = new Set(ids);
        setOnAppIds(new Set(ids));
      }
    });
  }, []);

  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<SpecialtyTab>('All');

  // Fetch live providers from shared backend
  useEffect(() => {
    fetchLiveProviders(
      selectedState !== 'ALL' ? selectedState : undefined,
      selectedTab !== 'All' ? selectedTab : undefined,
    ).then((resp: LiveProvidersResponse) => {
      setLiveProviders(resp.openToConnect);
      setAdminApprovedProviders(resp.adminApproved);
    }).catch(() => {});
  }, [selectedState, selectedTab]);

  const [selectedMedicalType, setSelectedMedicalType] = useState<MedicalType>('All');
  const [searchText, setSearchText] = useState('');
  const [medicaidOnly, setMedicaidOnly] = useState(false);
  const [acceptingOnly, setAcceptingOnly] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);

  const stateName = US_STATES.find(s => s.code === selectedState)?.name || 'All States';

  const filtered = useMemo(() => {
    let list = ALL_PROVIDERS;

    // State filter
    if (selectedState !== 'ALL') {
      list = list.filter(p => p.states.includes(selectedState) || p.states.includes('ALL'));
    }

    // City filter (Near Me)
    if (selectedCity) {
      list = list.filter(p =>
        !p.city || p.city.toLowerCase().includes(selectedCity.toLowerCase()) || p.states.includes('ALL')
      );
    }

    // Specialty tab
    if (selectedTab !== 'All') {
      list = list.filter(p => p.specialty === selectedTab);
    }

    // Medical sub-type filter
    if (selectedTab === 'Medical' && selectedMedicalType !== 'All') {
      list = list.filter(p => p.medicalType === selectedMedicalType);
    }

    // Search
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Filters
    if (medicaidOnly) list = list.filter(p => p.medicaidAccepted);
    if (acceptingOnly) list = list.filter(p => p.acceptingPatients);

    return list;
  }, [selectedState, selectedCity, selectedTab, selectedMedicalType, searchText, medicaidOnly, acceptingOnly]);

  // Featured = top providers for the selected state
  const featured = useMemo(() => {
    if (selectedState === 'ALL') {
      return ALL_PROVIDERS.filter(p => p.featured).slice(0, 3);
    }
    return ALL_PROVIDERS
      .filter(p => (p.states.includes(selectedState) || p.states.includes('ALL')) && p.featured)
      .slice(0, 3);
  }, [selectedState]);

  // For free users: show 2 providers, rest locked
  const displayList = useMemo(() => {
    if (isPremium) return filtered;
    return filtered.slice(0, 2);
  }, [filtered, isPremium]);

  const lockedCount = isPremium ? 0 : Math.max(0, filtered.length - 2);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Directory</Text>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={() => isPremium ? router.push('/provider-directory/submit') : (trackPaywallViewed('provider_directory'), router.push('/paywall'))}
        >
          <Text style={styles.submitBtnText}>+ Submit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search + Near Me */}
        <View style={styles.searchSection}>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search providers..."
              placeholderTextColor={COLORS.textLight}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
            />
            <NearMeButton
              onStateDetected={(code, _name, city) => { setSelectedState(code); if (city) setSelectedCity(city); }}
              label="📍 Near Me"
              variant="pill"
            />
          </View>

          {/* State picker */}
          <TouchableOpacity
            style={styles.statePickerBtn}
            onPress={() => setShowStatePicker(true)}
          >
            <Text style={styles.statePickerText}>📍 {stateName}</Text>
            <Text style={styles.statePickerChevron}>▼</Text>
          </TouchableOpacity>

          {/* State picker modal - avoids nested ScrollView glitch */}
          <Modal
            visible={showStatePicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowStatePicker(false)}
          >
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
              activeOpacity={1}
              onPress={() => setShowStatePicker(false)}
            />
            <View style={styles.stateModalSheet}>
              <View style={styles.stateModalHandle} />
              <Text style={styles.stateModalTitle}>Select State</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {US_STATES.map(s => (
                  <TouchableOpacity
                    key={s.code}
                    style={[styles.stateOption, selectedState === s.code && styles.stateOptionActive]}
                    onPress={() => { setSelectedState(s.code); setShowStatePicker(false); }}
                  >
                    <Text style={[styles.stateOptionText, selectedState === s.code && styles.stateOptionTextActive]}>
                      {s.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Modal>

          {/* Filter pills */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterPill, medicaidOnly && styles.filterPillActive]}
              onPress={() => setMedicaidOnly(!medicaidOnly)}
            >
              <Text style={[styles.filterPillText, medicaidOnly && styles.filterPillTextActive]}>Medicaid</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterPill, acceptingOnly && styles.filterPillActive]}
              onPress={() => setAcceptingOnly(!acceptingOnly)}
            >
              <Text style={[styles.filterPillText, acceptingOnly && styles.filterPillTextActive]}>Accepting Now</Text>
            </TouchableOpacity>
            {selectedCity && (
              <View style={styles.cityBadge}>
                <Text style={styles.cityBadgeText}>📍 {selectedCity}</Text>
                <TouchableOpacity onPress={() => setSelectedCity(null)}>
                  <Text style={styles.cityBadgeClear}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            {(medicaidOnly || acceptingOnly || selectedState !== 'ALL' || searchText || selectedCity) && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => { setMedicaidOnly(false); setAcceptingOnly(false); setSelectedState('ALL'); setSearchText(''); setSelectedCity(null); }}
              >
                <Text style={styles.clearBtnText}>✕ Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Specialty tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {SPECIALTY_TABS.map(tab => {
            const isActive = selectedTab === tab;
            const color = tab === 'All' ? COLORS.purple : (SPECIALTY_COLORS[tab] || COLORS.purple);
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, isActive && { borderBottomColor: color, borderBottomWidth: 2 }]}
                onPress={() => { setSelectedTab(tab); setSelectedMedicalType('All'); }}
              >
                {tab !== 'All' && <Text style={styles.tabEmoji}>{SPECIALTY_EMOJIS[tab]}</Text>}
                <Text style={[styles.tabText, isActive && { color, fontWeight: '700' }]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Medical sub-type filter */}
        {selectedTab === 'Medical' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.medTypeRow}>
            {MEDICAL_TYPE_LABELS.map(mt => {
              const isActive = selectedMedicalType === mt;
              return (
                <TouchableOpacity
                  key={mt}
                  style={[styles.medTypeChip, isActive && styles.medTypeChipActive]}
                  onPress={() => setSelectedMedicalType(mt)}
                >
                  <Text style={[styles.medTypeText, isActive && styles.medTypeTextActive]}>
                    {mt === 'Pediatrician' ? '👶 Pediatrician' : mt === 'Dentist' ? '🦷 Dentist' : mt === 'Orthodontist' ? '😁 Orthodontist' : 'All Medical'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Featured section */}
        {featured.length > 0 && selectedTab === 'All' && !searchText && (
          <View style={styles.featuredSection}>
            <View style={styles.featuredHeader}>
              <Text style={styles.featuredTitle}>
                ⭐ Best Match{selectedState !== 'ALL' ? ` for ${selectedState}` : ''}
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
              {featured.map(provider => (
                <TouchableOpacity
                  key={provider.id}
                  style={styles.featuredCard}
                  onPress={() => isPremium ? router.push({ pathname: '/provider-directory/detail', params: { id: provider.id } }) : (trackPaywallViewed('provider_directory'), router.push('/paywall'))}
                  activeOpacity={0.8}
                >
                  <View style={[styles.featuredCardTop, { backgroundColor: (SPECIALTY_COLORS[provider.specialty] || COLORS.purple) + '18' }]}>
                    <Text style={styles.featuredEmoji}>{SPECIALTY_EMOJIS[provider.specialty] || '🏥'}</Text>
                    {provider.acceptingPatients ? (
                      <View style={styles.acceptingBadge}>
                        <Text style={styles.acceptingText}>✓ Accepting</Text>
                      </View>
                    ) : (
                      <View style={styles.waitlistBadge}>
                        <Text style={styles.waitlistText}>⏳ Waitlist</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.featuredCardBody}>
                    <Text style={styles.featuredName} numberOfLines={2}>{provider.name}</Text>
                    <Text style={styles.featuredSpecialty}>{provider.specialty}</Text>
                    {provider.medicaidAccepted && (
                      <Text style={styles.featuredMedicaid}>Medicaid ✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Results count */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {isPremium
              ? `${filtered.length} provider${filtered.length !== 1 ? 's' : ''} found`
              : `${Math.min(2, filtered.length)} of ${filtered.length} providers shown`}
          </Text>
        </View>

        {/* Provider list */}
        {displayList.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No providers found</Text>
            <Text style={styles.emptyText}>Try a different state, specialty, or search term.</Text>
          </View>
        )}

        {displayList.map((provider, idx) => (
          <React.Fragment key={provider.id}>
            {/* Inject a live/app provider card every 3 static listings */}
            {idx > 0 && idx % 3 === 0 && liveProviders[Math.floor(idx / 3) - 1] && (() => {
              const lp = liveProviders[Math.floor(idx / 3) - 1];
              return (
                <TouchableOpacity
                  key={`live-${lp.id}-${idx}`}
                  style={styles.weavedLiveCard}
                  onPress={() => router.push({
                    pathname: '/request-connection',
                    params: {
                      providerId: String(lp.deviceId || lp.id),
                      providerName: lp.practiceName || lp.providerName,
                      providerSpecialty: lp.specialty,
                      providerCounty: lp.county || '',
                    },
                  })}
                  activeOpacity={0.85}
                >
                  <View style={styles.weavedLiveAccent} />
                  <View style={styles.weavedLiveAvatar}>
                    <Text style={styles.weavedLiveEmoji}>{SPECIALTY_EMOJIS[lp.specialty] || '🏥'}</Text>
                  </View>
                  <View style={styles.weavedLiveBody}>
                    <View style={styles.weavedLiveBadgeRow}>
                      <View style={styles.weavedLiveOnAppBadge}>
                        <Text style={styles.weavedLiveOnAppText}>💜 On the App</Text>
                      </View>
                      {lp.medicaidAccepted && (
                        <View style={styles.weavedMedicaidBadge}>
                          <Text style={styles.weavedMedicaidText}>Medicaid ✓</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.weavedLiveName}>{lp.practiceName || lp.providerName}</Text>
                    {lp.practiceName ? <Text style={styles.weavedLiveSub}>{lp.providerName}</Text> : null}
                    <Text style={styles.weavedLiveSpecialty}>{lp.specialty}{lp.state ? ` · ${lp.state}` : ''}</Text>
                    {lp.bio ? <Text style={styles.weavedLiveBio} numberOfLines={2}>{lp.bio}</Text> : null}
                  </View>
                  <View style={styles.weavedLiveRequestBtn}>
                    <Text style={styles.weavedLiveRequestText}>Request →</Text>
                  </View>
                </TouchableOpacity>
              );
            })()}
            {/* Inject admin-approved cards at position 2, 5, 8... */}
            {idx > 0 && (idx + 1) % 3 === 0 && adminApprovedProviders[Math.floor(idx / 3)] && (() => {
              const lp = adminApprovedProviders[Math.floor(idx / 3)];
              return (
                <TouchableOpacity
                  key={`admin-${lp.id}-${idx}`}
                  style={[styles.weavedLiveCard, { borderLeftColor: '#10B981' }]}
                  onPress={() => {
                    if (lp.website) Linking.openURL(lp.website);
                    else if (lp.phone) Linking.openURL(`tel:${lp.phone}`);
                  }}
                  activeOpacity={0.85}
                >
                  <View style={[styles.weavedLiveAccent, { backgroundColor: '#10B981' }]} />
                  <View style={[styles.weavedLiveAvatar, { backgroundColor: '#10B98118' }]}>
                    <Text style={styles.weavedLiveEmoji}>{SPECIALTY_EMOJIS[lp.specialty] || '🏥'}</Text>
                  </View>
                  <View style={styles.weavedLiveBody}>
                    <View style={styles.weavedLiveBadgeRow}>
                      <View style={[styles.weavedLiveOnAppBadge, { backgroundColor: '#D1FAE5' }]}>
                        <Text style={[styles.weavedLiveOnAppText, { color: '#065F46' }]}>✅ Verified Listing</Text>
                      </View>
                      {lp.medicaidAccepted && (
                        <View style={styles.weavedMedicaidBadge}>
                          <Text style={styles.weavedMedicaidText}>Medicaid ✓</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.weavedLiveName}>{lp.practiceName || lp.providerName}</Text>
                    {lp.practiceName ? <Text style={styles.weavedLiveSub}>{lp.providerName}</Text> : null}
                    <Text style={styles.weavedLiveSpecialty}>{lp.specialty}{lp.state ? ` · ${lp.state}` : ''}</Text>
                    {lp.bio ? <Text style={styles.weavedLiveBio} numberOfLines={2}>{lp.bio}</Text> : null}
                  </View>
                  <View style={[styles.weavedLiveRequestBtn, { backgroundColor: '#10B98118' }]}>
                    <Text style={[styles.weavedLiveRequestText, { color: '#10B981' }]}>View →</Text>
                  </View>
                </TouchableOpacity>
              );
            })()}
            <ProviderCard
              provider={provider}
              isPremium={isPremium}
              isLocked={false}
              onAppIds={onAppIds}
              onPress={() => router.push({ pathname: '/provider-directory/detail', params: { id: provider.id } })}
            />
          </React.Fragment>
        ))}

        {/* Remaining live/app providers not yet woven in */}
        {liveProviders.slice(Math.max(0, Math.floor(displayList.length / 3))).map((lp) => (
          <TouchableOpacity
            key={`live-tail-${lp.id}`}
            style={styles.weavedLiveCard}
            onPress={() => router.push({
              pathname: '/request-connection',
              params: {
                providerId: String(lp.deviceId || lp.id),
                providerName: lp.practiceName || lp.providerName,
                providerSpecialty: lp.specialty,
                providerCounty: lp.county || '',
              },
            })}
            activeOpacity={0.85}
          >
            <View style={styles.weavedLiveAccent} />
            <View style={styles.weavedLiveAvatar}>
              <Text style={styles.weavedLiveEmoji}>{SPECIALTY_EMOJIS[lp.specialty] || '🏥'}</Text>
            </View>
            <View style={styles.weavedLiveBody}>
              <View style={styles.weavedLiveBadgeRow}>
                <View style={styles.weavedLiveOnAppBadge}>
                  <Text style={styles.weavedLiveOnAppText}>💜 On the App</Text>
                </View>
                {lp.medicaidAccepted && (
                  <View style={styles.weavedMedicaidBadge}>
                    <Text style={styles.weavedMedicaidText}>Medicaid ✓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.weavedLiveName}>{lp.practiceName || lp.providerName}</Text>
              {lp.practiceName ? <Text style={styles.weavedLiveSub}>{lp.providerName}</Text> : null}
              <Text style={styles.weavedLiveSpecialty}>{lp.specialty}{lp.state ? ` · ${lp.state}` : ''}</Text>
              {lp.bio ? <Text style={styles.weavedLiveBio} numberOfLines={2}>{lp.bio}</Text> : null}
            </View>
            <View style={styles.weavedLiveRequestBtn}>
              <Text style={styles.weavedLiveRequestText}>Request →</Text>
            </View>
          </TouchableOpacity>
        ))}
        {/* Remaining admin-approved providers not yet woven in */}
        {adminApprovedProviders.slice(Math.max(0, Math.floor(displayList.length / 3))).map((lp) => (
          <TouchableOpacity
            key={`admin-tail-${lp.id}`}
            style={[styles.weavedLiveCard, { borderLeftColor: '#10B981' }]}
            onPress={() => {
              if (lp.website) Linking.openURL(lp.website);
              else if (lp.phone) Linking.openURL(`tel:${lp.phone}`);
            }}
            activeOpacity={0.85}
          >
            <View style={[styles.weavedLiveAccent, { backgroundColor: '#10B981' }]} />
            <View style={[styles.weavedLiveAvatar, { backgroundColor: '#10B98118' }]}>
              <Text style={styles.weavedLiveEmoji}>{SPECIALTY_EMOJIS[lp.specialty] || '🏥'}</Text>
            </View>
            <View style={styles.weavedLiveBody}>
              <View style={styles.weavedLiveBadgeRow}>
                <View style={[styles.weavedLiveOnAppBadge, { backgroundColor: '#D1FAE5' }]}>
                  <Text style={[styles.weavedLiveOnAppText, { color: '#065F46' }]}>✅ Verified Listing</Text>
                </View>
                {lp.medicaidAccepted && (
                  <View style={styles.weavedMedicaidBadge}>
                    <Text style={styles.weavedMedicaidText}>Medicaid ✓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.weavedLiveName}>{lp.practiceName || lp.providerName}</Text>
              {lp.practiceName ? <Text style={styles.weavedLiveSub}>{lp.providerName}</Text> : null}
              <Text style={styles.weavedLiveSpecialty}>{lp.specialty}{lp.state ? ` · ${lp.state}` : ''}</Text>
              {lp.bio ? <Text style={styles.weavedLiveBio} numberOfLines={2}>{lp.bio}</Text> : null}
            </View>
            <View style={[styles.weavedLiveRequestBtn, { backgroundColor: '#10B98118' }]}>
              <Text style={[styles.weavedLiveRequestText, { color: '#10B981' }]}>View →</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Premium gate */}
        {!isPremium && lockedCount > 0 && (
          <View style={styles.premiumGate}>
            <View style={styles.premiumGateInner}>
              <Text style={styles.premiumGateEmoji}>⭐</Text>
              <Text style={styles.premiumGateTitle}>
                {lockedCount} more provider{lockedCount !== 1 ? 's' : ''} in {stateName}
              </Text>
              <Text style={styles.premiumGateText}>
                Unlock the full directory, Caregiver Verified badges, community reviews, and provider submission with Premium.
              </Text>
              <TouchableOpacity style={styles.premiumGateBtn} onPress={() => (trackPaywallViewed('provider_directory'), router.push('/paywall'))}>
                <Text style={styles.premiumGateBtnText}>Unlock Premium →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Submit CTA */}
        {isPremium && (
          <TouchableOpacity
            style={styles.submitCta}
            onPress={() => router.push('/provider-directory/submit')}
          >
            <Text style={styles.submitCtaEmoji}>🏅</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.submitCtaTitle}>Know a great provider?</Text>
              <Text style={styles.submitCtaText}>Submit them for Caregiver Verification</Text>
            </View>
            <Text style={styles.submitCtaArrow}>→</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: insets.bottom + 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 60 },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },
  submitBtn: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderWidth: 1, borderColor: COLORS.lavenderAccent,
  },
  submitBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple },
  searchSection: { padding: SPACING.lg, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center', marginBottom: SPACING.sm },
  searchInput: {
    flex: 1, backgroundColor: COLORS.bg, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: FONT_SIZES.sm, color: COLORS.text,
  },
  statePickerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.bg, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, marginBottom: SPACING.sm,
  },
  statePickerText: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '600' },
  statePickerChevron: { fontSize: 12, color: COLORS.textMid },
  stateDropdown: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border,
    maxHeight: 200, marginBottom: SPACING.sm,
  },
  stateModalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  stateModalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: SPACING.sm, marginBottom: SPACING.md,
  },
  stateModalTitle: {
    fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  stateOption: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  stateOptionActive: { backgroundColor: COLORS.lavender },
  stateOptionText: { fontSize: FONT_SIZES.sm, color: COLORS.text },
  stateOptionTextActive: { color: COLORS.purple, fontWeight: '700' },
  filterRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  filterPill: {
    borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg,
  },
  filterPillActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  filterPillText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMid },
  filterPillTextActive: { color: COLORS.white },
  clearBtn: {
    borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderWidth: 1, borderColor: COLORS.errorBorder, backgroundColor: COLORS.errorBg,
  },
  clearBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.errorText },
  tabsContainer: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, gap: SPACING.xs },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabEmoji: { fontSize: 14 },
  tabText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, fontWeight: '500' },
  featuredSection: { paddingTop: SPACING.md },
  featuredHeader: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  featuredTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  featuredScroll: { paddingHorizontal: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.sm },
  featuredCard: {
    width: 160, backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', ...SHADOWS.sm,
  },
  featuredCardTop: {
    padding: SPACING.md, alignItems: 'center', gap: SPACING.xs,
  },
  featuredEmoji: { fontSize: 28 },
  featuredCardBody: { padding: SPACING.sm },
  featuredName: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  featuredSpecialty: { fontSize: 11, color: COLORS.textMid },
  featuredMedicaid: { fontSize: 11, color: COLORS.successText, fontWeight: '600', marginTop: 2 },
  resultsHeader: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  resultsCount: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, fontWeight: '600' },
  card: {
    flexDirection: 'row', backgroundColor: COLORS.white, marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden', ...SHADOWS.sm,
  },
  cardLocked: { opacity: 0.7 },
  cardAccent: { width: 4 },
  cardBody: { flex: 1, padding: SPACING.md },
  cardTopRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start', marginBottom: SPACING.sm },
  cardAvatar: {
    width: 40, height: 40, borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center',
  },
  cardEmoji: { fontSize: 20 },
  cardTitleBlock: { flex: 1 },
  cardName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, lineHeight: 18 },
  cardType: { fontSize: 11, color: COLORS.textMid, marginTop: 2 },
  lockBadge: {
    width: 28, height: 28, borderRadius: RADIUS.xs, backgroundColor: COLORS.warningBg,
    alignItems: 'center', justifyContent: 'center',
  },
  lockIcon: { fontSize: 14 },
  cardBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.sm },
  acceptingBadge: {
    backgroundColor: COLORS.successBg, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm,
    paddingVertical: 2, borderWidth: 1, borderColor: COLORS.successBorder,
  },
  acceptingText: { fontSize: 10, fontWeight: '700', color: COLORS.successText },
  waitlistBadge: {
    backgroundColor: COLORS.warningBg, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm,
    paddingVertical: 2, borderWidth: 1, borderColor: COLORS.warningBorder,
  },
  waitlistText: { fontSize: 10, fontWeight: '700', color: COLORS.warningText },
  medicaidBadge: {
    backgroundColor: COLORS.mint, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm,
    paddingVertical: 2, borderWidth: 1, borderColor: COLORS.teal,
  },
  medicaidText: { fontSize: 10, fontWeight: '700', color: COLORS.successText },
  verifiedBadge: {
    backgroundColor: '#FFF8E1', borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm,
    paddingVertical: 2, borderWidth: 1, borderColor: '#F59E0B',
  },
  verifiedText: { fontSize: 10, fontWeight: '700', color: '#92400E' },
  onAppBadge: {
    backgroundColor: '#ffe5db', borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm,
    paddingVertical: 2, borderWidth: 1, borderColor: '#ffb8a0',
  },
  onAppBadgeText: { fontSize: 10, fontWeight: '800', color: '#8B3A1A' },
  connectBtn: {
    flex: 1, backgroundColor: '#ffe5db', borderRadius: RADIUS.pill,
    paddingVertical: SPACING.xs, alignItems: 'center', borderWidth: 1.5, borderColor: '#ffb8a0',
  },
  connectBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#8B3A1A' },
  cardDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 17, marginBottom: SPACING.sm },
  cardTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: SPACING.sm },
  tag: { backgroundColor: COLORS.lavender, borderRadius: 4, paddingHorizontal: SPACING.sm, paddingVertical: 2 },
  tagText: { fontSize: 10, color: COLORS.purpleDark, fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  callBtn: {
    backgroundColor: COLORS.successBg, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs, borderWidth: 1, borderColor: COLORS.successBorder,
  },
  callBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.successText },
  detailBtn: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs, borderWidth: 1, borderColor: COLORS.lavenderAccent,
  },
  detailBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple },
  lockedHint: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontStyle: 'italic', marginTop: SPACING.xs },
  emptyState: { alignItems: 'center', padding: SPACING.xxxl },
  emptyEmoji: { fontSize: 40, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center' },
  premiumGate: { marginHorizontal: SPACING.lg, marginBottom: SPACING.md },
  premiumGateInner: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.lg, padding: SPACING.xl,
    alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.lavenderAccent,
  },
  premiumGateEmoji: { fontSize: 36, marginBottom: SPACING.sm },
  premiumGateTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.purpleDark, marginBottom: SPACING.sm, textAlign: 'center' },
  premiumGateText: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, textAlign: 'center', lineHeight: 18, marginBottom: SPACING.lg },
  premiumGateBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.xxxl, paddingVertical: SPACING.md,
  },
  premiumGateBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.white },
  submitCta: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: '#FFF8E1', marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
    borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: '#F59E0B',
  },
  submitCtaEmoji: { fontSize: 24 },
  submitCtaTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#92400E' },
  submitCtaText: { fontSize: FONT_SIZES.xs, color: COLORS.warningText },
  submitCtaArrow: { fontSize: FONT_SIZES.lg, color: '#92400E', fontWeight: '700' },
  cityBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#E0F2FE', borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderWidth: 1, borderColor: '#7DD3FC',
  },
  cityBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: '#0369A1' },
  cityBadgeClear: { fontSize: 12, color: '#0369A1', fontWeight: '700', paddingLeft: 2 },
  // Weaved live provider cards
  weavedLiveCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.white, marginHorizontal: SPACING.lg, marginBottom: SPACING.sm, borderRadius: RADIUS.lg, padding: SPACING.md, gap: SPACING.sm, borderLeftWidth: 3, borderLeftColor: COLORS.purple, ...SHADOWS.sm },
  weavedLiveAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: COLORS.purple, borderTopLeftRadius: RADIUS.lg, borderBottomLeftRadius: RADIUS.lg },
  weavedLiveAvatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.lavender, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  weavedLiveEmoji: { fontSize: 22 },
  weavedLiveBody: { flex: 1, gap: 3 },
  weavedLiveBadgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  weavedLiveOnAppBadge: { backgroundColor: COLORS.lavender, borderRadius: RADIUS.pill, paddingHorizontal: 8, paddingVertical: 2 },
  weavedLiveOnAppText: { fontSize: 10, color: COLORS.purple, fontWeight: '700' },
  weavedMedicaidBadge: { backgroundColor: '#D1FAE5', borderRadius: RADIUS.pill, paddingHorizontal: 8, paddingVertical: 2 },
  weavedMedicaidText: { fontSize: 10, color: '#065F46', fontWeight: '700' },
  weavedLiveName: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.text },
  weavedLiveSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMid },
  weavedLiveSpecialty: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' },
  weavedLiveBio: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, lineHeight: 16, marginTop: 2 },
  weavedLiveRequestBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.md, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, alignSelf: 'center', flexShrink: 0 },
  weavedLiveRequestText: { fontSize: FONT_SIZES.xs, color: '#fff', fontWeight: '700' },
  liveSection: { marginHorizontal: SPACING.lg, marginTop: SPACING.md, marginBottom: SPACING.sm },
  liveSectionHeader: { marginBottom: SPACING.sm },
  liveSectionTitle: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.purpleDark, marginBottom: 2 },
  liveSectionSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 16 },
  liveCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F5F0FF', borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1.5, borderColor: COLORS.lavenderAccent, ...SHADOWS.sm,
  },
  liveCardLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  liveCardAvatar: {
    width: 40, height: 40, borderRadius: RADIUS.sm, backgroundColor: COLORS.lavender,
    alignItems: 'center', justifyContent: 'center',
  },
  liveCardEmoji: { fontSize: 20 },
  liveCardName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  liveCardPractice: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginTop: 1 },
  liveCardSpecialty: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600', marginTop: 2 },
  liveCardMedicaid: { fontSize: 10, color: COLORS.teal, fontWeight: '700', marginTop: 2 },
  liveCardBadge: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
  },
  liveCardBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.white },
  medTypeRow: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, gap: SPACING.sm },
  medTypeChip: {
    borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderWidth: 1.5, borderColor: '#10B981', backgroundColor: COLORS.white,
  },
  medTypeChipActive: { backgroundColor: '#10B981' },
  medTypeText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#10B981' },
  medTypeTextActive: { color: COLORS.white },
});
