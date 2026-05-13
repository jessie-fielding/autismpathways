import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Linking, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';

const VAULT_KEY = 'ap_document_vault';

type DocStatus = 'need' | 'have' | 'uploaded';

interface VaultDoc {
  id: string;
  status: DocStatus;
  fileName?: string;
  fileUri?: string;
  uploadedAt?: string;
}

interface DocTemplate {
  id: string;
  icon: string;
  title: string;
  description: string;
  why: string;
  category: string;
  accentColor: string;
  uploadable: boolean;
}

const DOCUMENTS: DocTemplate[] = [
  // Diagnosis
  {
    id: 'diagnosis_report',
    icon: '🧠',
    title: 'Diagnosis Report',
    description: 'Official autism diagnosis from a licensed evaluator',
    why: 'Required for Medicaid, IEP, and most waivers',
    category: 'DIAGNOSIS',
    accentColor: COLORS.lavenderAccent,
    uploadable: true,
  },
  {
    id: 'psych_eval',
    icon: '📋',
    title: 'Psychological Evaluation',
    description: 'Full psych eval including cognitive and adaptive scores',
    why: 'Supports LTD and waiver applications',
    category: 'DIAGNOSIS',
    accentColor: COLORS.lavenderAccent,
    uploadable: true,
  },
  {
    id: 'speech_eval',
    icon: '🗣️',
    title: 'Speech/Language Evaluation',
    description: 'SLP evaluation report with scores',
    why: 'Required for many school and therapy authorizations',
    category: 'DIAGNOSIS',
    accentColor: COLORS.lavenderAccent,
    uploadable: true,
  },
  // School
  {
    id: 'iep',
    icon: '🏫',
    title: 'Current IEP',
    description: 'Most recent Individualized Education Program',
    why: 'Needed for Medicaid PMIP and waiver applications',
    category: 'SCHOOL',
    accentColor: COLORS.blueAccent,
    uploadable: true,
  },
  {
    id: 'school_records',
    icon: '📚',
    title: 'School Records / Report Cards',
    description: 'Recent academic and behavioral progress reports',
    why: 'Supports LTD and additional disability claims',
    category: 'SCHOOL',
    accentColor: COLORS.blueAccent,
    uploadable: true,
  },
  // Medical
  {
    id: 'medicaid_card',
    icon: '💳',
    title: 'Medicaid Card',
    description: 'Current Medicaid insurance card',
    why: 'Needed at every medical appointment',
    category: 'MEDICAL',
    accentColor: COLORS.mintAccent,
    uploadable: true,
  },
  {
    id: 'medical_records',
    icon: '🩺',
    title: 'Medical Records',
    description: 'Pediatrician and specialist visit notes',
    why: 'Supports all benefit applications and appeals',
    category: 'MEDICAL',
    accentColor: COLORS.mintAccent,
    uploadable: true,
  },
  {
    id: 'therapy_records',
    icon: '💆',
    title: 'Therapy Records',
    description: 'ABA, OT, PT, speech therapy progress notes',
    why: 'Documents ongoing need for services',
    category: 'MEDICAL',
    accentColor: COLORS.mintAccent,
    uploadable: true,
  },
  // Benefits
  {
    id: 'waiver_app',
    icon: '🛡️',
    title: 'Waiver Application / Confirmation',
    description: 'Waiver application receipt or enrollment letter',
    why: 'Proof of waitlist position or active enrollment',
    category: 'BENEFITS',
    accentColor: COLORS.yellowAccent,
    uploadable: true,
  },
  {
    id: 'medicaid_approval',
    icon: '✅',
    title: 'Medicaid Approval Letter',
    description: 'Letter confirming Medicaid eligibility',
    why: 'Required for appeals and re-enrollment',
    category: 'BENEFITS',
    accentColor: COLORS.yellowAccent,
    uploadable: true,
  },
  {
    id: 'denial_letters',
    icon: '⚠️',
    title: 'Denial Letters',
    description: 'Any denial letters from Medicaid, school, or insurance',
    why: 'Required to start an appeal — keep every one',
    category: 'BENEFITS',
    accentColor: COLORS.peachAccent,
    uploadable: true,
  },
  // Legal / ID
  {
    id: 'birth_cert',
    icon: '📄',
    title: 'Birth Certificate',
    description: "Child's official birth certificate",
    why: 'Required for Medicaid and most benefit applications',
    category: 'LEGAL / ID',
    accentColor: COLORS.peachAccent,
    uploadable: true,
  },
];

const CATEGORIES = ['ALL', 'DIAGNOSIS', 'SCHOOL', 'MEDICAL', 'BENEFITS', 'LEGAL / ID'];

const STATUS_CONFIG: Record<DocStatus, { label: string; color: string; bg: string; icon: string }> = {
  need: { label: 'Need It', color: '#8B6914', bg: '#FFF3CD', icon: '📌' },
  have: { label: 'Have It', color: COLORS.successText, bg: COLORS.successBg, icon: '✅' },
  uploaded: { label: 'Uploaded', color: COLORS.purpleDark, bg: COLORS.lavender, icon: '☁️' },
};

export default function DocumentVaultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();

  const [vault, setVault] = useState<Record<string, VaultDoc>>({});
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(VAULT_KEY).then((raw) => {
      if (raw) setVault(JSON.parse(raw));
    });
  }, []);

  const saveVault = useCallback(async (updated: Record<string, VaultDoc>) => {
    setVault(updated);
    await AsyncStorage.setItem(VAULT_KEY, JSON.stringify(updated));
  }, []);

  const cycleStatus = (doc: DocTemplate) => {
    const current = vault[doc.id]?.status ?? 'need';
    const next: DocStatus = current === 'need' ? 'have' : current === 'have' ? 'need' : 'need';
    const updated = { ...vault, [doc.id]: { ...vault[doc.id], id: doc.id, status: next } };
    saveVault(updated);
  };

  const handleUpload = async (doc: DocTemplate) => {
    if (!isPremium) {
      Alert.alert(
        '⭐ Premium Feature',
        'Uploading and storing documents is a premium feature. Upgrade to keep all your important files in one secure place.',
        [
          { text: 'Maybe Later', style: 'cancel' },
          { text: 'Upgrade', onPress: () => router.push('/paywall') },
        ]
      );
      return;
    }

    try {
      setUploading(doc.id);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const updated = {
          ...vault,
          [doc.id]: {
            id: doc.id,
            status: 'uploaded' as DocStatus,
            fileName: asset.name,
            fileUri: asset.uri,
            uploadedAt: new Date().toLocaleDateString(),
          },
        };
        saveVault(updated);
        Alert.alert('✅ Saved', `${asset.name} has been saved to your vault.`);
      }
    } catch {
      Alert.alert('Error', 'Could not pick a file. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const handleRemove = (doc: DocTemplate) => {
    Alert.alert('Remove File', `Remove ${doc.title} from your vault?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          const updated = { ...vault, [doc.id]: { id: doc.id, status: 'need' } };
          saveVault(updated);
        },
      },
    ]);
  };

  const filtered = activeCategory === 'ALL'
    ? DOCUMENTS
    : DOCUMENTS.filter((d) => d.category === activeCategory);

  // Stats
  const total = DOCUMENTS.length;
  const haveCount = DOCUMENTS.filter((d) => {
    const s = vault[d.id]?.status;
    return s === 'have' || s === 'uploaded';
  }).length;
  const uploadedCount = DOCUMENTS.filter((d) => vault[d.id]?.status === 'uploaded').length;

  // Group by category for display
  const grouped: Record<string, DocTemplate[]> = {};
  filtered.forEach((doc) => {
    if (!grouped[doc.category]) grouped[doc.category] = [];
    grouped[doc.category].push(doc);
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Vault</Text>
        <View style={styles.headerBadge}>
          {isPremium
            ? <Text style={styles.headerBadgeText}>⭐ Premium</Text>
            : <Text style={styles.headerBadgeText}>{haveCount}/{total} Ready</Text>
          }
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Progress bar */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressTitle}>📁 Your Document Readiness</Text>
            <Text style={styles.progressPct}>{Math.round((haveCount / total) * 100)}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${(haveCount / total) * 100}%` as any }]} />
          </View>
          <View style={styles.progressStats}>
            <Text style={styles.progressStat}>✅ {haveCount} ready</Text>
            <Text style={styles.progressStat}>☁️ {uploadedCount} uploaded</Text>
            <Text style={styles.progressStat}>📌 {total - haveCount} still needed</Text>
          </View>
        </View>

        {/* Info note */}
        <View style={styles.infoNote}>
          <Text style={styles.infoNoteText}>
            💡 Tap a document to toggle its status. {isPremium ? 'Tap ☁️ Upload to store a file.' : 'Upgrade to Premium to upload files.'}
          </Text>
        </View>

        {/* Category filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.filterChipText, activeCategory === cat && styles.filterChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Document groups */}
        {Object.entries(grouped).map(([category, docs]) => (
          <View key={category} style={styles.group}>
            <Text style={styles.groupLabel}>{category}</Text>
            {docs.map((doc) => {
              const vaultEntry = vault[doc.id];
              const status: DocStatus = vaultEntry?.status ?? 'need';
              const cfg = STATUS_CONFIG[status];
              const isUploading = uploading === doc.id;

              return (
                <View key={doc.id} style={[styles.docCard, { borderTopColor: doc.accentColor }]}>
                  <View style={styles.docRow}>
                    <Text style={styles.docIcon}>{doc.icon}</Text>
                    <View style={styles.docInfo}>
                      <Text style={styles.docTitle}>{doc.title}</Text>
                      <Text style={styles.docDesc}>{doc.description}</Text>
                      <View style={styles.whyRow}>
                        <Text style={styles.whyText}>💬 {doc.why}</Text>
                      </View>
                      {status === 'uploaded' && vaultEntry?.fileName && (
                        <View style={styles.fileRow}>
                          <Text style={styles.fileName}>📎 {vaultEntry.fileName}</Text>
                          {vaultEntry.uploadedAt && (
                            <Text style={styles.fileDate}>Saved {vaultEntry.uploadedAt}</Text>
                          )}
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Action row */}
                  <View style={styles.actionRow}>
                    {/* Status toggle */}
                    <TouchableOpacity
                      style={[styles.statusChip, { backgroundColor: cfg.bg }]}
                      onPress={() => cycleStatus(doc)}
                    >
                      <Text style={[styles.statusChipText, { color: cfg.color }]}>
                        {cfg.icon} {cfg.label}
                      </Text>
                    </TouchableOpacity>

                    {/* Upload / Remove button */}
                    {status === 'uploaded' ? (
                      <TouchableOpacity
                        style={styles.removeBtn}
                        onPress={() => handleRemove(doc)}
                      >
                        <Text style={styles.removeBtnText}>Remove</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.uploadBtn, !isPremium && styles.uploadBtnLocked]}
                        onPress={() => handleUpload(doc)}
                        disabled={isUploading}
                      >
                        {isUploading
                          ? <ActivityIndicator size="small" color={COLORS.purple} />
                          : <Text style={styles.uploadBtnText}>{isPremium ? '☁️ Upload' : '🔒 Upload'}</Text>
                        }
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        {/* Premium upsell if not premium */}
        {!isPremium && (
          <TouchableOpacity style={styles.upsellCard} onPress={() => router.push('/paywall')}>
            <Text style={styles.upsellIcon}>⭐</Text>
            <Text style={styles.upsellTitle}>Unlock Document Storage</Text>
            <Text style={styles.upsellBody}>
              Premium members can upload PDFs and photos directly to their vault — everything in one place, always ready for appointments and appeals.
            </Text>
            <View style={styles.upsellBtn}>
              <Text style={styles.upsellBtnText}>Upgrade to Premium →</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: SPACING.xs },
  backText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.purple },
  headerTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  headerBadge: {
    backgroundColor: COLORS.yellow,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
  },
  headerBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#8B6914' },

  scrollContainer: { flex: 1 },
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },

  progressCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  progressPct: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.purple },
  progressBarBg: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.pill,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.pill,
  },
  progressStats: { flexDirection: 'row', gap: SPACING.lg },
  progressStat: { fontSize: FONT_SIZES.xs, color: COLORS.textMid },

  infoNote: {
    backgroundColor: COLORS.infoBg,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.infoBorder,
  },
  infoNoteText: { fontSize: FONT_SIZES.xs, color: COLORS.infoText, lineHeight: 18 },

  filterRow: { paddingBottom: SPACING.md, gap: SPACING.sm },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  filterChipText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMid },
  filterChipTextActive: { color: COLORS.white },

  group: { marginBottom: SPACING.xxl },
  groupLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },

  docCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 3,
    ...SHADOWS.sm,
  },
  docRow: { flexDirection: 'row', marginBottom: SPACING.md },
  docIcon: { fontSize: 28, marginRight: SPACING.md, marginTop: 2 },
  docInfo: { flex: 1 },
  docTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  docDesc: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginBottom: SPACING.xs },
  whyRow: { marginTop: 2 },
  whyText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontStyle: 'italic' },
  fileRow: { marginTop: SPACING.xs },
  fileName: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' },
  fileDate: { fontSize: 11, color: COLORS.textLight },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  statusChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
  },
  statusChipText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  uploadBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    backgroundColor: COLORS.lavender,
    borderWidth: 1,
    borderColor: COLORS.lavenderAccent,
  },
  uploadBtnLocked: { opacity: 0.7 },
  uploadBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purpleDark },
  removeBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
  },
  removeBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.errorText },

  upsellCard: {
    backgroundColor: COLORS.lavender,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.lavenderAccent,
  },
  upsellIcon: { fontSize: 36, marginBottom: SPACING.sm },
  upsellTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.purpleDark,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  upsellBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  upsellBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
  },
  upsellBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.sm },
});
