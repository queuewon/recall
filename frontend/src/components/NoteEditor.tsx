import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Note } from "../api/note";
import { createNote, updateNote } from "../api/notesApi";

interface NoteEditorProps {
  noteId?: string | undefined;
  initialNote?: Note | undefined;
  onSaved: (note: Note) => void;
  onCancel: () => void;
}

export function NoteEditor({ noteId, initialNote, onSaved, onCancel }: NoteEditorProps) {
  const [title, setTitle] = useState(initialNote?.title ?? "");
  const [contentMarkdown, setContentMarkdown] = useState(initialNote?.contentMarkdown ?? "");

  async function handleSave() {
    const saved = noteId
      ? await updateNote(noteId, { title, contentMarkdown })
      : await createNote({ title, contentMarkdown });
    onSaved(saved);
  }

  return (
    <div>
      <input
        aria-label="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
      />
      <div>
        <textarea
          aria-label="content"
          value={contentMarkdown}
          onChange={(e) => setContentMarkdown(e.target.value)}
        />
        <div data-testid="markdown-preview">
          <ReactMarkdown>{contentMarkdown}</ReactMarkdown>
        </div>
      </div>
      <button onClick={handleSave}>저장</button>
      <button onClick={onCancel}>취소</button>
    </div>
  );
}
