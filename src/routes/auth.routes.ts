import type { FastifyInstance } from 'fastify';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  changePasswordHandler,
} from '../controllers/auth.controller.js';

// router definition. In fastify an Instance is like a router in express
export async function authRoutes(app: FastifyInstance) {
  app.post('/register', registerHandler);
  app.post('/login', loginHandler);
  app.post('/refresh', refreshHandler);
  app.post(
    '/change-password',
    { onRequest: [app.authenticate] }, // middleware of auth??
    changePasswordHandler
  );
}
