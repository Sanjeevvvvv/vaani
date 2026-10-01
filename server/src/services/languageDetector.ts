import type { ScriptDetectionResult } from './scriptDetector.js';

export type SupportedLanguage = 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'ml' | 'bn' | 'mr';

export interface ReplyDecision {
  finalLanguage: SupportedLanguage;
  switched: boolean;
  needsLanguageChoice: boolean;
  scriptDetected?: SupportedLanguage | 'unknown';
  isScriptAmbiguous?: boolean;
}

export const VALID_LANGUAGES: SupportedLanguage[] = [
  'en',
  'hi',
  'te',
  'ta',
  'kn',
  'ml',
  'bn',
  'mr',
];

export const LANGUAGE_NAMES_EN: Record<SupportedLanguage, string> = {
  en: 'Indian English',
  hi: 'Hindi',
  te: 'Telugu',
  ta: 'Tamil',
  kn: 'Kannada',
  ml: 'Malayalam',
  bn: 'Bengali',
  mr: 'Marathi',
};

export interface ResolveLanguageInput {
  geminiLanguage?: string;
  geminiConfidence?: number;
  language?: string;
  confidence?: number;
  isAmbiguous?: boolean;
  scriptResult?: ScriptDetectionResult;
  previousLanguage?: string;
}

/**
 * SINGLE SOURCE OF TRUTH: resolveReplyLanguage
 * 
 * Rules:
 * 1. UNAMBIGUOUS SCRIPT OVERRIDES GEMINI:
 *    If transcript is in Telugu, Tamil, Kannada, Malayalam, or Bengali script,
 *    trust the Unicode script completely over Gemini's label.
 * 
 * 2. DEVANAGARI (Hindi vs Marathi):
 *    Devanagari is ambiguous. If Gemini identifies "mr" or "hi" with confidence >= 0.75,
 *    trust Gemini. If low confidence (< 0.75), fall back to previousLanguage, or request choice.
 * 
 * 3. LATIN SCRIPT (English vs Romanized Indic / Hinglish):
 *    If Gemini confidence >= 0.75 and identifies "en" or a romanized language, trust Gemini.
 * 
 * 4. UNKNOWN SCRIPT (e.g. empty transcript / pure noise):
 *    If Gemini confidence >= 0.75 and recognized -> use Gemini.
 *    Else if previousLanguage is valid -> keep previousLanguage (switched: false).
 *    Else -> prompt with 8-tile grid (needsLanguageChoice: true).
 * 
 * 5. NO DEFAULT TO TELUGU OR ANY SPECIFIC LANGUAGE.
 */
export function resolveReplyLanguage(
  inputOrGeminiLang: ResolveLanguageInput | string,
  confidenceOrPrev?: number | string,
  previousLanguage?: string
): ReplyDecision {
  let geminiLang = 'unknown';
  let geminiConf = 0.85;
  let isExplicitAmbiguous = false;
  let scriptRes: ScriptDetectionResult = {
    detectedLanguage: 'unknown',
    scriptLanguage: 'unknown',
    isAmbiguous: true,
    dominantScript: 'none',
    scriptCounts: {},
  };
  let prevLang = previousLanguage;

  if (typeof inputOrGeminiLang === 'object' && inputOrGeminiLang !== null) {
    geminiLang = inputOrGeminiLang.geminiLanguage || inputOrGeminiLang.language || 'unknown';
    geminiConf =
      typeof inputOrGeminiLang.geminiConfidence === 'number'
        ? inputOrGeminiLang.geminiConfidence
        : typeof inputOrGeminiLang.confidence === 'number'
        ? inputOrGeminiLang.confidence
        : 0.85;
    isExplicitAmbiguous = Boolean(inputOrGeminiLang.isAmbiguous);
    if (inputOrGeminiLang.scriptResult) {
      scriptRes = inputOrGeminiLang.scriptResult;
    }
    prevLang = inputOrGeminiLang.previousLanguage;
    if (typeof confidenceOrPrev === 'string') {
      prevLang = confidenceOrPrev;
    }
  } else if (typeof inputOrGeminiLang === 'string') {
    geminiLang = inputOrGeminiLang;
    geminiConf = typeof confidenceOrPrev === 'number' ? confidenceOrPrev : 0.85;
  }

  const isValidGemini = VALID_LANGUAGES.includes(geminiLang as SupportedLanguage);
  const isValidPrev =
    prevLang &&
    prevLang !== 'none' &&
    VALID_LANGUAGES.includes(prevLang as SupportedLanguage);

  let decidedLang: SupportedLanguage | null = null;
  let isAmbiguous = isExplicitAmbiguous || scriptRes.isAmbiguous;

  // RULE 1: Unambiguous script (te, ta, kn, ml, bn) ALWAYS overrides Gemini
  if (
    scriptRes.scriptLanguage !== 'unknown' &&
    !scriptRes.isAmbiguous &&
    ['te', 'ta', 'kn', 'ml', 'bn'].includes(scriptRes.scriptLanguage)
  ) {
    decidedLang = scriptRes.scriptLanguage as SupportedLanguage;
    isAmbiguous = false;
  }
  // RULE 2: Devanagari script (hi vs mr)
  else if (scriptRes.dominantScript === 'devanagari') {
    if (!scriptRes.isAmbiguous && scriptRes.scriptLanguage === 'mr') {
      decidedLang = 'mr';
      isAmbiguous = false;
    } else if (!isExplicitAmbiguous && geminiConf >= 0.75 && (geminiLang === 'mr' || geminiLang === 'hi')) {
      decidedLang = geminiLang as SupportedLanguage;
      isAmbiguous = false;
    } else if (isValidPrev && (prevLang === 'mr' || prevLang === 'hi')) {
      decidedLang = prevLang as SupportedLanguage;
      isAmbiguous = false;
    } else {
      isAmbiguous = true;
    }
  }
  // RULE 3: Latin script (English or Romanized Indic)
  else if (scriptRes.dominantScript === 'latin') {
    if (geminiConf >= 0.75 && isValidGemini) {
      decidedLang = geminiLang as SupportedLanguage;
      isAmbiguous = false;
    } else if (isValidPrev) {
      decidedLang = prevLang as SupportedLanguage;
      isAmbiguous = false;
    } else {
      decidedLang = 'en';
      isAmbiguous = false;
    }
  }
  // RULE 4: Direct Gemini Resolution (when script was not provided or is none)
  else {
    if (isValidGemini && geminiConf >= 0.75 && geminiLang !== 'unknown' && !isExplicitAmbiguous) {
      decidedLang = geminiLang as SupportedLanguage;
      isAmbiguous = false;
    }
  }

  // Final determination
  if (decidedLang && !isAmbiguous) {
    const switched = Boolean(isValidPrev && decidedLang !== prevLang);
    return {
      finalLanguage: decidedLang,
      switched,
      needsLanguageChoice: false,
      scriptDetected: scriptRes.scriptLanguage,
      isScriptAmbiguous: scriptRes.isAmbiguous,
    };
  }

  // If still ambiguous or unknown:
  // Fall back to previous valid session language if available
  if (isValidPrev) {
    return {
      finalLanguage: prevLang as SupportedLanguage,
      switched: false,
      needsLanguageChoice: false,
      scriptDetected: scriptRes.scriptLanguage,
      isScriptAmbiguous: true,
    };
  }

  // If no previous language exists, prompt user with language choice
  return {
    finalLanguage: (isValidGemini ? geminiLang : 'en') as SupportedLanguage,
    switched: false,
    needsLanguageChoice: true,
    scriptDetected: scriptRes.scriptLanguage,
    isScriptAmbiguous: true,
  };
}

// Export aliases
export const decideReplyLanguage = resolveReplyLanguage;
export { detectDominantScript as detectScriptFromText } from './scriptDetector.js';
