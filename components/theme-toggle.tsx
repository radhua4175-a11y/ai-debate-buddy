"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY, type Theme } from "@/lib/client/theme";
import { useI18n } from "@/lib/i18n/provider";

const EVENT = "debate-buddy:theme-change";

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener(EVENT, onChange);
  media.addEventListener("change", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    media.removeEventListener("change", onChange);
  };
}

function currentTheme(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const { dict } = useI18n();
  const theme = useSyncExternalStore(subscribe, currentTheme, () => null);
  const next: Theme = theme === "dark" ? "light" : "dark";

  function toggle() {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // storage unavailable: the choice lasts for this page only
    }
    window.dispatchEvent(new Event(EVENT));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={next === "light" ? dict.common.lightMode : dict.common.darkMode}
      title={next === "light" ? dict.common.lightMode : dict.common.darkMode}
      className="grid size-10 place-items-center rounded-xl border-2 border-border text-xl hover:border-primary"
    >
      <span aria-hidden>{theme === null ? "" : theme === "dark" ? "☀️" : "🌙"}</span>
    </button>
  );
}
