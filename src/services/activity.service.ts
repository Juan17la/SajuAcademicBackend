import type { PostgresDb } from '@fastify/postgres';
import * as activityRepository from '../repositories/activity.repository.js';
import * as classRepository from '../repositories/class.repository.js';
import type { CreateActivityDto, UpdateActivityDto } from '../schemas/activity.schema.js';
import { ConflictError, NotFoundError, UnprocessableEntityError } from '../utils/app-error.js';

export async function getActivitiesByClassId(pg: PostgresDb, classId: string, userId: string) {
  const classItem = await classRepository.findClassById(pg, classId, userId);
  if (!classItem) {
    throw new NotFoundError('Class not found');
  }

  return await activityRepository.findActivitiesByClassId(pg, classId, userId);
}

export async function getActivityById(pg: PostgresDb, id: string, userId: string) {
  const activity = await activityRepository.findActivityById(pg, id, userId);
  if (!activity) {
    throw new NotFoundError('Activity not found');
  }
  return activity;
}

export async function createActivity(pg: PostgresDb, classId: string, userId: string, dto: CreateActivityDto) {
  const classItem = await classRepository.findClassById(pg, classId, userId);
  if (!classItem) {
    throw new NotFoundError('Class not found');
  }

  // Check weight constraint
  const currentTotal = await activityRepository.getTotalWeightByClassId(pg, classId);
  if (currentTotal + dto.weight > 1) {
    throw new UnprocessableEntityError(`Total weight would exceed 100%. Current: ${(currentTotal * 100).toFixed(1)}%, Adding: ${(dto.weight * 100).toFixed(1)}%`);
  }

  try {
    return await activityRepository.createActivity(pg, {
      class_id: classId,
      name: dto.name,
      description: dto.description,
      weight: dto.weight,
      activity_type: dto.activity_type,
    });
  } catch (error: any) {
    throw error;
  }
}

export async function updateActivity(pg: PostgresDb, id: string, userId: string, dto: UpdateActivityDto) {
  const activity = await activityRepository.findActivityById(pg, id, userId);
  if (!activity) {
    throw new NotFoundError('Activity not found');
  }

  // Check weight constraint if weight is being updated
  if (dto.weight !== undefined) {
    const currentTotal = await activityRepository.getTotalWeightByClassId(pg, activity.class_id, id);
    if (currentTotal + dto.weight > 1) {
      throw new UnprocessableEntityError(`Total weight would exceed 100%. Current: ${(currentTotal * 100).toFixed(1)}%, Adding: ${(dto.weight * 100).toFixed(1)}%`);
    }
  }

  try {
    const updated = await activityRepository.updateActivity(pg, id, userId, {
      name: dto.name,
      description: dto.description,
      weight: dto.weight,
      activity_type: dto.activity_type,
    });
    if (!updated) {
      throw new NotFoundError('Activity not found');
    }
    return updated;
  } catch (error: any) {
    throw error;
  }
}

export async function deleteActivity(pg: PostgresDb, id: string, userId: string) {
  const activity = await activityRepository.findActivityById(pg, id, userId);
  if (!activity) {
    throw new NotFoundError('Activity not found');
  }

  await activityRepository.deleteActivity(pg, id, userId);
}
