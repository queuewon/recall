import { fileURLToPath } from "node:url";
import { loadPromptTemplate } from "./PromptTemplate";
import {
  gradeShortAnswerResponseSchema,
  gradeShortAnswerToolInputSchema
} from "./gradeShortAnswer.template";

// ActiveRecall 채점 응답도 {score, issues, comment}로 다른 채점 응답과 완전히
// 같은 모양이라 스키마를 재사용한다.
export const gradeActiveRecallTemplate = loadPromptTemplate({
  name: "grade-active-recall",
  filePath: fileURLToPath(new URL("../../../prompts/grade-active-recall.md", import.meta.url)),
  modelTier: "quality",
  responseSchema: gradeShortAnswerResponseSchema,
  toolInputSchema: gradeShortAnswerToolInputSchema
});
