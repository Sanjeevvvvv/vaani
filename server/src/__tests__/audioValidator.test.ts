import { describe, it, expect } from 'vitest';
import { validateAudioPayload } from '../services/audioValidator.js';

describe('Audio Validator', () => {
  it('validates a correct base64 audio payload', () => {
    const fakeBuffer = Buffer.from('RIFF....WAVEfmt ');
    const base64 = fakeBuffer.toString('base64');
    const result = validateAudioPayload(base64, 'audio/wav');
    expect(result.valid).toBe(true);
    expect(result.buffer.length).toBeGreaterThan(0);
  });

  it('rejects an empty audio payload', () => {
    const result = validateAudioPayload('', 'audio/webm');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });

  it('rejects an unsupported MIME type', () => {
    const fakeBuffer = Buffer.from('dummy content');
    const base64 = fakeBuffer.toString('base64');
    const result = validateAudioPayload(base64, 'application/pdf');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Unsupported audio format');
  });

  it('rejects payloads exceeding the 2MB limit', () => {
    // 2.1 MB buffer
    const largeBuffer = Buffer.alloc(2.1 * 1024 * 1024, 0);
    const base64 = largeBuffer.toString('base64');
    const result = validateAudioPayload(base64, 'audio/webm');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds maximum limit of 2MB');
  });
});
