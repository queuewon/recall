import { eq } from "drizzle-orm";
import { NoteSchema, type Note, type NoteId } from "../domain";
import type { DbClient } from "./db/client";
import { notes } from "./db/schema";

type NoteRow = typeof notes.$inferSelect;

function toRow(note: Note): typeof notes.$inferInsert {
  return {
    id: note.id,
    sourceType: note.source.type,
    title: note.title,
    contentMarkdown: note.contentMarkdown,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt
  };
}

function fromRow(row: NoteRow): Note {
  return NoteSchema.parse({
    id: row.id,
    source: { type: row.sourceType },
    title: row.title,
    contentMarkdown: row.contentMarkdown,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  });
}

export class NoteRepository {
  constructor(private readonly db: DbClient) {}

  async create(note: Note): Promise<Note> {
    const validated = NoteSchema.parse(note);
    this.db.insert(notes).values(toRow(validated)).run();
    return validated;
  }

  async findById(id: NoteId): Promise<Note | null> {
    const row = this.db.select().from(notes).where(eq(notes.id, id)).get();
    return row ? fromRow(row) : null;
  }

  async findAll(): Promise<Note[]> {
    const rows = this.db.select().from(notes).all();
    return rows.map(fromRow);
  }

  async update(note: Note): Promise<Note | null> {
    const validated = NoteSchema.parse(note);
    const result = this.db
      .update(notes)
      .set(toRow(validated))
      .where(eq(notes.id, validated.id))
      .run();
    return result.changes > 0 ? validated : null;
  }

  async delete(id: NoteId): Promise<boolean> {
    const result = this.db.delete(notes).where(eq(notes.id, id)).run();
    return result.changes > 0;
  }
}
