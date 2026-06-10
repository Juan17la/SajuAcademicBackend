# Instructions to Make More Endpoint Functions That Need Auth

This document provides a step-by-step guide for adding new endpoints that require authentication in the SajuAcademic backend.

## Prerequisites

Before adding a new authenticated endpoint, ensure you understand the existing auth flow (see `auth-flow.md`).

## Steps

### 1. Define the Domain Interface (if needed)

If your new endpoint introduces a new entity or data shape, create or update the interface inside `src/packages/<domain>/`.

- **Example**: If you are adding a `Course` endpoint, create `src/packages/course/course.interface.ts`:
  ```ts
  export interface Course {
    id: number;
    title: string;
    description: string;
    createdAt: Date;
  }
  ```

### 2. Create or Update the Repository

Place database queries inside `src/repositories/<domain>.repository.ts`.

- Do **not** define entity interfaces here; import them from `src/packages/<domain>/`.
- Export only the data-access functions (e.g., `findCourseById`, `createCourse`).

  ```ts
  import type { PostgresDb } from '@fastify/postgres';
  import type { Course } from '../packages/course/course.interface.js';

  export async function findCourseById(pg: PostgresDb, id: number): Promise<Course | undefined> {
    const result = await pg.query<Course>('SELECT * FROM courses WHERE id = $1', [id]);
    return result.rows[0];
  }
  ```

### 3. Create or Update the Service

Place business logic inside `src/services/<domain>.service.ts`.

- Import repository functions and any domain interfaces/mappers from `src/packages/`.
- Keep the service file focused on **service functions only** (no interfaces, no mappers).

  ```ts
  import type { PostgresDb } from '@fastify/postgres';
  import { findCourseById } from '../repositories/course.repository.js';
  import type { Course } from '../packages/course/course.interface.js';

  export async function getCourse(pg: PostgresDb, courseId: number): Promise<Course> {
    const course = await findCourseById(pg, courseId);
    if (!course) {
      throw new Error('Course not found');
    }
    return course;
  }
  ```

### 4. Add the Controller Handler

Place the HTTP handler inside `src/controllers/<domain>.controller.ts`.

- Use `request.user` to access the authenticated user’s payload (e.g., `request.user.id`).
- Apply `request.server.pg` to pass the database client to the service.

  ```ts
  import type { FastifyRequest, FastifyReply } from 'fastify';
  import { getCourse } from '../services/course.service.js';

  export async function getCourseHandler(request: FastifyRequest, reply: FastifyReply) {
    const courseId = Number((request.params as { id: string }).id);
    const course = await getCourse(request.server.pg, courseId);
    reply.send(course);
  }
  ```

### 5. Register the Route with Auth Middleware

Inside `src/routes/<domain>.routes.ts`, attach the `authenticate` hook to any route that needs auth.

  ```ts
  import type { FastifyInstance } from 'fastify';
  import { getCourseHandler } from '../controllers/course.controller.js';

  export async function courseRoutes(app: FastifyInstance) {
    app.get('/:id', { onRequest: [app.authenticate] }, getCourseHandler);
  }
  ```

### 6. Wire the Route into the Application

In `src/index.ts`, register the new router under the desired prefix:

  ```ts
  import { courseRoutes } from './routes/course.routes.js';
  // ...
  await app.register(courseRoutes, { prefix: '/courses' });
  ```

### 7. Add Validation Schema (Optional but Recommended)

If the endpoint receives a body or query parameters, define a Zod schema in `src/schemas/<domain>.schema.ts` and use it in the controller to parse `request.body` or `request.params`.

  ```ts
  import { z } from 'zod';

  export const createCourseSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  });

  export type CreateCourseDto = z.infer<typeof createCourseSchema>;
  ```

## Quick Checklist

- [ ] Domain interface created/updated in `src/packages/<domain>/`.
- [ ] Repository created/updated in `src/repositories/` with **no inline interfaces**.
- [ ] Service created/updated in `src/services/` with **only functions**.
- [ ] Controller handler created/updated in `src/controllers/`.
- [ ] Route registered with `{ onRequest: [app.authenticate] }`.
- [ ] Route wired in `src/index.ts`.
- [ ] Validation schema added (if needed).

## Tips

- Always reuse `request.user.id` for user-scoped resources instead of accepting a user ID from the client body.
- Return consistent error messages so the client can handle `4xx` responses predictably.
- Keep the `docs` package updated if you introduce new auth patterns or middleware.