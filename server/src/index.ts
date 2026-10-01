import path from 'path';
import fs from 'fs';
import express from 'express';
import { fileURLToPath } from 'url';
import { createApp } from './app.js';
import { config } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = createApp();

// Serve static frontend files in production or if client/dist exists
const clientDistCandidates = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
];

let clientDistPath = '';
for (const cand of clientDistCandidates) {
  if (fs.existsSync(cand)) {
    clientDistPath = cand;
    break;
  }
}

if (clientDistPath) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/healthz') {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

const server = app.listen(config.port, () => {
  console.log(`[Vaani Server] Running on http://localhost:${config.port}`);
  console.log(`[Vaani Server] Environment: ${config.nodeEnv}`);
  console.log(`[Vaani Server] Gemini Model: ${config.geminiModel}`);
});

process.on('SIGTERM', () => {
  console.log('[Vaani Server] SIGTERM received, closing server...');
  server.close(() => {
    process.exit(0);
  });
});
