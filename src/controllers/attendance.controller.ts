import type { FastifyRequest, FastifyReply } from 'fastify';
import {
  createAttendanceSessionSchema,
  bulkUpdateAttendanceRecordsSchema,
  updateAttendanceRecordSchema,
  attendanceRecordsQuerySchema,
} from '../schemas/attendance.schema.js';
import * as attendanceService from '../services/attendance.service.js';

export async function getAttendanceSessionsHandler(
  request: FastifyRequest<{ Params: { classId: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const sessions = await attendanceService.getAttendanceSessionsByClassId(request.server.pg, request.params.classId, userId);
  return reply.send({ sessions });
}

export async function getAttendanceSessionHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const session = await attendanceService.getAttendanceSessionById(request.server.pg, request.params.id, userId);
  return reply.send({ session });
}

export async function createAttendanceSessionHandler(
  request: FastifyRequest<{ Params: { classId: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const dto = createAttendanceSessionSchema.parse(request.body);
  const session = await attendanceService.createAttendanceSession(request.server.pg, request.params.classId, userId, dto);
  return reply.status(201).send({ session });
}

export async function bulkUpdateAttendanceRecordsHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const dto = bulkUpdateAttendanceRecordsSchema.parse(request.body);
  const records = await attendanceService.bulkUpdateAttendanceRecords(request.server.pg, request.params.id, userId, dto);
  return reply.send({ records });
}

export async function getAttendanceRecordsHandler(
  request: FastifyRequest<{ Params: { classId: string }; Querystring: any }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const query = attendanceRecordsQuerySchema.parse(request.query);
  const records = await attendanceService.getAttendanceRecords(request.server.pg, request.params.classId, userId, query);
  return reply.send({ records });
}

export async function updateAttendanceRecordHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const dto = updateAttendanceRecordSchema.parse(request.body);
  const record = await attendanceService.updateAttendanceRecord(request.server.pg, request.params.id, userId, dto);
  return reply.send({ record });
}
