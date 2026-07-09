import { describe, expect, it } from "vitest";
import { createDefaultQuestionPolicy } from "./QuestionPolicy";
import { parseConceptId, parseNoteId, type Concept } from "../domain";

function makeConcept(index: number): Concept {
  return {
    id: parseConceptId(`00000000-0000-4000-8000-00000000000${index}`),
    noteId: parseNoteId("3fa85f64-5717-4562-b3fc-2c963f66afa6"),
    term: `개념${index}`,
    explanation: `설명${index}`
  };
}

describe("createDefaultQuestionPolicy", () => {
  it("plans exactly one question per concept", () => {
    const policy = createDefaultQuestionPolicy();
    const concepts = [makeConcept(0), makeConcept(1), makeConcept(2)];

    const plan = policy.plan(concepts);

    expect(plan).toHaveLength(3);
    expect(plan.map((item) => item.conceptId)).toEqual(concepts.map((c) => c.id));
  });

  it("rotates question type across MultipleChoice, ShortAnswer, and Essay", () => {
    const policy = createDefaultQuestionPolicy();
    const concepts = [makeConcept(0), makeConcept(1), makeConcept(2), makeConcept(3)];

    const plan = policy.plan(concepts);

    expect(plan.map((item) => item.type)).toEqual([
      "MultipleChoice",
      "ShortAnswer",
      "Essay",
      "MultipleChoice"
    ]);
  });

  it("returns an empty plan for no concepts", () => {
    const policy = createDefaultQuestionPolicy();

    expect(policy.plan([])).toEqual([]);
  });
});
