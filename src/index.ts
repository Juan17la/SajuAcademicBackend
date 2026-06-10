import Fastify from 'fastify';
import postgres from '@fastify/postgres';
import { config } from './config.js';
import { registerJwtPlugin } from './plugins/jwt.js';
import { registerErrorHandler } from './utils/error-handler.js';
import { authRoutes } from './routes/auth.routes.js';
import { classRoutes } from './routes/class.routes.js';
import { studentRoutes, studentDetailRoutes } from './routes/student.routes.js';
import { activityRoutes, activityDetailRoutes } from './routes/activity.routes.js';
import { aiRoutes } from './routes/ai.routes.js';
import { scoreClassRoutes, scoreActivityRoutes, scoreStudentRoutes } from './routes/score.routes.js';
import { attendanceSessionRoutes, attendanceSessionDetailRoutes, attendanceRecordRoutes, attendanceRecordDetailRoutes } from './routes/attendance.routes.js';
import { extraPointsRoutes, extraPointsDetailRoutes } from './routes/extra-points.routes.js';
import { dashboardRoutes } from './routes/dashboard.routes.js';
import { exportRoutes } from './routes/export.routes.js';

const app = Fastify({
  logger: true,
});

async function start() {
  try {
    // Database connection
    await app.register(postgres, {
      connectionString: config.DATABASE_URL,
      max: 10,
      connectionTimeoutMillis: 10000,
      query_timeout: 15000,
    });

    // JWT authentication
    await registerJwtPlugin(app);

    // Global error handler
    registerErrorHandler(app);

    // Auth routes
    await app.register(authRoutes, { prefix: '/v1/auth' });

    // Class routes
    await app.register(classRoutes, { prefix: '/v1/classes' });

    // Student routes (nested and direct)
    await app.register(studentRoutes, { prefix: '/v1/classes/:classId/students' });
    await app.register(studentDetailRoutes, { prefix: '/v1/students' });

    // Activity routes (nested and direct)
    await app.register(activityRoutes, { prefix: '/v1/classes/:classId/activities' });
    await app.register(activityDetailRoutes, { prefix: '/v1/activities' });

    // AI routes (direct)
    await app.register(aiRoutes, { prefix: '/v1/activities' });

    // Score routes (nested and direct)
    await app.register(scoreClassRoutes, { prefix: '/v1/classes/:classId/scores' });
    await app.register(scoreActivityRoutes, { prefix: '/v1/activities/:activityId/scores' });
    await app.register(scoreStudentRoutes, { prefix: '/v1/students/:studentId/scores' });

    // Attendance routes (nested and direct)
    await app.register(attendanceSessionRoutes, { prefix: '/v1/classes/:classId/attendance-sessions' });
    await app.register(attendanceSessionDetailRoutes, { prefix: '/v1/attendance-sessions' });
    await app.register(attendanceRecordRoutes, { prefix: '/v1/classes/:classId/attendance-records' });
    await app.register(attendanceRecordDetailRoutes, { prefix: '/v1/attendance-records' });

    // Extra points routes (nested and direct)
    await app.register(extraPointsRoutes, { prefix: '/v1/classes/:classId/extra-points' });
    await app.register(extraPointsDetailRoutes, { prefix: '/v1/extra-points' });

    // Dashboard routes (nested)
    await app.register(dashboardRoutes, { prefix: '/v1/classes/:classId/dashboard' });

    // Export routes (nested)
    await app.register(exportRoutes, { prefix: '/v1/classes/:classId/export' });

    // Healthcheck endpoint
    app.get('/health', async (request, reply) => {
      request.log.info('healthcheck called');
      await request.server.pg.query('SELECT 1');
      request.log.info('healthcheck db ok');
      reply.send({ status: 'ok', db: 'connected' });
    });

    // Start server
    await app.listen({ port: Number(config.PORT) });
    app.log.info(`Server running on port ${config.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
