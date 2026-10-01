import { Router, Request, Response } from 'express';
import { synthesizeSpeech } from '../services/ttsService.js';

export const ttsRouter = Router();

ttsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { text, language = 'te' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text string is required.' });
    }

    const tts = await synthesizeSpeech(text, language);
    return res.json({
      audio: tts.audioBase64,
      mimeType: tts.mimeType,
      fallback: tts.fallback,
      cached: tts.cached,
    });
  } catch (_err: any) {
    return res.status(500).json({
      audio: null,
      fallback: true,
    });
  }
});
