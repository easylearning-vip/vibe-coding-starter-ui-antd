declare namespace UserAPI {
  // User model from API
  interface User {
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
  interface PublicUser {
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
  interface LoginRequest {
    username: string;
    password: string;
  }

  // Login response
  interface LoginResponse {
    token: string;
    user: PublicUser;
  }

  // Register request
  interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    nickname?: string;
  }

  // Update profile request
  interface UpdateProfileRequest {
    username?: string;
    nickname?: string;
    avatar?: string;
  }

  // Change password request
  interface ChangePasswordRequest {
    old_password: string;
    new_password: string;
  }

  // List response wrapper
  interface ListResponse<T> {
    data: T[];
    page: number;
    size: number;
    total: number;
  }

  // Error response
  interface ErrorResponse {
    error: string;
    message: string;
  }

  // Success response
  interface SuccessResponse {
    message: string;
  }

  // User list query params
  interface UserListParams {
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
  interface CreateUserRequest {
    username: string;
    email: string;
    password: string;
    nickname?: string;
    role: string; // 使用数据字典
    status: string; // 使用数据字典
  }

  // Update user request (admin only)
  interface UpdateUserRequest {
    username?: string;
    email?: string;
    nickname?: string;
    role?: string; // 使用数据字典
    status?: string; // 使用数据字典
  }
}
