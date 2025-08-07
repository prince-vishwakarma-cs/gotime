export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}
export interface UserResponse {
  success: boolean;
  message?: string;
  user: User;
}
export interface MessageResponse {
  success: boolean;
  message?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface UpdateProfileData {
  name: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountData {
  password: string;
}