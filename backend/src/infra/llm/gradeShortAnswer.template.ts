import { fileURLToPath } from "node:url";
import { z } from "zod";
import { loadPromptTemplate, type JsonSchemaObject } from "./PromptTemplate";

export const gradeShortAnswerResponseSchema = z.object({
  score: z.number().int().min(0).max(100),
  issues: z.array(z.enum(["logicGap", "counterexampleMissing", "conceptConfusion"])),
  comment: z.string()
});

export const gradeShortAnswerToolInputSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    score: { type: "integer", minimum: 0, maximum: 100 },
    issues: {
      type: "array",
      items: { type: "string", enum: ["logicGap", "counterexampleMissing", "conceptConfusion"] }
    },
    comment: { type: "string" }
  },
  required: ["score", "issues", "comment"],
  additionalProperties: false
};

export const gradeShortAnswerTemplate = loadPromptTemplate({
  name: "grade-short-answer",
  filePath: fileURLToPath(new URL("../../../prompts/grade-short-answer.md", import.meta.url)),
  modelTier: "quality",
  responseSchema: gradeShortAnswerResponseSchema,
  toolInputSchema: gradeShortAnswerToolInputSchema
});
