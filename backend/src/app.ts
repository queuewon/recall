import { Hono } from "hono";
import { cors } from "hono/cors";
import { createNotesRouter } from "./routes/notes";
import { createQuestionsRouter } from "./routes/questions";
import type { NoteService } from "./service/noteService";
import type { QuestionGenerationService } from "./service/questionGenerationService";
import type { AnswerService } from "./service/answerService";

export function createApp(deps: {
  noteService: NoteService;
  questionGenerationService: QuestionGenerationService;
  answerService: AnswerService;
}) {
  const app = new Hono();

  // 인증이 없는 현 단계 기준 전면 허용 — 인증 도입 시 origin을 좁혀 재검토해야 한다(docs/decisions.md).
  app.use("*", cors());

  app.get("/health", (c) => c.json({ status: "ok" }));
  app.route("/notes", createNotesRouter(deps.noteService));
  app.route(
    "/",
    createQuestionsRouter({
      questionGenerationService: deps.questionGenerationService,
      answerService: deps.answerService
    })
  );

  return app;
}
