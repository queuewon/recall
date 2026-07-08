import { describe, expect, it } from "vitest";
import { AnswerSchema } from "./Answer";

const validAnswer = {
  id: "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e",
  questionId: "5b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e6f",
  content: "답변 내용",
  submittedAt: new Date("2026-01-01T00:00:00Z")
};

describe("AnswerSchema", () => {
  it("parses a minimal valid answer", () => {
    expect(AnswerSchema.parse(validAnswer)).toEqual(validAnswer);
  });

  it("rejects empty content", () => {
    const result = AnswerSchema.safeParse({ ...validAnswer, content: "" });

    expect(result.success).toBe(false);
  });
});
