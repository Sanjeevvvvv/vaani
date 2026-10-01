import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { LANGUAGES } from '../utils/translations';
import { LanguageCode } from '../types';

interface AudioContextValue {
  isUnlocked: boolean;
  unlockAudio: () => void;
  isPlaying: boolean;
  currentCaption: string;
  speak: (text: string, langCode?: LanguageCode | 'none', audioBase64?: string | null) => Promise<void>;
  stopSpeech: () => void;
  replayLast: () => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCaption, setCurrentCaption] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState(0.9);

  const lastSpokenRef = useRef<{ text: string; langCode: LanguageCode | 'none'; audioBase64?: string | null }>({
    text: '',
    langCode: 'en',
  });

  const activeAudioElRef = useRef<HTMLAudioElement | null>(null);

  // First-tap audio unlock
  const unlockAudio = () => {
    if (isUnlocked) return;
    try {
      // 1. Unlock Web Audio API
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        // Play tiny silent buffer
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      }

      // 2. Unlock SpeechSynthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance('');
        utterance.volume = 0;
        window.speechSynthesis.speak(utterance);
      }

      setIsUnlocked(true);
    } catch {
      setIsUnlocked(true);
    }
  };

  const stopSpeech = () => {
    if (activeAudioElRef.current) {
      activeAudioElRef.current.pause();
      activeAudioElRef.current.src = '';
      activeAudioElRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const speak = async (
    text: string,
    langCode: LanguageCode | 'none' = 'en',
    audioBase64?: string | null
  ): Promise<void> => {
    if (!text || text.trim() === '') return;

    const safeLang: LanguageCode = (langCode && langCode !== 'none' && LANGUAGES[langCode]) ? langCode : 'en';

    // Stop previous audio to prevent overlapping
    stopSpeech();
    setCurrentCaption(text);
    setIsPlaying(true);
    lastSpokenRef.current = { text, langCode: safeLang, audioBase64 };

    // 1. Play base64 audio if provided
    if (audioBase64) {
      try {
        const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
        audio.playbackRate = playbackSpeed;
        activeAudioElRef.current = audio;

        audio.onended = () => {
          setIsPlaying(false);
          activeAudioElRef.current = null;
        };

        audio.onerror = () => {
          // Fallback to speechSynthesis if audio playback fails
          fallbackToSpeechSynthesis(text, safeLang);
        };

        await audio.play();
        return;
      } catch {
        fallbackToSpeechSynthesis(text, safeLang);
        return;
      }
    }

    // 2. Direct browser SpeechSynthesis fallback
    fallbackToSpeechSynthesis(text, safeLang);
  };

  const fallbackToSpeechSynthesis = (text: string, langCode: LanguageCode) => {
    if (!('speechSynthesis' in window)) {
      setIsPlaying(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const bcp47 = LANGUAGES[langCode]?.bcp47 || 'en-IN';
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = bcp47;
      utterance.rate = playbackSpeed;

      // Select female voice if available
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(
        (v) =>
          v.lang.startsWith(langCode) ||
          v.lang === bcp47 ||
          (v.name.toLowerCase().includes('female') && v.lang.includes(langCode))
      );
      if (match) {
        utterance.voice = match;
      }

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsPlaying(false);
    }
  };

  const replayLast = () => {
    const { text, langCode, audioBase64 } = lastSpokenRef.current;
    if (text) {
      speak(text, langCode, audioBase64);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  return (
    <AudioContext.Provider
      value={{
        isUnlocked,
        unlockAudio,
        isPlaying,
        currentCaption,
        speak,
        stopSpeech,
        replayLast,
        playbackSpeed,
        setPlaybackSpeed,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
};
