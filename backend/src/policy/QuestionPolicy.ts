import type { Concept, ConceptId } from "../domain";

export interface QuestionPlanItem {
  conceptId: ConceptId;
  type: "MultipleChoice" | "ShortAnswer" | "Essay";
}

export interface QuestionPolicy {
  plan(concepts: Concept[]): QuestionPlanItem[];
}

const ROTATION: QuestionPlanItem["type"][] = ["MultipleChoice", "ShortAnswer", "Essay"];

export function createDefaultQuestionPolicy(): QuestionPolicy {
  return {
    plan(concepts) {
      return concepts.map((concept, index) => {
        const type = ROTATION[index % ROTATION.length];
        if (!type) {
          throw new Error("unreachable: rotation index out of bounds");
        }
        return { conceptId: concept.id, type };
      });
    }
  };
}
