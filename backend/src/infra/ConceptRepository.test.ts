import { beforeEach, describe, expect, it } from "vitest";
import { createDbClient, type DbClient } from "./db/client";
import { runMigrations } from "./db/migrate";
import { NoteRepository } from "./NoteRepository";
import { ConceptRepository } from "./ConceptRepository";
import { parseConceptId, parseNoteId, type Concept, type Note, type NoteId } from "../domain";

let db: DbClient;
let repo: ConceptRepository;
let noteId: NoteId;

function makeConcept(overrides: Partial<Concept> = {}): Concept {
  return {
    id: parseConceptId("1e2d3c4b-5a69-4788-9f0e-1a2b3c4d5e6f"),
    noteId,
    term: "재귀",
    explanation: "자기 자신을 호출하는 함수",
    ...overrides
  };
}

beforeEach(async () => {
  db = createDbClient(":memory:");
  runMigrations(db);
  repo = new ConceptRepository(db);

  noteId = parseNoteId("3fa85f64-5717-4562-b3fc-2c963f66afa6");
  const note: Note = {
    id: noteId,
    source: { type: "InAppMemo" },
    title: "제목",
    contentMarkdown: "# 내용",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z")
  };
  await new NoteRepository(db).create(note);
});

describe("ConceptRepository", () => {
  it("saves multiple concepts and reads them back via findByNoteId", async () => {
    const first = makeConcept({ id: parseConceptId("1e2d3c4b-5a69-4788-9f0e-1a2b3c4d5e6f") });
    const second = makeConcept({
      id: parseConceptId("2e2d3c4b-5a69-4788-9f0e-1a2b3c4d5e70"),
      term: "반복",
      explanation: "조건이 참인 동안 동작을 되풀이하는 것"
    });

    const saved = await repo.createMany([first, second]);
    const found = await repo.findByNoteId(noteId);

    expect(saved).toEqual([first, second]);
    expect(found.map((c) => c.id).sort()).toEqual([first.id, second.id].sort());
  });

  it("returns an empty array when createMany is called with no concepts", async () => {
    const saved = await repo.createMany([]);

    expect(saved).toEqual([]);
  });

  it("returns null from findById for a missing id", async () => {
    const found = await repo.findById(parseConceptId("00000000-0000-4000-8000-000000000000"));

    expect(found).toBeNull();
  });
});
