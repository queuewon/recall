import { z } from "zod";
import { ConceptIdSchema, NoteIdSchema } from "./ids";

export const ConceptSchema = z.object({
  id: ConceptIdSchema,
  noteId: NoteIdSchema,
  term: z.string().min(1),
  explanation: z.string().min(1)
});
export type Concept = z.infer<typeof ConceptSchema>;
