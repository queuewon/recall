import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QuestionCard } from "./QuestionCard";
import * as questionsApi from "../api/questionsApi";
import type { Question } from "../api/question";

vi.mock("../api/questionsApi", () => ({
  submitAnswer: vi.fn()
}));

const mcQuestion: Question = {
  type: "MultipleChoice",
  id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  noteId: "6b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e70",
  prompt: "다음 중 옳은 것은?",
  options: ["A", "B", "C", "D"],
  correctIndex: 1
};

const shortAnswerQuestion: Question = {
  type: "ShortAnswer",
  id: "5b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e6f",
  noteId: "6b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e70",
  prompt: "재귀란 무엇인가?"
};

describe("QuestionCard", () => {
  it("submits the selected option index for a MultipleChoice question and shows feedback", async () => {
    vi.mocked(questionsApi.submitAnswer).mockResolvedValue({
      answer: {
        id: "a",
        questionId: mcQuestion.id,
        content: "1",
        submittedAt: "2026-01-01T00:00:00.000Z"
      },
      feedback: { answerId: "a", score: 100, issues: [], comment: "정답입니다." }
    });

    render(<QuestionCard question={mcQuestion} />);
    fireEvent.click(screen.getByLabelText("B"));
    fireEvent.click(screen.getByRole("button", { name: "제출" }));

    expect(await screen.findByText("정답입니다.")).toBeInTheDocument();
    expect(questionsApi.submitAnswer).toHaveBeenCalledWith(mcQuestion.id, "1");
  });

  it("submits free text for a ShortAnswer question and shows feedback", async () => {
    vi.mocked(questionsApi.submitAnswer).mockResolvedValue({
      answer: {
        id: "a",
        questionId: shortAnswerQuestion.id,
        content: "답변",
        submittedAt: "2026-01-01T00:00:00.000Z"
      },
      feedback: {
        answerId: "a",
        score: 70,
        issues: [{ type: "logicGap" }],
        comment: "보강이 필요합니다."
      }
    });

    render(<QuestionCard question={shortAnswerQuestion} />);
    fireEvent.change(screen.getByLabelText("answer"), { target: { value: "답변" } });
    fireEvent.click(screen.getByRole("button", { name: "제출" }));

    expect(await screen.findByText("보강이 필요합니다.")).toBeInTheDocument();
    expect(questionsApi.submitAnswer).toHaveBeenCalledWith(shortAnswerQuestion.id, "답변");
  });
});
