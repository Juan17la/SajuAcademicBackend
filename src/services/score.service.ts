import type { PostgresDb } from '@fastify/postgres';
import * as scoreRepository from '../repositories/score.repository.js';
import * as activityRepository from '../repositories/activity.repository.js';
import * as classRepository from '../repositories/class.repository.js';
import * as studentRepository from '../repositories/student.repository.js';
import type { BulkUpdateScoresDto } from '../schemas/score.schema.js';
import { NotFoundError, BadRequestError, UnprocessableEntityError } from '../utils/app-error.js';

export async function getScoresByClassId(pg: PostgresDb, classId: string, userId: string) {
  const classItem = await classRepository.findClassById(pg, classId, userId);
  if (!classItem) {
    throw new NotFoundError('Class not found');
  }

  return await scoreRepository.findScoresByClassId(pg, classId, userId);
}

export async function getScoresByActivityId(pg: PostgresDb, activityId: string, userId: string) {
  const activity = await activityRepository.findActivityById(pg, activityId, userId);
  if (!activity) {
    throw new NotFoundError('Activity not found');
  }

  return await scoreRepository.findScoresByActivityId(pg, activityId, userId);
}

export async function getScoresByStudentId(pg: PostgresDb, studentId: string, userId: string) {
  const student = await studentRepository.findStudentById(pg, studentId, userId);
  if (!student) {
    throw new NotFoundError('Student not found');
  }

  return await scoreRepository.findScoresByStudentId(pg, studentId, userId);
}

export async function bulkUpdateScores(
  pg: PostgresDb, 
  activityId: string, 
  userId: string, 
  dto: BulkUpdateScoresDto
) {
  const activity = await activityRepository.findActivityById(pg, activityId, userId);
  if (!activity) {
    throw new NotFoundError('Activity not found');
  }

  // Get class to validate score type
  const classItem = await classRepository.findClassById(pg, activity.class_id, userId);
  if (!classItem) {
    throw new NotFoundError('Class not found');
  }

  const results = [];

  for (const score of dto.scores) {
    // Validate score based on class type
    validateScore(classItem.score_type, score.value);

    const isLetter = typeof score.value === 'string';
    const upserted = await scoreRepository.upsertScore(pg, {
      activity_id: activityId,
      student_id: score.student_id,
      value_numeric: isLetter ? undefined : score.value as number,
      value_letter: isLetter ? score.value as string : undefined,
      scored_by: userId,
    });
    results.push(upserted);
  }

  return results;
}

function validateScore(scoreType: string, value: number | string) {
  if (scoreType === 'letters') {
    const validGrades = ['A', 'B', 'C', 'D', 'F-', 'F', 'F+'];
    if (!validGrades.includes(value as string)) {
      throw new UnprocessableEntityError(`Invalid letter grade. Must be one of: ${validGrades.join(', ')}`);
    }
  } else if (scoreType === 'numeric') {
    if (typeof value !== 'number' || value < 0 || value > 100) {
      throw new UnprocessableEntityError('Invalid numeric score. Must be between 0 and 100');
    }
  } else if (scoreType === 'percentage') {
    if (typeof value !== 'number' || value < 0 || value > 100) {
      throw new UnprocessableEntityError('Invalid percentage score. Must be between 0 and 100');
    }
  }
}
