import { z } from "zod";

export const NoteIdSchema = z.string().uuid().brand<"NoteId">();
export type NoteId = z.infer<typeof NoteIdSchema>;
export const parseNoteId = (value: string): NoteId => NoteIdSchema.parse(value);

export const ConceptIdSchema = z.string().uuid().brand<"ConceptId">();
export type ConceptId = z.infer<typeof ConceptIdSchema>;
export const parseConceptId = (value: string): ConceptId => ConceptIdSchema.parse(value);

export const QuestionIdSchema = z.string().uuid().brand<"QuestionId">();
export type QuestionId = z.infer<typeof QuestionIdSchema>;
export const parseQuestionId = (value: string): QuestionId => QuestionIdSchema.parse(value);

export const AnswerIdSchema = z.string().uuid().brand<"AnswerId">();
export type AnswerId = z.infer<typeof AnswerIdSchema>;
export const parseAnswerId = (value: string): AnswerId => AnswerIdSchema.parse(value);
