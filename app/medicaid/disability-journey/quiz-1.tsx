import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '../../../lib/theme';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, flexDirection: 'row', alignItems: 'center' },
  backButton: { fontSize: 20, color: COLORS.purple, marginRight: SPACING.md },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  content: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, backgroundColor: COLORS.white, flex: 1 },
  mainTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.lg },
  optionBox: { borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg, borderWidth: 2, borderColor: COLORS.border, backgroundColor: COLORS.white },
  optionBoxActive: { borderColor: COLORS.purple, backgroundColor: 'rgba(124, 92, 191, 0.08)' },
  optionText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  navButtons: { flexDirection: 'row', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.lg, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  navButton: { flex: 1, padding: SPACING.lg, borderRadius: RADIUS.lg, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center' },
  navButtonPrimary: { backgroundColor: '#7AB5FF', borderColor: '#7AB5FF' },
  navButtonText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  navButtonTextPrimary: { color: COLORS.white },
});

export default function DisabilityQuiz1Screen() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assessment</Text>
      </View>
      <ScrollView style={styles.content}>
        <Text style={styles.mainTitle}>What is your child primary disability?</Text>
        {[
          { id: 'autism', label: 'Autism' },
          { id: 'cerebral', label: 'Cerebral Palsy' },
          { id: 'down', label: 'Down Syndrome' },
          { id: 'id', label: 'Intellectual Disability' },
          { id: 'other', label: 'Other' },
        ].map((option) => (
          <TouchableOpacity key={option.id} style={[styles.optionBox, selected === option.id && styles.optionBoxActive]} onPress={() => setSelected(option.id)}>
            <Text style={styles.optionText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.navButtons}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.navButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, styles.navButtonPrimary, !selected && { opacity: 0.5 }]} disabled={!selected}>
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
