import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  getScoresByClassHandler,
  getScoresByActivityHandler,
  getScoresByStudentHandler,
  bulkUpdateScoresHandler,
} from '../controllers/score.controller.js';

export async function scoreClassRoutes(app: FastifyInstance) {
  app.get('/', { onRequest: [app.authenticate] }, getScoresByClassHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
}

export async function scoreActivityRoutes(app: FastifyInstance) {
  app.get('/', { onRequest: [app.authenticate] }, getScoresByActivityHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
  app.put('/', { onRequest: [app.authenticate] }, bulkUpdateScoresHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
}

export async function scoreStudentRoutes(app: FastifyInstance) {
  app.get('/', { onRequest: [app.authenticate] }, getScoresByStudentHandler as (request: FastifyRequest, reply: FastifyReply) => Promise<void>);
}
