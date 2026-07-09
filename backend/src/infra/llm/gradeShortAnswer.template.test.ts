import { describe, expect, it } from "vitest";
import {
  gradeShortAnswerResponseSchema,
  gradeShortAnswerTemplate
} from "./gradeShortAnswer.template";

describe("gradeShortAnswerTemplate", () => {
  it("keeps responseSchema keys and toolInputSchema.properties keys in sync", () => {
    const zodKeys = Object.keys(gradeShortAnswerResponseSchema.shape).sort();
    const jsonSchemaKeys = Object.keys(gradeShortAnswerTemplate.toolInputSchema.properties).sort();

    expect(jsonSchemaKeys).toEqual(zodKeys);
  });
});
