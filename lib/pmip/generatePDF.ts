import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { PmipProviderState } from './pmipProviderStore';

export async function generateAndSharePDF(state: PmipProviderState) {
  const displayName = state.childNickname?.trim() || 'Your child';

  const headlineBits: string[] = [];
  if (state.childAge) headlineBits.push(`${state.childAge}-year-old`);
  if (state.autismDxStatus === 'yes') headlineBits.push('autistic');
  if (state.autismDxStatus === 'in_progress') headlineBits.push('in autism evaluation');
  if (state.autismDxStatus === 'suspected') headlineBits.push('autism suspected');
  const headline = headlineBits.length > 0 ? headlineBits.join(' • ') : 'Child details';

  const dxLabels = state.additionalDx.length
    ? state.additionalDx
        .map((k) => {
          const labels: Record<string, string> = {
            adhd: 'ADHD',
            anxiety: 'Anxiety',
            id: 'Intellectual disability',
            dev_delay: 'Developmental delay',
            speech_delay: 'Speech/language delay',
            sensory: 'Sensory processing differences',
            epilepsy: 'Epilepsy/seizures',
            sleep: 'Sleep disorder/concerns',
            gi_feeding: 'Feeding/GI issues',
            other: 'Other mental health or medical diagnoses',
          };
          return labels[k] || null;
        })
        .filter(Boolean)
        .join(', ')
    : '';

  const isFocus = (key: string) => state.providerFocusAreas.includes(key);

  const focusAreas = [
    { key: 'diagnoses_icd', label: 'Diagnoses and ICD codes' },
    { key: 'daily_living', label: 'Daily living and self-care' },
    { key: 'safety', label: 'Safety and supervision' },
    { key: 'sensory_reg', label: 'Sensory and regulation' },
    { key: 'motor_learning', label: 'Motor and learning' },
    { key: 'school_docs', label: 'School and therapy reports' },
    { key: 'letters_forms', label: 'Letters and forms' },
    { key: 'next_evals', label: 'Next evaluations' },
    { key: 'not_sure', label: 'Not sure what to prioritize' },
  ]
    .filter((a) => isFocus(a.key))
    .map((a) => a.label)
    .join('<li>')
    .replace(/^/, '<li>');

  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #374151; }
          h1 { color: #1e1b4b; font-size: 24px; margin-bottom: 8px; }
          h2 { color: #1e1b4b; font-size: 18px; margin-top: 20px; margin-bottom: 10px; border-bottom: 2px solid #6d28d9; padding-bottom: 5px; }
          p { line-height: 1.6; margin: 10px 0; }
          .subtitle { color: #6b7280; font-style: italic; margin-bottom: 20px; }
          .success-badge { background: #d1fae5; color: #065f46; padding: 10px; border-radius: 8px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          ul { margin: 10px 0 10px 20px; padding: 0; }
          li { margin: 5px 0; }
          .italic { font-style: italic; }
          .bold { font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>Provider Preparation Summary</h1>
        <p class="subtitle">Prepared on ${new Date().toLocaleDateString()}</p>
        
        <div class="success-badge">
          ✓ You're better prepared for your provider visit. Use this summary to ensure key information is documented.
        </div>

        <div class="section">
          <h2>How Your Child Is Doing</h2>
          <p><span class="bold">${displayName}</span> is ${headline}.</p>
          ${dxLabels ? `<p>Other diagnoses: ${dxLabels}</p>` : ''}
        </div>

        <div class="section">
          <h2>Areas to Discuss and Document</h2>
          <p>Provider should focus on documenting:</p>
          <ul>${focusAreas}</ul>
        </div>

        ${
          state.communicationNotes
            ? `<div class="section">
            <h2>Communication & Social</h2>
            <p>${state.communicationNotes}</p>
          </div>`
            : ''
        }

        ${
          state.sensoryNotes
            ? `<div class="section">
            <h2>Sensory & Regulation</h2>
            <p>${state.sensoryNotes}</p>
          </div>`
            : ''
        }

        ${
          state.dailyNotes
            ? `<div class="section">
            <h2>Daily Living & Functional Needs</h2>
            <p>${state.dailyNotes}</p>
          </div>`
            : ''
        }

        ${
          state.motorLearningNotes
            ? `<div class="section">
            <h2>Motor, Learning & School</h2>
            <p>${state.motorLearningNotes}</p>
          </div>`
            : ''
        }

        ${
          state.providerDocNotes
            ? `<div class="section">
            <h2>Provider Documentation Notes</h2>
            <p>${state.providerDocNotes}</p>
          </div>`
            : ''
        }

        <p style="margin-top: 40px; border-top: 1px solid #d1d5db; padding-top: 20px; color: #6b7280; font-size: 12px;">
          This summary was generated by Autism Pathways. Bring this to your provider visit or share digitally.
        </p>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      fileName: `PMIP-Summary-${displayName}-${new Date().getTime()}`,
    });

    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share Provider Summary',
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
