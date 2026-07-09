import { eq } from "drizzle-orm";
import { AnswerSchema, type Answer, type AnswerId } from "../domain";
import type { DbClient } from "./db/client";
import { answers } from "./db/schema";

type AnswerRow = typeof answers.$inferSelect;

function toRow(answer: Answer): typeof answers.$inferInsert {
  return {
    id: answer.id,
    questionId: answer.questionId,
    content: answer.content,
    submittedAt: answer.submittedAt
  };
}

function fromRow(row: AnswerRow): Answer {
  return AnswerSchema.parse({
    id: row.id,
    questionId: row.questionId,
    content: row.content,
    submittedAt: row.submittedAt
  });
}

export class AnswerRepository {
  constructor(private readonly db: DbClient) {}

  async create(answer: Answer): Promise<Answer> {
    const validated = AnswerSchema.parse(answer);
    this.db.insert(answers).values(toRow(validated)).run();
    return validated;
  }

  async findById(id: AnswerId): Promise<Answer | null> {
    const row = this.db.select().from(answers).where(eq(answers.id, id)).get();
    return row ? fromRow(row) : null;
  }
}
