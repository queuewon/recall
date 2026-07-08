import { z } from "zod";

export const NoteSchema = z.object({
  id: z.string().uuid(),
  source: z.discriminatedUnion("type", [
    z.object({ type: z.literal("InAppMemo") }),
    z.object({ type: z.literal("Notion") })
  ]),
  title: z.string(),
  contentMarkdown: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});
export type Note = z.infer<typeof NoteSchema>;
