import type { FastifyRequest, FastifyReply } from 'fastify';
import { createActivitySchema, updateActivitySchema } from '../schemas/activity.schema.js';
import * as activityService from '../services/activity.service.js';

export async function getActivitiesHandler(
  request: FastifyRequest<{ Params: { classId: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const activities = await activityService.getActivitiesByClassId(request.server.pg, request.params.classId, userId);
  return reply.send({ activities });
}

export async function createActivityHandler(
  request: FastifyRequest<{ Params: { classId: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const dto = createActivitySchema.parse(request.body);
  const activity = await activityService.createActivity(request.server.pg, request.params.classId, userId, dto);
  return reply.status(201).send({ activity });
}

export async function updateActivityHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const dto = updateActivitySchema.parse(request.body);
  const activity = await activityService.updateActivity(request.server.pg, request.params.id, userId, dto);
  return reply.send({ activity });
}

export async function deleteActivityHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  await activityService.deleteActivity(request.server.pg, request.params.id, userId);
  return reply.status(204).send();
}
