import dotenv from 'dotenv';
import path from 'path';

// Load .env from server or root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  ttsProvider: process.env.TTS_PROVIDER || 'google',
  maxAudioSizeBytes: 2 * 1024 * 1024, // 2MB
  maxAudioDurationSeconds: 20,
  maxChatMessageChars: 500,
  supportedLanguages: [
    { code: 'en', bcp47: 'en-IN', name: 'English', nativeName: 'English' },
    { code: 'hi', bcp47: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'te', bcp47: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'ta', bcp47: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'kn', bcp47: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ml', bcp47: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'bn', bcp47: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'mr', bcp47: 'mr-IN', name: 'Marathi', nativeName: 'मराठी' },
  ] as const,
};

export type SupportedLanguageCode = (typeof config.supportedLanguages)[number]['code'];
