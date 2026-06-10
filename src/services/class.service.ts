import type { PostgresDb } from '@fastify/postgres';
import * as classRepository from '../repositories/class.repository.js';
import type { CreateClassDto, UpdateClassDto } from '../schemas/class.schema.js';
import { ConflictError, NotFoundError } from '../utils/app-error.js';

export async function getClasses(pg: PostgresDb, userId: string) {
  return await classRepository.findClassesByUserId(pg, userId);
}

export async function getClassById(pg: PostgresDb, id: string, userId: string) {
  const classItem = await classRepository.findClassById(pg, id, userId);
  if (!classItem) {
    throw new NotFoundError('Class not found');
  }
  return classItem;
}

export async function createClass(pg: PostgresDb, userId: string, dto: CreateClassDto) {
  try {
    return await classRepository.createClass(pg, {
      user_id: userId,
      name: dto.name,
      score_type: dto.score_type,
    });
  } catch (error: any) {
    if (error.code === '23505') { // unique_violation
      throw new ConflictError('A class with this name already exists');
    }
    throw error;
  }
}

export async function updateClass(pg: PostgresDb, id: string, userId: string, dto: UpdateClassDto) {
  const existingClass = await classRepository.findClassById(pg, id, userId);
  if (!existingClass) {
    throw new NotFoundError('Class not found');
  }

  try {
    const updated = await classRepository.updateClass(pg, id, userId, {
      name: dto.name,
      score_type: dto.score_type,
    });
    if (!updated) {
      throw new NotFoundError('Class not found');
    }
    return updated;
  } catch (error: any) {
    if (error.code === '23505') {
      throw new ConflictError('A class with this name already exists');
    }
    throw error;
  }
}

export async function deleteClass(pg: PostgresDb, id: string, userId: string) {
  const existingClass = await classRepository.findClassById(pg, id, userId);
  if (!existingClass) {
    throw new NotFoundError('Class not found');
  }

  await classRepository.deleteClass(pg, id, userId);
}
