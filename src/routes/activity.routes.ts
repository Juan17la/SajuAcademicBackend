import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  getActivitiesHandler,
  createActivityHandler,
  updateActivityHandler,
  deleteActivityHandler,
} from '../controllers/activity.controller.js';

export async function activityRoutes(app: FastifyInstance) {
  app.get('/', { onRequest: [app.authenticate] }, getActivitiesHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
  app.post('/', { onRequest: [app.authenticate] }, createActivityHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
}

export async function activityDetailRoutes(app: FastifyInstance) {
  app.patch('/:id', { onRequest: [app.authenticate] }, updateActivityHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
  app.delete('/:id', { onRequest: [app.authenticate] }, deleteActivityHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
}
