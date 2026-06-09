import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  getStudentsHandler,
  createStudentHandler,
  importStudentsHandler,
  updateStudentHandler,
  deleteStudentHandler,
} from '../controllers/student.controller.js';

export async function studentRoutes(app: FastifyInstance) {
  app.get('/', { onRequest: [app.authenticate] }, getStudentsHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
  app.post('/', { onRequest: [app.authenticate] }, createStudentHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
  app.post('/import', { onRequest: [app.authenticate] }, importStudentsHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
}

export async function studentDetailRoutes(app: FastifyInstance) {
  app.patch('/:id', { onRequest: [app.authenticate] }, updateStudentHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
  app.delete('/:id', { onRequest: [app.authenticate] }, deleteStudentHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
}
