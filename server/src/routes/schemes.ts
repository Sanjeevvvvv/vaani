import { Router, Request, Response } from 'express';
import { listSchemes, getScheme } from '../services/factsService.js';

export const schemesRouter = Router();

schemesRouter.get('/', (_req: Request, res: Response) => {
  try {
    const list = listSchemes();
    return res.json(list);
  } catch {
    return res.status(500).json({ error: 'Failed to load schemes list' });
  }
});

schemesRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const schemeId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const scheme = getScheme(schemeId);
    if (!scheme) {
      return res.status(404).json({ error: `Scheme '${schemeId}' not found.` });
    }
    return res.json(scheme);
  } catch {
    return res.status(500).json({ error: 'Failed to retrieve scheme' });
  }
});
