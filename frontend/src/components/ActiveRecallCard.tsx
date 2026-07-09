import { useState } from "react";
import type { Feedback, Question } from "../api/question";
import { submitAnswer } from "../api/questionsApi";
import styles from "./ActiveRecallCard.module.css";

// .btn-primary는 src/styles/global.css의 전역(스코프 없는) 유틸 클래스다.
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
    <div className={styles.page}>
      <div className={styles.thread}>
        <div className={styles.bubbleAi}>
          <p className={styles.speaker}>면접관</p>
          <p className={styles.bubbleText}>{question.prompt}</p>
        </div>
        {feedback ? (
          <div className={styles.bubbleUser}>
            <p className={styles.speaker}>답변자</p>
            <p className={styles.bubbleText}>{content}</p>
          </div>
        ) : (
          <p className={styles.speaker}>답변자</p>
        )}
        {feedback && (
          <div className={styles.bubbleAi} data-testid="feedback">
            <p className={styles.speaker}>면접관 평가</p>
            <p className={styles.bubbleText}>{feedback.comment}</p>
            <p className={styles.scoreLine}>점수: {feedback.score}</p>
            {feedback.issues.length > 0 && (
              <ul className={styles.issueList}>
                {feedback.issues.map((issue) => (
                  <li key={issue.type} className={styles.issueTag}>
                    {ISSUE_LABELS[issue.type]}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      {!feedback && (
        <div className={styles.inputBar}>
          <textarea
            className={styles.input}
            aria-label="answer"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button className="btn-primary" onClick={handleSubmit}>
            제출
          </button>
        </div>
      )}
    </div>
  );
}
