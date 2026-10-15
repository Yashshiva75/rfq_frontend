export type UserRole = "buyer" | "vendor" | "admin" | "user";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole | string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface ApiResponse<T = any> {
  status: "success" | "error";
  data?: T;
  message?: string;
  errors?: any;
}

export interface AuthResponseData {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}
