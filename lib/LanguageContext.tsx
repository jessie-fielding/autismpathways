/**
 * LanguageContext
 * Provides app-wide language toggle between English and Spanish.
 * Persists the user's choice to AsyncStorage.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (en: string, es: string) => string;
  isSpanish: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (en) => en,
  isSpanish: false,
});

const LANG_KEY = 'ap_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then(val => {
      if (val === 'es' || val === 'en') setLanguageState(val);
    });
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem(LANG_KEY, lang);
  };

  // Inline translation helper: t('English text', 'Texto en español')
  const t = (en: string, es: string): string => language === 'es' ? es : en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isSpanish: language === 'es' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  return useContext(LanguageContext);
}
