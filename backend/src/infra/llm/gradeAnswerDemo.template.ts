import { fileURLToPath } from "node:url";
import { z } from "zod";
import { loadPromptTemplate, type JsonSchemaObject } from "./PromptTemplate";

export const gradeAnswerDemoResponseSchema = z.object({
  score: z.number().int().min(0).max(100),
  comment: z.string()
});

export const gradeAnswerDemoToolInputSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    score: { type: "integer", minimum: 0, maximum: 100 },
    comment: { type: "string" }
  },
  required: ["score", "comment"],
  additionalProperties: false
};

export const gradeAnswerDemoTemplate = loadPromptTemplate({
  name: "grade-answer-demo",
  filePath: fileURLToPath(new URL("../../../prompts/grade-answer-demo.md", import.meta.url)),
  modelTier: "quality",
  responseSchema: gradeAnswerDemoResponseSchema,
  toolInputSchema: gradeAnswerDemoToolInputSchema
});
