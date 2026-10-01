import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAudio } from '../context/AudioContext';
import { LANGUAGES } from '../utils/translations';

export const ConfirmationModal: React.FC = () => {
  const {
    detectedLanguage,
    showConfirmModal,
    confirmDetectedLanguage,
    rejectDetectedLanguage,
  } = useLanguage();
  const { replayLast } = useAudio();

  if (!showConfirmModal || !detectedLanguage) return null;

  const detectedInfo = LANGUAGES[detectedLanguage] || LANGUAGES.te;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs"
    >
      <div className="w-full max-w-md bg-surface rounded-20 shadow-2xl p-6 border border-outline-variant/30 flex flex-col items-center text-center animate-pulse-subtle">
        {/* Civic Sister Avatar */}
        <div className="w-20 h-20 rounded-full bg-primary-container/20 flex items-center justify-center mb-3 p-1 border-2 border-primary-container/40">
          <div className="w-full h-full rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-[36px]">record_voice_over</span>
          </div>
        </div>

        {/* Spoken Prompt Bubble */}
        <div className="w-full bg-surface-container-lowest rounded-20 p-4 shadow-xs border border-surface-container-high mb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping" />
            <span className="text-xs font-bold text-secondary uppercase tracking-wider">
              వాయిస్ గుర్తింపు • Voice Detected
            </span>
          </div>
          <h2
            id="confirm-modal-title"
            className="text-xl font-bold text-primary leading-snug"
          >
            నేను విన్నది: {detectedInfo.nativeName}
            <br />
            ఇది సరైనదేనా?
          </h2>
          <p className="text-xs text-muted mt-1">
            "I heard {detectedInfo.name}. Is that right?"
          </p>

          <button
            type="button"
            onClick={replayLast}
            className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-surface-container hover:bg-surface-container-high text-primary text-xs font-bold active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">volume_up</span>
            <span>మళ్ళీ వినండి (Hear again)</span>
          </button>
        </div>

        {/* Detected Script Badge */}
        <div className="mb-5 py-2 px-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col items-center">
          <span className="text-3xl font-bold text-primary">{detectedInfo.nativeName}</span>
          <span className="text-xs text-muted">{detectedInfo.name}</span>
        </div>

        {/* Dual Primary Decision Buttons: Yes / No (Min 92px height) */}
        <div className="grid grid-cols-2 gap-3 w-full mb-3">
          {/* YES Confirmation */}
          <button
            type="button"
            onClick={confirmDetectedLanguage}
            className="flex flex-col items-center justify-center py-4 px-3 rounded-20 bg-primary hover:bg-primary-hover text-on-primary shadow-md active:scale-95 transition-all min-h-[92px]"
          >
            <div className="w-9 h-9 rounded-full bg-primary-fixed-dim/30 text-on-primary flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[24px] font-bold">check</span>
            </div>
            <span className="font-bold text-base leading-tight">అవును</span>
            <span className="text-xs text-primary-fixed opacity-95">Yes, correct</span>
          </button>

          {/* NO Change */}
          <button
            type="button"
            onClick={rejectDetectedLanguage}
            className="flex flex-col items-center justify-center py-4 px-3 rounded-20 bg-secondary hover:bg-secondary-hover text-on-secondary shadow-md active:scale-95 transition-all min-h-[92px]"
          >
            <div className="w-9 h-9 rounded-full bg-secondary-fixed/25 text-on-secondary flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[24px] font-bold">close</span>
            </div>
            <span className="font-bold text-base leading-tight">కాదు, మార్చండి</span>
            <span className="text-xs text-secondary-fixed opacity-95">No, change</span>
          </button>
        </div>

        {/* Choose another language fallback */}
        <button
          type="button"
          onClick={rejectDetectedLanguage}
          className="text-xs font-semibold text-muted hover:text-primary underline underline-offset-4 py-1"
        >
          వేరే భాషను ఎంచుకోండి • Choose from pictures
        </button>
      </div>
    </div>
  );
};
