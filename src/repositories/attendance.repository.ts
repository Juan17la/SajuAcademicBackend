import type { PostgresDb } from '@fastify/postgres';
import type { 
  DbAttendanceSession, 
  DbAttendanceRecord,
  CreateAttendanceSessionData,
  CreateAttendanceRecordData,
  UpdateAttendanceRecordData
} from '../interfaces/attendance/attendance.interface.js';

export async function findAttendanceSessionsByClassId(
  pg: PostgresDb,
  classId: string,
  userId: string
): Promise<DbAttendanceSession[]> {
  const result = await pg.query<DbAttendanceSession>(
    `SELECT s.id, s.class_id, s.session_date, s.created_by, s.created_at 
     FROM attendance_sessions s
     JOIN classes c ON s.class_id = c.id
     WHERE s.class_id = $1 AND c.user_id = $2
     ORDER BY s.session_date DESC`,
    [classId, userId]
  );
  return result.rows;
}

export async function findAttendanceSessionById(
  pg: PostgresDb,
  id: string,
  userId: string
): Promise<DbAttendanceSession | undefined> {
  const result = await pg.query<DbAttendanceSession>(
    `SELECT s.id, s.class_id, s.session_date, s.created_by, s.created_at 
     FROM attendance_sessions s
     JOIN classes c ON s.class_id = c.id
     WHERE s.id = $1 AND c.user_id = $2`,
    [id, userId]
  );
  return result.rows[0];
}

export async function findAttendanceSessionByDate(
  pg: PostgresDb,
  classId: string,
  sessionDate: string
): Promise<DbAttendanceSession | undefined> {
  const result = await pg.query<DbAttendanceSession>(
    `SELECT id, class_id, session_date, created_by, created_at 
     FROM attendance_sessions 
     WHERE class_id = $1 AND session_date = $2`,
    [classId, sessionDate]
  );
  return result.rows[0];
}

export async function createAttendanceSession(
  pg: PostgresDb,
  data: CreateAttendanceSessionData
): Promise<DbAttendanceSession> {
  const result = await pg.query<DbAttendanceSession>(
    `INSERT INTO attendance_sessions (class_id, session_date, created_by)
     VALUES ($1, $2, $3)
     RETURNING id, class_id, session_date, created_by, created_at`,
    [data.class_id, data.session_date, data.created_by]
  );
  return result.rows[0];
}

export async function findAttendanceRecordsBySessionId(
  pg: PostgresDb,
  sessionId: string
): Promise<DbAttendanceRecord[]> {
  const result = await pg.query<DbAttendanceRecord>(
    `SELECT id, session_id, student_id, status, created_at, updated_at 
     FROM attendance_records 
     WHERE session_id = $1`,
    [sessionId]
  );
  return result.rows;
}

export async function findAttendanceRecordsByClassId(
  pg: PostgresDb,
  classId: string,
  userId: string,
  date?: string,
  studentId?: string
): Promise<DbAttendanceRecord[]> {
  let query = `
    SELECT r.id, r.session_id, r.student_id, r.status, r.created_at, r.updated_at 
    FROM attendance_records r
    JOIN attendance_sessions s ON r.session_id = s.id
    JOIN classes c ON s.class_id = c.id
    WHERE s.class_id = $1 AND c.user_id = $2
  `;
  const params: (string | number)[] = [classId, userId];
  
  if (date) {
    query += ` AND s.session_date = $3`;
    params.push(date);
  }
  
  if (studentId) {
    query += date ? ` AND r.student_id = $4` : ` AND r.student_id = $3`;
    params.push(studentId);
  }
  
  query += ` ORDER BY s.session_date DESC, r.student_id`;
  
  const result = await pg.query<DbAttendanceRecord>(query, params);
  return result.rows;
}

export async function findAttendanceRecordById(
  pg: PostgresDb,
  id: string,
  userId: string
): Promise<DbAttendanceRecord | undefined> {
  const result = await pg.query<DbAttendanceRecord>(
    `SELECT r.id, r.session_id, r.student_id, r.status, r.created_at, r.updated_at 
     FROM attendance_records r
     JOIN attendance_sessions s ON r.session_id = s.id
     JOIN classes c ON s.class_id = c.id
     WHERE r.id = $1 AND c.user_id = $2`,
    [id, userId]
  );
  return result.rows[0];
}

export async function upsertAttendanceRecord(
  pg: PostgresDb,
  data: CreateAttendanceRecordData
): Promise<DbAttendanceRecord> {
  const result = await pg.query<DbAttendanceRecord>(
    `INSERT INTO attendance_records (session_id, student_id, status)
     VALUES ($1, $2, $3)
     ON CONFLICT (session_id, student_id) 
     DO UPDATE SET status = $3, updated_at = CURRENT_TIMESTAMP
     RETURNING id, session_id, student_id, status, created_at, updated_at`,
    [data.session_id, data.student_id, data.status]
  );
  return result.rows[0];
}

export async function updateAttendanceRecord(
  pg: PostgresDb,
  id: string,
  data: UpdateAttendanceRecordData
): Promise<DbAttendanceRecord | undefined> {
  const result = await pg.query<DbAttendanceRecord>(
    `UPDATE attendance_records 
     SET status = $1
     WHERE id = $2
     RETURNING id, session_id, student_id, status, created_at, updated_at`,
    [data.status, id]
  );
  return result.rows[0];
}
