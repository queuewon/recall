import { useState } from "react";
import { NoteEditor } from "./components/NoteEditor";
import { NoteList } from "./components/NoteList";
import { QuestionDeck } from "./components/QuestionDeck";

type View =
  | { screen: "list" }
  | { screen: "editor"; noteId?: string }
  | { screen: "questions"; noteId: string };

export function App() {
  const [view, setView] = useState<View>({ screen: "list" });

  if (view.screen === "editor") {
    return (
      <NoteEditor
        noteId={view.noteId}
        onSaved={() => setView({ screen: "list" })}
        onCancel={() => setView({ screen: "list" })}
      />
    );
  }

  if (view.screen === "questions") {
    return <QuestionDeck noteId={view.noteId} onExit={() => setView({ screen: "list" })} />;
  }

  return (
    <NoteList
      onSelectNote={(id) => setView({ screen: "editor", noteId: id })}
      onCreateNote={() => setView({ screen: "editor" })}
      onPracticeNote={(id) => setView({ screen: "questions", noteId: id })}
    />
  );
}
