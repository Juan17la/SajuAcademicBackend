import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { improveDescriptionHandler } from '../controllers/ai.controller.js';

export async function aiRoutes(app: FastifyInstance) {
  app.post('/:id/ai-improve', { onRequest: [app.authenticate] }, improveDescriptionHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
}
