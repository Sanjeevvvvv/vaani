import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LanguageCode, LanguageInfo } from '../types';
import { LANGUAGES } from '../utils/translations';
import { getTranslation } from '../utils/i18n';
import { useAudio } from './AudioContext';

export type AppLanguage = LanguageCode | 'none';

interface LanguageContextValue {
  currentLanguage: AppLanguage;
  langInfo: LanguageInfo;
  changeLanguage: (code: LanguageCode, speakConfirmation?: boolean) => void;
  detectedLanguage: LanguageCode | null;
  showConfirmModal: boolean;
  requestLanguageConfirmation: (detectedCode: LanguageCode) => void;
  confirmDetectedLanguage: () => void;
  rejectDetectedLanguage: () => void;
  showLanguageGrid: boolean;
  setShowLanguageGrid: (show: boolean) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const FONT_FAMILIES: Record<LanguageCode, string> = {
  te: "'Noto Sans Telugu', sans-serif",
  hi: "'Noto Sans Devanagari', sans-serif",
  ta: "'Noto Sans Tamil', sans-serif",
  kn: "'Noto Sans Kannada', sans-serif",
  ml: "'Noto Sans Malayalam', sans-serif",
  bn: "'Noto Sans Bengali', sans-serif",
  mr: "'Noto Sans Devanagari', sans-serif",
  en: "'Plus Jakarta Sans', sans-serif",
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<AppLanguage>(() => {
    try {
      const stored = localStorage.getItem('vaani_lang');
      if (stored && ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'bn', 'mr'].includes(stored)) {
        return stored as LanguageCode;
      }
    } catch {}
    return 'none';
  });

  const [detectedLanguage, setDetectedLanguage] = useState<LanguageCode | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLanguageGrid, setShowLanguageGrid] = useState(false);

  const { speak } = useAudio();

  const activeLangCode: LanguageCode =
    currentLanguage === 'none' ? 'en' : currentLanguage;
  const langInfo = LANGUAGES[activeLangCode] || LANGUAGES.en;

  const applyLanguageEffects = (code: AppLanguage) => {
    try {
      if (code !== 'none') {
        document.documentElement.lang = code;
        const font = FONT_FAMILIES[code] || FONT_FAMILIES.en;
        document.body.style.fontFamily = font;
        localStorage.setItem('vaani_lang', code);
      } else {
        document.documentElement.lang = 'en';
        document.body.style.fontFamily = FONT_FAMILIES.en;
      }
    } catch {}
  };

  useEffect(() => {
    applyLanguageEffects(currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (code: LanguageCode, speakConfirmation = false) => {
    setCurrentLanguage(code);
    applyLanguageEffects(code);
    setShowConfirmModal(false);
    setShowLanguageGrid(false);
    setDetectedLanguage(null);

    if (speakConfirmation) {
      const snippet = LANGUAGES[code]?.greetingSnippet || LANGUAGES[code]?.greeting;
      speak(snippet, code);
    }
  };

  const requestLanguageConfirmation = (detectedCode: LanguageCode) => {
    if (detectedCode === currentLanguage) return;
    setDetectedLanguage(detectedCode);
    setShowConfirmModal(true);

    const promptText = getConfirmationSpokenText(detectedCode);
    speak(promptText, detectedCode);
  };

  const confirmDetectedLanguage = () => {
    if (detectedLanguage) {
      changeLanguage(detectedLanguage, true);
    } else {
      setShowConfirmModal(false);
    }
  };

  const rejectDetectedLanguage = () => {
    setShowConfirmModal(false);
    setShowLanguageGrid(true);
  };

  const t = (key: string): string => {
    return getTranslation(activeLangCode, key);
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        langInfo,
        changeLanguage,
        detectedLanguage,
        showConfirmModal,
        requestLanguageConfirmation,
        confirmDetectedLanguage,
        rejectDetectedLanguage,
        showLanguageGrid,
        setShowLanguageGrid,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

function getConfirmationSpokenText(lang: LanguageCode): string {
  switch (lang) {
    case 'te':
      return 'నేను విన్నది తెలుగు. ఇది సరైనదేనా?';
    case 'hi':
      return 'मैंने हिन्दी सुना. क्या यह सही है?';
    case 'ta':
      return 'நான் கேட்டது தமிழ். இது சரியானதா?';
    case 'kn':
      return 'ನಾನು ಕೇಳಿದ್ದು ಕನ್ನಡ. ಇದು ಸರಿಯೇ?';
    case 'ml':
      return 'ഞാൻ കേട്ടത് മലയാളം. ഇത് ശരിയാണോ?';
    case 'bn':
      return 'আমি শুনেছি বাংলা. এটা কি ঠিক?';
    case 'mr':
      return 'मी ऐकले मराठी. हे योग्य आहे का?';
    case 'en':
    default:
      return 'I heard English. Is that right?';
  }
}
