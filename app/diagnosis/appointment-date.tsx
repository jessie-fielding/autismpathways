import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  primary: '#5B4FCF',
  primaryLight: '#EEF0FF',
  teal: '#2DB89E',
  tealLight: '#E6F7F4',
  white: '#FFFFFF',
  background: '#F4F5FB',
  textDark: '#1A1A2E',
  textMid: '#4A4A6A',
  textLight: '#8888AA',
  border: '#E0E0F0',
  successBg: '#E6F7F4',
  successText: '#1A7A6A',
  cardBg: '#FFFFFF',
};

export default function AppointmentDateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const evaluatorName = params.evaluatorName as string || 'your evaluator';
  const evalType = params.evalType as string || 'telehealth';

  const [hasDate, setHasDate] = useState<boolean | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Simple date picker using buttons for month/day/year
  const [month, setMonth] = useState(new Date().getMonth());
  const [day, setDay] = useState(new Date().getDate());
  const [year, setYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() + i);

  const handleSaveDate = async () => {
    const dateStr = `${months[month]} ${day}, ${year}`;
    try {
      await AsyncStorage.setItem('diagnosis_appointment_date', dateStr);
      await AsyncStorage.setItem('diagnosis_evaluator_name', evaluatorName);
    } catch (e) {}
    router.push({
      pathname: '/diagnosis/how-did-it-go',
      params: { evaluatorName, evalType, appointmentDate: dateStr },
    });
  };

  const handleWorkingOnIt = async () => {
    try {
      await AsyncStorage.setItem('diagnosis_appointment_status', 'working_on_it');
      await AsyncStorage.setItem('diagnosis_evaluator_name', evaluatorName);
    } catch (e) {}
    router.push({
      pathname: '/diagnosis/how-did-it-go',
      params: { evaluatorName, evalType, appointmentDate: 'pending' },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Step bar */}
      <View style={styles.stepBar}>
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <View
            key={s}
            style={[
              styles.stepSegment,
              s <= 5 ? styles.stepActive : styles.stepInactive,
            ]}
          />
        ))}
      </View>
      <Text style={styles.stepLabel}>Step 5 of 6</Text>

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader} />
        <View style={styles.cardBody}>
          <Text style={styles.mainTitle}>Have you scheduled your appointment?</Text>
          <Text style={styles.subtitle}>
            If you have a date, add it here and we'll track it on your dashboard so you never lose it.
          </Text>

          <View style={styles.optionRow}>
            {/* Yes - I have a date */}
            <TouchableOpacity
              style={[styles.optionCard, hasDate === true && styles.optionCardSelected]}
              onPress={() => { setHasDate(true); setShowPicker(true); }}
              activeOpacity={0.8}
            >
              <Text style={styles.optionIcon}>📅</Text>
              <Text style={styles.optionTitle}>Yes — I have a date</Text>
              <Text style={styles.optionDesc}>Add it and we'll track it for you.</Text>
            </TouchableOpacity>

            {/* Working on it */}
            <TouchableOpacity
              style={[styles.optionCard, hasDate === false && styles.optionCardSelected]}
              onPress={() => { setHasDate(false); setShowPicker(false); }}
              activeOpacity={0.8}
            >
              <Text style={styles.optionIcon}>📞</Text>
              <Text style={styles.optionTitle}>Working on it</Text>
              <Text style={styles.optionDesc}>I've reached out but don't have a date yet.</Text>
            </TouchableOpacity>
          </View>

          {/* Date Picker */}
          {hasDate === true && showPicker && (
            <View style={styles.datePicker}>
              <Text style={styles.datePickerLabel}>Select your appointment date</Text>

              {/* Month */}
              <Text style={styles.pickerSectionLabel}>Month</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
                {months.map((m, i) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.pickerChip, month === i && styles.pickerChipSelected]}
                    onPress={() => { setMonth(i); if (day > new Date(year, i + 1, 0).getDate()) setDay(1); }}
                  >
                    <Text style={[styles.pickerChipText, month === i && styles.pickerChipTextSelected]}>
                      {m.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Day */}
              <Text style={styles.pickerSectionLabel}>Day</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow}>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.pickerChip, styles.pickerChipSmall, day === d && styles.pickerChipSelected]}
                    onPress={() => setDay(d)}
                  >
                    <Text style={[styles.pickerChipText, day === d && styles.pickerChipTextSelected]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Year */}
              <Text style={styles.pickerSectionLabel}>Year</Text>
              <View style={styles.yearRow}>
                {years.map((y) => (
                  <TouchableOpacity
                    key={y}
                    style={[styles.pickerChip, year === y && styles.pickerChipSelected]}
                    onPress={() => setYear(y)}
                  >
                    <Text style={[styles.pickerChipText, year === y && styles.pickerChipTextSelected]}>
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.selectedDateBox}>
                <Text style={styles.selectedDateText}>
                  Selected: {months[month]} {day}, {year}
                </Text>
              </View>
            </View>
          )}

          {/* Info box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>✅</Text>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoTitle}>You're almost there.</Text>
              <Text style={styles.infoDesc}>
                Once your appointment is scheduled, the hardest part is behind you. The evaluation itself is just observation and conversation — your child doesn't need to prepare.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {hasDate === true ? (
          <TouchableOpacity style={styles.continueButton} onPress={handleSaveDate}>
            <Text style={styles.continueButtonText}>Save Date →</Text>
          </TouchableOpacity>
        ) : hasDate === false ? (
          <TouchableOpacity style={styles.continueButton} onPress={handleWorkingOnIt}>
            <Text style={styles.continueButtonText}>Continue →</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  stepBar: { flexDirection: 'row', gap: 4, marginBottom: 4 },
  stepSegment: { flex: 1, height: 4, borderRadius: 2 },
  stepActive: { backgroundColor: COLORS.teal },
  stepInactive: { backgroundColor: COLORS.border },
  stepLabel: { fontSize: 13, color: COLORS.teal, fontWeight: '600', marginBottom: 16 },
  card: { backgroundColor: COLORS.cardBg, borderRadius: 16, overflow: 'hidden', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardHeader: { height: 6, backgroundColor: COLORS.teal },
  cardBody: { padding: 20 },
  mainTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textDark, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textMid, lineHeight: 22, marginBottom: 20 },
  optionRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  optionCard: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 14, padding: 14, backgroundColor: COLORS.white },
  optionCardSelected: { borderColor: COLORS.teal, backgroundColor: COLORS.tealLight },
  optionIcon: { fontSize: 24, marginBottom: 6 },
  optionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  optionDesc: { fontSize: 13, color: COLORS.textMid, lineHeight: 18 },
  datePicker: { backgroundColor: COLORS.primaryLight, borderRadius: 12, padding: 16, marginBottom: 16 },
  datePickerLabel: { fontSize: 15, fontWeight: '700', color: COLORS.primary, marginBottom: 12 },
  pickerSectionLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 8 },
  pickerRow: { flexDirection: 'row', marginBottom: 4 },
  pickerChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.border, marginRight: 8, backgroundColor: COLORS.white },
  pickerChipSmall: { paddingHorizontal: 10 },
  pickerChipSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pickerChipText: { fontSize: 13, color: COLORS.textMid, fontWeight: '600' },
  pickerChipTextSelected: { color: COLORS.white },
  yearRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  selectedDateBox: { marginTop: 12, backgroundColor: COLORS.white, borderRadius: 10, padding: 12 },
  selectedDateText: { fontSize: 15, fontWeight: '700', color: COLORS.primary, textAlign: 'center' },
  infoBox: { flexDirection: 'row', backgroundColor: COLORS.successBg, borderRadius: 12, padding: 14, gap: 10 },
  infoIcon: { fontSize: 20 },
  infoTextBox: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: COLORS.successText, marginBottom: 4 },
  infoDesc: { fontSize: 13, color: COLORS.successText, lineHeight: 19 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 30, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white },
  backButtonText: { fontSize: 15, color: COLORS.textMid, fontWeight: '600' },
  continueButton: { flex: 1, marginLeft: 12, paddingVertical: 16, borderRadius: 30, backgroundColor: COLORS.teal, alignItems: 'center' },
  continueButtonText: { fontSize: 16, color: COLORS.white, fontWeight: '700' },
});
