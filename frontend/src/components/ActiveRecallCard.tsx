import { useState } from "react";
import type { Feedback, Question } from "../api/question";
import { submitAnswer } from "../api/questionsApi";

interface ActiveRecallCardProps {
  question: Question;
}

const ISSUE_LABELS: Record<Feedback["issues"][number]["type"], string> = {
  logicGap: "논리 누락",
  counterexampleMissing: "반례 부족",
  conceptConfusion: "개념 혼동"
};

export function ActiveRecallCard({ question }: ActiveRecallCardProps) {
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function handleSubmit() {
    const result = await submitAnswer(question.id, content);
    setFeedback(result.feedback);
  }

  return (
    <div>
      <p>면접관</p>
      <p>{question.prompt}</p>
      <p>답변자</p>
      <textarea aria-label="answer" value={content} onChange={(e) => setContent(e.target.value)} />
      <button onClick={handleSubmit}>제출</button>
      {feedback && (
        <div data-testid="feedback">
          <p>면접관 평가</p>
          <p>{feedback.comment}</p>
          <p>점수: {feedback.score}</p>
          {feedback.issues.length > 0 && (
            <ul>
              {feedback.issues.map((issue) => (
                <li key={issue.type}>{ISSUE_LABELS[issue.type]}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
