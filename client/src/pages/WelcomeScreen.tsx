import React from 'react';
import { useAudio } from '../context/AudioContext';
import { useLanguage } from '../context/LanguageContext';
import { CivicTrustBanner } from '../components/CivicTrustBanner';

interface WelcomeScreenProps {
  onEnterApp: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnterApp }) => {
  const { isUnlocked, unlockAudio, speak, isPlaying } = useAudio();
  const { langInfo, currentLanguage, setShowLanguageGrid, t } = useLanguage();
  const activeLang = currentLanguage === 'none' ? 'en' : currentLanguage;

  const handleOrbTap = async () => {
    if (!isUnlocked) {
      unlockAudio();
    }

    // Request initial mic permission gracefully on first tap
    try {
      if (navigator?.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch {}

    // Speak welcoming greeting in current language
    speak(langInfo.greeting, activeLang);
    onEnterApp();
  };

  const handleHearAgain = () => {
    if (!isUnlocked) {
      unlockAudio();
    }
    speak(langInfo.greeting, activeLang);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 py-3 select-none min-h-[calc(100vh-70px)] justify-between">
      {/* Top Identity & Welcome Banner */}
      <div className="flex flex-col items-center text-center mt-1">
        {/* Floating Sound On Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high text-primary shadow-xs mb-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
          </span>
          <span className="material-symbols-outlined text-[18px]">volume_up</span>
          <span className="text-xs font-bold text-ink">Sound ON</span>
        </div>

        <h1 className="text-2xl font-bold text-primary tracking-tight">
          {currentLanguage === 'none' ? 'Welcome • వాణి' : `${langInfo.nativeName} (${langInfo.name})`}
        </h1>
        <p className="text-sm text-muted mt-0.5">
          {t('tagline')}
        </p>
      </div>

      {/* Center Tactile Voice Orb (230px Touch Target) */}
      <div className="flex flex-col items-center justify-center my-4 relative">
        <div className="relative flex items-center justify-center w-72 h-72">
          {/* Outer Breathing Radiance Glow */}
          <div
            className={`absolute w-72 h-72 rounded-full bg-tertiary-fixed-dim/25 transition-transform duration-700 pointer-events-none ${
              isPlaying ? 'animate-ping' : 'animate-pulse'
            }`}
          />
          <div className="absolute w-64 h-64 rounded-full bg-tertiary-fixed/35 pointer-events-none" />

          {/* Master Tactile Orb Button */}
          <button
            type="button"
            onClick={handleOrbTap}
            aria-label="వాణిని వినండి - మాట్లాడటానికి ఇక్కడ నొక్కండి (Tap here to listen to Vaani)"
            className="relative w-56 h-56 rounded-full bg-primary-container flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all duration-200 cursor-pointer overflow-hidden p-2 group focus:outline-none"
          >
            {/* Subtle Kolam / Geometric Overlay */}
            <svg
              className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
              fill="none"
              viewBox="0 0 200 200"
              aria-hidden="true"
            >
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="currentColor"
                strokeDasharray="6 6"
                strokeWidth="2"
                className="text-on-primary-container"
              />
              <circle
                cx="100"
                cy="100"
                r="70"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-on-primary-container"
              />
              <path
                d="M100 10 L100 190 M10 100 L190 100 M36 36 L164 164 M36 164 L164 36"
                stroke="currentColor"
                strokeWidth="0.75"
                className="text-on-primary-container"
              />
            </svg>

            {/* Elder Sister Guide Illustration Avatar */}
            <div className="relative w-36 h-36 rounded-full overflow-hidden shadow-inner flex items-center justify-center bg-surface-container-low mb-1 border-2 border-primary-fixed-dim/40">
              <svg
                viewBox="0 0 120 120"
                className="w-full h-full object-cover"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Dignified Indian Civic Guide Sister smiling warmly in Namaste greeting"
              >
                <circle cx="60" cy="60" r="58" fill="#FFF1D6" />
                {/* Face & Hair */}
                <circle cx="60" cy="48" r="26" fill="#F2A33A" opacity="0.3" />
                <circle cx="60" cy="46" r="22" fill="#FBD8B3" />
                {/* Hair bun */}
                <path d="M38 46c0-12 10-22 22-22s22 10 22 22c0 2-2 4-5 4H43c-3 0-5-2-5-4z" fill="#27313C" />
                {/* Bindi */}
                <circle cx="60" cy="42" r="2.2" fill="#C8553D" />
                {/* Eyes & Smile */}
                <path d="M49 46q3 2 6 0M65 46q3 2 6 0" stroke="#1F2933" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M54 55q6 5 12 0" stroke="#C8553D" strokeWidth="2" strokeLinecap="round" fill="none" />
                {/* Saree & Namaste Hands */}
                <path d="M30 110c0-26 14-44 30-44s30 18 30 44z" fill="#0F5C63" />
                <path d="M38 110c5-18 16-30 22-30 8 0 16 12 22 30z" fill="#F2A33A" />
                {/* Namaste hands */}
                <path d="M56 70l4-8 4 8c0 4-2 7-4 7s-4-3-4-7z" fill="#FBD8B3" stroke="#C8553D" strokeWidth="1" />
              </svg>
            </div>

            {/* Audio Wave Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest/95 shadow-xs">
              <span className="material-symbols-outlined text-secondary text-base animate-bounce">
                mic
              </span>
              <span className="text-xs font-bold text-primary">మాట్లాడండి • Tap</span>
            </div>

            {/* Rim Audio Badge */}
            <div className="absolute -top-1 -right-1 w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-[24px]">volume_up</span>
            </div>
          </button>
        </div>

        {/* Spoken Action Callout */}
        <div className="flex flex-col items-center text-center mt-3 px-2">
          <h2 className="text-lg font-bold text-ink leading-snug">
            ఇక్కడ తాకండి, వాణి మీతో మాట్లాడుతుంది
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Tap anywhere on the circle to start listening
          </p>

          <button
            type="button"
            onClick={handleHearAgain}
            className="mt-3 inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-ink shadow-xs active:scale-95 transition-all text-xs font-bold cursor-pointer"
          >
            <span className="material-symbols-outlined text-primary text-[18px]">replay</span>
            <span>{t('hear_again')} • Hear again</span>
          </button>
        </div>
      </div>

      {/* Visual Fallback / Choose Pictures Option */}
      <div className="w-full flex flex-col gap-3 my-2">
        <button
          type="button"
          onClick={() => {
            onEnterApp();
            setShowLanguageGrid(true);
          }}
          className="w-full min-h-[56px] rounded-20 bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 active:scale-[0.98] transition-all p-3.5 flex items-center justify-between shadow-xs cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary shadow-xs">
              <span className="material-symbols-outlined text-[22px]">grid_view</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-ink">
                🖼️ {t('change_lang')}
              </span>
              <span className="text-[11px] text-muted">
                Choose languages & topics with pictures
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-muted text-[20px]">
            arrow_forward
          </span>
        </button>
      </div>

      {/* Civic Trust Banner */}
      <CivicTrustBanner />
    </div>
  );
};
