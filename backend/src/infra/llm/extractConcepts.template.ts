import { fileURLToPath } from "node:url";
import { z } from "zod";
import { loadPromptTemplate, type JsonSchemaObject } from "./PromptTemplate";

export const extractConceptsResponseSchema = z.object({
  concepts: z.array(z.object({ term: z.string(), explanation: z.string() }))
});

export const extractConceptsToolInputSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    concepts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          term: { type: "string" },
          explanation: { type: "string" }
        },
        required: ["term", "explanation"],
        additionalProperties: false
      }
    }
  },
  required: ["concepts"],
  additionalProperties: false
};

export const extractConceptsTemplate = loadPromptTemplate({
  name: "extract-concepts",
  filePath: fileURLToPath(new URL("../../../prompts/extract-concepts.md", import.meta.url)),
  modelTier: "fast",
  responseSchema: extractConceptsResponseSchema,
  toolInputSchema: extractConceptsToolInputSchema
});
