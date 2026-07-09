import { randomUUID } from "node:crypto";
import { formatConceptList } from "../infra/llm/conceptListFormat";
import { extractConceptsTemplate } from "../infra/llm/extractConcepts.template";
import { generateActiveRecallTemplate } from "../infra/llm/generateActiveRecall.template";
import { generateEssayTemplate } from "../infra/llm/generateEssay.template";
import { generateMultipleChoiceTemplate } from "../infra/llm/generateMultipleChoice.template";
import { generateShortAnswerTemplate } from "../infra/llm/generateShortAnswer.template";
import type { LlmClient, LlmError } from "../infra/llm/LlmClient";
import type { ConceptRepository } from "../infra/ConceptRepository";
import type { NoteRepository } from "../infra/NoteRepository";
import type { QuestionRepository } from "../infra/QuestionRepository";
import type { QuestionPolicy } from "../policy/QuestionPolicy";
import {
  parseConceptId,
  parseQuestionId,
  type Concept,
  type NoteId,
  type Question,
  type QuestionId
} from "../domain";

const CONCEPT_COUNT_WARNING_THRESHOLD = 20;

export type QuestionGenerationError =
  { type: "note_not_found" } | { type: "llm_error"; error: LlmError };

export type QuestionGenerationResult =
  | { ok: true; concepts: Concept[]; questions: Question[] }
  | { ok: false; error: QuestionGenerationError };

export function createQuestionGenerationService(deps: {
  noteRepo: NoteRepository;
  conceptRepo: ConceptRepository;
  questionRepo: QuestionRepository;
  llm: LlmClient;
  questionPolicy: QuestionPolicy;
}) {
  const { noteRepo, conceptRepo, questionRepo, llm, questionPolicy } = deps;

  return {
    async generateForNote(noteId: NoteId): Promise<QuestionGenerationResult> {
      const note = await noteRepo.findById(noteId);
      if (!note) {
        return { ok: false, error: { type: "note_not_found" } };
      }

      const extraction = await llm.complete(extractConceptsTemplate, {
        noteContent: note.contentMarkdown
      });
      if (!extraction.ok) {
        return { ok: false, error: { type: "llm_error", error: extraction.error } };
      }

      if (extraction.data.concepts.length > CONCEPT_COUNT_WARNING_THRESHOLD) {
        console.warn(
          `[questionGenerationService] note ${noteId} produced ${extraction.data.concepts.length} concepts (> ${CONCEPT_COUNT_WARNING_THRESHOLD})`
        );
      }

      const concepts: Concept[] = extraction.data.concepts.map((c) => ({
        id: parseConceptId(randomUUID()),
        noteId,
        term: c.term,
        explanation: c.explanation
      }));

      const conceptsById = new Map(concepts.map((c) => [c.id, c]));
      const plan = questionPolicy.plan(concepts);

      const questions: Question[] = [];
      for (const item of plan) {
        if (item.type === "ActiveRecall") {
          const candidateConcepts = item.conceptIds
            .map((id) => conceptsById.get(id))
            .filter((c): c is Concept => c !== undefined);
          if (candidateConcepts.length < 2) {
            continue;
          }

          const result = await llm.complete(generateActiveRecallTemplate, {
            conceptList: formatConceptList(candidateConcepts)
          });
          if (!result.ok) {
            return { ok: false, error: { type: "llm_error", error: result.error } };
          }

          // 후보 풀 중 실제로 연결에 쓰인 개념만 골라 conceptIds로 남긴다 —
          // 범위 밖/중복 인덱스는 거부한다(그대로 신뢰하면 저장 시 깨진 참조가 생긴다).
          const usedIndexes = [...new Set(result.data.usedConceptIndexes)].filter(
            (index) => index >= 0 && index < candidateConcepts.length
          );
          if (usedIndexes.length < 2) {
            return {
              ok: false,
              error: {
                type: "llm_error",
                error: {
                  type: "invalid_response",
                  message: `usedConceptIndexes must reference at least 2 distinct, in-range concepts (pool size ${candidateConcepts.length}), got ${JSON.stringify(result.data.usedConceptIndexes)}`
                }
              }
            };
          }

          questions.push({
            type: "ActiveRecall",
            id: parseQuestionId(randomUUID()),
            noteId,
            prompt: result.data.prompt,
            conceptIds: usedIndexes.map((index) => {
              const usedConcept = candidateConcepts[index];
              if (!usedConcept) {
                throw new Error("unreachable: index already bounds-checked");
              }
              return usedConcept.id;
            })
          });
          continue;
        }

        const concept = conceptsById.get(item.conceptId);
        if (!concept) {
          continue;
        }

        switch (item.type) {
          case "MultipleChoice": {
            const result = await llm.complete(generateMultipleChoiceTemplate, {
              conceptTerm: concept.term,
              conceptExplanation: concept.explanation
            });
            if (!result.ok) {
              return { ok: false, error: { type: "llm_error", error: result.error } };
            }
            questions.push({
              type: "MultipleChoice",
              id: parseQuestionId(randomUUID()),
              noteId,
              prompt: result.data.prompt,
              options: result.data.options,
              correctIndex: result.data.correctIndex
            });
            break;
          }
          case "ShortAnswer": {
            const result = await llm.complete(generateShortAnswerTemplate, {
              conceptTerm: concept.term,
              conceptExplanation: concept.explanation
            });
            if (!result.ok) {
              return { ok: false, error: { type: "llm_error", error: result.error } };
            }
            questions.push({
              type: "ShortAnswer",
              id: parseQuestionId(randomUUID()),
              noteId,
              prompt: result.data.prompt,
              conceptId: concept.id
            });
            break;
          }
          case "Essay": {
            const result = await llm.complete(generateEssayTemplate, {
              conceptTerm: concept.term,
              conceptExplanation: concept.explanation
            });
            if (!result.ok) {
              return { ok: false, error: { type: "llm_error", error: result.error } };
            }
            questions.push({
              type: "Essay",
              id: parseQuestionId(randomUUID()),
              noteId,
              prompt: result.data.prompt,
              conceptId: concept.id
            });
            break;
          }
        }
      }

      const savedConcepts = await conceptRepo.createMany(concepts);
      const savedQuestions: Question[] = [];
      for (const question of questions) {
        savedQuestions.push(await questionRepo.create(question));
      }

      return { ok: true, concepts: savedConcepts, questions: savedQuestions };
    },

    async listForNote(noteId: NoteId): Promise<Question[]> {
      return questionRepo.findByNoteId(noteId);
    },

    async get(id: QuestionId): Promise<Question | null> {
      return questionRepo.findById(id);
    }
  };
}

export type QuestionGenerationService = ReturnType<typeof createQuestionGenerationService>;
