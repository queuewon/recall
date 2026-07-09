import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  sourceType: text("source_type").notNull(),
  title: text("title").notNull(),
  contentMarkdown: text("content_markdown").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull()
});

export const concepts = sqliteTable("concepts", {
  id: text("id").primaryKey(),
  noteId: text("note_id")
    .notNull()
    .references(() => notes.id),
  term: text("term").notNull(),
  explanation: text("explanation").notNull()
});

export const questions = sqliteTable("questions", {
  id: text("id").primaryKey(),
  noteId: text("note_id")
    .notNull()
    .references(() => notes.id),
  type: text("type").notNull(),
  prompt: text("prompt").notNull(),
  options: text("options"),
  correctIndex: integer("correct_index"),
  conceptId: text("concept_id").references(() => concepts.id),
  conceptIds: text("concept_ids")
});

export const answers = sqliteTable("answers", {
  id: text("id").primaryKey(),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id),
  content: text("content").notNull(),
  submittedAt: integer("submitted_at", { mode: "timestamp" }).notNull()
});

export const feedbacks = sqliteTable("feedbacks", {
  answerId: text("answer_id")
    .primaryKey()
    .references(() => answers.id),
  score: integer("score").notNull(),
  issues: text("issues").notNull(),
  comment: text("comment").notNull()
});
