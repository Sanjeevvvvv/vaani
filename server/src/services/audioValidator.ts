import { config } from '../config.js';

export interface AudioValidationResult {
  valid: boolean;
  mimeType: string;
  buffer: Buffer;
  error?: string;
}

const ALLOWED_MIME_TYPES = [
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/mp4',
  'audio/m4a',
  'audio/aac',
  'audio/ogg',
  'audio/ogg;codecs=opus',
  'audio/mpeg',
  'audio/mp3',
];

export function validateAudioPayload(
  base64Data: string,
  providedMime = 'audio/webm'
): AudioValidationResult {
  if (!base64Data || typeof base64Data !== 'string') {
    return { valid: false, mimeType: '', buffer: Buffer.alloc(0), error: 'Audio payload is empty' };
  }

  // Strip data URL prefix if present
  let cleanBase64 = base64Data;
  let resolvedMime = providedMime;

  const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    resolvedMime = match[1];
    cleanBase64 = match[2];
  }

  // Normalize MIME
  const baseMime = resolvedMime.split(';')[0].toLowerCase();
  const isAllowed = ALLOWED_MIME_TYPES.some((m) => m.toLowerCase().startsWith(baseMime));

  if (!isAllowed) {
    return {
      valid: false,
      mimeType: resolvedMime,
      buffer: Buffer.alloc(0),
      error: `Unsupported audio format: ${resolvedMime}. Allowed formats: webm, wav, mp4, aac, ogg.`,
    };
  }

  const buffer = Buffer.from(cleanBase64, 'base64');

  if (buffer.length === 0) {
    return { valid: false, mimeType: resolvedMime, buffer, error: 'Decoded audio buffer is empty' };
  }

  if (buffer.length > config.maxAudioSizeBytes) {
    return {
      valid: false,
      mimeType: resolvedMime,
      buffer,
      error: `Audio size ${Math.round(buffer.length / 1024)}KB exceeds maximum limit of 2MB`,
    };
  }

  return {
    valid: true,
    mimeType: resolvedMime,
    buffer,
  };
}
