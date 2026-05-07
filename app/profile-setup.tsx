import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '../lib/theme';
import { storage } from '../services/storage';
import { addChild, setActiveChildId, loadChildren } from '../services/childManager';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textMid,
    lineHeight: 24,
  },
  formGroup: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    fontSize: FONT_SIZES.base,
    backgroundColor: COLORS.white,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
});

export default function ProfileSetupScreen() {
  const router = useRouter();
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!childName || !childAge || !state) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await storage.setProfile({
        childName,
        childAge: parseInt(childAge),
        state,
        createdAt: new Date().toISOString(),
      });

      // Create a real childManager entry so this child appears in the
      // Manage Children list and multi-child switching works from the start.
      const existingChildren = await loadChildren();
      if (existingChildren.length === 0) {
        const newChild = await addChild({ name: childName.trim() });
        await setActiveChildId(newChild.id);
      }

      // Initialize default data
      await storage.setPathway('medicaid', {
        title: 'Medicaid Pathway',
        currentStep: 1,
        totalSteps: 8,
        progress: 12.5,
      });

      await storage.setPathway('diagnosis', {
        title: 'Diagnosis Pathway',
        currentStep: 1,
        totalSteps: 6,
        progress: 16.7,
      });

      await storage.setTasks([
        { id: 1, title: 'Verify contact info with waiver office', completed: false },
        { id: 2, title: 'Submit annual waiver check-in', completed: false },
        { id: 3, title: 'Complete the ICD support quiz', completed: false },
      ]);

      router.replace('/(tabs)/dashboard');
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Let's get started</Text>
          <Text style={styles.subtitle}>
            Tell us a bit about your child so we can personalize your journey.
          </Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Child's Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Ellie"
            value={childName}
            onChangeText={setChildName}
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 6"
            value={childAge}
            onChangeText={setChildAge}
            keyboardType="number-pad"
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>State</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Colorado"
            value={state}
            onChangeText={setState}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Saving...' : 'Continue to Dashboard'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
