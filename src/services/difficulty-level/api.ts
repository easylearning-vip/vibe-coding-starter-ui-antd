import { request } from '@umijs/max';

const API_BASE = '/api/v1/admin';

/**
 * DifficultyLevel 相关的 API 接口
 */

// 获取DifficultyLevel列表
export interface GetDifficultyLevelListParams {
  page?: number;
  page_size?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
  sort?: string;
  order?: string;
}

export interface DifficultyLevelListResponse {
  data: DifficultyLevelAPI.DifficultyLevel[];
  total: number;
  page: number;
  size: number;
}

/**
 * 获取DifficultyLevel列表
 */
export async function getDifficultyLevelList(params: GetDifficultyLevelListParams): Promise<DifficultyLevelListResponse> {
  return request<DifficultyLevelListResponse>(`${API_BASE}/difficultylevels`, {
    method: 'GET',
    params,
  });
}

/**
 * 获取单个DifficultyLevel详情
 */
export async function getDifficultyLevel(id: number): Promise<DifficultyLevelAPI.DifficultyLevel> {
  return request<DifficultyLevelAPI.DifficultyLevel>(`${API_BASE}/difficultylevels/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建DifficultyLevel
 */
export async function createDifficultyLevel(params: DifficultyLevelAPI.CreateDifficultyLevelRequest): Promise<DifficultyLevelAPI.DifficultyLevel> {
  return request<DifficultyLevelAPI.DifficultyLevel>(`${API_BASE}/difficultylevels`, {
    method: 'POST',
    data: params,
  });
}

/**
 * 更新DifficultyLevel
 */
export async function updateDifficultyLevel(id: number, params: DifficultyLevelAPI.UpdateDifficultyLevelRequest): Promise<DifficultyLevelAPI.DifficultyLevel> {
  return request<DifficultyLevelAPI.DifficultyLevel>(`${API_BASE}/difficultylevels/${id}`, {
    method: 'PUT',
    data: params,
  });
}

/**
 * 删除DifficultyLevel
 */
export async function deleteDifficultyLevel(id: number): Promise<DifficultyLevelAPI.SuccessResponse> {
  return request<DifficultyLevelAPI.SuccessResponse>(`${API_BASE}/difficultylevels/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 获取所有DifficultyLevel选项（用于下拉框）
 * 使用非admin路径，所有认证用户都可以访问
 */
export async function getDifficultyLevelOptions(): Promise<DifficultyLevelAPI.DifficultyLevel[]> {
  const response = await request<DifficultyLevelListResponse>(`/api/v1/difficultylevels`, {
    method: 'GET',
    params: {
      page: 1,
      page_size: 1000, // 获取所有选项
    },
  });
  return response.data;
}
