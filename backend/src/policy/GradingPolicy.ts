import { gradeEssayTemplate } from "../infra/llm/gradeEssay.template";
import { gradeShortAnswerTemplate } from "../infra/llm/gradeShortAnswer.template";
import type { LlmClient, LlmError } from "../infra/llm/LlmClient";
import {
  createScore,
  type Answer,
  type Concept,
  type Feedback,
  type MultipleChoiceQuestion,
  type Question
} from "../domain";

export type GradingError =
  | { type: "llm_error"; error: LlmError }
  | { type: "unsupported_question_type"; message: string }
  | { type: "missing_concept"; message: string }
  | { type: "malformed_answer"; message: string };

export type GradingResult = { ok: true; feedback: Feedback } | { ok: false; error: GradingError };

export function gradeMultipleChoiceDeterministically(
  question: MultipleChoiceQuestion,
  answer: Answer
): GradingResult {
  const selectedIndex = Number(answer.content);
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex > 3) {
    return {
      ok: false,
      error: {
        type: "malformed_answer",
        message: `expected an option index between 0 and 3, got "${answer.content}"`
      }
    };
  }

  const correct = selectedIndex === question.correctIndex;
  return {
    ok: true,
    feedback: {
      answerId: answer.id,
      score: createScore(correct ? 100 : 0),
      issues: correct ? [] : [{ type: "conceptConfusion" }],
      comment: correct
        ? "정답입니다."
        : `오답입니다. 정답은 "${question.options[question.correctIndex]}"입니다.`
    }
  };
}

// ShortAnswer/Essay 채점은 서로 다른 프롬프트를 쓸 뿐, 흐름과 응답 스키마
// ({score, issues, comment})가 완전히 같아 template만 매개변수화한다.
async function gradeWithLlm(
  llm: LlmClient,
  template: typeof gradeShortAnswerTemplate,
  question: Question,
  answer: Answer,
  concept: Concept
): Promise<GradingResult> {
  const result = await llm.complete(template, {
    conceptTerm: concept.term,
    conceptExplanation: concept.explanation,
    question: question.prompt,
    answer: answer.content
  });

  if (!result.ok) {
    return { ok: false, error: { type: "llm_error", error: result.error } };
  }

  return {
    ok: true,
    feedback: {
      answerId: answer.id,
      score: createScore(result.data.score),
      issues: result.data.issues.map((type) => ({ type })),
      comment: result.data.comment
    }
  };
}

export interface GradingPolicy {
  grade(question: Question, answer: Answer, concept: Concept | null): Promise<GradingResult>;
}

export function createDefaultGradingPolicy(llm: LlmClient): GradingPolicy {
  return {
    async grade(question, answer, concept) {
      if (question.type === "MultipleChoice") {
        return gradeMultipleChoiceDeterministically(question, answer);
      }
      if (question.type === "ShortAnswer" || question.type === "Essay") {
        if (!concept) {
          return {
            ok: false,
            error: {
              type: "missing_concept",
              message: `${question.type} grading requires a concept`
            }
          };
        }
        const template =
          question.type === "ShortAnswer" ? gradeShortAnswerTemplate : gradeEssayTemplate;
        return gradeWithLlm(llm, template, question, answer, concept);
      }
      return {
        ok: false,
        error: {
          type: "unsupported_question_type",
          message: `unsupported question type: ${question.type}`
        }
      };
    }
  };
}
