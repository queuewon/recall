import { z } from "zod";
import {
  AnswerSchema,
  FeedbackSchema,
  QuestionSchema,
  type Answer,
  type Feedback,
  type Question
} from "./question";

const QuestionArraySchema = z.array(QuestionSchema);
const GenerateQuestionsResponseSchema = z.object({
  concepts: z.array(z.unknown()),
  questions: QuestionArraySchema
});
const SubmitAnswerResponseSchema = z.object({ answer: AnswerSchema, feedback: FeedbackSchema });

async function parseJson<T>(res: Response, schema: z.ZodType<T>): Promise<T> {
  return schema.parse(await res.json());
}

export async function generateQuestions(noteId: string): Promise<Question[]> {
  const res = await fetch(`/notes/${noteId}/questions`, { method: "POST" });
  if (!res.ok) {
    throw new Error("failed to generate questions");
  }
  const body = await parseJson(res, GenerateQuestionsResponseSchema);
  return body.questions;
}

export async function listQuestions(noteId: string): Promise<Question[]> {
  const res = await fetch(`/notes/${noteId}/questions`);
  if (!res.ok) {
    throw new Error("failed to list questions");
  }
  return parseJson(res, QuestionArraySchema);
}

export async function getQuestion(id: string): Promise<Question> {
  const res = await fetch(`/questions/${id}`);
  if (!res.ok) {
    throw new Error("failed to fetch question");
  }
  return parseJson(res, QuestionSchema);
}

export async function submitAnswer(
  questionId: string,
  content: string
): Promise<{ answer: Answer; feedback: Feedback }> {
  const res = await fetch(`/questions/${questionId}/answers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content })
  });
  if (!res.ok) {
    throw new Error("failed to submit answer");
  }
  return parseJson(res, SubmitAnswerResponseSchema);
}
