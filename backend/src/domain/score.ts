import { z } from "zod";

export const ScoreSchema = z.number().int().min(0).max(100).brand<"Score">();
export type Score = z.infer<typeof ScoreSchema>;
export const createScore = (value: number): Score => ScoreSchema.parse(value);
