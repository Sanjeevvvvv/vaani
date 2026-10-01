import { describe, it, expect } from 'vitest';
import {
  detectDominantScript,
  validateOutputScript,
} from '../services/scriptDetector.js';
import { resolveReplyLanguage } from '../services/languageDetector.js';

describe('Step 2 Deterministic Unicode Script Detector & Validation', () => {
  describe('Pure Script Detection for all 8 Languages', () => {
    it('detects Telugu script with 100% confidence (unambiguous)', () => {
      const text = 'ఉజ్జ్వల యోజన ఉచిత గ్యాస్ సిలిండర్ ఎలా వస్తుంది?';
      const result = detectDominantScript(text);
      expect(result.scriptLanguage).toBe('te');
      expect(result.dominantScript).toBe('telugu');
      expect(result.isAmbiguous).toBe(false);
    });

    it('detects Tamil script with 100% confidence (unambiguous)', () => {
      const text = 'உஜ்வாலா திட்டத்தில் இலவச சிலிண்டர் பெறுவது எப்படி?';
      const result = detectDominantScript(text);
      expect(result.scriptLanguage).toBe('ta');
      expect(result.dominantScript).toBe('tamil');
      expect(result.isAmbiguous).toBe(false);
    });

    it('detects Kannada script with 100% confidence (unambiguous)', () => {
      const text = 'ಉಜ್ವಲ ಯೋಜನೆಯಡಿ ಉಚಿತ ಗ್ಯಾಸ್ ಸಂಪರ್ಕ ಹೇಗೆ ಪಡೆಯುವುದು?';
      const result = detectDominantScript(text);
      expect(result.scriptLanguage).toBe('kn');
      expect(result.dominantScript).toBe('kannada');
      expect(result.isAmbiguous).toBe(false);
    });

    it('detects Malayalam script with 100% confidence (unambiguous)', () => {
      const text = 'ഉജ്ജ്വല യോജന വഴി സൗജന്യ ഗ്യാസ് കണക്ഷൻ എങ്ങനെ ലഭിക്കും?';
      const result = detectDominantScript(text);
      expect(result.scriptLanguage).toBe('ml');
      expect(result.dominantScript).toBe('malayalam');
      expect(result.isAmbiguous).toBe(false);
    });

    it('detects Bengali script with 100% confidence (unambiguous)', () => {
      const text = 'উজ্জ্বলা যোজনায় বিনামূল্যে গ্যাস কানেকশন কীভাবে পাব?';
      const result = detectDominantScript(text);
      expect(result.scriptLanguage).toBe('bn');
      expect(result.dominantScript).toBe('bengali');
      expect(result.isAmbiguous).toBe(false);
    });

    it('identifies Devanagari Hindi as ambiguous unless Marathi markers are present', () => {
      const text = 'उज्ज्वला योजना में मुफ्त गैस कनेक्शन कैसे मिलेगा?';
      const result = detectDominantScript(text);
      expect(result.dominantScript).toBe('devanagari');
      expect(result.isAmbiguous).toBe(true);
    });

    it('detects Marathi in Devanagari when distinct Marathi tokens or ळ are present', () => {
      const text = 'मला मोफत गॅस सिलिंडर कसा मिळेल आहे? कागदपत्रे काय लागतील?';
      const result = detectDominantScript(text);
      expect(result.scriptLanguage).toBe('mr');
      expect(result.dominantScript).toBe('devanagari');
      expect(result.isAmbiguous).toBe(false);
    });

    it('detects Latin English script', () => {
      const text = 'How can I apply for a free PM Ujjwala LPG connection?';
      const result = detectDominantScript(text);
      expect(result.scriptLanguage).toBe('en');
      expect(result.dominantScript).toBe('latin');
      expect(result.isAmbiguous).toBe(true); // Romanized Indic ambiguity
    });

    it('handles mixed code-switched text prioritizing native script content words', () => {
      const text = 'PM Ujjwala Yojana పథకం వివరాలు ఏమిటి?';
      const result = detectDominantScript(text);
      expect(result.scriptLanguage).toBe('te');
      expect(result.dominantScript).toBe('telugu');
    });
  });

  describe('Disagreement Rules: Unicode Script Overrides Gemini', () => {
    it('overrides Gemini when Gemini says English but script is Telugu', () => {
      const script = detectDominantScript('ఉచిత గ్యాస్ సిలిండర్ వివరాలు');
      const decision = resolveReplyLanguage({
        geminiLanguage: 'en',
        geminiConfidence: 0.9,
        scriptResult: script,
        previousLanguage: 'en',
      });
      expect(decision.finalLanguage).toBe('te');
      expect(decision.switched).toBe(true);
    });

    it('overrides Gemini when Gemini says Telugu but script is Tamil', () => {
      const script = detectDominantScript('இலவச கேஸ் இணைப்பு விவரங்கள்');
      const decision = resolveReplyLanguage({
        geminiLanguage: 'te',
        geminiConfidence: 0.95,
        scriptResult: script,
        previousLanguage: 'te',
      });
      expect(decision.finalLanguage).toBe('ta');
      expect(decision.switched).toBe(true);
    });

    it('resolves Devanagari using Gemini confidence when confidence >= 0.75', () => {
      const script = detectDominantScript('मुफ्त गैस कनेक्शन कैसे मिलेगा');
      const decisionHi = resolveReplyLanguage({
        geminiLanguage: 'hi',
        geminiConfidence: 0.9,
        scriptResult: script,
      });
      expect(decisionHi.finalLanguage).toBe('hi');

      const decisionMr = resolveReplyLanguage({
        geminiLanguage: 'mr',
        geminiConfidence: 0.85,
        scriptResult: script,
      });
      expect(decisionMr.finalLanguage).toBe('mr');
    });
  });

  describe('Step 3 Output Script Validation', () => {
    it('validates Telugu output text matches Telugu script', () => {
      expect(validateOutputScript('ఉజ్జ్వల 2.0 కింద ఉచిత గ్యాస్ లభిస్తుంది.', 'te')).toBe(true);
      expect(validateOutputScript('This is English text.', 'te')).toBe(false);
      expect(validateOutputScript('यह हिंदी वाक्य है.', 'te')).toBe(false);
    });

    it('validates Hindi/Marathi output text matches Devanagari script', () => {
      expect(validateOutputScript('उज्ज्वला योजना के तहत मुफ्त गैस सिलेंडर मिलता है.', 'hi')).toBe(true);
      expect(validateOutputScript('उज्ज्वला योजनेअंतर्गत मोफत गॅस मिळतो.', 'mr')).toBe(true);
      expect(validateOutputScript('Tamil text தமிழ்', 'hi')).toBe(false);
    });

    it('validates Tamil, Kannada, Malayalam, Bengali output scripts', () => {
      expect(validateOutputScript('உஜ்வாலா திட்டம் 2.0', 'ta')).toBe(true);
      expect(validateOutputScript('ಉಜ್ವಲ ಯೋಜನೆ 2.0', 'kn')).toBe(true);
      expect(validateOutputScript('ഉജ്ജ്വല യോജന 2.0', 'ml')).toBe(true);
      expect(validateOutputScript('উজ্জ্বলা যোজনা 2.0', 'bn')).toBe(true);
    });
  });
});
