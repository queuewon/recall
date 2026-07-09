import { fileURLToPath } from "node:url";
import { loadPromptTemplate } from "./PromptTemplate";
import {
  generateShortAnswerResponseSchema,
  generateShortAnswerToolInputSchema
} from "./generateShortAnswer.template";

// Essay 생성 응답은 ShortAnswer 생성 응답과 완전히 같은 모양({prompt})이라 스키마를
// 재사용한다. 둘 중 하나만 모양을 바꾸려면 먼저 이 결합을 풀고 스키마를 분리해야 한다.
export const generateEssayTemplate = loadPromptTemplate({
  name: "generate-essay",
  filePath: fileURLToPath(new URL("../../../prompts/generate-essay.md", import.meta.url)),
  modelTier: "fast",
  responseSchema: generateShortAnswerResponseSchema,
  toolInputSchema: generateShortAnswerToolInputSchema
});
