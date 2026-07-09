import { Hono } from "hono";
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
