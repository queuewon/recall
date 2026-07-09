import { randomUUID } from "node:crypto";
import type { AnswerRepository } from "../infra/AnswerRepository";
import type { ConceptRepository } from "../infra/ConceptRepository";
import type { FeedbackRepository } from "../infra/FeedbackRepository";
import type { QuestionRepository } from "../infra/QuestionRepository";
import type { GradingError, GradingPolicy } from "../policy/GradingPolicy";
import {
  parseAnswerId,
  type Answer,
  type Concept,
  type ConceptId,
  type Feedback,
  type Question,
  type QuestionId
} from "../domain";

export type SubmitAnswerError = { type: "question_not_found" } | GradingError;

export type SubmitAnswerResult =
  { ok: true; answer: Answer; feedback: Feedback } | { ok: false; error: SubmitAnswerError };

// ShortAnswer/Essay는 개념 0~1개, ActiveRecall은 2개 이상, MultipleChoice는 0개.
function getConceptIds(question: Question): ConceptId[] {
  switch (question.type) {
    case "ShortAnswer":
    case "Essay":
      return question.conceptId ? [question.conceptId] : [];
    case "ActiveRecall":
      return question.conceptIds;
    case "MultipleChoice":
      return [];
  }
}

export function createAnswerService(deps: {
  questionRepo: QuestionRepository;
  conceptRepo: ConceptRepository;
  answerRepo: AnswerRepository;
  feedbackRepo: FeedbackRepository;
  gradingPolicy: GradingPolicy;
}) {
  const { questionRepo, conceptRepo, answerRepo, feedbackRepo, gradingPolicy } = deps;

  return {
    async submit(questionId: QuestionId, content: string): Promise<SubmitAnswerResult> {
      const question = await questionRepo.findById(questionId);
      if (!question) {
        return { ok: false, error: { type: "question_not_found" } };
      }

      const answer: Answer = {
        id: parseAnswerId(randomUUID()),
        questionId,
        content,
        submittedAt: new Date()
      };

      const conceptIds = getConceptIds(question);
      const concepts = (await Promise.all(conceptIds.map((id) => conceptRepo.findById(id)))).filter(
        (c): c is Concept => c !== null
      );

      const gradeResult = await gradingPolicy.grade(question, answer, concepts);
      if (!gradeResult.ok) {
        return { ok: false, error: gradeResult.error };
      }

      const savedAnswer = await answerRepo.create(answer);
      const savedFeedback = await feedbackRepo.create(gradeResult.feedback);

      return { ok: true, answer: savedAnswer, feedback: savedFeedback };
    }
  };
}

export type AnswerService = ReturnType<typeof createAnswerService>;
