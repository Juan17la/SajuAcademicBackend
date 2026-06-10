import { z } from 'zod';

export const scoreValueSchema = z.union([
  z.number(),
  z.enum(['A', 'B', 'C', 'D', 'F-', 'F', 'F+']),
]);

export const createScoreSchema = z.object({
  student_id: z.string().uuid(),
  value: scoreValueSchema,
});

export const bulkUpdateScoresSchema = z.object({
  scores: z.array(z.object({
    student_id: z.string().uuid(),
    value: scoreValueSchema,
  })),
});

export type CreateScoreDto = z.infer<typeof createScoreSchema>;
export type BulkUpdateScoresDto = z.infer<typeof bulkUpdateScoresSchema>;
