import React, { createContext, useContext, useState } from 'react';

export type PmipProviderState = {
  childNickname: string;
  childAge: string;
  autismDxStatus: 'yes' | 'no' | 'in_progress' | 'suspected' | null;
  additionalDx: string[];
  communicationNotes: string;
  sensoryNotes: string;
  dailyNotes: string;
  motorLearningNotes: string;
  providerDocNotes: string;
  providerFocusAreas: string[];
};

type PmipContextType = {
  state: PmipProviderState;
  setState: (partial: Partial<PmipProviderState>) => void;
};

const PmipContext = createContext<PmipContextType | undefined>(undefined);

export function PmipProviderStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setStateLocal] = useState<PmipProviderState>({
    childNickname: '',
    childAge: '',
    autismDxStatus: null,
    additionalDx: [],
    communicationNotes: '',
    sensoryNotes: '',
    dailyNotes: '',
    motorLearningNotes: '',
    providerDocNotes: '',
    providerFocusAreas: [],
  });

  const setState = (partial: Partial<PmipProviderState>) => {
    setStateLocal((prev) => ({ ...prev, ...partial }));
  };

  return (
    <PmipContext.Provider value={{ state, setState }}>
      {children}
    </PmipContext.Provider>
  );
}

export function usePmipProviderStore() {
  const context = useContext(PmipContext);
  if (!context) {
    throw new Error('usePmipProviderStore must be used within PmipProviderStoreProvider');
  }
  return context.state;
}

export function usePmipProviderStoreActions() {
  const context = useContext(PmipContext);
  if (!context) {
    throw new Error('usePmipProviderStoreActions must be used within PmipProviderStoreProvider');
  }
  return context.setState;
}
