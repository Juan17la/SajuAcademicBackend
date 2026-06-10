export interface AuthUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
}
