import "server-only";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en").then((m) => m.default),
  hi: () => import("./dictionaries/hi").then((m) => m.default),
};

export const getDictionary = (locale: Locale) => dictionaries[locale]();
