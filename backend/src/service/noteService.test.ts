import { beforeEach, describe, expect, it } from "vitest";
import { createDbClient, type DbClient } from "../infra/db/client";
import { runMigrations } from "../infra/db/migrate";
import { NoteRepository } from "../infra/NoteRepository";
import { createNoteService, type NoteService } from "./noteService";
import { parseNoteId } from "../domain";

let db: DbClient;
let service: NoteService;

beforeEach(() => {
  db = createDbClient(":memory:");
  runMigrations(db);
  service = createNoteService(new NoteRepository(db));
});

describe("noteService", () => {
  it("creates a note with a generated id, InAppMemo source, and timestamps", async () => {
    const note = await service.create({ title: "제목", contentMarkdown: "내용" });

    expect(note.title).toBe("제목");
    expect(note.contentMarkdown).toBe("내용");
    expect(note.source).toEqual({ type: "InAppMemo" });
    expect(note.id).toBeTruthy();
    expect(note.createdAt).toBeInstanceOf(Date);
    expect(note.updatedAt).toBeInstanceOf(Date);
  });

  it("updates only the provided fields and bumps updatedAt", async () => {
    const note = await service.create({ title: "제목", contentMarkdown: "내용" });

    const updated = await service.update(note.id, { title: "새 제목" });

    expect(updated?.title).toBe("새 제목");
    expect(updated?.contentMarkdown).toBe("내용");
    expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(note.updatedAt.getTime());
  });

  it("returns null when updating a note that does not exist", async () => {
    const result = await service.update(parseNoteId("00000000-0000-4000-8000-000000000000"), {
      title: "x"
    });

    expect(result).toBeNull();
  });

  it("deletes an existing note and makes it unfindable", async () => {
    const note = await service.create({ title: "제목", contentMarkdown: "내용" });

    const deleted = await service.remove(note.id);
    const found = await service.get(note.id);

    expect(deleted).toBe(true);
    expect(found).toBeNull();
  });
});
