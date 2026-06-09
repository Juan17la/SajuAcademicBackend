import { z } from 'zod';

export const createStudentSchema = z.object({
  student_code: z.string().min(1).max(50),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
});

export const updateStudentSchema = z.object({
  student_code: z.string().min(1).max(50).optional(),
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  is_active: z.boolean().optional(),
});

export const importStudentsSchema = z.object({
  students: z.string().min(1),
});

export type CreateStudentDto = z.infer<typeof createStudentSchema>;
export type UpdateStudentDto = z.infer<typeof updateStudentSchema>;
export type ImportStudentsDto = z.infer<typeof importStudentsSchema>;
