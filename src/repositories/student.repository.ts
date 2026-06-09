import type { PostgresDb } from '@fastify/postgres';
import type { DbStudent, CreateStudentData, UpdateStudentData } from '../interfaces/student/student.interface.js';

export async function findStudentsByClassId(
  pg: PostgresDb,
  classId: string,
  userId: string
): Promise<DbStudent[]> {
  const result = await pg.query<DbStudent>(
    `SELECT s.id, s.class_id, s.student_code, s.first_name, s.last_name, s.is_active, s.added_at 
     FROM students s
     JOIN classes c ON s.class_id = c.id
     WHERE s.class_id = $1 AND c.user_id = $2 AND s.is_active = TRUE
     ORDER BY s.last_name, s.first_name`,
    [classId, userId]
  );
  return result.rows;
}

export async function findStudentById(
  pg: PostgresDb,
  id: string,
  userId: string
): Promise<DbStudent | undefined> {
  const result = await pg.query<DbStudent>(
    `SELECT s.id, s.class_id, s.student_code, s.first_name, s.last_name, s.is_active, s.added_at 
     FROM students s
     JOIN classes c ON s.class_id = c.id
     WHERE s.id = $1 AND c.user_id = $2`,
    [id, userId]
  );
  return result.rows[0];
}

export async function findStudentByCodeAndClassId(
  pg: PostgresDb,
  studentCode: string,
  classId: string
): Promise<DbStudent | undefined> {
  const result = await pg.query<DbStudent>(
    `SELECT id, class_id, student_code, first_name, last_name, is_active, added_at 
     FROM students 
     WHERE student_code = $1 AND class_id = $2`,
    [studentCode, classId]
  );
  return result.rows[0];
}

export async function createStudent(
  pg: PostgresDb,
  data: CreateStudentData
): Promise<DbStudent> {
  const result = await pg.query<DbStudent>(
    `INSERT INTO students (class_id, student_code, first_name, last_name)
     VALUES ($1, $2, $3, $4)
     RETURNING id, class_id, student_code, first_name, last_name, is_active, added_at`,
    [data.class_id, data.student_code, data.first_name, data.last_name]
  );
  return result.rows[0];
}

export async function updateStudent(
  pg: PostgresDb,
  id: string,
  userId: string,
  data: UpdateStudentData
): Promise<DbStudent | undefined> {
  const result = await pg.query<DbStudent>(
    `UPDATE students 
     SET student_code = COALESCE($1, student_code), 
         first_name = COALESCE($2, first_name), 
         last_name = COALESCE($3, last_name),
         is_active = COALESCE($4, is_active)
     FROM classes c
     WHERE students.id = $5 AND students.class_id = c.id AND c.user_id = $6
     RETURNING students.id, students.class_id, students.student_code, students.first_name, students.last_name, students.is_active, students.added_at`,
    [data.student_code || null, data.first_name || null, data.last_name || null, data.is_active !== undefined ? data.is_active : null, id, userId]
  );
  return result.rows[0];
}

export async function deleteStudent(
  pg: PostgresDb,
  id: string,
  userId: string
): Promise<void> {
  await pg.query(
    `UPDATE students 
     SET is_active = FALSE
     FROM classes c
     WHERE students.id = $1 AND students.class_id = c.id AND c.user_id = $2`,
    [id, userId]
  );
}
