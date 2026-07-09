import { eq } from "drizzle-orm";
import { ConceptSchema, type Concept, type ConceptId, type NoteId } from "../domain";
import type { DbClient } from "./db/client";
import { concepts } from "./db/schema";

type ConceptRow = typeof concepts.$inferSelect;

function toRow(concept: Concept): typeof concepts.$inferInsert {
  return {
    id: concept.id,
    noteId: concept.noteId,
    term: concept.term,
    explanation: concept.explanation
  };
}

function fromRow(row: ConceptRow): Concept {
  return ConceptSchema.parse({
    id: row.id,
    noteId: row.noteId,
    term: row.term,
    explanation: row.explanation
  });
}

export class ConceptRepository {
  constructor(private readonly db: DbClient) {}

  async createMany(conceptsToSave: Concept[]): Promise<Concept[]> {
    const validated = conceptsToSave.map((concept) => ConceptSchema.parse(concept));
    if (validated.length === 0) {
      return [];
    }
    this.db.insert(concepts).values(validated.map(toRow)).run();
    return validated;
  }

  async findByNoteId(noteId: NoteId): Promise<Concept[]> {
    const rows = this.db.select().from(concepts).where(eq(concepts.noteId, noteId)).all();
    return rows.map(fromRow);
  }

  async findById(id: ConceptId): Promise<Concept | null> {
    const row = this.db.select().from(concepts).where(eq(concepts.id, id)).get();
    return row ? fromRow(row) : null;
  }
}
