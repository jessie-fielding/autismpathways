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
  infoBox: { backgroundColor: 'rgba(244, 67, 54, 0.1)', borderLeftWidth: 4, borderLeftColor: '#F44336', borderRadius: RADIUS.md, padding: SPACING.lg, marginBottom: SPACING.lg },
  infoText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  navButtons: { flexDirection: 'row', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  navButton: { flex: 1, padding: SPACING.lg, borderRadius: RADIUS.lg, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center' },
  navButtonPrimary: { backgroundColor: '#FF9800', borderColor: '#FF9800' },
  navButtonText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  navButtonTextPrimary: { color: COLORS.white },
});

export default function AppealIntroScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appeals</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.mainTitle}>You Have the Right to Appeal</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>You typically have 30 days from denial to file an appeal. Act quickly.</Text>
        </View>
        <PathwayDisclaimer type="legal" />
      </ScrollView>
      <View style={styles.navButtons}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.navButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, styles.navButtonPrimary]} onPress={() => router.push('/medicaid/appeal-journey/step-1-understand')}>
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
