import { useEffect, useState } from 'react';
import {
  Alert, Linking, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';
import waiverData from '../../data/waiver-data.json';

type Section = { heading: string; content: string };
type CountyData = {
  countyDisplay: string;
  agencyName: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  serviceArea: string[];
  applyInstructions: string | null;
  waivers: { name: string; covers: string[]; note: string }[];
  sections: Section[];
};
type StateData = {
  stateName: string;
  stateOverview: { title: string; body: string } | null;
  counties: Record<string, CountyData>;
};

export default function AgencyCardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ state?: string; county?: string }>();
  const { isPremium } = useIsPremium();
  const [saved, setSaved] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  const stateAbbr = params.state || '';
  const countyKey = params.county || '';

  const stateData = stateAbbr ? (waiverData as Record<string, StateData>)[stateAbbr] : null;
  const countyData = stateData && countyKey ? stateData.counties[countyKey] : null;

  useEffect(() => {
    // Check if already saved
    AsyncStorage.getItem('ap_saved_agencies').then(raw => {
      if (raw) {
        const list = JSON.parse(raw) as string[];
        setSaved(list.includes(`${stateAbbr}_${countyKey}`));
      }
    });
  }, [stateAbbr, countyKey]);

  const handleSave = async () => {
    const raw = await AsyncStorage.getItem('ap_saved_agencies');
    const list: string[] = raw ? JSON.parse(raw) : [];
    const key = `${stateAbbr}_${countyKey}`;
    if (!list.includes(key)) {
      list.push(key);
      await AsyncStorage.setItem('ap_saved_agencies', JSON.stringify(list));
    }
    setSaved(true);
    // Advance waiver progress to at least step 3 (agency saved)
    const cur = parseInt(await AsyncStorage.getItem('ap_waiver_progress') || '0', 10);
    if (cur < 3) await AsyncStorage.setItem('ap_waiver_progress', '3');
    Alert.alert('Saved!', 'This agency has been saved to your profile.');
  };

  const handleShare = async () => {
    if (!countyData) return;
    const text = [
      `${countyData.agencyName || countyData.countyDisplay} — ${stateData?.stateName}`,
      countyData.phone ? `Phone: ${countyData.phone}` : null,
      countyData.website ? `Website: ${countyData.website}` : null,
      countyData.address ? `Address: ${countyData.address}` : null,
      '',
      'Found via Autism Pathways — autismpathways.app',
    ].filter(Boolean).join('\n');
    await Share.share({ message: text });
  };

  const toggleSection = (i: number) => {
    setExpandedSections(prev => ({ ...prev, [i]: !prev[i] }));
  };

  if (!countyData || !stateData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Autism <Text style={styles.headerPurple}>Pathways</Text></Text>
          <View style={{ width: 80 }} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No data found for this county.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>← Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const agencyName = countyData.agencyName || countyData.countyDisplay;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Counties</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Autism <Text style={styles.headerPurple}>Pathways</Text></Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Agency hero card */}
        <View style={styles.agencyHero}>
          <View style={styles.agencyIconWrap}>
            <Text style={styles.agencyIcon}>🏛️</Text>
          </View>
          <Text style={styles.agencyName}>{agencyName}</Text>
          <Text style={styles.agencyLocation}>
            {countyData.countyDisplay} · {stateData.stateName}
          </Text>

          {/* Contact chips */}
          <View style={styles.contactRow}>
            {countyData.phone && (
              <TouchableOpacity
                style={styles.contactChip}
                onPress={() => Linking.openURL(`tel:${countyData.phone!.replace(/[^0-9+]/g, '')}`)}
              >
                <Text style={styles.contactChipEmoji}>📞</Text>
                <Text style={styles.contactChipText}>{countyData.phone}</Text>
              </TouchableOpacity>
            )}
            {countyData.website && (
              <TouchableOpacity
                style={[styles.contactChip, styles.contactChipWeb]}
                onPress={() => Linking.openURL(countyData.website!)}
              >
                <Text style={styles.contactChipEmoji}>🌐</Text>
                <Text style={styles.contactChipText}>Website</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Address */}
        {countyData.address && (
          <TouchableOpacity
            style={styles.addressCard}
            onPress={() => {
              const addr = encodeURIComponent(countyData.address!);
              Linking.openURL(`https://maps.apple.com/?q=${addr}`);
            }}
          >
            <Text style={styles.addressEmoji}>📍</Text>
            <View style={styles.addressContent}>
              <Text style={styles.addressLabel}>ADDRESS</Text>
              <Text style={styles.addressText}>{countyData.address}</Text>
              <Text style={styles.addressLink}>Open in Maps →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Service area */}
        {countyData.serviceArea && countyData.serviceArea.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardEyebrow}>📋 SERVICE AREA</Text>
            <View style={styles.serviceChips}>
              {countyData.serviceArea.map(city => (
                <View key={city} style={styles.serviceChip}>
                  <Text style={styles.serviceChipText}>{city}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* How to apply */}
        {countyData.applyInstructions && (
          <View style={styles.applyCard}>
            <Text style={styles.cardEyebrow}>✅ HOW TO APPLY</Text>
            <Text style={styles.applyText}>{countyData.applyInstructions}</Text>
            {countyData.phone && (
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => Linking.openURL(`tel:${countyData.phone!.replace(/[^0-9+]/g, '')}`)}
              >
                <Text style={styles.callBtnText}>📞 Call to Start Application</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Waivers */}
        {countyData.waivers && countyData.waivers.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>AVAILABLE WAIVERS</Text>
            {countyData.waivers.map((waiver, i) => (
              <View key={i} style={styles.waiverCard}>
                <View style={styles.waiverHeader}>
                  <Text style={styles.waiverEmoji}>📋</Text>
                  <Text style={styles.waiverName}>{waiver.name}</Text>
                </View>
                {waiver.covers && waiver.covers.length > 0 && (
                  <View style={styles.coverChips}>
                    {waiver.covers.map(c => (
                      <View key={c} style={styles.coverChip}>
                        <Text style={styles.coverChipText}>{c}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {waiver.note ? (
                  <Text style={styles.waiverNote}>{waiver.note}</Text>
                ) : null}
              </View>
            ))}
          </>
        )}

        {/* All sections (expandable) */}
        {countyData.sections && countyData.sections.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>FULL DETAILS</Text>
            {countyData.sections.map((section, i) => (
              <TouchableOpacity
                key={i}
                style={styles.sectionCard}
                onPress={() => toggleSection(i)}
                activeOpacity={0.8}
              >
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{section.heading}</Text>
                  <Text style={styles.sectionToggle}>{expandedSections[i] ? '▲' : '▼'}</Text>
                </View>
                {expandedSections[i] && (
                  <Text style={styles.sectionBody}>{section.content}</Text>
                )}
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Important callout */}
        <View style={styles.callout}>
          <Text style={styles.calloutIcon}>⏰</Text>
          <Text style={styles.calloutText}>
            <Text style={styles.calloutBold}>Get on the waitlist now.</Text>
            {' '}Even if your child isn't ready for services yet, applying early is critical. Waitlists can be 2–10+ years. You can always decline services later.
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          {/* Save agency */}
          <TouchableOpacity
            style={[styles.actionBtn, saved && styles.actionBtnSaved]}
            onPress={handleSave}
          >
            <Text style={styles.actionBtnEmoji}>{saved ? '✓' : '🔖'}</Text>
            <Text style={[styles.actionBtnText, saved && styles.actionBtnTextSaved]}>
              {saved ? 'Saved' : 'Save Agency'}
            </Text>
          </TouchableOpacity>

          {/* Premium: Save to contacts */}
          {isPremium ? (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPrimary]}
              onPress={() => {
                // In a real app, use expo-contacts
                Alert.alert(
                  'Save to Contacts',
                  `${agencyName}\n${countyData.phone || ''}\n${countyData.website || ''}`,
                  [{ text: 'OK' }]
                );
              }}
            >
              <Text style={styles.actionBtnEmoji}>👤</Text>
              <Text style={[styles.actionBtnText, styles.actionBtnTextPrimary]}>Add to Contacts</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.actionBtn, styles.actionBtnLocked]}>
              <Text style={styles.actionBtnEmoji}>🔒</Text>
              <Text style={styles.actionBtnTextLocked}>Add to Contacts</Text>
            </View>
          )}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>⚠️ Disclaimer</Text>
          <Text style={styles.disclaimerText}>
            This information is provided as a starting point to help families navigate the system. Agency names, phone numbers, and service areas change frequently. Always verify current information directly with your local agency before taking action. Autism Pathways is not affiliated with any government agency or service provider.
          </Text>
        </View>

        <View style={styles.rainbowBar} />
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
    paddingHorizontal: SPACING.md,
    paddingTop: 56,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { width: 80 },
  backText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  headerPurple: { color: COLORS.purple },
  shareBtn: { width: 80, alignItems: 'flex-end' },
  shareText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: SPACING.xl },

  agencyHero: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  agencyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  agencyIcon: { fontSize: 32 },
  agencyName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 4,
  },
  agencyLocation: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: SPACING.md,
  },
  contactRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: 6,
    ...SHADOWS.sm,
  },
  contactChipWeb: { backgroundColor: 'rgba(255,255,255,0.9)' },
  contactChipEmoji: { fontSize: 14 },
  contactChipText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.purple },

  addressCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.md,
    marginTop: -SPACING.sm,
    padding: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addressEmoji: { fontSize: 22 },
  addressContent: { flex: 1 },
  addressLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textLight, marginBottom: 2 },
  addressText: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '500', lineHeight: 18 },
  addressLink: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600', marginTop: 4 },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  cardEyebrow: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple, marginBottom: SPACING.sm },

  serviceChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  serviceChip: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  serviceChipText: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' },

  applyCard: {
    backgroundColor: '#f0fff4',
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#b2dfdb',
    ...SHADOWS.sm,
  },
  applyText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20, marginBottom: SPACING.md },
  callBtn: {
    backgroundColor: '#2e7d5e',
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    alignItems: 'center',
  },
  callBtnText: { color: COLORS.white, fontSize: FONT_SIZES.sm, fontWeight: '700' },

  sectionHeading: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 0.8,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },

  waiverCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.purple,
    ...SHADOWS.sm,
  },
  waiverHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.xs },
  waiverEmoji: { fontSize: 18 },
  waiverName: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, lineHeight: 20 },
  coverChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: SPACING.xs },
  coverChip: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  coverChipText: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' },
  waiverNote: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: SPACING.xs, fontStyle: 'italic' },

  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    marginHorizontal: SPACING.md,
    marginBottom: 1,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  sectionToggle: { fontSize: FONT_SIZES.xs, color: COLORS.textLight },
  sectionBody: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20, marginTop: SPACING.sm },

  callout: {
    flexDirection: 'row',
    backgroundColor: '#fff8e1',
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: '#f0c040',
  },
  calloutIcon: { fontSize: 18 },
  calloutText: { flex: 1, fontSize: FONT_SIZES.sm, color: '#7a5c00', lineHeight: 20 },
  calloutBold: { fontWeight: '700' },

  actionRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 4,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  actionBtnSaved: { borderColor: '#2e7d5e', backgroundColor: '#f0fff4' },
  actionBtnPrimary: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  actionBtnLocked: { backgroundColor: '#f5f5f5', borderColor: COLORS.border, opacity: 0.6 },
  actionBtnEmoji: { fontSize: 16 },
  actionBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  actionBtnTextSaved: { color: '#2e7d5e' },
  actionBtnTextPrimary: { color: COLORS.white },
  actionBtnTextLocked: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textLight },

  disclaimer: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: '#f8f8f8',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disclaimerTitle: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textLight, marginBottom: 4 },
  disclaimerText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, lineHeight: 16 },

  rainbowBar: { height: 4, backgroundColor: COLORS.purple, marginTop: SPACING.lg },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textLight, marginBottom: SPACING.md },
  backLink: { padding: SPACING.sm },
  backLinkText: { color: COLORS.purple, fontSize: FONT_SIZES.md, fontWeight: '600' },
});
