import type { PostgresDb } from '@fastify/postgres';
import * as attendanceRepository from '../repositories/attendance.repository.js';
import * as classRepository from '../repositories/class.repository.js';
import * as studentRepository from '../repositories/student.repository.js';
import type { 
  CreateAttendanceSessionDto, 
  BulkUpdateAttendanceRecordsDto, 
  UpdateAttendanceRecordDto,
  AttendanceRecordsQueryDto
} from '../schemas/attendance.schema.js';
import { ConflictError, NotFoundError, BadRequestError } from '../utils/app-error.js';

export async function getAttendanceSessionsByClassId(pg: PostgresDb, classId: string, userId: string) {
  const classItem = await classRepository.findClassById(pg, classId, userId);
  if (!classItem) {
    throw new NotFoundError('Class not found');
  }

  return await attendanceRepository.findAttendanceSessionsByClassId(pg, classId, userId);
}

export async function getAttendanceSessionById(pg: PostgresDb, id: string, userId: string) {
  const session = await attendanceRepository.findAttendanceSessionById(pg, id, userId);
  if (!session) {
    throw new NotFoundError('Attendance session not found');
  }

  const records = await attendanceRepository.findAttendanceRecordsBySessionId(pg, id);
  return { ...session, records };
}

export async function createAttendanceSession(
  pg: PostgresDb, 
  classId: string, 
  userId: string, 
  dto: CreateAttendanceSessionDto
) {
  const classItem = await classRepository.findClassById(pg, classId, userId);
  if (!classItem) {
    throw new NotFoundError('Class not found');
  }

  // Check if session already exists for this date
  const existing = await attendanceRepository.findAttendanceSessionByDate(pg, classId, dto.session_date);
  if (existing) {
    throw new ConflictError('Attendance session already exists for this date');
  }

  return await attendanceRepository.createAttendanceSession(pg, {
    class_id: classId,
    session_date: dto.session_date,
    created_by: userId,
  });
}

export async function bulkUpdateAttendanceRecords(
  pg: PostgresDb,
  sessionId: string,
  userId: string,
  dto: BulkUpdateAttendanceRecordsDto
) {
  const session = await attendanceRepository.findAttendanceSessionById(pg, sessionId, userId);
  if (!session) {
    throw new NotFoundError('Attendance session not found');
  }

  const results = [];
  for (const record of dto.records) {
    const upserted = await attendanceRepository.upsertAttendanceRecord(pg, {
      session_id: sessionId,
      student_id: record.student_id,
      status: record.status,
    });
    results.push(upserted);
  }

  return results;
}

export async function getAttendanceRecords(
  pg: PostgresDb,
  classId: string,
  userId: string,
  query: AttendanceRecordsQueryDto
) {
  const classItem = await classRepository.findClassById(pg, classId, userId);
  if (!classItem) {
    throw new NotFoundError('Class not found');
  }

  return await attendanceRepository.findAttendanceRecordsByClassId(
    pg, 
    classId, 
    userId, 
    query.date, 
    query.student_id
  );
}

export async function updateAttendanceRecord(
  pg: PostgresDb,
  id: string,
  userId: string,
  dto: UpdateAttendanceRecordDto
) {
  const record = await attendanceRepository.findAttendanceRecordById(pg, id, userId);
  if (!record) {
    throw new NotFoundError('Attendance record not found');
  }

  return await attendanceRepository.updateAttendanceRecord(pg, id, {
    status: dto.status,
  });
}
