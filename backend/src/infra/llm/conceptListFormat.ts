import type { Concept } from "../../domain";

// questionGenerationService(생성)와 GradingPolicy(채점) 양쪽에서 개념 여러 개를
// LLM에 번호 매긴 목록으로 보여줄 때 동일하게 쓰는 진짜 중복이라 여기로 뺐다.
export function formatConceptList(concepts: Concept[]): string {
  return concepts
    .map((concept, index) => `${index}. ${concept.term}: ${concept.explanation}`)
    .join("\n");
}
