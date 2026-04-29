import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { fontSize: 20, color: COLORS.purple, marginRight: SPACING.md },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  contentHeader: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  mainTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    lineHeight: 32,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
  },
  infoBox: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  infoTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: '#C62828',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  navButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  navButtonPrimary: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  navButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  navButtonTextPrimary: {
    color: COLORS.white,
  },
});

export default function AppealIntroScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const denialReason = Array.isArray(params.denialReason) ? params.denialReason[0] : params.denialReason;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appeals</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentHeader}>
          <Text style={styles.mainTitle}>You Have the Right to Appeal</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>⚠️ IMPORTANT DEADLINE</Text>
            <Text style={styles.infoText}>
              You typically have 30 days from the denial letter to file an appeal. If you are past that, there may still be options. Act quickly.
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📋 What You Need</Text>
            <Text style={styles.infoText}>
              Your denial letter, child evaluation documents, IEP, medical records, and contact information for your state Medicaid office.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.navButtons}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
          <Text style={styles.navButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, styles.navButtonPrimary]}
          onPress={() => router.push(denialReason === 'income' ? '/medicaid/disability-journey/intro' : '/medicaid/appeal-journey/step-1-understand')}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Start →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
