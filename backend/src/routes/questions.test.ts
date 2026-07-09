import { describe, expect, it, vi } from "vitest";
import { createApp } from "../app";
import type { NoteService } from "../service/noteService";
import type {
  QuestionGenerationResult,
  QuestionGenerationService
} from "../service/questionGenerationService";
import type { AnswerService, SubmitAnswerResult } from "../service/answerService";
import {
  createScore,
  parseAnswerId,
  parseConceptId,
  parseNoteId,
  parseQuestionId,
  type Concept,
  type Question
} from "../domain";

const noteId = parseNoteId("3fa85f64-5717-4562-b3fc-2c963f66afa6");
const questionId = parseQuestionId("5b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e6f");
const conceptId = parseConceptId("1e2d3c4b-5a69-4788-9f0e-1a2b3c4d5e6f");

const sampleConcept: Concept = { id: conceptId, noteId, term: "재귀", explanation: "설명" };
const sampleQuestion: Question = {
  type: "MultipleChoice",
  id: questionId,
  noteId,
  prompt: "질문",
  options: ["A", "B", "C", "D"],
  correctIndex: 0
};

function fakeNoteService(): NoteService {
  return {
    create: vi.fn(),
    list: vi.fn(),
    get: vi.fn(),
    update: vi.fn(),
    remove: vi.fn()
  };
}

function makeApp(overrides: {
  questionGenerationService?: Partial<QuestionGenerationService>;
  answerService?: Partial<AnswerService>;
}) {
  const questionGenerationService: QuestionGenerationService = {
    generateForNote: vi.fn(async (): Promise<QuestionGenerationResult> => ({
      ok: true,
      concepts: [sampleConcept],
      questions: [sampleQuestion]
    })),
    listForNote: vi.fn(async () => [sampleQuestion]),
    get: vi.fn(async () => sampleQuestion),
    ...overrides.questionGenerationService
  };
  const answerService: AnswerService = {
    submit: vi.fn(async (): Promise<SubmitAnswerResult> => ({
      ok: true,
      answer: {
        id: parseAnswerId("2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e"),
        questionId,
        content: "0",
        submittedAt: new Date("2026-01-01T00:00:00Z")
      },
      feedback: {
        answerId: parseAnswerId("2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e"),
        score: createScore(100),
        issues: [],
        comment: "정답입니다."
      }
    })),
    ...overrides.answerService
  };
  return createApp({ noteService: fakeNoteService(), questionGenerationService, answerService });
}

function jsonRequest(method: string, body: unknown) {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

describe("questions routes", () => {
  it("POST /notes/:noteId/questions returns 201 with concepts and questions", async () => {
    const app = makeApp({});

    const res = await app.request(`/notes/${noteId}/questions`, { method: "POST" });

    expect(res.status).toBe(201);
    const body = (await res.json()) as { concepts: unknown[]; questions: unknown[] };
    expect(body.concepts).toHaveLength(1);
    expect(body.questions).toHaveLength(1);
  });

  it("POST /notes/:noteId/questions returns 400 for a malformed note id", async () => {
    const app = makeApp({});

    const res = await app.request("/notes/not-a-uuid/questions", { method: "POST" });

    expect(res.status).toBe(400);
  });

  it("POST /notes/:noteId/questions returns 404 when the note is not found", async () => {
    const app = makeApp({
      questionGenerationService: {
        generateForNote: vi.fn(async (): Promise<QuestionGenerationResult> => ({
          ok: false,
          error: { type: "note_not_found" }
        }))
      }
    });

    const res = await app.request(`/notes/${noteId}/questions`, { method: "POST" });

    expect(res.status).toBe(404);
  });

  it("POST /notes/:noteId/questions returns 502 when the LLM call fails", async () => {
    const app = makeApp({
      questionGenerationService: {
        generateForNote: vi.fn(async (): Promise<QuestionGenerationResult> => ({
          ok: false,
          error: { type: "llm_error", error: { type: "rate_limit", message: "too many" } }
        }))
      }
    });

    const res = await app.request(`/notes/${noteId}/questions`, { method: "POST" });

    expect(res.status).toBe(502);
  });

  it("GET /notes/:noteId/questions returns 200 with the question list", async () => {
    const app = makeApp({});

    const res = await app.request(`/notes/${noteId}/questions`);

    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(1);
  });

  it("GET /questions/:id returns 200 for an existing question", async () => {
    const app = makeApp({});

    const res = await app.request(`/questions/${questionId}`);

    expect(res.status).toBe(200);
  });

  it("GET /questions/:id returns 400 for a malformed id", async () => {
    const app = makeApp({});

    const res = await app.request("/questions/not-a-uuid");

    expect(res.status).toBe(400);
  });

  it("GET /questions/:id returns 404 when the question is not found", async () => {
    const app = makeApp({ questionGenerationService: { get: vi.fn(async () => null) } });

    const res = await app.request(`/questions/${questionId}`);

    expect(res.status).toBe(404);
  });

  it("POST /questions/:id/answers returns 201 with answer and feedback", async () => {
    const app = makeApp({});

    const res = await app.request(
      `/questions/${questionId}/answers`,
      jsonRequest("POST", { content: "0" })
    );

    expect(res.status).toBe(201);
    const body = (await res.json()) as { answer: unknown; feedback: unknown };
    expect(body.answer).toBeDefined();
    expect(body.feedback).toBeDefined();
  });

  it("POST /questions/:id/answers returns 400 for empty content", async () => {
    const app = makeApp({});

    const res = await app.request(
      `/questions/${questionId}/answers`,
      jsonRequest("POST", { content: "" })
    );

    expect(res.status).toBe(400);
  });

  it("POST /questions/:id/answers returns 404 when the question is not found", async () => {
    const app = makeApp({
      answerService: {
        submit: vi.fn(async (): Promise<SubmitAnswerResult> => ({
          ok: false,
          error: { type: "question_not_found" }
        }))
      }
    });

    const res = await app.request(
      `/questions/${questionId}/answers`,
      jsonRequest("POST", { content: "0" })
    );

    expect(res.status).toBe(404);
  });

  it("POST /questions/:id/answers returns 400 for malformed_answer", async () => {
    const app = makeApp({
      answerService: {
        submit: vi.fn(async (): Promise<SubmitAnswerResult> => ({
          ok: false,
          error: { type: "malformed_answer", message: "not a valid index" }
        }))
      }
    });

    const res = await app.request(
      `/questions/${questionId}/answers`,
      jsonRequest("POST", { content: "모름" })
    );

    expect(res.status).toBe(400);
  });

  it("POST /questions/:id/answers returns 502 when grading fails via the LLM", async () => {
    const app = makeApp({
      answerService: {
        submit: vi.fn(async (): Promise<SubmitAnswerResult> => ({
          ok: false,
          error: { type: "llm_error", error: { type: "rate_limit", message: "too many" } }
        }))
      }
    });

    const res = await app.request(
      `/questions/${questionId}/answers`,
      jsonRequest("POST", { content: "답" })
    );

    expect(res.status).toBe(502);
  });
});
