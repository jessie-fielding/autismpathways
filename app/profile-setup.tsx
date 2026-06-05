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
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../lib/theme';
import { storage } from '../services/storage';
import { addChild, setActiveChildId, loadChildren } from '../services/childManager';

const AVATAR_EMOJIS = [
  '\ud83e\udd8b', '\ud83c\udf08', '\ud83e\udd84', '\ud83d\udc3b',
  '\u2b50', '\ud83c\udfa8', '\ud83d\ude80', '\ud83e\udd81',
  '\ud83d\udc2c', '\ud83c\udf38', '\ud83c\udfaf', '\u26a1',
];

const STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
  'New Hampshire','New Jersey','New Mexico','New York','North Carolina',
  'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [state, setState] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickPhoto = async () => {
    Alert.alert(
      'Child\'s Photo',
      'Choose how to add a photo',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Camera access is required to take a photo.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
            });
            if (!result.canceled && result.assets[0]) {
              setPhotoUri(result.assets[0].uri);
              setSelectedEmoji('');
            }
          },
        },
        {
          text: 'Choose from Library',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Photo library access is required.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.7,
            });
            if (!result.canceled && result.assets[0]) {
              setPhotoUri(result.assets[0].uri);
              setSelectedEmoji('');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    if (!childName || !childAge || !state) {
      Alert.alert('Missing info', 'Please fill in your child\'s name, age, and state.');
      return;
    }
    setLoading(true);
    try {
      const avatarValue = photoUri || selectedEmoji || childName.slice(0, 2).toUpperCase();
      await storage.setProfile({
        childName,
        childAge: parseInt(childAge),
        state,
        createdAt: new Date().toISOString(),
      });
      const existingChildren = await loadChildren();
      if (existingChildren.length === 0) {
        const newChild = await addChild({
          name: childName.trim(),
          avatar: avatarValue,
        });
        await setActiveChildId(newChild.id);
      }
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
      router.replace('/onboarding');
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={styles.title}>Tell us about your child</Text>
          <Text style={styles.subtitle}>
            This helps us personalize everything for you
          </Text>
        </View>

        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <Text style={styles.sectionLabel}>Pick an avatar</Text>

          {/* Photo button */}
          <TouchableOpacity onPress={pickPhoto} style={styles.photoBtn} activeOpacity={0.8}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            ) : (
              <>
                <Text style={styles.photoBtnIcon}>\ud83d\udcf7</Text>
                <Text style={styles.photoBtnText}>Take or upload a photo</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Emoji grid */}
          <View style={styles.emojiGrid}>
            {AVATAR_EMOJIS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiItem,
                  selectedEmoji === emoji && styles.emojiSelected,
                ]}
                onPress={() => {
                  setSelectedEmoji(emoji);
                  setPhotoUri(null);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Child name */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Child\'s First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Ellie"
            placeholderTextColor={COLORS.textLight}
            value={childName}
            onChangeText={setChildName}
            editable={!loading}
            autoCapitalize="words"
          />
        </View>

        {/* Age */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Child\'s Age</Text>
          <TextInput
            style={styles.input}
            placeholder="6"
            placeholderTextColor={COLORS.textLight}
            value={childAge}
            onChangeText={setChildAge}
            keyboardType="number-pad"
            editable={!loading}
          />
        </View>

        {/* State */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Your State</Text>
          <TextInput
            style={styles.input}
            placeholder="Colorado"
            placeholderTextColor={COLORS.textLight}
            value={state}
            onChangeText={setState}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Saving...' : 'Continue to Dashboard \u2192'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textMid,
    lineHeight: 24,
  },
  avatarSection: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.purple,
    borderStyle: 'dashed',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
    backgroundColor: '#F8F5FF',
    minHeight: 64,
    overflow: 'hidden',
  },
  photoPreview: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  photoBtnIcon: { fontSize: 20 },
  photoBtnText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.purple,
    fontWeight: '600',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  emojiItem: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  emojiSelected: {
    borderColor: COLORS.purple,
    backgroundColor: '#F0EBFF',
  },
  emojiText: { fontSize: 26 },
  formGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1.5,
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
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    ...SHADOWS.md,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
});
