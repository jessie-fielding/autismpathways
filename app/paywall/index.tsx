/**
 * Paywall screen — Premium subscription purchase.
 * Uses react-native-iap v15.2.3 for iOS (StoreKit).
 *
 * Product IDs:
 *   app.autismpathways.premium.sub.annual
 *   app.autismpathways.premium.sub.monthly
 *
 * react-native-iap v15 API notes:
 *   - getSubscriptions({ skus }) to fetch subscription products
 *   - requestPurchase({ type: 'subs', request: { apple: { sku } } }) to purchase
 *   - requestSubscription does NOT exist in v15 — do not import it
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Linking, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  getAvailablePurchases,
  finishTransaction,
  purchaseErrorListener,
  purchaseUpdatedListener,
  presentCodeRedemptionSheetIOS,
  ErrorCode,
  type Purchase,
  type PurchaseError,
} from 'react-native-iap';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';
import { BETA_MODE, IAP_PURCHASED_KEY } from '../../hooks/useIsPremium';

// ── Launch pricing deadline ──────────────────────────────────────────────────
const PRICE_DEADLINE = new Date('2026-06-20T23:59:59-05:00'); // June 20 midnight CT

function useCountdown(target: Date) {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    const days    = Math.floor(diff / 86_400_000);
    const hours   = Math.floor((diff % 86_400_000) / 3_600_000);
    const minutes = Math.floor((diff % 3_600_000)  / 60_000);
    const seconds = Math.floor((diff % 60_000)      / 1_000);
    return { days, hours, minutes, seconds, expired: false };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function CountdownBanner() {
  const { days, hours, minutes, seconds, expired } = useCountdown(PRICE_DEADLINE);
  if (expired) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <View style={countdownStyles.banner}>
      <Text style={countdownStyles.lockIcon}>🔒</Text>
      <View style={countdownStyles.textBlock}>
        <Text style={countdownStyles.headline}>
          🎉 Launch pricing ends June 20th
        </Text>
        <Text style={countdownStyles.sub}>
          Lock in today's rate forever · Try free for 7 days
        </Text>
      </View>
      <View style={countdownStyles.timerBlock}>
        <View style={countdownStyles.timerUnit}>
          <Text style={countdownStyles.timerNum}>{days}</Text>
          <Text style={countdownStyles.timerLabel}>d</Text>
        </View>
        <Text style={countdownStyles.timerColon}>:</Text>
        <View style={countdownStyles.timerUnit}>
          <Text style={countdownStyles.timerNum}>{pad(hours)}</Text>
          <Text style={countdownStyles.timerLabel}>h</Text>
        </View>
        <Text style={countdownStyles.timerColon}>:</Text>
        <View style={countdownStyles.timerUnit}>
          <Text style={countdownStyles.timerNum}>{pad(minutes)}</Text>
          <Text style={countdownStyles.timerLabel}>m</Text>
        </View>
        <Text style={countdownStyles.timerColon}>:</Text>
        <View style={countdownStyles.timerUnit}>
          <Text style={countdownStyles.timerNum}>{pad(seconds)}</Text>
          <Text style={countdownStyles.timerLabel}>s</Text>
        </View>
      </View>
    </View>
  );
}

const countdownStyles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D1B69',
    marginTop: 0,
    marginBottom: 0,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  lockIcon: { fontSize: 22 },
  textBlock: { flex: 1 },
  headline: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  sub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 15,
  },
  timerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  timerUnit: { alignItems: 'center', minWidth: 22 },
  timerNum: {
    fontSize: FONT_SIZES.md,
    fontWeight: '900',
    color: '#C5B8F0',
    lineHeight: 20,
  },
  timerLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  timerColon: {
    fontSize: FONT_SIZES.md,
    fontWeight: '900',
    color: '#C5B8F0',
    marginBottom: 8,
  },
});

const PRODUCT_ID_ANNUAL  = 'app.autismpathways.premium.sub.annual';
const PRODUCT_ID_MONTHLY = 'app.autismpathways.premium.sub.monthly';
const PRODUCT_IDS = [PRODUCT_ID_ANNUAL, PRODUCT_ID_MONTHLY];

const FEATURES = [
  { icon: '🎙️', title: 'IEP Meeting Recorder',           sub: 'Record, transcribe & AI-summarize IEP meetings' },
  { icon: '📋', title: 'Full IEP Goal Tracker',           sub: 'Unlimited goals, meeting notes, and progress logs' },
  { icon: '✨', title: 'AI Transition Guide',             sub: "Personalized action plan based on your child's profile" },
  { icon: '🏥', title: '891+ Provider Directory',         sub: 'All 50 states · 5 specialties · Caregiver Verified' },
  { icon: '🏠', title: 'Group Home & Housing Finder',     sub: 'Waitlist status, contacts, and application tips' },
  { icon: '🎓', title: 'College & Vocational Lookup',     sub: 'Think College programs + VR services by state' },
  { icon: '💼', title: 'Special Needs Jobs Finder',       sub: 'Supported employment, Project SEARCH, and more' },
  { icon: '🏦', title: 'ABLE Account Finder',             sub: 'All 50 states — open an account, save tax-free' },
  { icon: '🔔', title: 'Smart Reminders & Leave Alerts',  sub: 'Services Tracker with drive-time departure alerts' },
  { icon: '🗺️', title: 'All 50-State Waiver & Waivers',  sub: 'Find agencies and waitlist data in every state' },
  { icon: '📰', title: 'Full Article Library',            sub: 'Unlimited access to all guides and explainers' },
];

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [annualPrice, setAnnualPrice]   = useState<string | null>(null);
  const [monthlyPrice, setMonthlyPrice] = useState<string | null>(null);
  const [purchasing, setPurchasing]     = useState(false);
  const [restoring, setRestoring]       = useState(false);
  const [iapReady, setIapReady]         = useState(false);

  const currentPrice = selectedPlan === 'annual' ? annualPrice : monthlyPrice;
  const priceLoaded  = currentPrice !== null;

  const onPurchaseSuccess = useCallback(async () => {
    await AsyncStorage.setItem(IAP_PURCHASED_KEY, 'true');
    setPurchasing(false);
    Alert.alert(
      '🎉 Welcome to Premium!',
      'You now have full access to all Autism Pathways features.',
      [{ text: 'Start Exploring', onPress: () => router.replace('/(tabs)/dashboard') }]
    );
  }, [router]);

  useEffect(() => {
    if (BETA_MODE) return;

    let purchaseUpdateSub: ReturnType<typeof purchaseUpdatedListener> | null = null;
    let purchaseErrorSub: ReturnType<typeof purchaseErrorListener> | null = null;

    const setup = async () => {
      try {
        await initConnection();

        purchaseUpdateSub = purchaseUpdatedListener(async (purchase: Purchase) => {
          try {
            await finishTransaction({ purchase, isConsumable: false });
            await onPurchaseSuccess();
          } catch (e) {
            console.log('finishTransaction error', e);
            setPurchasing(false);
          }
        });

        purchaseErrorSub = purchaseErrorListener((error: PurchaseError) => {
          setPurchasing(false);
          if (error.code !== ErrorCode.UserCancelled) {
            Alert.alert('Purchase Failed', error.message || 'Something went wrong. Please try again.');
          }
        });

        const subs = await fetchProducts({ skus: PRODUCT_IDS, type: 'subs' });
        (subs ?? []).forEach((sub: any) => {
          const price = sub.localizedPrice ?? sub.displayPrice ?? null;
          if (sub.productId === PRODUCT_ID_ANNUAL)  setAnnualPrice(price  ?? '$119.99');
          if (sub.productId === PRODUCT_ID_MONTHLY) setMonthlyPrice(price ?? '$14.99');
        });
        setIapReady(true);
      } catch (e) {
        console.log('IAP setup error', e);
        setAnnualPrice('$119.99');
        setMonthlyPrice('$14.99');
        setIapReady(true);
      }
    };

    setup();

    const fallbackTimer = setTimeout(() => {
      setAnnualPrice(prev => prev ?? '$119.99');
      setMonthlyPrice(prev => prev ?? '$14.99');
      setIapReady(true);
    }, 4000);

    return () => {
      clearTimeout(fallbackTimer);
      purchaseUpdateSub?.remove();
      purchaseErrorSub?.remove();
      endConnection();
    };
  }, [onPurchaseSuccess]);

  const handlePurchase = async () => {
    if (!iapReady) {
      Alert.alert('Not Ready', 'Store connection is still loading. Please try again in a moment.');
      return;
    }
    const productId = selectedPlan === 'annual' ? PRODUCT_ID_ANNUAL : PRODUCT_ID_MONTHLY;
    setPurchasing(true);
    try {
      await requestPurchase({
        type: 'subs',
        request: {
          apple: { sku: productId },
          google: { skus: [productId] },
        },
      });
    } catch (e: any) {
      setPurchasing(false);
      if (e?.code !== ErrorCode.UserCancelled && e?.code !== 'E_USER_CANCELLED') {
        Alert.alert('Error', e?.message || 'Could not start purchase. Please try again.');
      }
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const purchases = await getAvailablePurchases();
      const hasPremium = purchases.some(
        p => p.productId === PRODUCT_ID_ANNUAL || p.productId === PRODUCT_ID_MONTHLY
      );
      if (hasPremium) {
        await AsyncStorage.setItem(IAP_PURCHASED_KEY, 'true');
        Alert.alert('Purchase Restored', 'Your premium access has been restored.',
          [{ text: 'Continue', onPress: () => router.replace('/(tabs)/dashboard') }]
        );
      } else {
        Alert.alert('No Purchase Found', 'We could not find a previous premium purchase on this Apple ID.');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not restore purchases. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  if (BETA_MODE) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.betaContainer}>
          <Text style={styles.betaIcon}>🌟</Text>
          <Text style={styles.betaTitle}>Beta Access Active</Text>
          <Text style={styles.betaSub}>All premium features are fully unlocked for free. Thank you for helping us build Autism Pathways!</Text>
          <TouchableOpacity style={styles.betaBtn} onPress={() => router.replace('/(tabs)/dashboard')} activeOpacity={0.85}>
            <Text style={styles.betaBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <CountdownBanner />
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>🌟</Text>
          <Text style={styles.heroTitle}>Autism Pathways Premium</Text>
          <Text style={styles.heroSub}>Everything you need to navigate the system — diagnosis, Medicaid, IEP, and beyond.</Text>

          <View style={styles.planToggle}>
            <TouchableOpacity style={[styles.planOption, selectedPlan === 'monthly' && styles.planOptionActive]} onPress={() => setSelectedPlan('monthly')} activeOpacity={0.8}>
              <Text style={[styles.planLabel, selectedPlan === 'monthly' && styles.planLabelActive]}>Monthly</Text>
              <Text style={[styles.planPrice, selectedPlan === 'monthly' && styles.planPriceActive]}>{monthlyPrice ?? '$14.99'}</Text>
              <Text style={[styles.planSub, selectedPlan === 'monthly' && styles.planSubActive]}>per month</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.planOption, selectedPlan === 'annual' && styles.planOptionActive]} onPress={() => setSelectedPlan('annual')} activeOpacity={0.8}>
              <View style={styles.planBadgeRow}>
                <Text style={[styles.planLabel, selectedPlan === 'annual' && styles.planLabelActive]}>Annual</Text>
                <View style={styles.saveBadge}><Text style={styles.saveBadgeText}>BEST VALUE</Text></View>
              </View>
              <Text style={[styles.planPrice, selectedPlan === 'annual' && styles.planPriceActive]}>{annualPrice ?? '$119.99'}</Text>
              <Text style={[styles.planSub, selectedPlan === 'annual' && styles.planSubActive]}>~$9.99/mo</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.purchaseBtn, (purchasing || !iapReady) && styles.purchaseBtnDisabled]}
            onPress={handlePurchase}
            activeOpacity={0.85}
            disabled={purchasing || !iapReady}
          >
            {purchasing ? (
              <ActivityIndicator color={COLORS.white} />
            ) : !iapReady ? (
              <Text style={styles.purchaseBtnText}>Connecting…</Text>
            ) : (
              <Text style={styles.purchaseBtnText}>{priceLoaded ? `Get Premium — ${currentPrice}` : 'Get Premium'}</Text>
            )}
          </TouchableOpacity>
          <Text style={styles.priceNote}>{selectedPlan === 'annual' ? `Billed annually at ${annualPrice ?? '$119.99'} · ~$9.99/mo · cancel anytime` : `Billed monthly at ${monthlyPrice ?? '$14.99'} · cancel anytime`}</Text>

          {/* Hardship callout — light blue, above Get Premium in ctaSection */}
          <TouchableOpacity
            style={styles.hardshipCallout}
            onPress={() => router.push('/paywall/hardship-application' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.hardshipCalloutText}>
              💙 I believe everyone deserves affordable access — if you're experiencing difficulty paying,{' '}
              <Text style={styles.hardshipCalloutLink}>there are options for you.</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Everything included</Text>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIconBox}><Text style={styles.featureIcon}>{f.icon}</Text></View>
              <View style={styles.featureBody}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSub}>{f.sub}</Text>
              </View>
              <Text style={styles.featureCheck}>✓</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions</Text>
          <View style={styles.faqCard}>
            <Text style={styles.faqQ}>Can I cancel anytime?</Text>
            <Text style={styles.faqA}>Yes. Cancel through your iPhone Settings → Apple ID → Subscriptions at any time. No questions asked.</Text>
          </View>
          <View style={styles.faqCard}>
            <Text style={styles.faqQ}>Is my data safe?</Text>
            <Text style={styles.faqA}>All your data is stored locally on your device. We never sell your information.</Text>
          </View>
          <View style={styles.faqCard}>
            <Text style={styles.faqQ}>Can I use it on multiple devices?</Text>
            <Text style={styles.faqA}>Yes — tap "Restore Purchase" on any iPhone signed in to the same Apple ID.</Text>
          </View>
        </View>

        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[styles.purchaseBtn, (purchasing || !iapReady) && styles.purchaseBtnDisabled]}
            onPress={handlePurchase}
            activeOpacity={0.85}
            disabled={purchasing || !iapReady}
          >
            {purchasing ? (
              <ActivityIndicator color={COLORS.white} />
            ) : !iapReady ? (
              <Text style={styles.purchaseBtnText}>Connecting…</Text>
            ) : (
              <Text style={styles.purchaseBtnText}>{priceLoaded ? `Get Premium — ${currentPrice}` : 'Get Premium'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore} disabled={restoring} activeOpacity={0.7}>
            {restoring ? <ActivityIndicator color={COLORS.purple} size="small" /> : <Text style={styles.restoreBtnText}>Restore Purchase</Text>}
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={styles.promoBtn}
              onPress={async () => {
                try {
                  await presentCodeRedemptionSheetIOS();
                } catch {
                  // Fallback: open App Store offer code redemption URL
                  const url = 'https://apps.apple.com/redeem?ctx=offercodes&id=6744286148&code=';
                  const canOpen = await Linking.canOpenURL(url);
                  if (canOpen) {
                    await Linking.openURL(url);
                  } else {
                    Alert.alert(
                      'Redeem Promo Code',
                      'To redeem your promo code:\n\n1. Open the App Store\n2. Tap your profile icon (top right)\n3. Tap \'Redeem Gift Card or Code\'\n4. Enter your promo code',
                      [{ text: 'OK' }]
                    );
                  }
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.promoBtnText}>🎟️ Redeem Promo Code</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.legalText}>
            {selectedPlan === 'annual'
              ? `Subscription auto-renews annually at ${annualPrice ?? '$119.99'} unless cancelled at least 24 hours before the renewal date.`
              : `Subscription auto-renews monthly at ${monthlyPrice ?? '$14.99'} unless cancelled at least 24 hours before the renewal date.`}
          </Text>
          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => Linking.openURL('https://info.autismpathways.app/privacy-policy/')}><Text style={styles.legalLink}>Privacy Policy</Text></TouchableOpacity>
            <Text style={styles.legalSep}>·</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://info.autismpathways.app/terms-of-service/')}><Text style={styles.legalLink}>Terms of Use</Text></TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContainer: { flex: 1 },
  scroll: { paddingBottom: 40 },
  header: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { paddingVertical: 6 },
  backText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  hardshipCallout: {
    backgroundColor: '#E8F4FD',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#B3D9F0',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
    width: '100%',
  },
  hardshipCalloutText: {
    fontSize: 12,
    color: '#1A5276',
    textAlign: 'center',
    lineHeight: 18,
  },
  hardshipCalloutLink: {
    color: '#1A7FC1',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  hero: { backgroundColor: COLORS.purpleDark, paddingHorizontal: SPACING.xl, paddingTop: SPACING.xxxl, paddingBottom: SPACING.xl, alignItems: 'center' },
  heroIcon: { fontSize: 48, marginBottom: SPACING.md },
  heroTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.white, textAlign: 'center', marginBottom: SPACING.sm },
  heroSub: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 20, marginBottom: SPACING.lg },
  priceNote: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.55)', marginTop: SPACING.sm },
  planToggle: { flexDirection: 'row', gap: SPACING.sm, width: '100%', marginTop: SPACING.sm, marginBottom: SPACING.lg },
  planOption: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.md, paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  planOptionActive: { backgroundColor: COLORS.white, borderColor: COLORS.white },
  planBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  planLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  planLabelActive: { color: COLORS.purpleDark },
  planPrice: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.white },
  planPriceActive: { color: COLORS.purpleDark },
  planSub: { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  planSubActive: { color: COLORS.textMid },
  saveBadge: { backgroundColor: '#22c55e', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 },
  saveBadgeText: { fontSize: 9, fontWeight: '800', color: COLORS.white },
  section: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.lg, gap: SPACING.md },
  featureIconBox: { width: 44, height: 44, borderRadius: RADIUS.sm, backgroundColor: COLORS.lavender, alignItems: 'center', justifyContent: 'center' },
  featureIcon: { fontSize: 22 },
  featureBody: { flex: 1 },
  featureTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  featureSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 17 },
  featureCheck: { fontSize: 18, color: COLORS.successText, fontWeight: '700', marginTop: 2 },
  faqCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.lg, marginBottom: SPACING.sm },
  faqQ: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  faqA: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 19 },
  ctaSection: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, alignItems: 'center' },
  purchaseBtn: { width: '100%', backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingVertical: SPACING.lg, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md, ...SHADOWS.lg },
  purchaseBtnDisabled: { opacity: 0.6 },
  purchaseBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
  restoreBtn: { paddingVertical: SPACING.md, alignItems: 'center', marginBottom: SPACING.xs },
  restoreBtnText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  promoBtn: { paddingVertical: SPACING.md, alignItems: 'center', marginBottom: SPACING.lg },
  promoBtnText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  legalText: { fontSize: 11, color: COLORS.textLight, textAlign: 'center', lineHeight: 16, marginBottom: SPACING.sm },
  legalLinks: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  legalLink: { fontSize: 11, color: COLORS.purple, fontWeight: '600' },
  legalSep: { fontSize: 11, color: COLORS.textLight },
  betaContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
  betaIcon: { fontSize: 56, marginBottom: SPACING.lg },
  betaTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.md },
  betaSub: { fontSize: FONT_SIZES.md, color: COLORS.textMid, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.lg },
  betaBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.xxxl, paddingVertical: SPACING.lg, ...SHADOWS.md },
  betaBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '700' },
});
