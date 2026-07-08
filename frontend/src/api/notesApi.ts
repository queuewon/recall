import { z } from "zod";
import { NoteSchema, type Note } from "./note";

const NoteArraySchema = z.array(NoteSchema);

async function parseJson<T>(res: Response, schema: z.ZodType<T>): Promise<T> {
  return schema.parse(await res.json());
}

export async function listNotes(): Promise<Note[]> {
  const res = await fetch("/notes");
  if (!res.ok) {
    throw new Error("failed to list notes");
  }
  return parseJson(res, NoteArraySchema);
}

export async function createNote(input: { title: string; contentMarkdown: string }): Promise<Note> {
  const res = await fetch("/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    throw new Error("failed to create note");
  }
  return parseJson(res, NoteSchema);
}

export async function updateNote(
  id: string,
  patch: { title?: string; contentMarkdown?: string }
): Promise<Note> {
  const res = await fetch(`/notes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch)
  });
  if (!res.ok) {
    throw new Error("failed to update note");
  }
  return parseJson(res, NoteSchema);
}

export async function deleteNote(id: string): Promise<void> {
  const res = await fetch(`/notes/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error("failed to delete note");
  }
}
