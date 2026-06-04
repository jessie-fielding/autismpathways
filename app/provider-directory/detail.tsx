import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Linking, Alert, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import { PROVIDERS, Provider } from '../../lib/providerData';
import { useIsPremium } from '../../hooks/useIsPremium';

const API_BASE = 'https://inu3nb5lrfvftfyiwprftqshpy0zcegu.lambda-url.us-east-2.on.aws';

const SPECIALTY_COLORS: Record<string, string> = {
  'ABA Therapy':        COLORS.purple,
  'Speech & OT':        COLORS.teal,
  'Psychiatry':         '#E07B6A',
  'Advocacy':           '#F59E0B',
  'National Directory': '#6366F1',
};

type Review = {
  id: string;
  postId: string;
  content: string;
  rating: number;
  authorName: string;
  authorState: string;
  createdAt: string;
};

function StarRow({ rating, onRate, readonly = false }: { rating: number; onRate?: (n: number) => void; readonly?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <TouchableOpacity
          key={n}
          onPress={() => !readonly && onRate?.(n)}
          disabled={readonly}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Text style={{ fontSize: 20, color: n <= rating ? '#F59E0B' : COLORS.border }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function ProviderDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isPremium } = useIsPremium();

  const provider: Provider | undefined = PROVIDERS.find(p => p.id === id);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myText, setMyText] = useState('');
  const [myName, setMyName] = useState('');
  const [myState, setMyState] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const reviewPostId = `provider_review_${id}`;

  const loadReviews = useCallback(async () => {
    if (!id) return;
    setLoadingReviews(true);
    try {
      const res = await fetch(`${API_BASE}/api/forum/comments?postId=${reviewPostId}`);
      if (res.ok) {
        const data = await res.json();
        const parsed: Review[] = (data.comments || []).map((c: any) => {
          let rating = 5;
          let authorName = 'AP Parent';
          let authorState = '';
          try {
            const meta = JSON.parse(c.content);
            rating = meta.rating || 5;
            authorName = meta.authorName || 'AP Parent';
            authorState = meta.authorState || '';
            return { id: c.id, postId: c.postId, content: meta.text || '', rating, authorName, authorState, createdAt: c.createdAt };
          } catch {
            return { id: c.id, postId: c.postId, content: c.content, rating, authorName, authorState, createdAt: c.createdAt };
          }
        });
        setReviews(parsed);
      }
    } catch (e) {
      // silently fail — reviews are a bonus feature
    } finally {
      setLoadingReviews(false);
    }
  }, [id, reviewPostId]);

  useEffect(() => {
    loadReviews();
    AsyncStorage.getItem(`reviewed_provider_${id}`).then(v => {
      if (v) setHasReviewed(true);
    });
    AsyncStorage.getItem('ap_reviewer_name').then(v => { if (v) setMyName(v); });
    AsyncStorage.getItem('ap_reviewer_state').then(v => { if (v) setMyState(v); });
  }, [loadReviews, id]);

  const submitReview = async () => {
    if (myRating === 0) { Alert.alert('Please select a star rating'); return; }
    if (!myText.trim()) { Alert.alert('Please write a short review'); return; }
    setSubmitting(true);
    try {
      // Ensure the provider "post" exists first
      await fetch(`${API_BASE}/api/forum/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reviewPostId,
          title: `Reviews: ${provider?.name}`,
          content: `Provider reviews for ${provider?.name}`,
          category: 'provider_review',
          anonymous: true,
        }),
      });

      const payload = JSON.stringify({
        rating: myRating,
        text: myText.trim(),
        authorName: myName.trim() || 'AP Parent',
        authorState: myState.trim(),
      });

      const res = await fetch(`${API_BASE}/api/forum/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: reviewPostId, content: payload, anonymous: true }),
      });

      if (res.ok) {
        await AsyncStorage.setItem(`reviewed_provider_${id}`, '1');
        await AsyncStorage.setItem('ap_reviewer_name', myName.trim());
        await AsyncStorage.setItem('ap_reviewer_state', myState.trim());
        setHasReviewed(true);
        setShowReviewForm(false);
        setMyRating(0);
        setMyText('');
        Alert.alert('Thank you! 🏅', 'Your review helps other AP families find great providers.');
        loadReviews();
      } else {
        Alert.alert('Could not submit review', 'Please try again later.');
      }
    } catch {
      Alert.alert('Could not submit review', 'Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!provider) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: FONT_SIZES.base, color: COLORS.textMid }}>Provider not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: SPACING.md }}>
          <Text style={{ color: COLORS.purple, fontWeight: '600' }}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const accentColor = SPECIALTY_COLORS[provider.specialty] || COLORS.purple;
  const avgRating = reviews.length > 0
    ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 10) / 10
    : null;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{provider.name}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: accentColor + '18' }]}>
          <View style={[styles.heroAvatar, { backgroundColor: accentColor + '30' }]}>
            <Text style={styles.heroEmoji}>
              {provider.specialty === 'ABA Therapy' ? '🧩' :
               provider.specialty === 'Speech & OT' ? '🗣️' :
               provider.specialty === 'Psychiatry' ? '🧠' :
               provider.specialty === 'Advocacy' ? '🤝' : '🌐'}
            </Text>
          </View>
          <Text style={styles.heroName}>{provider.name}</Text>
          <Text style={styles.heroType}>{provider.type}</Text>

          {/* Rating summary */}
          {avgRating !== null && (
            <View style={styles.ratingRow}>
              <StarRow rating={Math.round(avgRating)} readonly />
              <Text style={styles.ratingText}>{avgRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</Text>
            </View>
          )}

          {/* Badges */}
          <View style={styles.heroBadges}>
            {provider.acceptingPatients ? (
              <View style={styles.acceptingBadge}>
                <Text style={styles.acceptingText}>✓ Accepting Patients</Text>
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
                <Text style={styles.verifiedText}>🏅 Caregiver Verified</Text>
              </View>
            )}
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          {provider.phone && (
            <TouchableOpacity
              style={styles.contactRow}
              onPress={() => Linking.openURL(`tel:${provider.phone!.replace(/[^0-9+]/g, '')}`)}
            >
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={styles.contactText}>{provider.phone}</Text>
              <Text style={styles.contactAction}>Call →</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL(provider.website).catch(() => Alert.alert('Could not open link'))}
          >
            <Text style={styles.contactIcon}>🌐</Text>
            <Text style={[styles.contactText, { color: COLORS.purple }]} numberOfLines={1}>{provider.website}</Text>
            <Text style={styles.contactAction}>Visit →</Text>
          </TouchableOpacity>
          {provider.states[0] !== 'ALL' && (
            <View style={styles.contactRow}>
              <Text style={styles.contactIcon}>📍</Text>
              <Text style={styles.contactText}>Serves: {provider.states.join(', ')}</Text>
            </View>
          )}
        </View>

        {/* Waitlist warning */}
        {provider.waitlistNote && (
          <View style={styles.waitlistNote}>
            <Text style={styles.waitlistNoteTitle}>⏳ Waitlist Notice</Text>
            <Text style={styles.waitlistNoteText}>{provider.waitlistNote}</Text>
          </View>
        )}

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>{provider.description}</Text>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specialty</Text>
          <View style={[styles.specialtyPill, { backgroundColor: accentColor + '18' }]}>
            <Text style={[styles.specialtyPillText, { color: accentColor }]}>{provider.specialty}</Text>
          </View>
          {provider.tags.length > 0 && (
            <View style={styles.tagRow}>
              {provider.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Tips for Getting In */}
        {provider.tipsForGettingIn && provider.tipsForGettingIn.length > 0 && (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Tips for Getting In</Text>
            {provider.tipsForGettingIn.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Add to Services Tracker */}
        <TouchableOpacity
          style={styles.addToTrackerBtn}
          onPress={() => router.push('/services-tracker')}
        >
          <Text style={styles.addToTrackerText}>📋 Add to Services Tracker</Text>
        </TouchableOpacity>

        {/* Reviews section */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>
              Caregiver Reviews {reviews.length > 0 ? `(${reviews.length})` : ''}
            </Text>
            {isPremium && !hasReviewed && (
              <TouchableOpacity
                style={styles.writeReviewBtn}
                onPress={() => setShowReviewForm(!showReviewForm)}
              >
                <Text style={styles.writeReviewText}>{showReviewForm ? 'Cancel' : '✏️ Write Review'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Review form */}
          {showReviewForm && isPremium && (
            <View style={styles.reviewForm}>
              <Text style={styles.reviewFormLabel}>Your Rating</Text>
              <StarRow rating={myRating} onRate={setMyRating} />
              <Text style={[styles.reviewFormLabel, { marginTop: SPACING.md }]}>Your Name (optional)</Text>
              <TextInput
                style={styles.reviewInput}
                placeholder="e.g. Sarah M."
                placeholderTextColor={COLORS.textLight}
                value={myName}
                onChangeText={setMyName}
              />
              <Text style={[styles.reviewFormLabel, { marginTop: SPACING.sm }]}>Your State (optional)</Text>
              <TextInput
                style={styles.reviewInput}
                placeholder="e.g. TX"
                placeholderTextColor={COLORS.textLight}
                value={myState}
                onChangeText={setMyState}
                maxLength={2}
                autoCapitalize="characters"
              />
              <Text style={[styles.reviewFormLabel, { marginTop: SPACING.sm }]}>Your Review</Text>
              <TextInput
                style={[styles.reviewInput, styles.reviewTextArea]}
                placeholder="Share your experience to help other AP families..."
                placeholderTextColor={COLORS.textLight}
                value={myText}
                onChangeText={setMyText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.submitReviewBtn, submitting && { opacity: 0.6 }]}
                onPress={submitReview}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.submitReviewText}>Submit Review 🏅</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Already reviewed */}
          {hasReviewed && (
            <View style={styles.alreadyReviewed}>
              <Text style={styles.alreadyReviewedText}>✓ You've reviewed this provider. Thank you!</Text>
            </View>
          )}

          {/* Premium gate for reviews */}
          {!isPremium && (
            <View style={styles.reviewsGate}>
              <Text style={styles.reviewsGateText}>⭐ See what AP caregivers are saying</Text>
              <Text style={styles.reviewsGateSub}>Unlock reviews and leave your own with Premium</Text>
              <TouchableOpacity style={styles.reviewsGateBtn} onPress={() => router.push('/paywall')}>
                <Text style={styles.reviewsGateBtnText}>Unlock Premium →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Reviews list */}
          {isPremium && (
            loadingReviews ? (
              <ActivityIndicator color={COLORS.purple} style={{ marginVertical: SPACING.lg }} />
            ) : reviews.length === 0 ? (
              <View style={styles.noReviews}>
                <Text style={styles.noReviewsText}>No reviews yet — be the first AP parent to review this provider!</Text>
              </View>
            ) : (
              reviews.map(review => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewCardHeader}>
                    <View>
                      <Text style={styles.reviewAuthor}>
                        {review.authorName}{review.authorState ? ` · ${review.authorState}` : ''}
                      </Text>
                      <Text style={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </Text>
                    </View>
                    <StarRow rating={review.rating} readonly />
                  </View>
                  <Text style={styles.reviewText}>{review.content}</Text>
                </View>
              ))
            )
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  headerTitle: { flex: 1, fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  scrollContent: { paddingBottom: 60 },
  hero: {
    alignItems: 'center', padding: SPACING.xl, paddingTop: SPACING.xxxl,
  },
  heroAvatar: {
    width: 72, height: 72, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroEmoji: { fontSize: 36 },
  heroName: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 4 },
  heroType: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, marginBottom: SPACING.sm },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  ratingText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, fontWeight: '600' },
  heroBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, justifyContent: 'center', marginTop: SPACING.sm },
  acceptingBadge: {
    backgroundColor: COLORS.successBg, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs, borderWidth: 1, borderColor: COLORS.successBorder,
  },
  acceptingText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.successText },
  waitlistBadge: {
    backgroundColor: COLORS.warningBg, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs, borderWidth: 1, borderColor: COLORS.warningBorder,
  },
  waitlistText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.warningText },
  medicaidBadge: {
    backgroundColor: COLORS.mint, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs, borderWidth: 1, borderColor: COLORS.teal,
  },
  medicaidText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.successText },
  verifiedBadge: {
    backgroundColor: '#FFF8E1', borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs, borderWidth: 1, borderColor: '#F59E0B',
  },
  verifiedText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#92400E' },
  section: {
    backgroundColor: COLORS.white, marginHorizontal: SPACING.lg, marginTop: SPACING.md,
    borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  sectionTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  contactRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  contactIcon: { fontSize: 18, width: 28 },
  contactText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text },
  contactAction: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' },
  waitlistNote: {
    backgroundColor: COLORS.warningBg, marginHorizontal: SPACING.lg, marginTop: SPACING.md,
    borderRadius: RADIUS.lg, padding: SPACING.lg, borderLeftWidth: 4, borderLeftColor: '#F59E0B',
  },
  waitlistNoteTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.warningText, marginBottom: SPACING.xs },
  waitlistNoteText: { fontSize: FONT_SIZES.xs, color: COLORS.warningText, lineHeight: 18 },
  aboutText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  specialtyPill: {
    alignSelf: 'flex-start', borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs, marginBottom: SPACING.sm,
  },
  specialtyPillText: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  tag: {
    backgroundColor: COLORS.lavender, borderRadius: 6, paddingHorizontal: SPACING.sm, paddingVertical: 2,
  },
  tagText: { fontSize: 11, color: COLORS.purpleDark, fontWeight: '600' },
  tipsCard: {
    backgroundColor: COLORS.infoBg, marginHorizontal: SPACING.lg, marginTop: SPACING.md,
    borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.infoBorder,
  },
  tipsTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.infoText, marginBottom: SPACING.md },
  tipRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  tipBullet: { fontSize: FONT_SIZES.sm, color: COLORS.infoText, fontWeight: '700', marginTop: 1 },
  tipText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.infoText, lineHeight: 20 },
  addToTrackerBtn: {
    marginHorizontal: SPACING.lg, marginTop: SPACING.md,
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.lg, padding: SPACING.md,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.lavenderAccent,
  },
  addToTrackerText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.purple },
  reviewsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md },
  writeReviewBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
  },
  writeReviewText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.white },
  reviewForm: {
    backgroundColor: COLORS.bg, borderRadius: RADIUS.md, padding: SPACING.md,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  reviewFormLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMid, marginBottom: SPACING.xs },
  reviewInput: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: FONT_SIZES.sm, color: COLORS.text,
  },
  reviewTextArea: { minHeight: 80, marginTop: 0 },
  submitReviewBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.pill, padding: SPACING.md,
    alignItems: 'center', marginTop: SPACING.md,
  },
  submitReviewText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.white },
  alreadyReviewed: {
    backgroundColor: COLORS.successBg, borderRadius: RADIUS.md, padding: SPACING.md,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.successBorder,
  },
  alreadyReviewedText: { fontSize: FONT_SIZES.sm, color: COLORS.successText, fontWeight: '600', textAlign: 'center' },
  reviewsGate: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.md, padding: SPACING.lg,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.lavenderAccent,
  },
  reviewsGateText: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.purpleDark, marginBottom: SPACING.xs },
  reviewsGateSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginBottom: SPACING.md, textAlign: 'center' },
  reviewsGateBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm,
  },
  reviewsGateBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.white },
  noReviews: { padding: SPACING.md, alignItems: 'center' },
  noReviewsText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', lineHeight: 20 },
  reviewCard: {
    backgroundColor: COLORS.bg, borderRadius: RADIUS.md, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  reviewCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  reviewAuthor: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  reviewDate: { fontSize: 11, color: COLORS.textLight },
  reviewText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
});
