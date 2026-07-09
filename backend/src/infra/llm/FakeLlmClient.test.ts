import { describe, expect, it } from "vitest";
import { FakeLlmClient } from "./FakeLlmClient";
import { gradeShortAnswerTemplate } from "./gradeShortAnswer.template";
import { summarizeNoteTemplate } from "./summarizeNote.template";

describe("FakeLlmClient", () => {
  it("returns the fixed success response it was constructed with", async () => {
    const client = new FakeLlmClient({ ok: true, data: { summary: "요약" } });

    const result = await client.complete(summarizeNoteTemplate, { noteContent: "내용" });

    expect(result).toEqual({ ok: true, data: { summary: "요약" } });
  });

  it("returns the fixed failure response it was constructed with", async () => {
    const client = new FakeLlmClient({
      ok: false,
      error: { type: "invalid_response", message: "schema mismatch" }
    });

    const result = await client.complete(summarizeNoteTemplate, { noteContent: "내용" });

    expect(result).toEqual({
      ok: false,
      error: { type: "invalid_response", message: "schema mismatch" }
    });
  });

  it("routes to a per-template response when constructed with a responder function", async () => {
    const client = new FakeLlmClient((template) => {
      if (template.name === "summarize-note") {
        return { ok: true, data: { summary: "요약" } };
      }
      if (template.name === "grade-short-answer") {
        return { ok: true, data: { score: 90, issues: [], comment: "좋습니다" } };
      }
      throw new Error(`unexpected template: ${template.name}`);
    });

    const summaryResult = await client.complete(summarizeNoteTemplate, { noteContent: "내용" });
    const gradeResult = await client.complete(gradeShortAnswerTemplate, {
      conceptTerm: "재귀",
      conceptExplanation: "자기 자신을 호출하는 함수",
      question: "재귀란?",
      answer: "답변"
    });

    expect(summaryResult).toEqual({ ok: true, data: { summary: "요약" } });
    expect(gradeResult).toEqual({ ok: true, data: { score: 90, issues: [], comment: "좋습니다" } });
  });
});
