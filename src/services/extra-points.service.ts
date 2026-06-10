import type { PostgresDb } from '@fastify/postgres';
import * as extraPointsRepository from '../repositories/extra-points.repository.js';
import * as classRepository from '../repositories/class.repository.js';
import * as studentRepository from '../repositories/student.repository.js';
import type { CreateExtraPointsDto } from '../schemas/extra-points.schema.js';
import { NotFoundError } from '../utils/app-error.js';

export async function getExtraPointsByClassId(pg: PostgresDb, classId: string, userId: string) {
  const classItem = await classRepository.findClassById(pg, classId, userId);
  if (!classItem) {
    throw new NotFoundError('Class not found');
  }

  return await extraPointsRepository.findExtraPointsByClassId(pg, classId, userId);
}

export async function createExtraPoints(
  pg: PostgresDb,
  classId: string,
  userId: string,
  dto: CreateExtraPointsDto
) {
  const classItem = await classRepository.findClassById(pg, classId, userId);
  if (!classItem) {
    throw new NotFoundError('Class not found');
  }

  const student = await studentRepository.findStudentById(pg, dto.student_id, userId);
  if (!student) {
    throw new NotFoundError('Student not found');
  }

  return await extraPointsRepository.createExtraPoints(pg, {
    student_id: dto.student_id,
    class_id: classId,
    points: dto.points,
    reason: dto.reason,
    awarded_by: userId,
  });
}

export async function deleteExtraPoints(pg: PostgresDb, id: string, userId: string) {
  await extraPointsRepository.deleteExtraPoints(pg, id, userId);
}
