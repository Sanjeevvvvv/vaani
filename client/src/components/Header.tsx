import React from 'react';
import { Wordmark } from './Wordmark';
import { useLanguage } from '../context/LanguageContext';
import { useAudio } from '../context/AudioContext';

export const Header: React.FC<{ onLogoClick?: () => void }> = ({ onLogoClick }) => {
  const { langInfo, setShowLanguageGrid } = useLanguage();
  const { isUnlocked, isPlaying, replayLast } = useAudio();

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-surface-container-high px-4 py-2.5 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Logo and Brand */}
        <button
          type="button"
          onClick={onLogoClick}
          className="flex items-center gap-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-0.5 active:scale-98 transition-transform"
          aria-label="Vaani Home"
        >
          {/* Kolam / Soundwave Emblem SVG */}
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shadow-sm shrink-0">
            <svg
              className="w-7 h-7"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="24" cy="24" r="21" fill="#0F5C63" />
              <path
                d="M14 24h3M19 18v12M24 13v22M29 17v14M34 24h3"
                stroke="#F2A33A"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle
                cx="24"
                cy="24"
                r="22"
                stroke="#F2A33A"
                strokeWidth="1.2"
                strokeDasharray="2 3"
                opacity="0.8"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <Wordmark />
            <span className="text-[11px] text-muted -mt-0.5 leading-tight">
              {langInfo.nativeName === 'English'
                ? 'Government services, in her language'
                : 'ప్రభుత్వ సేవలు, మీ స్వంత భాషలో'}
            </span>
          </div>
        </button>

        {/* Audio Status & Language Switcher */}
        <div className="flex items-center gap-2">
          {/* Sound Indicator Pill */}
          <button
            type="button"
            onClick={replayLast}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs transition-all ${
              isPlaying
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-surface-container-high text-primary hover:bg-surface-container-highest'
            }`}
            title="Audio Status - Tap to hear again"
            aria-label={isPlaying ? 'Audio playing. Tap to hear again.' : 'Sound on. Tap to hear again.'}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isPlaying ? 'animate-pulse' : ''
              }`}
            >
              volume_up
            </span>
            <span className="hidden sm:inline">
              {isUnlocked ? 'ధ్వని ఆన్' : 'ధ్వని'}
            </span>
          </button>

          {/* Regional Language Trigger Button */}
          <button
            type="button"
            onClick={() => setShowLanguageGrid(true)}
            className="flex items-center gap-1 min-h-[38px] px-3 py-1 rounded-full bg-surface-container border border-outline-variant/40 text-primary hover:bg-surface-container-high active:scale-95 transition-all text-xs font-bold shadow-xs"
            aria-label={`Change language. Current language: ${langInfo.name}`}
          >
            <span className="material-symbols-outlined text-[17px]">translate</span>
            <span>{langInfo.nativeName}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
