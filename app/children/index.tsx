import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, Alert, ActivityIndicator, KeyboardAvoidingView, Platform} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  loadChildren, addChild, updateChild, deleteChild,
  setActiveChildId, getActiveChildId, type ChildProfile,
} from '../../services/childManager';
import { emitChildChanged } from '../../services/childEvents';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';

// ── Diagnosis level labels ────────────────────────────────────────────────────
const LEVEL_LABELS: Record<string, string> = {
  '1': 'Level 1 — Requiring Support',
  '2': 'Level 2 — Requiring Substantial Support',
  '3': 'Level 3 — Requiring Very Substantial Support',
  '':  'Level not set',
};

const LEVEL_OPTIONS = [
  { value: '1', label: 'Level 1 — Requiring Support' },
  { value: '2', label: 'Level 2 — Requiring Substantial Support' },
  { value: '3', label: 'Level 3 — Requiring Very Substantial Support' },
];

// ── Blank form state ──────────────────────────────────────────────────────────
const BLANK: Omit<ChildProfile, 'id' | 'createdAt' | 'color' | 'avatar'> = {
  name: '',
  dob: '',
  diagnosis: '',
  diagnosisLevel: '',
};

// ─────────────────────────────────────────────────────────────────────────────

export default function ManageChildrenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // null = adding new
  const [form, setForm] = useState({ ...BLANK });
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
    });
    setShowModal(true);
  };

  // ── Save (add or update) ────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Name required', "Please enter the child's name.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateChild(editingId, {
          name: form.name.trim(),
          dob: form.dob.trim(),
          diagnosis: form.diagnosis.trim(),
          diagnosisLevel: form.diagnosisLevel as ChildProfile['diagnosisLevel'],
        });
      } else {
        const newChild = await addChild({
          name: form.name.trim(),
          dob: form.dob.trim(),
          diagnosis: form.diagnosis.trim(),
          diagnosisLevel: form.diagnosisLevel as ChildProfile['diagnosisLevel'],
        });
        // Auto-switch to the new child if this is the first one
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
                      <Text style={styles.avatarText}>{child.avatar || child.name.slice(0, 2).toUpperCase()}</Text>
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
                          {child.diagnosisLevel ? ` · ${child.diagnosisLevel}` : ''}
                        </Text>
                      ) : (
                        <Text style={styles.childMetaLight}>No diagnosis recorded</Text>
                      )}
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
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingId ? 'Edit Child' : 'Add a Child'}
            </Text>

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
                  style={[
                    styles.levelChip,
                    form.diagnosisLevel === lvl && styles.levelChipActive,
                  ]}
                  onPress={() => setForm((f) => ({ ...f, diagnosisLevel: lvl }))}
                >
                  <Text style={[
                    styles.levelChipText,
                    form.diagnosisLevel === lvl && styles.levelChipTextActive,
                  ]}>
                    {lvl === '' ? 'Not set' : `Level ${lvl}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

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
  childCardActive: {
    borderColor: COLORS.purple, borderWidth: 2,
  },
  childMain: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.lg,
  },
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
  childActions: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  editBtn: {
    flex: 1, paddingVertical: SPACING.md, alignItems: 'center',
    borderRightWidth: 1, borderRightColor: COLORS.border,
  },
  editBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  deleteBtn: {
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl, alignItems: 'center',
  },
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
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg, padding: SPACING.xl,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text,
    marginBottom: SPACING.xl, textAlign: 'center',
  },
  fieldLabel: {
    fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text,
    marginBottom: SPACING.xs, marginTop: SPACING.md,
  },
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
