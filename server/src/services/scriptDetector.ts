import { SupportedLanguage } from './languageDetector.js';

export interface ScriptDetectionResult {
  detectedLanguage: SupportedLanguage | 'unknown';
  scriptLanguage: SupportedLanguage | 'unknown';
  isAmbiguous: boolean;
  dominantScript: string;
  scriptCounts: Record<string, number>;
}

/**
 * Unicode Script Codepoint Ranges:
 * - Telugu: 0x0C00 - 0x0C7F
 * - Tamil: 0x0B80 - 0x0BFF
 * - Kannada: 0x0C80 - 0x0CFF
 * - Malayalam: 0x0D00 - 0x0D7F
 * - Bengali: 0x0980 - 0x09FF
 * - Devanagari (Hindi/Marathi): 0x0900 - 0x097F
 * - Basic Latin (English / Romanized): A-Z, a-z
 */
export function detectDominantScript(text: string): ScriptDetectionResult {
  const counts = {
    telugu: 0,
    tamil: 0,
    kannada: 0,
    malayalam: 0,
    bengali: 0,
    devanagari: 0,
    latin: 0,
  };

  if (!text || text.trim() === '') {
    return {
      detectedLanguage: 'unknown',
      scriptLanguage: 'unknown',
      isAmbiguous: true,
      dominantScript: 'none',
      scriptCounts: counts,
    };
  }

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0x0c00 && code <= 0x0c7f) counts.telugu++;
    else if (code >= 0x0b80 && code <= 0x0bff) counts.tamil++;
    else if (code >= 0x0c80 && code <= 0x0cff) counts.kannada++;
    else if (code >= 0x0d00 && code <= 0x0d7f) counts.malayalam++;
    else if (code >= 0x0980 && code <= 0x09ff) counts.bengali++;
    else if (code >= 0x0900 && code <= 0x097f) counts.devanagari++;
    else if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) counts.latin++;
  }

  const scriptList: { name: string; lang: SupportedLanguage | 'devanagari'; count: number }[] = [
    { name: 'telugu', lang: 'te', count: counts.telugu },
    { name: 'tamil', lang: 'ta', count: counts.tamil },
    { name: 'kannada', lang: 'kn', count: counts.kannada },
    { name: 'malayalam', lang: 'ml', count: counts.malayalam },
    { name: 'bengali', lang: 'bn', count: counts.bengali },
    { name: 'devanagari', lang: 'devanagari', count: counts.devanagari },
    { name: 'latin', lang: 'en', count: counts.latin },
  ];

  scriptList.sort((a, b) => b.count - a.count);
  const highest = scriptList[0];

  if (highest.count === 0) {
    return {
      detectedLanguage: 'unknown',
      scriptLanguage: 'unknown',
      isAmbiguous: true,
      dominantScript: 'none',
      scriptCounts: counts,
    };
  }

  // 1. Unambiguous scripts: Telugu, Tamil, Kannada, Malayalam, Bengali
  if (highest.lang === 'te') {
    return { detectedLanguage: 'te', scriptLanguage: 'te', isAmbiguous: false, dominantScript: 'telugu', scriptCounts: counts };
  }
  if (highest.lang === 'ta') {
    return { detectedLanguage: 'ta', scriptLanguage: 'ta', isAmbiguous: false, dominantScript: 'tamil', scriptCounts: counts };
  }
  if (highest.lang === 'kn') {
    return { detectedLanguage: 'kn', scriptLanguage: 'kn', isAmbiguous: false, dominantScript: 'kannada', scriptCounts: counts };
  }
  if (highest.lang === 'ml') {
    return { detectedLanguage: 'ml', scriptLanguage: 'ml', isAmbiguous: false, dominantScript: 'malayalam', scriptCounts: counts };
  }
  if (highest.lang === 'bn') {
    return { detectedLanguage: 'bn', scriptLanguage: 'bn', isAmbiguous: false, dominantScript: 'bengali', scriptCounts: counts };
  }

  // 2. Devanagari script: Ambiguous between Hindi and Marathi
  if (highest.lang === 'devanagari') {
    // Check for distinctive Marathi markers (e.g. Marathi letter ळ U+0933, or frequent Marathi lexical tokens)
    if (text.includes('ळ') || text.includes('आहे') || text.includes('नाही') || text.includes('कसे') || text.includes('काय')) {
      return { detectedLanguage: 'mr', scriptLanguage: 'mr', isAmbiguous: false, dominantScript: 'devanagari', scriptCounts: counts };
    }
    // Devanagari without exclusive markers is ambiguous (could be Hindi or Marathi)
    return { detectedLanguage: 'hi', scriptLanguage: 'hi', isAmbiguous: true, dominantScript: 'devanagari', scriptCounts: counts };
  }

  // 3. Latin script: English or Romanized Indic (Hinglish/Tanglish) -> ambiguous
  if (highest.lang === 'en') {
    return { detectedLanguage: 'en', scriptLanguage: 'en', isAmbiguous: true, dominantScript: 'latin', scriptCounts: counts };
  }

  return {
    detectedLanguage: 'unknown',
    scriptLanguage: 'unknown',
    isAmbiguous: true,
    dominantScript: 'unknown',
    scriptCounts: counts,
  };
}

/**
 * Validate that an AI-generated output text actually matches the expected language's script.
 */
export function validateOutputScript(text: string, targetLanguage: SupportedLanguage): boolean {
  if (!text || text.trim().length === 0) return false;
  const detection = detectDominantScript(text);

  switch (targetLanguage) {
    case 'te':
      return detection.dominantScript === 'telugu';
    case 'ta':
      return detection.dominantScript === 'tamil';
    case 'kn':
      return detection.dominantScript === 'kannada';
    case 'ml':
      return detection.dominantScript === 'malayalam';
    case 'bn':
      return detection.dominantScript === 'bengali';
    case 'hi':
    case 'mr':
      return detection.dominantScript === 'devanagari';
    case 'en':
      return detection.dominantScript === 'latin';
    default:
      return true;
  }
}
