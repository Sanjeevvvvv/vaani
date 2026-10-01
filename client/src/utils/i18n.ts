import { LanguageCode } from '../types';
import te from '../i18n/te.json';
import hi from '../i18n/hi.json';
import ta from '../i18n/ta.json';
import kn from '../i18n/kn.json';
import ml from '../i18n/ml.json';
import bn from '../i18n/bn.json';
import mr from '../i18n/mr.json';
import en from '../i18n/en.json';

export type I18nKeys = keyof typeof en;

export const I18N_STRINGS: Record<LanguageCode, Record<string, string>> = {
  te,
  hi,
  ta,
  kn,
  ml,
  bn,
  mr,
  en,
};

export function getTranslation(lang: LanguageCode | 'none' | string | undefined | null, key: string): string {
  const safeLang = (lang && lang !== 'none' && I18N_STRINGS[lang as LanguageCode]) ? (lang as LanguageCode) : 'en';
  const table = I18N_STRINGS[safeLang];
  return table[key] || I18N_STRINGS.en[key] || key;
}

