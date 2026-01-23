import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface TranslationContextType {
  t: (key: string) => string;
  language: string;
  setLanguage: (lang: string) => void;
  isLoading: boolean;
  allTranslations: Record<string, string>;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
}

// Translation component that displays the translation or the key if missing
export function Translation({ translationKey }: { translationKey: string }) {
  const context = useContext(TranslationContext);
  if (!context) throw new Error('Translation must be used within TranslationProvider');

  const { t } = context;
  const translation = t(translationKey);

  // If translation exists, return it as a string
  if (translation !== translationKey) {
    return <>{translation}</>;
  }

  // If translation is missing, just display the key itself
  return <>{translationKey}</>;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [language, setLanguageState] = useState('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [allTranslations, setAllTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load translations for the current language
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/translations/${language}`);
        if (response.ok) {
          const data = await response.json();
          setTranslations(data);
          setAllTranslations(data);
        } else {
          console.error('Failed to load translations');
          // Fallback to empty translations
          setTranslations({});
          setAllTranslations({});
        }
      } catch (error) {
        console.error('Error loading translations:', error);
        setTranslations({});
        setAllTranslations({});
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  // Save language preference to localStorage
  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('preferred-language', lang);
  };

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && ['en', 'bn'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const t = (key: string): string => {
    // If we have a translation for this key, return it
    if (translations[key]) {
      return translations[key];
    }

    // If we're still loading, return the key
    if (isLoading) {
      return key;
    }

    // If no translation exists, return the key itself
    // The Translation component will handle showing the fallback UI
    return key;
  };

  const value: TranslationContextType = {
    t,
    language,
    setLanguage,
    isLoading,
    allTranslations,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}