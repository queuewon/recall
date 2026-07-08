import { z } from "zod";
import { NoteIdSchema } from "./ids";

export const NoteSourceSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("InAppMemo") }),
  // Notion 연동은 아직 구현하지 않음 — 실제 필드는 연동 시점에 확정한다.
  z.object({ type: z.literal("Notion") })
]);
export type NoteSource = z.infer<typeof NoteSourceSchema>;

export const NoteSchema = z
  .object({
    id: NoteIdSchema,
    source: NoteSourceSchema,
    title: z.string().min(1),
    contentMarkdown: z.string(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
  .refine((note) => note.updatedAt >= note.createdAt, {
    message: "updatedAt must not be earlier than createdAt",
    path: ["updatedAt"]
  });
export type Note = z.infer<typeof NoteSchema>;
