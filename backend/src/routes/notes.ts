import { Hono } from "hono";
import { z } from "zod";
import { parseNoteId } from "../domain";
import { readJsonBody } from "./httpUtils";
import type { NoteService } from "../service/noteService";

const CreateNoteBody = z.object({
  title: z.string().min(1),
  contentMarkdown: z.string()
});

const UpdateNoteBody = z
  .object({
    title: z.string().min(1).optional(),
    contentMarkdown: z.string().optional()
  })
  .refine((body) => body.title !== undefined || body.contentMarkdown !== undefined, {
    message: "at least one of title or contentMarkdown must be provided"
  });

function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "(body)"}: ${issue.message}`)
    .join(", ");
}

export function createNotesRouter(noteService: NoteService) {
  const router = new Hono();

  router.post("/", async (c) => {
    const parsed = CreateNoteBody.safeParse(await readJsonBody(c));
    if (!parsed.success) {
      return c.json({ error: formatZodError(parsed.error) }, 400);
    }
    const note = await noteService.create(parsed.data);
    return c.json(note, 201);
  });

  router.get("/", async (c) => {
    const notes = await noteService.list();
    return c.json(notes, 200);
  });

  router.get("/:id", async (c) => {
    const idResult = z.string().uuid().safeParse(c.req.param("id"));
    if (!idResult.success) {
      return c.json({ error: "invalid note id" }, 400);
    }
    const note = await noteService.get(parseNoteId(idResult.data));
    if (!note) {
      return c.json({ error: "note not found" }, 404);
    }
    return c.json(note, 200);
  });

  router.patch("/:id", async (c) => {
    const idResult = z.string().uuid().safeParse(c.req.param("id"));
    if (!idResult.success) {
      return c.json({ error: "invalid note id" }, 400);
    }
    const bodyResult = UpdateNoteBody.safeParse(await readJsonBody(c));
    if (!bodyResult.success) {
      return c.json({ error: formatZodError(bodyResult.error) }, 400);
    }
    const note = await noteService.update(parseNoteId(idResult.data), bodyResult.data);
    if (!note) {
      return c.json({ error: "note not found" }, 404);
    }
    return c.json(note, 200);
  });

  router.delete("/:id", async (c) => {
    const idResult = z.string().uuid().safeParse(c.req.param("id"));
    if (!idResult.success) {
      return c.json({ error: "invalid note id" }, 400);
    }
    const deleted = await noteService.remove(parseNoteId(idResult.data));
    if (!deleted) {
      return c.json({ error: "note not found" }, 404);
    }
    return c.body(null, 204);
  });

  return router;
}
