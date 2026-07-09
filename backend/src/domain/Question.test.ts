import { describe, expect, it } from "vitest";
import { QuestionSchema } from "./Question";

const noteId = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
const questionId = "5b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e6f";
const conceptId = "7c2c8c3f-7f3f-4d2b-9f3c-2b3c4d5e6f7a";
const conceptId2 = "8c2c8c3f-7f3f-4d2b-9f3c-2b3c4d5e6f7b";

describe("QuestionSchema", () => {
  it("parses a valid MultipleChoice question", () => {
    const question = {
      type: "MultipleChoice" as const,
      id: questionId,
      noteId,
      prompt: "다음 중 옳은 것은?",
      options: ["A", "B", "C", "D"] as [string, string, string, string],
      correctIndex: 2
    };

    expect(QuestionSchema.parse(question).type).toBe("MultipleChoice");
  });

  it("rejects MultipleChoice with fewer than 4 options", () => {
    const result = QuestionSchema.safeParse({
      type: "MultipleChoice",
      id: questionId,
      noteId,
      prompt: "질문",
      options: ["A", "B", "C"],
      correctIndex: 0
    });

    expect(result.success).toBe(false);
  });

  it("rejects MultipleChoice with correctIndex out of range", () => {
    const result = QuestionSchema.safeParse({
      type: "MultipleChoice",
      id: questionId,
      noteId,
      prompt: "질문",
      options: ["A", "B", "C", "D"],
      correctIndex: 4
    });

    expect(result.success).toBe(false);
  });

  it("rejects ActiveRecall without conceptIds", () => {
    const result = QuestionSchema.safeParse({
      type: "ActiveRecall",
      id: questionId,
      noteId,
      prompt: "원화 약세가 항상 수출 호재가 아닌 이유 3가지"
    });

    expect(result.success).toBe(false);
  });

  it("rejects ActiveRecall with fewer than 2 conceptIds", () => {
    const result = QuestionSchema.safeParse({
      type: "ActiveRecall",
      id: questionId,
      noteId,
      prompt: "원화 약세가 항상 수출 호재가 아닌 이유 3가지",
      conceptIds: [conceptId]
    });

    expect(result.success).toBe(false);
  });

  it("parses a valid ActiveRecall question with 2 or more conceptIds", () => {
    const question = {
      type: "ActiveRecall" as const,
      id: questionId,
      noteId,
      prompt: "원화 약세가 항상 수출 호재가 아닌 이유 3가지",
      conceptIds: [conceptId, conceptId2]
    };

    expect(QuestionSchema.parse(question)).toEqual(question);
  });

  it("parses a ShortAnswer question with an optional conceptId", () => {
    const question = {
      type: "ShortAnswer" as const,
      id: questionId,
      noteId,
      prompt: "질문",
      conceptId
    };

    expect(QuestionSchema.parse(question)).toEqual(question);
  });

  it("parses a ShortAnswer question without a conceptId", () => {
    const question = {
      type: "ShortAnswer" as const,
      id: questionId,
      noteId,
      prompt: "질문"
    };

    expect(QuestionSchema.parse(question)).toEqual(question);
  });

  it("parses an Essay question with an optional conceptId", () => {
    const question = {
      type: "Essay" as const,
      id: questionId,
      noteId,
      prompt: "불황형 흑자를 설명하시오",
      conceptId
    };

    expect(QuestionSchema.parse(question)).toEqual(question);
  });

  it("parses an Essay question without a conceptId", () => {
    const question = {
      type: "Essay" as const,
      id: questionId,
      noteId,
      prompt: "불황형 흑자를 설명하시오"
    };

    expect(QuestionSchema.parse(question)).toEqual(question);
  });
});
