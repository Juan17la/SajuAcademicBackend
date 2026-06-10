export interface DbUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  last_login_at: Date | null;
  last_login_ip: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}
