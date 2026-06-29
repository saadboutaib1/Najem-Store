import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { STORE_CONFIG } from '../config/store.js';
import ar from '../i18n/ar.js';
import en from '../i18n/en.js';

const dictionaries = { ar, en };
const supportedLanguages = Object.keys(dictionaries);
const LanguageContext = createContext(null);

function normalizeLanguage(language) {
  return supportedLanguages.includes(language) ? language : STORE_CONFIG.defaultLanguage;
}

function getSavedLanguage() {
  try {
    return normalizeLanguage(localStorage.getItem('najem-language') || STORE_CONFIG.defaultLanguage);
  } catch {
    return STORE_CONFIG.defaultLanguage;
  }
}

function getValue(dictionary, path) {
  const value = path.split('.').reduce((current, key) => current?.[key], dictionary);

  if (value !== undefined) {
    return value;
  }

  return undefined;
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getSavedLanguage);

  useEffect(() => {
    const currentLanguage = normalizeLanguage(language);

    if (currentLanguage !== language) {
      setLanguage(currentLanguage);
      return;
    }

    const direction = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = direction;
    document.body.dir = direction;
    localStorage.setItem('najem-language', currentLanguage);
  }, [language]);

  const value = useMemo(() => {
    const currentLanguage = normalizeLanguage(language);
    const dictionary = dictionaries[currentLanguage] || dictionaries.ar;
    const changeLanguage = (nextLanguage) => {
      setLanguage(normalizeLanguage(nextLanguage));
    };

    return {
      language: currentLanguage,
      direction: currentLanguage === 'ar' ? 'rtl' : 'ltr',
      setLanguage: changeLanguage,
      toggleLanguage: () => setLanguage((current) => (normalizeLanguage(current) === 'ar' ? 'en' : 'ar')),
      t: (path, fallback = path) => getValue(dictionary, path) ?? getValue(dictionaries.ar, path) ?? fallback,
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }

  return context;
}
