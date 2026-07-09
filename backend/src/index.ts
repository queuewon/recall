import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { createDefaultDbClient } from "./infra/db/client";
import { runMigrations } from "./infra/db/migrate";
import { NoteRepository } from "./infra/NoteRepository";
import { ConceptRepository } from "./infra/ConceptRepository";
import { QuestionRepository } from "./infra/QuestionRepository";
import { AnswerRepository } from "./infra/AnswerRepository";
import { FeedbackRepository } from "./infra/FeedbackRepository";
import { AnthropicLlmClient } from "./infra/llm/AnthropicLlmClient";
import { createNoteService } from "./service/noteService";
import { createQuestionGenerationService } from "./service/questionGenerationService";
import { createAnswerService } from "./service/answerService";
import { createDefaultQuestionPolicy } from "./policy/QuestionPolicy";
import { createDefaultGradingPolicy } from "./policy/GradingPolicy";

const port = Number(process.env.PORT ?? 3000);

const db = createDefaultDbClient();
runMigrations(db);

const noteRepo = new NoteRepository(db);
const conceptRepo = new ConceptRepository(db);
const questionRepo = new QuestionRepository(db);
const answerRepo = new AnswerRepository(db);
const feedbackRepo = new FeedbackRepository(db);
const llm = new AnthropicLlmClient();

const noteService = createNoteService(noteRepo);
const questionGenerationService = createQuestionGenerationService({
  noteRepo,
  conceptRepo,
  questionRepo,
  llm,
  questionPolicy: createDefaultQuestionPolicy()
});
const answerService = createAnswerService({
  questionRepo,
  conceptRepo,
  answerRepo,
  feedbackRepo,
  gradingPolicy: createDefaultGradingPolicy(llm)
});

serve(
  { fetch: createApp({ noteService, questionGenerationService, answerService }).fetch, port },
  (info) => {
    console.log(`listening on http://localhost:${info.port}`);
  }
);
