import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';

export type CompanionButtonState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface CompanionButtonProps {
  state: CompanionButtonState;
  audioLevel: number; // 0 to 1
  onStartRecord: () => Promise<void>;
  onStopRecord: () => Promise<void>;
  onInterruptPlayback: () => void;
  disabled?: boolean;
}

// Pleasant Web Audio tone generation
function playChime(type: 'start' | 'stop') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    if (type === 'start') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
    } else {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.12);
    }

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

function triggerHaptic() {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40);
    }
  } catch {}
}

export const CompanionButton: React.FC<CompanionButtonProps> = ({
  state,
  audioLevel,
  onStartRecord,
  onStopRecord,
  onInterruptPlayback,
  disabled = false,
}) => {
  const { t } = useLanguage();
  const pointerStartTimeRef = useRef<number>(0);
  const isTapModeActiveRef = useRef<boolean>(false);
  const pointerIdRef = useRef<number | null>(null);
  const [isHeld, setIsHeld] = useState(false);

  const startListening = useCallback(async () => {
    playChime('start');
    triggerHaptic();
    await onStartRecord();
  }, [onStartRecord]);

  const stopListening = useCallback(async () => {
    playChime('stop');
    triggerHaptic();
    await onStopRecord();
  }, [onStopRecord]);

  // Pointer Down (Mouse, Touch, Pen)
  const handlePointerDown = async (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || state === 'thinking') return;
    e.preventDefault();

    // If currently speaking, interrupt and start listening
    if (state === 'speaking') {
      onInterruptPlayback();
      await startListening();
      return;
    }

    // If already in tap-to-talk listening mode, tap stops recording
    if (state === 'listening' && isTapModeActiveRef.current) {
      isTapModeActiveRef.current = false;
      setIsHeld(false);
      await stopListening();
      return;
    }

    if (state === 'idle') {
      pointerStartTimeRef.current = Date.now();
      pointerIdRef.current = e.pointerId;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}

      setIsHeld(true);
      await startListening();
    }
  };

  // Pointer Up
  const handlePointerUp = async (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || state === 'thinking') return;
    e.preventDefault();

    if (pointerIdRef.current !== null) {
      try {
        e.currentTarget.releasePointerCapture(pointerIdRef.current);
      } catch {}
      pointerIdRef.current = null;
    }

    if (state === 'listening' && isHeld) {
      const duration = Date.now() - pointerStartTimeRef.current;
      setIsHeld(false);

      if (duration < 400) {
        // Short tap (<400ms): switch to tap-to-talk mode (stay listening)
        isTapModeActiveRef.current = true;
      } else {
        // Hold-to-talk released (>=400ms): stop and send
        isTapModeActiveRef.current = false;
        await stopListening();
      }
    }
  };

  const handlePointerCancel = async () => {
    if (isHeld && state === 'listening') {
      setIsHeld(false);
      isTapModeActiveRef.current = false;
      await stopListening();
    }
  };

  // Keyboard accessibility: Space / Enter hold vs tap
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      if (!isHeld && state === 'idle') {
        e.preventDefault();
        pointerStartTimeRef.current = Date.now();
        setIsHeld(true);
        await startListening();
      } else if (state === 'speaking') {
        e.preventDefault();
        onInterruptPlayback();
        await startListening();
      }
    }
  };

  const handleKeyUp = async (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      if (isHeld && state === 'listening') {
        e.preventDefault();
        const duration = Date.now() - pointerStartTimeRef.current;
        setIsHeld(false);

        if (duration < 400) {
          isTapModeActiveRef.current = true;
        } else {
          isTapModeActiveRef.current = false;
          await stopListening();
        }
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isTapModeActiveRef.current = false;
    };
  }, []);

  // UI state styling
  let bgClass = 'bg-primary text-white shadow-ambient';
  let iconName = 'mic';
  let captionText = t('btn_idle');
  let ringClass = '';

  if (state === 'listening') {
    bgClass = 'bg-teal-700 text-white shadow-hero';
    iconName = 'mic';
    captionText = t('btn_listening');
    ringClass = 'ring-8 ring-secondary ring-offset-4 ring-offset-background animate-pulse';
  } else if (state === 'thinking') {
    bgClass = 'bg-surface-container-highest text-ink shadow-sm';
    iconName = 'hourglass_empty';
    captionText = t('btn_thinking');
  } else if (state === 'speaking') {
    bgClass = 'bg-emerald-700 text-white shadow-hero';
    iconName = 'volume_up';
    captionText = t('btn_speaking');
    ringClass = 'ring-6 ring-emerald-300 ring-offset-2';
  }

  return (
    <div className="flex flex-col items-center justify-center w-full my-4 px-4 select-none">
      {/* Screen Reader Live Region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {captionText}
      </div>

      {/* Dominant Master Button */}
      <button
        type="button"
        role="button"
        aria-pressed={state === 'listening'}
        aria-label={`Vaani voice assistant button. Current state: ${captionText}`}
        disabled={disabled || state === 'thinking'}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          touchAction: 'none',
          userSelect: 'none',
          WebkitTouchCallout: 'none',
        }}
        className={`relative w-[85%] max-w-[320px] h-[180px] sm:h-[200px] rounded-3xl flex flex-col items-center justify-center gap-3 transition-all duration-200 cursor-pointer active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary/40 ${bgClass} ${ringClass}`}
      >
        {/* Waveform / Visual Bars in Listening State */}
        {state === 'listening' ? (
          <div className="flex items-center gap-1.5 h-12">
            {[0.4, 0.8, 1.0, 0.7, 0.9, 0.5, 0.3].map((multiplier, idx) => {
              const height = Math.max(12, Math.min(44, audioLevel * 50 * multiplier + 10));
              return (
                <div
                  key={idx}
                  style={{ height: `${height}px` }}
                  className="w-2 rounded-full bg-white transition-all duration-75"
                />
              );
            })}
          </div>
        ) : state === 'thinking' ? (
          /* Static 3 dots (no flashing) */
          <div className="flex items-center gap-2 h-12">
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span className="w-3 h-3 rounded-full bg-primary" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-[44px]">{iconName}</span>
          </div>
        )}

        {/* Caption beneath icon */}
        <span className="text-sm sm:text-base font-bold text-center px-4 leading-tight">
          {captionText}
        </span>
      </button>

      {/* Subtext info */}
      <p className="text-xs text-muted mt-2 text-center max-w-xs">
        {state === 'speaking'
          ? 'Tap button anytime to interrupt and ask a question.'
          : state === 'listening'
          ? 'Speak in any language (Telugu, Hindi, Tamil, Kannada, etc.)'
          : 'Hold button while speaking, or tap once to start/stop.'}
      </p>
    </div>
  );
};
