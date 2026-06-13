export const ROLE = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

export interface AuthUser {
  email: string;
  role: Role;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// export interface LoginResponse extends AuthSession {}
export type LoginResponse = AuthSession;
