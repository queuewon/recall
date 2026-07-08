import { describe, expect, it } from "vitest";
import { ConceptSchema } from "./Concept";

describe("ConceptSchema", () => {
  it("parses a minimal valid concept", () => {
    const concept = {
      id: "1e2d3c4b-5a69-4788-9f0e-1a2b3c4d5e6f",
      noteId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      term: "재귀",
      explanation: "자기 자신을 호출하는 함수"
    };

    expect(ConceptSchema.parse(concept)).toEqual(concept);
  });
});
