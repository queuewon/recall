import { fileURLToPath } from "node:url";
import { loadPromptTemplate } from "./PromptTemplate";
import {
  gradeShortAnswerResponseSchema,
  gradeShortAnswerToolInputSchema
} from "./gradeShortAnswer.template";

// Essay 채점 응답은 ShortAnswer 채점 응답과 완전히 같은 모양({score, issues, comment})이라
// 스키마를 재사용한다. 둘 중 하나만 채점 기준을 바꾸려면 먼저 이 결합을 풀고 스키마를
// 분리해야 한다.
export const gradeEssayTemplate = loadPromptTemplate({
  name: "grade-essay",
  filePath: fileURLToPath(new URL("../../../prompts/grade-essay.md", import.meta.url)),
  modelTier: "quality",
  responseSchema: gradeShortAnswerResponseSchema,
  toolInputSchema: gradeShortAnswerToolInputSchema
});
