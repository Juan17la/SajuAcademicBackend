import type { AuthUser } from './auth.interface.js';

export function toAuthUser(dbUser: {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
}): AuthUser {
  return {
    id: dbUser.id,
    first_name: dbUser.first_name,
    last_name: dbUser.last_name,
    email: dbUser.email,
    created_at: dbUser.created_at,
    updated_at: dbUser.updated_at,
    last_login_at: dbUser.last_login_at,
  };
}
