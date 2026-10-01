import { Router, Request, Response } from 'express';
import { validateAudioPayload } from '../services/audioValidator.js';
import { processVoiceWithGemini } from '../services/geminiService.js';
import { synthesizeSpeech, getTTSVoiceDetails } from '../services/ttsService.js';

export const voiceRouter = Router();

voiceRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { audio, mimeType = 'audio/webm', previousLanguage } = req.body;

    if (!audio) {
      return res.status(400).json({
        error: 'Missing audio data in request body.',
      });
    }

    const validation = validateAudioPayload(audio, mimeType);
    if (!validation.valid) {
      return res.status(400).json({
        error: validation.error,
      });
    }

    // Process with Two-Step Gemini Pipeline
    const analysis = await processVoiceWithGemini(
      validation.buffer.toString('base64'),
      validation.mimeType,
      previousLanguage
    );

    // Synthesize response audio
    const tts = await synthesizeSpeech(analysis.answerText, analysis.language);
    const voiceDetails =
      typeof getTTSVoiceDetails === 'function'
        ? getTTSVoiceDetails(analysis.language)
        : { languageCode: analysis.language, name: `${analysis.language}-IN-voice` };

    return res.json({
      transcript: analysis.transcript,
      language: analysis.language,
      confidence: analysis.confidence,
      intent: analysis.intent,
      schemeId: analysis.schemeId,
      answerText: analysis.answerText,
      suggestedFollowUp: analysis.suggestedFollowUp,
      audioBase64: tts.audioBase64,
      switched: analysis.switched,
      needsLanguageChoice: analysis.needsLanguageChoice,
      fallback: analysis.fallback || tts.fallback,
      debug: {
        mimeType: validation.mimeType,
        byteSize: validation.buffer.length,
        geminiLanguage: analysis.debugInfo?.geminiLanguage || analysis.language,
        geminiConfidence: analysis.confidence,
        scriptLanguage: analysis.debugInfo?.scriptLanguage || 'unknown',
        dominantScript: analysis.debugInfo?.dominantScript || 'none',
        finalLanguage: analysis.language,
        replyLanguage: analysis.language,
        voiceUsed: voiceDetails.name,
      },
    });
  } catch {
    return res.status(500).json({
      error: 'Failed to process voice request.',
      fallback: true,
    });
  }
});
