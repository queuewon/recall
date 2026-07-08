import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { createDefaultDbClient } from "./infra/db/client";
import { runMigrations } from "./infra/db/migrate";
import { NoteRepository } from "./infra/NoteRepository";
import { createNoteService } from "./service/noteService";

const port = Number(process.env.PORT ?? 3000);

const db = createDefaultDbClient();
runMigrations(db);
const noteService = createNoteService(new NoteRepository(db));

serve({ fetch: createApp({ noteService }).fetch, port }, (info) => {
  console.log(`listening on http://localhost:${info.port}`);
});
