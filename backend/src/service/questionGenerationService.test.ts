import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDbClient, type DbClient } from "../infra/db/client";
import { runMigrations } from "../infra/db/migrate";
import { NoteRepository } from "../infra/NoteRepository";
import { ConceptRepository } from "../infra/ConceptRepository";
import { QuestionRepository } from "../infra/QuestionRepository";
import { FakeLlmClient } from "../infra/llm/FakeLlmClient";
import { createDefaultQuestionPolicy } from "../policy/QuestionPolicy";
import { createQuestionGenerationService } from "./questionGenerationService";
import { parseNoteId, type Note, type NoteId } from "../domain";

let db: DbClient;
let noteRepo: NoteRepository;
let conceptRepo: ConceptRepository;
let questionRepo: QuestionRepository;
let noteId: NoteId;

beforeEach(async () => {
  db = createDbClient(":memory:");
  runMigrations(db);
  noteRepo = new NoteRepository(db);
  conceptRepo = new ConceptRepository(db);
  questionRepo = new QuestionRepository(db);

  noteId = parseNoteId("3fa85f64-5717-4562-b3fc-2c963f66afa6");
  const note: Note = {
    id: noteId,
    source: { type: "InAppMemo" },
    title: "제목",
    contentMarkdown:
      "재귀는 자기 자신을 호출하는 함수다. 반복은 조건이 참인 동안 되풀이하는 것이다.",
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z")
  };
  await noteRepo.create(note);
});

function makeFakeLlm() {
  return new FakeLlmClient((template) => {
    if (template.name === "extract-concepts") {
      return {
        ok: true,
        data: {
          concepts: [
            { term: "재귀", explanation: "자기 자신을 호출하는 함수" },
            { term: "반복", explanation: "조건이 참인 동안 되풀이하는 것" }
          ]
        }
      };
    }
    if (template.name === "generate-multiple-choice") {
      return {
        ok: true,
        data: { prompt: "재귀란?", options: ["A", "B", "C", "D"], correctIndex: 1 }
      };
    }
    if (template.name === "generate-short-answer") {
      return { ok: true, data: { prompt: "반복을 설명하세요" } };
    }
    throw new Error(`unexpected template: ${template.name}`);
  });
}

describe("questionGenerationService", () => {
  it("extracts concepts and generates one question per concept", async () => {
    const service = createQuestionGenerationService({
      noteRepo,
      conceptRepo,
      questionRepo,
      llm: makeFakeLlm(),
      questionPolicy: createDefaultQuestionPolicy()
    });

    const result = await service.generateForNote(noteId);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.concepts).toHaveLength(2);
      expect(result.questions).toHaveLength(2);
      expect(result.questions.map((q) => q.type)).toEqual(["MultipleChoice", "ShortAnswer"]);
    }

    const savedConcepts = await conceptRepo.findByNoteId(noteId);
    const savedQuestions = await questionRepo.findByNoteId(noteId);
    expect(savedConcepts).toHaveLength(2);
    expect(savedQuestions).toHaveLength(2);
  });

  it("generates an Essay question once the rotation reaches the third concept", async () => {
    const llm = new FakeLlmClient((template) => {
      if (template.name === "extract-concepts") {
        return {
          ok: true,
          data: {
            concepts: [
              { term: "재귀", explanation: "자기 자신을 호출하는 함수" },
              { term: "반복", explanation: "조건이 참인 동안 되풀이하는 것" },
              { term: "불황형 흑자", explanation: "불황 속에서도 흑자를 내는 현상" }
            ]
          }
        };
      }
      if (template.name === "generate-multiple-choice") {
        return {
          ok: true,
          data: { prompt: "재귀란?", options: ["A", "B", "C", "D"], correctIndex: 1 }
        };
      }
      if (template.name === "generate-short-answer") {
        return { ok: true, data: { prompt: "반복을 설명하세요" } };
      }
      if (template.name === "generate-essay") {
        return { ok: true, data: { prompt: "불황형 흑자를 설명하시오" } };
      }
      if (template.name === "generate-active-recall") {
        return { ok: true, data: { prompt: "연결 질문", usedConceptIndexes: [0, 1] } };
      }
      throw new Error(`unexpected template: ${template.name}`);
    });
    const service = createQuestionGenerationService({
      noteRepo,
      conceptRepo,
      questionRepo,
      llm,
      questionPolicy: createDefaultQuestionPolicy()
    });

    const result = await service.generateForNote(noteId);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok result");
    const rotationQuestions = result.questions.filter((q) => q.type !== "ActiveRecall");
    expect(rotationQuestions.map((q) => q.type)).toEqual([
      "MultipleChoice",
      "ShortAnswer",
      "Essay"
    ]);
    const essayQuestion = rotationQuestions[2];
    expect(essayQuestion?.type).toBe("Essay");
    if (essayQuestion?.type === "Essay") {
      expect(essayQuestion.conceptId).toBe(result.concepts[2]?.id);
      expect(essayQuestion.prompt).toBe("불황형 흑자를 설명하시오");
    }
  });

  it("generates an ActiveRecall question when there are 3 or more concepts, mapping usedConceptIndexes back to conceptIds", async () => {
    const llm = new FakeLlmClient((template) => {
      if (template.name === "extract-concepts") {
        return {
          ok: true,
          data: {
            concepts: [
              { term: "재귀", explanation: "자기 자신을 호출하는 함수" },
              { term: "반복", explanation: "조건이 참인 동안 되풀이하는 것" },
              { term: "불황형 흑자", explanation: "불황 속에서도 흑자를 내는 현상" }
            ]
          }
        };
      }
      if (template.name === "generate-multiple-choice") {
        return {
          ok: true,
          data: { prompt: "재귀란?", options: ["A", "B", "C", "D"], correctIndex: 1 }
        };
      }
      if (template.name === "generate-short-answer") {
        return { ok: true, data: { prompt: "반복을 설명하세요" } };
      }
      if (template.name === "generate-essay") {
        return { ok: true, data: { prompt: "불황형 흑자를 설명하시오" } };
      }
      if (template.name === "generate-active-recall") {
        return {
          ok: true,
          data: {
            prompt: "재귀와 불황형 흑자는 어떤 점에서 다른가?",
            usedConceptIndexes: [0, 2]
          }
        };
      }
      throw new Error(`unexpected template: ${template.name}`);
    });
    const service = createQuestionGenerationService({
      noteRepo,
      conceptRepo,
      questionRepo,
      llm,
      questionPolicy: createDefaultQuestionPolicy()
    });

    const result = await service.generateForNote(noteId);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok result");
    const activeRecallQuestion = result.questions.find((q) => q.type === "ActiveRecall");
    expect(activeRecallQuestion).toBeDefined();
    if (activeRecallQuestion?.type === "ActiveRecall") {
      expect(activeRecallQuestion.prompt).toBe("재귀와 불황형 흑자는 어떤 점에서 다른가?");
      expect(activeRecallQuestion.conceptIds).toEqual([
        result.concepts[0]?.id,
        result.concepts[2]?.id
      ]);
    }
    const savedQuestions = await questionRepo.findByNoteId(noteId);
    expect(savedQuestions.some((q) => q.type === "ActiveRecall")).toBe(true);
  });

  it("returns an llm_error when the ActiveRecall response has fewer than 2 valid in-range concept indexes", async () => {
    const llm = new FakeLlmClient((template) => {
      if (template.name === "extract-concepts") {
        return {
          ok: true,
          data: {
            concepts: [
              { term: "재귀", explanation: "자기 자신을 호출하는 함수" },
              { term: "반복", explanation: "조건이 참인 동안 되풀이하는 것" },
              { term: "불황형 흑자", explanation: "불황 속에서도 흑자를 내는 현상" }
            ]
          }
        };
      }
      if (template.name === "generate-multiple-choice") {
        return {
          ok: true,
          data: { prompt: "재귀란?", options: ["A", "B", "C", "D"], correctIndex: 1 }
        };
      }
      if (template.name === "generate-short-answer") {
        return { ok: true, data: { prompt: "반복을 설명하세요" } };
      }
      if (template.name === "generate-essay") {
        return { ok: true, data: { prompt: "불황형 흑자를 설명하시오" } };
      }
      if (template.name === "generate-active-recall") {
        return {
          ok: true,
          data: { prompt: "잘못된 질문", usedConceptIndexes: [5, 6] }
        };
      }
      throw new Error(`unexpected template: ${template.name}`);
    });
    const service = createQuestionGenerationService({
      noteRepo,
      conceptRepo,
      questionRepo,
      llm,
      questionPolicy: createDefaultQuestionPolicy()
    });

    const result = await service.generateForNote(noteId);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected error result");
    expect(result.error).toEqual({
      type: "llm_error",
      error: { type: "invalid_response", message: expect.any(String) }
    });
    expect(await conceptRepo.findByNoteId(noteId)).toEqual([]);
    expect(await questionRepo.findByNoteId(noteId)).toEqual([]);
  });

  it("returns note_not_found for a missing note", async () => {
    const service = createQuestionGenerationService({
      noteRepo,
      conceptRepo,
      questionRepo,
      llm: makeFakeLlm(),
      questionPolicy: createDefaultQuestionPolicy()
    });

    const result = await service.generateForNote(
      parseNoteId("00000000-0000-4000-8000-000000000000")
    );

    expect(result).toEqual({ ok: false, error: { type: "note_not_found" } });
  });

  it("saves nothing when a per-question LLM call fails partway through (atomicity)", async () => {
    const llm = new FakeLlmClient((template) => {
      if (template.name === "extract-concepts") {
        return {
          ok: true,
          data: {
            concepts: [
              { term: "재귀", explanation: "자기 자신을 호출하는 함수" },
              { term: "반복", explanation: "조건이 참인 동안 되풀이하는 것" }
            ]
          }
        };
      }
      if (template.name === "generate-multiple-choice") {
        return {
          ok: true,
          data: { prompt: "재귀란?", options: ["A", "B", "C", "D"], correctIndex: 1 }
        };
      }
      // ShortAnswer 생성 단계에서 실패
      return { ok: false, error: { type: "rate_limit", message: "too many requests" } };
    });
    const service = createQuestionGenerationService({
      noteRepo,
      conceptRepo,
      questionRepo,
      llm,
      questionPolicy: createDefaultQuestionPolicy()
    });

    const result = await service.generateForNote(noteId);

    expect(result).toEqual({
      ok: false,
      error: { type: "llm_error", error: { type: "rate_limit", message: "too many requests" } }
    });
    expect(await conceptRepo.findByNoteId(noteId)).toEqual([]);
    expect(await questionRepo.findByNoteId(noteId)).toEqual([]);
  });

  it("warns to the console when more than 20 concepts are extracted", async () => {
    const manyConcepts = Array.from({ length: 21 }, (_, i) => ({
      term: `개념${i}`,
      explanation: `설명${i}`
    }));
    const llm = new FakeLlmClient((template) => {
      if (template.name === "extract-concepts") {
        return { ok: true, data: { concepts: manyConcepts } };
      }
      if (template.name === "generate-multiple-choice") {
        return {
          ok: true,
          data: { prompt: "질문", options: ["A", "B", "C", "D"], correctIndex: 0 }
        };
      }
      if (template.name === "generate-active-recall") {
        return { ok: true, data: { prompt: "질문", usedConceptIndexes: [0, 1] } };
      }
      return { ok: true, data: { prompt: "질문" } };
    });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const service = createQuestionGenerationService({
      noteRepo,
      conceptRepo,
      questionRepo,
      llm,
      questionPolicy: createDefaultQuestionPolicy()
    });

    await service.generateForNote(noteId);

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
