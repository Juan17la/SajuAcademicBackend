import { z } from 'zod';

export const createExtraPointsSchema = z.object({
  student_id: z.string().uuid(),
  points: z.number().min(-9999).max(9999).refine((val) => val !== 0, {
    message: 'Points cannot be zero',
  }),
  reason: z.string().optional(),
});

export type CreateExtraPointsDto = z.infer<typeof createExtraPointsSchema>;
