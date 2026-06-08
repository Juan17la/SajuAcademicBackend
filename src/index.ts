import Fastify from 'fastify';
import postgres from '@fastify/postgres';
import { config } from './config.js';
import { registerJwtPlugin } from './plugins/jwt.js';
import { authRoutes } from './routes/auth.routes.js';

const app = Fastify({
  logger: true,
});

async function start() {
  try {
    // connection with db
    await app.register(postgres, {
      connectionString: config.DATABASE_URL,
      max: 10,
      connectionTimeoutMillis: 10000,
      query_timeout: 15000,
    });

    // like an use of express, adding jwt
    await registerJwtPlugin(app);

    // use of auth router
    await app.register(authRoutes, { prefix: '/auth' });

    // healthcheck endpoint (also tests DB connectivity)
    app.get('/health', async (request, reply) => {
      request.log.info('healthcheck called');
      await request.server.pg.query('SELECT 1');
      request.log.info('healthcheck db ok');
      reply.send({ status: 'ok', db: 'connected' });
    });

    // starts the server
    await app.listen({ port: Number(config.PORT) });
  } catch (err) {
    app.log.error(err); // errors logger
    process.exit(1); //finish it :p
  }
}

start();
