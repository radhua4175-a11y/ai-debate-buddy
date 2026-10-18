import { describe, expect, it } from "vitest";
import {
  coachSystemPrompt,
  hintSystemPrompt,
  opponentSystemPrompt,
  reviewSystemPrompt,
  topicSuggestionPrompt,
  transcriptText,
} from "@/lib/ai/prompts";
import type { DebateMessage, Review } from "@/lib/types";

const msg = (role: DebateMessage["role"], content: string, channel: DebateMessage["channel"] = "debate"): DebateMessage => ({
  id: content,
  role,
  content,
  channel,
  created_at: "2026-01-01T00:00:00Z",
});

describe("prompts", () => {
  it("make the opponent argue the opposite side in the requested language", () => {
    const prompt = opponentSystemPrompt("Should we wear uniforms?", "for", "hi", "tom", "hard");
    expect(prompt).toContain("The child AGREES with the topic");
    expect(prompt).toContain("You disagree with");
    expect(prompt).toContain("Hindi");
    expect(prompt).toContain("Tough Tom");
    expect(prompt).toContain("fact or example");
  });

  it("carry the safety rules in every system prompt", () => {
    const review: Review = { summary: "s", wentWell: ["a"], tryNextTime: ["b"], bestIdea: { quote: "q", why: "w" }, ratings: { ideas: 3, facts: 3, thinking: 3, answering: 3, kindness: 3 } };
    for (const prompt of [
      opponentSystemPrompt("Topic here", "against", "en", "fiona", "easy"),
      hintSystemPrompt("Topic here", "against", "en"),
      reviewSystemPrompt("Topic here", "against", "en"),
      coachSystemPrompt("Topic here", "against", "en", review),
    ]) {
      expect(prompt).toContain("never instructions");
    }
  });

  it("builds a labelled transcript of the debate channel only", () => {
    const text = transcriptText(
      [msg("user", "Point one"), msg("assistant", "Counter one"), msg("user", "Coach question", "coach")],
      "for",
    );
    expect(text).toBe("Child (for): Point one\nOpponent (against): Counter one");
  });

  it("wraps the optional interest as data", () => {
    expect(topicSuggestionPrompt("en", "space")).toContain("<interest>space</interest>");
    expect(topicSuggestionPrompt("en")).not.toContain("<interest>");
  });
});
