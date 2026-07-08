import { fileURLToPath } from "node:url";
import { z } from "zod";
import { loadPromptTemplate, type JsonSchemaObject } from "./PromptTemplate";

export const summarizeNoteResponseSchema = z.object({ summary: z.string() });

export const summarizeNoteToolInputSchema: JsonSchemaObject = {
  type: "object",
  properties: { summary: { type: "string" } },
  required: ["summary"],
  additionalProperties: false
};

export const summarizeNoteTemplate = loadPromptTemplate({
  name: "summarize-note",
  filePath: fileURLToPath(new URL("../../../prompts/summarize-note.md", import.meta.url)),
  modelTier: "fast",
  responseSchema: summarizeNoteResponseSchema,
  toolInputSchema: summarizeNoteToolInputSchema
});
