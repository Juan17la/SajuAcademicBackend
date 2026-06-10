# Auth Flow and How It Works

This document explains the authentication and authorization flow in the SajuAcademic backend.

## Overview

The backend uses **JSON Web Tokens (JWT)** for stateless authentication. After a user registers or logs in, the server issues an **access token** and a **refresh token**. The client must send the access token in the `Authorization` header for protected endpoints. When the access token expires, the client can use the refresh token to obtain a new access token without re-entering credentials.

## Architecture

The auth layer is split across four main concerns:

| Concern | Location | Responsibility |
|---------|----------|--------------|
| **Interfaces & Mappers** | `src/packages/auth/` | `AuthUser` interface and `toAuthUser` mapper. |
| **Repository** | `src/repositories/user.repository.ts` | Database queries (find, create, update). No interfaces here. |
| **Service** | `src/services/auth.service.ts` | Business logic (hashing, validation, orchestration). |
| **Controller** | `src/controllers/auth.controller.ts` | HTTP layer (parsing, signing JWTs, sending responses). |
| **Plugin** | `src/plugins/jwt.ts` | JWT registration and `authenticate` decorator. |
| **Routes** | `src/routes/auth.routes.ts` | Route definitions and middleware attachment. |

## Token Types

### Access Token
- **Purpose**: Short-lived credential used to access protected endpoints.
- **Payload**: `{ id: number, email: string }`.
- **Expiry**: Configurable via `JWT_ACCESS_EXPIRES_IN` (default: `15m`).
- **Usage**: Sent by the client as `Authorization: Bearer <accessToken>`.

### Refresh Token
- **Purpose**: Long-lived credential used to obtain a new access token.
- **Payload**: Same as access token (`{ id: number, email: string }`).
- **Expiry**: Configurable via `JWT_REFRESH_EXPIRES_IN` (default: `7d`).
- **Usage**: Sent to `POST /auth/refresh` to receive a new access token.

## Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/auth/register` | No | Creates a new user and returns tokens. |
| `POST` | `/auth/login` | No | Validates credentials and returns tokens. |
| `POST` | `/auth/refresh` | No | Verifies refresh token and returns a new access token. |
| `POST` | `/auth/change-password` | Yes | Updates the user’s password. |

## How It Works (Step by Step)

### 1. Registration

1. Client sends `POST /auth/register` with `name`, `lastname`, `email`, and `password`.
2. `auth.controller.ts` parses the body with `registerSchema`.
3. `auth.service.ts` checks if the email already exists via `user.repository.ts`.
4. If unique, the service hashes the password with `bcrypt`.
5. `user.repository.ts` inserts the user into PostgreSQL.
6. The controller receives the new `AuthUser` (mapped via `toAuthUser`).
7. The controller signs an **access token** and a **refresh token** using `reply.jwtSign(...)`.
8. Both tokens and the user object are returned in the response.

### 2. Login

1. Client sends `POST /auth/login` with `email` and `password`.
2. `auth.controller.ts` parses the body with `loginSchema`.
3. `auth.service.ts` fetches the user by email via `user.repository.ts`.
4. The service compares the provided password with the stored hash using `bcrypt.compare`.
5. If valid, the service updates the `lastLogin` timestamp.
6. The controller signs new access and refresh tokens and returns them with the user.
7. If invalid, a `401 Unauthorized` response is returned.

### 3. Accessing a Protected Endpoint

1. Client sends a request to a protected route (e.g., `POST /auth/change-password`) with `Authorization: Bearer <accessToken>`.
2. The route definition includes `{ onRequest: [app.authenticate] }`.
3. `app.authenticate` (defined in `src/plugins/jwt.ts`) calls `request.jwtVerify()`.
4. `@fastify/jwt` verifies the token signature and expiry against `JWT_SECRET`.
5. If valid, `request.user` is populated with the decoded payload (`{ id, email }`).
6. The controller handler executes and can access `request.user.id` to know who is making the request.
7. If invalid or expired, the server responds with `401 Unauthorized`.

### 4. Refreshing the Access Token

1. Client sends `POST /auth/refresh` with the refresh token in the body.
2. `auth.controller.ts` parses the body with `refreshSchema`.
3. The controller calls `request.server.jwt.verify(refreshToken)`.
4. If valid, the controller extracts `id` and `email` from the decoded payload.
5. A new access token is signed with the same payload and returned.
6. If invalid or expired, the server responds with `401 Unauthorized`.

## The `authenticate` Decorator

Defined in `src/plugins/jwt.ts`:

```ts
app.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch {
    reply.status(401).send({ message: 'Unauthorized' });
  }
});
```

- It is attached to every `FastifyInstance`.
- It can be used as middleware in any route: `{ onRequest: [app.authenticate] }`.
- It populates `request.user` automatically after successful verification.

## Type Augmentations

- `src/types.ts` augments `fastify` to add the `authenticate` property to `FastifyInstance`.
- It also augments `@fastify/jwt` to define the JWT payload shape (`{ id: number; email: string }`).

## Security Notes

- **Passwords are never stored in plain text**. They are hashed with `bcrypt` using `BCRYPT_SALT_ROUNDS` (default: `10`).
- **JWT secrets must be strong and kept private**. The secret is read from `JWT_SECRET` in the environment.
- **Tokens are stateless**. The server does not store them in the database; revocation is not implemented by default.
- **Always use HTTPS** in production to prevent token interception.
- **Do not accept user IDs from the request body** in authenticated endpoints; always rely on `request.user.id`.

## Adding New Auth-Protected Endpoints

See `endpoint-auth-instructions.md` for a practical guide on adding new endpoints that require authentication.
