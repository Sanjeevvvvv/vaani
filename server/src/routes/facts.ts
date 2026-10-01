import { Router, Request, Response } from 'express';
import { getScheme } from '../services/factsService.js';

export const factsRouter = Router();

factsRouter.get('/', (_req: Request, res: Response) => {
  try {
    const facts = getScheme('ujjwala');
    return res.json(facts);
  } catch (_err: any) {
    return res.status(500).json({ error: 'Could not load official fact sheet.' });
  }
});
