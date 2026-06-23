import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { trackDiagnosisPathwayOpened, logScreenView, useScreenTime } from '../../lib/analytics';
export default function DiagnosisPathwayTab() {
  useScreenTime('diagnosis_pathway');
  useEffect(() => { logScreenView('diagnosis_pathway'); trackDiagnosisPathwayOpened(); }, []);
  return <Redirect href="/diagnosis" />;
}
