import { z } from 'zod';

export const activityTypeEnum = z.enum(['assignment', 'project', 'quiz', 'exam']);

export const createActivitySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  weight: z.number().min(0.0001).max(1),
  activity_type: activityTypeEnum,
});

export const updateActivitySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  weight: z.number().min(0.0001).max(1).optional(),
  activity_type: activityTypeEnum.optional(),
});

export const aiImproveSchema = z.object({
  description: z.string().min(1),
});

export type CreateActivityDto = z.infer<typeof createActivitySchema>;
export type UpdateActivityDto = z.infer<typeof updateActivitySchema>;
export type AiImproveDto = z.infer<typeof aiImproveSchema>;
