import { describe, it, expect } from 'vitest';
import { filterSensitiveData } from '../services/sensitiveFilter.js';

describe('Sensitive Data Filter', () => {
  it('detects and masks 12-digit Aadhaar numbers', () => {
    const input = 'నా ఆధార్ నంబర్ 2345 6789 0123 ఉంది.';
    const result = filterSensitiveData(input, 'te');
    expect(result.hasSensitiveData).toBe(true);
    expect(result.detectedTypes).toContain('aadhaar');
    expect(result.sanitizedText).not.toContain('2345 6789 0123');
    expect(result.sanitizedText).toContain('[PROTECTED_AADHAAR]');
    expect(result.warningMessage).toContain('ఆధార్ లేదా బ్యాంక్');
  });

  it('detects and masks continuous 12-digit Aadhaar numbers', () => {
    const input = 'My number is 543210987654 please help';
    const result = filterSensitiveData(input, 'en');
    expect(result.hasSensitiveData).toBe(true);
    expect(result.detectedTypes).toContain('aadhaar');
    expect(result.sanitizedText).toContain('[PROTECTED_AADHAAR]');
  });

  it('detects and masks OTP and password strings', () => {
    const input = 'Mera OTP 458921 hai';
    const result = filterSensitiveData(input, 'hi');
    expect(result.hasSensitiveData).toBe(true);
    expect(result.detectedTypes).toContain('otp_password');
    expect(result.sanitizedText).not.toContain('458921');
  });

  it('leaves regular questions untouched', () => {
    const input = 'గ్యాస్ కనెక్షన్ కోసం ఏ పత్రాలు కావాలి?';
    const result = filterSensitiveData(input, 'te');
    expect(result.hasSensitiveData).toBe(false);
    expect(result.detectedTypes.length).toBe(0);
    expect(result.sanitizedText).toBe(input);
    expect(result.warningMessage).toBe('');
  });
});
