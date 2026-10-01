import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAudio } from '../context/AudioContext';
import { LANGUAGES } from '../utils/translations';
import { LanguageCode } from '../types';

export const LanguageModal: React.FC = () => {
  const { currentLanguage, changeLanguage, showLanguageGrid, setShowLanguageGrid } =
    useLanguage();
  const { speak } = useAudio();
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(
    currentLanguage === 'none' ? 'en' : currentLanguage
  );

  if (!showLanguageGrid) return null;

  const handleTileClick = (langCode: LanguageCode) => {
    setSelectedLang(langCode);
    const greeting = LANGUAGES[langCode]?.greetingSnippet || LANGUAGES[langCode]?.greeting;
    speak(greeting, langCode);
  };

  const handleConfirm = () => {
    changeLanguage(selectedLang, true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-md bg-surface rounded-20 shadow-2xl p-5 border border-outline-variant/30 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">translate</span>
            </div>
            <div>
              <h2 id="lang-modal-title" className="font-bold text-lg text-primary leading-tight">
                భాషను ఎంచుకోండి • Choose Language
              </h2>
              <p className="text-xs text-muted">
                Tap speaker to hear greeting aloud
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowLanguageGrid(false)}
            className="w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-ink active:scale-95"
            aria-label="Close language selector"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* 8 Regional Language Tiles Grid */}
        <div className="grid grid-cols-2 gap-3 my-4">
          {(Object.keys(LANGUAGES) as LanguageCode[]).map((code) => {
            const info = LANGUAGES[code];
            const isSelected = selectedLang === code;

            return (
              <div
                key={code}
                role="button"
                tabIndex={0}
                onClick={() => handleTileClick(code)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleTileClick(code);
                }}
                className={`relative flex flex-col justify-between p-3.5 rounded-20 min-h-[130px] border-2 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-surface-container-low border-primary shadow-sm'
                    : 'bg-surface-container-lowest border-transparent hover:border-outline-variant/60 shadow-xs'
                }`}
              >
                {/* Selection & Speaker Row */}
                <div className="flex items-center justify-between w-full mb-2">
                  {isSelected ? (
                    <span className="flex items-center gap-1 bg-primary text-on-primary text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      <span className="material-symbols-outlined text-[13px]">check_circle</span>
                      <span>ఎంపికైంది</span>
                    </span>
                  ) : (
                    <span />
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTileClick(code);
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-secondary text-on-secondary shadow-sm'
                        : 'bg-surface-container-high text-primary hover:bg-surface-container-highest'
                    }`}
                    aria-label={`Listen to ${info.name}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">volume_up</span>
                  </button>
                </div>

                {/* Language Name */}
                <div className="mt-auto">
                  <span
                    className={`font-bold text-xl block leading-tight ${
                      isSelected ? 'text-primary' : 'text-ink'
                    }`}
                  >
                    {info.nativeName}
                  </span>
                  <span className="text-xs text-muted font-medium">{info.name}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tactile Confirm Button */}
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full min-h-btn rounded-full bg-primary hover:bg-primary-hover text-on-primary font-bold text-base flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all"
        >
          <span className="material-symbols-outlined text-[22px]">check</span>
          <span>పూర్తయింది • Confirm Selection</span>
        </button>
      </div>
    </div>
  );
};
