import type { PostgresDb } from '@fastify/postgres';
import type { DbScore, CreateScoreData, UpdateScoreData } from '../interfaces/score/score.interface.js';

export async function findScoresByClassId(
  pg: PostgresDb,
  classId: string,
  userId: string
): Promise<DbScore[]> {
  const result = await pg.query<DbScore>(
    `SELECT s.id, s.activity_id, s.student_id, s.value_numeric, s.value_letter, s.scored_by, s.scored_at, s.updated_at 
     FROM scores s
     JOIN activities a ON s.activity_id = a.id
     JOIN classes c ON a.class_id = c.id
     WHERE a.class_id = $1 AND c.user_id = $2 AND a.is_deleted = FALSE`,
    [classId, userId]
  );
  return result.rows;
}

export async function findScoresByActivityId(
  pg: PostgresDb,
  activityId: string,
  userId: string
): Promise<DbScore[]> {
  const result = await pg.query<DbScore>(
    `SELECT s.id, s.activity_id, s.student_id, s.value_numeric, s.value_letter, s.scored_by, s.scored_at, s.updated_at 
     FROM scores s
     JOIN activities a ON s.activity_id = a.id
     JOIN classes c ON a.class_id = c.id
     WHERE s.activity_id = $1 AND c.user_id = $2 AND a.is_deleted = FALSE`,
    [activityId, userId]
  );
  return result.rows;
}

export async function findScoresByStudentId(
  pg: PostgresDb,
  studentId: string,
  userId: string
): Promise<DbScore[]> {
  const result = await pg.query<DbScore>(
    `SELECT s.id, s.activity_id, s.student_id, s.value_numeric, s.value_letter, s.scored_by, s.scored_at, s.updated_at 
     FROM scores s
     JOIN activities a ON s.activity_id = a.id
     JOIN classes c ON a.class_id = c.id
     JOIN students st ON s.student_id = st.id
     WHERE s.student_id = $1 AND c.user_id = $2 AND a.is_deleted = FALSE AND st.is_active = TRUE`,
    [studentId, userId]
  );
  return result.rows;
}

export async function findScoreByActivityAndStudent(
  pg: PostgresDb,
  activityId: string,
  studentId: string
): Promise<DbScore | undefined> {
  const result = await pg.query<DbScore>(
    `SELECT id, activity_id, student_id, value_numeric, value_letter, scored_by, scored_at, updated_at 
     FROM scores 
     WHERE activity_id = $1 AND student_id = $2`,
    [activityId, studentId]
  );
  return result.rows[0];
}

export async function createScore(
  pg: PostgresDb,
  data: CreateScoreData
): Promise<DbScore> {
  const result = await pg.query<DbScore>(
    `INSERT INTO scores (activity_id, student_id, value_numeric, value_letter, scored_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, activity_id, student_id, value_numeric, value_letter, scored_by, scored_at, updated_at`,
    [data.activity_id, data.student_id, data.value_numeric || null, data.value_letter || null, data.scored_by]
  );
  return result.rows[0];
}

export async function updateScore(
  pg: PostgresDb,
  id: string,
  data: UpdateScoreData
): Promise<DbScore | undefined> {
  const result = await pg.query<DbScore>(
    `UPDATE scores 
     SET value_numeric = COALESCE($1, value_numeric), 
         value_letter = COALESCE($2, value_letter)
     WHERE id = $3
     RETURNING id, activity_id, student_id, value_numeric, value_letter, scored_by, scored_at, updated_at`,
    [data.value_numeric !== undefined ? data.value_numeric : null, data.value_letter || null, id]
  );
  return result.rows[0];
}

export async function upsertScore(
  pg: PostgresDb,
  data: CreateScoreData
): Promise<DbScore> {
  const existing = await findScoreByActivityAndStudent(pg, data.activity_id, data.student_id);
  
  if (existing) {
    return await updateScore(pg, existing.id, {
      value_numeric: data.value_numeric,
      value_letter: data.value_letter,
    }) as DbScore;
  }
  
  return await createScore(pg, data);
}
