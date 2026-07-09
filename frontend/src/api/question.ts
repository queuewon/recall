import { z } from "zod";

export const QuestionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("MultipleChoice"),
    id: z.string().uuid(),
    noteId: z.string().uuid(),
    prompt: z.string(),
    options: z.tuple([z.string(), z.string(), z.string(), z.string()]),
    correctIndex: z.number().int().min(0).max(3)
  }),
  z.object({
    type: z.literal("ShortAnswer"),
    id: z.string().uuid(),
    noteId: z.string().uuid(),
    prompt: z.string(),
    conceptId: z.string().uuid().optional()
  }),
  z.object({
    type: z.literal("Essay"),
    id: z.string().uuid(),
    noteId: z.string().uuid(),
    prompt: z.string(),
    conceptId: z.string().uuid().optional()
  }),
  z.object({
    type: z.literal("ActiveRecall"),
    id: z.string().uuid(),
    noteId: z.string().uuid(),
    prompt: z.string(),
    conceptIds: z.array(z.string().uuid()).min(2)
  })
]);
export type Question = z.infer<typeof QuestionSchema>;

export const FeedbackIssueSchema = z.object({
  type: z.enum(["logicGap", "counterexampleMissing", "conceptConfusion"])
});

export const FeedbackSchema = z.object({
  answerId: z.string(),
  score: z.number().int().min(0).max(100),
  issues: z.array(FeedbackIssueSchema),
  comment: z.string()
});
export type Feedback = z.infer<typeof FeedbackSchema>;

export const AnswerSchema = z.object({
  id: z.string(),
  questionId: z.string(),
  content: z.string(),
  submittedAt: z.string()
});
export type Answer = z.infer<typeof AnswerSchema>;
