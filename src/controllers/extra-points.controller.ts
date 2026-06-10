import type { FastifyRequest, FastifyReply } from 'fastify';
import { createExtraPointsSchema } from '../schemas/extra-points.schema.js';
import * as extraPointsService from '../services/extra-points.service.js';

export async function getExtraPointsHandler(
  request: FastifyRequest<{ Params: { classId: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const extraPoints = await extraPointsService.getExtraPointsByClassId(request.server.pg, request.params.classId, userId);
  return reply.send({ extraPoints });
}

export async function createExtraPointsHandler(
  request: FastifyRequest<{ Params: { classId: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const dto = createExtraPointsSchema.parse(request.body);
  const extraPoint = await extraPointsService.createExtraPoints(request.server.pg, request.params.classId, userId, dto);
  return reply.status(201).send({ extraPoint });
}

export async function deleteExtraPointsHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  await extraPointsService.deleteExtraPoints(request.server.pg, request.params.id, userId);
  return reply.status(204).send();
}
