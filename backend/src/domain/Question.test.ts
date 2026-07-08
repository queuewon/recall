import { describe, expect, it } from "vitest";
import { QuestionSchema } from "./Question";

const noteId = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
const questionId = "5b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e6f";
const conceptId = "7c2c8c3f-7f3f-4d2b-9f3c-2b3c4d5e6f7a";

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

  it("rejects ActiveRecall without conceptId", () => {
    const result = QuestionSchema.safeParse({
      type: "ActiveRecall",
      id: questionId,
      noteId,
      prompt: "이 개념을 설명하세요"
    });

    expect(result.success).toBe(false);
  });

  it("parses a valid ActiveRecall question", () => {
    const question = {
      type: "ActiveRecall" as const,
      id: questionId,
      noteId,
      prompt: "이 개념을 설명하세요",
      conceptId
    };

    expect(QuestionSchema.parse(question).type).toBe("ActiveRecall");
  });
});
