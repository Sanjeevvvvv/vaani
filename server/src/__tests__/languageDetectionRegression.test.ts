import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { SupportedLanguage, resolveReplyLanguage } from '../services/languageDetector.js';

// Mock TTS service to capture synthesized languageCode
const mockSynthesizeSpeech = vi.fn().mockImplementation(async (_text: string, language: string) => ({
  audioBase64: `mock-audio-${language}`,
  mimeType: 'audio/mp3',
  fallback: false,
}));

vi.mock('../services/ttsService.js', () => ({
  synthesizeSpeech: (text: string, lang: string) => mockSynthesizeSpeech(text, lang),
  getTTSVoiceDetails: (lang: string) => ({ languageCode: `${lang}-IN`, name: `${lang}-IN-Standard-A` }),
}));

// Mock Gemini service
const mockProcessVoiceWithGemini = vi.fn();
vi.mock('../services/geminiService.js', () => ({
  processVoiceWithGemini: (audio: string, mime: string, prevLang?: string) =>
    mockProcessVoiceWithGemini(audio, mime, prevLang),
}));

import { createApp } from '../app.js';
const app = createApp();

describe('Language Detection Regression & Multi-Language Isolation', () => {
  const allLanguages: SupportedLanguage[] = ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'bn', 'mr'];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(allLanguages)(
    'when Gemini detects "%s", answerText, TTS languageCode, and API response all equal "%s"',
    async (lang) => {
      mockProcessVoiceWithGemini.mockResolvedValueOnce({
        transcript: `User speaking in ${lang}`,
        language: lang,
        confidence: 0.96,
        intent: 'question',
        schemeId: 'ujjwala',
        answerText: `Official scheme response in ${lang}`,
        suggestedFollowUp: `Follow up in ${lang}`,
        switched: true,
        needsLanguageChoice: false,
        fallback: false,
      });

      const fakeAudio = Buffer.from(`TEST_AUDIO_${lang}`).toString('base64');
      const res = await request(app)
        .post('/api/voice')
        .send({ audio: fakeAudio, mimeType: 'audio/webm' });

      expect(res.status).toBe(200);
      expect(res.body.language).toBe(lang);
      expect(res.body.answerText).toContain(`in ${lang}`);

      // Prove TTS received the exact detected language, NOT a Telugu default
      expect(mockSynthesizeSpeech).toHaveBeenCalledWith(
        `Official scheme response in ${lang}`,
        lang
      );
    }
  );

  it('REGRESSION: never defaults to Telugu when given Hindi speech without previousLanguage', async () => {
    mockProcessVoiceWithGemini.mockResolvedValueOnce({
      transcript: 'मुझे गैस कनेक्शन के बारे में बताएं',
      language: 'hi',
      confidence: 0.95,
      intent: 'question',
      schemeId: 'ujjwala',
      answerText: 'प्रधानमंत्री उज्ज्वला योजना के तहत मुफ्त गैस कनेक्शन मिलता है.',
      suggestedFollowUp: 'क्या मैं जरूरी कागजात बताऊँ?',
      switched: true,
      needsLanguageChoice: false,
      fallback: false,
    });

    const fakeAudio = Buffer.from('HINDI_AUDIO_SAMPLE').toString('base64');
    const res = await request(app)
      .post('/api/voice')
      .send({ audio: fakeAudio, mimeType: 'audio/webm' });

    expect(res.status).toBe(200);
    expect(res.body.language).toBe('hi');
    expect(res.body.language).not.toBe('te');
    expect(mockSynthesizeSpeech).toHaveBeenCalledWith(
      expect.stringContaining('प्रधानमंत्री उज्ज्वला योजना'),
      'hi'
    );
  });

  it('REGRESSION: resolveReplyLanguage correctly routes all 8 languages without hardcoded fallback', () => {
    allLanguages.forEach((lang) => {
      const decision = resolveReplyLanguage(lang, 0.9, undefined);
      expect(decision.finalLanguage).toBe(lang);
      expect(decision.needsLanguageChoice).toBe(false);
    });
  });

  it('provides debug payload with step1, step2, and TTS details', async () => {
    mockProcessVoiceWithGemini.mockResolvedValueOnce({
      transcript: 'உஜ்வாலா திட்ட விவரங்கள்',
      language: 'ta',
      confidence: 0.98,
      intent: 'question',
      schemeId: 'ujjwala',
      answerText: 'உஜ்வாலா திட்டம் 2.0 விவரங்கள் இங்கே.',
      suggestedFollowUp: 'அடுத்த விவரங்களை சொல்லவா?',
      switched: true,
      needsLanguageChoice: false,
      debugInfo: {
        geminiLanguage: 'ta',
        geminiConfidence: 0.98,
        scriptLanguage: 'ta',
        isScriptAmbiguous: false,
        dominantScript: 'tamil',
        finalLanguage: 'ta',
      },
    });

    const fakeAudio = Buffer.from('TAMIL_AUDIO_DATA').toString('base64');
    const res = await request(app)
      .post('/api/voice')
      .send({ audio: fakeAudio, mimeType: 'audio/webm' });

    expect(res.status).toBe(200);
    expect(res.body.debug).toBeDefined();
    expect(res.body.debug.geminiLanguage).toBe('ta');
    expect(res.body.debug.scriptLanguage).toBe('ta');
    expect(res.body.debug.finalLanguage).toBe('ta');
    expect(res.body.debug.voiceUsed).toBe('ta-IN-Standard-A');
  });

  it('rejects empty audio payload with 400 status', async () => {
    const res = await request(app)
      .post('/api/voice')
      .send({ audio: '', mimeType: 'audio/webm' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Missing audio');
  });
});

