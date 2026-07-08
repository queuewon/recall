import { beforeEach, describe, expect, it } from "vitest";
import { createDbClient, type DbClient } from "./db/client";
import { runMigrations } from "./db/migrate";
import { notes } from "./db/schema";
import { NoteRepository } from "./NoteRepository";
import { parseNoteId, type Note } from "../domain";

let db: DbClient;
let repo: NoteRepository;

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: parseNoteId("3fa85f64-5717-4562-b3fc-2c963f66afa6"),
    source: { type: "InAppMemo" },
    title: "제목",
    contentMarkdown: "# 내용",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides
  };
}

beforeEach(() => {
  db = createDbClient(":memory:");
  runMigrations(db);
  repo = new NoteRepository(db);
});

describe("NoteRepository", () => {
  it("creates a note and reads it back via findById", async () => {
    const note = makeNote();

    await repo.create(note);
    const found = await repo.findById(note.id);

    expect(found).toEqual(note);
  });

  it("returns null from findById for a missing id", async () => {
    const found = await repo.findById(parseNoteId("00000000-0000-4000-8000-000000000000"));

    expect(found).toBeNull();
  });

  it("returns every stored note from findAll", async () => {
    const first = makeNote({ id: parseNoteId("3fa85f64-5717-4562-b3fc-2c963f66afa6") });
    const second = makeNote({ id: parseNoteId("6b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e6f") });
    await repo.create(first);
    await repo.create(second);

    const all = await repo.findAll();

    expect(all).toHaveLength(2);
    expect(all.map((n) => n.id).sort()).toEqual([first.id, second.id].sort());
  });

  it("updates a note's mutable fields", async () => {
    const note = makeNote();
    await repo.create(note);
    const updated: Note = { ...note, title: "새 제목", contentMarkdown: "# 새 내용" };

    const result = await repo.update(updated);
    const found = await repo.findById(note.id);

    expect(result).toEqual(updated);
    expect(found).toEqual(updated);
  });

  it("returns null from update when the note does not exist", async () => {
    const result = await repo.update(makeNote());

    expect(result).toBeNull();
  });

  it("deletes a note and makes it unfindable", async () => {
    const note = makeNote();
    await repo.create(note);

    const deleted = await repo.delete(note.id);
    const found = await repo.findById(note.id);

    expect(deleted).toBe(true);
    expect(found).toBeNull();
  });

  it("returns false from delete when the note does not exist", async () => {
    const deleted = await repo.delete(parseNoteId("00000000-0000-4000-8000-000000000000"));

    expect(deleted).toBe(false);
  });

  it("round-trips a note with the reserved Notion source", async () => {
    const note = makeNote({ source: { type: "Notion" } });

    await repo.create(note);
    const found = await repo.findById(note.id);

    expect(found).toEqual(note);
  });

  it("throws when a stored row fails domain validation (trust boundary)", async () => {
    const note = makeNote();
    db.insert(notes)
      .values({
        id: note.id,
        sourceType: "Dropbox",
        title: note.title,
        contentMarkdown: note.contentMarkdown,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      })
      .run();

    await expect(repo.findById(note.id)).rejects.toThrow();
  });
});
