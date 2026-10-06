export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  address: string | null;
  is_active: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  address?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
