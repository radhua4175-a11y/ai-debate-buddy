"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/client/api";
import { useErrorMessage } from "@/lib/client/use-error-message";
import { useI18n } from "@/lib/i18n/provider";
import { LIMITS } from "@/lib/limits";
import { btnPrimary, btnSecondary, card, errorBox, input } from "./styles";

export function TopicSuggester() {
  const { locale, dict } = useI18n();
  const errorMessage = useErrorMessage();
  const [interest, setInterest] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body = { locale, ...(interest.trim() ? { interest: interest.trim() } : {}) };
      const result = await api<{ topics: string[] }>("/api/topics", { body });
      setTopics(result.topics);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-labelledby="ai-topics" className={`${card} space-y-4`}>
      <div>
        <h2 id="ai-topics" className="text-xl font-bold">
          {dict.topics.aiTitle}
        </h2>
        <p className="text-muted">{dict.topics.aiSubtitle}</p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="interest" className="sr-only">
          {dict.topics.aiPlaceholder}
        </label>
        <input
          id="interest"
          type="text"
          value={interest}
          maxLength={LIMITS.interestMax}
          placeholder={dict.topics.aiPlaceholder}
          onChange={(e) => setInterest(e.target.value)}
          className={input}
        />
        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? dict.topics.aiLoading : dict.topics.aiButton}
        </button>
      </form>
      {error && (
        <p role="alert" className={errorBox}>
          {error}
        </p>
      )}
      {topics.length > 0 && (
        <div className="space-y-2" aria-live="polite">
          <h3 className="font-bold">{dict.topics.aiResults}</h3>
          <ul className="space-y-2">
            {topics.map((topic) => (
              <li key={topic} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-border p-3">
                <span className="min-w-0 flex-1">{topic}</span>
                <Link
                  href={`/${locale}/setup?custom=${encodeURIComponent(topic)}`}
                  className={`${btnSecondary} !px-4 !py-2 !text-base`}
                >
                  {dict.topics.practiceThis}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
