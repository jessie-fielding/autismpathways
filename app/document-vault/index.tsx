import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';

const API_BASE   = 'https://info.autismpathways.app';
const TOKEN_KEY  = 'authToken';

// ─── Types ────────────────────────────────────────────────────────────────────
type DocStatus = 'need' | 'have' | 'uploaded';

interface VaultDoc {
  id: string;
  status: DocStatus;
  fileName?: string;
  uploadedAt?: string;
  // S3-backed fields (set after successful cloud upload)
  s3Key?: string;
  cloudUploaded?: boolean;
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

// ─── Document templates ───────────────────────────────────────────────────────
const DOCUMENTS: DocTemplate[] = [
  // Diagnosis
  { id: 'diagnosis_report', icon: '🧠', title: 'Diagnosis Report', description: 'Official autism diagnosis from a licensed evaluator', why: 'Required for Medicaid, IEP, and most waivers', category: 'DIAGNOSIS', accentColor: COLORS.lavenderAccent, uploadable: true },
  { id: 'psych_eval', icon: '📋', title: 'Psychological Evaluation', description: 'Full psych eval including cognitive and adaptive scores', why: 'Supports LTD and waiver applications', category: 'DIAGNOSIS', accentColor: COLORS.lavenderAccent, uploadable: true },
  { id: 'speech_eval', icon: '🗣️', title: 'Speech/Language Evaluation', description: 'SLP evaluation report with scores', why: 'Required for many school and therapy authorizations', category: 'DIAGNOSIS', accentColor: COLORS.lavenderAccent, uploadable: true },
  // School
  { id: 'iep', icon: '🏫', title: 'Current IEP', description: 'Most recent Individualized Education Program', why: 'Needed for Medicaid PMIP and waiver applications', category: 'SCHOOL', accentColor: COLORS.blueAccent, uploadable: true },
  { id: 'school_records', icon: '📚', title: 'School Records / Report Cards', description: 'Recent academic and behavioral progress reports', why: 'Supports LTD and additional disability claims', category: 'SCHOOL', accentColor: COLORS.blueAccent, uploadable: true },
  // Medical
  { id: 'medicaid_card', icon: '💳', title: 'Medicaid Card', description: 'Current Medicaid insurance card', why: 'Needed at every medical appointment', category: 'MEDICAL', accentColor: COLORS.mintAccent, uploadable: true },
  { id: 'prior_auth', icon: '📝', title: 'Prior Authorizations', description: 'Active PA letters for therapies and services', why: 'Prevents service interruptions', category: 'MEDICAL', accentColor: COLORS.mintAccent, uploadable: true },
  { id: 'medical_records', icon: '🏥', title: 'Medical Records', description: 'Relevant physician notes and visit summaries', why: 'Supports appeals and waiver applications', category: 'MEDICAL', accentColor: COLORS.mintAccent, uploadable: true },
  // Legal / Financial
  { id: 'birth_cert', icon: '📜', title: 'Birth Certificate', description: 'Official birth certificate', why: 'Required for SSI and most benefit applications', category: 'LEGAL', accentColor: COLORS.yellowAccent ?? COLORS.yellow, uploadable: true },
  { id: 'ssi_award', icon: '💰', title: 'SSI Award Letter', description: 'Current SSI determination letter', why: 'Proves disability status for many programs', category: 'LEGAL', accentColor: COLORS.yellowAccent ?? COLORS.yellow, uploadable: true },
  { id: 'insurance_card', icon: '🪪', title: 'Insurance Card', description: 'Private or secondary insurance card', why: 'Needed for coordination of benefits', category: 'LEGAL', accentColor: COLORS.yellowAccent ?? COLORS.yellow, uploadable: true },
];

const CATEGORIES = ['ALL', 'DIAGNOSIS', 'SCHOOL', 'MEDICAL', 'LEGAL'];

const STATUS_CONFIG: Record<DocStatus, { icon: string; label: string; bg: string; color: string }> = {
  need:     { icon: '📌', label: 'Still Needed',  bg: COLORS.errorBg,   color: COLORS.errorText },
  have:     { icon: '✅', label: 'I Have This',   bg: COLORS.successBg ?? '#E8F5E9', color: COLORS.successText ?? '#2E7D32' },
  uploaded: { icon: '☁️', label: 'Uploaded',      bg: COLORS.lavender,  color: COLORS.purpleDark },
};

// ─── API helpers ──────────────────────────────────────────────────────────────
async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

async function apiPost(path: string, body: object): Promise<Response> {
  const token = await getToken();
  return fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

async function apiGet(path: string): Promise<Response> {
  const token = await getToken();
  return fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function DocumentVaultScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const { isPremium } = useIsPremium();

  const [vault,           setVault]           = useState<Record<string, VaultDoc>>({});
  const [activeCategory,  setActiveCategory]  = useState('ALL');
  const [uploading,       setUploading]       = useState<string | null>(null);
  const [downloading,     setDownloading]     = useState<string | null>(null);
  const [loadingVault,    setLoadingVault]    = useState(true);

  // ── Load vault from server (if logged in) or AsyncStorage ─────────────────
  useEffect(() => {
    (async () => {
      setLoadingVault(true);
      try {
        const token = await getToken();
        if (token) {
          const res = await apiGet('/api/documents');
          if (res.ok) {
            const data = await res.json();
            // Merge server document list with local status flags
            const localRaw = await AsyncStorage.getItem('ap_document_vault');
            const local: Record<string, VaultDoc> = localRaw ? JSON.parse(localRaw) : {};
            const merged: Record<string, VaultDoc> = { ...local };
            (data.documents || []).forEach((doc: VaultDoc) => {
              merged[doc.id] = {
                ...local[doc.id],
                ...doc,
                status: 'uploaded',
                cloudUploaded: true,
              };
            });
            setVault(merged);
            await AsyncStorage.setItem('ap_document_vault', JSON.stringify(merged));
            return;
          }
        }
        // Fallback: local only
        const raw = await AsyncStorage.getItem('ap_document_vault');
        if (raw) setVault(JSON.parse(raw));
      } catch {
        const raw = await AsyncStorage.getItem('ap_document_vault');
        if (raw) setVault(JSON.parse(raw));
      } finally {
        setLoadingVault(false);
      }
    })();
  }, []);

  const saveVault = useCallback(async (updated: Record<string, VaultDoc>) => {
    setVault(updated);
    await AsyncStorage.setItem('ap_document_vault', JSON.stringify(updated));
  }, []);

  const cycleStatus = (doc: DocTemplate) => {
    const current = vault[doc.id]?.status ?? 'need';
    if (current === 'uploaded') return; // don't cycle away from uploaded
    const next: DocStatus = current === 'need' ? 'have' : 'need';
    saveVault({ ...vault, [doc.id]: { ...vault[doc.id], id: doc.id, status: next } });
  };

  // ── Upload to S3 via pre-signed URL ────────────────────────────────────────
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

    const token = await getToken();
    if (!token) {
      Alert.alert('Sign In Required', 'Please sign in to upload documents to your secure vault.');
      return;
    }

    try {
      setUploading(doc.id);

      // 1. Pick a file
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*', 'application/msword',
               'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        setUploading(null);
        return;
      }

      const asset = result.assets[0];
      const mimeType = asset.mimeType || 'application/octet-stream';
      const fileSize = asset.size || 0;

      // 2. Validate size (16 MB limit)
      if (fileSize > 16 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please choose a file under 16 MB.');
        setUploading(null);
        return;
      }

      // 3. Request pre-signed upload URL from Lambda
      const urlRes = await apiPost('/api/documents/upload-url', {
        docId:    doc.id,
        fileName: asset.name,
        mimeType,
        fileSize,
      });

      if (!urlRes.ok) {
        const err = await urlRes.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${urlRes.status}`);
      }

      const { uploadUrl, s3Key } = await urlRes.json();

      // 4. Upload file bytes directly to S3 using the pre-signed PUT URL
      const fileRes = await fetch(asset.uri);
      const blob    = await fileRes.blob();

      const s3Res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': mimeType },
        body: blob,
      });

      if (!s3Res.ok) {
        throw new Error(`S3 upload failed: ${s3Res.status}`);
      }

      // 5. Update local vault state
      const updated: Record<string, VaultDoc> = {
        ...vault,
        [doc.id]: {
          id: doc.id,
          status: 'uploaded',
          fileName: asset.name,
          uploadedAt: new Date().toLocaleDateString(),
          s3Key,
          cloudUploaded: true,
        },
      };
      await saveVault(updated);
      Alert.alert('✅ Uploaded', `${asset.name} has been securely uploaded to your vault.`);

    } catch (e: any) {
      console.error('Upload error:', e);
      Alert.alert('Upload Failed', e?.message || 'Could not upload the file. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  // ── Download / view from S3 via pre-signed GET URL ─────────────────────────
  const handleDownload = async (doc: DocTemplate) => {
    const vaultEntry = vault[doc.id];
    if (!vaultEntry?.cloudUploaded) {
      Alert.alert('Not Available', 'This document was saved locally on a previous device. Please re-upload it.');
      return;
    }

    const token = await getToken();
    if (!token) {
      Alert.alert('Sign In Required', 'Please sign in to access your documents.');
      return;
    }

    try {
      setDownloading(doc.id);

      const res = await apiPost('/api/documents/download-url', { docId: doc.id });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      const { downloadUrl } = await res.json();
      await Linking.openURL(downloadUrl);

    } catch (e: any) {
      console.error('Download error:', e);
      Alert.alert('Download Failed', e?.message || 'Could not retrieve the file. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  // ── Delete from S3 + local ─────────────────────────────────────────────────
  const handleRemove = (doc: DocTemplate) => {
    const vaultEntry = vault[doc.id];
    Alert.alert(
      'Remove Document',
      `Remove ${doc.title} from your vault?${vaultEntry?.cloudUploaded ? '\n\nThis will permanently delete the file from secure storage.' : ''}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              if (vaultEntry?.cloudUploaded) {
                const token = await getToken();
                if (token) {
                  await apiPost('/api/documents/delete', { docId: doc.id });
                }
              }
            } catch (e) {
              console.error('Delete error:', e);
            }
            const updated = { ...vault, [doc.id]: { id: doc.id, status: 'need' as DocStatus } };
            await saveVault(updated);
          },
        },
      ]
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const filtered = activeCategory === 'ALL'
    ? DOCUMENTS
    : DOCUMENTS.filter((d) => d.category === activeCategory);

  const total         = DOCUMENTS.length;
  const haveCount     = DOCUMENTS.filter((d) => { const s = vault[d.id]?.status; return s === 'have' || s === 'uploaded'; }).length;
  const uploadedCount = DOCUMENTS.filter((d) => vault[d.id]?.status === 'uploaded').length;

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

      {loadingVault ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.purple} />
          <Text style={styles.loadingText}>Loading your vault…</Text>
        </View>
      ) : (
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
              <Text style={styles.progressStat}>☁️ {uploadedCount} in cloud</Text>
              <Text style={styles.progressStat}>📌 {total - haveCount} still needed</Text>
            </View>
          </View>

          {/* HIPAA badge */}
          <View style={styles.hipaaNote}>
            <Text style={styles.hipaaText}>🔒 HIPAA-Compliant Storage — Files are encrypted at rest and in transit using AWS S3 with server-side encryption (AES-256).</Text>
          </View>

          {/* Info note */}
          <View style={styles.infoNote}>
            <Text style={styles.infoNoteText}>
              💡 Tap a document to toggle its status. {isPremium ? 'Tap ☁️ Upload to store a file securely.' : 'Upgrade to Premium to upload files.'}
            </Text>
          </View>

          {/* Category filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.filterChipText, activeCategory === cat && styles.filterChipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Document groups */}
          {Object.entries(grouped).map(([category, docs]) => (
            <View key={category} style={styles.group}>
              <Text style={styles.groupLabel}>{category}</Text>
              {docs.map((doc) => {
                const vaultEntry  = vault[doc.id];
                const status: DocStatus = vaultEntry?.status ?? 'need';
                const cfg         = STATUS_CONFIG[status];
                const isUploading = uploading === doc.id;
                const isDownloading = downloading === doc.id;

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
                            <Text style={styles.fileName}>
                              {vaultEntry.cloudUploaded ? '☁️' : '📎'} {vaultEntry.fileName}
                            </Text>
                            {vaultEntry.uploadedAt && (
                              <Text style={styles.fileDate}>
                                {vaultEntry.cloudUploaded ? 'Securely stored' : 'Saved'} {vaultEntry.uploadedAt}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    </View>

                    {/* Action row */}
                    <View style={styles.actionRow}>
                      {/* Status toggle (disabled when uploaded) */}
                      <TouchableOpacity
                        style={[styles.statusChip, { backgroundColor: cfg.bg }]}
                        onPress={() => cycleStatus(doc)}
                        disabled={status === 'uploaded'}
                      >
                        <Text style={[styles.statusChipText, { color: cfg.color }]}>
                          {cfg.icon} {cfg.label}
                        </Text>
                      </TouchableOpacity>

                      {/* Right action: View / Upload / Remove */}
                      {status === 'uploaded' ? (
                        <View style={styles.uploadedActions}>
                          {vaultEntry?.cloudUploaded && (
                            <TouchableOpacity
                              style={styles.viewBtn}
                              onPress={() => handleDownload(doc)}
                              disabled={isDownloading}
                            >
                              {isDownloading
                                ? <ActivityIndicator size="small" color={COLORS.purple} />
                                : <Text style={styles.viewBtnText}>👁 View</Text>
                              }
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(doc)}>
                            <Text style={styles.removeBtnText}>Remove</Text>
                          </TouchableOpacity>
                        </View>
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

          {/* Premium upsell */}
          {!isPremium && (
            <TouchableOpacity style={styles.upsellCard} onPress={() => router.push('/paywall')}>
              <Text style={styles.upsellIcon}>⭐</Text>
              <Text style={styles.upsellTitle}>Unlock Secure Document Storage</Text>
              <Text style={styles.upsellBody}>
                Premium members can upload PDFs and photos directly to HIPAA-compliant cloud storage — encrypted, accessible anywhere, always ready for appointments and appeals.
              </Text>
              <View style={styles.upsellBtn}>
                <Text style={styles.upsellBtnText}>Upgrade to Premium →</Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  loadingText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid },

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
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  progressTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text },
  progressPct: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.purple },
  progressBarBg: { height: 8, backgroundColor: COLORS.border, borderRadius: RADIUS.pill, overflow: 'hidden', marginBottom: SPACING.md },
  progressBarFill: { height: '100%', backgroundColor: COLORS.purple, borderRadius: RADIUS.pill },
  progressStats: { flexDirection: 'row', gap: SPACING.lg },
  progressStat: { fontSize: FONT_SIZES.xs, color: COLORS.textMid },

  hipaaNote: {
    backgroundColor: '#E8F5E9',
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  hipaaText: { fontSize: FONT_SIZES.xs, color: '#2E7D32', lineHeight: 18 },

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
  filterChip: { paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.pill, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  filterChipText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textMid },
  filterChipTextActive: { color: COLORS.white },

  group: { marginBottom: SPACING.xxl },
  groupLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textLight, letterSpacing: 1, marginBottom: SPACING.md },

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

  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm },
  statusChip: { flex: 1, paddingVertical: 7, borderRadius: RADIUS.pill, alignItems: 'center' },
  statusChipText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },

  uploadedActions: { flex: 1, flexDirection: 'row', gap: SPACING.xs },
  viewBtn: { flex: 1, paddingVertical: 7, borderRadius: RADIUS.pill, alignItems: 'center', backgroundColor: COLORS.lavender, borderWidth: 1, borderColor: COLORS.lavenderAccent },
  viewBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purpleDark },

  uploadBtn: { flex: 1, paddingVertical: 7, borderRadius: RADIUS.pill, alignItems: 'center', backgroundColor: COLORS.lavender, borderWidth: 1, borderColor: COLORS.lavenderAccent },
  uploadBtnLocked: { opacity: 0.7 },
  uploadBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.purpleDark },

  removeBtn: { flex: 1, paddingVertical: 7, borderRadius: RADIUS.pill, alignItems: 'center', backgroundColor: COLORS.errorBg, borderWidth: 1, borderColor: COLORS.errorBorder },
  removeBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.errorText },

  upsellCard: { backgroundColor: COLORS.lavender, borderRadius: RADIUS.md, padding: SPACING.xl, alignItems: 'center', marginTop: SPACING.md, borderWidth: 1, borderColor: COLORS.lavenderAccent },
  upsellIcon: { fontSize: 36, marginBottom: SPACING.sm },
  upsellTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.purpleDark, marginBottom: SPACING.sm, textAlign: 'center' },
  upsellBody: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', lineHeight: 20, marginBottom: SPACING.lg },
  upsellBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md },
  upsellBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.sm },
});
