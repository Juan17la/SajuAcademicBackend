import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  getAttendanceSessionsHandler,
  getAttendanceSessionHandler,
  createAttendanceSessionHandler,
  bulkUpdateAttendanceRecordsHandler,
  getAttendanceRecordsHandler,
  updateAttendanceRecordHandler,
} from '../controllers/attendance.controller.js';

export async function attendanceSessionRoutes(app: FastifyInstance) {
  app.get('/', { onRequest: [app.authenticate] }, getAttendanceSessionsHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
  app.post('/', { onRequest: [app.authenticate] }, createAttendanceSessionHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
}

export async function attendanceSessionDetailRoutes(app: FastifyInstance) {
  app.get('/:id', { onRequest: [app.authenticate] }, getAttendanceSessionHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
  app.put('/:id/records', { onRequest: [app.authenticate] }, bulkUpdateAttendanceRecordsHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
}

export async function attendanceRecordRoutes(app: FastifyInstance) {
  // Nested under classes: /v1/classes/:classId/attendance-records
  app.get('/', { onRequest: [app.authenticate] }, getAttendanceRecordsHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
}

export async function attendanceRecordDetailRoutes(app: FastifyInstance) {
  // Direct: /v1/attendance-records/:id
  app.patch('/:id', { onRequest: [app.authenticate] }, updateAttendanceRecordHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
}
