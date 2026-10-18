"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useApiResource } from "@/lib/client/use-api-resource";
import { format } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";
import { LIMITS } from "@/lib/limits";
import { debateStars } from "@/lib/ratings";
import { sampleTopics } from "@/lib/topics";
import { DIFFICULTIES, type DebateSummary, type Difficulty } from "@/lib/types";
import { btnPrimary, card, input } from "./styles";

export function HomeScreen() {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const [level, setLevel] = useState<Difficulty>("easy");
  const [own, setOwn] = useState("");
  const { data } = useApiResource<{ debates: DebateSummary[] }>("/api/debates");
  const recent = data?.debates.slice(0, 3) ?? [];

  const start = (query: string) => router.push(`/${locale}/setup?${query}&level=${level}`);

  function onOwn(event: FormEvent) {
    event.preventDefault();
    const topic = own.trim();
    if (topic.length >= LIMITS.topicMin) start(`custom=${encodeURIComponent(topic)}`);
  }

  const surprise = () => start(`topic=${sampleTopics[Math.floor(Math.random() * sampleTopics.length)].id}`);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <section aria-labelledby="home-title" className="space-y-6">
        <header className="space-y-1">
          <h1 id="home-title" className="text-3xl font-extrabold text-balance sm:text-4xl">
            {dict.home.title}
          </h1>
          <p className="text-lg text-muted">{dict.home.tapTopic}</p>
        </header>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {sampleTopics.map((topic) => (
            <li key={topic.id}>
              <button
                type="button"
                onClick={() => start(`topic=${topic.id}`)}
                className="flex h-full w-full flex-col items-start gap-2 rounded-3xl border-2 border-border bg-card p-4 text-left transition-colors hover:border-primary"
              >
                <span aria-hidden className="text-4xl">
                  {topic.emoji}
                </span>
                <span className="text-sm font-semibold text-muted">{dict.home.categories[topic.category]}</span>
                <span className="text-lg font-bold leading-snug">{topic.question[locale]}</span>
              </button>
            </li>
          ))}
        </ul>

        <form onSubmit={onOwn} className={`${card} space-y-3`}>
          <label htmlFor="own-topic" className="block text-lg font-bold">
            ✏️ {dict.home.ownTopic}
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="own-topic"
              value={own}
              maxLength={LIMITS.topicMax}
              placeholder={dict.home.ownPlaceholder}
              onChange={(e) => setOwn(e.target.value)}
              className={input}
            />
            <button type="submit" className={btnPrimary} disabled={own.trim().length < LIMITS.topicMin}>
              {dict.home.ownGo}
            </button>
          </div>
        </form>

        <Link href={`/${locale}/topics`} className="inline-block font-bold text-primary underline-offset-4 hover:underline">
          {dict.home.moreTopics} →
        </Link>
      </section>

      <aside className="space-y-5">
        <button type="button" onClick={surprise} className={`${btnPrimary} w-full`}>
          🎲 {dict.home.surprise}
        </button>

        <fieldset className={`${card} space-y-3`}>
          <legend className="px-1 text-lg font-bold">{dict.home.howTricky}</legend>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTIES.map((value, index) => (
              <label
                key={value}
                className="flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 border-border p-2 text-center font-bold has-[:checked]:border-good has-[:checked]:bg-good-soft has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--ring)]"
              >
                <input
                  type="radio"
                  name="level"
                  value={value}
                  checked={level === value}
                  onChange={() => setLevel(value)}
                  className="sr-only"
                />
                <span>{dict.home.levels[value]}</span>
                <span aria-hidden className="text-help">
                  {"★".repeat(index + 1)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <section className={`${card} space-y-3`} aria-labelledby="last-debates">
          <h2 id="last-debates" className="text-lg font-bold">
            {dict.home.myLast}
          </h2>
          {recent.length === 0 ? (
            <p className="text-muted">{dict.home.noDebates}</p>
          ) : (
            <ul className="space-y-2">
              {recent.map((debate) => (
                <li key={debate.id}>
                  <Link
                    href={`/${locale}/debate/${debate.id}`}
                    className="flex items-center justify-between gap-2 rounded-xl p-2 hover:bg-primary/10"
                  >
                    <span className="font-semibold">{debate.topic}</span>
                    {debate.review && (
                      <span
                        className="shrink-0 text-help"
                        role="img"
                        aria-label={format(dict.common.starsOutOf, { count: debateStars(debate.review.ratings) })}
                      >
                        {"★".repeat(debateStars(debate.review.ratings))}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link href={`/${locale}/progress`} className="block font-bold text-primary hover:underline">
            {dict.home.seeProgress} →
          </Link>
        </section>
      </aside>
    </div>
  );
}
