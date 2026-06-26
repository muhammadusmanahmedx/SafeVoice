import { en, type Dictionary } from "./locales/en";
import { ar } from "./locales/ar";
import { hi } from "./locales/hi";

export type Locale = "en" | "ar" | "hi";

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "safevoice-lang";

export const LOCALES: { code: Locale; nativeLabel: string }[] = [
  { code: "en", nativeLabel: "English" },
  { code: "ar", nativeLabel: "العربية" },
  { code: "hi", nativeLabel: "हिन्दी" },
];

const dictionaries: Record<Locale, Dictionary> = { en, ar, hi };

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "ar" || value === "hi";
}

export function localeDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function translate(locale: Locale, key: string): string {
  const dict = dictionaries[locale] ?? dictionaries.en;
  const parts = key.split(".");
  let node: unknown = dict;
  for (const part of parts) {
    if (node && typeof node === "object" && part in node) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return translate(DEFAULT_LOCALE, key);
    }
  }
  return typeof node === "string" ? node : key;
}

export type { Dictionary };
