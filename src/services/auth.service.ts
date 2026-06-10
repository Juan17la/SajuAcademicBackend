import bcrypt from 'bcrypt';
import type { PostgresDb } from '@fastify/postgres';
import { config } from '../config.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateLastLogin,
  updatePassword,
} from '../repositories/user.repository.js';
import type {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
} from '../schemas/auth.schema.js';
import type { AuthUser } from '../interfaces/auth/auth.interface.js';
import { toAuthUser } from '../interfaces/auth/auth.mapper.js';
import { AppError, NotFoundError, ConflictError, UnauthorizedError } from '../utils/app-error.js';

export async function register(
  pg: PostgresDb,
  dto: RegisterDto
): Promise<AuthUser> {
  const existing = await findUserByEmail(pg, dto.email);
  if (existing) {
    throw new ConflictError('Email already in use');
  }

  const hashedPassword = await bcrypt.hash(dto.password, config.BCRYPT_SALT_ROUNDS);

  const user = await createUser(pg, {
    first_name: dto.first_name,
    last_name: dto.last_name,
    email: dto.email,
    password: hashedPassword,
  });

  return toAuthUser(user);
}

export async function login(
  pg: PostgresDb,
  dto: LoginDto,
  ip?: string
): Promise<AuthUser> {
  const user = await findUserByEmail(pg, dto.email);
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const valid = await bcrypt.compare(dto.password, user.password);
  if (!valid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  await updateLastLogin(pg, user.id, ip);

  return toAuthUser(user);
}

export async function changePassword(
  pg: PostgresDb,
  userId: string,
  dto: ChangePasswordDto
): Promise<void> {
  const user = await findUserById(pg, userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const valid = await bcrypt.compare(dto.currentPassword, user.password);
  if (!valid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  const hashedPassword = await bcrypt.hash(dto.newPassword, config.BCRYPT_SALT_ROUNDS);
  await updatePassword(pg, userId, hashedPassword);
}
