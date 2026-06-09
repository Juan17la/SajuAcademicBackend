import type { FastifyRequest, FastifyReply } from 'fastify';
import { createStudentSchema, updateStudentSchema, importStudentsSchema } from '../schemas/student.schema.js';
import * as studentService from '../services/student.service.js';

export async function getStudentsHandler(
  request: FastifyRequest<{ Params: { classId: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const students = await studentService.getStudentsByClassId(request.server.pg, request.params.classId, userId);
  return reply.send({ students });
}

export async function createStudentHandler(
  request: FastifyRequest<{ Params: { classId: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const dto = createStudentSchema.parse(request.body);
  const student = await studentService.createStudent(request.server.pg, request.params.classId, userId, dto);
  return reply.status(201).send({ student });
}

export async function importStudentsHandler(
  request: FastifyRequest<{ Params: { classId: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const dto = importStudentsSchema.parse(request.body);
  const result = await studentService.importStudents(request.server.pg, request.params.classId, userId, dto);
  return reply.status(201).send(result);
}

export async function updateStudentHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const dto = updateStudentSchema.parse(request.body);
  const student = await studentService.updateStudent(request.server.pg, request.params.id, userId, dto);
  return reply.send({ student });
}

export async function deleteStudentHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  await studentService.deleteStudent(request.server.pg, request.params.id, userId);
  return reply.status(204).send();
}
