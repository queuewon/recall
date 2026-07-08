import { describe, expect, it } from "vitest";
import { summarizeNoteResponseSchema, summarizeNoteTemplate } from "./summarizeNote.template";

describe("summarizeNoteTemplate", () => {
  it("keeps responseSchema keys and toolInputSchema.properties keys in sync", () => {
    const zodKeys = Object.keys(summarizeNoteResponseSchema.shape).sort();
    const jsonSchemaKeys = Object.keys(summarizeNoteTemplate.toolInputSchema.properties).sort();

    expect(jsonSchemaKeys).toEqual(zodKeys);
  });
});
