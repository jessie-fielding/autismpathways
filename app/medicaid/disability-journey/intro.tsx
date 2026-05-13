import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';
import { PathwayDisclaimer } from '../../../components/PathwayDisclaimer';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, flexDirection: 'row', alignItems: 'center' },
  backButton: { fontSize: 20, color: COLORS.purple, marginRight: SPACING.md },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  content: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, backgroundColor: COLORS.white, flex: 1 },
  mainTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.lg },
  infoBox: { backgroundColor: 'rgba(33, 150, 243, 0.08)', borderLeftWidth: 4, borderLeftColor: '#2196F3', borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.lg },
  infoText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  navButtons: { flexDirection: 'row', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  navButton: { flex: 1, padding: SPACING.lg, borderRadius: RADIUS.lg, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center' },
  navButtonPrimary: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  navButtonText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  navButtonTextPrimary: { color: COLORS.white },
});

export default function DisabilityIntroScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Disability</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.mainTitle}>Disability Medicaid Path</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>If denied based on income, you may still qualify using disability status with different eligibility rules.</Text>
        </View>
        <PathwayDisclaimer type="legal" />
      </ScrollView>
      <View style={styles.navButtons}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.navButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, styles.navButtonPrimary]} onPress={() => router.push('/medicaid/disability-journey/quiz-1')}>
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}