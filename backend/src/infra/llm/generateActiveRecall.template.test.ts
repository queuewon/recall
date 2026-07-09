import { describe, expect, it } from "vitest";
import {
  generateActiveRecallResponseSchema,
  generateActiveRecallTemplate
} from "./generateActiveRecall.template";

describe("generateActiveRecallTemplate", () => {
  it("keeps responseSchema keys and toolInputSchema.properties keys in sync", () => {
    const zodKeys = Object.keys(generateActiveRecallResponseSchema.shape).sort();
    const jsonSchemaKeys = Object.keys(
      generateActiveRecallTemplate.toolInputSchema.properties
    ).sort();

    expect(jsonSchemaKeys).toEqual(zodKeys);
  });
});
