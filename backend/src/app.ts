import { Hono } from "hono";
import { createNotesRouter } from "./routes/notes";
import type { NoteService } from "./service/noteService";

export function createApp(deps: { noteService: NoteService }) {
  const app = new Hono();

  app.get("/health", (c) => c.json({ status: "ok" }));
  app.route("/notes", createNotesRouter(deps.noteService));

  return app;
}
