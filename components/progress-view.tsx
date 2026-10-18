"use client";

import Link from "next/link";
import { useApiResource } from "@/lib/client/use-api-resource";
import { format } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";
import { badgeIds, debateStars, starSeries, streakDays, totalStars, unlockedBadges, type BadgeId } from "@/lib/ratings";
import type { DebateSummary } from "@/lib/types";
import { btnPrimary, btnSecondary, card } from "./styles";

const BADGE_EMOJI: Record<BadgeId, string> = { thinker: "🧠", finder: "📚", coolhead: "😎", champ: "🏆" };

export function ProgressView() {
  const { locale, dict } = useI18n();
  const { data, error, reload } = useApiResource<{ debates: DebateSummary[] }>("/api/debates");

  if (error) {
    return (
      <div className={`${card} mx-auto max-w-xl space-y-3 text-center`}>
        <p role="alert">{error}</p>
        <button className={btnSecondary} onClick={reload}>
          {dict.common.retry}
        </button>
      </div>
    );
  }
  if (!data) return <p className="text-center text-muted">{dict.common.loading}</p>;

  const debates = data.debates;
  const series = starSeries(debates);
  const badges = unlockedBadges(debates);
  const stats = [
    { emoji: "🗣", value: debates.length, label: dict.progress.debates },
    { emoji: "⭐", value: totalStars(debates), label: dict.progress.starsEarned },
    { emoji: "🔥", value: streakDays(debates), label: dict.progress.daysInRow },
  ];
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const dayLabel = (iso: string) => {
    const date = new Date(iso);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return dict.progress.today;
    today.setDate(today.getDate() - 1);
    return date.toDateString() === today.toDateString() ? dict.progress.yesterday : dateFormat.format(date);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-3xl font-extrabold">🗺 {dict.progress.title}</h1>

      <ul className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <li key={stat.label} className={`${card} text-center`}>
            <p aria-hidden className="text-3xl">
              {stat.emoji}
            </p>
            <p className="text-3xl font-extrabold">{stat.value}</p>
            <p className="text-muted">{stat.label}</p>
          </li>
        ))}
      </ul>

      <div className="grid gap-5 md:grid-cols-2">
        <section className={card} aria-labelledby="stars-over-time">
          <h2 id="stars-over-time" className="mb-3 text-xl font-extrabold">
            {dict.progress.starsOverTime}
          </h2>
          {series.length < 2 ? (
            <p className="text-muted">{dict.progress.notEnough}</p>
          ) : (
            <ul className="flex h-36 items-end gap-2">
              {series.map((stars, index) => (
                <li
                  key={index}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1"
                  role="img"
                  aria-label={format(dict.common.starsOutOf, { count: stars })}
                >
                  <span className="text-sm font-bold">{stars}</span>
                  <span className="w-full rounded-t-lg bg-help" style={{ height: `${(stars / 5) * 80}%` }} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={card} aria-labelledby="badges">
          <h2 id="badges" className="mb-3 text-xl font-extrabold">
            {dict.progress.myBadges}
          </h2>
          <ul className="grid grid-cols-2 gap-3">
            {badgeIds.map((id) => {
              const unlocked = badges.has(id);
              return (
                <li
                  key={id}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center font-bold ${
                    unlocked ? "border-good/40 bg-good-soft" : "border-border opacity-70"
                  }`}
                >
                  <span aria-hidden className="text-3xl">
                    {unlocked ? BADGE_EMOJI[id] : "🔒"}
                  </span>
                  <span>{dict.progress.badges[id]}</span>
                  {!unlocked && <span className="sr-only">{dict.progress.locked}</span>}
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className={`${card} space-y-3`} aria-labelledby="my-debates">
        <h2 id="my-debates" className="text-xl font-extrabold">
          {dict.progress.myDebates}
        </h2>
        {debates.length === 0 ? (
          <div className="space-y-3">
            <p className="text-muted">{dict.progress.empty}</p>
            <Link href={`/${locale}`} className={btnPrimary}>
              {dict.progress.startFirst}
            </Link>
          </div>
        ) : (
          <ul className="divide-y-2 divide-border">
            {debates.map((debate) => (
              <li key={debate.id}>
                <Link
                  href={`/${locale}/debate/${debate.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 hover:text-primary"
                >
                  <span>
                    <span className="block text-lg font-bold">{debate.topic}</span>
                    <span className="text-sm text-muted">{dayLabel(debate.created_at)}</span>
                  </span>
                  {debate.review ? (
                    <span
                      className="text-xl text-help"
                      role="img"
                      aria-label={format(dict.common.starsOutOf, { count: debateStars(debate.review.ratings) })}
                    >
                      {"★".repeat(debateStars(debate.review.ratings))}
                    </span>
                  ) : (
                    <span className="font-semibold text-timer">{dict.progress.inProgress}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
