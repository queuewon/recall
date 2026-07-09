import { Hono } from "hono";
import { z } from "zod";
import { parseNoteId, parseQuestionId } from "../domain";
import { readJsonBody } from "./httpUtils";
import type { AnswerService, SubmitAnswerError } from "../service/answerService";
import type {
  QuestionGenerationError,
  QuestionGenerationService
} from "../service/questionGenerationService";

const SubmitAnswerBody = z.object({ content: z.string().min(1) });

function questionGenerationErrorStatus(error: QuestionGenerationError): 404 | 502 {
  return error.type === "note_not_found" ? 404 : 502;
}

function submitAnswerErrorStatus(error: SubmitAnswerError): 400 | 404 | 500 | 502 {
  switch (error.type) {
    case "question_not_found":
      return 404;
    case "llm_error":
      return 502;
    case "malformed_answer":
    case "unsupported_question_type":
      return 400;
    case "missing_concept":
      return 500;
  }
}

export function createQuestionsRouter(deps: {
  questionGenerationService: QuestionGenerationService;
  answerService: AnswerService;
}) {
  const router = new Hono();
  const { questionGenerationService, answerService } = deps;

  router.post("/notes/:noteId/questions", async (c) => {
    const idResult = z.string().uuid().safeParse(c.req.param("noteId"));
    if (!idResult.success) {
      return c.json({ error: "invalid note id" }, 400);
    }
    const result = await questionGenerationService.generateForNote(parseNoteId(idResult.data));
    if (!result.ok) {
      return c.json({ error: result.error.type }, questionGenerationErrorStatus(result.error));
    }
    return c.json({ concepts: result.concepts, questions: result.questions }, 201);
  });

  router.get("/notes/:noteId/questions", async (c) => {
    const idResult = z.string().uuid().safeParse(c.req.param("noteId"));
    if (!idResult.success) {
      return c.json({ error: "invalid note id" }, 400);
    }
    const questions = await questionGenerationService.listForNote(parseNoteId(idResult.data));
    return c.json(questions, 200);
  });

  router.get("/questions/:id", async (c) => {
    const idResult = z.string().uuid().safeParse(c.req.param("id"));
    if (!idResult.success) {
      return c.json({ error: "invalid question id" }, 400);
    }
    const question = await questionGenerationService.get(parseQuestionId(idResult.data));
    if (!question) {
      return c.json({ error: "question not found" }, 404);
    }
    return c.json(question, 200);
  });

  router.post("/questions/:id/answers", async (c) => {
    const idResult = z.string().uuid().safeParse(c.req.param("id"));
    if (!idResult.success) {
      return c.json({ error: "invalid question id" }, 400);
    }
    const bodyResult = SubmitAnswerBody.safeParse(await readJsonBody(c));
    if (!bodyResult.success) {
      return c.json({ error: "content is required" }, 400);
    }
    const result = await answerService.submit(
      parseQuestionId(idResult.data),
      bodyResult.data.content
    );
    if (!result.ok) {
      return c.json({ error: result.error.type }, submitAnswerErrorStatus(result.error));
    }
    return c.json({ answer: result.answer, feedback: result.feedback }, 201);
  });

  return router;
}
