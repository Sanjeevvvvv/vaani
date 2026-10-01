import { describe, it, expect } from 'vitest';
import { decideReplyLanguage } from '../services/languageDetector.js';

describe('Scheme Router & Language Decision Logic', () => {
  it('switches language when confidence is high (>= 0.75)', () => {
    const res = decideReplyLanguage(
      { language: 'hi', confidence: 0.92 },
      'te'
    );
    expect(res.finalLanguage).toBe('hi');
    expect(res.switched).toBe(true);
    expect(res.needsLanguageChoice).toBe(false);
  });

  it('preserves previous language on low confidence (< 0.75)', () => {
    const res = decideReplyLanguage(
      { language: 'hi', confidence: 0.5 },
      'te'
    );
    expect(res.finalLanguage).toBe('te');
    expect(res.switched).toBe(false);
    expect(res.needsLanguageChoice).toBe(false);
  });

  it('triggers needsLanguageChoice when confidence is low and no previous language exists', () => {
    const res = decideReplyLanguage(
      { language: 'hi', confidence: 0.4 },
      undefined
    );
    expect(res.needsLanguageChoice).toBe(true);
  });

  it('treats Hindi/Marathi ambiguity as low confidence to avoid incorrect switch', () => {
    const res = decideReplyLanguage(
      { language: 'mr', confidence: 0.9, isAmbiguous: true },
      'hi'
    );
    expect(res.finalLanguage).toBe('hi');
    expect(res.switched).toBe(false);
  });
});
