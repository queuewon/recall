import { randomUUID } from "node:crypto";
import type { AnswerRepository } from "../infra/AnswerRepository";
import type { ConceptRepository } from "../infra/ConceptRepository";
import type { FeedbackRepository } from "../infra/FeedbackRepository";
import type { QuestionRepository } from "../infra/QuestionRepository";
import type { GradingError, GradingPolicy } from "../policy/GradingPolicy";
import {
  parseAnswerId,
  type Answer,
  type ConceptId,
  type Feedback,
  type Question,
  type QuestionId
} from "../domain";

export type SubmitAnswerError = { type: "question_not_found" } | GradingError;

export type SubmitAnswerResult =
  { ok: true; answer: Answer; feedback: Feedback } | { ok: false; error: SubmitAnswerError };

// ShortAnswer/Essay/ActiveRecall은 모두 채점 기준이 되는 개념을 conceptId로 갖는다.
// MultipleChoice만 개념 조회가 필요 없다.
function getConceptId(question: Question): ConceptId | undefined {
  switch (question.type) {
    case "ShortAnswer":
    case "Essay":
    case "ActiveRecall":
      return question.conceptId;
    case "MultipleChoice":
      return undefined;
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

      const conceptId = getConceptId(question);
      const concept = conceptId ? await conceptRepo.findById(conceptId) : null;

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
