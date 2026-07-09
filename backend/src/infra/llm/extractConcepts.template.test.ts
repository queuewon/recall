import { describe, expect, it } from "vitest";
import { extractConceptsResponseSchema, extractConceptsTemplate } from "./extractConcepts.template";

describe("extractConceptsTemplate", () => {
  it("keeps responseSchema keys and toolInputSchema.properties keys in sync", () => {
    const zodKeys = Object.keys(extractConceptsResponseSchema.shape).sort();
    const jsonSchemaKeys = Object.keys(extractConceptsTemplate.toolInputSchema.properties).sort();

    expect(jsonSchemaKeys).toEqual(zodKeys);
  });
});
