/**
 * Paywall screen — Premium subscription purchase.
 * Uses react-native-iap for both iOS (StoreKit) and Android (Google Play Billing).
 * Supports both monthly ($9.99) and annual ($79.99) subscriptions.
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
  type ProductSubscription,
  type Purchase,
  type PurchaseError,
} from 'react-native-iap';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';
import { BETA_MODE, IAP_PURCHASED_KEY } from '../../hooks/useIsPremium';

// ── IAP Product IDs ───────────────────────────────────────────────────────────
// These must match EXACTLY what is set up in App Store Connect AND Google Play Console
const PRODUCT_ID_ANNUAL  = 'app.autismpathways.premium.annual';
const PRODUCT_ID_MONTHLY = 'app.autismpathways.premium.monthly';
const PRODUCT_IDS = [PRODUCT_ID_ANNUAL, PRODUCT_ID_MONTHLY];

// ── Feature list ──────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: '🗺️', title: 'All 50-State Waiver Data',      sub: 'Find agencies in every county across the US' },
  { icon: '📋', title: 'Unlimited Daily Observations',   sub: 'Track patterns, moods, and IEP-ready notes' },
  { icon: '🩺', title: 'Provider Prep Visit Summaries',  sub: 'Export visit notes and Smart Fill from observations' },
  { icon: '📚', title: 'Full IEP Goal Tracker',          sub: 'Add, edit, archive goals and log meeting notes' },
  { icon: '🚽', title: 'Bowel Diary & Potty Pathway',    sub: 'Full diary with per-day editing and export' },
  { icon: '🧠', title: 'Diagnosis Pathway',              sub: 'Evaluator directory + appointment prep tools' },
  { icon: '💳', title: 'Medicaid Pathway',               sub: 'Step-by-step Medicaid application guide' },
  { icon: '📰', title: 'Full Article Library',           sub: 'Unlimited access to all guides and explainers' },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [annualProduct, setAnnualProduct]   = useState<ProductSubscription | null>(null);
  const [monthlyProduct, setMonthlyProduct] = useState<ProductSubscription | null>(null);
  const [annualPrice, setAnnualPrice]   = useState<string | null>(null);
  const [monthlyPrice, setMonthlyPrice] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring]   = useState(false);
  const [iapReady, setIapReady]     = useState(false);

  const onPurchaseSuccess = useCallback(async () => {
    await AsyncStorage.setItem(IAP_PURCHASED_KEY, 'true');
    setPurchasing(false);
    Alert.alert(
      '🎉 Welcome to Premium!',
      'You now have full access to all Autism Pathways features. Thank you for supporting families navigating the autism journey.',
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

        // Listen for successful purchases
        purchaseUpdateSub = purchaseUpdatedListener(async (purchase: Purchase) => {
          try {
            await finishTransaction({ purchase, isConsumable: false });
            await onPurchaseSuccess();
          } catch (e) {
            console.log('finishTransaction error', e);
            setPurchasing(false);
          }
        });

        // Listen for purchase errors
        purchaseErrorSub = purchaseErrorListener((error: PurchaseError) => {
          setPurchasing(false);
          if (error.code !== 'E_USER_CANCELLED') {
            Alert.alert('Purchase Failed', error.message || 'Something went wrong. Please try again.');
          }
        });

        // Fetch subscription products
        const subs = await fetchProducts({ skus: PRODUCT_IDS, type: 'subs' });
        subs.forEach((sub) => {
          if (sub.productId === PRODUCT_ID_ANNUAL) {
            setAnnualProduct(sub);
            setAnnualPrice(sub.localizedPrice ?? '$79.99');
          }
          if (sub.productId === PRODUCT_ID_MONTHLY) {
            setMonthlyProduct(sub);
            setMonthlyPrice(sub.localizedPrice ?? '$9.99');
          }
        });

        setIapReady(true);
      } catch (e) {
        console.log('IAP setup error', e);
        // Fallback to hardcoded prices if store is unavailable
        setAnnualPrice('$79.99');
        setMonthlyPrice('$9.99');
        setIapReady(true);
      }
    };

    setup();

    // Fallback timer — show hardcoded prices if store takes too long
    const fallbackTimer = setTimeout(() => {
      setAnnualPrice(prev => prev ?? '$79.99');
      setMonthlyPrice(prev => prev ?? '$9.99');
      setIapReady(true);
    }, 6000);

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
    const product = selectedPlan === 'annual' ? annualProduct : monthlyProduct;
    if (!product) {
      Alert.alert(
        'Subscription Unavailable',
        'Unable to connect to the App Store. Please ensure you are signed in with a valid Apple ID and have an active internet connection, then try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => {
            setIapReady(false);
            initConnection().then(() =>
              fetchProducts({ skus: PRODUCT_IDS, type: 'subs' }).then(subs => {
                subs.forEach(sub => {
                  if (sub.productId === PRODUCT_ID_ANNUAL) { setAnnualProduct(sub); setAnnualPrice(sub.localizedPrice ?? '$79.99'); }
                  if (sub.productId === PRODUCT_ID_MONTHLY) { setMonthlyProduct(sub); setMonthlyPrice(sub.localizedPrice ?? '$9.99'); }
                });
                setIapReady(true);
              })
            ).catch(() => setIapReady(true));
          }},
        ]
      );
      return;
    }
    setPurchasing(true);
    try {
      await requestPurchase({ type: 'subs', request: { apple: { sku: product.productId }, google: { skus: [product.productId] } } });
      // Result handled by purchaseUpdatedListener
    } catch (e) {
      setPurchasing(false);
      Alert.alert('Error', 'Could not start purchase. Please try again.');
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
        Alert.alert(
          'Purchase Restored',
          'Your premium access has been restored.',
          [{ text: 'Continue', onPress: () => router.replace('/(tabs)/dashboard') }]
        );
      } else {
        const storeName = Platform.OS === 'android' ? 'Google Play account' : 'Apple ID';
        Alert.alert('No Purchase Found', `We could not find a previous premium purchase on this ${storeName}.`);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not restore purchases. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  // ── Beta mode state ───────────────────────────────────────────────────────
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
          <Text style={styles.betaSub}>
            You're in the beta — all premium features are fully unlocked for free. Thank you for helping us build Autism Pathways!
          </Text>
          <Text style={styles.betaNote}>
            Premium is available as a monthly or annual subscription.
          </Text>
          <TouchableOpacity
            style={styles.betaBtn}
            onPress={() => router.replace('/(tabs)/dashboard')}
            activeOpacity={0.85}
          >
            <Text style={styles.betaBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }


  // ── Full paywall ──────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>🌟</Text>
          <Text style={styles.heroTitle}>Autism Pathways Premium</Text>
          <Text style={styles.heroSub}>
            Everything you need to navigate the system — diagnosis, Medicaid, IEP, and beyond.
          </Text>

          {/* Plan Toggle */}
          <View style={styles.planToggle}>
            <TouchableOpacity
              style={[styles.planOption, selectedPlan === 'annual' && styles.planOptionActive]}
              onPress={() => setSelectedPlan('annual')}
              activeOpacity={0.85}
            >
              <View style={styles.planBadgeRow}>
                <Text style={[styles.planLabel, selectedPlan === 'annual' && styles.planLabelActive]}>Annual</Text>
                <View style={styles.saveBadge}><Text style={styles.saveBadgeText}>SAVE 33%</Text></View>
              </View>
              <Text style={[styles.planPrice, selectedPlan === 'annual' && styles.planPriceActive]}>
                {annualPrice ?? '—'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.planOption, selectedPlan === 'monthly' && styles.planOptionActive]}
              onPress={() => setSelectedPlan('monthly')}
              activeOpacity={0.85}
            >
              <Text style={[styles.planLabel, selectedPlan === 'monthly' && styles.planLabelActive]}>Monthly</Text>
              <Text style={[styles.planPrice, selectedPlan === 'monthly' && styles.planPriceActive]}>
                {monthlyPrice ?? '—'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.purchaseBtn, (!iapReady || purchasing) && styles.purchaseBtnDisabled]}
            onPress={handlePurchase}
            disabled={!iapReady || purchasing}
            activeOpacity={0.85}
          >
            {purchasing ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.purchaseBtnText}>
                {priceLoaded ? `Get Premium — ${currentPrice}` : 'Loading…'}
              </Text>
            )}
          </TouchableOpacity>
          <Text style={styles.priceNote}>
            {selectedPlan === 'annual'
              ? `Billed annually · ~$6.67/mo`
              : 'Billed monthly · cancel anytime'}
          </Text>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Everything included</Text>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={styles.featureIconBox}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
              </View>
              <View style={styles.featureBody}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureSub}>{f.sub}</Text>
              </View>
              <Text style={styles.featureCheck}>✓</Text>
            </View>
          ))}
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions</Text>
          <View style={styles.faqCard}>
            <Text style={styles.faqQ}>Can I cancel anytime?</Text>
            <Text style={styles.faqA}>
              {Platform.OS === 'android'
                ? 'Yes. Cancel through Google Play → Subscriptions at any time. No questions asked.'
                : 'Yes. Cancel through your iPhone Settings → Apple ID → Subscriptions at any time. No questions asked.'}
            </Text>
          </View>
          <View style={styles.faqCard}>
            <Text style={styles.faqQ}>Is my data safe?</Text>
            <Text style={styles.faqA}>All your data is stored locally on your device. We never sell your information. See our Privacy Policy for details.</Text>
          </View>
          <View style={styles.faqCard}>
            <Text style={styles.faqQ}>Can I use it on multiple devices?</Text>
            <Text style={styles.faqA}>
              {Platform.OS === 'android'
                ? 'Yes — tap "Restore Purchase" on any Android device signed in to the same Google account.'
                : 'Yes — tap "Restore Purchase" on any iPhone signed in to the same Apple ID.'}
            </Text>
          </View>
        </View>

        {/* Bottom CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[styles.purchaseBtn, (!iapReady || purchasing) && styles.purchaseBtnDisabled]}
            onPress={handlePurchase}
            disabled={!iapReady || purchasing}
            activeOpacity={0.85}
          >
            {purchasing ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.purchaseBtnText}>
                {priceLoaded ? `Get Premium — ${currentPrice}` : 'Loading…'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreBtn}
            onPress={handleRestore}
            disabled={restoring}
            activeOpacity={0.7}
          >
            {restoring
              ? <ActivityIndicator color={COLORS.purple} size="small" />
              : <Text style={styles.restoreBtnText}>Restore Purchase</Text>
            }
          </TouchableOpacity>

          <Text style={styles.legalText}>
            {selectedPlan === 'annual'
              ? `Subscription auto-renews annually at ${annualPrice ?? '$79.99'} unless cancelled at least 24 hours before the renewal date.`
              : `Subscription auto-renews monthly at ${monthlyPrice ?? '$9.99'} unless cancelled at least 24 hours before the renewal date.`
            }
          </Text>
          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => Linking.openURL('https://autismpathways.app/privacy')}>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.legalSep}>·</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://autismpathways.app/terms')}>
              <Text style={styles.legalLink}>Terms of Use</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  backBtn: { alignSelf: 'flex-start', padding: SPACING.sm },
  backText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  scrollContainer: { flex: 1 },
  scroll: { paddingBottom: SPACING.xxxl },
  // Hero
  hero: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
  },
  heroIcon: { fontSize: 48, marginBottom: SPACING.md },
  heroTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  heroSub: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  priceNote: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.55)',
    marginTop: SPACING.sm,
  },
  // Plan Toggle
  planToggle: {
    flexDirection: 'row',
    gap: SPACING.sm,
    width: '100%',
    marginTop: SPACING.sm,
  },
  planOption: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planOptionActive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.white,
  },
  planBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  planLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
  planLabelActive: {
    color: COLORS.purpleDark,
  },
  planPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.white,
  },
  planPriceActive: {
    color: COLORS.purpleDark,
  },
  saveBadge: {
    backgroundColor: '#22c55e',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  saveBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.white,
  },
  // Sections
  section: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  // Features
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: { fontSize: 22 },
  featureBody: { flex: 1 },
  featureTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  featureSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 17 },
  featureCheck: { fontSize: 18, color: COLORS.successText, fontWeight: '700', marginTop: 2 },
  // FAQ
  faqCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  faqQ: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  faqA: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 19 },
  // CTA
  ctaSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  purchaseBtn: {
    width: '100%',
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.lg,
  },
  purchaseBtnDisabled: { opacity: 0.6 },
  purchaseBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
  restoreBtn: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  restoreBtnText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  legalText: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
  legalLinks: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  legalLink: { fontSize: 11, color: COLORS.purple, fontWeight: '600' },
  legalSep: { fontSize: 11, color: COLORS.textLight },
  // Beta state
  betaContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  betaIcon: { fontSize: 56, marginBottom: SPACING.lg },
  betaTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  betaSub: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMid,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  betaNote: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 19,
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.sm,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  betaBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.lg,
    ...SHADOWS.md,
  },
  betaBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '700' },
});
