import { describe, expect, it } from "vitest";
import { FeedbackSchema } from "./Feedback";
import { createScore } from "./score";

const validFeedback = {
  answerId: "9d3f1a2b-4c5d-4e6f-8a9b-0c1d2e3f4a5b",
  score: createScore(80),
  issues: [{ type: "logicGap" as const }],
  comment: "논리 전개를 보강하세요"
};

describe("FeedbackSchema", () => {
  it("parses a valid feedback", () => {
    expect(FeedbackSchema.parse(validFeedback)).toEqual(validFeedback);
  });

  it("rejects an issue type outside the defined union", () => {
    const result = FeedbackSchema.safeParse({
      ...validFeedback,
      issues: [{ type: "unknownIssue" }]
    });

    expect(result.success).toBe(false);
  });
});
