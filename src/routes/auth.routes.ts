import type { FastifyInstance } from 'fastify';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  changePasswordHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
} from '../controllers/auth.controller.js';

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', registerHandler);
  app.post('/login', loginHandler);
  app.post('/refresh', refreshHandler);
  app.post('/forgot-password', forgotPasswordHandler);
  app.post('/reset-password', resetPasswordHandler);
  app.post(
    '/change-password',
    { onRequest: [app.authenticate] },
    changePasswordHandler
  );
}
