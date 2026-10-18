"use client";

import { useState } from "react";
import { api } from "@/lib/client/api";
import { useErrorMessage } from "@/lib/client/use-error-message";
import { useI18n } from "@/lib/i18n/provider";
import type { Hint } from "@/lib/types";
import { btnSecondary, errorBox } from "./styles";

interface Props {
  debateId: string;
  round: number;
  disabled: boolean;
  onUse: (text: string) => void;
}

/** "Need help?" side panel: small, on-demand hints (sentence starter, one fact, a way to answer back). */
export function HintPanel({ debateId, round, disabled, onUse }: Props) {
  const { dict } = useI18n();
  const errorMessage = useErrorMessage();
  const [hints, setHints] = useState<Record<number, Hint>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hint = hints[round];

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await api<{ hint: Hint }>(`/api/debates/${debateId}/hint`, { method: "POST" });
      setHints((current) => ({ ...current, [round]: result.hint }));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  const cards = hint
    ? [
        { title: dict.arena.startAnswer, text: hint.starter },
        { title: dict.arena.aFact, text: hint.fact },
        ...(hint.answerBack ? [{ title: dict.arena.answerBack, text: hint.answerBack }] : []),
      ]
    : [];

  return (
    <aside aria-labelledby="hints-title" className="space-y-3 rounded-3xl border-2 border-help/40 bg-help-soft p-5">
      <h2 id="hints-title" className="text-xl font-extrabold text-help">
        {dict.arena.needHelp} 💡
      </h2>
      {!hint && <p>{dict.arena.helpIntro}</p>}
      {!hint && (
        <button type="button" className={`${btnSecondary} w-full`} disabled={disabled || loading} onClick={() => void load()}>
          {loading ? dict.arena.helpLoading : dict.arena.getHints}
        </button>
      )}
      <ul className="space-y-3">
        {cards.map((card) => (
          <li key={card.title} className="rounded-2xl bg-card p-3">
            <p className="text-sm font-bold text-muted">{card.title}</p>
            <p className="my-1 text-lg">&ldquo;{card.text}&rdquo;</p>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onUse(card.text)}
              className="rounded-xl bg-help-soft px-3 py-1.5 font-bold text-help hover:underline disabled:opacity-50"
            >
              {dict.arena.useIt}
            </button>
          </li>
        ))}
      </ul>
      {error && (
        <p role="alert" className={errorBox}>
          {error}
        </p>
      )}
    </aside>
  );
}
