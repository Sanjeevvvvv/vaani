import { describe, it, expect } from 'vitest';
import { I18N_STRINGS } from '../utils/i18n';
import { LanguageCode } from '../types';

describe('i18n Static JSON Files Completeness', () => {
  const supportedLanguages: LanguageCode[] = ['te', 'hi', 'ta', 'kn', 'ml', 'bn', 'mr', 'en'];

  it('contains all 8 required Indian languages', () => {
    supportedLanguages.forEach((lang) => {
      expect(I18N_STRINGS[lang]).toBeDefined();
      expect(typeof I18N_STRINGS[lang]).toBe('object');
    });
  });

  it('has identical set of keys across all 8 language files', () => {
    const englishKeys = Object.keys(I18N_STRINGS.en).sort();
    expect(englishKeys.length).toBeGreaterThan(15);

    supportedLanguages.forEach((lang) => {
      const langKeys = Object.keys(I18N_STRINGS[lang]).sort();
      expect(langKeys).toEqual(englishKeys);

      // Verify no empty string translations
      englishKeys.forEach((k) => {
        expect(I18N_STRINGS[lang][k]).toBeTruthy();
      });
    });
  });
});
