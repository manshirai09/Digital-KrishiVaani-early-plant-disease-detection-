import { SupportedLanguageCode } from '../types';
import { TRANSLATIONS, SUPPORTED_LANGUAGES, TranslationDictionary, LanguageMeta } from './i18n/translations';

const STORAGE_LANG_KEY = 'krishirakshak_lang_code_v2';

let currentLangCode: SupportedLanguageCode = 'en';

// Load saved language on init
try {
  const saved = localStorage.getItem(STORAGE_LANG_KEY) as SupportedLanguageCode;
  if (saved && TRANSLATIONS[saved]) {
    currentLangCode = saved;
  }
} catch {
  currentLangCode = 'en';
}

const listeners = new Set<(lang: SupportedLanguageCode) => void>();

export const I18nService = {
  getCurrentLanguage(): SupportedLanguageCode {
    return currentLangCode;
  },

  getCurrentLanguageMeta(): LanguageMeta {
    return SUPPORTED_LANGUAGES.find(l => l.code === currentLangCode) || SUPPORTED_LANGUAGES[0];
  },

  getSupportedLanguages(): LanguageMeta[] {
    return SUPPORTED_LANGUAGES;
  },

  setLanguage(code: SupportedLanguageCode) {
    if (TRANSLATIONS[code]) {
      currentLangCode = code;
      try {
        localStorage.setItem(STORAGE_LANG_KEY, code);
      } catch (e) {
        console.warn('Could not persist language to localStorage', e);
      }
      listeners.forEach(cb => cb(code));
      window.dispatchEvent(new CustomEvent('krishi_language_change', { detail: { language: code } }));
    }
  },

  // Subscribe to reactive language changes
  subscribe(callback: (lang: SupportedLanguageCode) => void): () => void {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  // Lookup translation string
  t(key: keyof TranslationDictionary, fallback?: string): string {
    const dict = TRANSLATIONS[currentLangCode] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || fallback || key;
  },

  // Format localized template with replacements
  format(template: string, values: Record<string, string | number>): string {
    return Object.entries(values).reduce((acc, [k, v]) => {
      return acc.replace(new RegExp(`{${k}}`, 'g'), String(v));
    }, template);
  },

  // Voice Language Code for Web Speech API
  getSpeechVoiceTag(langCode?: SupportedLanguageCode): string {
    const target = langCode || currentLangCode;
    const meta = SUPPORTED_LANGUAGES.find(l => l.code === target);
    return meta?.voiceLangCode || 'en-IN';
  },

  // Get matching browser SpeechSynthesisVoice
  getBestMatchingVoice(synthVoices: SpeechSynthesisVoice[], langCode?: SupportedLanguageCode): SpeechSynthesisVoice | null {
    const voiceTag = this.getSpeechVoiceTag(langCode) || 'en-IN';
    const primaryCode = (voiceTag.split('-')[0] || 'en').toLowerCase(); // e.g. 'hi', 'mr', 'ta'

    // 1. Exact match (e.g. 'hi-IN')
    const exact = synthVoices.find(v => v.lang.toLowerCase() === voiceTag.toLowerCase() || v.lang.replace('_', '-').toLowerCase() === voiceTag.toLowerCase());
    if (exact) return exact;

    // 2. Primary language match (e.g. 'hi')
    const prefixMatch = synthVoices.find(v => v.lang.toLowerCase().startsWith(primaryCode));
    if (prefixMatch) return prefixMatch;

    // 3. Indian English fallback
    const indianEnglish = synthVoices.find(v => v.lang.toLowerCase().includes('en-in'));
    if (indianEnglish) return indianEnglish;

    // 4. Any English voice fallback
    return synthVoices.find(v => v.lang.toLowerCase().startsWith('en')) || synthVoices[0] || null;
  }
};
