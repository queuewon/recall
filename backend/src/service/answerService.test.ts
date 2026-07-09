import { beforeEach, describe, expect, it } from "vitest";
import { createDbClient, type DbClient } from "../infra/db/client";
import { runMigrations } from "../infra/db/migrate";
import { NoteRepository } from "../infra/NoteRepository";
import { ConceptRepository } from "../infra/ConceptRepository";
import { QuestionRepository } from "../infra/QuestionRepository";
import { AnswerRepository } from "../infra/AnswerRepository";
import { FeedbackRepository } from "../infra/FeedbackRepository";
import { FakeLlmClient } from "../infra/llm/FakeLlmClient";
import { createDefaultGradingPolicy } from "../policy/GradingPolicy";
import { createAnswerService } from "./answerService";
import {
  parseConceptId,
  parseNoteId,
  parseQuestionId,
  type Concept,
  type Note,
  type NoteId,
  type Question
} from "../domain";

let db: DbClient;
let questionRepo: QuestionRepository;
let conceptRepo: ConceptRepository;
let answerRepo: AnswerRepository;
let feedbackRepo: FeedbackRepository;
let noteId: NoteId;

beforeEach(async () => {
  db = createDbClient(":memory:");
  runMigrations(db);
  questionRepo = new QuestionRepository(db);
  conceptRepo = new ConceptRepository(db);
  answerRepo = new AnswerRepository(db);
  feedbackRepo = new FeedbackRepository(db);

  noteId = parseNoteId("3fa85f64-5717-4562-b3fc-2c963f66afa6");
  const note: Note = {
    id: noteId,
    source: { type: "InAppMemo" },
    title: "제목",
    contentMarkdown: "# 내용",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z")
  };
  await new NoteRepository(db).create(note);
});

describe("answerService", () => {
  it("grades a MultipleChoice submission deterministically without calling the LLM", async () => {
    const questionId = parseQuestionId("5b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e6f");
    const question: Question = {
      type: "MultipleChoice",
      id: questionId,
      noteId,
      prompt: "질문",
      options: ["A", "B", "C", "D"],
      correctIndex: 1
    };
    await questionRepo.create(question);
    const llm = new FakeLlmClient({
      ok: false,
      error: { type: "network", message: "should not be called" }
    });
    const service = createAnswerService({
      questionRepo,
      conceptRepo,
      answerRepo,
      feedbackRepo,
      gradingPolicy: createDefaultGradingPolicy(llm)
    });

    const result = await service.submit(questionId, "1");

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok result");
    expect(result.feedback.score).toBe(100);
    expect(result.answer.content).toBe("1");
    expect(await answerRepo.findById(result.answer.id)).not.toBeNull();
  });

  it("grades a ShortAnswer submission via the LLM using the linked concept", async () => {
    const conceptId = parseConceptId("1e2d3c4b-5a69-4788-9f0e-1a2b3c4d5e6f");
    const concept: Concept = {
      id: conceptId,
      noteId,
      term: "재귀",
      explanation: "자기 자신을 호출하는 함수"
    };
    await conceptRepo.createMany([concept]);

    const questionId = parseQuestionId("6b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e70");
    const question: Question = {
      type: "ShortAnswer",
      id: questionId,
      noteId,
      prompt: "재귀란 무엇인가?",
      conceptId
    };
    await questionRepo.create(question);

    const llm = new FakeLlmClient({
      ok: true,
      data: { score: 70, issues: ["logicGap"], comment: "조금 더 설명이 필요합니다" }
    });
    const service = createAnswerService({
      questionRepo,
      conceptRepo,
      answerRepo,
      feedbackRepo,
      gradingPolicy: createDefaultGradingPolicy(llm)
    });

    const result = await service.submit(questionId, "자기 자신을 부르는 함수");

    expect(result).toEqual({
      ok: true,
      answer: expect.objectContaining({ content: "자기 자신을 부르는 함수" }),
      feedback: expect.objectContaining({
        score: 70,
        issues: [{ type: "logicGap" }],
        comment: "조금 더 설명이 필요합니다"
      })
    });
    if (!result.ok) throw new Error("expected ok result");
    const savedFeedback = await feedbackRepo.findByAnswerId(result.answer.id);
    expect(savedFeedback).not.toBeNull();
  });

  it("grades an Essay submission via the LLM using the linked concept", async () => {
    const conceptId = parseConceptId("1e2d3c4b-5a69-4788-9f0e-1a2b3c4d5e6f");
    const concept: Concept = {
      id: conceptId,
      noteId,
      term: "불황형 흑자",
      explanation: "불황 속에서도 흑자를 내는 현상"
    };
    await conceptRepo.createMany([concept]);

    const questionId = parseQuestionId("7b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e71");
    const question: Question = {
      type: "Essay",
      id: questionId,
      noteId,
      prompt: "불황형 흑자를 설명하시오",
      conceptId
    };
    await questionRepo.create(question);

    const llm = new FakeLlmClient({
      ok: true,
      data: { score: 55, issues: ["counterexampleMissing"], comment: "반례를 더 제시하세요" }
    });
    const service = createAnswerService({
      questionRepo,
      conceptRepo,
      answerRepo,
      feedbackRepo,
      gradingPolicy: createDefaultGradingPolicy(llm)
    });

    const result = await service.submit(questionId, "서술 답안입니다");

    expect(result).toEqual({
      ok: true,
      answer: expect.objectContaining({ content: "서술 답안입니다" }),
      feedback: expect.objectContaining({
        score: 55,
        issues: [{ type: "counterexampleMissing" }],
        comment: "반례를 더 제시하세요"
      })
    });
  });

  it("grades an ActiveRecall submission via the LLM using all linked concepts", async () => {
    const conceptId = parseConceptId("1e2d3c4b-5a69-4788-9f0e-1a2b3c4d5e6f");
    const conceptId2 = parseConceptId("2e2d3c4b-5a69-4788-9f0e-1a2b3c4d5e70");
    const concept: Concept = {
      id: conceptId,
      noteId,
      term: "원화 약세",
      explanation: "원화 가치가 하락하는 것"
    };
    const concept2: Concept = {
      id: conceptId2,
      noteId,
      term: "수출 호재",
      explanation: "수출에 유리하게 작용하는 것"
    };
    await conceptRepo.createMany([concept, concept2]);

    const questionId = parseQuestionId("8b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e72");
    const question: Question = {
      type: "ActiveRecall",
      id: questionId,
      noteId,
      prompt: "원화 약세가 항상 수출 호재가 아닌 이유 3가지",
      conceptIds: [conceptId, conceptId2]
    };
    await questionRepo.create(question);

    const llm = new FakeLlmClient({
      ok: true,
      data: { score: 60, issues: ["logicGap"], comment: "예외 상황을 더 짚어보세요" }
    });
    const service = createAnswerService({
      questionRepo,
      conceptRepo,
      answerRepo,
      feedbackRepo,
      gradingPolicy: createDefaultGradingPolicy(llm)
    });

    const result = await service.submit(questionId, "연결 답변입니다");

    expect(result).toEqual({
      ok: true,
      answer: expect.objectContaining({ content: "연결 답변입니다" }),
      feedback: expect.objectContaining({
        score: 60,
        issues: [{ type: "logicGap" }],
        comment: "예외 상황을 더 짚어보세요"
      })
    });
  });

  it("returns question_not_found for a missing question", async () => {
    const llm = new FakeLlmClient({
      ok: false,
      error: { type: "network", message: "should not be called" }
    });
    const service = createAnswerService({
      questionRepo,
      conceptRepo,
      answerRepo,
      feedbackRepo,
      gradingPolicy: createDefaultGradingPolicy(llm)
    });

    const result = await service.submit(
      parseQuestionId("00000000-0000-4000-8000-000000000000"),
      "1"
    );

    expect(result).toEqual({ ok: false, error: { type: "question_not_found" } });
  });

  it("does not persist an answer or feedback when grading fails (malformed_answer)", async () => {
    const questionId = parseQuestionId("5b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e6f");
    const question: Question = {
      type: "MultipleChoice",
      id: questionId,
      noteId,
      prompt: "질문",
      options: ["A", "B", "C", "D"],
      correctIndex: 1
    };
    await questionRepo.create(question);
    const llm = new FakeLlmClient({
      ok: false,
      error: { type: "network", message: "should not be called" }
    });
    const service = createAnswerService({
      questionRepo,
      conceptRepo,
      answerRepo,
      feedbackRepo,
      gradingPolicy: createDefaultGradingPolicy(llm)
    });

    const result = await service.submit(questionId, "모르겠어요");

    expect(result).toEqual({
      ok: false,
      error: { type: "malformed_answer", message: expect.any(String) }
    });
  });
});
