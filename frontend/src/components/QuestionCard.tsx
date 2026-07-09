import { useState } from "react";
import type { Feedback, Question } from "../api/question";
import { submitAnswer } from "../api/questionsApi";
import styles from "./QuestionCard.module.css";

// .btn-primary는 src/styles/global.css의 전역(스코프 없는) 유틸 클래스다.
interface QuestionCardProps {
  question: Question;
}

const ISSUE_LABELS: Record<Feedback["issues"][number]["type"], string> = {
  logicGap: "논리 누락",
  counterexampleMissing: "반례 부족",
  conceptConfusion: "개념 혼동"
};

const INDEX_TAB_LABEL: Record<"MultipleChoice" | "ShortAnswer" | "Essay", string> = {
  MultipleChoice: "개념 카드",
  ShortAnswer: "서술형",
  Essay: "서술형"
};

export function QuestionCard({ question }: QuestionCardProps) {
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function handleSubmit() {
    const result = await submitAnswer(question.id, content);
    setFeedback(result.feedback);
  }

  return (
    <div className={styles.card}>
      {!feedback && question.type !== "ActiveRecall" && (
        <div className={styles.indexCard}>
          <span className={styles.indexTab}>{INDEX_TAB_LABEL[question.type]}</span>
          <p className={styles.qText}>{question.prompt}</p>
          {question.type === "MultipleChoice" && (
            <div role="radiogroup">
              {question.options.map((option, index) => (
                <label
                  key={option}
                  className={`${styles.optionRow} ${content === String(index) ? styles.selected : ""}`}
                >
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
              className={styles.textarea}
              aria-label="answer"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          )}
        </div>
      )}
      {!feedback && (
        <button className={`btn-primary ${styles.submitBtn}`} onClick={handleSubmit}>
          제출
        </button>
      )}
      {feedback && (
        <>
          <p className={styles.promptReview}>{question.prompt}</p>
          {(question.type === "ShortAnswer" || question.type === "Essay") && (
            <div className={styles.answerBox}>{content}</div>
          )}
          <div className={styles.feedbackPanel} data-testid="feedback">
            <div className={styles.scoreRow}>
              <span className={styles.scoreValue}>{feedback.score}</span>
              <span className={styles.scoreLabel}>/ 100</span>
            </div>
            {feedback.issues.length > 0 && (
              <ul className={styles.issueList}>
                {feedback.issues.map((issue) => (
                  <li key={issue.type} className={styles.issueTag}>
                    {ISSUE_LABELS[issue.type]}
                  </li>
                ))}
              </ul>
            )}
            <p className={styles.comment}>{feedback.comment}</p>
          </div>
        </>
      )}
    </div>
  );
}
