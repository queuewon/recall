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
  it("plans exactly one rotation question per concept", () => {
    const policy = createDefaultQuestionPolicy();
    const concepts = [makeConcept(0), makeConcept(1)]; // ActiveRecall 임계값(3) 미만

    const plan = policy.plan(concepts);
    const rotationItems = plan.filter((item) => item.type !== "ActiveRecall");

    expect(rotationItems).toHaveLength(2);
  });

  it("rotates question type across MultipleChoice, ShortAnswer, and Essay", () => {
    const policy = createDefaultQuestionPolicy();
    const concepts = [makeConcept(0), makeConcept(1), makeConcept(2), makeConcept(3)];

    const plan = policy.plan(concepts);
    const rotationTypes = plan
      .filter((item) => item.type !== "ActiveRecall")
      .map((item) => item.type);

    expect(rotationTypes).toEqual(["MultipleChoice", "ShortAnswer", "Essay", "MultipleChoice"]);
  });

  it("returns an empty plan for no concepts", () => {
    const policy = createDefaultQuestionPolicy();

    expect(policy.plan([])).toEqual([]);
  });

  it("adds one ActiveRecall item pooling all concepts when there are 3 or more concepts", () => {
    const policy = createDefaultQuestionPolicy();
    const concepts = [makeConcept(0), makeConcept(1), makeConcept(2)];

    const plan = policy.plan(concepts);
    const activeRecallItems = plan.filter((item) => item.type === "ActiveRecall");

    expect(activeRecallItems).toHaveLength(1);
    expect(activeRecallItems[0]).toEqual({
      type: "ActiveRecall",
      conceptIds: concepts.map((c) => c.id)
    });
  });

  it("does not add an ActiveRecall item when there are fewer than 3 concepts", () => {
    const policy = createDefaultQuestionPolicy();
    const concepts = [makeConcept(0), makeConcept(1)];

    const plan = policy.plan(concepts);

    expect(plan.some((item) => item.type === "ActiveRecall")).toBe(false);
  });

  it("caps the ActiveRecall candidate pool at 5 concepts", () => {
    const policy = createDefaultQuestionPolicy();
    const concepts = Array.from({ length: 7 }, (_, i) => makeConcept(i));

    const plan = policy.plan(concepts);
    const activeRecallItem = plan.find((item) => item.type === "ActiveRecall");

    expect(
      activeRecallItem?.type === "ActiveRecall" ? activeRecallItem.conceptIds : []
    ).toHaveLength(5);
  });
});
