import { z } from "zod";
import { ConceptIdSchema, NoteIdSchema, QuestionIdSchema } from "./ids";

const QuestionBaseSchema = z.object({
  id: QuestionIdSchema,
  noteId: NoteIdSchema,
  prompt: z.string().min(1)
});

export const MultipleChoiceQuestionSchema = QuestionBaseSchema.extend({
  type: z.literal("MultipleChoice"),
  options: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  correctIndex: z.number().int().min(0).max(3)
});

export const ShortAnswerQuestionSchema = QuestionBaseSchema.extend({
  type: z.literal("ShortAnswer"),
  conceptId: ConceptIdSchema.optional()
});

export const EssayQuestionSchema = QuestionBaseSchema.extend({
  type: z.literal("Essay"),
  conceptId: ConceptIdSchema.optional()
});

export const ActiveRecallQuestionSchema = QuestionBaseSchema.extend({
  type: z.literal("ActiveRecall"),
  conceptId: ConceptIdSchema
});

export const QuestionSchema = z.discriminatedUnion("type", [
  MultipleChoiceQuestionSchema,
  ShortAnswerQuestionSchema,
  EssayQuestionSchema,
  ActiveRecallQuestionSchema
]);
export type Question = z.infer<typeof QuestionSchema>;

export type MultipleChoiceQuestion = z.infer<typeof MultipleChoiceQuestionSchema>;
export type ShortAnswerQuestion = z.infer<typeof ShortAnswerQuestionSchema>;
export type EssayQuestion = z.infer<typeof EssayQuestionSchema>;
export type ActiveRecallQuestion = z.infer<typeof ActiveRecallQuestionSchema>;
