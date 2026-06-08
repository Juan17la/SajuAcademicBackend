import type { PostgresDb } from '@fastify/postgres';

export interface DbUser {
  id: number;
  name: string;
  lastname: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
}

export async function findUserByEmail(
  pg: PostgresDb,
  email: string
): Promise<DbUser | undefined> {
  const result = await pg.query<DbUser>(
    'SELECT id, name, lastname, email, password, createdAt, updatedAt, lastLogin FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
}

export async function findUserById(
  pg: PostgresDb,
  id: number
): Promise<DbUser | undefined> {
  const result = await pg.query<DbUser>(
    'SELECT id, name, lastname, email, password, createdAt, updatedAt, lastLogin FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

export interface CreateUserData {
  name: string;
  lastname: string;
  email: string;
  password: string;
}

export async function createUser(
  pg: PostgresDb,
  data: CreateUserData
): Promise<DbUser> {
  const result = await pg.query<DbUser>(
    `INSERT INTO users (name, lastname, email, password)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, lastname, email, password, createdAt, updatedAt, lastLogin`,
    [data.name, data.lastname, data.email, data.password]
  );
  return result.rows[0];
}

export async function updateLastLogin(
  pg: PostgresDb,
  id: number
): Promise<void> {
  await pg.query(
    'UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = $1',
    [id]
  );
}

export async function updatePassword(
  pg: PostgresDb,
  id: number,
  hashedPassword: string
): Promise<void> {
  await pg.query(
    'UPDATE users SET password = $1, updatedAt = CURRENT_TIMESTAMP WHERE id = $2',
    [hashedPassword, id]
  );
}
