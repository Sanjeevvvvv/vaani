import { describe, it, expect } from 'vitest';
import { processChatWithGemini, processVoiceWithGemini } from '../services/geminiService.js';
import { config } from '../config.js';

describe('Live Gemini Integration Test (Key-Gated)', () => {
  const hasKey = Boolean(config.geminiApiKey && config.geminiApiKey.length > 5);

  it.skipIf(!hasKey)('executes live grounding chat query against Gemini in Hindi', async () => {
    const res = await processChatWithGemini(
      'प्रधानमंत्री उज्ज्वला योजना में कौन पात्र है?',
      'hi',
      []
    );
    expect(res.answerText).toBeDefined();
    expect(res.answerText.length).toBeGreaterThan(10);
    expect(res.language).toBe('hi');
  });

  it.skipIf(!hasKey)('executes live voice understanding against Gemini with audio sample', async () => {
    // Generate minimal PCM WAV base64
    const wavHeader = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00,
      0x57, 0x41, 0x56, 0x45, 0x66, 0x6d, 0x74, 0x20,
      0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
      0x44, 0xac, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00,
      0x02, 0x00, 0x10, 0x00, 0x64, 0x61, 0x74, 0x61,
      0x00, 0x00, 0x00, 0x00
    ]).toString('base64');

    const res = await processVoiceWithGemini(wavHeader, 'audio/wav');
    expect(res).toBeDefined();
    expect(res.answerText).toBeTruthy();
  });
});
