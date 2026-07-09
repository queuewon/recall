import { describe, expect, it } from "vitest";
import { QuestionSchema } from "./question";

const validMultipleChoice = {
  type: "MultipleChoice",
  id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  noteId: "6b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e70",
  prompt: "다음 중 옳은 것은?",
  options: ["A", "B", "C", "D"],
  correctIndex: 1
};

describe("QuestionSchema", () => {
  it("parses a valid MultipleChoice question", () => {
    expect(QuestionSchema.parse(validMultipleChoice)).toEqual(validMultipleChoice);
  });

  it("parses a valid ShortAnswer question without a conceptId", () => {
    const question = {
      type: "ShortAnswer",
      id: "5b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e6f",
      noteId: "6b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e70",
      prompt: "재귀란 무엇인가?"
    };

    expect(QuestionSchema.parse(question)).toEqual(question);
  });

  it("rejects a type outside the defined union", () => {
    const result = QuestionSchema.safeParse({ ...validMultipleChoice, type: "Unknown" });

    expect(result.success).toBe(false);
  });

  it("parses a valid ActiveRecall question with 2 or more conceptIds", () => {
    const question = {
      type: "ActiveRecall",
      id: "8b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e72",
      noteId: "6b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e70",
      prompt: "원화 약세가 항상 수출 호재가 아닌 이유 3가지",
      conceptIds: ["1e2d3c4b-5a69-4788-9f0e-1a2b3c4d5e6f", "2e2d3c4b-5a69-4788-9f0e-1a2b3c4d5e70"]
    };

    expect(QuestionSchema.parse(question)).toEqual(question);
  });

  it("rejects an ActiveRecall question with fewer than 2 conceptIds", () => {
    const result = QuestionSchema.safeParse({
      type: "ActiveRecall",
      id: "8b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e72",
      noteId: "6b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e70",
      prompt: "원화 약세가 항상 수출 호재가 아닌 이유 3가지",
      conceptIds: ["1e2d3c4b-5a69-4788-9f0e-1a2b3c4d5e6f"]
    });

    expect(result.success).toBe(false);
  });
});
