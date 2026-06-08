import type { FastifyRequest, FastifyReply } from 'fastify';
import { config } from '../config.js';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  changePasswordSchema,
} from '../schemas/auth.schema.js';
import { register, login, changePassword } from '../services/auth.service.js';

function buildTokensPayload(user: { id: number; email: string }) {
  return { id: user.id, email: user.email };
}

export async function registerHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    request.log.info('registerHandler started');
    const dto = registerSchema.parse(request.body);
    request.log.info({ email: dto.email }, 'registerHandler body parsed');

    request.log.info('registerHandler calling register service...');
    const user = await register(request.server.pg, dto);
    request.log.info({ userId: user.id }, 'registerHandler service done');

    request.log.info('registerHandler signing tokens...');
    const accessToken = await reply.jwtSign(buildTokensPayload(user), {
      expiresIn: config.JWT_ACCESS_EXPIRES_IN,
    });
    const refreshToken = await reply.jwtSign(buildTokensPayload(user), {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
    });
    request.log.info('registerHandler tokens signed');

    reply.status(201).send({
      user,
      tokens: { accessToken, refreshToken },
    });
    request.log.info('registerHandler response sent');
  } catch (error) {
    request.log.error(error, 'registerHandler error');
    if (error instanceof Error && error.message === 'Email already in use') {
      reply.status(409).send({ message: error.message });
      return;
    }
    throw error;
  }
}

export async function loginHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    request.log.info('loginHandler started');
    const dto = loginSchema.parse(request.body);
    request.log.info({ email: dto.email }, 'loginHandler body parsed');

    request.log.info('loginHandler calling login service...');
    const user = await login(request.server.pg, dto);
    request.log.info({ userId: user.id }, 'loginHandler service done');

    request.log.info('loginHandler signing tokens...');
    const accessToken = await reply.jwtSign(buildTokensPayload(user), {
      expiresIn: config.JWT_ACCESS_EXPIRES_IN,
    });
    const refreshToken = await reply.jwtSign(buildTokensPayload(user), {
      expiresIn: config.JWT_REFRESH_EXPIRES_IN,
    });
    request.log.info('loginHandler tokens signed');

    reply.send({
      user,
      tokens: { accessToken, refreshToken },
    });
    request.log.info('loginHandler response sent');
  } catch (error) {
    request.log.error(error, 'loginHandler error');
    if (error instanceof Error && error.message === 'Invalid credentials') {
      reply.status(401).send({ message: error.message });
      return;
    }
    throw error;
  }
}

export async function refreshHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    request.log.info('refreshHandler started');
    const dto = refreshSchema.parse(request.body);
    request.log.info('refreshHandler body parsed');

    const decoded = request.server.jwt.verify(dto.refreshToken) as {
      id: number;
      email: string;
    };
    request.log.info({ userId: decoded.id }, 'refreshHandler token verified');

    const accessToken = await reply.jwtSign(
      { id: decoded.id, email: decoded.email },
      { expiresIn: config.JWT_ACCESS_EXPIRES_IN }
    );
    request.log.info('refreshHandler new access token signed');

    reply.send({ accessToken });
    request.log.info('refreshHandler response sent');
  } catch (error) {
    request.log.error(error, 'refreshHandler error');
    reply.status(401).send({ message: 'Invalid or expired refresh token' });
  }
}

export async function changePasswordHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    request.log.info('changePasswordHandler started');
    const dto = changePasswordSchema.parse(request.body);
    const userId = request.user.id;
    request.log.info({ userId }, 'changePasswordHandler body parsed');

    request.log.info('changePasswordHandler calling service...');
    await changePassword(request.server.pg, userId, dto);
    request.log.info('changePasswordHandler service done');

    reply.send({ message: 'Password updated successfully' });
    request.log.info('changePasswordHandler response sent');
  } catch (error) {
    request.log.error(error, 'changePasswordHandler error');
    if (error instanceof Error) {
      if (
        error.message === 'User not found' ||
        error.message === 'Current password is incorrect'
      ) {
        reply.status(400).send({ message: error.message });
        return;
      }
    }
    throw error;
  }
}
