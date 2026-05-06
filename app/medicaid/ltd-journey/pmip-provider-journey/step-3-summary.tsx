import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { usePmipProviderStore } from '../../../../lib/pmip/pmipProviderStore';

function SummaryCard(props: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        marginTop: 16,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>{props.title}</Text>
      {props.description ? (
        <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{props.description}</Text>
      ) : null}
      <View style={{ marginTop: 8 }}>{props.children}</View>
    </View>
  );
}

function CheckItem(props: { checked?: boolean; label: string; sub?: string }) {
  const checked = props.checked ?? false;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 }}>
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          marginRight: 8,
          borderWidth: 1.5,
          borderColor: checked ? '#1d4ed8' : '#d1d5db',
          backgroundColor: checked ? '#1d4ed8' : '#ffffff',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 2,
        }}
      >
        {checked ? (
          <Text style={{ color: '#ffffff', fontSize: 12 }}>✔</Text>
        ) : (
          <Text style={{ color: 'transparent', fontSize: 12 }}>✔</Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            color: '#111827',
            fontWeight: checked ? '600' : '400',
          }}
        >
          {props.label}
        </Text>
        {props.sub ? (
          <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{props.sub}</Text>
        ) : null}
      </View>
    </View>
  );
}

export default function Step3Summary() {
  const router = useRouter();
  const {
    childNickname,
    childAge,
    autismDxStatus,
    additionalDx,
    communicationNotes,
    sensoryNotes,
    dailyNotes,
    motorLearningNotes,
    providerDocNotes,
    providerFocusAreas,
  } = usePmipProviderStore();

  const displayName = childNickname?.trim() || 'your child';

  const headlineBits: string[] = [];
  if (childAge) headlineBits.push(`${childAge}-year-old`);
  if (autismDxStatus === 'yes') headlineBits.push('autistic');
  if (autismDxStatus === 'in_progress') headlineBits.push('in autism evaluation');
  if (autismDxStatus === 'suspected') headlineBits.push('autism suspected');
  const headline =
    headlineBits.length > 0 ? headlineBits.join(' • ') : 'Child details and diagnosis history';

  const dxLabels = additionalDx.length
    ? additionalDx
        .map((k) => {
          switch (k) {
            case 'adhd':
              return 'ADHD';
            case 'anxiety':
              return 'Anxiety';
            case 'id':
              return 'Intellectual disability';
            case 'dev_delay':
              return 'Developmental delay';
            case 'speech_delay':
              return 'Speech/language delay';
            case 'sensory':
              return 'Sensory processing differences';
            case 'epilepsy':
              return 'Epilepsy/seizures';
            case 'sleep':
              return 'Sleep disorder/concerns';
            case 'gi_feeding':
              return 'Feeding/GI issues';
            case 'other':
              return 'Other mental health or medical diagnoses';
            default:
              return null;
          }
        })
        .filter(Boolean)
        .join(', ')
    : '';

  const hasHistoryNotes =
    !!communicationNotes || !!sensoryNotes || !!dailyNotes || !!motorLearningNotes || !!providerDocNotes;

  const isFocus = (key: string) => providerFocusAreas.includes(key);

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
      >
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 }}>
          You’re better prepared for your visit
        </Text>
        <Text style={{ fontSize: 14, color: '#4b5563', marginBottom: 12 }}>
          This page pulls together key points you can review with your provider so they can help
          document your child’s needs for Medicaid or disability.
        </Text>

        <SummaryCard
          title="How your child is doing"
          description="You can share this quick snapshot out loud or show your provider this screen."
        >
          <Text style={{ fontSize: 14, color: '#111827' }}>
            {displayName} is {headline}.
          </Text>
          {dxLabels ? (
            <Text style={{ fontSize: 13, color: '#4b5563', marginTop: 4 }}>
              Other diagnoses or concerns noted: {dxLabels}.
            </Text>
          ) : null}
        </SummaryCard>

        <SummaryCard
          title="Areas to discuss and document"
          description="These are common “boxes to check” in the chart when providers support Medicaid or disability paperwork."
        >
          <CheckItem
            checked={isFocus('diagnoses_icd')}
            label="Diagnoses and ICD codes that match my child’s profile"
            sub="Clear diagnoses and accurate codes that reflect autism and any co-occurring conditions."
          />
          <CheckItem
            checked={isFocus('daily_living')}
            label="Daily living and self-care needs"
            sub="How much support your child needs with toileting, feeding, hygiene, and daily routines."
          />
          <CheckItem
            checked={isFocus('safety')}
            label="Safety risks, elopement, and supervision"
            sub="If your child wanders, runs off, or cannot be safely left alone."
          />
          <CheckItem
            checked={isFocus('sensory_reg')}
            label="Sensory and regulation challenges"
            sub="Meltdowns, shutdowns, sensory overload, and what helps or makes things worse."
          />
          <CheckItem
            checked={isFocus('motor_learning')}
            label="Motor, coordination, and learning differences"
            sub="Fine/gross motor skills, processing speed, and attention/learning needs."
          />
          <CheckItem
            checked={isFocus('school_docs')}
            label="School and therapy reports"
            sub="IEPs, 504 plans, behavior plans, and therapy notes that support disability documentation."
          />
          <CheckItem
            checked={isFocus('letters_forms')}
            label="Letters, forms, or supporting documents"
            sub="What you might need for Medicaid, waivers, or disability benefits applications."
          />
          <CheckItem
            checked={isFocus('next_evals')}
            label="Next evaluations or testing"
            sub="Any additional assessments (adaptive skills, cognitive testing, updated autism evals) that may strengthen documentation."
          />
          <CheckItem
            checked={isFocus('not_sure')}
            label="I’m not sure what needs to be in the chart"
            sub="Ask your provider to walk through what Medicaid or disability programs usually look for."
          />
        </SummaryCard>

        <SummaryCard
          title="Notes that might help your provider"
          description="These are pulled from what you shared. You can point to any section that feels most important."
        >
          {hasHistoryNotes ? (
            <>
              {communicationNotes ? (
                <Text style={{ fontSize: 13, color: '#111827', marginTop: 4 }}>
                  • Communication & social: {communicationNotes}
                </Text>
              ) : null}
              {sensoryNotes ? (
                <Text style={{ fontSize: 13, color: '#111827', marginTop: 4 }}>
                  • Sensory & regulation: {sensoryNotes}
                </Text>
              ) : null}
              {dailyNotes ? (
                <Text style={{ fontSize: 13, color: '#111827', marginTop: 4 }}>
                  • Daily living & safety: {dailyNotes}
                </Text>
              ) : null}
              {motorLearningNotes ? (
                <Text style={{ fontSize: 13, color: '#111827', marginTop: 4 }}>
                  • Motor & learning: {motorLearningNotes}
                </Text>
              ) : null}
              {providerDocNotes ? (
                <Text style={{ fontSize: 13, color: '#111827', marginTop: 4 }}>
                  • Provider paperwork focus: {providerDocNotes}
                </Text>
              ) : null}
            </>
          ) : (
            <Text style={{ fontSize: 13, color: '#6b7280' }}>
              If you add notes in earlier sections, they’ll appear here as quick talking points.
            </Text>
          )}
        </SummaryCard>

        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
            You can keep this screen open during your visit, or use it as a guide when asking your
            provider to “check these boxes” in your chart and paperwork.
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/pmip-provider-journey/step-2-quiz')}
            style={{
              paddingVertical: 12,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: '#9ca3af',
              backgroundColor: '#ffffff',
            }}
          >
            <Text style={{ textAlign: 'center', fontWeight: '500', color: '#111827' }}>
              Go back and edit answers
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}