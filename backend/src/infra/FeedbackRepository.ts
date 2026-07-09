import { eq } from "drizzle-orm";
import { FeedbackSchema, type AnswerId, type Feedback } from "../domain";
import type { DbClient } from "./db/client";
import { feedbacks } from "./db/schema";

type FeedbackRow = typeof feedbacks.$inferSelect;

function toRow(feedback: Feedback): typeof feedbacks.$inferInsert {
  return {
    answerId: feedback.answerId,
    score: feedback.score,
    issues: JSON.stringify(feedback.issues.map((issue) => issue.type)),
    comment: feedback.comment
  };
}

function fromRow(row: FeedbackRow): Feedback {
  const issueTypes = JSON.parse(row.issues) as unknown;
  return FeedbackSchema.parse({
    answerId: row.answerId,
    score: row.score,
    issues: Array.isArray(issueTypes) ? issueTypes.map((type) => ({ type })) : issueTypes,
    comment: row.comment
  });
}

export class FeedbackRepository {
  constructor(private readonly db: DbClient) {}

  async create(feedback: Feedback): Promise<Feedback> {
    const validated = FeedbackSchema.parse(feedback);
    this.db.insert(feedbacks).values(toRow(validated)).run();
    return validated;
  }

  async findByAnswerId(id: AnswerId): Promise<Feedback | null> {
    const row = this.db.select().from(feedbacks).where(eq(feedbacks.answerId, id)).get();
    return row ? fromRow(row) : null;
  }
}
