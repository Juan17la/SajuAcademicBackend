import { z } from 'zod';

export const scoreTypeEnum = z.enum(['numeric', 'percentage', 'letters']);

export const createClassSchema = z.object({
  name: z.string().min(1).max(200),
  score_type: scoreTypeEnum,
});

export const updateClassSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  score_type: scoreTypeEnum.optional(),
});

export type CreateClassDto = z.infer<typeof createClassSchema>;
export type UpdateClassDto = z.infer<typeof updateClassSchema>;
