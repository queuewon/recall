import { useEffect, useState } from "react";
import type { Note } from "../api/note";
import { listNotes } from "../api/notesApi";

interface NoteListProps {
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
}

export function NoteList({ onSelectNote, onCreateNote }: NoteListProps) {
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
          </li>
        ))}
      </ul>
    </div>
  );
}
