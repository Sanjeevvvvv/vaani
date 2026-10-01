export type LanguageCode = 'te' | 'hi' | 'ta' | 'kn' | 'ml' | 'bn' | 'mr' | 'en';

export interface LanguageInfo {
  code: LanguageCode;
  bcp47: string;
  name: string;
  nativeName: string;
  greeting: string;
  greetingSnippet: string;
  sampleQuestions: string[];
}

export type TabType = 'ask' | 'learn' | 'steps';

export type ScreenMode = 'welcome' | 'main' | 'eligibility';

export interface VoiceApiResponse {
  transcript: string;
  language: LanguageCode;
  confidence: number;
  intent?: string;
  schemeId?: string;
  answerText: string;
  suggestedFollowUp?: string;
  audioBase64?: string | null;
  audio?: string | null;
  switched?: boolean;
  needsLanguageChoice?: boolean;
  needsLanguageConfirmation?: boolean;
  isAmbiguousHindiMarathi?: boolean;
  fallback?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'vaani';
  text: string;
  spokenAudio?: string | null;
  timestamp: number;
  isSimplified?: boolean;
}

export interface EligibilityQuestion {
  id: number;
  question: string;
  subtext: string;
  icon: string;
  voiceText: string;
}
