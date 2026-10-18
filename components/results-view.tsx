"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/client/api";
import { useErrorMessage } from "@/lib/client/use-error-message";
import { useUser } from "@/lib/client/use-user";
import { format } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";
import { LIMITS } from "@/lib/limits";
import { skillKeys } from "@/lib/ratings";
import { sampleTopics } from "@/lib/topics";
import type { DebateDetail, DebateMessage, Review } from "@/lib/types";
import { MessageBubble } from "./message-bubble";
import { btnDanger, btnPrimary, btnSecondary, card, errorBox, input } from "./styles";

export function ResultsView({ debate, review }: { debate: DebateDetail; review: Review }) {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const name = useUser()?.name ?? "";
  const errorMessage = useErrorMessage();
  const [coachMessages, setCoachMessages] = useState(() => debate.messages.filter((m) => m.channel === "coach"));
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const opponentName = dict.setup.opponents[debate.opponent].name;
  const sample = sampleByQuestion(debate.topic);
  const sideText = debate.student_side === "for" ? dict.common.youAgreed : dict.common.youDisagreed;
  const setupHref = sample ? `/${locale}/setup?topic=${sample}` : `/${locale}/setup?custom=${encodeURIComponent(debate.topic)}`;

  async function ask(text: string) {
    const content = text.trim();
    if (!content || asking) return;
    setAsking(true);
    setError(null);
    try {
      const { messages } = await api<{ messages: DebateMessage[] }>(`/api/debates/${debate.id}/coach`, {
        body: { question: content },
      });
      setCoachMessages((current) => [...current, ...messages]);
      setQuestion("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setAsking(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void ask(question);
  }

  async function onDelete() {
    if (!window.confirm(dict.arena.deleteConfirm)) return;
    try {
      await api(`/api/debates/${debate.id}`, { method: "DELETE" });
      router.push(`/${locale}`);
    } catch (e) {
      setError(errorMessage(e));
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          {name ? format(dict.results.great, { name }) : dict.results.greatAnon} 🎉
        </h1>
        <p className="font-semibold text-muted">
          {format(dict.results.summaryLine, { topic: debate.topic, side: sideText, opponent: opponentName })}
        </p>
        <p className="text-lg">{review.summary}</p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <section className={card} aria-labelledby="skills">
          <h2 id="skills" className="mb-3 text-xl font-extrabold">
            {dict.results.yourSkills}
          </h2>
          <ul className="space-y-3">
            {skillKeys.map((key) => (
              <li key={key} className="flex items-center justify-between gap-3 text-lg font-semibold">
                <span>{dict.results.skills[key]}</span>
                <span
                  role="img"
                  aria-label={format(dict.common.starsOutOf, { count: review.ratings[key] })}
                  className="text-xl tracking-wider text-help"
                >
                  {"★".repeat(review.ratings[key])}
                  <span className="text-border">{"★".repeat(5 - review.ratings[key])}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-2 rounded-3xl border-2 border-help/40 bg-help-soft p-5" aria-labelledby="best">
          <h2 id="best" className="text-xl font-extrabold text-help">
            🏆 {dict.results.bestIdea}
          </h2>
          <blockquote className="text-xl font-semibold">&ldquo;{review.bestIdea.quote}&rdquo;</blockquote>
          <p>{format(dict.results.whyGreat, { why: review.bestIdea.why })}</p>
        </section>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <section className="rounded-3xl border-2 border-good/40 bg-good-soft p-5" aria-labelledby="good">
          <h2 id="good" className="mb-2 text-xl font-extrabold text-good">
            {dict.results.goodAt} 👍
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-lg">
            {review.wentWell.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-3xl border-2 border-next/40 bg-next-soft p-5" aria-labelledby="next">
          <h2 id="next" className="mb-2 text-xl font-extrabold text-next">
            {dict.results.tryNext} 🌱
          </h2>
          <ul className="list-disc space-y-1 pl-5 text-lg">
            {review.tryNextTime.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href={setupHref} className={btnPrimary}>
          🔁 {dict.results.playAgain}
        </Link>
        <Link href={`/${locale}`} className={btnSecondary}>
          🎲 {dict.results.newTopic}
        </Link>
        <Link href={`/${locale}/progress`} className={btnSecondary}>
          {dict.results.myProgress} →
        </Link>
      </div>

      <section className={`${card} space-y-4`} aria-labelledby="coach-title">
        <div>
          <h2 id="coach-title" className="text-xl font-extrabold">
            {dict.results.askTitle}
          </h2>
          <p className="text-muted">{dict.results.askSubtitle}</p>
        </div>
        {coachMessages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {dict.results.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                className={`${btnSecondary} !px-4 !py-2 !text-base`}
                disabled={asking}
                onClick={() => void ask(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div role="log" aria-live="polite" className="space-y-4">
          {coachMessages.map((m) => (
            <MessageBubble
              key={m.id}
              author={m.role === "user" ? dict.common.you : dict.common.coach}
              avatar={m.role === "user" ? "🙂" : "🧑‍🏫"}
              mine={m.role === "user"}
              content={m.content}
            />
          ))}
          {asking && <p className="text-muted">{dict.results.asking}</p>}
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="coach-question" className="sr-only">
            {dict.results.askPlaceholder}
          </label>
          <input
            id="coach-question"
            value={question}
            maxLength={LIMITS.questionMax}
            placeholder={dict.results.askPlaceholder}
            disabled={asking}
            onChange={(e) => setQuestion(e.target.value)}
            className={input}
          />
          <button type="submit" className={btnPrimary} disabled={asking || !question.trim()}>
            {dict.results.ask}
          </button>
        </form>
        {error && (
          <p role="alert" className={errorBox}>
            {error}
          </p>
        )}
      </section>

      <button className={btnDanger} onClick={() => void onDelete()}>
        {dict.common.delete}
      </button>
    </div>
  );
}

function sampleByQuestion(topic: string): string | undefined {
  return sampleTopics.find((t) => Object.values(t.question).includes(topic))?.id;
}
