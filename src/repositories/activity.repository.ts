import type { PostgresDb } from '@fastify/postgres';
import type { DbActivity, CreateActivityData, UpdateActivityData } from '../interfaces/activity/activity.interface.js';

export async function findActivitiesByClassId(
  pg: PostgresDb,
  classId: string,
  userId: string
): Promise<DbActivity[]> {
  const result = await pg.query<DbActivity>(
    `SELECT a.id, a.class_id, a.name, a.description, a.weight, a.activity_type, a.is_deleted, a.deleted_at, a.created_at, a.updated_at 
     FROM activities a
     JOIN classes c ON a.class_id = c.id
     WHERE a.class_id = $1 AND c.user_id = $2 AND a.is_deleted = FALSE
     ORDER BY a.created_at DESC`,
    [classId, userId]
  );
  return result.rows;
}

export async function findActivityById(
  pg: PostgresDb,
  id: string,
  userId: string
): Promise<DbActivity | undefined> {
  const result = await pg.query<DbActivity>(
    `SELECT a.id, a.class_id, a.name, a.description, a.weight, a.activity_type, a.is_deleted, a.deleted_at, a.created_at, a.updated_at 
     FROM activities a
     JOIN classes c ON a.class_id = c.id
     WHERE a.id = $1 AND c.user_id = $2 AND a.is_deleted = FALSE`,
    [id, userId]
  );
  return result.rows[0];
}

export async function getTotalWeightByClassId(
  pg: PostgresDb,
  classId: string,
  excludeActivityId?: string
): Promise<number> {
  const result = await pg.query<{ total: number }>(
    `SELECT COALESCE(SUM(weight), 0) as total 
     FROM activities 
     WHERE class_id = $1 AND is_deleted = FALSE ${excludeActivityId ? 'AND id != $2' : ''}`,
    excludeActivityId ? [classId, excludeActivityId] : [classId]
  );
  return result.rows[0].total;
}

export async function createActivity(
  pg: PostgresDb,
  data: CreateActivityData
): Promise<DbActivity> {
  const result = await pg.query<DbActivity>(
    `INSERT INTO activities (class_id, name, description, weight, activity_type)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, class_id, name, description, weight, activity_type, is_deleted, deleted_at, created_at, updated_at`,
    [data.class_id, data.name, data.description || null, data.weight, data.activity_type]
  );
  return result.rows[0];
}

export async function updateActivity(
  pg: PostgresDb,
  id: string,
  userId: string,
  data: UpdateActivityData
): Promise<DbActivity | undefined> {
  const result = await pg.query<DbActivity>(
    `UPDATE activities 
     SET name = COALESCE($1, name), 
         description = COALESCE($2, description), 
         weight = COALESCE($3, weight),
         activity_type = COALESCE($4, activity_type)
     FROM classes c
     WHERE activities.id = $5 AND activities.class_id = c.id AND c.user_id = $6 AND activities.is_deleted = FALSE
     RETURNING activities.id, activities.class_id, activities.name, activities.description, activities.weight, activities.activity_type, activities.is_deleted, activities.deleted_at, activities.created_at, activities.updated_at`,
    [data.name || null, data.description !== undefined ? data.description : null, data.weight || null, data.activity_type || null, id, userId]
  );
  return result.rows[0];
}

export async function deleteActivity(
  pg: PostgresDb,
  id: string,
  userId: string
): Promise<void> {
  await pg.query(
    `UPDATE activities 
     SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP
     FROM classes c
     WHERE activities.id = $1 AND activities.class_id = c.id AND c.user_id = $2`,
    [id, userId]
  );
}
