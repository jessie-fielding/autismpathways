import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  loadChildren, addChild, updateChild, deleteChild,
  setActiveChildId, getActiveChildId, type ChildProfile,
} from '../../services/childManager';
import { emitChildChanged } from '../../services/childEvents';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import CityCountyAutocomplete from '../../components/CityCountyAutocomplete';

// ── Journey options (matches profile-setup.tsx) ───────────────────────────────
const JOURNEY_OPTIONS = [
  { id: 'diagnosis',   icon: '🔍', label: 'Getting a Diagnosis',    sub: 'Evaluations, waitlists & next steps' },
  { id: 'medicaid',   icon: '💳', label: 'Medicaid / Insurance',     sub: 'Applying, appealing, or understanding coverage' },
  { id: 'waivers',    icon: '🛡️', label: 'Waiver Programs',          sub: 'HCBS, DD waivers, and state programs' },
  { id: 'school',     icon: '🏫', label: 'IEP / School Support',     sub: 'IEP meetings, 504 plans, and school rights' },
  { id: 'behavior',   icon: '🧠', label: 'Behavior & Daily Life',    sub: 'Meltdowns, routines, sensory needs' },
  { id: 'speech',     icon: '🗣️', label: 'Speech & Communication',   sub: 'AAC, speech therapy, and language goals' },
  { id: 'sensory',    icon: '🌊', label: 'Sensory Processing',       sub: 'OT, sensory diets, and environment' },
  { id: 'sleep',      icon: '🌙', label: 'Sleep Challenges',         sub: 'Sleep studies, melatonin, bedtime routines' },
  { id: 'transition', icon: '🎓', label: 'Transition to Adulthood',  sub: 'Adult services, employment, housing' },
  { id: 'family',     icon: '❤️', label: 'Family & Self-Care',       sub: 'Sibling support, caregiver burnout, community' },
];

// ── Blank form state ──────────────────────────────────────────────────────────
interface ChildForm {
  name: string;
  dob: string;
  diagnosis: string;
  diagnosisLevel: string;
  avatar: string;
  state: string;
  county: string;
  concerns: string[];
}

const BLANK: ChildForm = {
  name: '', dob: '', diagnosis: '', diagnosisLevel: '',
  avatar: '', state: '', county: '', concerns: [],
};

const AVATAR_EMOJIS = [
  '🦁', '🐼', '🐨', '🦊', '🐸', '🦋', '🌟', '🌈', '🦄', '🐶',
  '🐱', '🐭', '🐹', '🐰', '🐻', '🐯', '🐮', '🐷', '🐙', '🦖',
  '🚀', '⚡', '🌺', '🍀', '🎈', '🎨', '🏆', '💎', '🌙', '☀️',
];

// ─────────────────────────────────────────────────────────────────────────────

export default function ManageChildrenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ChildForm>({ ...BLANK });
  const [saving, setSaving] = useState(false);

  // ── Load ────────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    const [kids, id] = await Promise.all([loadChildren(), getActiveChildId()]);
    setChildren(kids);
    setActiveIdState(id);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  // ── Switch active child ─────────────────────────────────────────────────────
  const handleSwitch = async (id: string) => {
    await setActiveChildId(id);
    setActiveIdState(id);
    emitChildChanged(id);
  };

  // ── Open add modal ──────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditingId(null);
    setForm({ ...BLANK });
    setShowModal(true);
  };

  // ── Open edit modal ─────────────────────────────────────────────────────────
  const openEdit = (child: ChildProfile) => {
    setEditingId(child.id);
    setForm({
      name: child.name || '',
      dob: child.dob || '',
      diagnosis: child.diagnosis || '',
      diagnosisLevel: child.diagnosisLevel || '',
      avatar: child.avatar || '',
      state: child.state || '',
      county: child.county || '',
      concerns: child.concerns || [],
    });
    setShowModal(true);
  };

  // ── Toggle journey concern ──────────────────────────────────────────────────
  const toggleConcern = (id: string) => {
    setForm((f) => ({
      ...f,
      concerns: f.concerns.includes(id)
        ? f.concerns.filter((c) => c !== id)
        : [...f.concerns, id],
    }));
  };

  // ── Save (add or update) ────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Name required', "Please enter the child's name.");
      return;
    }
    setSaving(true);
    try {
      const updates = {
        name: form.name.trim(),
        dob: form.dob.trim(),
        diagnosis: form.diagnosis.trim(),
        diagnosisLevel: form.diagnosisLevel as ChildProfile['diagnosisLevel'],
        avatar: form.avatar || undefined,
        state: form.state.trim() || undefined,
        county: form.county.trim() || undefined,
        concerns: form.concerns.length > 0 ? form.concerns : undefined,
      };
      if (editingId) {
        await updateChild(editingId, updates);
      } else {
        const newChild = await addChild(updates);
        const current = await getActiveChildId();
        if (!current) await setActiveChildId(newChild.id);
      }
      await loadData();
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = (child: ChildProfile) => {
    Alert.alert(
      `Remove ${child.name}?`,
      'This will permanently delete all pathway progress, notes, and data for this child. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteChild(child.id);
            await loadData();
          },
        },
      ]
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Children</Text>
        <View style={{ width: 60 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={COLORS.purple} />
      ) : (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scroll}>
          {/* Intro */}
          <Text style={styles.intro}>
            Each child has their own separate pathway progress, IEP notes, observations, and data.
            Tap a child to make them active — the dashboard will update to show their journey.
          </Text>

          {/* Children list */}
          {children.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>👶</Text>
              <Text style={styles.emptyTitle}>No children added yet</Text>
              <Text style={styles.emptySub}>
                Add your child below to start tracking their pathway.
              </Text>
            </View>
          ) : (
            children.map((child) => {
              const isActive = child.id === activeId;
              return (
                <View key={child.id} style={[styles.childCard, isActive && styles.childCardActive]}>
                  {/* Avatar + info */}
                  <TouchableOpacity
                    style={styles.childMain}
                    onPress={() => handleSwitch(child.id)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.avatar, { backgroundColor: child.color || COLORS.purple }]}>
                      {child.avatar && (child.avatar.startsWith('file://') || child.avatar.startsWith('content://') || child.avatar.startsWith('http')) ? (
                        <Image source={{ uri: child.avatar }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                      ) : (
                        <Text style={styles.avatarText}>{child.avatar || child.name.slice(0, 2).toUpperCase()}</Text>
                      )}
                    </View>
                    <View style={styles.childInfo}>
                      <View style={styles.childNameRow}>
                        <Text style={styles.childName}>{child.name}</Text>
                        {isActive && (
                          <View style={styles.activeBadge}>
                            <Text style={styles.activeBadgeText}>Active</Text>
                          </View>
                        )}
                      </View>
                      {child.dob ? (
                        <Text style={styles.childMeta}>DOB: {child.dob}</Text>
                      ) : null}
                      {child.diagnosis ? (
                        <Text style={styles.childMeta}>
                          {child.diagnosis}
                          {child.diagnosisLevel ? ` · Level ${child.diagnosisLevel}` : ''}
                        </Text>
                      ) : (
                        <Text style={styles.childMetaLight}>No diagnosis recorded</Text>
                      )}
                      {(child.state || child.county) ? (
                        <Text style={styles.childMeta}>
                          📍 {[child.county, child.state].filter(Boolean).join(', ')}
                        </Text>
                      ) : null}
                      {child.concerns && child.concerns.length > 0 ? (
                        <Text style={styles.childMeta}>
                          🗺️ {child.concerns.length} journey{child.concerns.length > 1 ? 's' : ''} selected
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>

                  {/* Action buttons */}
                  <View style={styles.childActions}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(child)}>
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    {children.length > 1 && (
                      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(child)}>
                        <Text style={styles.deleteBtnText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}

          {/* Add child button */}
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Text style={styles.addBtnIcon}>＋</Text>
            <Text style={styles.addBtnText}>Add Another Child</Text>
          </TouchableOpacity>

          {/* Info note */}
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              💡 Switching children updates the dashboard, all pathway trackers, IEP notes, and observations to show that child's data.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────────────────────────── */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Child' : 'Add a Child'}
              </Text>

              {/* Photo / Avatar Picker */}
              <Text style={styles.fieldLabel}>Child's Photo or Avatar</Text>
              <View style={styles.photoRow}>
                <View style={styles.photoPreview}>
                  {form.avatar && (form.avatar.startsWith('file://') || form.avatar.startsWith('content://') || form.avatar.startsWith('http')) ? (
                    <Image source={{ uri: form.avatar }} style={styles.photoPreviewImg} />
                  ) : form.avatar ? (
                    <Text style={{ fontSize: 36 }}>{form.avatar}</Text>
                  ) : (
                    <Text style={{ fontSize: 32 }}>📷</Text>
                  )}
                </View>
                <View style={styles.photoButtons}>
                  <TouchableOpacity
                    style={styles.photoBtn}
                    onPress={async () => {
                      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                      if (status !== 'granted') {
                        Alert.alert('Permission needed', 'Please allow photo access in Settings.');
                        return;
                      }
                      const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        aspect: [1, 1],
                        quality: 0.7,
                      });
                      if (!result.canceled && result.assets[0]) {
                        setForm((f) => ({ ...f, avatar: result.assets[0].uri }));
                      }
                    }}
                  >
                    <Text style={styles.photoBtnText}>📁 Choose Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.photoBtn}
                    onPress={async () => {
                      const { status } = await ImagePicker.requestCameraPermissionsAsync();
                      if (status !== 'granted') {
                        Alert.alert('Permission needed', 'Please allow camera access in Settings.');
                        return;
                      }
                      const result = await ImagePicker.launchCameraAsync({
                        allowsEditing: true,
                        aspect: [1, 1],
                        quality: 0.7,
                      });
                      if (!result.canceled && result.assets[0]) {
                        setForm((f) => ({ ...f, avatar: result.assets[0].uri }));
                      }
                    }}
                  >
                    <Text style={styles.photoBtnText}>📸 Take Photo</Text>
                  </TouchableOpacity>
                  {form.avatar && (
                    <TouchableOpacity
                      style={[styles.photoBtn, { borderColor: '#E53E3E' }]}
                      onPress={() => setForm((f) => ({ ...f, avatar: '' }))}
                    >
                      <Text style={[styles.photoBtnText, { color: '#E53E3E' }]}>✕ Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              {/* Emoji Picker */}
              <Text style={[styles.fieldLabel, { marginTop: SPACING.sm }]}>Or Pick an Emoji</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiScroll} contentContainerStyle={styles.emojiScrollContent}>
                {AVATAR_EMOJIS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[styles.emojiOption, form.avatar === emoji && styles.emojiOptionSelected]}
                    onPress={() => setForm((f) => ({ ...f, avatar: f.avatar === emoji ? '' : emoji }))}
                  >
                    <Text style={styles.emojiOptionText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Name */}
              <Text style={styles.fieldLabel}>Child's Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Emma"
                placeholderTextColor={COLORS.textLight}
                value={form.name}
                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              />

              {/* DOB */}
              <Text style={styles.fieldLabel}>Date of Birth</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. March 5, 2018"
                placeholderTextColor={COLORS.textLight}
                value={form.dob}
                onChangeText={(v) => setForm((f) => ({ ...f, dob: v }))}
              />

              {/* Diagnosis */}
              <Text style={styles.fieldLabel}>Diagnosis</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Autism Spectrum Disorder"
                placeholderTextColor={COLORS.textLight}
                value={form.diagnosis}
                onChangeText={(v) => setForm((f) => ({ ...f, diagnosis: v }))}
              />

              {/* Diagnosis Level */}
              <Text style={styles.fieldLabel}>Support Level</Text>
              <View style={styles.levelRow}>
                {(['', '1', '2', '3'] as const).map((lvl) => (
                  <TouchableOpacity
                    key={lvl}
                    style={[styles.levelChip, form.diagnosisLevel === lvl && styles.levelChipActive]}
                    onPress={() => setForm((f) => ({ ...f, diagnosisLevel: lvl }))}
                  >
                    <Text style={[styles.levelChipText, form.diagnosisLevel === lvl && styles.levelChipTextActive]}>
                      {lvl === '' ? 'Not set' : `Level ${lvl}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* State */}
              <Text style={styles.fieldLabel}>State</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Ohio"
                placeholderTextColor={COLORS.textLight}
                value={form.state}
                onChangeText={(v) => setForm((f) => ({ ...f, state: v }))}
                autoCapitalize="words"
              />

              {/* City / County with autocomplete */}
              <CityCountyAutocomplete
                label="City / County"
                value={form.county}
                onChangeText={(v) => setForm((f) => ({ ...f, county: v }))}
                onSelect={(r) => setForm((f) => ({ ...f, county: r.county, state: f.state || r.state }))}
                placeholder="e.g. Franklin County or Columbus, OH"
                style={styles.input}
              />

              {/* Journey / Concerns */}
              <Text style={styles.fieldLabel}>What journey are you on? 🗺️</Text>
              <Text style={styles.fieldSub}>Select all that apply — personalises the dashboard for this child.</Text>
              {JOURNEY_OPTIONS.map((opt) => {
                const selected = form.concerns.includes(opt.id);
                return (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.journeyRow, selected && styles.journeyRowSelected]}
                    onPress={() => toggleConcern(opt.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.journeyIconWrap, selected && styles.journeyIconWrapSelected]}>
                      <Text style={styles.journeyIcon}>{opt.icon}</Text>
                    </View>
                    <View style={styles.journeyBody}>
                      <Text style={[styles.journeyLabel, selected && styles.journeyLabelSelected]}>{opt.label}</Text>
                      <Text style={styles.journeySub}>{opt.sub}</Text>
                    </View>
                    <View style={[styles.journeyCheck, selected && styles.journeyCheckSelected]}>
                      {selected && <Text style={styles.journeyCheckText}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Buttons */}
              <View style={styles.modalBtns}>
                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setShowModal(false)}
                  disabled={saving}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSave}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.modalSaveText}>
                      {editingId ? 'Save Changes' : 'Add Child'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
     </View>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { paddingVertical: SPACING.xs, paddingRight: SPACING.md },
  backText: { fontSize: FONT_SIZES.base, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },

  scrollContainer: { flex: 1 },
  scroll: { padding: SPACING.lg, paddingBottom: 60 },

  intro: {
    fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 20,
    marginBottom: SPACING.xl,
  },

  // ── Empty state ──
  emptyCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    padding: SPACING.xxl, alignItems: 'center', marginBottom: SPACING.xl,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  emptyEmoji: { fontSize: 40, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  emptySub: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, textAlign: 'center' },

  // ── Child card ──
  childCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
    marginBottom: SPACING.md, ...SHADOWS.sm, overflow: 'hidden',
  },
  childCardActive: { borderColor: COLORS.purple, borderWidth: 2 },
  childMain: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg },
  emojiScroll: { marginBottom: SPACING.md },
  emojiScrollContent: { gap: 8, paddingHorizontal: 2 },
  emojiOption: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.bg, borderWidth: 2, borderColor: COLORS.border,
  },
  emojiOptionSelected: { borderColor: COLORS.purple, backgroundColor: COLORS.lavender ?? '#EDE9FC' },
  emojiOptionText: { fontSize: 24 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.md },
  childInfo: { flex: 1 },
  childNameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 2 },
  childName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  activeBadge: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm, paddingVertical: 2,
  },
  activeBadgeText: { color: '#fff', fontSize: FONT_SIZES.xs, fontWeight: '700' },
  childMeta: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, marginTop: 2 },
  childMetaLight: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, marginTop: 2 },
  childActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border },
  editBtn: {
    flex: 1, paddingVertical: SPACING.md, alignItems: 'center',
    borderRightWidth: 1, borderRightColor: COLORS.border,
  },
  editBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  deleteBtn: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, alignItems: 'center' },
  deleteBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.errorText, fontWeight: '700' },

  // ── Add button ──
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg, marginBottom: SPACING.xl,
    borderWidth: 1, borderColor: '#C5B8F0', gap: SPACING.sm,
  },
  addBtnIcon: { fontSize: 20, color: COLORS.purple },
  addBtnText: { fontSize: FONT_SIZES.md, color: COLORS.purple, fontWeight: '700' },

  // ── Note ──
  noteBox: {
    backgroundColor: COLORS.infoBg, borderRadius: RADIUS.sm,
    padding: SPACING.md, borderWidth: 1, borderColor: '#A8CFFF',
  },
  noteText: { fontSize: FONT_SIZES.sm, color: COLORS.infoText, lineHeight: 19 },

  // ── Modal ──
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalScroll: { maxHeight: '92%' },
  modalScrollContent: { flexGrow: 1, justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg, padding: SPACING.xl, paddingBottom: 40,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text,
    marginBottom: SPACING.xl, textAlign: 'center',
  },
  fieldLabel: {
    fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text,
    marginBottom: SPACING.xs, marginTop: SPACING.md,
  },
  fieldSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginBottom: SPACING.sm },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.base, color: COLORS.text, backgroundColor: COLORS.white,
  },
  levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.xs },
  levelChip: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  levelChipActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  levelChipText: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, fontWeight: '600' },
  levelChipTextActive: { color: '#fff' },

  // ── Journey rows ──
  journeyRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1.5,
    borderColor: COLORS.border, backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.sm, marginBottom: 6,
  },
  journeyRowSelected: { borderColor: COLORS.purple, backgroundColor: '#F0EDFF' },
  journeyIconWrap: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  journeyIconWrapSelected: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  journeyIcon: { fontSize: 20 },
  journeyBody: { flex: 1 },
  journeyLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  journeyLabelSelected: { color: COLORS.purple },
  journeySub: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 1 },
  journeyCheck: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white,
  },
  journeyCheckSelected: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  journeyCheckText: { color: '#fff', fontSize: 13, fontWeight: '800' },

  // ── Photo picker ──
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.sm },
  photoPreview: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.bg, borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  photoPreviewImg: { width: 72, height: 72, borderRadius: 36 },
  photoButtons: { flex: 1, gap: 6 },
  photoBtn: {
    paddingVertical: 7, paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.purple,
    alignItems: 'center',
  },
  photoBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },

  modalBtns: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.xxl },
  modalCancel: {
    flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center',
  },
  modalCancelText: { fontSize: FONT_SIZES.md, color: COLORS.textMid, fontWeight: '600' },
  modalSave: {
    flex: 2, paddingVertical: SPACING.md, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.purple, alignItems: 'center',
  },
  modalSaveText: { fontSize: FONT_SIZES.md, color: '#fff', fontWeight: '700' },
});
