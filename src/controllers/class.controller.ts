import type { FastifyRequest, FastifyReply } from 'fastify';
import { createClassSchema, updateClassSchema } from '../schemas/class.schema.js';
import * as classService from '../services/class.service.js';

export async function getClassesHandler(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.id;
  const classes = await classService.getClasses(request.server.pg, userId);
  return reply.send({ classes });
}

export async function getClassByIdHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const userId = request.user.id;
  const classItem = await classService.getClassById(request.server.pg, request.params.id, userId);
  return reply.send({ class: classItem });
}

export async function createClassHandler(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.id;
  const dto = createClassSchema.parse(request.body);
  const classItem = await classService.createClass(request.server.pg, userId, dto);
  return reply.status(201).send({ class: classItem });
}

export async function updateClassHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const userId = request.user.id;
  const dto = updateClassSchema.parse(request.body);
  const classItem = await classService.updateClass(request.server.pg, request.params.id, userId, dto);
  return reply.send({ class: classItem });
}

export async function deleteClassHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const userId = request.user.id;
  await classService.deleteClass(request.server.pg, request.params.id, userId);
  return reply.status(204).send();
}
