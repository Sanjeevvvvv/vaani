import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { voiceRouter } from './routes/voice.js';
import { chatRouter } from './routes/chat.js';
import { factsRouter } from './routes/facts.js';
import { ttsRouter } from './routes/tts.js';
import { schemesRouter } from './routes/schemes.js';

export function createApp(): Express {
  const app = express();

  // Security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows flexible audio blob & font fetching in client
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(cors());
  app.use(compression());

  // JSON body parser with limit for base64 audio
  app.use(express.json({ limit: '5mb' }));

  // General rate limiter: 100 requests per 15 minutes
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again in a few minutes.' },
  });

  // Stricter rate limiter for voice endpoint: 30 requests per minute
  const voiceLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Voice request rate limit reached. Please wait a moment.' },
  });

  app.use('/api', generalLimiter);
  app.use('/api/voice', voiceLimiter);

  // Health check endpoint
  app.get('/healthz', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'vaani-server',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // API Routes
  app.use('/api/voice', voiceRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/facts', factsRouter);
  app.use('/api/tts', ttsRouter);
  app.use('/api/schemes', schemesRouter);

  // Safe error handling middleware (Never leak stack traces)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || 500;
    res.status(status).json({
      error: status === 500 ? 'An unexpected server error occurred.' : err.message,
    });
  });

  return app;
}
