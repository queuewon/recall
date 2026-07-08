import { describe, expect, it } from "vitest";
import { NoteSchema } from "./Note";

const validNote = {
  id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  source: { type: "InAppMemo" as const },
  title: "제목",
  contentMarkdown: "# 내용",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-02T00:00:00Z")
};

describe("NoteSchema", () => {
  it("parses a valid InAppMemo note", () => {
    expect(NoteSchema.parse(validNote)).toEqual(validNote);
  });

  it("rejects a source.type outside InAppMemo/Notion", () => {
    const result = NoteSchema.safeParse({ ...validNote, source: { type: "Dropbox" } });

    expect(result.success).toBe(false);
  });

  it("rejects a non-UUID id", () => {
    const result = NoteSchema.safeParse({ ...validNote, id: "not-a-uuid" });

    expect(result.success).toBe(false);
  });

  it("rejects updatedAt earlier than createdAt", () => {
    const result = NoteSchema.safeParse({
      ...validNote,
      createdAt: new Date("2026-01-02T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z")
    });

    expect(result.success).toBe(false);
  });
});
