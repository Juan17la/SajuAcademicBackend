import type { FastifyRequest, FastifyReply } from 'fastify';
import { aiImproveSchema } from '../schemas/activity.schema.js';
import { AIService } from '../services/ai/ai.service.js';
import * as activityService from '../services/activity.service.js';

export async function improveDescriptionHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const userId = request.user.id;
  
  // Verify activity exists and belongs to user
  await activityService.getActivityById(request.server.pg, request.params.id, userId);
  
  const dto = aiImproveSchema.parse(request.body);
  
  const aiService = new AIService();
  const startTime = Date.now();
  const improved = await aiService.improveDescription(dto.description);
  const latency = Date.now() - startTime;
  
  return reply.send({
    original: dto.description,
    improved,
    latency_ms: latency,
  });
}
