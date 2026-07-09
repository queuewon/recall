import { useState } from "react";
import type { Feedback, Question } from "../api/question";
import { submitAnswer } from "../api/questionsApi";

interface QuestionCardProps {
  question: Question;
}

const ISSUE_LABELS: Record<Feedback["issues"][number]["type"], string> = {
  logicGap: "논리 누락",
  counterexampleMissing: "반례 부족",
  conceptConfusion: "개념 혼동"
};

export function QuestionCard({ question }: QuestionCardProps) {
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function handleSubmit() {
    const result = await submitAnswer(question.id, content);
    setFeedback(result.feedback);
  }

  return (
    <div>
      <p>{question.prompt}</p>
      {question.type === "MultipleChoice" && (
        <div role="radiogroup">
          {question.options.map((option, index) => (
            <label key={option}>
              <input
                type="radio"
                name="option"
                checked={content === String(index)}
                onChange={() => setContent(String(index))}
              />
              {option}
            </label>
          ))}
        </div>
      )}
      {(question.type === "ShortAnswer" || question.type === "Essay") && (
        <textarea
          aria-label="answer"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      )}
      <button onClick={handleSubmit}>제출</button>
      {feedback && (
        <div data-testid="feedback">
          <p>점수: {feedback.score}</p>
          {feedback.issues.length > 0 && (
            <ul>
              {feedback.issues.map((issue) => (
                <li key={issue.type}>{ISSUE_LABELS[issue.type]}</li>
              ))}
            </ul>
          )}
          <p>{feedback.comment}</p>
        </div>
      )}
    </div>
  );
}
