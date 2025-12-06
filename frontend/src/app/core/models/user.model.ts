export interface User {
  id: string;
  cognitoId: string;
  email: string;
  name: string;
  phoneNumber?: string;
  address?: Address;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  SELLER = 'SELLER',
  COURIER = 'COURIER'
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  phoneNumber?: string;
  address?: Address;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// Auth State
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}