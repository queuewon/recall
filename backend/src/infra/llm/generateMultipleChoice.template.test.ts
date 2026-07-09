import { describe, expect, it } from "vitest";
import {
  generateMultipleChoiceResponseSchema,
  generateMultipleChoiceTemplate
} from "./generateMultipleChoice.template";

describe("generateMultipleChoiceTemplate", () => {
  it("keeps responseSchema keys and toolInputSchema.properties keys in sync", () => {
    const zodKeys = Object.keys(generateMultipleChoiceResponseSchema.shape).sort();
    const jsonSchemaKeys = Object.keys(
      generateMultipleChoiceTemplate.toolInputSchema.properties
    ).sort();

    expect(jsonSchemaKeys).toEqual(zodKeys);
  });
});
