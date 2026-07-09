import { describe, expect, it } from "vitest";
import { formatConceptList } from "./conceptListFormat";
import { parseConceptId, parseNoteId, type Concept } from "../../domain";

const noteId = parseNoteId("3fa85f64-5717-4562-b3fc-2c963f66afa6");

describe("formatConceptList", () => {
  it("formats concepts as a 0-indexed numbered list of term: explanation", () => {
    const concepts: Concept[] = [
      {
        id: parseConceptId("1e2d3c4b-5a69-4788-9f0e-1a2b3c4d5e6f"),
        noteId,
        term: "원화 약세",
        explanation: "원화의 가치가 다른 통화 대비 하락하는 것"
      },
      {
        id: parseConceptId("2e2d3c4b-5a69-4788-9f0e-1a2b3c4d5e70"),
        noteId,
        term: "수출",
        explanation: "국내 상품을 해외로 파는 것"
      }
    ];

    const result = formatConceptList(concepts);

    expect(result).toBe(
      "0. 원화 약세: 원화의 가치가 다른 통화 대비 하락하는 것\n1. 수출: 국내 상품을 해외로 파는 것"
    );
  });

  it("returns an empty string for an empty concept list", () => {
    expect(formatConceptList([])).toBe("");
  });
});
