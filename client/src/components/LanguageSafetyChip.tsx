import React from 'react';
import { useAudio } from '../context/AudioContext';
import { LANGUAGES } from '../utils/translations';
import { LanguageCode } from '../types';

const SAFETY_CHIP_PROMPTS: Record<LanguageCode, string> = {
  te: 'నేను తెలుగులో మాట్లాడుతున్నాను. ఇది తప్పు అయితే, మీ భాషను ఎంచుకోండి.',
  hi: 'मैं हिन्दी में बोल रही हूँ. यदि यह गलत है, तो अपनी भाषा चुनें.',
  ta: 'நான் தமிழில் பேசுகிறேன். இது தவறாக இருந்தால், உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்.',
  kn: 'ನಾನು ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ. ಇದು ತಪ್ಪಾಗಿದ್ದರೆ, ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
  ml: 'ഞാൻ മലയാളത്തിലാണ് സംസാരിക്കുന്നത്. ഇത് തെറ്റാണെങ്കിൽ, നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കൂ.',
  bn: 'আমি বাংলায় কথা বলছি. এটি ভুল হলে, আপনার ভাষা বেছে নিন.',
  mr: 'मी मराठीत बोलत आहे. हे चुकीचे असल्यास, आपली भाषा निवडा.',
  en: 'I am speaking English. If this is wrong, choose your language.',
};

export const LanguageSafetyChip: React.FC<{
  language: LanguageCode | 'none';
  onOpenGrid: () => void;
}> = ({ language, onOpenGrid }) => {
  const { speak } = useAudio();
  const effectiveLang: LanguageCode = language === 'none' ? 'en' : language;
  const langInfo = LANGUAGES[effectiveLang] || LANGUAGES.en;

  const handleChipClick = () => {
    const prompt = SAFETY_CHIP_PROMPTS[effectiveLang] || SAFETY_CHIP_PROMPTS.en;
    speak(prompt, effectiveLang);
    onOpenGrid();
  };

  return (
    <button
      type="button"
      onClick={handleChipClick}
      aria-label={`Current language: ${langInfo.name}. Tap to hear audio and change language if wrong.`}
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-20 bg-surface-container-high hover:bg-surface-container-highest border border-primary/20 text-ink shadow-xs active:scale-95 transition-all text-left"
    >
      <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-[16px]">volume_up</span>
      </div>
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-primary">{langInfo.nativeName}</span>
          <span className="text-[10px] text-muted">({langInfo.name})</span>
        </div>
        <span className="text-[10px] text-muted leading-none">
          భాష మార్చడానికి నొక్కండి • Tap to change
        </span>
      </div>
      <span className="material-symbols-outlined text-muted text-[16px] ml-1">
        expand_more
      </span>
    </button>
  );
};
