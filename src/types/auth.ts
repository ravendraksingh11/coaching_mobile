export type UserRole =
  | "SUPER_ADMIN"
  | "INSTITUTE_ADMIN"
  | "STUDENT"
  | "TEACHER"
  | "PARENT";

export interface AuthUser {
  id?: string;
  userId?: string;
  name: string;
  email?: string;
  role: UserRole;
  instituteName?: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: AuthUser;
  };
  message?: string;
}
