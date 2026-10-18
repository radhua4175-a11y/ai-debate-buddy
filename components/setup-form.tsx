"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client/api";
import { useErrorMessage } from "@/lib/client/use-error-message";
import { format } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";
import { LIMITS, TURN_SECONDS } from "@/lib/limits";
import { OPPONENT_EMOJI } from "@/lib/opponents";
import { getSampleTopic } from "@/lib/topics";
import { DIFFICULTIES, OPPONENTS, type DebateSummary, type Opponent, type Side } from "@/lib/types";
import { btnPrimary, card, errorBox } from "./styles";

const choice =
  "flex cursor-pointer gap-3 rounded-2xl border-2 border-border p-4 has-[:checked]:border-good has-[:checked]:bg-good-soft has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--ring)]";

export function SetupForm() {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const errorMessage = useErrorMessage();

  const sample = getSampleTopic(params.get("topic") ?? "");
  const custom = (params.get("custom") ?? "").replace(/\s+/g, " ").trim().slice(0, LIMITS.topicMax);
  const topic = sample?.question[locale] ?? custom;
  const levelParam = params.get("level");
  const difficulty = DIFFICULTIES.find((d) => d === levelParam) ?? "easy";

  const [side, setSide] = useState<Side>("for");
  const [opponent, setOpponent] = useState<Opponent>("fiona");
  const [turnSeconds, setTurnSeconds] = useState<(typeof TURN_SECONDS)[number]>(60);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (topic.length < LIMITS.topicMin) {
    return (
      <div className={`${card} mx-auto max-w-xl space-y-4 text-center`}>
        <p>{dict.setup.needTopic}</p>
        <Link href={`/${locale}`} className={btnPrimary}>
          {dict.common.back}
        </Link>
      </div>
    );
  }

  async function start() {
    setPending(true);
    setError(null);
    try {
      const { debate } = await api<{ debate: DebateSummary }>("/api/debates", {
        body: { topic, side, opponent, difficulty, turnSeconds, locale },
      });
      router.push(`/${locale}/debate/${debate.id}`);
    } catch (e) {
      setError(errorMessage(e));
      setPending(false);
    }
  }

  const sides: { value: Side; emoji: string; label: string; text?: string }[] = [
    { value: "for", emoji: "👍", label: dict.common.agree, text: sample?.agree[locale] },
    { value: "against", emoji: "👎", label: dict.common.disagree, text: sample?.disagree[locale] },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href={`/${locale}`} className="inline-block font-bold text-primary hover:underline">
        ← {dict.common.back}
      </Link>
      <h1 className="text-3xl font-extrabold">{dict.setup.title}</h1>

      <div className={card}>
        <p className="text-sm font-semibold text-muted">{dict.setup.yourTopic}</p>
        <p className="text-2xl font-bold text-balance">
          {sample?.emoji && <span aria-hidden>{sample.emoji} </span>}
          {topic}
        </p>
      </div>

      <fieldset className="space-y-3" disabled={pending}>
        <legend className="mb-2 text-xl font-bold">{dict.setup.pickSide}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {sides.map((item) => (
            <label key={item.value} className={`${choice} items-center`}>
              <input
                type="radio"
                name="side"
                value={item.value}
                checked={side === item.value}
                onChange={() => setSide(item.value)}
                className="sr-only"
              />
              <span aria-hidden className="text-3xl">
                {item.emoji}
              </span>
              <span>
                <span className="block text-lg font-extrabold uppercase">{item.label}</span>
                {item.text && <span className="block">{item.text}</span>}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3" disabled={pending}>
        <legend className="mb-2 text-xl font-bold">{dict.setup.pickOpponent}</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {OPPONENTS.map((value) => (
            <label key={value} className={`${choice} flex-col items-center text-center`}>
              <input
                type="radio"
                name="opponent"
                value={value}
                checked={opponent === value}
                onChange={() => setOpponent(value)}
                className="sr-only"
              />
              <span aria-hidden className="text-4xl">
                {OPPONENT_EMOJI[value]}
              </span>
              <span className="text-lg font-bold">{dict.setup.opponents[value].name}</span>
              <span className="text-sm text-muted">{dict.setup.opponents[value].about}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3" disabled={pending}>
        <legend className="mb-2 text-xl font-bold">{dict.setup.pickTime}</legend>
        <div className="grid grid-cols-2 gap-3">
          {TURN_SECONDS.map((value) => (
            <label key={value} className={`${choice} items-center justify-center text-lg font-bold`}>
              <input
                type="radio"
                name="time"
                value={value}
                checked={turnSeconds === value}
                onChange={() => setTurnSeconds(value)}
                className="sr-only"
              />
              <span aria-hidden>⏱</span> {value === 60 ? dict.setup.minute : dict.setup.twoMinutes}
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <p role="alert" className={errorBox}>
          {error}
        </p>
      )}

      <div className="space-y-2 text-center">
        <button type="button" onClick={() => void start()} disabled={pending} className={`${btnPrimary} w-full text-xl`}>
          {pending ? dict.setup.starting : dict.setup.start}
        </button>
        <p className="text-muted">{format(dict.setup.format, { rounds: LIMITS.rounds })}</p>
      </div>
    </div>
  );
}
