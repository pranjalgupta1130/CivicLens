import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, UI_TRANSLATIONS } from '../utils/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [selectedLang, setSelectedLangState] = useState(() => {
    return localStorage.getItem('civiclens_lang') || 'en';
  });

  const setSelectedLang = (code) => {
    setSelectedLangState(code);
    localStorage.setItem('civiclens_lang', code);
  };

  const currentLangConfig = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

  const t = (key, fallback = '') => {
    if (UI_TRANSLATIONS[key] && UI_TRANSLATIONS[key][selectedLang]) {
      return UI_TRANSLATIONS[key][selectedLang];
    }
    if (UI_TRANSLATIONS[key] && UI_TRANSLATIONS[key]['en']) {
      return UI_TRANSLATIONS[key]['en'];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ selectedLang, setSelectedLang, currentLangConfig, t, SUPPORTED_LANGUAGES }}>
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
