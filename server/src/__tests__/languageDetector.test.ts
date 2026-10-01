import { describe, it, expect } from 'vitest';
import {
  detectScriptFromText,
  decideReplyLanguage,
} from '../services/languageDetector.js';

describe('Language Detector & Reply Decision Engine', () => {
  describe('Script-based text detection', () => {
    it('detects Telugu script accurately', () => {
      const text = 'ఉచిత గ్యాస్ సిలిండర్ ఎలా వస్తుంది?';
      const result = detectScriptFromText(text);
      expect(result.detectedLanguage).toBe('te');
      expect(result.isAmbiguous).toBe(false);
    });

    it('detects Tamil script accurately', () => {
      const text = 'இலவச எரிவாயு சிலிண்டர் பெறுவது எப்படி?';
      const result = detectScriptFromText(text);
      expect(result.detectedLanguage).toBe('ta');
      expect(result.isAmbiguous).toBe(false);
    });

    it('detects Bengali script accurately', () => {
      const text = 'বিনামূল্যে গ্যাস সংযোগ কীভাবে পাব?';
      const result = detectScriptFromText(text);
      expect(result.detectedLanguage).toBe('bn');
      expect(result.isAmbiguous).toBe(false);
    });

    it('detects Kannada script accurately', () => {
      const text = 'ಉಚಿತ ಗ್ಯಾಸ್ ಸಂಪರ್ಕ ಹೇಗೆ ಪಡೆಯುವುದು?';
      const result = detectScriptFromText(text);
      expect(result.detectedLanguage).toBe('kn');
      expect(result.isAmbiguous).toBe(false);
    });

    it('detects Malayalam script accurately', () => {
      const text = 'സൗജന്യ ഗ്യാസ് കണക്ഷൻ എങ്ങനെ ലഭിക്കും?';
      const result = detectScriptFromText(text);
      expect(result.detectedLanguage).toBe('ml');
      expect(result.isAmbiguous).toBe(false);
    });

    it('flags Devanagari Hindi as ambiguous unless Marathi markers are found', () => {
      const text = 'मुझे मुफ्त गैस कनेक्शन कैसे मिलेगा?';
      const result = detectScriptFromText(text);
      expect(result.detectedLanguage).toBe('hi');
      expect(result.isAmbiguous).toBe(true);
    });

    it('detects Marathi when specific Marathi words/letters appear', () => {
      const text = 'मला मोफत गॅस कनेक्शन कसे मिळेल आहे?';
      const result = detectScriptFromText(text);
      expect(result.detectedLanguage).toBe('mr');
      expect(result.isAmbiguous).toBe(false);
    });
  });

  describe('Reply language decision logic', () => {
    it('selects detected language on high confidence (>= 0.75)', () => {
      const result = decideReplyLanguage({ language: 'te', confidence: 0.95 });
      expect(result.finalLanguage).toBe('te');
      expect(result.switched).toBe(false);
      expect(result.needsLanguageChoice).toBe(false);
    });

    it('switches language automatically when detected language differs with high confidence', () => {
      const result = decideReplyLanguage({ language: 'hi', confidence: 0.88 }, 'te');
      expect(result.finalLanguage).toBe('hi');
      expect(result.switched).toBe(true);
      expect(result.needsLanguageChoice).toBe(false);
    });

    it('falls back to previousLanguage when confidence is low (< 0.75)', () => {
      const result = decideReplyLanguage({ language: 'hi', confidence: 0.5 }, 'te');
      expect(result.finalLanguage).toBe('te');
      expect(result.switched).toBe(false);
      expect(result.needsLanguageChoice).toBe(false);
    });

    it('returns needsLanguageChoice on first turn with low confidence and no previousLanguage', () => {
      const result = decideReplyLanguage({ language: 'unknown', confidence: 0.4 });
      expect(result.needsLanguageChoice).toBe(true);
    });

    it('falls back to previousLanguage when Hindi/Marathi is ambiguous', () => {
      const result = decideReplyLanguage(
        { language: 'hi', confidence: 0.9, isAmbiguous: true },
        'mr'
      );
      expect(result.finalLanguage).toBe('mr');
      expect(result.switched).toBe(false);
    });
  });
});
