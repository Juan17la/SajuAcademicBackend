import type { PostgresDb } from '@fastify/postgres';
import type { DbExtraPoints, CreateExtraPointsData } from '../interfaces/extra-points/extra-points.interface.js';

export async function findExtraPointsByClassId(
  pg: PostgresDb,
  classId: string,
  userId: string
): Promise<DbExtraPoints[]> {
  const result = await pg.query<DbExtraPoints>(
    `SELECT e.id, e.student_id, e.class_id, e.points, e.reason, e.awarded_by, e.created_at, e.updated_at 
     FROM extra_points e
     JOIN classes c ON e.class_id = c.id
     WHERE e.class_id = $1 AND c.user_id = $2
     ORDER BY e.created_at DESC`,
    [classId, userId]
  );
  return result.rows;
}

export async function createExtraPoints(
  pg: PostgresDb,
  data: CreateExtraPointsData
): Promise<DbExtraPoints> {
  const result = await pg.query<DbExtraPoints>(
    `INSERT INTO extra_points (student_id, class_id, points, reason, awarded_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, student_id, class_id, points, reason, awarded_by, created_at, updated_at`,
    [data.student_id, data.class_id, data.points, data.reason || null, data.awarded_by]
  );
  return result.rows[0];
}

export async function deleteExtraPoints(
  pg: PostgresDb,
  id: string,
  userId: string
): Promise<void> {
  await pg.query(
    `DELETE FROM extra_points 
     WHERE id = $1 AND class_id IN (SELECT id FROM classes WHERE user_id = $2)`,
    [id, userId]
  );
}
