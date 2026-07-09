import { beforeEach, describe, expect, it } from "vitest";
import { createDbClient, type DbClient } from "./db/client";
import { runMigrations } from "./db/migrate";
import { NoteRepository } from "./NoteRepository";
import { ConceptRepository } from "./ConceptRepository";
import { QuestionRepository } from "./QuestionRepository";
import {
  parseConceptId,
  parseNoteId,
  parseQuestionId,
  type Concept,
  type ConceptId,
  type Note,
  type NoteId,
  type Question
} from "../domain";

let db: DbClient;
let repo: QuestionRepository;
let noteId: NoteId;
let conceptId: ConceptId;

beforeEach(async () => {
  db = createDbClient(":memory:");
  runMigrations(db);
  repo = new QuestionRepository(db);

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

  conceptId = parseConceptId("1e2d3c4b-5a69-4788-9f0e-1a2b3c4d5e6f");
  const concept: Concept = {
    id: conceptId,
    noteId,
    term: "재귀",
    explanation: "자기 자신을 호출하는 함수"
  };
  await new ConceptRepository(db).createMany([concept]);
});

describe("QuestionRepository", () => {
  it("saves and reads back a MultipleChoice question, preserving options and correctIndex", async () => {
    const question: Question = {
      type: "MultipleChoice",
      id: parseQuestionId("5b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e6f"),
      noteId,
      prompt: "다음 중 옳은 것은?",
      options: ["A", "B", "C", "D"],
      correctIndex: 2
    };

    await repo.create(question);
    const found = await repo.findById(question.id);

    expect(found).toEqual(question);
  });

  it("saves and reads back a ShortAnswer question with a conceptId", async () => {
    const question: Question = {
      type: "ShortAnswer",
      id: parseQuestionId("6b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e70"),
      noteId,
      prompt: "재귀란 무엇인가?",
      conceptId
    };

    await repo.create(question);
    const found = await repo.findById(question.id);

    expect(found).toEqual(question);
  });

  it("saves and reads back a ShortAnswer question without a conceptId", async () => {
    const question: Question = {
      type: "ShortAnswer",
      id: parseQuestionId("7b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e71"),
      noteId,
      prompt: "재귀란 무엇인가?"
    };

    await repo.create(question);
    const found = await repo.findById(question.id);

    expect(found).toEqual(question);
  });

  it("lists every question for a note via findByNoteId", async () => {
    const mc: Question = {
      type: "MultipleChoice",
      id: parseQuestionId("5b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e6f"),
      noteId,
      prompt: "질문1",
      options: ["A", "B", "C", "D"],
      correctIndex: 0
    };
    const sa: Question = {
      type: "ShortAnswer",
      id: parseQuestionId("6b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e70"),
      noteId,
      prompt: "질문2",
      conceptId
    };
    await repo.create(mc);
    await repo.create(sa);

    const found = await repo.findByNoteId(noteId);

    expect(found).toHaveLength(2);
    expect(found.map((q) => q.id).sort()).toEqual([mc.id, sa.id].sort());
  });

  it("returns null from findById for a missing id", async () => {
    const found = await repo.findById(parseQuestionId("00000000-0000-4000-8000-000000000000"));

    expect(found).toBeNull();
  });
});
