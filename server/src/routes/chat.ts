import { Router, Request, Response } from 'express';
import { processChatWithGemini } from '../services/geminiService.js';
import { synthesizeSpeech } from '../services/ttsService.js';
import { config } from '../config.js';

export const chatRouter = Router();

chatRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { message, previousLanguage, language, history = [], simplify = false } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    if (message.length > config.maxChatMessageChars) {
      return res.status(400).json({
        error: `Message exceeds maximum allowed length of ${config.maxChatMessageChars} characters.`,
      });
    }

    const langToUse = previousLanguage || language;
    const cappedHistory = Array.isArray(history) ? history.slice(-6) : [];

    const result = await processChatWithGemini(message, langToUse, cappedHistory, simplify);
    const tts = await synthesizeSpeech(result.answerText, result.language);

    return res.json({
      answerText: result.answerText,
      language: result.language,
      intent: result.intent,
      schemeId: result.schemeId,
      suggestedFollowUp: result.suggestedFollowUp,
      audioBase64: tts.audioBase64,
      switched: result.switched,
      fallback: result.fallback || tts.fallback,
    });
  } catch (_err: any) {
    return res.status(500).json({
      error: 'Failed to process chat request.',
      fallback: true,
    });
  }
});
