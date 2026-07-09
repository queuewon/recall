import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QuestionDeck } from "./QuestionDeck";
import * as questionsApi from "../api/questionsApi";
import type { Question } from "../api/question";

vi.mock("../api/questionsApi", () => ({
  listQuestions: vi.fn(),
  generateQuestions: vi.fn(),
  submitAnswer: vi.fn()
}));

const questions: Question[] = [
  {
    type: "MultipleChoice",
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    noteId: "n1",
    prompt: "질문1",
    options: ["A", "B", "C", "D"],
    correctIndex: 0
  },
  {
    type: "ShortAnswer",
    id: "5b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e6f",
    noteId: "n1",
    prompt: "질문2"
  }
];

describe("QuestionDeck", () => {
  it("shows the first question when questions already exist for the note", async () => {
    vi.mocked(questionsApi.listQuestions).mockResolvedValue(questions);

    render(<QuestionDeck noteId="n1" onExit={() => {}} />);

    expect(await screen.findByText("질문1")).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("navigates to the next and previous question", async () => {
    vi.mocked(questionsApi.listQuestions).mockResolvedValue(questions);

    render(<QuestionDeck noteId="n1" onExit={() => {}} />);
    await screen.findByText("질문1");

    fireEvent.click(screen.getByRole("button", { name: "다음" }));
    expect(await screen.findByText("질문2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "이전" }));
    expect(await screen.findByText("질문1")).toBeInTheDocument();
  });

  it("shows a generate button and generates questions when none exist yet", async () => {
    vi.mocked(questionsApi.listQuestions).mockResolvedValue([]);
    vi.mocked(questionsApi.generateQuestions).mockResolvedValue(questions);

    render(<QuestionDeck noteId="n1" onExit={() => {}} />);

    const generateButton = await screen.findByRole("button", { name: "문제 생성하기" });
    fireEvent.click(generateButton);

    expect(await screen.findByText("질문1")).toBeInTheDocument();
  });

  it("renders ActiveRecallCard's interview-style layout for an ActiveRecall question", async () => {
    const activeRecallQuestions: Question[] = [
      {
        type: "ActiveRecall",
        id: "8b1b7b2e-6f2e-4c1a-8f2b-1a2b3c4d5e72",
        noteId: "n1",
        prompt: "연결 질문",
        conceptIds: ["1e2d3c4b-5a69-4788-9f0e-1a2b3c4d5e6f", "2e2d3c4b-5a69-4788-9f0e-1a2b3c4d5e70"]
      }
    ];
    vi.mocked(questionsApi.listQuestions).mockResolvedValue(activeRecallQuestions);

    render(<QuestionDeck noteId="n1" onExit={() => {}} />);

    expect(await screen.findByText("면접관")).toBeInTheDocument();
    expect(screen.getByText("연결 질문")).toBeInTheDocument();
  });
});
