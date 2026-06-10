import { z } from 'zod';

export const attendanceStatusEnum = z.enum(['present', 'absent', 'late', 'justified']);

export const createAttendanceSessionSchema = z.object({
  session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
});

export const bulkUpdateAttendanceRecordsSchema = z.object({
  records: z.array(z.object({
    student_id: z.string().uuid(),
    status: attendanceStatusEnum,
  })),
});

export const updateAttendanceRecordSchema = z.object({
  status: attendanceStatusEnum,
});

export const attendanceRecordsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  student_id: z.string().uuid().optional(),
});

export type CreateAttendanceSessionDto = z.infer<typeof createAttendanceSessionSchema>;
export type BulkUpdateAttendanceRecordsDto = z.infer<typeof bulkUpdateAttendanceRecordsSchema>;
export type UpdateAttendanceRecordDto = z.infer<typeof updateAttendanceRecordSchema>;
export type AttendanceRecordsQueryDto = z.infer<typeof attendanceRecordsQuerySchema>;
