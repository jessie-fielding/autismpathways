/**
 * IEP Meeting Recorder
 * - Legal acknowledgment gate (must confirm recording permission)
 * - Audio recording via expo-av
 * - Transcription via Lambda /api/provider-translator/transcribe
 * - AI summary (decisions, action items, next steps) via Lambda /api/iep/summarize
 * - Save to AsyncStorage + share
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput,
  Alert, ActivityIndicator, Share, Platform, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { COLORS, SPACING, RADIUS, FONT_SIZES, SHADOWS } from '../../lib/theme';
import { useIsPremium } from '../../hooks/useIsPremium';
import {trackPaywallViewed, trackIEPMeetingRecorderOpened, logScreenView, useScreenTime} from '../../../lib/analytics';

const API_BASE = 'https://inu3nb5lrfvftfyiwprftqshpy0zcegu.lambda-url.us-east-2.on.aws';
const RECORDINGS_KEY = 'ap_iep_recordings';

interface Recording {
  id: string;
  meetingName: string;
  date: string;
  duration: number; // seconds
  transcript: string;
  summary: {
    decisions: string[];
    actionItems: string[];
    nextSteps: string[];
    followUps: string[];
  } | null;
  notes: string;
  savedAt: string;
}

type Screen = 'gate' | 'record' | 'processing' | 'summary' | 'history';

export default function MeetingRecorderScreen() {
  useScreenTime('iep_meeting_recorder');
  useEffect(() => { logScreenView('iep_meeting_recorder'); trackIEPMeetingRecorderOpened(); }, []);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();

  const [screen, setScreen] = useState<Screen>('gate');
  const [confirmed, setConfirmed] = useState(false);
  const [meetingName, setMeetingName] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>('decisions');

  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for recording indicator
  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  // Load saved recordings
  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      const raw = await AsyncStorage.getItem(RECORDINGS_KEY);
      if (raw) setRecordings(JSON.parse(raw));
    } catch (_) {}
  };

  const saveRecording = async (rec: Recording) => {
    try {
      const updated = [rec, ...recordings];
      setRecordings(updated);
      await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(updated));
    } catch (_) {}
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Microphone Permission', 'Please allow microphone access in your device settings to record meetings.');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration(d => d + 1);
      }, 1000);
    } catch (e) {
      Alert.alert('Recording Error', 'Could not start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setProcessing(true);
    setScreen('processing');

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) throw new Error('No recording URI');

      // Upload audio and transcribe
      let transcript = '';
      let summary: Recording['summary'] = null;

      try {
        // Read file as base64 and send to Lambda
        const formData = new FormData();
        formData.append('audio', {
          uri,
          type: 'audio/m4a',
          name: 'recording.m4a',
        } as any);
        formData.append('meetingName', meetingName || 'IEP Meeting');

        const transcribeRes = await fetch(`${API_BASE}/api/iep/transcribe`, {
          method: 'POST',
          body: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (transcribeRes.ok) {
          const transcribeData = await transcribeRes.json();
          transcript = transcribeData.transcript || '';

          // Now get AI summary
          if (transcript) {
            const summaryRes = await fetch(`${API_BASE}/api/iep/summarize`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ transcript, meetingName: meetingName || 'IEP Meeting', notes }),
            });
            if (summaryRes.ok) {
              const summaryData = await summaryRes.json();
              summary = summaryData.summary || null;
            }
          }
        }
      } catch (apiError) {
        // Graceful fallback — save without transcript
        console.log('Transcription API error:', apiError);
        transcript = '[Transcription unavailable — audio saved locally]';
      }

      const rec: Recording = {
        id: Date.now().toString(),
        meetingName: meetingName || 'IEP Meeting',
        date: new Date().toLocaleDateString(),
        duration: recordingDuration,
        transcript,
        summary,
        notes,
        savedAt: new Date().toISOString(),
      };

      await saveRecording(rec);
      setCurrentRecording(rec);
      setScreen('summary');
    } catch (e) {
      setProcessing(false);
      setScreen('record');
      Alert.alert('Processing Error', 'Could not process the recording. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const shareRecording = async (rec: Recording) => {
    const text = [
      `📋 IEP Meeting Recording Summary`,
      `Meeting: ${rec.meetingName}`,
      `Date: ${rec.date}`,
      `Duration: ${formatDuration(rec.duration)}`,
      '',
      rec.summary ? [
        `✅ DECISIONS MADE:`,
        ...(rec.summary.decisions.map(d => `• ${d}`)),
        '',
        `📌 ACTION ITEMS:`,
        ...(rec.summary.actionItems.map(a => `• ${a}`)),
        '',
        `➡️ NEXT STEPS:`,
        ...(rec.summary.nextSteps.map(n => `• ${n}`)),
        '',
        `🔔 FOLLOW-UP REMINDERS:`,
        ...(rec.summary.followUps.map(f => `• ${f}`)),
      ].join('\n') : '',
      '',
      rec.notes ? `📝 NOTES:\n${rec.notes}` : '',
      '',
      `📄 FULL TRANSCRIPT:\n${rec.transcript}`,
    ].filter(Boolean).join('\n');

    await Share.share({ message: text, title: `IEP Meeting — ${rec.meetingName}` });
  };

  // ── Premium gate ────────────────────────────────────────────────────────────
  if (!isPremium) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← IEP</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meeting Recorder</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.premiumGate}>
          <Text style={styles.gateIcon}>🎙️</Text>
          <Text style={styles.gateTitle}>IEP Meeting Recorder</Text>
          <Text style={styles.gateSub}>Record, transcribe, and get an AI-generated summary of every IEP meeting — decisions, action items, and next steps.</Text>
          <View style={styles.gateBullets}>
            {['Auto-transcription with Whisper AI', 'AI summary: decisions, action items, next steps', 'Save & share with your team', 'Searchable meeting history'].map(b => (
              <View key={b} style={styles.gateBulletRow}>
                <Text style={styles.gateBulletCheck}>✓</Text>
                <Text style={styles.gateBulletText}>{b}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.gateBtn} onPress={() => (trackPaywallViewed('iep_meeting_recorder'), router.push('/paywall'))} activeOpacity={0.85}>
            <Text style={styles.gateBtnText}>⭐ Unlock with Premium</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Legal Gate ──────────────────────────────────────────────────────────────
  if (screen === 'gate') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← IEP</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meeting Recorder</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.gateContent}>
            <View style={styles.micIconWrap}>
              <Text style={styles.micIcon}>🎙️</Text>
            </View>
            <Text style={styles.gateHeading}>Before You Record</Text>
            <Text style={styles.gateIntro}>
              Recording laws vary by state. Some states require all parties to consent before a meeting can be recorded.
            </Text>

            {/* Legal notice box */}
            <View style={styles.legalBox}>
              <Text style={styles.legalBoxTitle}>⚠️ Important Legal Notice</Text>
              <Text style={styles.legalBoxText}>
                Autism Pathways is not a legal service and does not provide legal advice. You are solely responsible for ensuring that recording your IEP meeting complies with all applicable federal, state, and local laws — including any consent requirements.{'\n\n'}
                Many states require the consent of all parties being recorded. Failure to obtain proper consent may expose you to civil or criminal liability.{'\n\n'}
                We strongly recommend notifying the school team that you intend to record the meeting and obtaining their agreement before pressing record.
              </Text>
            </View>

            {/* Confirmation checkbox */}
            <TouchableOpacity
              style={[styles.confirmCard, confirmed && styles.confirmCardChecked]}
              onPress={() => setConfirmed(!confirmed)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
                {confirmed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.confirmText}>
                I have confirmed with my school/district that I have permission to record this meeting, and I understand that I am solely responsible for compliance with applicable recording laws.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                const { Linking } = require('react-native');
                Linking.openURL('https://www.understood.org/articles/recording-iep-meetings');
              }}
              style={styles.learnMoreLink}
            >
              <Text style={styles.learnMoreText}>Learn about recording laws by state →</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.proceedBtn, !confirmed && styles.proceedBtnDisabled]}
              onPress={() => confirmed && setScreen('record')}
              activeOpacity={confirmed ? 0.85 : 1}
            >
              <Text style={styles.proceedBtnText}>
                {confirmed ? '🎙️ Set Up My Recording →' : 'Please confirm above to continue'}
              </Text>
            </TouchableOpacity>

            {/* History link */}
            {recordings.length > 0 && (
              <TouchableOpacity style={styles.historyLink} onPress={() => setScreen('history')}>
                <Text style={styles.historyLinkText}>📂 View Past Recordings ({recordings.length})</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={{ height: insets.bottom + 24 }} />
        </ScrollView>
      </View>
    );
  }

  // ── Recording Screen ─────────────────────────────────────────────────────────
  if (screen === 'record') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setScreen('gate')} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meeting Recorder</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.recordContent}>
            {/* Meeting name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Meeting Name</Text>
              <TextInput
                style={styles.textInput}
                value={meetingName}
                onChangeText={setMeetingName}
                placeholder="e.g. Annual IEP Review — June 2025"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            {/* Date */}
            <View style={styles.dateBadge}>
              <Text style={styles.dateBadgeText}>📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
            </View>

            {/* Record button */}
            <View style={styles.recordCenter}>
              {isRecording && (
                <View style={styles.recBadgeRow}>
                  <Animated.View style={[styles.recDot, { transform: [{ scale: pulseAnim }] }]} />
                  <Text style={styles.recLabel}>REC</Text>
                  <Text style={styles.recTimer}>{formatDuration(recordingDuration)}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
                onPress={isRecording ? stopRecording : startRecording}
                activeOpacity={0.85}
              >
                <Text style={styles.recordBtnIcon}>{isRecording ? '⏹' : '🎙️'}</Text>
                <Text style={styles.recordBtnText}>{isRecording ? 'Stop & Transcribe' : 'Start Recording'}</Text>
              </TouchableOpacity>

              {!isRecording && (
                <Text style={styles.recordHint}>Tap to begin recording your meeting</Text>
              )}
              {isRecording && (
                <Text style={styles.recordHint}>Recording in progress — tap to stop and generate summary</Text>
              )}
            </View>

            {/* Quick notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Quick Notes (optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textInputMulti]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Jot down key points while recording..."
                placeholderTextColor={COLORS.textLight}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* History link */}
            {recordings.length > 0 && (
              <TouchableOpacity style={styles.historyLink} onPress={() => setScreen('history')}>
                <Text style={styles.historyLinkText}>📂 View Past Recordings ({recordings.length})</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={{ height: insets.bottom + 24 }} />
        </ScrollView>
      </View>
    );
  }

  // ── Processing Screen ────────────────────────────────────────────────────────
  if (screen === 'processing') {
    return (
      <View style={[styles.container, styles.processingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.purple} />
        <Text style={styles.processingTitle}>Transcribing your meeting…</Text>
        <Text style={styles.processingSub}>This may take a moment. Please keep the app open.</Text>
      </View>
    );
  }

  // ── Summary Screen ───────────────────────────────────────────────────────────
  if (screen === 'summary' && currentRecording) {
    const SECTIONS = [
      { key: 'decisions', emoji: '✅', label: 'Decisions Made', color: COLORS.mint, textColor: '#0A7A5A', items: currentRecording.summary?.decisions || [] },
      { key: 'actionItems', emoji: '📌', label: 'Action Items', color: COLORS.lavender, textColor: COLORS.purpleDark, items: currentRecording.summary?.actionItems || [] },
      { key: 'nextSteps', emoji: '➡️', label: 'Next Steps', color: COLORS.peach, textColor: '#8A4020', items: currentRecording.summary?.nextSteps || [] },
      { key: 'followUps', emoji: '🔔', label: 'Follow-Up Reminders', color: COLORS.yellow, textColor: '#7A6020', items: currentRecording.summary?.followUps || [] },
    ];

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setScreen('gate'); setCurrentRecording(null); setMeetingName(''); setNotes(''); setRecordingDuration(0); }} style={styles.backBtn}>
            <Text style={styles.backText}>← Done</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meeting Summary</Text>
          <TouchableOpacity onPress={() => shareRecording(currentRecording)} style={styles.shareBtn}>
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.summaryContent}>
            {/* Header card */}
            <View style={styles.summaryHeaderCard}>
              <Text style={styles.summaryMeetingName}>{currentRecording.meetingName}</Text>
              <View style={styles.summaryMetaRow}>
                <Text style={styles.summaryMeta}>📅 {currentRecording.date}</Text>
                <Text style={styles.summaryMeta}>⏱ {formatDuration(currentRecording.duration)}</Text>
              </View>
              {currentRecording.summary ? (
                <View style={styles.successBanner}>
                  <Text style={styles.successBannerText}>✓ Transcription & Summary Complete</Text>
                </View>
              ) : (
                <View style={styles.warningBanner}>
                  <Text style={styles.warningBannerText}>⚠️ Transcription unavailable — audio saved</Text>
                </View>
              )}
            </View>

            {/* Summary sections */}
            {currentRecording.summary && SECTIONS.map(section => (
              <TouchableOpacity
                key={section.key}
                style={[styles.summarySection, { backgroundColor: section.color, borderLeftColor: section.textColor }]}
                onPress={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
                activeOpacity={0.85}
              >
                <View style={styles.summarySectionHeader}>
                  <Text style={styles.summarySectionEmoji}>{section.emoji}</Text>
                  <Text style={[styles.summarySectionTitle, { color: section.textColor }]}>{section.label}</Text>
                  <Text style={[styles.summarySectionCount, { color: section.textColor }]}>{section.items.length}</Text>
                  <Text style={[styles.summaryChevron, { color: section.textColor }]}>{expandedSection === section.key ? '▲' : '▼'}</Text>
                </View>
                {expandedSection === section.key && section.items.length > 0 && (
                  <View style={styles.summarySectionItems}>
                    {section.items.map((item, i) => (
                      <View key={i} style={styles.summaryItem}>
                        <Text style={[styles.summaryItemBullet, { color: section.textColor }]}>•</Text>
                        <Text style={[styles.summaryItemText, { color: section.textColor }]}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {expandedSection === section.key && section.items.length === 0 && (
                  <Text style={[styles.summaryEmpty, { color: section.textColor }]}>None identified in this meeting.</Text>
                )}
              </TouchableOpacity>
            ))}

            {/* Notes */}
            {currentRecording.notes ? (
              <View style={styles.notesCard}>
                <Text style={styles.notesTitle}>📝 Your Notes</Text>
                <Text style={styles.notesText}>{currentRecording.notes}</Text>
              </View>
            ) : null}

            {/* Full transcript toggle */}
            <TouchableOpacity
              style={styles.transcriptToggle}
              onPress={() => setExpandedSection(expandedSection === 'transcript' ? null : 'transcript')}
              activeOpacity={0.8}
            >
              <Text style={styles.transcriptToggleText}>
                {expandedSection === 'transcript' ? '▲ Hide Full Transcript' : '▼ View Full Transcript'}
              </Text>
            </TouchableOpacity>
            {expandedSection === 'transcript' && (
              <View style={styles.transcriptBox}>
                <Text style={styles.transcriptText}>{currentRecording.transcript}</Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.summaryActions}>
              <TouchableOpacity style={styles.shareFullBtn} onPress={() => shareRecording(currentRecording)} activeOpacity={0.85}>
                <Text style={styles.shareFullBtnText}>📤 Share Summary</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.historyBtn} onPress={() => setScreen('history')} activeOpacity={0.85}>
                <Text style={styles.historyBtnText}>📂 All Recordings</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ height: insets.bottom + 24 }} />
        </ScrollView>
      </View>
    );
  }

  // ── History Screen ───────────────────────────────────────────────────────────
  if (screen === 'history') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setScreen('gate')} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Past Recordings</Text>
          <View style={{ width: 60 }} />
        </View>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {recordings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎙️</Text>
              <Text style={styles.emptyTitle}>No recordings yet</Text>
              <Text style={styles.emptySub}>Your saved meeting recordings will appear here.</Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {recordings.map(rec => (
                <TouchableOpacity
                  key={rec.id}
                  style={styles.historyCard}
                  onPress={() => { setCurrentRecording(rec); setScreen('summary'); }}
                  activeOpacity={0.85}
                >
                  <View style={styles.historyCardLeft}>
                    <Text style={styles.historyCardName}>{rec.meetingName}</Text>
                    <Text style={styles.historyCardMeta}>{rec.date} · {formatDuration(rec.duration)}</Text>
                    {rec.summary && (
                      <Text style={styles.historyCardSummary}>
                        {rec.summary.decisions.length} decisions · {rec.summary.actionItems.length} action items
                      </Text>
                    )}
                  </View>
                  <Text style={styles.historyCardArrow}>→</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={{ height: insets.bottom + 24 }} />
        </ScrollView>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { paddingVertical: 4, minWidth: 60 },
  backText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },
  shareBtn: { paddingVertical: 4, minWidth: 60, alignItems: 'flex-end' },
  shareText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },

  // Premium gate
  premiumGate: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xxxl },
  gateIcon: { fontSize: 56, marginBottom: SPACING.lg },
  gateTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.sm },
  gateSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', lineHeight: 20, marginBottom: SPACING.xl },
  gateBullets: { width: '100%', marginBottom: SPACING.xl },
  gateBulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
  gateBulletCheck: { color: COLORS.purple, fontWeight: '700', fontSize: FONT_SIZES.sm },
  gateBulletText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textMid },
  gateBtn: { backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xxxl, ...SHADOWS.lg },
  gateBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },

  // Legal gate
  gateContent: { padding: SPACING.lg },
  micIconWrap: { alignItems: 'center', marginBottom: SPACING.lg, marginTop: SPACING.md },
  micIcon: { fontSize: 56 },
  gateHeading: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.sm },
  gateIntro: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', lineHeight: 20, marginBottom: SPACING.xl },
  legalBox: {
    backgroundColor: '#FFF3CD', borderRadius: RADIUS.sm, padding: SPACING.lg,
    borderWidth: 1, borderColor: '#F5C842', marginBottom: SPACING.lg,
  },
  legalBoxTitle: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: '#7A5A00', marginBottom: SPACING.sm },
  legalBoxText: { fontSize: FONT_SIZES.xs, color: '#7A5A00', lineHeight: 18 },
  confirmCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
    backgroundColor: COLORS.white, borderRadius: RADIUS.sm, padding: SPACING.lg,
    borderWidth: 2, borderColor: COLORS.border, marginBottom: SPACING.md, ...SHADOWS.sm,
  },
  confirmCardChecked: { borderColor: COLORS.purple, backgroundColor: COLORS.lavender },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
  checkboxChecked: { backgroundColor: COLORS.purple, borderColor: COLORS.purple },
  checkmark: { color: COLORS.white, fontSize: 13, fontWeight: '800' },
  confirmText: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  learnMoreLink: { alignItems: 'center', marginBottom: SPACING.xl },
  learnMoreText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  proceedBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.sm, paddingVertical: SPACING.lg,
    alignItems: 'center', ...SHADOWS.lg, marginBottom: SPACING.md,
  },
  proceedBtnDisabled: { backgroundColor: COLORS.border },
  proceedBtnText: { color: COLORS.white, fontSize: FONT_SIZES.md, fontWeight: '800' },
  historyLink: { alignItems: 'center', paddingVertical: SPACING.md },
  historyLinkText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },

  // Recording screen
  recordContent: { padding: SPACING.lg },
  inputGroup: { marginBottom: SPACING.lg },
  inputLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  textInput: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, fontSize: FONT_SIZES.sm, color: COLORS.text,
  },
  textInputMulti: { height: 100, paddingTop: SPACING.md },
  dateBadge: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.pill, paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg, alignSelf: 'center', marginBottom: SPACING.xl,
  },
  dateBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.purpleDark },
  recordCenter: { alignItems: 'center', marginBottom: SPACING.xl, paddingVertical: SPACING.xl },
  recBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  recDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444' },
  recLabel: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: '#EF4444' },
  recTimer: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, fontVariant: ['tabular-nums'] },
  recordBtn: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.purple,
    alignItems: 'center', justifyContent: 'center', ...SHADOWS.lg, marginBottom: SPACING.lg,
  },
  recordBtnActive: { backgroundColor: '#EF4444' },
  recordBtnIcon: { fontSize: 36, marginBottom: 4 },
  recordBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.white, textAlign: 'center' },
  recordHint: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, textAlign: 'center' },

  // Processing
  processingContainer: { alignItems: 'center', justifyContent: 'center', gap: SPACING.lg },
  processingTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text },
  processingSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center', paddingHorizontal: SPACING.xl },

  // Summary
  summaryContent: { padding: SPACING.lg },
  summaryHeaderCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.sm, padding: SPACING.lg,
    marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  summaryMeetingName: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  summaryMetaRow: { flexDirection: 'row', gap: SPACING.lg, marginBottom: SPACING.md },
  summaryMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textMid },
  successBanner: { backgroundColor: COLORS.mint, borderRadius: RADIUS.xs, paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md },
  successBannerText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#0A7A5A' },
  warningBanner: { backgroundColor: COLORS.yellow, borderRadius: RADIUS.xs, paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md },
  warningBannerText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#7A6020' },
  summarySection: {
    borderRadius: RADIUS.sm, padding: SPACING.lg, marginBottom: SPACING.md, borderLeftWidth: 4,
  },
  summarySectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  summarySectionEmoji: { fontSize: 18 },
  summarySectionTitle: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '800' },
  summarySectionCount: { fontSize: FONT_SIZES.sm, fontWeight: '700', marginRight: SPACING.xs },
  summaryChevron: { fontSize: 10 },
  summarySectionItems: { marginTop: SPACING.md, gap: SPACING.sm },
  summaryItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  summaryItemBullet: { fontSize: FONT_SIZES.sm, fontWeight: '700', marginTop: 1 },
  summaryItemText: { flex: 1, fontSize: FONT_SIZES.sm, lineHeight: 19 },
  summaryEmpty: { marginTop: SPACING.sm, fontSize: FONT_SIZES.sm, fontStyle: 'italic' },
  notesCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.sm, padding: SPACING.lg,
    marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
  },
  notesTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  notesText: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, lineHeight: 19 },
  transcriptToggle: { alignItems: 'center', paddingVertical: SPACING.md, marginBottom: SPACING.sm },
  transcriptToggleText: { color: COLORS.purple, fontSize: FONT_SIZES.sm, fontWeight: '600' },
  transcriptBox: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.sm, padding: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg,
  },
  transcriptText: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, lineHeight: 18 },
  summaryActions: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  shareFullBtn: {
    flex: 1, backgroundColor: COLORS.purple, borderRadius: RADIUS.sm,
    paddingVertical: SPACING.md, alignItems: 'center', ...SHADOWS.md,
  },
  shareFullBtnText: { color: COLORS.white, fontSize: FONT_SIZES.sm, fontWeight: '700' },
  historyBtn: {
    flex: 1, backgroundColor: COLORS.lavender, borderRadius: RADIUS.sm,
    paddingVertical: SPACING.md, alignItems: 'center',
  },
  historyBtnText: { color: COLORS.purpleDark, fontSize: FONT_SIZES.sm, fontWeight: '700' },

  // History
  historyList: { padding: SPACING.lg, gap: SPACING.sm },
  historyCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.sm, padding: SPACING.lg,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  historyCardLeft: { flex: 1 },
  historyCardName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  historyCardMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginBottom: 3 },
  historyCardSummary: { fontSize: FONT_SIZES.xs, color: COLORS.purple, fontWeight: '600' },
  historyCardArrow: { fontSize: 18, color: COLORS.textLight },

  // Empty state
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80, paddingHorizontal: SPACING.xl },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.lg },
  emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  emptySub: { fontSize: FONT_SIZES.sm, color: COLORS.textMid, textAlign: 'center' },
});
