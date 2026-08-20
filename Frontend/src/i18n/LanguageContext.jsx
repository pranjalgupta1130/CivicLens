import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from './en';
import { hi } from './hi';
import { mr } from './mr';
import { ta } from './ta';
import { bn } from './bn';
import { te } from './te';
import { gu } from './gu';
import { kn } from './kn';
import { ml } from './ml';
import { pa } from './pa';
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS } from '../utils/translations';

const translations = { en, hi, mr, ta, bn, te, gu, kn, ml, pa };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('civiclens_lang') || 'en';
  });

  const setLang = (code) => {
    setLangState(code);
    localStorage.setItem('civiclens_lang', code);
  };

  useEffect(() => {
    localStorage.setItem('civiclens_lang', lang);
  }, [lang]);

  const currentDict = translations[lang] || translations.en;
  const currentLangConfig = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];

  // Callable function t(key, fallback) that ALSO has all translation properties attached
  const translateFn = (key, fallback = '') => {
    if (currentDict && currentDict[key] !== undefined) {
      return currentDict[key];
    }
    if (UI_TRANSLATIONS && UI_TRANSLATIONS[key]) {
      if (UI_TRANSLATIONS[key][lang]) return UI_TRANSLATIONS[key][lang];
      if (UI_TRANSLATIONS[key]['en']) return UI_TRANSLATIONS[key]['en'];
    }
    if (translations.en && translations.en[key] !== undefined) {
      return translations.en[key];
    }
    return fallback || key;
  };

  // Attach key properties directly to translateFn so t.property access works seamlessly
  const t = Object.assign(translateFn, currentDict);

  return (
    <LanguageContext.Provider value={{
      lang,
      setLang,
      selectedLang: lang,
      setSelectedLang: setLang,
      currentLangConfig,
      SUPPORTED_LANGUAGES,
      t
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
