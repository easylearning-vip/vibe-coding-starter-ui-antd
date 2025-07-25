import { request } from '@umijs/max';

const API_BASE = '/api/v1';

/**
 * User login
 */
export async function login(params: UserAPI.LoginRequest): Promise<UserAPI.LoginResponse> {
  return request<UserAPI.LoginResponse>(`${API_BASE}/users/login`, {
    method: 'POST',
    data: params,
  });
}

/**
 * User registration
 */
export async function register(params: UserAPI.RegisterRequest): Promise<UserAPI.User> {
  return request<UserAPI.User>(`${API_BASE}/users/register`, {
    method: 'POST',
    data: params,
  });
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<UserAPI.User> {
  return request<UserAPI.User>(`${API_BASE}/users/profile`, {
    method: 'GET',
  });
}

/**
 * Update current user profile
 */
export async function updateProfile(params: UserAPI.UpdateProfileRequest): Promise<UserAPI.User> {
  return request<UserAPI.User>(`${API_BASE}/users/profile`, {
    method: 'PUT',
    data: params,
  });
}

/**
 * Change password
 */
export async function changePassword(params: UserAPI.ChangePasswordRequest): Promise<UserAPI.SuccessResponse> {
  return request<UserAPI.SuccessResponse>(`${API_BASE}/users/change-password`, {
    method: 'POST',
    data: params,
  });
}

/**
 * Get user list (admin only)
 */
export async function getUserList(params?: UserAPI.UserListParams): Promise<UserAPI.ListResponse<UserAPI.User>> {
  return request<UserAPI.ListResponse<UserAPI.User>>(`${API_BASE}/users`, {
    method: 'GET',
    params,
  });
}

/**
 * Create user (admin only)
 */
export async function createUser(data: UserAPI.CreateUserRequest): Promise<UserAPI.User> {
  return request<UserAPI.User>(`${API_BASE}/users`, {
    method: 'POST',
    data,
  });
}

/**
 * Update user (admin only)
 */
export async function updateUser(id: number, data: UserAPI.UpdateUserRequest): Promise<UserAPI.User> {
  return request<UserAPI.User>(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    data,
  });
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(id: number): Promise<UserAPI.SuccessResponse> {
  return request<UserAPI.SuccessResponse>(`${API_BASE}/users/${id}`, {
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
