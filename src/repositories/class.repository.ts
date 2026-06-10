import type { PostgresDb } from '@fastify/postgres';
import type { DbClass, CreateClassData, UpdateClassData } from '../interfaces/class/class.interface.js';

export async function findClassesByUserId(
  pg: PostgresDb,
  userId: string
): Promise<DbClass[]> {
  const result = await pg.query<DbClass>(
    `SELECT id, user_id, name, score_type, is_deleted, deleted_at, created_at, updated_at 
     FROM classes 
     WHERE user_id = $1 AND is_deleted = FALSE 
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function findClassById(
  pg: PostgresDb,
  id: string,
  userId: string
): Promise<DbClass | undefined> {
  const result = await pg.query<DbClass>(
    `SELECT id, user_id, name, score_type, is_deleted, deleted_at, created_at, updated_at 
     FROM classes 
     WHERE id = $1 AND user_id = $2 AND is_deleted = FALSE`,
    [id, userId]
  );
  return result.rows[0];
}

export async function createClass(
  pg: PostgresDb,
  data: CreateClassData
): Promise<DbClass> {
  const result = await pg.query<DbClass>(
    `INSERT INTO classes (user_id, name, score_type)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, name, score_type, is_deleted, deleted_at, created_at, updated_at`,
    [data.user_id, data.name, data.score_type]
  );
  return result.rows[0];
}

export async function updateClass(
  pg: PostgresDb,
  id: string,
  userId: string,
  data: UpdateClassData
): Promise<DbClass | undefined> {
  const result = await pg.query<DbClass>(
    `UPDATE classes 
     SET name = COALESCE($1, name), score_type = COALESCE($2, score_type)
     WHERE id = $3 AND user_id = $4 AND is_deleted = FALSE
     RETURNING id, user_id, name, score_type, is_deleted, deleted_at, created_at, updated_at`,
    [data.name || null, data.score_type || null, id, userId]
  );
  return result.rows[0];
}

export async function deleteClass(
  pg: PostgresDb,
  id: string,
  userId: string
): Promise<void> {
  await pg.query(
    `UPDATE classes 
     SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP 
     WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
}
