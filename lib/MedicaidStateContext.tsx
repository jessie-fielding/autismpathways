import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { MedicaidStateData, MEDICAID_STATES } from './medicaidStates';

const STORAGE_KEY = 'medicaid_selected_state';

interface MedicaidStateContextValue {
  selectedStateCode: string | null;
  stateData: MedicaidStateData | null;
  setSelectedState: (code: string) => Promise<void>;
  clearSelectedState: () => Promise<void>;
}

const MedicaidStateContext = createContext<MedicaidStateContextValue>({
  selectedStateCode: null,
  stateData: null,
  setSelectedState: async () => {},
  clearSelectedState: async () => {},
});

export function MedicaidStateProvider({ children }: { children: React.ReactNode }) {
  const [selectedStateCode, setSelectedStateCode] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((code) => {
      if (code && MEDICAID_STATES[code]) {
        setSelectedStateCode(code);
      }
    });
  }, []);

  const setSelectedState = async (code: string) => {
    await AsyncStorage.setItem(STORAGE_KEY, code);
    setSelectedStateCode(code);
  };

  const clearSelectedState = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setSelectedStateCode(null);
  };

  const stateData = selectedStateCode ? MEDICAID_STATES[selectedStateCode] ?? null : null;

  return (
    <MedicaidStateContext.Provider
      value={{ selectedStateCode, stateData, setSelectedState, clearSelectedState }}
    >
      {children}
    </MedicaidStateContext.Provider>
  );
}

export function useMedicaidState() {
  return useContext(MedicaidStateContext);
}
