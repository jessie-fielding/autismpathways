import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../../lib/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  progressLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.purple,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.purple,
  },
  progressText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  heroBanner: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  heroLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.purple,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 30,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    lineHeight: 20,
  },
  form: {
    marginBottom: SPACING.xl,
  },
  inputGroup: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.lavenderAccent,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  helpBox: {
    backgroundColor: COLORS.infoBg,
    borderRadius: RADIUS.sm,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.infoBorder,
  },
  helpText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
    fontWeight: '500',
  },
  optionalLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    fontWeight: '400',
  },
  buttonContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 50,
    paddingVertical: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.purple,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 50,
    paddingVertical: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.lavenderAccent,
    backgroundColor: COLORS.white,
  },
  secondaryButtonText: {
    color: COLORS.purple,
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  skipButtonText: {
    color: COLORS.purple,
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },
  optionButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.lavenderAccent,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  optionButtonActive: {
    backgroundColor: COLORS.lavender,
    borderColor: COLORS.purple,
  },
  optionButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textMid,
    textAlign: 'center',
  },
  optionButtonTextActive: {
    color: COLORS.purple,
  },
  multiSelectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  multiSelectItem: {
    width: '48%',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.lavenderAccent,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  multiSelectItemActive: {
    backgroundColor: COLORS.lavender,
    borderColor: COLORS.purple,
  },
  multiSelectIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  multiSelectText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMid,
    textAlign: 'center',
  },
  multiSelectTextActive: {
    color: COLORS.purple,
  },
  rainbowBar: {
    height: 3,
    backgroundColor: COLORS.border,
    marginTop: SPACING.xl,
  },
  profileBadge: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.lavenderAccent,
    backgroundColor: COLORS.white,
    marginRight: SPACING.md,
    marginBottom: SPACING.md,
  },
  profileBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textMid,
  },
});

const concerns = [
  { id: 'speech', label: 'Speech / language', icon: '🗣️' },
  { id: 'behavior', label: 'Behavior', icon: '🧠' },
  { id: 'medicaid', label: 'Medicaid coverage', icon: '📋' },
  { id: 'school', label: 'School / IEP', icon: '🏫' },
  { id: 'waivers', label: 'Waivers / HCBS', icon: '🛡️' },
  { id: 'providers', label: 'Finding providers', icon: '🩺' },
  { id: 'denied', label: 'Denied services', icon: '📁' },
  { id: 'family', label: 'Family support', icon: '❤️' },
  { id: 'sensory', label: 'Sensory issues', icon: '🌊' },
  { id: 'sleep', label: 'Sleep', icon: '🌙' },
];

export default function StartHereScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [childName, setChildName] = useState('');
  const [dob, setDob] = useState('');
  const [state, setState] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [diagnosisLevel, setDiagnosisLevel] = useState('');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);

  const toggleConcern = (id: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    // Persist profile to AsyncStorage whenever user advances
    try {
      const profile = { childName, dob, state, diagnosis, diagnosisLevel, concerns: selectedConcerns };
      await AsyncStorage.setItem('profile', JSON.stringify(profile));
      await AsyncStorage.setItem('ap_onboarding_complete', 'true');
    } catch (e) {}
    if (step < 3) {
      setStep(step + 1);
    } else {
      router.replace('/(tabs)/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const getProgress = () => {
    return ((step - 1) / 2) * 100;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progressLabel}>STEP {step} OF 3 — {step === 1 ? 'YOUR CHILD' : step === 2 ? 'YOUR CONCERNS' : "YOU'RE ALL SET!"}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${getProgress()}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {step === 1 && 'Just 3 quick steps to personalize your pathway'}
          {step === 2 && 'Almost there — one more after this'}
          {step === 3 && 'Your pathway is being personalized...'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <>
            <View style={styles.heroBanner}>
              <Text style={styles.heroLabel}>LET'S GET STARTED</Text>
              <Text style={styles.heroTitle}>Tell us a little about <Text style={{ color: COLORS.purple }}>your child.</Text></Text>
              <Text style={styles.heroSubtitle}>This helps us personalize your dashboard and show the most relevant resources first.</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Child's first name <Text style={styles.optionalLabel}>(or nickname is fine)</Text></Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ellie"
                  placeholderTextColor={COLORS.textLight}
                  value={childName}
                  onChangeText={setChildName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date of birth</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Sep 21, 2019"
                  placeholderTextColor={COLORS.textLight}
                  value={dob}
                  onChangeText={setDob}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>State you live in</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Colorado"
                  placeholderTextColor={COLORS.textLight}
                  value={state}
                  onChangeText={setState}
                />
                <View style={styles.helpBox}>
                  <Text style={styles.helpText}>💡 <Text style={{ fontWeight: '700' }}>Your state matters.</Text> Medicaid waiver programs, school rights, and provider availability vary significantly by state. We use this to show you the right information.</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <View style={styles.heroBanner}>
              <Text style={styles.heroLabel}>WHAT'S ON YOUR MIND?</Text>
              <Text style={styles.heroTitle}>What areas are you <Text style={{ color: COLORS.purple }}>navigating right now?</Text></Text>
              <Text style={styles.heroSubtitle}>Select everything that applies. You can always change this later.</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Has your child received a formal diagnosis?</Text>
                {['Yes', 'Not yet', 'In process'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.optionButton, diagnosis === option && styles.optionButtonActive]}
                    onPress={() => setDiagnosis(option)}
                  >
                    <Text
                      style={[
                        styles.optionButtonText,
                        diagnosis === option && styles.optionButtonTextActive,
                      ]}
                    >
                      {diagnosis === option ? '✓ ' : ''}{option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
                {(diagnosis === 'Yes — ASD' || diagnosis === 'Yes — other') && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.label}>Autism Level (if known)</Text>
                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                      {['1', '2', '3', 'Unknown'].map((lvl) => (
                        <TouchableOpacity
                          key={lvl}
                          style={[styles.optionButton, diagnosisLevel === lvl && styles.optionButtonActive, { paddingHorizontal: 16 }]}
                          onPress={() => setDiagnosisLevel(lvl)}
                        >
                          <Text style={[styles.optionButtonText, diagnosisLevel === lvl && styles.optionButtonTextActive]}>
                            {diagnosisLevel === lvl ? '✓ ' : ''}Level {lvl}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text style={{ fontSize: 11, color: '#9090A8', marginTop: 6, lineHeight: 16 }}>
                      Level 1 = needs support · Level 2 = needs substantial support · Level 3 = needs very substantial support
                    </Text>
                  </View>
                )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>What are your main concerns? <Text style={styles.optionalLabel}>(pick all that apply)</Text></Text>
                <View style={styles.multiSelectGrid}>
                  {concerns.map((concern) => (
                    <TouchableOpacity
                      key={concern.id}
                      style={[
                        styles.multiSelectItem,
                        selectedConcerns.includes(concern.id) && styles.multiSelectItemActive,
                      ]}
                      onPress={() => toggleConcern(concern.id)}
                    >
                      <Text style={styles.multiSelectIcon}>{concern.icon}</Text>
                      <Text
                        style={[
                          styles.multiSelectText,
                          selectedConcerns.includes(concern.id) && styles.multiSelectTextActive,
                        ]}
                      >
                        {concern.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <View style={styles.heroBanner}>
              <Text style={styles.heroLabel}>YOU'RE READY TO GO</Text>
              <Text style={styles.heroTitle}>Your pathway is <Text style={{ color: COLORS.purple }}>personalized and waiting.</Text></Text>
              <Text style={styles.heroSubtitle}>Based on what you told us, we've highlighted the most relevant tools and resources for your family. You can always update this in your profile.</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.heroBanner}>
                <Text style={styles.label}>Your profile summary:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.md }}>
                  {childName && (
                    <View style={styles.profileBadge}>
                      <Text style={styles.profileBadgeText}>😊 {childName}</Text>
                    </View>
                  )}
                  {state && (
                    <View style={styles.profileBadge}>
                      <Text style={styles.profileBadgeText}>📍 {state}</Text>
                    </View>
                  )}
                  <View style={styles.profileBadge}>
                    <Text style={styles.profileBadgeText}>✓ {diagnosis || 'Diagnosis pending'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.heroBanner}>
                <Text style={styles.label}>⭐ Unlock everything with Premium.</Text>
                <Text style={styles.heroSubtitle}>Your free account includes the core tools. Premium adds My Contacts, Talking Points, cross-device sync, and more — for $9.99/mo.</Text>
              </View>
            </View>

            <View style={styles.rainbowBar} />
          </>
        )}

        {step < 3 && <View style={styles.rainbowBar} />}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <View style={styles.buttonGroup}>
          {step > 1 ? (
            <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
              <Text style={styles.secondaryButtonText}>← Back</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[styles.primaryButton, step === 1 && !state && { opacity: 0.6 }]}
            onPress={handleNext}
            disabled={step === 1 && !state}
          >
            <Text style={styles.primaryButtonText}>
              {step === 3 ? 'Go to Dashboard!' : 'Continue →'}
            </Text>
          </TouchableOpacity>
        </View>
        {step < 3 && (
          <TouchableOpacity style={styles.skipButton} onPress={() => setStep(3)}>
            <Text style={styles.skipButtonText}>Skip this step</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
