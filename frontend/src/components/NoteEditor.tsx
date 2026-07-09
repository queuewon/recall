import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Note } from "../api/note";
import { createNote, updateNote } from "../api/notesApi";
import styles from "./NoteEditor.module.css";

// .btn-primary/.btn-secondary는 src/styles/global.css의 전역(스코프 없는) 유틸 클래스다.
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
    <div className={styles.page}>
      <input
        className={styles.titleInput}
        aria-label="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
      />
      <textarea
        className={styles.editorArea}
        aria-label="content"
        value={contentMarkdown}
        onChange={(e) => setContentMarkdown(e.target.value)}
      />
      <div className={styles.previewPanel} data-testid="markdown-preview">
        <ReactMarkdown>{contentMarkdown}</ReactMarkdown>
      </div>
      <div className={styles.actions}>
        <button className="btn-primary" onClick={handleSave}>
          저장
        </button>
        <button className="btn-secondary" onClick={onCancel}>
          취소
        </button>
      </div>
    </div>
  );
}
