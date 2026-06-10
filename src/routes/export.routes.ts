import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { exportClassHandler } from '../controllers/export.controller.js';

export async function exportRoutes(app: FastifyInstance) {
  app.post('/', { onRequest: [app.authenticate] }, exportClassHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
}
