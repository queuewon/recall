import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ActiveRecallCard } from "./ActiveRecallCard";
import * as questionsApi from "../api/questionsApi";
import type { Question } from "../api/question";

vi.mock("../api/questionsApi", () => ({
  submitAnswer: vi.fn()
}));

const activeRecallQuestion: Question = {
  type: "ActiveRecall",
  id: "8b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e72",
  noteId: "6b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e70",
  prompt: "원화 약세가 항상 수출 호재가 아닌 이유 3가지",
  conceptIds: ["1e2d3c4b-5a69-4788-9f0e-1a2b3c4d5e6f", "2e2d3c4b-5a69-4788-9f0e-1a2b3c4d5e70"]
};

describe("ActiveRecallCard", () => {
  it("renders the prompt in an interview-style layout", () => {
    render(<ActiveRecallCard question={activeRecallQuestion} />);

    expect(screen.getByText("면접관")).toBeInTheDocument();
    expect(screen.getByText(activeRecallQuestion.prompt)).toBeInTheDocument();
  });

  it("submits free text and shows feedback with issue labels", async () => {
    vi.mocked(questionsApi.submitAnswer).mockResolvedValue({
      answer: {
        id: "a",
        questionId: activeRecallQuestion.id,
        content: "연결 답변입니다",
        submittedAt: "2026-01-01T00:00:00.000Z"
      },
      feedback: {
        answerId: "a",
        score: 60,
        issues: [{ type: "logicGap" }],
        comment: "예외 상황을 더 짚어보세요"
      }
    });

    render(<ActiveRecallCard question={activeRecallQuestion} />);
    fireEvent.change(screen.getByLabelText("answer"), {
      target: { value: "연결 답변입니다" }
    });
    fireEvent.click(screen.getByRole("button", { name: "제출" }));

    expect(await screen.findByText("예외 상황을 더 짚어보세요")).toBeInTheDocument();
    expect(questionsApi.submitAnswer).toHaveBeenCalledWith(
      activeRecallQuestion.id,
      "연결 답변입니다"
    );
    expect(screen.getByText("논리 누락")).toBeInTheDocument();
  });
});
