import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  getExtraPointsHandler,
  createExtraPointsHandler,
  deleteExtraPointsHandler,
} from '../controllers/extra-points.controller.js';

export async function extraPointsRoutes(app: FastifyInstance) {
  app.get('/', { onRequest: [app.authenticate] }, getExtraPointsHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
  app.post('/', { onRequest: [app.authenticate] }, createExtraPointsHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
}

export async function extraPointsDetailRoutes(app: FastifyInstance) {
  app.delete('/:id', { onRequest: [app.authenticate] }, deleteExtraPointsHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
}
