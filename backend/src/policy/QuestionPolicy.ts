import type { Concept, ConceptId } from "../domain";

export interface QuestionPlanItem {
  conceptId: ConceptId;
  type: "MultipleChoice" | "ShortAnswer";
}

export interface QuestionPolicy {
  plan(concepts: Concept[]): QuestionPlanItem[];
}

export function createDefaultQuestionPolicy(): QuestionPolicy {
  return {
    plan(concepts) {
      return concepts.map((concept, index) => ({
        conceptId: concept.id,
        type: index % 2 === 0 ? "MultipleChoice" : "ShortAnswer"
      }));
    }
  };
}
