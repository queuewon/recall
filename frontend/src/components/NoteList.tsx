import { useEffect, useState } from "react";
import type { Note } from "../api/note";
import { listNotes } from "../api/notesApi";

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
    <div>
      <button onClick={onCreateNote}>새 메모</button>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <button onClick={() => onSelectNote(note.id)}>{note.title}</button>
            <button onClick={() => onPracticeNote(note.id)}>문제 풀기</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
