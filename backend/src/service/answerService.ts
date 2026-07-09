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
  type Feedback,
  type QuestionId
} from "../domain";

export type SubmitAnswerError = { type: "question_not_found" } | GradingError;

export type SubmitAnswerResult =
  { ok: true; answer: Answer; feedback: Feedback } | { ok: false; error: SubmitAnswerError };

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

      let concept: Concept | null = null;
      if (question.type === "ShortAnswer" && question.conceptId) {
        concept = await conceptRepo.findById(question.conceptId);
      } else if (question.type === "ActiveRecall") {
        concept = await conceptRepo.findById(question.conceptId);
      }

      const gradeResult = await gradingPolicy.grade(question, answer, concept);
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
