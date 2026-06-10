import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getDashboardHandler } from '../controllers/dashboard.controller.js';

export async function dashboardRoutes(app: FastifyInstance) {
  app.get('/', { onRequest: [app.authenticate] }, getDashboardHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
}
