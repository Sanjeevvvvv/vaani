import { GoogleGenAI } from '@google/genai';
import { config } from '../config.js';
import {
  getMultiSchemeGroundingText,
  getFallbackAnswer,
  getUnknownSchemeAnswer,
  getScheme,
} from './factsService.js';
import { filterSensitiveData } from './sensitiveFilter.js';
import {
  resolveReplyLanguage,
  LANGUAGE_NAMES_EN,
  SupportedLanguage,
} from './languageDetector.js';
import {
  detectDominantScript,
  validateOutputScript,
  ScriptDetectionResult,
} from './scriptDetector.js';

export type UserIntent =
  | 'question'
  | 'repeat'
  | 'slower'
  | 'simpler'
  | 'next'
  | 'back'
  | 'stop'
  | 'change_language'
  | 'list_schemes';

export interface VoiceAnalysisResult {
  transcript: string;
  language: string; // 2-letter code: en, hi, te, ta, kn, ml, bn, mr
  confidence: number;
  intent: UserIntent;
  schemeId: string; // ujjwala, pmmvvy, ssy, none
  answerText: string;
  suggestedFollowUp: string;
  switched: boolean;
  needsLanguageChoice: boolean;
  fallback?: boolean;
  debugInfo?: {
    geminiLanguage: string;
    geminiConfidence: number;
    scriptLanguage: string;
    isScriptAmbiguous: boolean;
    dominantScript: string;
    finalLanguage: string;
  };
}

export interface ChatAnswerResult {
  answerText: string;
  language: string;
  intent: UserIntent;
  schemeId: string;
  suggestedFollowUp: string;
  switched?: boolean;
  fallback?: boolean;
}

function getAiClient(): GoogleGenAI | null {
  if (!config.geminiApiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey: config.geminiApiKey });
}

/**
 * STEP 1: TRANSCRIBE + DETECT ONLY (Perception Call)
 * Zero facts, zero language hints, zero answering.
 */
async function runStep1Transcription(
  ai: GoogleGenAI,
  audioBase64: string,
  audioMime: string
): Promise<{ transcript: string; language: string; confidence: number }> {
  const cleanMime = audioMime.split(';')[0].trim() || 'audio/webm';

  const step1Prompt = `
You are an accurate, neutral speech transcriber for Indian languages.
Listen to the speaker's audio.
Tasks:
1. Identify the language the speaker actually used from these 8 codes: "en", "hi", "te", "ta", "kn", "ml", "bn", "mr", or "unknown".
   For mixed speech use the language of the main content words. Never default to any language.
2. Transcribe the speech accurately in its original native script.
3. Provide your confidence score between 0.0 and 1.0.

Respond strictly with valid JSON:
{
  "transcript": "spoken words in native script",
  "language": "en" | "hi" | "te" | "ta" | "kn" | "ml" | "bn" | "mr" | "unknown",
  "confidence": 0.95
}
`;

  const response = await ai.models.generateContent({
    model: config.geminiModel,
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: cleanMime,
              data: audioBase64,
            },
          },
          { text: step1Prompt },
        ],
      },
    ],
    config: {
      temperature: 0.1,
      maxOutputTokens: 300,
      responseMimeType: 'application/json',
    },
  });

  const parsed = JSON.parse(response.text || '{}');
  return {
    transcript: parsed.transcript || '',
    language: parsed.language || 'unknown',
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.85,
  };
}

/**
 * STEP 3: ANSWER IN THE DETECTED LANGUAGE (Synthesis Call)
 * Takes transcript + target language + fact sheet.
 */
async function runStep2Synthesis(
  ai: GoogleGenAI,
  transcript: string,
  targetLanguage: SupportedLanguage,
  isRetry = false
): Promise<{
  intent: UserIntent;
  schemeId: string;
  answerText: string;
  suggestedFollowUp: string;
}> {
  const targetLangName = LANGUAGE_NAMES_EN[targetLanguage] || 'Indian English';

  const step2UserPrompt = `
User Question: "${transcript}"

${isRetry ? 'CORRECTION NOTICE: Your previous output was in the wrong script. You MUST reply ONLY in ' + targetLangName + ' script.\n' : ''}
CRITICAL INSTRUCTION:
Reply ONLY in ${targetLangName} (${targetLanguage}), written in its native script.
Translate and simplify the official English fact sheet into that language.
Do not reply in any other language. Everything you output will be spoken aloud to a rural Indian woman. Use short, clear sentences.

Tasks:
1. Classify intent: "question" | "repeat" | "slower" | "simpler" | "next" | "back" | "stop" | "change_language" | "list_schemes".
2. Identify scheme: "ujjwala" | "pmmvvy" | "ssy" | "none".
3. Formulate a short, helpful answer (answerText) strictly from the fact sheet in ${targetLangName}.
4. Formulate one proactive next question (suggestedFollowUp) in ${targetLangName}.
5. Always remind her to visit an ASHA/Anganwadi worker or CSC center for final submission.

OFFICIAL SCHEME FACT SHEETS:
${getMultiSchemeGroundingText()}

Respond strictly with valid JSON:
{
  "intent": "question" | "repeat" | "slower" | "simpler" | "next" | "back" | "stop" | "change_language" | "list_schemes",
  "schemeId": "ujjwala" | "pmmvvy" | "ssy" | "none",
  "answerText": "spoken answer in ${targetLangName}",
  "suggestedFollowUp": "proactive next question in ${targetLangName}"
}
`;

  const response = await ai.models.generateContent({
    model: config.geminiModel,
    contents: [
      {
        role: 'user',
        parts: [{ text: step2UserPrompt }],
      },
    ],
    config: {
      temperature: 0.2,
      maxOutputTokens: 600,
      responseMimeType: 'application/json',
    },
  });

  const parsed = JSON.parse(response.text || '{}');
  return {
    intent: (parsed.intent as UserIntent) || 'question',
    schemeId: ['ujjwala', 'pmmvvy', 'ssy', 'none'].includes(parsed.schemeId)
      ? parsed.schemeId
      : 'ujjwala',
    answerText: parsed.answerText || '',
    suggestedFollowUp: parsed.suggestedFollowUp || '',
  };
}

/**
 * TWO-STEP PIPELINE:
 * Step 1: Perception (Audio -> Transcript + Gemini Language Tag)
 * Step 2: Deterministic Unicode Cross-Check (Script beats Gemini) -> Target Language Locked
 * Step 3: Synthesis in Target Language -> Output Script Validation -> Fallback if Mismatched
 */
export async function processVoiceWithGemini(
  audioBase64: string,
  audioMime: string,
  previousLanguage?: string
): Promise<VoiceAnalysisResult> {
  const isDebug = process.env.ENABLE_VOICE_DEBUG === 'true' || process.env.NODE_ENV !== 'production';
  const ai = getAiClient();

  // Offline / Mock fallback when Gemini API key is missing
  if (!ai) {
    const mockScript = detectDominantScript('');
    const decision = resolveReplyLanguage({
      geminiLanguage: previousLanguage || 'en',
      geminiConfidence: 0.9,
      scriptResult: mockScript,
      previousLanguage,
    });
    const fallbackAns = getFallbackAnswer(decision.finalLanguage, 'ujjwala');
    const scheme = getScheme('ujjwala');
    const followUp =
      scheme?.suggested_followups[decision.finalLanguage] ||
      'Shall I tell you what papers you need? Hold and say yes.';

    return {
      transcript: 'Scheme inquiry',
      language: decision.finalLanguage,
      confidence: 0.9,
      intent: 'question',
      schemeId: 'ujjwala',
      answerText: fallbackAns,
      suggestedFollowUp: followUp,
      switched: decision.switched,
      needsLanguageChoice: decision.needsLanguageChoice,
      fallback: true,
      debugInfo: {
        geminiLanguage: 'mock',
        geminiConfidence: 0.9,
        scriptLanguage: mockScript.scriptLanguage,
        isScriptAmbiguous: mockScript.isAmbiguous,
        dominantScript: mockScript.dominantScript,
        finalLanguage: decision.finalLanguage,
      },
    };
  }

  try {
    // ----------------------------------------------------
    // STEP 1: Transcribe + Detect Only (Perception Call)
    // ----------------------------------------------------
    const step1Result = await runStep1Transcription(ai, audioBase64, audioMime);

    if (isDebug) {
      console.log(
        `[Voice Pipeline Step 1] Transcript="${step1Result.transcript}", GeminiLang=${step1Result.language}, Conf=${step1Result.confidence}`
      );
    }

    // ----------------------------------------------------
    // STEP 2: Deterministic Unicode Cross-Check
    // ----------------------------------------------------
    const scriptResult: ScriptDetectionResult = detectDominantScript(step1Result.transcript);
    const decision = resolveReplyLanguage({
      geminiLanguage: step1Result.language,
      geminiConfidence: step1Result.confidence,
      scriptResult,
      previousLanguage,
    });

    if (isDebug) {
      console.log(
        `[Voice Pipeline Step 2] ScriptDominant=${scriptResult.dominantScript}, ScriptLang=${scriptResult.scriptLanguage}, FinalLang=${decision.finalLanguage}, Switched=${decision.switched}`
      );
    }

    // Privacy & Sensitive data sanitization
    const sensitiveCheck = filterSensitiveData(
      step1Result.transcript,
      decision.finalLanguage
    );
    const sanitizedTranscript = sensitiveCheck.hasSensitiveData
      ? sensitiveCheck.sanitizedText
      : step1Result.transcript;

    // ----------------------------------------------------
    // STEP 3: Synthesis in Locked Target Language
    // ----------------------------------------------------
    let synthesisResult = await runStep2Synthesis(
      ai,
      sanitizedTranscript,
      decision.finalLanguage,
      false
    );

    // Validate Output Script
    const isOutputValid = validateOutputScript(
      synthesisResult.answerText,
      decision.finalLanguage
    );

    if (!isOutputValid && decision.finalLanguage !== 'en') {
      if (isDebug) {
        console.warn(
          `[Voice Pipeline Step 3 Validation Warning] Output script mismatch for ${decision.finalLanguage}. Retrying synthesis once...`
        );
      }
      // Retry once
      synthesisResult = await runStep2Synthesis(
        ai,
        sanitizedTranscript,
        decision.finalLanguage,
        true
      );

      // If still invalid after retry, fall back to verified pre-translated grounding
      if (!validateOutputScript(synthesisResult.answerText, decision.finalLanguage)) {
        if (isDebug) {
          console.warn(
            `[Voice Pipeline Step 3 Fallback] Output script still invalid for ${decision.finalLanguage}. Using verified fact sheet fallback.`
          );
        }
        synthesisResult.answerText = getFallbackAnswer(
          decision.finalLanguage,
          synthesisResult.schemeId
        );
      }
    }

    // Format Answer and Follow-Up
    let answerText = synthesisResult.answerText;
    let followUp = synthesisResult.suggestedFollowUp;

    if (synthesisResult.schemeId === 'none') {
      const unknownInfo = getUnknownSchemeAnswer(decision.finalLanguage);
      answerText = unknownInfo.answerText;
      followUp = unknownInfo.followUp;
    } else if (!answerText) {
      answerText = getFallbackAnswer(decision.finalLanguage, synthesisResult.schemeId);
    }

    if (!followUp) {
      const scheme = getScheme(synthesisResult.schemeId);
      followUp =
        scheme?.suggested_followups[decision.finalLanguage] ||
        'Shall I tell you what papers you need? Hold and say yes.';
    }

    if (sensitiveCheck.hasSensitiveData) {
      answerText = sensitiveCheck.warningMessage + ' ' + answerText;
    }

    return {
      transcript: sanitizedTranscript,
      language: decision.finalLanguage,
      confidence: step1Result.confidence,
      intent: synthesisResult.intent,
      schemeId: synthesisResult.schemeId,
      answerText,
      suggestedFollowUp: followUp,
      switched: decision.switched,
      needsLanguageChoice: decision.needsLanguageChoice,
      fallback: false,
      debugInfo: {
        geminiLanguage: step1Result.language,
        geminiConfidence: step1Result.confidence,
        scriptLanguage: scriptResult.scriptLanguage,
        isScriptAmbiguous: scriptResult.isAmbiguous,
        dominantScript: scriptResult.dominantScript,
        finalLanguage: decision.finalLanguage,
      },
    };
  } catch (err: any) {
    if (isDebug) {
      console.error('[Voice Pipeline Error]', err?.message || err);
    }

    const decision = resolveReplyLanguage({
      geminiLanguage: 'unknown',
      geminiConfidence: 0,
      previousLanguage,
    });

    return {
      transcript: '',
      language: decision.finalLanguage,
      confidence: 0,
      intent: 'question',
      schemeId: 'ujjwala',
      answerText: getFallbackAnswer(decision.finalLanguage, 'ujjwala'),
      suggestedFollowUp: 'Shall I explain what papers you need? Hold and say yes.',
      switched: false,
      needsLanguageChoice: decision.needsLanguageChoice,
      fallback: true,
      debugInfo: {
        geminiLanguage: 'error',
        geminiConfidence: 0,
        scriptLanguage: 'unknown',
        isScriptAmbiguous: true,
        dominantScript: 'none',
        finalLanguage: decision.finalLanguage,
      },
    };
  }
}

/**
 * Text-based Chat helper
 */
export async function answerQuestionWithGemini(
  question: string,
  userLanguage: string = 'en',
  _history: any[] = [],
  _simplify = false
): Promise<ChatAnswerResult> {
  const scriptResult = detectDominantScript(question);
  const decision = resolveReplyLanguage({
    geminiLanguage: userLanguage,
    geminiConfidence: 0.9,
    scriptResult,
    previousLanguage: userLanguage,
  });

  const ai = getAiClient();
  if (!ai) {
    const fallbackAns = getFallbackAnswer(decision.finalLanguage, 'ujjwala');
    const scheme = getScheme('ujjwala');
    const followUp =
      scheme?.suggested_followups[decision.finalLanguage] ||
      'Shall I tell you what papers you need?';

    return {
      answerText: fallbackAns,
      language: decision.finalLanguage,
      intent: 'question',
      schemeId: 'ujjwala',
      suggestedFollowUp: followUp,
      switched: decision.switched,
      fallback: true,
    };
  }

  const synthesis = await runStep2Synthesis(ai, question, decision.finalLanguage, false);
  return {
    answerText: synthesis.answerText || getFallbackAnswer(decision.finalLanguage, synthesis.schemeId),
    language: decision.finalLanguage,
    intent: synthesis.intent,
    schemeId: synthesis.schemeId,
    suggestedFollowUp: synthesis.suggestedFollowUp,
    switched: decision.switched,
    fallback: false,
  };
}

export const processChatWithGemini = answerQuestionWithGemini;
