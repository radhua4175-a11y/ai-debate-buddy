"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { api } from "@/lib/client/api";
import { useApiResource } from "@/lib/client/use-api-resource";
import { useErrorMessage } from "@/lib/client/use-error-message";
import { useSpeechInput } from "@/lib/client/use-speech-input";
import { format } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";
import { LIMITS } from "@/lib/limits";
import { OPPONENT_EMOJI } from "@/lib/opponents";
import type { DebateDetail, DebateMessage } from "@/lib/types";
import { Countdown } from "./countdown";
import { HintPanel } from "./hint-panel";
import { MessageBubble } from "./message-bubble";
import { ResultsView } from "./results-view";
import { btnPrimary, btnSecondary, card, errorBox, input } from "./styles";

export function DebateRoom() {
  const { locale, dict } = useI18n();
  const { id } = useParams<{ id: string }>();
  const errorMessage = useErrorMessage();
  const { data, setData, error: loadError, reload } = useApiResource<{ debate: DebateDetail }>(`/api/debates/${id}`);
  const debate = data?.debate ?? null;

  const setDebate = useCallback(
    (update: (current: DebateDetail) => DebateDetail) =>
      setData((current) => (current ? { debate: update(current.debate) } : current)),
    [setData],
  );

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speechNote, setSpeechNote] = useState(false);
  const logEnd = useRef<HTMLDivElement>(null);

  const speech = useSpeechInput(locale, (text) => setDraft((current) => `${current} ${text}`.trim().slice(0, LIMITS.messageMax)));

  const messageCount = debate?.messages.length ?? 0;
  useEffect(() => {
    logEnd.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messageCount, sending]);

  if (loadError) {
    return (
      <div className={`${card} mx-auto max-w-xl space-y-4 text-center`}>
        <p role="alert">{loadError}</p>
        <div className="flex justify-center gap-3">
          <button className={btnSecondary} onClick={reload}>
            {dict.common.retry}
          </button>
          <Link href={`/${locale}`} className={btnSecondary}>
            {dict.common.back}
          </Link>
        </div>
      </div>
    );
  }
  if (!debate) return <p className="text-center text-muted">{dict.common.loading}</p>;

  if (debate.review) {
    return <ResultsView debate={debate} review={debate.review} />;
  }

  const opponentName = dict.setup.opponents[debate.opponent].name;
  const opponentEmoji = OPPONENT_EMOJI[debate.opponent];
  const messages = debate.messages.filter((m) => m.channel === "debate");
  const turnsUsed = messages.filter((m) => m.role === "user").length;
  const allRoundsDone = turnsUsed >= LIMITS.rounds;
  const round = Math.min(turnsUsed + 1, LIMITS.rounds);

  async function finish() {
    setFinishing(true);
    setError(null);
    try {
      const { debate: reviewed } = await api<{ debate: DebateDetail }>(`/api/debates/${id}/review`, {
        method: "POST",
      });
      setDebate(() => reviewed);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setFinishing(false);
    }
  }

  async function onSend(event: FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending || allRoundsDone) return;
    setSending(true);
    setError(null);
    try {
      const { messages: added } = await api<{ messages: DebateMessage[] }>(`/api/debates/${id}/messages`, {
        body: { content },
      });
      setDebate((current) => ({ ...current, messages: [...current.messages, ...added] }));
      setDraft("");
      setSending(false);
      // The last round wraps up straight into the results screen.
      if (turnsUsed + 1 >= LIMITS.rounds) await finish();
    } catch (e) {
      setError(errorMessage(e));
      setSending(false);
    }
  }

  function onTalk() {
    if (!speech.supported) {
      setSpeechNote(true);
      return;
    }
    speech.toggle();
  }

  const busy = sending || finishing;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={`/${locale}`} className="font-bold text-primary hover:underline">
            ← {dict.common.back}
          </Link>
          <h1 className="text-2xl font-extrabold text-balance sm:text-3xl">{debate.topic}</h1>
          <p className="font-semibold text-muted">
            {format(dict.arena.round, { round, rounds: LIMITS.rounds })}
          </p>
        </div>
        {!allRoundsDone && <Countdown key={round} seconds={debate.turn_seconds} paused={busy} />}
      </header>

      <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
        <section aria-label={opponentName} className={`${card} space-y-4`}>
          <div role="log" aria-live="polite" className="max-h-[50vh] min-h-48 space-y-4 overflow-y-auto pr-1">
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                author={m.role === "user" ? dict.common.you : opponentName}
                avatar={m.role === "user" ? "🙂" : opponentEmoji}
                mine={m.role === "user"}
                content={m.content}
              />
            ))}
            {sending && <p className="text-muted">{format(dict.arena.thinking, { name: opponentName })}</p>}
            {finishing && <p className="font-bold text-primary">{dict.arena.debateEnds}</p>}
            <div ref={logEnd} />
          </div>

          {allRoundsDone ? (
            <div className="space-y-3 text-center">
              <p className="text-lg font-bold">{dict.arena.wrapUp}</p>
              <button className={btnPrimary} disabled={finishing} onClick={() => void finish()}>
                {finishing ? dict.arena.ending : dict.arena.seeResults}
              </button>
            </div>
          ) : (
            <form onSubmit={onSend} className="space-y-3">
              <label htmlFor="idea" className="block text-xl font-extrabold">
                {dict.arena.yourTurn}
              </label>
              <textarea
                id="idea"
                value={draft}
                rows={3}
                maxLength={LIMITS.messageMax}
                placeholder={dict.arena.placeholder}
                disabled={busy}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit();
                }}
                className={input}
              />
              <p className="text-sm text-muted">{format(dict.arena.charsLeft, { count: LIMITS.messageMax - draft.length })}</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onTalk}
                  disabled={busy}
                  aria-pressed={speech.listening}
                  className={`${btnSecondary} flex-col !gap-0 !py-2 !text-base ${speech.listening ? "!border-timer !bg-timer-soft" : ""}`}
                >
                  <span aria-hidden>🎤</span>
                  {speech.listening ? dict.arena.listening : dict.arena.talk}
                </button>
                <button type="submit" className={`${btnPrimary} flex-1`} disabled={busy || !draft.trim()}>
                  {dict.arena.send}
                </button>
              </div>
              {speechNote && <p className="text-sm text-muted">{dict.errors.speech_unsupported}</p>}
            </form>
          )}
          {error && (
            <p role="alert" className={errorBox}>
              {error}
            </p>
          )}
        </section>

        {!allRoundsDone && (
          <HintPanel
            debateId={id}
            round={round}
            disabled={busy}
            onUse={(text) => setDraft((current) => `${current} ${text}`.trim().slice(0, LIMITS.messageMax))}
          />
        )}
      </div>
    </div>
  );
}
