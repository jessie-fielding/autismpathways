import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';

// ─── Types ────────────────────────────────────────────────────────────────────
type PathwayKey = 'encopresis' | 'bodySignals' | 'sensory' | 'regression';

interface PottyResult {
  primary: PathwayKey;
  secondary?: PathwayKey | null;
  scores?: Record<string, number>;
  answers?: Record<string, number>;
}

interface DiaryEntry {
  bm: 'yes' | 'no' | 'acc';
  bristolIndex?: number;
  savedAt: string;
}

// ─── Pathway display names ────────────────────────────────────────────────────
const PATHWAY_NAMES: Record<PathwayKey, string> = {
  encopresis:   'Encopresis & Constipation',
  bodySignals:  'Body Signal Unawareness (Interoception)',
  sensory:      'Sensory & Toilet Anxiety',
  regression:   'Regression & Transitions',
};

const PATHWAY_EMOJIS: Record<PathwayKey, string> = {
  encopresis:  '🟠',
  bodySignals: '🔵',
  sensory:     '🟣',
  regression:  '🟢',
};

const PATHWAY_COLORS: Record<PathwayKey, string> = {
  encopresis:  '#c45a00',
  bodySignals: '#1864ab',
  sensory:     '#862e9c',
  regression:  '#2f9e44',
};

// ─── Provider talking points by pathway ──────────────────────────────────────
const PROVIDER_TALKING_POINTS: Record<PathwayKey, {
  summary: string;
  discussionPoints: string[];
  questionsToAsk: string[];
  referrals: string[];
}> = {
  encopresis: {
    summary: "Based on the Autism Pathways assessment, this child's primary toileting challenge appears to be related to encopresis and chronic constipation. The quiz responses indicate signs consistent with overflow incontinence, including accidents without apparent awareness, withholding behaviors, and difficulty initiating bowel movements.",
    discussionPoints: [
      "Child appears to have reduced rectal sensation — may not feel the urge to defecate reliably",
      "Accidents appear involuntary; child shows no awareness before or during episodes",
      "Possible history of stool withholding or fear-based avoidance of defecation",
      "Autistic children are at higher risk for functional constipation due to dietary selectivity, sensory aversion to toileting, and routine rigidity",
      "Overflow incontinence (encopresis) may be present — liquid stool bypassing a fecal impaction",
      "Current toileting routine may need to be paused until bowel health is addressed",
    ],
    questionsToAsk: [
      "Can we assess for fecal impaction or chronic constipation today?",
      "Would a bowel cleanout protocol be appropriate, and if so, what would that look like?",
      "What is your recommended MiraLax or osmotic laxative protocol for a child this age?",
      "At what point would you recommend a referral to pediatric GI?",
      "Should we consider a referral to a pediatric pelvic floor physical therapist (PFPT)?",
      "How long should we expect the bowel retraining process to take?",
    ],
    referrals: [
      "Pediatric Gastroenterology (GI) — if constipation is severe or unresponsive to first-line treatment",
      "Pediatric Pelvic Floor Physical Therapy (PFPT) — for pelvic floor retraining and bowel habit rehabilitation",
      "Registered Dietitian — to address dietary fiber and fluid intake with sensory food preferences in mind",
    ],
  },
  bodySignals: {
    summary: "Based on the Autism Pathways assessment, this child's primary toileting challenge appears to be related to interoceptive differences — specifically, difficulty reliably sensing the internal signals that indicate the need to use the bathroom. This is a neurological difference common in autistic individuals and does not reflect behavioral noncompliance.",
    discussionPoints: [
      "Child does not appear to reliably sense the 'need to go' signal before accidents occur",
      "Interoception — the sense of internal body states — is commonly atypical in autistic individuals",
      "Timed toileting schedules are more effective than waiting for the child to self-initiate",
      "Child may benefit from explicit body awareness instruction rather than assuming the sensation will develop naturally",
      "Visual supports and predictable routines can compensate for unreliable internal signaling",
      "Progress may be slower than neurotypical peers but is achievable with the right approach",
    ],
    questionsToAsk: [
      "Are there any medical causes for reduced bladder or bowel sensation we should rule out?",
      "Would an occupational therapy referral for interoception work be appropriate?",
      "Are there any sensory processing assessments you would recommend?",
      "What is a realistic timeline for progress given this child's interoceptive profile?",
      "Are there any medications or supplements that could be affecting bowel/bladder sensation?",
    ],
    referrals: [
      "Occupational Therapy (OT) — specifically for interoception-based intervention (Kelly Mahler curriculum)",
      "Behavioral support / ABA — to build timed toileting routines with reinforcement",
      "Neuropsychology — if broader sensory processing evaluation is warranted",
    ],
  },
  sensory: {
    summary: "Based on the Autism Pathways assessment, this child's primary toileting challenge appears to be driven by sensory sensitivities and toilet-related anxiety. The bathroom environment itself — sounds, textures, smells, lighting, or the physical experience of the toilet — appears to be a significant barrier to successful toileting.",
    discussionPoints: [
      "Child shows signs of sensory aversion to one or more aspects of the bathroom or toileting process",
      "Avoidance behavior is likely sensory-driven, not oppositional — the environment feels genuinely unsafe or overwhelming",
      "Common triggers in autistic children include: flushing sounds, cold toilet seat, fear of falling in, echoing acoustics, fluorescent lighting, smell sensitivity",
      "A gradual desensitization approach is more effective than forcing exposure",
      "Occupational therapy with a sensory integration focus is typically the most effective intervention",
      "Environmental modifications (toilet insert, step stool, white noise, dimmer lighting) can produce rapid improvement",
    ],
    questionsToAsk: [
      "Would you recommend a sensory processing assessment or OT evaluation?",
      "Are there any anxiety medications or interventions that might help reduce the fear response during toileting?",
      "Is there a desensitization protocol you have seen work well for toilet anxiety in autistic children?",
      "How do we distinguish between sensory avoidance and behavioral avoidance in terms of treatment approach?",
      "Are there any physical sensory sensitivities (tactile, auditory) we should formally assess?",
    ],
    referrals: [
      "Occupational Therapy (OT) with sensory integration specialization",
      "Behavioral support — for graduated exposure and reinforcement-based desensitization",
      "Child psychologist or therapist — if anxiety is generalized beyond the bathroom",
    ],
  },
  regression: {
    summary: "Based on the Autism Pathways assessment, this child's primary toileting challenge appears to be a regression — a loss of previously established toileting skills. The quiz responses suggest this child was making progress or had achieved toileting milestones that have since declined, likely in connection with a change in environment, routine, or life circumstances.",
    discussionPoints: [
      "Child had established toileting skills that have regressed — this is distinct from a child who has never been trained",
      "Regression in autistic children is almost always triggered by a change: new school year, new teacher, move, new sibling, illness, or disruption to routine",
      "The toileting skill is still present neurologically — regression is typically a stress or transition response, not a loss of ability",
      "Returning to the previously successful routine (rather than starting over) is usually the most effective approach",
      "School environment should be assessed — bathroom access, privacy, noise, and time pressure are common school-based triggers",
      "Shame-based responses worsen regression; calm, consistent, non-punitive approaches support recovery",
    ],
    questionsToAsk: [
      "Are there any medical causes for the regression we should rule out — UTI, constipation, new medications?",
      "What is your recommended approach for distinguishing medical from behavioral regression?",
      "Should we involve the school team, and if so, what should we ask them to assess?",
      "Are there anxiety supports or accommodations that might help during the transition period?",
      "How long is a typical regression expected to last with the right supports in place?",
    ],
    referrals: [
      "Pediatric primary care — to rule out UTI, constipation, or other medical causes",
      "School-based OT or behavioral support — to assess and modify the school bathroom environment",
      "Child therapist or psychologist — if the regression is tied to a significant life stressor (divorce, loss, trauma)",
    ],
  },
};

// ─── HTML builder ─────────────────────────────────────────────────────────────
function buildProviderReportHTML(
  result: PottyResult,
  diaryEntries: Record<string, DiaryEntry>,
  childName: string,
): string {
  const primary   = result.primary;
  const secondary = result.secondary;
  const points    = PROVIDER_TALKING_POINTS[primary];
  const color     = PATHWAY_COLORS[primary];
  const today     = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Diary summary
  const entries = Object.entries(diaryEntries);
  let diarySummaryHTML = '';
  if (entries.length > 0) {
    const bmDays      = entries.filter(([, e]) => e.bm === 'yes').length;
    const accDays     = entries.filter(([, e]) => e.bm === 'acc').length;
    const noBmDays    = entries.filter(([, e]) => e.bm === 'no').length;
    const bristolVals = entries.filter(([, e]) => e.bristolIndex !== undefined).map(([, e]) => e.bristolIndex as number);
    const avgBristol  = bristolVals.length > 0
      ? (bristolVals.reduce((a, b) => a + b, 0) / bristolVals.length).toFixed(1)
      : null;

    diarySummaryHTML = `
      <div class="section" style="border-left-color: ${color}">
        <div class="section-title" style="color:${color}">Bowel Diary Summary (${entries.length} days recorded)</div>
        <table class="diary-table">
          <tr><td class="dl">Days with bowel movement</td><td class="dv">${bmDays} of ${entries.length} days</td></tr>
          <tr><td class="dl">Days with accident</td><td class="dv">${accDays} of ${entries.length} days</td></tr>
          <tr><td class="dl">Days with no BM recorded</td><td class="dv">${noBmDays} of ${entries.length} days</td></tr>
          ${avgBristol ? `<tr><td class="dl">Average Bristol Stool Scale</td><td class="dv">${avgBristol} / 7</td></tr>` : ''}
        </table>
        ${accDays > 3 ? '<p class="diary-note">⚠️ Accidents recorded on more than 3 days — may indicate overflow incontinence or encopresis.</p>' : ''}
        ${noBmDays > 3 ? '<p class="diary-note">⚠️ No bowel movement recorded on more than 3 days — may indicate constipation or withholding.</p>' : ''}
      </div>`;
  }

  const secondaryHTML = secondary && secondary !== primary ? `
    <div class="secondary-badge">
      <strong>Secondary pathway also detected:</strong> ${PATHWAY_EMOJIS[secondary]} ${PATHWAY_NAMES[secondary]}
      <br><span style="font-size:12px;opacity:0.8">The child may also have difficulty reliably sensing the need to use the bathroom. Both pathways should be considered in the treatment plan.</span>
    </div>` : '';

  const discussionHTML = points.discussionPoints
    .map((p) => `<li>${p}</li>`).join('');

  const questionsHTML = points.questionsToAsk
    .map((q) => `<li>${q}</li>`).join('');

  const referralsHTML = points.referrals
    .map((r) => `<li>${r}</li>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Potty Pathway Provider Report${childName ? ' — ' + childName : ''}</title>
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
  .header-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; opacity: 0.8; margin-bottom: 6px; }
  .header-title { font-size: 26px; font-weight: 800; margin-bottom: 4px; }
  .header-meta { font-size: 13px; opacity: 0.85; }
  .pathway-badge {
    display: inline-block;
    background: rgba(255,255,255,0.2);
    border-radius: 20px;
    padding: 5px 14px;
    font-size: 13px;
    font-weight: 600;
    margin-top: 12px;
  }
  .secondary-badge {
    background: #f5f0ff;
    border: 1.5px solid #c9b8f5;
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 20px;
    font-size: 13px;
    color: #5c4d9a;
    line-height: 1.6;
  }
  .disclaimer {
    background: #fff8f0;
    border: 1.5px solid #ffd8a8;
    border-radius: 10px;
    padding: 14px 18px;
    margin-bottom: 24px;
    font-size: 12px;
    color: #7a4a00;
    line-height: 1.6;
  }
  .report-section-header {
    font-size: 17px;
    font-weight: 800;
    color: #2d2d3a;
    border-bottom: 3px solid #7c6fd4;
    padding-bottom: 8px;
    margin: 28px 0 14px;
  }
  .section {
    margin-bottom: 20px;
    padding: 16px 20px;
    background: #fafafa;
    border-radius: 10px;
    border-left: 4px solid #ede9fb;
  }
  .section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 10px;
    color: #7c6fd4;
  }
  .section-body { font-size: 14px; color: #3a3a4a; line-height: 1.7; }
  ul.point-list { padding-left: 20px; }
  ul.point-list li { font-size: 14px; color: #3a3a4a; line-height: 1.7; margin-bottom: 8px; }
  .diary-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  .diary-table tr:not(:last-child) td { border-bottom: 1px solid #ede9fb; }
  .dl { padding: 7px 0; font-size: 13px; color: #7c6fd4; font-weight: 600; width: 55%; }
  .dv { padding: 7px 0; font-size: 14px; color: #2d2d3a; }
  .diary-note { font-size: 12px; color: #c45a00; margin-top: 10px; font-weight: 600; }
  .referral-section {
    background: #f0faf5;
    border-left: 4px solid #2a9d8f;
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 20px;
  }
  .referral-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #2a9d8f; margin-bottom: 10px; }
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
    .referral-section { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>

<div class="header-bar">
  <div class="header-eyebrow">Autism Pathways — Potty Pathway Provider Report</div>
  <div class="header-title">Toileting Assessment Summary${childName ? ' — ' + childName : ''}</div>
  <div class="header-meta">Generated ${today} · For discussion with healthcare provider</div>
  <div class="pathway-badge">${PATHWAY_EMOJIS[primary]} Primary Pathway: ${PATHWAY_NAMES[primary]}</div>
</div>

<div class="disclaimer">
  ⚠️ <strong>For discussion purposes only.</strong> This report was generated by the Autism Pathways app based on a parent-completed questionnaire. It is not a clinical diagnosis and should not replace professional medical evaluation. Please use this as a starting point for conversation with your child's healthcare team.
</div>

${secondaryHTML}

<div class="report-section-header">Assessment Summary</div>
<div class="section" style="border-left-color: ${color}">
  <div class="section-title" style="color:${color}">Primary Pathway: ${PATHWAY_NAMES[primary]}</div>
  <div class="section-body">${points.summary}</div>
</div>

${diarySummaryHTML}

<div class="report-section-header">Discussion Points for This Visit</div>
<div class="section">
  <ul class="point-list">${discussionHTML}</ul>
</div>

<div class="report-section-header">Questions to Ask the Provider</div>
<div class="section">
  <ul class="point-list">${questionsHTML}</ul>
</div>

<div class="report-section-header">Referrals to Consider</div>
<div class="referral-section">
  <div class="referral-title">Recommended Specialists</div>
  <ul class="point-list">${referralsHTML}</ul>
</div>

<div class="footer">
  Generated by Autism Pathways · ${today} · For personal and provider use only · Not a clinical diagnosis
</div>

</body>
</html>`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function PottyProviderReportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [result,         setResult]         = useState<PottyResult | null>(null);
  const [diary,          setDiary]          = useState<Record<string, DiaryEntry>>({});
  const [childName,      setChildName]      = useState('');
  const [loading,        setLoading]        = useState(true);
  const [generating,     setGenerating]     = useState(false);
  const [apptModal,      setApptModal]      = useState(false);
  const [savedNotes,     setSavedNotes]     = useState<any[]>([]);
  const [selectedAppts,  setSelectedAppts]  = useState<Set<number>>(new Set());
  const [linking,        setLinking]        = useState(false);
  const [linked,         setLinked]         = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [resultRaw, diaryRaw, profileRaw, notesRaw] = await Promise.all([
          AsyncStorage.getItem('potty_result'),
          AsyncStorage.getItem('ap_potty_diary'),
          AsyncStorage.getItem('profile'),
          AsyncStorage.getItem('ap_provider_prep_saved'),
        ]);
        if (resultRaw) setResult(JSON.parse(resultRaw));
        if (diaryRaw)  setDiary(JSON.parse(diaryRaw));
        if (profileRaw) {
          const profile = JSON.parse(profileRaw);
          setChildName(profile.childName || profile.name || '');
        }
        if (notesRaw) setSavedNotes(JSON.parse(notesRaw));
      } catch (e) {
        console.error('Error loading potty report data:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLinkToAppointments = async () => {
    if (!result || selectedAppts.size === 0) return;
    setLinking(true);
    try {
      const primary = result.primary;
      const points  = PROVIDER_TALKING_POINTS[primary];
      const pottyData = {
        primary,
        primaryName: PATHWAY_NAMES[primary],
        secondary: result.secondary || null,
        secondaryName: result.secondary ? PATHWAY_NAMES[result.secondary] : null,
        summary: points.summary,
        discussionPoints: points.discussionPoints,
        questionsToAsk: points.questionsToAsk,
        referrals: points.referrals,
        addedAt: new Date().toISOString(),
      };

      // Build bowel diary summary if diary exists
      const entries = Object.entries(diary);
      let bowelSummary: any = undefined;
      if (entries.length > 0) {
        const bmDays  = entries.filter(([, e]) => e.bm === 'yes').length;
        const accDays = entries.filter(([, e]) => e.bm === 'acc').length;
        const noBmDays = entries.filter(([, e]) => e.bm === 'no').length;
        const bristolVals = entries.filter(([, e]) => e.bristolIndex !== undefined).map(([, e]) => e.bristolIndex as number);
        const avgBristol = bristolVals.length > 0
          ? (bristolVals.reduce((a, b) => a + b, 0) / bristolVals.length).toFixed(1)
          : null;
        bowelSummary = {
          totalDays: entries.length,
          bmDays, accidentDays: accDays, noBmDays, avgBristol,
          addedAt: new Date().toISOString(),
        };
      }

      const updatedNotes = savedNotes.map((note) => {
        if (!selectedAppts.has(note.id)) return note;
        return {
          ...note,
          pottyPathway: pottyData,
          ...(bowelSummary ? { bowelDiary: bowelSummary } : {}),
        };
      });

      await AsyncStorage.setItem('ap_provider_prep_saved', JSON.stringify(updatedNotes));
      setSavedNotes(updatedNotes);
      setLinked(true);
      setApptModal(false);
      setSelectedAppts(new Set());
      Alert.alert(
        'Added to Report!',
        `Potty pathway data${bowelSummary ? ' and bowel diary' : ''} added to ${selectedAppts.size} appointment${selectedAppts.size > 1 ? 's' : ''}. Open Provider Report to view.`,
        [{ text: 'View Report', onPress: () => router.push('/provider-report') }, { text: 'OK' }]
      );
    } catch (e) {
      Alert.alert('Error', 'Could not link to appointments. Please try again.');
    } finally {
      setLinking(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!result) return;
    try {
      setGenerating(true);
      const html = buildProviderReportHTML(result, diary, childName);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Potty Pathway Provider Report',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF Saved', 'Your provider report has been saved to your device.');
      }
    } catch (e: any) {
      console.error('PDF generation error:', e);
      Alert.alert('Error', 'Could not generate the PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.purple} />
        <Text style={styles.loadingText}>Loading your results...</Text>
      </View>
    );
  }

  if (!result) {
    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Provider Report</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.dashText}>🏠 Home</Text>
        </TouchableOpacity>
        </View>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Quiz Results Yet</Text>
          <Text style={styles.emptyBody}>Complete the Potty Pathway quiz first to generate a provider report.</Text>
          <TouchableOpacity style={styles.quizBtn} onPress={() => router.push('/potty/quiz')}>
            <Text style={styles.quizBtnText}>Take the Quiz →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const primary   = result.primary;
  const secondary = result.secondary;
  const points    = PROVIDER_TALKING_POINTS[primary];
  const color     = PATHWAY_COLORS[primary];
  const diaryCount = Object.keys(diary).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Report</Text>
        <TouchableOpacity
          style={[styles.pdfBtn, generating && styles.pdfBtnDisabled]}
          onPress={handleGeneratePDF}
          disabled={generating}
        >
          {generating
            ? <ActivityIndicator size="small" color={COLORS.white} />
            : <Text style={styles.pdfBtnText}>📄 PDF</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Pathway banner */}
        <View style={[styles.pathwayBanner, { borderLeftColor: color }]}>
          <Text style={[styles.pathwayEyebrow, { color }]}>PRIMARY PATHWAY DETECTED</Text>
          <Text style={styles.pathwayTitle}>{PATHWAY_EMOJIS[primary]} {PATHWAY_NAMES[primary]}</Text>
          {secondary && secondary !== primary && (
            <Text style={styles.pathwaySecondary}>
              Secondary: {PATHWAY_EMOJIS[secondary]} {PATHWAY_NAMES[secondary]}
            </Text>
          )}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerText}>
            ⚠️ For discussion purposes only. This is not a clinical diagnosis. Use as a starting point for conversation with your child's healthcare team.
          </Text>
        </View>

        {/* Diary summary if available */}
        {diaryCount > 0 && (
          <View style={[styles.card, { borderLeftColor: color }]}>
            <Text style={[styles.cardLabel, { color }]}>BOWEL DIARY — {diaryCount} DAYS RECORDED</Text>
            <Text style={styles.cardBody}>
              Your bowel diary data will be included in the PDF report, giving your provider a concrete picture of patterns over time.
            </Text>
          </View>
        )}

        {/* Assessment summary */}
        <Text style={styles.sectionHeading}>ASSESSMENT SUMMARY</Text>
        <View style={[styles.card, { borderLeftColor: color }]}>
          <Text style={[styles.cardLabel, { color }]}>FOR YOUR PROVIDER</Text>
          <Text style={styles.cardBody}>{points.summary}</Text>
        </View>

        {/* Discussion points */}
        <Text style={styles.sectionHeading}>DISCUSSION POINTS</Text>
        {points.discussionPoints.map((point, i) => (
          <View key={i} style={styles.bulletCard}>
            <Text style={[styles.bulletDot, { color }]}>•</Text>
            <Text style={styles.bulletText}>{point}</Text>
          </View>
        ))}

        {/* Questions to ask */}
        <Text style={styles.sectionHeading}>QUESTIONS TO ASK</Text>
        {points.questionsToAsk.map((q, i) => (
          <View key={i} style={styles.questionCard}>
            <Text style={styles.questionNum}>{i + 1}</Text>
            <Text style={styles.questionText}>{q}</Text>
          </View>
        ))}

        {/* Referrals */}
        <Text style={styles.sectionHeading}>REFERRALS TO CONSIDER</Text>
        {points.referrals.map((r, i) => (
          <View key={i} style={styles.referralCard}>
            <Text style={styles.referralIcon}>🏥</Text>
            <Text style={styles.referralText}>{r}</Text>
          </View>
        ))}

        {/* Add to Appointment CTA */}
        {savedNotes.length > 0 && (
          <TouchableOpacity
            style={[styles.addApptBtn, linked && styles.addApptBtnLinked]}
            onPress={() => setApptModal(true)}
          >
            <Text style={styles.addApptBtnIcon}>{linked ? '✅' : '📅'}</Text>
            <View>
              <Text style={styles.addApptBtnTitle}>
                {linked ? 'Added to Appointment Report' : 'Add to Appointment Report'}
              </Text>
              <Text style={styles.addApptBtnSub}>
                {linked ? 'Tap to update appointment selection' : `${savedNotes.length} upcoming appointment${savedNotes.length > 1 ? 's' : ''} available`}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Generate PDF CTA */}
        <TouchableOpacity
          style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
          onPress={handleGeneratePDF}
          disabled={generating}
        >
          {generating ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.generateBtnIcon}>📄</Text>
              <View>
                <Text style={styles.generateBtnTitle}>Generate & Share PDF</Text>
                <Text style={styles.generateBtnSub}>
                  {diaryCount > 0
                    ? `Includes ${diaryCount}-day bowel diary summary`
                    : 'Share with your provider before the appointment'}
                </Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Appointment Picker Modal */}
      <Modal visible={apptModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setApptModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setApptModal(false)} style={styles.modalCancelBtn}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Appointment(s)</Text>
            <TouchableOpacity
              onPress={handleLinkToAppointments}
              disabled={selectedAppts.size === 0 || linking}
              style={[styles.modalDoneBtn, (selectedAppts.size === 0 || linking) && styles.modalDoneBtnDisabled]}
            >
              {linking
                ? <ActivityIndicator size="small" color={COLORS.white} />
                : <Text style={styles.modalDoneText}>Add</Text>
              }
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSubtitle}>Choose which upcoming appointment(s) to include this potty pathway data in:</Text>
          <ScrollView style={styles.modalScroll} contentContainerStyle={{ padding: 20 }}>
            {savedNotes.map((note) => {
              const isSelected = selectedAppts.has(note.id);
              return (
                <TouchableOpacity
                  key={note.id}
                  style={[styles.apptCard, isSelected && styles.apptCardSelected]}
                  onPress={() => {
                    const next = new Set(selectedAppts);
                    if (isSelected) next.delete(note.id); else next.add(note.id);
                    setSelectedAppts(next);
                  }}
                >
                  <View style={styles.apptCardLeft}>
                    <Text style={styles.apptCardTitle}>{note.title || `${note.draft?.providerName || 'Provider'} — ${note.date}`}</Text>
                    <Text style={styles.apptCardMeta}>{note.date}{note.draft?.visitType ? ` · ${note.draft.visitType}` : ''}</Text>
                    {note.pottyPathway && (
                      <Text style={styles.apptCardBadge}>✓ Potty data already linked</Text>
                    )}
                  </View>
                  <View style={[styles.apptCheckbox, isSelected && styles.apptCheckboxSelected]}>
                    {isSelected && <Text style={styles.apptCheckmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  loadingText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid },

  emptyContainer: { flex: 1, backgroundColor: COLORS.bg },
  emptyContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm, textAlign: 'center' },
  emptyBody: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl },
  quizBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md },
  quizBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONT_SIZES.base },

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
  backBtn: { width: 80 },
  backText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.purple },
  headerTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  pdfBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  pdfBtnDisabled: { opacity: 0.6 },
  pdfBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.white },

  scroll: { flex: 1 },
  scrollContent: { padding: SPACING.lg },

  pathwayBanner: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    ...SHADOWS.sm,
  },
  pathwayEyebrow: { fontSize: FONT_SIZES.xs, fontWeight: '700', letterSpacing: 1, marginBottom: SPACING.xs },
  pathwayTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, lineHeight: 26 },
  pathwaySecondary: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, marginTop: SPACING.xs },

  disclaimerCard: {
    backgroundColor: '#fff8f0',
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#ffd8a8',
  },
  disclaimerText: { fontSize: FONT_SIZES.xs, color: '#7a4a00', lineHeight: 18 },

  sectionHeading: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    ...SHADOWS.sm,
  },
  cardLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', letterSpacing: 0.8, marginBottom: SPACING.sm },
  cardBody: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 22 },

  bulletCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  bulletDot: { fontSize: 18, fontWeight: '700', lineHeight: 22 },
  bulletText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 22 },

  questionCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
    alignItems: 'flex-start',
    ...SHADOWS.sm,
  },
  questionNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.lavender,
    textAlign: 'center',
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.purpleDark,
    lineHeight: 24,
  },
  questionText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 22 },

  referralCard: {
    flexDirection: 'row',
    backgroundColor: '#f0faf5',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: '#a8ddc9',
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  referralIcon: { fontSize: 18 },
  referralText: { flex: 1, fontSize: FONT_SIZES.sm, color: '#1a5c3a', lineHeight: 22 },

  addApptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: '#f0faf5',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: '#2a9d8f',
    ...SHADOWS.sm,
  },
  addApptBtnLinked: { backgroundColor: '#e8f8f5', borderColor: '#2a9d8f' },
  addApptBtnIcon: { fontSize: 28 },
  addApptBtnTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: '#1a6b60' },
  addApptBtnSub: { fontSize: FONT_SIZES.xs, color: '#2a9d8f', marginTop: 2 },

  modalContainer: { flex: 1, backgroundColor: COLORS.bg },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  modalCancelBtn: { minWidth: 60 },
  modalCancelText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  modalDoneBtn: {
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  modalDoneBtnDisabled: { opacity: 0.4 },
  modalDoneText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.white },
  modalSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMid,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
  },
  modalScroll: { flex: 1 },

  apptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  apptCardSelected: { borderColor: COLORS.purple, backgroundColor: '#f8f7ff' },
  apptCardLeft: { flex: 1 },
  apptCardTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  apptCardMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textMid },
  apptCardBadge: { fontSize: FONT_SIZES.xs, color: '#2a9d8f', fontWeight: '600', marginTop: 4 },
  apptCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.md,
  },
  apptCheckboxSelected: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  apptCheckmark: { fontSize: 13, fontWeight: '800', color: COLORS.white },

  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.purple,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
    gap: SPACING.md,
    ...SHADOWS.md,
  },
  generateBtnDisabled: { opacity: 0.6 },
  generateBtnIcon: { fontSize: 28 },
  generateBtnTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.white },
  generateBtnSub: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
});
