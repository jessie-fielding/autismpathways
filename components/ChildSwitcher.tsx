/**
 * ChildSwitcher.tsx
 * A compact header component that shows the active child's avatar and name,
 * and opens a bottom-sheet picker to switch between children or add a new one.
 */

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useActiveChild, addChild, updateChild, deleteChild, ChildProfile } from '../services/childManager';

const COLORS = {
  navy: '#1a1f5e', purple: '#7c6fd4', purpleDk: '#4a3f8f', purpleLt: '#f0ebff',
  bg: '#F5F4FB', card: '#FFFFFF', textMid: '#6b6490', textLight: '#a09cbf',
  border: '#d4d0ef', white: '#ffffff', teal: '#3BBFA3', red: '#E74C3C',
};
const SP = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 };

const LEVEL_LABELS: Record<string, string> = { '1': 'Level 1', '2': 'Level 2', '3': 'Level 3', '': '' };
const CHILD_COLORS = ['#7C5CBF', '#3BBFA3', '#E67E22', '#E74C3C', '#3498DB', '#9B59B6'];

interface Props {
  /** Called after switching children so parent can reload data */
  onSwitch?: (childId: string) => void;
}

export default function ChildSwitcher({ onSwitch }: Props) {
  const { child, children, switchChild, refreshChildren } = useActiveChild();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editChild, setEditChild] = useState<ChildProfile | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [level, setLevel] = useState<'1' | '2' | '3' | ''>('');

  const openAdd = () => {
    setName(''); setDob(''); setDiagnosis(''); setLevel('');
    setEditChild(null);
    setAddOpen(true);
    setPickerOpen(false);
  };

  const openEdit = (c: ChildProfile) => {
    setName(c.name); setDob(c.dob || ''); setDiagnosis(c.diagnosis || '');
    setLevel((c.diagnosisLevel as any) || '');
    setEditChild(c);
    setAddOpen(true);
    setPickerOpen(false);
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Name required', 'Please enter a name for this child.'); return; }
    if (editChild) {
      await updateChild(editChild.id, { name: name.trim(), dob, diagnosis, diagnosisLevel: level });
    } else {
      const newChild = await addChild({ name: name.trim(), dob, diagnosis, diagnosisLevel: level });
      await switchChild(newChild.id);
      onSwitch?.(newChild.id);
    }
    await refreshChildren();
    setAddOpen(false);
  };

  const handleDelete = (c: ChildProfile) => {
    Alert.alert(
      `Remove ${c.name}?`,
      'This will permanently delete all data for this child. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            await deleteChild(c.id);
            await refreshChildren();
            setPickerOpen(false);
          },
        },
      ]
    );
  };

  const handleSwitch = async (id: string) => {
    await switchChild(id);
    onSwitch?.(id);
    setPickerOpen(false);
  };

  if (!child && children.length === 0) {
    return (
      <TouchableOpacity style={styles.chip} onPress={openAdd}>
        <Text style={styles.chipText}>+ Add Child</Text>
      </TouchableOpacity>
    );
  }

  return (
    <>
      {/* CHIP */}
      <TouchableOpacity style={[styles.chip, { borderColor: child?.color || COLORS.purple }]} onPress={() => setPickerOpen(true)}>
        <View style={[styles.avatar, { backgroundColor: child?.color || COLORS.purple }]}>
          <Text style={styles.avatarText}>{child?.avatar || '??'}</Text>
        </View>
        <Text style={styles.chipName} numberOfLines={1}>{child?.name || 'Select Child'}</Text>
        {children.length > 1 && <Text style={styles.chevron}>▼</Text>}
      </TouchableOpacity>

      {/* PICKER MODAL */}
      <Modal visible={pickerOpen} transparent animationType="slide" onRequestClose={() => setPickerOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setPickerOpen(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Switch Child</Text>
          <ScrollView>
            {children.map((c) => (
              <View key={c.id} style={styles.childRow}>
                <TouchableOpacity style={styles.childRowMain} onPress={() => handleSwitch(c.id)}>
                  <View style={[styles.childAvatar, { backgroundColor: c.color || COLORS.purple }]}>
                    <Text style={styles.childAvatarText}>{c.avatar || c.name.slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{c.name}</Text>
                    {c.diagnosis && <Text style={styles.childSub}>{c.diagnosis}{c.diagnosisLevel ? ` · Level ${c.diagnosisLevel}` : ''}</Text>}
                  </View>
                  {c.id === child?.id && <Text style={styles.activeCheck}>✓</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openEdit(c)} style={styles.editBtn}>
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                {children.length > 1 && (
                  <TouchableOpacity onPress={() => handleDelete(c)} style={styles.deleteBtn}>
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Text style={styles.addBtnText}>+ Add Another Child</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ADD / EDIT MODAL */}
      <Modal visible={addOpen} transparent animationType="slide" onRequestClose={() => setAddOpen(false)}>
        <KeyboardAvoidingView style={styles.overlay2} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.formSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{editChild ? `Edit ${editChild.name}` : 'Add a Child'}</Text>

            <Text style={styles.label}>Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Child's first name" placeholderTextColor={COLORS.textLight} />

            <Text style={styles.label}>Date of Birth</Text>
            <TextInput style={styles.input} value={dob} onChangeText={setDob} placeholder="MM/DD/YYYY" placeholderTextColor={COLORS.textLight} keyboardType="numbers-and-punctuation" />

            <Text style={styles.label}>Primary Diagnosis</Text>
            <TextInput style={styles.input} value={diagnosis} onChangeText={setDiagnosis} placeholder="e.g. Autism Spectrum Disorder" placeholderTextColor={COLORS.textLight} />

            <Text style={styles.label}>Support Level (if known)</Text>
            <View style={styles.levelRow}>
              {(['', '1', '2', '3'] as const).map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.levelChip, level === l && styles.levelChipActive]}
                  onPress={() => setLevel(l)}
                >
                  <Text style={[styles.levelChipText, level === l && styles.levelChipTextActive]}>
                    {l === '' ? 'Unknown' : `Level ${l}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.formBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>{editChild ? 'Save Changes' : 'Add Child'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: SP.xs,
    backgroundColor: COLORS.purpleLt, borderRadius: 20,
    paddingHorizontal: SP.md, paddingVertical: SP.xs,
    borderWidth: 1.5, borderColor: COLORS.purple, maxWidth: 160,
  },
  avatar: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 10, fontWeight: '700', color: COLORS.white },
  chipName: { fontSize: 13, fontWeight: '700', color: COLORS.purpleDk, flex: 1 },
  chevron: { fontSize: 9, color: COLORS.textMid },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  overlay2: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: SP.xl, paddingBottom: 40, maxHeight: '70%',
  },
  formSheet: {
    backgroundColor: COLORS.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: SP.xl, paddingBottom: 40,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: COLORS.border,
    alignSelf: 'center', marginBottom: SP.lg,
  },
  sheetTitle: { fontSize: 17, fontWeight: '800', color: COLORS.navy, marginBottom: SP.lg },
  childRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SP.sm, gap: SP.sm },
  childRowMain: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: SP.md,
    backgroundColor: COLORS.bg, borderRadius: 12, padding: SP.md,
  },
  childAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  childAvatarText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  childInfo: { flex: 1 },
  childName: { fontSize: 14, fontWeight: '700', color: COLORS.navy },
  childSub: { fontSize: 11, color: COLORS.textMid },
  activeCheck: { fontSize: 16, color: COLORS.teal, fontWeight: '700' },
  editBtn: {
    backgroundColor: COLORS.purpleLt, borderRadius: 8, paddingHorizontal: SP.md, paddingVertical: SP.sm,
  },
  editBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.purpleDk },
  deleteBtn: {
    backgroundColor: '#fef2f2', borderRadius: 8, paddingHorizontal: SP.sm, paddingVertical: SP.sm,
  },
  deleteBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.red },
  addBtn: {
    backgroundColor: COLORS.purpleLt, borderRadius: 12, padding: SP.lg,
    alignItems: 'center', marginTop: SP.md,
  },
  addBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.purpleDk },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.navy, marginBottom: SP.xs, marginTop: SP.md },
  input: {
    backgroundColor: COLORS.bg, borderRadius: 10, padding: SP.md,
    fontSize: 14, color: COLORS.navy, borderWidth: 1, borderColor: COLORS.border,
  },
  levelRow: { flexDirection: 'row', gap: SP.sm, flexWrap: 'wrap', marginTop: SP.xs },
  levelChip: {
    paddingHorizontal: SP.lg, paddingVertical: SP.sm,
    borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.bg,
  },
  levelChipActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  levelChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textMid },
  levelChipTextActive: { color: COLORS.white },
  formBtns: { flexDirection: 'row', gap: SP.md, marginTop: SP.xl },
  cancelBtn: {
    flex: 1, padding: SP.lg, borderRadius: 12,
    borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.textMid },
  saveBtn: { flex: 2, padding: SP.lg, borderRadius: 12, backgroundColor: COLORS.purple, alignItems: 'center' },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});
