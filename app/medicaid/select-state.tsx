import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMedicaidState } from '../../lib/MedicaidStateContext';
import { STATE_OPTIONS } from '../../lib/medicaidStates';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../lib/theme';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
const STATE_FLAGS: Record<string, string> = {
  CO: '🏔️',
  TX: '⭐',
  VA: '🏛️',
  DE: '🔵',
};

export default function SelectState() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setSelectedState } = useMedicaidState();
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!selected) return;
    await setSelectedState(selected);
    router.push('/medicaid/income-journey');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medicaid Pathway</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>📍</Text>
          </View>
          <Text style={styles.sectionLabel}>GETTING STARTED</Text>
          <Text style={styles.mainTitle}>What state are you in?</Text>
          <Text style={styles.mainSubtitle}>
            Medicaid rules vary by state. We'll show you the right programs, forms, and steps for
            where you live.
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.choiceLabel}>Select your state</Text>

          {STATE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.code}
              style={[styles.stateCard, selected === option.code && styles.stateCardActive]}
              onPress={() => setSelected(option.code)}
            >
              <Text style={styles.stateFlag}>{STATE_FLAGS[option.code] ?? '🗺️'}</Text>
              <Text style={[styles.stateName, selected === option.code && styles.stateNameActive]}>
                {option.name}
              </Text>
              {selected === option.code && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}

          <View style={styles.betaBadge}>
            <Text style={styles.betaText}>
              🧪 More states coming soon. These 4 states are available in the beta.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonSecondary]}
          onPress={() => router.back()}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextSecondary]}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary, !selected && { opacity: 0.5 }]}
          disabled={!selected}
          onPress={handleContinue}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>
            Continue →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, 
    paddingBottom: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    flexDirection: 'row', alignItems: 'center',
  },
  backButton: { fontSize: 22, color: COLORS.purple, marginRight: SPACING.md },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  contentHeader: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, alignItems: 'flex-start',
  },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.lavender,
    justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md,
  },
  iconText: { fontSize: 24 },
  sectionLabel: {
    fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purple,
    letterSpacing: 1.5, marginBottom: SPACING.sm,
  },
  mainTitle: {
    fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text,
    marginBottom: SPACING.md, lineHeight: 28,
  },
  mainSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20 },
  content: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl },
  choiceLabel: {
    fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.lg,
  },
  stateCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md,
    borderWidth: 2, borderColor: COLORS.border,
  },
  stateCardActive: { borderColor: COLORS.purple, backgroundColor: 'rgba(124, 92, 191, 0.08)' },
  stateFlag: { fontSize: 28, marginRight: SPACING.lg },
  stateName: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  stateNameActive: { color: COLORS.purple },
  checkmark: { fontSize: 18, color: COLORS.purple, fontWeight: '700' },
  betaBadge: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  betaText: { fontSize: FONT_SIZES.xs, color: COLORS.purple, lineHeight: 18 },
  navigationButtons: {
    flexDirection: 'row', gap: SPACING.md, paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg, backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  navButton: {
    flex: 1, borderRadius: RADIUS.sm, paddingVertical: SPACING.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  navButtonPrimary: { backgroundColor: COLORS.purple },
  navButtonSecondary: { backgroundColor: COLORS.lavender },
  navButtonText: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  navButtonTextPrimary: { color: COLORS.white },
  navButtonTextSecondary: { color: COLORS.purple },
});
