// User model from API
export interface User {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  role: string; // 使用数据字典，不再硬编码角色值
  status: string; // 使用数据字典，不再硬编码状态值
  created_at: string;
  updated_at: string;
  last_login?: string;
}

// Public user model (without sensitive info)
export interface PublicUser {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  role: string; // 使用数据字典
  status: string; // 使用数据字典
  created_at: string;
  updated_at: string;
  last_login?: string;
}

// Login request
export interface LoginRequest {
  username: string;
  password: string;
}

// Login response
export interface LoginResponse {
  token: string;
  user: PublicUser;
}

// Register request
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}

// Update profile request
export interface UpdateProfileRequest {
  username?: string;
  nickname?: string;
  avatar?: string;
}

// Change password request
export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

// List response wrapper
export interface ListResponse<T> {
  data: T[];
  page: number;
  size: number;
  total: number;
}

// Error response
export interface ErrorResponse {
  error: string;
  message: string;
}

// Success response
export interface SuccessResponse {
  message: string;
}

// User list query params
export interface UserListParams {
  page?: number;
  page_size?: number;
  search?: string;
  role?: string; // 使用数据字典
  status?: string; // 使用数据字典
  start_date?: string;
  end_date?: string;
  sort?: string;
  order?: string;
}

// Create user request (admin only)
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  nickname?: string;
  role: string; // 使用数据字典
  status: string; // 使用数据字典
}

// Update user request (admin only)
export interface UpdateUserRequest {
  username?: string;
  email?: string;
  nickname?: string;
  role?: string; // 使用数据字典
  status?: string; // 使用数据字典
}
