import React from 'react';
import { useAudio } from '../context/AudioContext';

export const AudioToast: React.FC = () => {
  const { currentCaption, isPlaying, replayLast, stopSpeech } = useAudio();

  if (!currentCaption) return null;

  return (
    <div
      role="log"
      aria-live="polite"
      className="fixed top-16 inset-x-4 max-w-md mx-auto z-50 transition-all transform duration-300"
    >
      <div className="bg-inverse-surface text-inverse-on-surface p-3.5 rounded-2xl shadow-xl border border-inverse-on-surface/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
              isPlaying ? 'bg-secondary text-on-secondary' : 'bg-primary text-on-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[20px] ${
                isPlaying ? 'animate-pulse' : ''
              }`}
            >
              {isPlaying ? 'graphic_eq' : 'volume_up'}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-tertiary-fixed tracking-wide uppercase">
              {isPlaying ? 'Spoken Guidance' : 'Last Spoken'}
            </span>
            <p className="text-xs text-inverse-on-surface line-clamp-2 font-medium leading-snug">
              "{currentCaption}"
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={replayLast}
            className="w-8 h-8 rounded-full bg-inverse-on-surface/10 hover:bg-inverse-on-surface/25 flex items-center justify-center text-inverse-on-surface active:scale-90 transition-transform"
            title="Hear again"
            aria-label="Hear again"
          >
            <span className="material-symbols-outlined text-[18px]">replay</span>
          </button>
          <button
            type="button"
            onClick={stopSpeech}
            className="w-8 h-8 rounded-full bg-inverse-on-surface/10 hover:bg-inverse-on-surface/25 flex items-center justify-center text-inverse-on-surface active:scale-90 transition-transform"
            title="Close captions"
            aria-label="Close captions"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
