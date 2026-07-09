import { describe, expect, it } from "vitest";
import { FakeLlmClient } from "../infra/llm/FakeLlmClient";
import { createDefaultGradingPolicy, gradeMultipleChoiceDeterministically } from "./GradingPolicy";
import {
  parseAnswerId,
  parseConceptId,
  parseNoteId,
  parseQuestionId,
  type Answer,
  type Concept,
  type EssayQuestion,
  type MultipleChoiceQuestion,
  type ShortAnswerQuestion
} from "../domain";

const noteId = parseNoteId("3fa85f64-5717-4562-b3fc-2c963f66afa6");
const questionId = parseQuestionId("5b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e6f");
const answerId = parseAnswerId("2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e");
const conceptId = parseConceptId("7c2c8c3f-7f3f-4d2b-9f3c-2b3c4d5e6f7a");

const mcQuestion: MultipleChoiceQuestion = {
  type: "MultipleChoice",
  id: questionId,
  noteId,
  prompt: "다음 중 옳은 것은?",
  options: ["A", "B", "C", "D"],
  correctIndex: 2
};

const shortAnswerQuestion: ShortAnswerQuestion = {
  type: "ShortAnswer",
  id: questionId,
  noteId,
  prompt: "재귀란 무엇인가?",
  conceptId
};

const essayQuestion: EssayQuestion = {
  type: "Essay",
  id: questionId,
  noteId,
  prompt: "불황형 흑자를 설명하시오",
  conceptId
};

const concept: Concept = {
  id: conceptId,
  noteId,
  term: "재귀",
  explanation: "자기 자신을 호출하는 함수"
};

function makeAnswer(content: string): Answer {
  return { id: answerId, questionId, content, submittedAt: new Date("2026-01-01T00:00:00Z") };
}

describe("gradeMultipleChoiceDeterministically", () => {
  it("returns a perfect score when the correct index is submitted", () => {
    const result = gradeMultipleChoiceDeterministically(mcQuestion, makeAnswer("2"));

    expect(result).toEqual({
      ok: true,
      feedback: { answerId, score: 100, issues: [], comment: expect.any(String) }
    });
  });

  it("returns a zero score with conceptConfusion when the wrong index is submitted", () => {
    const result = gradeMultipleChoiceDeterministically(mcQuestion, makeAnswer("0"));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.feedback.score).toBe(0);
      expect(result.feedback.issues).toEqual([{ type: "conceptConfusion" }]);
      expect(result.feedback.comment).toContain("C");
    }
  });

  it("returns malformed_answer when the content is not a number", () => {
    const result = gradeMultipleChoiceDeterministically(mcQuestion, makeAnswer("모르겠어요"));

    expect(result).toEqual({
      ok: false,
      error: { type: "malformed_answer", message: expect.any(String) }
    });
  });

  it("returns malformed_answer when the index is out of range", () => {
    const result = gradeMultipleChoiceDeterministically(mcQuestion, makeAnswer("7"));

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe("malformed_answer");
    }
  });
});

describe("createDefaultGradingPolicy", () => {
  it("grades MultipleChoice deterministically without calling the LLM", async () => {
    const llm = new FakeLlmClient({
      ok: false,
      error: { type: "network", message: "should not be called" }
    });
    const policy = createDefaultGradingPolicy(llm);

    const result = await policy.grade(mcQuestion, makeAnswer("2"), null);

    expect(result).toEqual({
      ok: true,
      feedback: { answerId, score: 100, issues: [], comment: expect.any(String) }
    });
  });

  it("grades ShortAnswer via the LLM and maps the structured response to Feedback", async () => {
    const llm = new FakeLlmClient({
      ok: true,
      data: { score: 80, issues: ["logicGap"], comment: "논리 전개를 보강하세요" }
    });
    const policy = createDefaultGradingPolicy(llm);

    const result = await policy.grade(
      shortAnswerQuestion,
      makeAnswer("자기 자신을 부르는 것"),
      concept
    );

    expect(result).toEqual({
      ok: true,
      feedback: {
        answerId,
        score: 80,
        issues: [{ type: "logicGap" }],
        comment: "논리 전개를 보강하세요"
      }
    });
  });

  it("returns missing_concept when grading ShortAnswer without a concept", async () => {
    const llm = new FakeLlmClient({
      ok: false,
      error: { type: "network", message: "should not be called" }
    });
    const policy = createDefaultGradingPolicy(llm);

    const result = await policy.grade(shortAnswerQuestion, makeAnswer("답변"), null);

    expect(result).toEqual({
      ok: false,
      error: { type: "missing_concept", message: expect.any(String) }
    });
  });

  it("propagates an llm_error when the LLM call fails", async () => {
    const llm = new FakeLlmClient({
      ok: false,
      error: { type: "rate_limit", message: "too many requests" }
    });
    const policy = createDefaultGradingPolicy(llm);

    const result = await policy.grade(shortAnswerQuestion, makeAnswer("답변"), concept);

    expect(result).toEqual({
      ok: false,
      error: { type: "llm_error", error: { type: "rate_limit", message: "too many requests" } }
    });
  });

  it("grades Essay via the LLM and maps the structured response to Feedback", async () => {
    const llm = new FakeLlmClient({
      ok: true,
      data: { score: 65, issues: ["counterexampleMissing"], comment: "반례를 더 제시하세요" }
    });
    const policy = createDefaultGradingPolicy(llm);

    const result = await policy.grade(essayQuestion, makeAnswer("서술 답안입니다"), concept);

    expect(result).toEqual({
      ok: true,
      feedback: {
        answerId,
        score: 65,
        issues: [{ type: "counterexampleMissing" }],
        comment: "반례를 더 제시하세요"
      }
    });
  });

  it("returns missing_concept when grading Essay without a concept", async () => {
    const llm = new FakeLlmClient({
      ok: false,
      error: { type: "network", message: "should not be called" }
    });
    const policy = createDefaultGradingPolicy(llm);

    const result = await policy.grade(essayQuestion, makeAnswer("서술 답안입니다"), null);

    expect(result).toEqual({
      ok: false,
      error: { type: "missing_concept", message: expect.any(String) }
    });
  });

  it("propagates an llm_error when grading Essay and the LLM call fails", async () => {
    const llm = new FakeLlmClient({
      ok: false,
      error: { type: "rate_limit", message: "too many requests" }
    });
    const policy = createDefaultGradingPolicy(llm);

    const result = await policy.grade(essayQuestion, makeAnswer("서술 답안입니다"), concept);

    expect(result).toEqual({
      ok: false,
      error: { type: "llm_error", error: { type: "rate_limit", message: "too many requests" } }
    });
  });
});
