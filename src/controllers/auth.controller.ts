import type { FastifyRequest, FastifyReply } from 'fastify';
import { config } from '../config.js';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../schemas/auth.schema.js';
import { register, login, changePassword } from '../services/auth.service.js';

function buildTokensPayload(user: { id: string; email: string }) {
  return { id: user.id, email: user.email };
}

export async function registerHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dto = registerSchema.parse(request.body);
  const user = await register(request.server.pg, dto);

  const accessToken = await reply.jwtSign(buildTokensPayload(user), {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN,
  });
  const refreshToken = await reply.jwtSign(buildTokensPayload(user), {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  });

  return reply.status(201).send({
    user,
    tokens: { accessToken, refreshToken },
  });
}

export async function loginHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dto = loginSchema.parse(request.body);
  const ip = request.ip;
  const user = await login(request.server.pg, dto, ip);

  const accessToken = await reply.jwtSign(buildTokensPayload(user), {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN,
  });
  const refreshToken = await reply.jwtSign(buildTokensPayload(user), {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  });

  return reply.send({
    user,
    tokens: { accessToken, refreshToken },
  });
}

export async function refreshHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dto = refreshSchema.parse(request.body);

  const decoded = request.server.jwt.verify(dto.refreshToken) as {
    id: string;
    email: string;
  };

  const accessToken = await reply.jwtSign(
    { id: decoded.id, email: decoded.email },
    { expiresIn: config.JWT_ACCESS_EXPIRES_IN }
  );

  return reply.send({ accessToken });
}

export async function changePasswordHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dto = changePasswordSchema.parse(request.body);
  const userId = request.user.id;

  await changePassword(request.server.pg, userId, dto);

  return reply.send({ message: 'Password updated successfully' });
}

export async function forgotPasswordHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dto = forgotPasswordSchema.parse(request.body);
  // PENDING: Email service not configured
  return reply.status(503).send({
    message: 'Password recovery is not yet available',
  });
}

export async function resetPasswordHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dto = resetPasswordSchema.parse(request.body);
  // PENDING: Email service not configured
  return reply.status(503).send({
    message: 'Password recovery is not yet available',
  });
}
