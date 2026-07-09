import { useEffect, useState } from "react";
import type { Question } from "../api/question";
import { generateQuestions, listQuestions } from "../api/questionsApi";
import { ActiveRecallCard } from "./ActiveRecallCard";
import { QuestionCard } from "./QuestionCard";
import styles from "./QuestionDeck.module.css";

// .btn-primary/.btn-secondary는 src/styles/global.css의 전역(스코프 없는) 유틸 클래스다.
interface QuestionDeckProps {
  noteId: string;
  onExit: () => void;
}

export function QuestionDeck({ noteId, onExit }: QuestionDeckProps) {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    listQuestions(noteId).then(setQuestions);
  }, [noteId]);

  async function handleGenerate() {
    const generated = await generateQuestions(noteId);
    setQuestions(generated);
    setIndex(0);
  }

  if (questions === null) {
    return <p className={styles.loading}>불러오는 중...</p>;
  }

  if (questions.length === 0) {
    return (
      <div className={styles.empty}>
        <button className={styles.backBtn} onClick={onExit}>
          목록으로
        </button>
        <button className="btn-primary" onClick={handleGenerate}>
          문제 생성하기
        </button>
      </div>
    );
  }

  const current = questions[index];
  if (!current) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <button className={styles.backBtn} onClick={onExit}>
          목록으로
        </button>
        <p className={styles.progress}>
          {index + 1} / {questions.length}
        </p>
      </div>
      {current.type === "ActiveRecall" ? (
        <ActiveRecallCard key={current.id} question={current} />
      ) : (
        <QuestionCard key={current.id} question={current} />
      )}
      <div className={styles.nav}>
        <button
          className="btn-secondary"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          이전
        </button>
        <button
          className="btn-secondary"
          disabled={index === questions.length - 1}
          onClick={() => setIndex((i) => i + 1)}
        >
          다음
        </button>
      </div>
    </div>
  );
}
