import type { Concept, ConceptId } from "../domain";

export type QuestionPlanItem =
  | { type: "MultipleChoice" | "ShortAnswer" | "Essay"; conceptId: ConceptId }
  | { type: "ActiveRecall"; conceptIds: ConceptId[] };

export interface QuestionPolicy {
  plan(concepts: Concept[]): QuestionPlanItem[];
}

const ROTATION: Array<"MultipleChoice" | "ShortAnswer" | "Essay"> = [
  "MultipleChoice",
  "ShortAnswer",
  "Essay"
];

const ACTIVE_RECALL_MIN_CONCEPTS = 3;
const ACTIVE_RECALL_POOL_CAP = 5;

export function createDefaultQuestionPolicy(): QuestionPolicy {
  return {
    plan(concepts) {
      const rotationItems: QuestionPlanItem[] = concepts.map((concept, index) => {
        const type = ROTATION[index % ROTATION.length];
        if (!type) {
          throw new Error("unreachable: rotation index out of bounds");
        }
        return { conceptId: concept.id, type };
      });

      // 회전과는 별개로, 개념 간 연결을 묻는 능동 회상 문제를 최대 1개 추가한다.
      // 어떤 개념들이 실제로 관계 있는지는 정책이 아니라 생성 시점의 LLM이 고른다 —
      // 여기서는 후보 풀(상한 5개)만 넘겨준다.
      const activeRecallItems: QuestionPlanItem[] =
        concepts.length >= ACTIVE_RECALL_MIN_CONCEPTS
          ? [
              {
                type: "ActiveRecall",
                conceptIds: concepts.slice(0, ACTIVE_RECALL_POOL_CAP).map((c) => c.id)
              }
            ]
          : [];

      return [...rotationItems, ...activeRecallItems];
    }
  };
}
