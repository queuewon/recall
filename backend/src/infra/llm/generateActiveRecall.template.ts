import { fileURLToPath } from "node:url";
import { z } from "zod";
import { loadPromptTemplate, type JsonSchemaObject } from "./PromptTemplate";

// ActiveRecall 생성 응답은 어떤 개념(들)을 실제로 연결해 썼는지 알아야 해서
// {prompt} 하나뿐인 다른 생성 스키마와 모양이 다르다 — 재사용 불가, 신규 정의.
export const generateActiveRecallResponseSchema = z.object({
  prompt: z.string(),
  usedConceptIndexes: z.array(z.number().int().min(0)).min(2)
});

export const generateActiveRecallToolInputSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    prompt: { type: "string" },
    usedConceptIndexes: {
      type: "array",
      items: { type: "integer", minimum: 0 }
    }
  },
  required: ["prompt", "usedConceptIndexes"],
  additionalProperties: false
};

export const generateActiveRecallTemplate = loadPromptTemplate({
  name: "generate-active-recall",
  filePath: fileURLToPath(new URL("../../../prompts/generate-active-recall.md", import.meta.url)),
  modelTier: "fast",
  responseSchema: generateActiveRecallResponseSchema,
  toolInputSchema: generateActiveRecallToolInputSchema
});
