import { z } from "zod";
import { AnswerIdSchema } from "./ids";
import { ScoreSchema } from "./score";

export const FeedbackIssueSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("logicGap") }),
  z.object({ type: z.literal("counterexampleMissing") }),
  z.object({ type: z.literal("conceptConfusion") })
]);
export type FeedbackIssue = z.infer<typeof FeedbackIssueSchema>;

export const FeedbackSchema = z.object({
  answerId: AnswerIdSchema,
  score: ScoreSchema,
  issues: z.array(FeedbackIssueSchema),
  comment: z.string()
});
export type Feedback = z.infer<typeof FeedbackSchema>;
