import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Share, Alert, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// ─── Storage Keys (must match provider-prep) ──────────────────────────────────
const SAVED_KEY = 'ap_provider_prep_saved';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PrepDraft {
  providerName: string;
  apptDate: string;
  visitType: string;
  childName: string;
  recentChanges: string;
  wins: string;
  challenges: string;
  therapies: string;
  medications: string;
  lastEval: string;
  topPriority: string;
  hopingFor: string;
  worriedAbout: string;
  afterAppt: string;
  selectedFocus: string[];
  checkedQuestions: string[];
  customQuestions: string[];
}

interface VisitSummary {
  childBackground: string;
  currentTreatment: string;
  goalsForVisit: string;
  postApptNotes: string;
  whatProviderSaid: string;
  nextSteps: string;
  followUpDate: string;
}

interface SavedNote {
  id: number;
  title: string;
  date: string;
  savedAt: string;
  draft: PrepDraft;
  visitSummary?: VisitSummary;
}

// ─── Question Bank Labels ─────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  diagnosis:   { label: 'Diagnosis & Evaluation',    color: '#b8a9e8' },
  behavior:    { label: 'Behavior & Communication',  color: '#a3c4f3' },
  sensory:     { label: 'Sensory Sensitivities',     color: '#a8ddc9' },
  sleep:       { label: 'Sleep',                     color: '#b8a9e8' },
  eating:      { label: 'Eating & Feeding',          color: '#f5c6a0' },
  therapy:     { label: 'Therapy Options',           color: '#a3c4f3' },
  school:      { label: 'School & IEP',              color: '#a8ddc9' },
  medication:  { label: 'Medication',                color: '#b8a9e8' },
  development: { label: 'Development & Milestones',  color: '#f5c6a0' },
  family:      { label: 'Family Support',            color: '#a3c4f3' },
};

// ─── HTML Report Generator ────────────────────────────────────────────────────
function buildHTML(note: SavedNote): string {
  const d = note.draft;
  const vs = note.visitSummary;

  const sectionHTML = (title: string, content: string, color = '#7c6fd4') =>
    content?.trim()
      ? `<div class="section">
           <div class="section-title" style="color:${color}">${title}</div>
           <div class="section-body">${content.replace(/\n/g, '<br>')}</div>
         </div>`
      : '';

  const rowHTML = (label: string, value: string) =>
    value?.trim()
      ? `<tr><td class="meta-label">${label}</td><td class="meta-value">${value}</td></tr>`
      : '';

  // Group checked questions by category
  const questionsByCategory: Record<string, string[]> = {};
  (d.checkedQuestions || []).forEach((q) => {
    const cat = Object.keys(CATEGORY_LABELS).find((k) =>
      // We store questions as plain strings; match by category via selectedFocus
      d.selectedFocus?.includes(k)
    ) || 'other';
    if (!questionsByCategory[cat]) questionsByCategory[cat] = [];
    questionsByCategory[cat].push(q);
  });

  // Build questions HTML — group by focus category
  let questionsHTML = '';
  (d.selectedFocus || []).forEach((cat) => {
    const catInfo = CATEGORY_LABELS[cat];
    if (!catInfo) return;
    const qs = (d.checkedQuestions || []).filter(() => true); // all checked
    if (qs.length === 0) return;
    questionsHTML += `<div class="q-category">
      <div class="q-cat-label" style="border-left:4px solid ${catInfo.color};padding-left:8px">${catInfo.label}</div>
    </div>`;
  });

  // Simpler: just list all checked questions as bullets
  const checkedQHTML = (d.checkedQuestions || []).length > 0
    ? `<div class="section">
        <div class="section-title" style="color:#7c6fd4">Questions for This Visit</div>
        <ul class="q-list">
          ${(d.checkedQuestions || []).map((q) => `<li>${q}</li>`).join('')}
        </ul>
      </div>`
    : '';

  const customQHTML = (d.customQuestions || []).length > 0
    ? `<div class="section">
        <div class="section-title" style="color:#7c6fd4">My Own Questions</div>
        <ul class="q-list">
          ${(d.customQuestions || []).map((q) => `<li>${q}</li>`).join('')}
        </ul>
      </div>`
    : '';

  const visitSummaryHTML = vs
    ? `<div class="page-break"></div>
       <div class="report-section-header">Visit Summary</div>
       ${sectionHTML('Child Background', vs.childBackground)}
       ${sectionHTML('Current Treatment', vs.currentTreatment)}
       ${sectionHTML('Goals for This Visit', vs.goalsForVisit)}
       ${sectionHTML('What the Provider Said', vs.whatProviderSaid)}
       ${sectionHTML('Post-Appointment Notes', vs.postApptNotes)}
       ${sectionHTML('Next Steps', vs.nextSteps, '#2a9d8f')}
       ${vs.followUpDate ? sectionHTML('Follow-Up Date', vs.followUpDate) : ''}`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Provider Visit Report — ${d.providerName || 'Provider'}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
    color: #2d2d3a;
    background: #fff;
    padding: 40px;
    max-width: 800px;
    margin: 0 auto;
    font-size: 14px;
    line-height: 1.6;
  }
  .header-bar {
    background: linear-gradient(135deg, #7c6fd4 0%, #5c4d9a 100%);
    color: white;
    padding: 28px 32px;
    border-radius: 16px;
    margin-bottom: 28px;
  }
  .header-eyebrow {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    opacity: 0.8;
    margin-bottom: 6px;
  }
  .header-provider {
    font-size: 26px;
    font-weight: 800;
    margin-bottom: 4px;
  }
  .header-meta {
    font-size: 13px;
    opacity: 0.85;
  }
  .header-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }
  .header-tag {
    background: rgba(255,255,255,0.2);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 500;
  }
  .meta-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 24px;
    background: #f8f7ff;
    border-radius: 12px;
    overflow: hidden;
  }
  .meta-table tr:not(:last-child) td {
    border-bottom: 1px solid #ede9fb;
  }
  .meta-label {
    padding: 10px 16px;
    font-size: 12px;
    font-weight: 700;
    color: #7c6fd4;
    width: 160px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .meta-value {
    padding: 10px 16px;
    font-size: 14px;
    color: #2d2d3a;
  }
  .report-section-header {
    font-size: 18px;
    font-weight: 800;
    color: #2d2d3a;
    border-bottom: 3px solid #7c6fd4;
    padding-bottom: 8px;
    margin: 28px 0 16px;
  }
  .section {
    margin-bottom: 20px;
    padding: 16px 20px;
    background: #fafafa;
    border-radius: 10px;
    border-left: 4px solid #ede9fb;
  }
  .section-title {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 8px;
  }
  .section-body {
    font-size: 14px;
    color: #3a3a4a;
    line-height: 1.7;
  }
  .q-list {
    padding-left: 20px;
  }
  .q-list li {
    font-size: 14px;
    color: #3a3a4a;
    line-height: 1.7;
    margin-bottom: 6px;
  }
  .focus-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
  }
  .focus-chip {
    background: #ede9fb;
    color: #5c4d9a;
    border-radius: 20px;
    padding: 5px 14px;
    font-size: 12px;
    font-weight: 600;
  }
  .page-break { page-break-before: always; margin-top: 40px; }
  .footer {
    margin-top: 48px;
    padding-top: 16px;
    border-top: 1px solid #e8e8f0;
    font-size: 11px;
    color: #9a9ab0;
    text-align: center;
  }
  @media print {
    body { padding: 20px; }
    .header-bar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .section { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>

<div class="header-bar">
  <div class="header-eyebrow">Autism Pathways — Provider Visit Report</div>
  <div class="header-provider">${d.providerName || 'Provider Visit'}</div>
  <div class="header-meta">${d.apptDate || note.date}${d.visitType ? ' · ' + d.visitType : ''}${d.childName ? ' · ' + d.childName : ''}</div>
  ${(d.selectedFocus || []).length > 0 ? `
  <div class="header-tags">
    ${(d.selectedFocus || []).map((f) => `<span class="header-tag">${CATEGORY_LABELS[f]?.label || f}</span>`).join('')}
  </div>` : ''}
</div>

<table class="meta-table">
  ${rowHTML('Child', d.childName)}
  ${rowHTML('Provider', d.providerName)}
  ${rowHTML('Date', d.apptDate || note.date)}
  ${rowHTML('Visit Type', d.visitType)}
  ${rowHTML('Last Evaluation', d.lastEval)}
  ${rowHTML('Current Therapies', d.therapies)}
  ${rowHTML('Medications', d.medications)}
</table>

<div class="report-section-header">Before the Visit</div>

${sectionHTML('Recent Changes', d.recentChanges)}
${sectionHTML('Wins & Progress', d.wins, '#2a9d8f')}
${sectionHTML('Challenges & Concerns', d.challenges, '#e76f51')}
${sectionHTML('Top Priority for This Visit', d.topPriority, '#7c6fd4')}
${sectionHTML('Hoping to Accomplish', d.hopingFor)}
${sectionHTML('Most Worried About', d.worriedAbout, '#e76f51')}

${checkedQHTML}
${customQHTML}

${visitSummaryHTML}

<div class="footer">
  Generated by Autism Pathways · ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · For personal use only
</div>

</body>
</html>`;
}

// ─── Plain Text Report (for Share) ───────────────────────────────────────────
function buildPlainText(note: SavedNote): string {
  const d = note.draft;
  const vs = note.visitSummary;
  const line = (label: string, value?: string) =>
    value?.trim() ? `${label.toUpperCase()}\n${value}\n\n` : '';

  let text = `AUTISM PATHWAYS — PROVIDER VISIT REPORT\n`;
  text += `${'─'.repeat(40)}\n`;
  text += `Provider: ${d.providerName || '—'}\n`;
  text += `Date: ${d.apptDate || note.date}\n`;
  text += `Visit Type: ${d.visitType || '—'}\n`;
  text += `Child: ${d.childName || '—'}\n\n`;

  text += line('Recent Changes', d.recentChanges);
  text += line('Wins & Progress', d.wins);
  text += line('Challenges & Concerns', d.challenges);
  text += line('Top Priority', d.topPriority);
  text += line('Hoping to Accomplish', d.hopingFor);
  text += line('Most Worried About', d.worriedAbout);
  text += line('Current Therapies', d.therapies);
  text += line('Medications', d.medications);

  if ((d.checkedQuestions || []).length > 0) {
    text += `QUESTIONS FOR THIS VISIT\n`;
    d.checkedQuestions.forEach((q) => { text += `• ${q}\n`; });
    text += '\n';
  }
  if ((d.customQuestions || []).length > 0) {
    text += `MY OWN QUESTIONS\n`;
    d.customQuestions.forEach((q) => { text += `• ${q}\n`; });
    text += '\n';
  }

  if (vs) {
    text += `${'─'.repeat(40)}\nVISIT SUMMARY\n${'─'.repeat(40)}\n\n`;
    text += line('What the Provider Said', vs.whatProviderSaid);
    text += line('Post-Appointment Notes', vs.postApptNotes);
    text += line('Next Steps', vs.nextSteps);
    text += line('Follow-Up Date', vs.followUpDate);
  }

  text += `\nGenerated by Autism Pathways`;
  return text;
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ProviderReportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [selected, setSelected] = useState<SavedNote | null>(null);
  const [printing, setPrinting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(SAVED_KEY).then((raw) => {
        if (raw) setSavedNotes(JSON.parse(raw));
      });
    }, [])
  );

  const handlePrint = async () => {
    if (!selected) return;
    setPrinting(true);
    try {
      const html = buildHTML(selected);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Provider Report — ${selected.draft.providerName || selected.title}`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        await Print.printAsync({ uri });
      }
    } catch (e) {
      Alert.alert('Error', 'Could not generate the PDF. Please try again.');
    } finally {
      setPrinting(false);
    }
  };

  const handleShare = async () => {
    if (!selected) return;
    try {
      await Share.share({
        message: buildPlainText(selected),
        title: `Provider Report — ${selected.draft.providerName || selected.title}`,
      });
    } catch (e) {
      Alert.alert('Error', 'Could not share the report.');
    }
  };

  const d = selected?.draft;
  const vs = selected?.visitSummary;

  const Field = ({ label, value }: { label: string; value?: string }) =>
    value?.trim() ? (
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
    ) : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Report</Text>
        {selected ? (
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare} style={styles.headerActionBtn}>
              <Text style={styles.headerActionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePrint} style={[styles.headerActionBtn, styles.headerActionPrimary]}>
              {printing
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={[styles.headerActionText, { color: '#fff' }]}>PDF</Text>
              }
            </TouchableOpacity>
          </View>
        ) : <View style={{ width: 80 }} />}
      </View>

      {/* No saved notes */}
      {savedNotes.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No saved prep sessions yet</Text>
          <Text style={styles.emptyBody}>
            Save a Provider Prep session first, then come back here to generate a printable report.
          </Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/provider-prep')}>
            <Text style={styles.emptyBtnText}>Go to Provider Prep →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Session picker */}
      {savedNotes.length > 0 && !selected && (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.pickTitle}>Select a prep session to generate a report</Text>
          {savedNotes.map((note) => (
            <TouchableOpacity
              key={note.id}
              style={styles.noteCard}
              onPress={() => setSelected(note)}
            >
              <View style={styles.noteCardLeft}>
                <Text style={styles.noteCardTitle}>{note.title}</Text>
                <Text style={styles.noteCardMeta}>
                  {note.draft.apptDate || note.date}
                  {note.draft.visitType ? ` · ${note.draft.visitType}` : ''}
                </Text>
                {note.draft.selectedFocus?.length > 0 && (
                  <View style={styles.focusRow}>
                    {note.draft.selectedFocus.slice(0, 3).map((f) => (
                      <View key={f} style={styles.focusChip}>
                        <Text style={styles.focusChipText}>{CATEGORY_LABELS[f]?.label || f}</Text>
                      </View>
                    ))}
                    {note.draft.selectedFocus.length > 3 && (
                      <Text style={styles.focusMore}>+{note.draft.selectedFocus.length - 3} more</Text>
                    )}
                  </View>
                )}
              </View>
              <Text style={styles.noteCardArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Report view */}
      {selected && d && (
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Back to list */}
          <TouchableOpacity onPress={() => setSelected(null)} style={styles.backToList}>
            <Text style={styles.backToListText}>← All sessions</Text>
          </TouchableOpacity>

          {/* Hero card */}
          <View style={styles.reportHero}>
            <Text style={styles.reportEyebrow}>PROVIDER VISIT REPORT</Text>
            <Text style={styles.reportProvider}>{d.providerName || 'Provider Visit'}</Text>
            <Text style={styles.reportMeta}>
              {d.apptDate || selected.date}
              {d.visitType ? ` · ${d.visitType}` : ''}
              {d.childName ? ` · ${d.childName}` : ''}
            </Text>
            {(d.selectedFocus || []).length > 0 && (
              <View style={styles.focusRow}>
                {d.selectedFocus.map((f) => (
                  <View key={f} style={styles.heroFocusChip}>
                    <Text style={styles.heroFocusChipText}>{CATEGORY_LABELS[f]?.label || f}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Print/Share buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>📤 Share as Text</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.printBtn} onPress={handlePrint} disabled={printing}>
              {printing
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.printBtnText}>🖨️ Save as PDF</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Meta table */}
          <View style={styles.metaTable}>
            {[
              ['Child', d.childName],
              ['Provider', d.providerName],
              ['Date', d.apptDate || selected.date],
              ['Visit Type', d.visitType],
              ['Last Evaluation', d.lastEval],
              ['Current Therapies', d.therapies],
              ['Medications', d.medications],
            ].filter(([, v]) => v?.trim()).map(([label, value]) => (
              <View key={label} style={styles.metaRow}>
                <Text style={styles.metaLabel}>{label}</Text>
                <Text style={styles.metaValue}>{value}</Text>
              </View>
            ))}
          </View>

          {/* Before the Visit */}
          <Text style={styles.sectionHeader}>Before the Visit</Text>
          <Field label="Recent Changes" value={d.recentChanges} />
          <Field label="Wins & Progress" value={d.wins} />
          <Field label="Challenges & Concerns" value={d.challenges} />
          <Field label="Top Priority for This Visit" value={d.topPriority} />
          <Field label="Hoping to Accomplish" value={d.hopingFor} />
          <Field label="Most Worried About" value={d.worriedAbout} />

          {/* Questions */}
          {(d.checkedQuestions || []).length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Questions for This Visit</Text>
              <View style={styles.questionList}>
                {d.checkedQuestions.map((q, i) => (
                  <View key={i} style={styles.questionItem}>
                    <Text style={styles.questionBullet}>?</Text>
                    <Text style={styles.questionText}>{q}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {(d.customQuestions || []).length > 0 && (
            <>
              <Text style={styles.sectionHeader}>My Own Questions</Text>
              <View style={styles.questionList}>
                {d.customQuestions.map((q, i) => (
                  <View key={i} style={styles.questionItem}>
                    <Text style={styles.questionBullet}>?</Text>
                    <Text style={styles.questionText}>{q}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Visit Summary */}
          {vs && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionHeader}>Visit Summary</Text>
              <Field label="Child Background" value={vs.childBackground} />
              <Field label="Current Treatment" value={vs.currentTreatment} />
              <Field label="Goals for This Visit" value={vs.goalsForVisit} />
              <Field label="What the Provider Said" value={vs.whatProviderSaid} />
              <Field label="Post-Appointment Notes" value={vs.postApptNotes} />
              <Field label="Next Steps" value={vs.nextSteps} />
              <Field label="Follow-Up Date" value={vs.followUpDate} />
            </>
          )}

          {/* Footer */}
          <View style={styles.reportFooter}>
            <Text style={styles.reportFooterText}>
              Generated by Autism Pathways · For personal use only
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const PURPLE = '#7c6fd4';
const PURPLE_DARK = '#5c4d9a';
const PURPLE_LIGHT = '#ede9fb';
const BG = '#f8f7ff';
const TEXT = '#2d2d3a';
const TEXT_MID = '#7a7a96';
const WHITE = '#ffffff';
const BORDER = '#e8e8f0';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: { padding: 4, minWidth: 60 },
  backText: { fontSize: 14, fontWeight: '600', color: PURPLE },
  headerTitle: { fontSize: 16, fontWeight: '700', color: TEXT },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  headerActionBtn: {
    borderWidth: 1,
    borderColor: PURPLE,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    minWidth: 52,
    alignItems: 'center',
  },
  headerActionPrimary: { backgroundColor: PURPLE, borderColor: PURPLE },
  headerActionText: { fontSize: 13, fontWeight: '700', color: PURPLE },

  scroll: { padding: 20 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 52, marginBottom: 16, opacity: 0.5 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: TEXT, marginBottom: 8, textAlign: 'center' },
  emptyBody: { fontSize: 14, color: TEXT_MID, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  emptyBtn: {
    backgroundColor: PURPLE,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: { color: WHITE, fontWeight: '700', fontSize: 14 },

  pickTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_MID,
    marginBottom: 16,
    textAlign: 'center',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  noteCardLeft: { flex: 1 },
  noteCardTitle: { fontSize: 16, fontWeight: '700', color: TEXT, marginBottom: 4 },
  noteCardMeta: { fontSize: 13, color: TEXT_MID, marginBottom: 8 },
  noteCardArrow: { fontSize: 18, color: PURPLE, marginLeft: 8 },

  focusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  focusChip: {
    backgroundColor: PURPLE_LIGHT,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  focusChipText: { fontSize: 11, fontWeight: '600', color: PURPLE_DARK },
  focusMore: { fontSize: 11, color: TEXT_MID, alignSelf: 'center' },

  backToList: { marginBottom: 16 },
  backToListText: { fontSize: 13, fontWeight: '600', color: PURPLE },

  reportHero: {
    backgroundColor: PURPLE,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },
  reportEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 6,
  },
  reportProvider: {
    fontSize: 24,
    fontWeight: '800',
    color: WHITE,
    marginBottom: 4,
  },
  reportMeta: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 12 },
  heroFocusChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  heroFocusChipText: { fontSize: 11, fontWeight: '600', color: WHITE },

  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  shareBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: PURPLE,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareBtnText: { fontSize: 14, fontWeight: '700', color: PURPLE },
  printBtn: {
    flex: 1,
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  printBtnText: { fontSize: 14, fontWeight: '700', color: WHITE },

  metaTable: {
    backgroundColor: WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    marginBottom: 24,
  },
  metaRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  metaLabel: {
    width: 130,
    fontSize: 12,
    fontWeight: '700',
    color: PURPLE,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metaValue: { flex: 1, fontSize: 14, color: TEXT },

  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT,
    borderBottomWidth: 2,
    borderBottomColor: PURPLE,
    paddingBottom: 6,
    marginBottom: 12,
    marginTop: 4,
  },

  field: {
    backgroundColor: WHITE,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER,
    borderLeftWidth: 4,
    borderLeftColor: PURPLE_LIGHT,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: PURPLE,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  fieldValue: { fontSize: 14, color: TEXT, lineHeight: 22 },

  questionList: {
    backgroundColor: WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    marginBottom: 20,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    gap: 10,
  },
  questionBullet: {
    fontSize: 13,
    fontWeight: '800',
    color: PURPLE,
    width: 18,
    marginTop: 1,
  },
  questionText: { flex: 1, fontSize: 14, color: TEXT, lineHeight: 21 },

  divider: {
    height: 2,
    backgroundColor: PURPLE_LIGHT,
    borderRadius: 1,
    marginVertical: 24,
  },

  reportFooter: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    alignItems: 'center',
  },
  reportFooterText: { fontSize: 11, color: TEXT_MID },
});
