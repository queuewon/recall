import { fileURLToPath } from "node:url";
import { z } from "zod";
import { loadPromptTemplate, type JsonSchemaObject } from "./PromptTemplate";

export const generateMultipleChoiceResponseSchema = z.object({
  prompt: z.string(),
  options: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  correctIndex: z.number().int().min(0).max(3)
});

export const generateMultipleChoiceToolInputSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    prompt: { type: "string" },
    options: {
      type: "array",
      items: { type: "string" },
      minItems: 4,
      maxItems: 4
    },
    correctIndex: { type: "integer", minimum: 0, maximum: 3 }
  },
  required: ["prompt", "options", "correctIndex"],
  additionalProperties: false
};

export const generateMultipleChoiceTemplate = loadPromptTemplate({
  name: "generate-multiple-choice",
  filePath: fileURLToPath(new URL("../../../prompts/generate-multiple-choice.md", import.meta.url)),
  modelTier: "fast",
  responseSchema: generateMultipleChoiceResponseSchema,
  toolInputSchema: generateMultipleChoiceToolInputSchema
});
