import { describe, expect, it } from "vitest";
import { gradeAnswerDemoResponseSchema, gradeAnswerDemoTemplate } from "./gradeAnswerDemo.template";

describe("gradeAnswerDemoTemplate", () => {
  it("keeps responseSchema keys and toolInputSchema.properties keys in sync", () => {
    const zodKeys = Object.keys(gradeAnswerDemoResponseSchema.shape).sort();
    const jsonSchemaKeys = Object.keys(gradeAnswerDemoTemplate.toolInputSchema.properties).sort();

    expect(jsonSchemaKeys).toEqual(zodKeys);
  });
});
