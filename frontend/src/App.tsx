import { useState } from "react";
import { NoteEditor } from "./components/NoteEditor";
import { NoteList } from "./components/NoteList";

type View = { screen: "list" } | { screen: "editor"; noteId?: string };

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

  return (
    <NoteList
      onSelectNote={(id) => setView({ screen: "editor", noteId: id })}
      onCreateNote={() => setView({ screen: "editor" })}
    />
  );
}
