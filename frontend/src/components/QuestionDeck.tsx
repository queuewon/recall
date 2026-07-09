import { useEffect, useState } from "react";
import type { Question } from "../api/question";
import { generateQuestions, listQuestions } from "../api/questionsApi";
import { QuestionCard } from "./QuestionCard";

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
    return <p>불러오는 중...</p>;
  }

  if (questions.length === 0) {
    return (
      <div>
        <button onClick={onExit}>목록으로</button>
        <button onClick={handleGenerate}>문제 생성하기</button>
      </div>
    );
  }

  const current = questions[index];
  if (!current) {
    return null;
  }

  return (
    <div>
      <button onClick={onExit}>목록으로</button>
      <p>
        {index + 1} / {questions.length}
      </p>
      <QuestionCard key={current.id} question={current} />
      <div>
        <button disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
          이전
        </button>
        <button disabled={index === questions.length - 1} onClick={() => setIndex((i) => i + 1)}>
          다음
        </button>
      </div>
    </div>
  );
}
