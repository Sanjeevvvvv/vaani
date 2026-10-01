import React, { useState } from 'react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { useAudio } from '../context/AudioContext';
import { useLanguage } from '../context/LanguageContext';
import { CivicTrustBanner } from '../components/CivicTrustBanner';
import { LanguageSafetyChip } from '../components/LanguageSafetyChip';
import { CompanionButton, CompanionButtonState } from '../components/CompanionButton';
import { HelperDrawer } from '../components/HelperDrawer';
import { DevDebugHUD, DebugPipelineInfo } from '../components/DevDebugHUD';
import { ChatMessage, VoiceApiResponse, LanguageCode } from '../types';

export const AskScreen: React.FC = () => {
  const { currentLanguage, changeLanguage, t, setShowLanguageGrid } = useLanguage();
  const {
    speak,
    stopSpeech,
    replayLast,
    isPlaying,
    isUnlocked,
    unlockAudio,
    playbackSpeed,
    setPlaybackSpeed,
  } = useAudio();

  const {
    isRecording,
    audioLevel,
    startRecording,
    stopRecording,
    isBlocked,
  } = useVoiceRecorder();

  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typedInput, setTypedInput] = useState('');
  const [showTypedInput, setShowTypedInput] = useState(false);
  const [currentSchemeId, setCurrentSchemeId] = useState<string>('ujjwala');
  const [suggestedFollowUp, setSuggestedFollowUp] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<DebugPipelineInfo | null>(null);
  const [lastAnswer, setLastAnswer] = useState<{
    text: string;
    audio: string | null;
    language: LanguageCode;
  } | null>(null);

  // Derive Companion Button State
  let buttonState: CompanionButtonState = 'idle';
  if (isRecording) {
    buttonState = 'listening';
  } else if (isLoading) {
    buttonState = 'thinking';
  } else if (isPlaying) {
    buttonState = 'speaking';
  }

  const handleStartRecord = async () => {
    if (!isUnlocked) {
      unlockAudio();
    }
    stopSpeech();
    await startRecording();
  };

  const handleStopRecord = async () => {
    setIsLoading(true);
    const audioData = await stopRecording();
    if (!audioData) {
      setIsLoading(false);
      return;
    }

    // Step 5: Reject clips shorter than ~1.2s to prevent guessing on accidental taps
    if (audioData.durationMs > 0 && audioData.durationMs < 1200) {
      setIsLoading(false);
      const activeLang = currentLanguage === 'none' ? 'en' : currentLanguage;
      const shortAudioMsg =
        activeLang === 'hi'
          ? 'आवाज़ बहुत छोटी थी. कृपया बटन दबाकर रखें और अपना सवाल बोलें.'
          : activeLang === 'te'
          ? 'ఆడియో చాలా చిన్నదిగా ఉంది. దయచేసి బటన్ నొక్కి పట్టుకుని మాట్లాడండి.'
          : activeLang === 'ta'
          ? 'ஆடியோ மிகக் குறைவாக இருந்தது. தயவுசெய்து பொத்தானை அழுத்திப் பிடித்துப் பேசுங்கள்.'
          : activeLang === 'kn'
          ? 'ಆಡಿಯೋ ತುಂಬಾ ಚಿಕ್ಕದಾಗಿದೆ. ದಯವಿಟ್ಟು ಬಟನ್ ಹಿಡಿದು ಮಾತನಾಡಿ.'
          : activeLang === 'ml'
          ? 'ഓഡിയോ വളരെ ചെറുതാണ്. ദയവായി ബട്ടൺ അമർത്തിപ്പിടിച്ച് സംസാരിക്കുക.'
          : activeLang === 'bn'
          ? 'অডিও খুব ছোট ছিল। অনুগ্রহ করে বোতাম চেপে ধরে কথা বলুন।'
          : activeLang === 'mr'
          ? 'ऑडिओ खूप लहान होता. कृपया बटण दाबून ठेवा आणि बोला.'
          : 'Audio was too short. Please press and hold the button to speak your question.';
      speak(shortAudioMsg, activeLang);
      return;
    }

    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio: audioData.base64,
          mimeType: audioData.mimeType,
          previousLanguage: currentLanguage === 'none' ? undefined : currentLanguage,
        }),
      });

      const data: VoiceApiResponse & { debug?: DebugPipelineInfo } = await res.json();
      setIsLoading(false);

      if (data.debug) {
        setDebugInfo(data.debug);
      }

      if (data.needsLanguageChoice) {
        setShowLanguageGrid(true);
        return;
      }

      const replyLang = (data.language as LanguageCode) || 'en';
      if (replyLang !== currentLanguage) {
        changeLanguage(replyLang, false);
      }

      if (data.schemeId) {
        setCurrentSchemeId(data.schemeId);
      }

      if (data.transcript) {
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            sender: 'user',
            text: data.transcript,
            timestamp: Date.now(),
          },
        ]);
      }

      // Handle Spoken Intent Actions
      if (data.intent === 'repeat') {
        replayLast();
        return;
      }
      if (data.intent === 'slower') {
        setPlaybackSpeed(Math.max(0.6, playbackSpeed - 0.2));
        replayLast();
        return;
      }
      if (data.intent === 'stop') {
        stopSpeech();
        return;
      }
      if (data.intent === 'change_language') {
        setShowLanguageGrid(true);
        return;
      }

      if (data.answerText) {
        const fullSpokenText = data.suggestedFollowUp
          ? `${data.answerText} ${data.suggestedFollowUp}`
          : data.answerText;

        setSuggestedFollowUp(data.suggestedFollowUp || '');

        const answerMsg: ChatMessage = {
          id: `${Date.now()}-vaani-${Math.random().toString(36).slice(2, 7)}`,
          sender: 'vaani',
          text: data.answerText,
          spokenAudio: data.audioBase64,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, answerMsg]);
        setLastAnswer({
          text: data.answerText,
          audio: data.audioBase64 || null,
          language: replyLang,
        });

        await speak(fullSpokenText, replyLang, data.audioBase64);
      }
    } catch {
      setIsLoading(false);
      const replyLang: LanguageCode = currentLanguage === 'none' ? 'en' : currentLanguage;
      const fallbackText = `${t('drawer_helper')}. ${t('drawer_helpline')}: 1800 266 6696.`;
      setLastAnswer({ text: fallbackText, audio: null, language: replyLang });
      speak(fallbackText, replyLang);
    }
  };

  const handleInterrupt = () => {
    stopSpeech();
  };

  const handleTypedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;

    const question = typedInput.trim();
    setTypedInput('');
    if (!isUnlocked) unlockAudio();

    setIsLoading(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-user-${Math.random().toString(36).slice(2, 7)}`,
        sender: 'user',
        text: question,
        timestamp: Date.now(),
      },
    ]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          previousLanguage: currentLanguage,
        }),
      });

      const data = await res.json();
      setIsLoading(false);

      const replyLang = (data.language as LanguageCode) || currentLanguage;
      if (replyLang !== currentLanguage) {
        changeLanguage(replyLang, false);
      }

      if (data.schemeId) {
        setCurrentSchemeId(data.schemeId);
      }
      setSuggestedFollowUp(data.suggestedFollowUp || '');

      const answerMsg: ChatMessage = {
        id: `${Date.now()}-vaani-${Math.random().toString(36).slice(2, 7)}`,
        sender: 'vaani',
        text: data.answerText,
        spokenAudio: data.audioBase64,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, answerMsg]);
      setLastAnswer({
        text: data.answerText,
        audio: data.audioBase64 || null,
        language: replyLang,
      });

      const fullSpoken = data.suggestedFollowUp
        ? `${data.answerText} ${data.suggestedFollowUp}`
        : data.answerText;
      speak(fullSpoken, replyLang, data.audioBase64);
    } catch {
      setIsLoading(false);
    }
  };

  const handleSlower = () => {
    const nextSpeed = playbackSpeed === 0.9 ? 0.7 : 0.9;
    setPlaybackSpeed(nextSpeed);
    replayLast();
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-140px)] pb-24 px-4 w-full max-w-lg mx-auto">
      {/* Top Civic Trust Note */}
      <CivicTrustBanner />

      {/* Mic Denied / Blocked Fallback Card */}
      {isBlocked && (
        <div className="w-full mt-3 p-4 rounded-2xl bg-error-container text-on-error-container border border-error/30 text-xs flex items-start gap-3 animate-in fade-in">
          <span className="material-symbols-outlined text-error text-[20px] shrink-0">mic_off</span>
          <div className="flex flex-col gap-1">
            <span className="font-bold">{t('mic_permission_title')}</span>
            <span>{t('mic_denied_msg')}</span>
          </div>
        </div>
      )}

      {/* DOMINANT COMPANION BUTTON (Hold-to-talk / Tap-to-talk) */}
      <CompanionButton
        state={buttonState}
        audioLevel={audioLevel}
        onStartRecord={handleStartRecord}
        onStopRecord={handleStopRecord}
        onInterruptPlayback={handleInterrupt}
      />

      {/* Spoken Language Safety Net Chip */}
      <div className="my-2">
        <LanguageSafetyChip
          language={currentLanguage}
          onOpenGrid={() => setShowLanguageGrid(true)}
        />
      </div>

      {/* Transcript & Answer Captions Display */}
      {messages.length > 0 && (
        <div className="w-full flex flex-col gap-3 my-3">
          {messages.slice(-2).map((msg) => (
            <div
              key={msg.id}
              className={`p-4 rounded-2xl text-sm leading-relaxed transition-all ${
                msg.sender === 'user'
                  ? 'bg-surface-container-low text-ink ml-auto max-w-[85%] border border-outline-variant/30'
                  : 'bg-surface-container-highest text-ink mr-auto w-full shadow-xs border border-primary/20'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-primary">
                <span className="material-symbols-outlined text-[14px]">
                  {msg.sender === 'user' ? 'person' : 'record_voice_over'}
                </span>
                <span>{msg.sender === 'user' ? 'You said' : 'Vaani'}</span>
              </div>
              <p className="text-ink font-medium">{msg.text}</p>
            </div>
          ))}

          {/* Proactive Next Step Suggestion */}
          {suggestedFollowUp && (
            <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary-dark text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                lightbulb
              </span>
              <span className="font-semibold">{suggestedFollowUp}</span>
            </div>
          )}

          {/* Controls: Hear again / Slower */}
          {lastAnswer && (
            <div className="flex items-center justify-center gap-2 mt-1">
              <button
                type="button"
                onClick={replayLast}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/40 text-xs font-semibold text-ink active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-primary">replay</span>
                <span>{t('hear_again')}</span>
              </button>

              <button
                type="button"
                onClick={handleSlower}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/40 text-xs font-semibold active:scale-95 transition-all cursor-pointer ${
                  playbackSpeed < 0.9
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-ink hover:bg-surface-container-highest'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">speed</span>
                <span>{t('slower')}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Typed Input Toggle & Form */}
      <div className="w-full mt-2">
        {!showTypedInput ? (
          <button
            type="button"
            onClick={() => setShowTypedInput(true)}
            className="w-full text-center text-xs text-muted hover:text-ink py-2 underline cursor-pointer"
          >
            Or type your question in any language
          </button>
        ) : (
          <form onSubmit={handleTypedSubmit} className="flex gap-2 mt-2 w-full">
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={t('type_placeholder')}
              className="flex-1 px-4 py-2.5 rounded-20 bg-surface-container-high border border-outline-variant/40 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={!typedInput.trim() || isLoading}
              className="px-4 py-2.5 rounded-20 bg-primary text-on-primary text-xs font-bold disabled:opacity-50 active:scale-95 transition-transform"
            >
              {t('send')}
            </button>
          </form>
        )}
      </div>

      {/* Collapsed Helper Drawer (Helpline, Portal link, CSC Helper referral, Print) */}
      <HelperDrawer schemeId={currentSchemeId} />

      {/* Dev-Only Two-Step Pipeline Debug Panel */}
      <DevDebugHUD debugInfo={debugInfo} />
    </div>
  );
};
