import { request } from '@umijs/max';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
  SuccessResponse,
  UserListParams,
  ListResponse,
  CreateUserRequest,
  UpdateUserRequest,
} from './typings';

const API_BASE = '/api/v1';

/**
 * User login
 */
export async function login(params: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>(`${API_BASE}/users/login`, {
    method: 'POST',
    data: params,
  });
}

/**
 * User registration
 */
export async function register(params: RegisterRequest): Promise<User> {
  return request<User>(`${API_BASE}/users/register`, {
    method: 'POST',
    data: params,
  });
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<User> {
  return request<User>(`${API_BASE}/users/profile`, {
    method: 'GET',
  });
}

/**
 * Update current user profile
 */
export async function updateProfile(params: UpdateProfileRequest): Promise<User> {
  return request<User>(`${API_BASE}/users/profile`, {
    method: 'PUT',
    data: params,
  });
}

/**
 * Change password
 */
export async function changePassword(params: ChangePasswordRequest): Promise<SuccessResponse> {
  return request<SuccessResponse>(`${API_BASE}/users/change-password`, {
    method: 'POST',
    data: params,
  });
}

/**
 * Get user list (admin only)
 */
export async function getUserList(params?: UserListParams): Promise<ListResponse<User>> {
  return request<ListResponse<User>>(`${API_BASE}/users`, {
    method: 'GET',
    params,
  });
}

/**
 * Create user (admin only)
 */
export async function createUser(data: CreateUserRequest): Promise<User> {
  return request<User>(`${API_BASE}/users`, {
    method: 'POST',
    data,
  });
}

/**
 * Update user (admin only)
 */
export async function updateUser(id: number, data: UpdateUserRequest): Promise<User> {
  return request<User>(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    data,
  });
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(id: number): Promise<SuccessResponse> {
  return request<SuccessResponse>(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Logout (clear local token)
 */
export async function logout(): Promise<void> {
  // Clear token from localStorage
  localStorage.removeItem('token');
  // Clear token from sessionStorage if used
  sessionStorage.removeItem('token');
}
