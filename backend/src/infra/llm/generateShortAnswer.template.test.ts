import { describe, expect, it } from "vitest";
import {
  generateShortAnswerResponseSchema,
  generateShortAnswerTemplate
} from "./generateShortAnswer.template";

describe("generateShortAnswerTemplate", () => {
  it("keeps responseSchema keys and toolInputSchema.properties keys in sync", () => {
    const zodKeys = Object.keys(generateShortAnswerResponseSchema.shape).sort();
    const jsonSchemaKeys = Object.keys(
      generateShortAnswerTemplate.toolInputSchema.properties
    ).sort();

    expect(jsonSchemaKeys).toEqual(zodKeys);
  });
});
