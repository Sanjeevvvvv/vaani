import { describe, it, expect } from 'vitest';
import {
  loadAllSchemes,
  getScheme,
  listSchemes,
  getMultiSchemeGroundingText,
  getUnknownSchemeAnswer,
  getFallbackAnswer,
} from '../services/factsService.js';

describe('FactsService Multi-Scheme Loader & Helper', () => {
  it('loads all 3 required official schemes (ujjwala, pmmvvy, ssy)', () => {
    const schemes = loadAllSchemes();
    expect(schemes.size).toBe(3);
    expect(schemes.has('ujjwala')).toBe(true);
    expect(schemes.has('pmmvvy')).toBe(true);
    expect(schemes.has('ssy')).toBe(true);

    const list = listSchemes();
    expect(list.length).toBe(3);
  });

  it('validates official metadata structure for Ujjwala', () => {
    const ujjwala = getScheme('ujjwala');
    expect(ujjwala).not.toBeNull();
    expect(ujjwala?.name).toContain('Ujjwala');
    expect(ujjwala?.official_url).toBe('https://www.pmuy.gov.in');
    expect(ujjwala?.verify).toBe(false);
    expect(ujjwala?.benefits.length).toBeGreaterThan(0);
    expect(ujjwala?.eligibility.length).toBeGreaterThan(0);
    expect(ujjwala?.documents.length).toBeGreaterThan(0);
    expect(ujjwala?.steps.length).toBeGreaterThan(0);
  });

  it('validates official metadata structure for PMMVY', () => {
    const pmmvy = getScheme('pmmvvy');
    expect(pmmvy).not.toBeNull();
    expect(pmmvy?.name).toContain('Matru Vandana');
    expect(pmmvy?.official_url).toBe('https://pmmvy.wcd.gov.in');
    expect(pmmvy?.helpline.primary).toBe('14408');
  });

  it('validates official metadata structure for SSY', () => {
    const ssy = getScheme('ssy');
    expect(ssy).not.toBeNull();
    expect(ssy?.name).toContain('Sukanya Samriddhi');
    expect(ssy?.official_url).toContain('indiapost.gov.in');
  });

  it('handles unknown scheme queries with myscheme.gov.in national portal referral', () => {
    const unknownResp = getUnknownSchemeAnswer('te');
    expect(unknownResp.answerText).toContain('myscheme.gov.in');
    expect(unknownResp.followUp).toBeTruthy();
  });

  it('generates multi-scheme grounding text containing all 3 schemes', () => {
    const text = getMultiSchemeGroundingText();
    expect(text).toContain('SCHEME ID: ujjwala');
    expect(text).toContain('SCHEME ID: pmmvvy');
    expect(text).toContain('SCHEME ID: ssy');
  });

  it('returns appropriate fallback answers for each scheme in 8 languages', () => {
    const languages = ['te', 'hi', 'ta', 'kn', 'ml', 'bn', 'mr', 'en'];
    languages.forEach((lang) => {
      const ujjwalaAns = getFallbackAnswer(lang, 'ujjwala');
      const pmmvyAns = getFallbackAnswer(lang, 'pmmvvy');
      const ssyAns = getFallbackAnswer(lang, 'ssy');

      expect(ujjwalaAns).toBeTruthy();
      expect(pmmvyAns).toBeTruthy();
      expect(ssyAns).toBeTruthy();
    });
  });
});
