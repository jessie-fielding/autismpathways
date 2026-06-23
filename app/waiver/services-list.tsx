/**
 * Waiver Services List
 *
 * Shows all common DD/ID waiver-covered services.
 * Free: view services, mark what you want, basic info
 * Premium: caseworker email/script generator, service scheduler
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View, Share, Modal,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';
import { trackPaywallViewed } from '../../lib/analytics';

const STORAGE_KEY = 'ap_waiver_services_selected';
const CHILD_KEY = 'ap_child_name';
const CASEWORKER_KEY = 'ap_caseworker_name';

interface WaiverService {
  id: string;
  emoji: string;
  category: string;
  name: string;
  description: string;
  isABA?: boolean;
}

const WAIVER_SERVICES: WaiverService[] = [
  // Therapy Services
  { id: 'aba', emoji: '🧠', category: 'Therapy', name: 'Applied Behavior Analysis (ABA)', description: 'Structured behavioral intervention to build skills and reduce challenging behaviors. Coverage varies by waiver type.', isABA: true },
  { id: 'speech', emoji: '🗣️', category: 'Therapy', name: 'Speech-Language Therapy', description: 'Communication, language, and feeding therapy provided by a licensed SLP.' },
  { id: 'ot', emoji: '🖐️', category: 'Therapy', name: 'Occupational Therapy', description: 'Fine motor, sensory processing, self-care, and daily living skills.' },
  { id: 'pt', emoji: '🦵', category: 'Therapy', name: 'Physical Therapy', description: 'Gross motor skills, mobility, and physical development.' },
  { id: 'feeding', emoji: '🍽️', category: 'Therapy', name: 'Feeding Therapy', description: 'Addresses food aversions, oral motor issues, and safe swallowing.' },
  { id: 'behavioral', emoji: '💬', category: 'Therapy', name: 'Behavioral Support Services', description: 'Non-ABA behavioral intervention and support planning.' },
  { id: 'music_art', emoji: '🎨', category: 'Therapy', name: 'Music / Art Therapy', description: 'Expressive therapy modalities that support communication and emotional regulation.' },
  // Personal Support
  { id: 'personal_care', emoji: '🤝', category: 'Personal Support', name: 'Personal Care / PCA', description: 'Assistance with daily living activities like bathing, dressing, and grooming.' },
  { id: 'respite', emoji: '🏡', category: 'Personal Support', name: 'Respite Care', description: 'Temporary relief for primary caregivers. Can be in-home or out-of-home.' },
  { id: 'companion', emoji: '👥', category: 'Personal Support', name: 'Companion Services', description: 'Non-medical supervision, socialization, and community access support.' },
  { id: 'homemaker', emoji: '🏠', category: 'Personal Support', name: 'Homemaker Services', description: 'Household tasks and chores to support the family unit.' },
  // Community & Skill Building
  { id: 'day_program', emoji: '🏫', category: 'Community & Skills', name: 'Day Habilitation Program', description: 'Structured daytime programming focused on skill development and community integration.' },
  { id: 'social_skills', emoji: '🌟', category: 'Community & Skills', name: 'Social Skills Training', description: 'Group or individual sessions to build peer interaction and communication skills.' },
  { id: 'community_access', emoji: '🚌', category: 'Community & Skills', name: 'Community Access / Integration', description: 'Supported participation in community activities, outings, and events.' },
  { id: 'supported_employment', emoji: '💼', category: 'Community & Skills', name: 'Supported Employment', description: 'Job coaching and employment support for individuals 16 and older.' },
  // Equipment & Modifications
  { id: 'assistive_tech', emoji: '📱', category: 'Equipment & Modifications', name: 'Assistive Technology', description: 'AAC devices, communication apps, adaptive equipment, and tech supports.' },
  { id: 'home_mod', emoji: '🔧', category: 'Equipment & Modifications', name: 'Home Modifications', description: 'Physical modifications to the home for safety and accessibility (ramps, grab bars, etc.).' },
  { id: 'vehicle_mod', emoji: '🚗', category: 'Equipment & Modifications', name: 'Vehicle Modifications', description: 'Adaptive vehicle equipment for individuals with mobility needs.' },
  // Coordination & Planning
  { id: 'service_coord', emoji: '📋', category: 'Coordination & Planning', name: 'Service Coordination / Case Management', description: 'A coordinator helps plan, arrange, and monitor all waiver services.' },
  { id: 'family_training', emoji: '📚', category: 'Coordination & Planning', name: 'Family Training & Support', description: 'Training for family members on how to support their child\'s needs and implement strategies.' },
  { id: 'crisis', emoji: '🆘', category: 'Coordination & Planning', name: 'Crisis Intervention Services', description: 'Emergency behavioral health support and crisis stabilization.' },
];

const CATEGORIES = [...new Set(WAIVER_SERVICES.map(s => s.category))];

export default function WaiverServicesListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [childName, setChildName] = useState('');
  const [caseworkerName, setCaseworkerName] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(CATEGORIES[0]);

  useFocusEffect(useCallback(() => {
    AsyncStorage.multiGet([STORAGE_KEY, CHILD_KEY, CASEWORKER_KEY]).then(pairs => {
      const saved = pairs[0][1];
      if (saved) setSelected(new Set(JSON.parse(saved)));
      if (pairs[1][1]) setChildName(pairs[1][1]);
      if (pairs[2][1]) setCaseworkerName(pairs[2][1]);
    });
  }, []));

  const toggle = async (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  };

  const selectedServices = WAIVER_SERVICES.filter(s => selected.has(s.id));

  const generateEmail = () => {
    const child = childName || '[Child\'s Name]';
    const cw = caseworkerName || '[Caseworker Name]';
    const serviceList = selectedServices.map(s => `  • ${s.name}`).join('\n');
    return `Dear ${cw},\n\nI am writing to request that the following services be added to ${child}'s current waiver service plan. These services have been identified as appropriate supports to help ${child} reach their goals and maximize their waiver benefits.\n\nRequested Services:\n${serviceList}\n\nI would appreciate the opportunity to discuss these additions at our next meeting or at your earliest convenience. Please let me know what documentation or next steps are needed to initiate these services.\n\nThank you for your continued support.\n\nSincerely,\n[Your Name]\n[Your Phone Number]`;
  };

  const handleShare = async () => {
    const email = generateEmail();
    await Share.share({ title: 'Waiver Service Request', message: email });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.headerTitle}>Waiver Services</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/dashboard")}><Text style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 1 }}>🏠 Dashboard</Text></TouchableOpacity>
        </View>
        {selectedServices.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{selectedServices.length}</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>What Does Your Waiver Cover?</Text>
          <Text style={styles.introBody}>
            Check off the services you want to explore or request. Then use the email generator to send a request to your caseworker.
          </Text>
        </View>

        {CATEGORIES.map(cat => {
          const catServices = WAIVER_SERVICES.filter(s => s.category === cat);
          const catSelected = catServices.filter(s => selected.has(s.id)).length;
          return (
            <View key={cat} style={styles.catSection}>
              <TouchableOpacity
                style={styles.catHeader}
                onPress={() => setExpandedCat(expandedCat === cat ? null : cat)}
              >
                <Text style={styles.catTitle}>{cat}</Text>
                {catSelected > 0 && (
                  <View style={styles.catBadge}>
                    <Text style={styles.catBadgeText}>{catSelected} selected</Text>
                  </View>
                )}
                <Text style={styles.catChevron}>{expandedCat === cat ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {expandedCat === cat && catServices.map(service => (
                <TouchableOpacity
                  key={service.id}
                  style={[styles.serviceRow, selected.has(service.id) && styles.serviceRowSelected]}
                  onPress={() => toggle(service.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, selected.has(service.id) && styles.checkboxSelected]}>
                    {selected.has(service.id) && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceEmoji}>{service.emoji}</Text>
                    <View style={styles.serviceText}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.serviceDesc}>{service.description}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}

        {selectedServices.length > 0 && (
          <View style={styles.actionSection}>
            <Text style={styles.actionTitle}>
              {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selected
            </Text>

            {isPremium ? (
              <TouchableOpacity style={styles.emailBtn} onPress={() => setShowEmailModal(true)}>
                <Text style={styles.emailBtnText}>✉️ Generate Caseworker Email</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.premiumBtn} onPress={() => (trackPaywallViewed('waiver_services_list'), router.push('/paywall'))}>
                <Text style={styles.premiumBtnText}>🔒 Unlock Email Generator — Go Premium</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.scheduleBtn} onPress={() => router.push('/waiver/service-scheduler')}>
              <Text style={styles.scheduleBtnText}>📅 Schedule & Track These Services</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Email Generator Modal */}
      <Modal visible={showEmailModal} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.modalContainer, { paddingTop: insets.top + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Caseworker Request Email</Text>
              <TouchableOpacity onPress={() => setShowEmailModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} contentContainerStyle={{ padding: SPACING.lg }}>
              <Text style={styles.inputLabel}>Child's Name</Text>
              <TextInput
                style={styles.input}
                value={childName}
                onChangeText={async (v) => { setChildName(v); await AsyncStorage.setItem(CHILD_KEY, v); }}
                placeholder="e.g. Jayden"
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.inputLabel}>Caseworker's Name</Text>
              <TextInput
                style={styles.input}
                value={caseworkerName}
                onChangeText={async (v) => { setCaseworkerName(v); await AsyncStorage.setItem(CASEWORKER_KEY, v); }}
                placeholder="e.g. Maria Lopez"
                placeholderTextColor={COLORS.textLight}
              />

              <Text style={styles.inputLabel}>Generated Email</Text>
              <View style={styles.emailPreview}>
                <Text style={styles.emailPreviewText}>{generateEmail()}</Text>
              </View>

              <TouchableOpacity style={styles.shareEmailBtn} onPress={handleShare}>
                <Text style={styles.shareEmailBtnText}>📤 Share / Copy Email</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.white,
  },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  countBadge: { backgroundColor: COLORS.purple, borderRadius: RADIUS.pill, width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  countBadgeText: { color: COLORS.white, fontSize: FONT_SIZES.xs, fontWeight: '800' },
  scroll: { padding: SPACING.lg, paddingBottom: 48 },
  introCard: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.lavenderAccent,
  },
  introTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.purple, marginBottom: SPACING.xs },
  introBody: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, lineHeight: 19 },
  catSection: { marginBottom: SPACING.md },
  catHeader: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm, padding: SPACING.md, ...SHADOWS.sm,
    borderWidth: 1, borderColor: COLORS.border,
  },
  catTitle: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  catBadge: { backgroundColor: COLORS.lavender, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.sm, paddingVertical: 2, marginRight: SPACING.sm },
  catBadgeText: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '700' },
  catChevron: { fontSize: 12, color: COLORS.textLight },
  serviceRow: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.sm, padding: SPACING.md,
    marginTop: 2, borderWidth: 1, borderColor: COLORS.border,
  },
  serviceRowSelected: { backgroundColor: '#f5f0ff', borderColor: COLORS.lavenderAccent },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm,
  },
  checkboxSelected: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  checkmark: { color: COLORS.white, fontSize: 13, fontWeight: '800' },
  serviceInfo: { flexDirection: 'row', gap: SPACING.sm },
  serviceEmoji: { fontSize: 20, marginTop: 1 },
  serviceText: { flex: 1 },
  serviceName: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  serviceDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, lineHeight: 17 },
  actionSection: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.sm, ...SHADOWS.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  actionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md, textAlign: 'center' },
  emailBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingVertical: 14,
    alignItems: 'center', marginBottom: SPACING.sm,
  },
  emailBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },
  premiumBtn: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.sm, paddingVertical: 14,
    alignItems: 'center', marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.lavenderAccent,
  },
  premiumBtnText: { color: COLORS.purple, fontWeight: '700', fontSize: FONT_SIZES.sm },
  scheduleBtn: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.sm, paddingVertical: 12,
    alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.purple,
  },
  scheduleBtnText: { color: COLORS.purple, fontWeight: '600', fontSize: FONT_SIZES.sm },
  // Modal
  modalContainer: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  modalClose: { fontSize: 18, color: COLORS.textLight, padding: SPACING.sm },
  modalScroll: { flex: 1 },
  inputLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.sm, color: COLORS.text, backgroundColor: COLORS.white,
    marginBottom: SPACING.lg,
  },
  emailPreview: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.sm, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg,
  },
  emailPreviewText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 22 },
  shareEmailBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingVertical: 14,
    alignItems: 'center',
  },
  shareEmailBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.md },
});
