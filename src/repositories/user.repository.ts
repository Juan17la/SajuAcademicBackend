import type { PostgresDb } from '@fastify/postgres';
import type { DbUser, CreateUserData } from '../interfaces/user/user.interface.js';

export async function findUserByEmail(
  pg: PostgresDb,
  email: string
): Promise<DbUser | undefined> {
  const result = await pg.query<DbUser>(
    `SELECT id, first_name, last_name, email, password, last_login_at, last_login_ip, created_at, updated_at 
     FROM users 
     WHERE email = $1`,
    [email]
  );
  return result.rows[0];
}

export async function findUserById(
  pg: PostgresDb,
  id: string
): Promise<DbUser | undefined> {
  const result = await pg.query<DbUser>(
    `SELECT id, first_name, last_name, email, password, last_login_at, last_login_ip, created_at, updated_at 
     FROM users 
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

export async function createUser(
  pg: PostgresDb,
  data: CreateUserData
): Promise<DbUser> {
  const result = await pg.query<DbUser>(
    `INSERT INTO users (first_name, last_name, email, password)
     VALUES ($1, $2, $3, $4)
     RETURNING id, first_name, last_name, email, password, last_login_at, last_login_ip, created_at, updated_at`,
    [data.first_name, data.last_name, data.email, data.password]
  );
  return result.rows[0];
}

export async function updateLastLogin(
  pg: PostgresDb,
  id: string,
  ip?: string
): Promise<void> {
  await pg.query(
    'UPDATE users SET last_login_at = CURRENT_TIMESTAMP, last_login_ip = $1 WHERE id = $2',
    [ip || null, id]
  );
}

export async function updatePassword(
  pg: PostgresDb,
  id: string,
  hashedPassword: string
): Promise<void> {
  await pg.query(
    'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [hashedPassword, id]
  );
}
