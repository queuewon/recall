import { randomUUID } from "node:crypto";
import { extractConceptsTemplate } from "../infra/llm/extractConcepts.template";
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
        const concept = conceptsById.get(item.conceptId);
        if (!concept) {
          continue;
        }

        if (item.type === "MultipleChoice") {
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
        } else {
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
