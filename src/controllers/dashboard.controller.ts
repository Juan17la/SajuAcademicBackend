import type { FastifyRequest, FastifyReply } from 'fastify';
import * as dashboardService from '../services/dashboard.service.js';

export async function getDashboardHandler(
  request: FastifyRequest<{ Params: { classId: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const dashboard = await dashboardService.getDashboard(request.server.pg, request.params.classId, userId);
  return reply.send(dashboard);
}
