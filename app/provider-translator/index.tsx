import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';
import {trackPaywallViewed, trackProviderTranslatorOpened, logScreenView, useScreenTime} from '../../lib/analytics';

const API_BASE = 'https://inu3nb5lrfvftfyiwprftqshpy0zcegu.lambda-url.us-east-2.on.aws';
const USAGE_KEY = 'ap_provider_translator_count';
const HISTORY_KEY = 'ap_provider_translator_history';
const FREE_USES = 5;

type Mode = 'translate' | 'decode';

export type DictionaryItem = {
  id: string;
  mode: Mode;
  input: string;
  output: string;
  savedAt: string; // ISO string for persistence
};

const MODE_CONFIG = {
  translate: {
    label: 'Translate Jargon',
    icon: '🔤',
    color: COLORS.blueAccent,
    bg: COLORS.blue,
    placeholder:
      'Paste medical notes, therapy reports, IEP language, or any provider document here...\n\nExample: "Hypotonia with decreased proprioceptive processing and sensory modulation difficulties affecting ADLs."',
    buttonLabel: 'Translate to Plain Language',
    resultTitle: 'Plain Language Translation',
    resultColor: COLORS.blueAccent,
    resultBg: COLORS.blue,
  },
  decode: {
    label: 'Decode Intent',
    icon: '🔍',
    color: COLORS.lavenderAccent,
    bg: COLORS.lavender,
    placeholder:
      'Paste a quote from a provider note, email, or report that you want help understanding...\n\nExample: "Without support mother will burn out" or "Family demonstrates limited insight into child\'s needs."',
    buttonLabel: 'Decode What They Really Meant',
    resultTitle: 'What This Actually Means',
    resultColor: COLORS.lavenderAccent,
    resultBg: COLORS.lavender,
  },
};

const EXAMPLE_PROMPTS: Record<Mode, string[]> = {
  translate: [
    'Hypotonia with decreased proprioceptive processing',
    'Deficits in social communication and restricted, repetitive patterns of behavior',
    'Significant delays in expressive and receptive language development',
    'Sensory modulation difficulties affecting activities of daily living',
  ],
  decode: [
    '"Without support mother will burn out"',
    '"Family demonstrates limited insight into child\'s needs"',
    '"Caregiver appears overwhelmed during home visit"',
    '"Child\'s progress is contingent on consistent home follow-through"',
  ],
};

export default function ProviderTranslatorScreen() {
  useScreenTime('provider_translator');
  useEffect(() => { logScreenView('provider_translator'); trackProviderTranslatorOpened(); }, []);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const [usageCount, setUsageCount] = useState(0);
  const [mode, setMode] = useState<Mode>('translate');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [historyCount, setHistoryCount] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(USAGE_KEY).then((val) => {
        setUsageCount(val ? parseInt(val, 10) : 0);
      });
      AsyncStorage.getItem(HISTORY_KEY).then((val) => {
        const items: DictionaryItem[] = val ? JSON.parse(val) : [];
        setHistoryCount(items.length);
      });
    }, [])
  );

  const config = MODE_CONFIG[mode];

  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
    setInputText('');
    setResult(null);
  };

  const handleExampleTap = (example: string) => {
    setInputText(example.replace(/^"|"$/g, ''));
    setResult(null);
  };

  const handlePhotoUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Please allow photo access so we can read your document.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]?.base64) {
      setIsLoading(true);
      setResult(null);
      try {
        const res = await fetch(`${API_BASE}/api/provider-translator/ocr`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: result.assets[0].base64 }),
        });
        const data = await res.json();
        if (data.text) {
          setInputText(data.text);
        } else {
          Alert.alert(
            'Could not read document',
            'Try taking a clearer photo or paste the text manually.'
          );
        }
      } catch {
        Alert.alert('Error', 'Could not process the image. Please paste the text manually.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access to take a photo of your document.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]?.base64) {
      setIsLoading(true);
      setResult(null);
      try {
        const res = await fetch(`${API_BASE}/api/provider-translator/ocr`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: result.assets[0].base64 }),
        });
        const data = await res.json();
        if (data.text) {
          setInputText(data.text);
        } else {
          Alert.alert('Could not read document', 'Try taking a clearer photo or paste the text manually.');
        }
      } catch {
        Alert.alert('Error', 'Could not process the image. Please paste the text manually.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      Alert.alert('Nothing to analyze', 'Please paste some text or take a photo of a document first.');
      return;
    }

    if (!isPremium && usageCount >= FREE_USES) {
      Alert.alert(
        'Keep going with Premium 💜',
        "You've used all 5 free translations. Upgrade to decode every report, note, and IEP — unlimited, forever.",
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'See Premium', onPress: () => (trackPaywallViewed('provider_translator'), router.push('/paywall' as any)) },
        ]
      );
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/provider-translator/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText.trim(), mode }),
      });

      const data = await res.json();

      if (data.result) {
        setResult(data.result);

        // Increment usage count
        const next = usageCount + 1;
        setUsageCount(next);
        await AsyncStorage.setItem(USAGE_KEY, String(next));

        // Persist to dictionary
        const stored = await AsyncStorage.getItem(HISTORY_KEY);
        const existing: DictionaryItem[] = stored ? JSON.parse(stored) : [];
        const newItem: DictionaryItem = {
          id: Date.now().toString(),
          mode,
          input: inputText.trim().slice(0, 200),
          output: data.result,
          savedAt: new Date().toISOString(),
        };
        const updated = [newItem, ...existing].slice(0, 50); // keep last 50
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        setHistoryCount(updated.length);

        // Animate result in
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();

        // Scroll to result
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 200);
      } else {
        Alert.alert('Something went wrong', data.error || 'Please try again.');
      }
    } catch {
      Alert.alert(
        'Connection error',
        'Could not reach the server. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
  };

  // Usage bar color
  const usageRatio = Math.min(usageCount / FREE_USES, 1);
  const barColor =
    usageCount >= FREE_USES
      ? '#e74c3c'
      : usageCount >= FREE_USES - 1
      ? '#f39c12'
      : COLORS.purple;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/provider-translator/dictionary' as any)}
          style={styles.dictionaryBtn}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <Text style={styles.dictionaryBtnText}>📖 Dictionary{historyCount > 0 ? ` (${historyCount})` : ''}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>💬</Text>
          <Text style={styles.heroTitle}>Provider Translator</Text>
          <Text style={styles.heroSub}>
            Medical speak, decoded. Paste text or snap a photo of any provider note, report, or document — we'll tell you what it actually means.
          </Text>
        </View>

        {/* Usage progress bar (free users only) */}
        {!isPremium && (
          <View style={styles.usageBarWrap}>
            <View style={styles.usageBarRow}>
              <Text style={styles.usageBarLabel}>
                {usageCount} of {FREE_USES} free translations used
              </Text>
              {usageCount >= FREE_USES - 1 && (
                <TouchableOpacity onPress={() => (trackPaywallViewed('provider_translator'), router.push('/paywall' as any))}>
                  <Text style={styles.usageBarUpgrade}>Keep going with Premium →</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.usageBarTrack}>
              <View
                style={[
                  styles.usageBarFill,
                  {
                    width: `${usageRatio * 100}%` as any,
                    backgroundColor: barColor,
                  },
                ]}
              />
            </View>
            {usageCount >= FREE_USES && (
              <Text style={styles.usageBarFullMsg}>
                You've decoded {usageCount} documents — imagine having this for every report, every note, every IEP. 💜
              </Text>
            )}
          </View>
        )}

        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          {(['translate', 'decode'] as Mode[]).map((m) => {
            const cfg = MODE_CONFIG[m];
            const active = mode === m;
            return (
              <TouchableOpacity
                key={m}
                style={[
                  styles.modeBtn,
                  active && { backgroundColor: cfg.bg, borderColor: cfg.color },
                ]}
                onPress={() => handleModeSwitch(m)}
                activeOpacity={0.8}
              >
                <Text style={styles.modeBtnIcon}>{cfg.icon}</Text>
                <Text style={[styles.modeBtnLabel, active && { color: COLORS.purpleDark, fontWeight: '700' }]}>
                  {cfg.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Mode description */}
        <View style={[styles.modeDesc, { backgroundColor: config.bg, borderColor: config.color }]}>
          <Text style={styles.modeDescText}>
            {mode === 'translate'
              ? '🔤 Paste medical notes, therapy reports, IEP language, or any clinical document. We\'ll rewrite it in plain English so you actually understand what\'s being said about your child.'
              : '🔍 Paste a quote from a provider note or email that felt off, confusing, or worrying. We\'ll explain what the professional likely meant, the clinical context, and whether it\'s a concern or just standard documentation language.'}
          </Text>
        </View>

        {/* Photo input buttons */}
        <View style={styles.photoRow}>
          <TouchableOpacity style={styles.photoBtn} onPress={handleCamera} activeOpacity={0.8}>
            <Text style={styles.photoBtnIcon}>📷</Text>
            <Text style={styles.photoBtnLabel}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoBtn} onPress={handlePhotoUpload} activeOpacity={0.8}>
            <Text style={styles.photoBtnIcon}>🖼️</Text>
            <Text style={styles.photoBtnLabel}>Upload Image</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.orDivider}>— or paste text below —</Text>

        {/* Text input */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder={config.placeholder}
            placeholderTextColor={COLORS.textLight}
            value={inputText}
            onChangeText={setInputText}
            textAlignVertical="top"
            scrollEnabled={false}
          />
          {inputText.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Text style={styles.clearBtnText}>✕ Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Example prompts */}
        <View style={styles.examplesSection}>
          <Text style={styles.examplesLabel}>Try an example:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.examplesScroll}>
            {EXAMPLE_PROMPTS[mode].map((ex, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.exampleChip, { borderColor: config.color }]}
                onPress={() => handleExampleTap(ex)}
                activeOpacity={0.75}
              >
                <Text style={styles.exampleChipText}>{ex}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Analyze button */}
        <TouchableOpacity
          style={[styles.analyzeBtn, isLoading && styles.analyzeBtnDisabled]}
          onPress={handleAnalyze}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.analyzeBtnText}>{config.buttonLabel}</Text>
          )}
        </TouchableOpacity>

        {/* Result */}
        {result && (
          <Animated.View style={[styles.resultCard, { opacity: fadeAnim, borderColor: config.color }]}>
            <View style={[styles.resultHeader, { backgroundColor: config.bg }]}>
              <Text style={styles.resultHeaderIcon}>{config.icon}</Text>
              <Text style={styles.resultHeaderTitle}>
                {config.resultTitle}
              </Text>
            </View>
            <View style={styles.resultBody}>
              <Text style={styles.resultText}>{result}</Text>
            </View>
            <View style={styles.resultFooter}>
              <Text style={styles.resultDisclaimer}>
                💡 This is an AI-assisted interpretation to help you understand the language. Always follow up directly with your provider for medical decisions.
              </Text>
              <TouchableOpacity
                style={styles.dictionaryLinkBtn}
                onPress={() => router.push('/provider-translator/dictionary' as any)}
              >
                <Text style={styles.dictionaryLinkText}>📖 View in Provider Dictionary →</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { paddingVertical: 6, paddingRight: 12 },
  backText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  dictionaryBtn: { paddingVertical: 6, paddingLeft: 12 },
  dictionaryBtnText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg },

  // Hero
  hero: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.md,
  },
  heroIcon: { fontSize: 44, marginBottom: SPACING.sm },
  heroTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.purpleDark,
    marginBottom: SPACING.sm,
  },
  heroSub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.xl,
  },

  // Usage progress bar
  usageBarWrap: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  usageBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageBarLabel: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  usageBarUpgrade: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  usageBarTrack: {
    height: 6,
    backgroundColor: COLORS.lavender,
    borderRadius: 3,
    overflow: 'hidden',
  },
  usageBarFill: { height: '100%', borderRadius: 3 },
  usageBarFullMsg: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.purple,
    fontStyle: 'italic',
    marginTop: SPACING.sm,
    textAlign: 'center',
  },

  // Mode toggle
  modeToggle: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    ...SHADOWS.sm,
  },
  modeBtnIcon: { fontSize: 18 },
  modeBtnLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMid,
  },

  // Mode description
  modeDesc: {
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  modeDescText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
  },

  // Photo buttons
  photoRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  photoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.purple,
    borderStyle: 'dashed',
    backgroundColor: COLORS.white,
  },
  photoBtnIcon: { fontSize: 20 },
  photoBtnLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.purple,
  },

  orDivider: {
    textAlign: 'center',
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
  },

  // Text input
  inputWrapper: {
    marginBottom: SPACING.md,
    position: 'relative',
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: SPACING.lg,
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    minHeight: 140,
    lineHeight: 22,
    ...SHADOWS.sm,
  },
  clearBtn: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  clearBtnText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.purpleDark,
    fontWeight: '600',
  },

  // Examples
  examplesSection: { marginBottom: SPACING.lg },
  examplesLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  examplesScroll: { flexDirection: 'row' },
  exampleChip: {
    borderWidth: 1.5,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.white,
    maxWidth: 220,
  },
  exampleChipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMid,
    fontStyle: 'italic',
  },

  // Analyze button
  analyzeBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.lg,
  },
  analyzeBtnDisabled: {
    opacity: 0.7,
  },
  analyzeBtnText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },

  // Result card
  resultCard: {
    borderRadius: RADIUS.md,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  resultHeaderIcon: { fontSize: 20 },
  resultHeaderTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  resultBody: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  resultText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
    lineHeight: 24,
  },
  resultFooter: {
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  resultDisclaimer: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  dictionaryLinkBtn: { alignSelf: 'flex-start' },
  dictionaryLinkText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.purple,
    fontWeight: '600',
  },
});
