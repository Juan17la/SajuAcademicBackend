import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  getClassesHandler,
  getClassByIdHandler,
  createClassHandler,
  updateClassHandler,
  deleteClassHandler,
} from '../controllers/class.controller.js';

export async function classRoutes(app: FastifyInstance) {
  app.get('/', { onRequest: [app.authenticate] }, getClassesHandler);
  app.get('/:id', { onRequest: [app.authenticate] }, getClassByIdHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
  app.post('/', { onRequest: [app.authenticate] }, createClassHandler);
  app.patch('/:id', { onRequest: [app.authenticate] }, updateClassHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
  app.delete('/:id', { onRequest: [app.authenticate] }, deleteClassHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
}
