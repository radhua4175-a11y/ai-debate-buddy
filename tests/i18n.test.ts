import { describe, expect, it } from "vitest";
import { defaultLocale, format, isLocale, locales, negotiateLocale } from "@/lib/i18n/config";
import en from "@/lib/i18n/dictionaries/en";
import hi from "@/lib/i18n/dictionaries/hi";
import { API_ERROR_CODES } from "@/lib/types";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]));
  }
  return typeof value;
}

function placeholders(value: unknown): string[] {
  if (typeof value === "string") return [...value.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
  if (Array.isArray(value)) return value.flatMap(placeholders);
  if (value && typeof value === "object") return Object.values(value).flatMap(placeholders);
  return [];
}

describe("dictionaries", () => {
  it("have identical keys and array lengths in every locale", () => {
    expect(shape(hi)).toEqual(shape(en));
  });

  it("use the same placeholders in every locale", () => {
    const flatten = (dict: object): Record<string, string[]> => {
      const out: Record<string, string[]> = {};
      const walk = (value: unknown, path: string) => {
        if (typeof value === "string") out[path] = placeholders(value);
        else if (value && typeof value === "object")
          for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`);
      };
      walk(dict, "");
      return out;
    };
    expect(flatten(hi)).toEqual(flatten(en));
  });

  it("have no empty strings", () => {
    const empties = (value: unknown): number =>
      typeof value === "string"
        ? Number(value.trim() === "")
        : value && typeof value === "object"
          ? Object.values(value).reduce<number>((n, v) => n + empties(v), 0)
          : 0;
    expect(empties(en) + empties(hi)).toBe(0);
  });

  it("translate every API error code in every locale", () => {
    for (const dict of [en, hi]) {
      for (const code of API_ERROR_CODES) expect(dict.errors[code]).toBeTruthy();
      expect(dict.errors.network).toBeTruthy();
    }
  });
});

describe("locale helpers", () => {
  it("recognises supported locales only", () => {
    expect(locales.every(isLocale)).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  it("negotiates from Accept-Language", () => {
    expect(negotiateLocale("hi-IN,hi;q=0.9,en;q=0.8")).toBe("hi");
    expect(negotiateLocale("fr-FR,fr;q=0.9,en;q=0.5")).toBe("en");
    expect(negotiateLocale("en;q=0.2, hi;q=0.9")).toBe("hi");
    expect(negotiateLocale("fr")).toBe(defaultLocale);
    expect(negotiateLocale(null)).toBe(defaultLocale);
    expect(negotiateLocale("hi;q=abc")).toBe(defaultLocale);
  });

  it("formats placeholders and leaves unknown ones", () => {
    expect(format("Turn {used} of {max}", { used: 2, max: 12 })).toBe("Turn 2 of 12");
    expect(format("Hi {name}", {})).toBe("Hi {name}");
  });
});
