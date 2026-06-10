import type { FastifyRequest, FastifyReply } from 'fastify';
import { bulkUpdateScoresSchema } from '../schemas/score.schema.js';
import * as scoreService from '../services/score.service.js';

export async function getScoresByClassHandler(
  request: FastifyRequest<{ Params: { classId: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const scores = await scoreService.getScoresByClassId(request.server.pg, request.params.classId, userId);
  return reply.send({ scores });
}

export async function getScoresByActivityHandler(
  request: FastifyRequest<{ Params: { activityId: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const scores = await scoreService.getScoresByActivityId(request.server.pg, request.params.activityId, userId);
  return reply.send({ scores });
}

export async function getScoresByStudentHandler(
  request: FastifyRequest<{ Params: { studentId: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const scores = await scoreService.getScoresByStudentId(request.server.pg, request.params.studentId, userId);
  return reply.send({ scores });
}

export async function bulkUpdateScoresHandler(
  request: FastifyRequest<{ Params: { activityId: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const dto = bulkUpdateScoresSchema.parse(request.body);
  const scores = await scoreService.bulkUpdateScores(request.server.pg, request.params.activityId, userId, dto);
  return reply.send({ scores });
}
