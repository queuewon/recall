import { randomUUID } from "node:crypto";
import { parseNoteId, type Note, type NoteId } from "../domain";
import type { NoteRepository } from "../infra/NoteRepository";

export function createNoteService(repo: NoteRepository) {
  return {
    async create(input: { title: string; contentMarkdown: string }): Promise<Note> {
      const now = new Date();
      const note: Note = {
        id: parseNoteId(randomUUID()),
        source: { type: "InAppMemo" },
        title: input.title,
        contentMarkdown: input.contentMarkdown,
        createdAt: now,
        updatedAt: now
      };
      return repo.create(note);
    },

    async list(): Promise<Note[]> {
      return repo.findAll();
    },

    async get(id: NoteId): Promise<Note | null> {
      return repo.findById(id);
    },

    async update(
      id: NoteId,
      patch: { title?: string | undefined; contentMarkdown?: string | undefined }
    ): Promise<Note | null> {
      const existing = await repo.findById(id);
      if (!existing) {
        return null;
      }
      const updated: Note = {
        ...existing,
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.contentMarkdown !== undefined ? { contentMarkdown: patch.contentMarkdown } : {}),
        updatedAt: new Date()
      };
      return repo.update(updated);
    },

    async remove(id: NoteId): Promise<boolean> {
      return repo.delete(id);
    }
  };
}

export type NoteService = ReturnType<typeof createNoteService>;
