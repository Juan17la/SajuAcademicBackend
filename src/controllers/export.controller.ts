import type { FastifyRequest, FastifyReply } from 'fastify';
import * as exportService from '../services/export.service.js';

export async function exportClassHandler(
  request: FastifyRequest<{ Params: { classId: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  const classId = request.params.classId;
  
  const buffer = await exportService.exportClassToExcel(request.server.pg, classId, userId);
  
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `class-export-${classId}-${timestamp}.xlsx`;
  
  reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  reply.header('Content-Disposition', `attachment; filename="${filename}"`);
  
  return reply.send(buffer);
}
