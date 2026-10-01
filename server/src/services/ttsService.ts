import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import crypto from 'crypto';
import { config } from '../config.js';

export interface TTSResult {
  audioBase64: string | null;
  mimeType: string;
  fallback: boolean;
  cached?: boolean;
}

// In-memory cache for synthesized audio: key -> base64
const audioCache = new Map<string, string>();

let ttsClient: TextToSpeechClient | null = null;

function getTTSClient(): TextToSpeechClient | null {
  if (ttsClient) return ttsClient;
  try {
    ttsClient = new TextToSpeechClient();
    return ttsClient;
  } catch {
    return null;
  }
}

const VOICE_MAP: Record<string, { languageCode: string; name: string; ssmlGender: 'FEMALE' }> = {
  te: { languageCode: 'te-IN', name: 'te-IN-Standard-A', ssmlGender: 'FEMALE' },
  hi: { languageCode: 'hi-IN', name: 'hi-IN-Neural2-A', ssmlGender: 'FEMALE' },
  ta: { languageCode: 'ta-IN', name: 'ta-IN-Standard-A', ssmlGender: 'FEMALE' },
  kn: { languageCode: 'kn-IN', name: 'kn-IN-Standard-A', ssmlGender: 'FEMALE' },
  ml: { languageCode: 'ml-IN', name: 'ml-IN-Standard-A', ssmlGender: 'FEMALE' },
  bn: { languageCode: 'bn-IN', name: 'bn-IN-Standard-A', ssmlGender: 'FEMALE' },
  mr: { languageCode: 'mr-IN', name: 'mr-IN-Standard-A', ssmlGender: 'FEMALE' },
  en: { languageCode: 'en-IN', name: 'en-IN-Wavenet-D', ssmlGender: 'FEMALE' },
};

function createCacheKey(lang: string, text: string): string {
  const hash = crypto.createHash('sha256').update(text.trim()).digest('hex');
  return `${lang}:${hash}`;
}

export async function synthesizeSpeech(text: string, language = 'en'): Promise<TTSResult> {
  if (!text || text.trim() === '') {
    return { audioBase64: null, mimeType: 'audio/mp3', fallback: true };
  }

  const cacheKey = createCacheKey(language, text);
  if (audioCache.has(cacheKey)) {
    return {
      audioBase64: audioCache.get(cacheKey)!,
      mimeType: 'audio/mp3',
      fallback: false,
      cached: true,
    };
  }

  const client = getTTSClient();
  if (!client || config.ttsProvider === 'mock') {
    return { audioBase64: null, mimeType: 'audio/mp3', fallback: true };
  }

  const voiceConfig = VOICE_MAP[language] || VOICE_MAP.en;

  try {
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: voiceConfig.languageCode,
        name: voiceConfig.name,
        ssmlGender: voiceConfig.ssmlGender,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9, // Warm and calm pace for clarity
        pitch: 0.0,
      },
    });

    if (response.audioContent) {
      const base64Audio = Buffer.from(response.audioContent).toString('base64');
      audioCache.set(cacheKey, base64Audio);
      return {
        audioBase64: base64Audio,
        mimeType: 'audio/mp3',
        fallback: false,
      };
    }

    return { audioBase64: null, mimeType: 'audio/mp3', fallback: true };
  } catch {
    return { audioBase64: null, mimeType: 'audio/mp3', fallback: true };
  }
}

export function getTTSVoiceDetails(language: string): { languageCode: string; name: string } {
  const voice = VOICE_MAP[language] || VOICE_MAP.en;
  return { languageCode: voice.languageCode, name: voice.name };
}


