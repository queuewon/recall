import { useEffect, useState } from "react";
import type { Note } from "../api/note";
import { listNotes } from "../api/notesApi";
import styles from "./NoteList.module.css";

// .btn-primary는 src/styles/global.css의 전역(스코프 없는) 유틸 클래스다.
interface NoteListProps {
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onPracticeNote: (id: string) => void;
}

export function NoteList({ onSelectNote, onCreateNote, onPracticeNote }: NoteListProps) {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    listNotes().then(setNotes);
  }, []);

  return (
    <div className={styles.page}>
      <button className={`btn-primary ${styles.createBtn}`} onClick={onCreateNote}>
        새 메모
      </button>
      <ul className={styles.list}>
        {notes.map((note) => (
          <li key={note.id} className={styles.row}>
            <button className={styles.titleBtn} onClick={() => onSelectNote(note.id)}>
              {note.title}
            </button>
            <button className={styles.practiceBtn} onClick={() => onPracticeNote(note.id)}>
              문제 풀기
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
