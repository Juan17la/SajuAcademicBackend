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

export interface AuthUser {
  id: number;
  name: string;
  lastname: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
}

function toAuthUser(dbUser: {
  id: number;
  name: string;
  lastname: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
}): AuthUser {
  return {
    id: dbUser.id,
    name: dbUser.name,
    lastname: dbUser.lastname,
    email: dbUser.email,
    createdAt: dbUser.createdAt,
    updatedAt: dbUser.updatedAt,
    lastLogin: dbUser.lastLogin,
  };
}

export async function register(
  pg: PostgresDb,
  dto: RegisterDto
): Promise<AuthUser> {
  console.log('register service: checking existing user');
  const existing = await findUserByEmail(pg, dto.email);
  if (existing) {
    throw new Error('Email already in use');
  }

  console.log('register service: hashing password');
  const hashedPassword = await bcrypt.hash(dto.password, config.BCRYPT_SALT_ROUNDS);

  console.log('register service: creating user in DB');
  const user = await createUser(pg, {
    name: dto.name,
    lastname: dto.lastname,
    email: dto.email,
    password: hashedPassword,
  });

  console.log('register service: user created');
  return toAuthUser(user);
}

export async function login(
  pg: PostgresDb,
  dto: LoginDto
): Promise<AuthUser> {
  console.log('login service: finding user');
  const user = await findUserByEmail(pg, dto.email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  console.log('login service: comparing password');
  const valid = await bcrypt.compare(dto.password, user.password);
  if (!valid) {
    throw new Error('Invalid credentials');
  }

  console.log('login service: updating last login');
  await updateLastLogin(pg, user.id);

  console.log('login service: done');
  return toAuthUser(user);
}

export async function changePassword(
  pg: PostgresDb,
  userId: number,
  dto: ChangePasswordDto
): Promise<void> {
  console.log('changePassword service: finding user');
  const user = await findUserById(pg, userId);
  if (!user) {
    throw new Error('User not found');
  }

  console.log('changePassword service: comparing password');
  const valid = await bcrypt.compare(dto.currentPassword, user.password);
  if (!valid) {
    throw new Error('Current password is incorrect');
  }

  console.log('changePassword service: hashing new password');
  const hashedPassword = await bcrypt.hash(dto.newPassword, config.BCRYPT_SALT_ROUNDS);

  console.log('changePassword service: updating password');
  await updatePassword(pg, userId, hashedPassword);
  console.log('changePassword service: done');
}
