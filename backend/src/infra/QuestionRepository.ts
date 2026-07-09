import { eq } from "drizzle-orm";
import { QuestionSchema, type NoteId, type Question, type QuestionId } from "../domain";
import type { DbClient } from "./db/client";
import { questions } from "./db/schema";

type QuestionRow = typeof questions.$inferSelect;

function toRow(question: Question): typeof questions.$inferInsert {
  const base = {
    id: question.id,
    noteId: question.noteId,
    type: question.type,
    prompt: question.prompt
  };
  switch (question.type) {
    case "MultipleChoice":
      return {
        ...base,
        options: JSON.stringify(question.options),
        correctIndex: question.correctIndex,
        conceptId: null
      };
    case "ShortAnswer":
      return { ...base, options: null, correctIndex: null, conceptId: question.conceptId ?? null };
    case "ActiveRecall":
      return { ...base, options: null, correctIndex: null, conceptId: question.conceptId };
    case "Essay":
      return { ...base, options: null, correctIndex: null, conceptId: null };
  }
}

function fromRow(row: QuestionRow): Question {
  const base = { id: row.id, noteId: row.noteId, prompt: row.prompt };
  switch (row.type) {
    case "MultipleChoice": {
      if (row.options === null || row.correctIndex === null) {
        throw new Error("corrupted MultipleChoice row: missing options or correctIndex");
      }
      return QuestionSchema.parse({
        ...base,
        type: "MultipleChoice",
        options: JSON.parse(row.options),
        correctIndex: row.correctIndex
      });
    }
    case "ShortAnswer":
      return QuestionSchema.parse({
        ...base,
        type: "ShortAnswer",
        ...(row.conceptId !== null ? { conceptId: row.conceptId } : {})
      });
    case "Essay":
      return QuestionSchema.parse({ ...base, type: "Essay" });
    case "ActiveRecall": {
      if (row.conceptId === null) {
        throw new Error("corrupted ActiveRecall row: missing conceptId");
      }
      return QuestionSchema.parse({ ...base, type: "ActiveRecall", conceptId: row.conceptId });
    }
    default:
      throw new Error(`unknown question type in DB row: ${row.type}`);
  }
}

export class QuestionRepository {
  constructor(private readonly db: DbClient) {}

  async create(question: Question): Promise<Question> {
    const validated = QuestionSchema.parse(question);
    this.db.insert(questions).values(toRow(validated)).run();
    return validated;
  }

  async findById(id: QuestionId): Promise<Question | null> {
    const row = this.db.select().from(questions).where(eq(questions.id, id)).get();
    return row ? fromRow(row) : null;
  }

  async findByNoteId(noteId: NoteId): Promise<Question[]> {
    const rows = this.db.select().from(questions).where(eq(questions.noteId, noteId)).all();
    return rows.map(fromRow);
  }
}
