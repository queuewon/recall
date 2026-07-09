import { beforeEach, describe, expect, it } from "vitest";
import { createDbClient, type DbClient } from "./db/client";
import { runMigrations } from "./db/migrate";
import { NoteRepository } from "./NoteRepository";
import { QuestionRepository } from "./QuestionRepository";
import { AnswerRepository } from "./AnswerRepository";
import {
  parseAnswerId,
  parseNoteId,
  parseQuestionId,
  type Answer,
  type Note,
  type Question,
  type QuestionId
} from "../domain";

let db: DbClient;
let repo: AnswerRepository;
let questionId: QuestionId;

beforeEach(async () => {
  db = createDbClient(":memory:");
  runMigrations(db);
  repo = new AnswerRepository(db);

  const noteId = parseNoteId("3fa85f64-5717-4562-b3fc-2c963f66afa6");
  const note: Note = {
    id: noteId,
    source: { type: "InAppMemo" },
    title: "제목",
    contentMarkdown: "# 내용",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z")
  };
  await new NoteRepository(db).create(note);

  questionId = parseQuestionId("5b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e6f");
  const question: Question = {
    type: "MultipleChoice",
    id: questionId,
    noteId,
    prompt: "질문",
    options: ["A", "B", "C", "D"],
    correctIndex: 0
  };
  await new QuestionRepository(db).create(question);
});

describe("AnswerRepository", () => {
  it("saves an answer and reads it back via findById", async () => {
    const answer: Answer = {
      id: parseAnswerId("2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e"),
      questionId,
      content: "2",
      submittedAt: new Date("2026-01-01T00:00:00Z")
    };

    await repo.create(answer);
    const found = await repo.findById(answer.id);

    expect(found).toEqual(answer);
  });

  it("returns null from findById for a missing id", async () => {
    const found = await repo.findById(parseAnswerId("00000000-0000-4000-8000-000000000000"));

    expect(found).toBeNull();
  });
});
