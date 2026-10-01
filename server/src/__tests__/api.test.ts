import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock external services for fast deterministic API tests
vi.mock('../services/geminiService.js', () => ({
  processVoiceWithGemini: vi.fn().mockImplementation(async (audio: string, _mime: string, prevLang?: string) => {
    const raw = Buffer.from(audio, 'base64').toString('utf8');

    // If fake audio simulates Hindi speech
    if (raw.includes('HINDI_SPEECH') || audio.includes('HINDI_SPEECH')) {
      return {
        transcript: 'मुझे मुफ्त गैस कनेक्शन कैसे मिलेगा?',
        language: 'hi',
        confidence: 0.95,
        intent: 'question',
        schemeId: 'ujjwala',
        answerText: 'प्रधानमंत्री उज्ज्वला योजना के तहत मुफ्त गैस कनेक्शन मिलता है.',
        suggestedFollowUp: 'क्या मैं बताऊँ कि कौन से कागजात चाहिए? बटन दबाकर हाँ बोलें.',
        switched: prevLang ? prevLang !== 'hi' : false,
        needsLanguageChoice: false,
        fallback: false,
      };
    }

    // Low confidence simulation
    if (raw.includes('LOW_CONFIDENCE') || audio.includes('LOW_CONFIDENCE')) {
      if (prevLang) {
        return {
          transcript: '...',
          language: prevLang,
          confidence: 0.4,
          intent: 'question',
          schemeId: 'ujjwala',
          answerText: 'నమస్కారం. ఉజ్జ్వల యోజన వివరాలు ఇక్కడ ఉన్నాయి.',
          suggestedFollowUp: 'మీకు ఏ పత్రాలు కావాలో చెప్పమంటారా?',
          switched: false,
          needsLanguageChoice: false,
          fallback: false,
        };
      }
      return {
        transcript: '...',
        language: 'unknown',
        confidence: 0.4,
        intent: 'question',
        schemeId: 'ujjwala',
        answerText: 'నమస్కారం. దయచేసి మీ భాషను ఎంచుకోండి.',
        suggestedFollowUp: '',
        switched: false,
        needsLanguageChoice: true,
        fallback: false,
      };
    }

    // Default Telugu
    return {
      transcript: 'ఉచిత గ్యాస్ ఎలా వస్తుంది?',
      language: 'te',
      confidence: 0.95,
      intent: 'question',
      schemeId: 'ujjwala',
      answerText: 'ప్రధాన మంత్రి ఉజ్జ్వల యోజన కింద అర్హులైన పేద కుటుంబ మహిళలకు ఉచిత గ్యాస్ కనెక్షన్ లభిస్తుంది.',
      suggestedFollowUp: 'మీకు ఏ పత్రాలు కావాలో చెప్పమంటారా? బటన్ పట్టుకుని అవును అని చెప్పండి.',
      switched: prevLang ? prevLang !== 'te' : false,
      needsLanguageChoice: false,
      fallback: false,
    };
  }),
  processChatWithGemini: vi.fn().mockImplementation(async (msg: string, prevLang?: string) => {
    if (msg.includes('2345 6789 0123') || msg.includes('PROTECTED')) {
      return {
        answerText: 'Please do not share your Aadhaar number. For your safety, these details have been masked.',
        language: prevLang || 'en',
        intent: 'question',
        schemeId: 'ujjwala',
        suggestedFollowUp: '',
        switched: false,
        fallback: false,
      };
    }

    if (msg.includes('தமிழ்')) {
      return {
        answerText: 'பிரதமர் உஜ்வாலா யோஜனா திட்டத்தின் கீழ் இலவச எரிவாயு இணைப்பு வழங்கப்படுகிறது.',
        language: 'ta',
        intent: 'question',
        schemeId: 'ujjwala',
        suggestedFollowUp: 'தேவையான ஆவணங்களைப் பற்றி சொல்லட்டுமா?',
        switched: prevLang !== 'ta',
        fallback: false,
      };
    }

    return {
      answerText: 'Under PM Ujjwala Yojana, eligible families receive a free connection and stove.',
      language: prevLang || 'en',
      intent: 'question',
      schemeId: 'ujjwala',
      suggestedFollowUp: 'Shall I tell you what documents you need?',
      switched: false,
      fallback: false,
    };
  }),
}));

vi.mock('../services/ttsService.js', () => ({
  synthesizeSpeech: vi.fn().mockResolvedValue({
    audioBase64: 'fake-base64-audio',
    mimeType: 'audio/mp3',
    fallback: false,
  }),
  getTTSVoiceDetails: vi.fn().mockImplementation((lang: string) => ({
    languageCode: `${lang}-IN`,
    name: `${lang}-IN-Standard-A`,
  })),
}));

import { createApp } from '../app.js';

const app = createApp();

describe('Server API Endpoints - Companion Multi-Scheme & Language Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /healthz returns 200 and healthy status', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('vaani-server');
  });

  it('GET /api/schemes returns all 3 supported schemes', async () => {
    const res = await request(app).get('/api/schemes');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
    const ids = res.body.map((s: any) => s.id);
    expect(ids).toContain('ujjwala');
    expect(ids).toContain('pmmvvy');
    expect(ids).toContain('ssy');
  });

  it('GET /api/schemes/:id returns full fact sheet for Ujjwala', async () => {
    const res = await request(app).get('/api/schemes/ujjwala');
    expect(res.status).toBe(200);
    expect(res.body.scheme_id).toBe('ujjwala');
    expect(res.body.official_url).toBe('https://www.pmuy.gov.in');
  });

  it('POST /api/voice automatically detects language and returns same-language reply & follow-up', async () => {
    const fakeAudio = Buffer.from('RIFF$---WAVEfmt ').toString('base64');
    const res = await request(app)
      .post('/api/voice')
      .send({ audio: fakeAudio, mimeType: 'audio/wav' });

    expect(res.status).toBe(200);
    expect(res.body.language).toBe('te');
    expect(res.body.schemeId).toBe('ujjwala');
    expect(res.body.suggestedFollowUp).toContain('పత్రాలు');
    expect(res.body.answerText).toContain('ఉజ్జ్వల యోజన');
    expect(res.body.audioBase64).toBe('fake-base64-audio');
  });

  it('POST /api/voice detects language switch from Telugu to Hindi', async () => {
    const fakeHindiAudio = Buffer.from('RIFF$---WAVEfmt HINDI_SPEECH').toString('base64');
    const res = await request(app)
      .post('/api/voice')
      .send({
        audio: fakeHindiAudio,
        mimeType: 'audio/wav',
        previousLanguage: 'te',
      });

    expect(res.status).toBe(200);
    expect(res.body.language).toBe('hi');
    expect(res.body.switched).toBe(true);
    expect(res.body.answerText).toContain('प्रधानमंत्री उज्ज्वला योजना');
  });

  it('POST /api/voice handles low confidence with previousLanguage fallback', async () => {
    const fakeLowAudio = Buffer.from('RIFF$---WAVEfmt LOW_CONFIDENCE').toString('base64');
    const res = await request(app)
      .post('/api/voice')
      .send({
        audio: fakeLowAudio,
        mimeType: 'audio/wav',
        previousLanguage: 'te',
      });

    expect(res.status).toBe(200);
    expect(res.body.language).toBe('te');
    expect(res.body.needsLanguageChoice).toBe(false);
  });

  it('POST /api/voice returns needsLanguageChoice on low confidence without previousLanguage', async () => {
    const fakeLowAudio = Buffer.from('RIFF$---WAVEfmt LOW_CONFIDENCE').toString('base64');
    const res = await request(app)
      .post('/api/voice')
      .send({
        audio: fakeLowAudio,
        mimeType: 'audio/wav',
      });

    expect(res.status).toBe(200);
    expect(res.body.needsLanguageChoice).toBe(true);
  });

  it('POST /api/chat blocks sensitive Aadhaar input before Gemini and warns kindly', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'My Aadhaar is 2345 6789 0123 can I get cylinder?' });

    expect(res.status).toBe(200);
    expect(res.body.answerText).toContain('Please do not share');
  });

  it('POST /api/chat detects Tamil from script and answers in Tamil', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ message: 'இலவச எரிவாயு இணைப்பு எப்படி பெறுவது? தமிழ்' });

    expect(res.status).toBe(200);
    expect(res.body.language).toBe('ta');
    expect(res.body.answerText).toContain('இலவச எரிவாயு');
  });
});
