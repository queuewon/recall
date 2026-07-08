import { describe, expect, it } from "vitest";
import { NoteSchema } from "./note";

const validNote = {
  id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  source: { type: "InAppMemo" },
  title: "제목",
  contentMarkdown: "# 내용",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z"
};

describe("NoteSchema", () => {
  it("parses a valid note response", () => {
    expect(NoteSchema.parse(validNote)).toEqual(validNote);
  });

  it("rejects a response with an unexpected extra-shaped source", () => {
    const result = NoteSchema.safeParse({ ...validNote, source: { type: "Dropbox" } });

    expect(result.success).toBe(false);
  });
});
