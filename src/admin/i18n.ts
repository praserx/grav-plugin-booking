import type { GravI18nBridge } from './api';

export type TranslationValues = Record<string, string | number>;

export function getAdminLocale(): string {
  return window.__GRAV_I18N?.locale || document.documentElement.lang || 'en';
}

export function translate(locale: string, key: string, values?: TranslationValues): string {
  // The locale argument is intentionally part of the call signature so Svelte
  // reevaluates translated expressions after Admin2 switches language.
  void locale;
  const bridge = window.__GRAV_I18N as GravI18nBridge | undefined;
  return bridge?.t?.(key, values) || key;
}

export function dateLocale(locale: string): string {
  const normalized = locale.toLowerCase().replace('_', '-');
  if (normalized === 'cs' || normalized.startsWith('cs-')) return 'cs-CZ';
  if (normalized === 'en' || normalized.startsWith('en-')) return normalized;
  return 'en-GB';
}

export function weekdayName(locale: string, index: number, short = false): string {
  const date = new Date(Date.UTC(2024, 0, 1 + index)); // 2024-01-01 is Monday.
  return new Intl.DateTimeFormat(dateLocale(locale), { weekday: short ? 'short' : 'long', timeZone: 'UTC' }).format(date);
}
