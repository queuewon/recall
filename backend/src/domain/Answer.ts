import { z } from "zod";
import { AnswerIdSchema, QuestionIdSchema } from "./ids";

export const AnswerSchema = z.object({
  id: AnswerIdSchema,
  questionId: QuestionIdSchema,
  content: z.string().min(1),
  submittedAt: z.date()
});
export type Answer = z.infer<typeof AnswerSchema>;
