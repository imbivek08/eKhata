import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import en from '@/locales/en.json';
import ne from '@/locales/ne.json';

// ── Types ──

export type Language = 'en' | 'ne';

type Translations = typeof en;
type Section = keyof Translations;

const translations: Record<Language, Translations> = { en, ne };

const STORAGE_KEY = 'ekhata_language';

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  ne: 'नेपाली',
};

// ── Context ──

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (section: Section, key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  t: () => '',
});

// ── Provider ──

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');
  const [loaded, setLoaded] = useState(false);

  // Load saved language on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'en' || saved === 'ne') {
        setLangState(saved);
      }
      setLoaded(true);
    });
  }, []);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    AsyncStorage.setItem(STORAGE_KEY, newLang);
  }, []);

  const t = useCallback(
    (section: Section, key: string, params?: Record<string, string | number>): string => {
      const sectionData = translations[lang]?.[section] as Record<string, string> | undefined;
      let text = sectionData?.[key] ?? (translations.en[section] as Record<string, string>)?.[key] ?? key;

      // Replace {param} placeholders
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }

      return text;
    },
    [lang]
  );

  // Don't render children until language is loaded from storage
  if (!loaded) return null;

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// ── Hook ──

export const useI18n = () => useContext(I18nContext);
