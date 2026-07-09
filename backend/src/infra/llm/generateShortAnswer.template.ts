import { fileURLToPath } from "node:url";
import { z } from "zod";
import { loadPromptTemplate, type JsonSchemaObject } from "./PromptTemplate";

export const generateShortAnswerResponseSchema = z.object({
  prompt: z.string()
});

export const generateShortAnswerToolInputSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    prompt: { type: "string" }
  },
  required: ["prompt"],
  additionalProperties: false
};

export const generateShortAnswerTemplate = loadPromptTemplate({
  name: "generate-short-answer",
  filePath: fileURLToPath(new URL("../../../prompts/generate-short-answer.md", import.meta.url)),
  modelTier: "fast",
  responseSchema: generateShortAnswerResponseSchema,
  toolInputSchema: generateShortAnswerToolInputSchema
});
