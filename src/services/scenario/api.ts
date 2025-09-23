import { request } from '@umijs/max';

const API_BASE = '/api/v1/admin';

/**
 * Scenario 相关的 API 接口
 */

// 获取Scenario列表
export interface GetScenarioListParams {
  page?: number;
  page_size?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
  sort?: string;
  order?: string;
}

export interface ScenarioListResponse {
  data: ScenarioAPI.Scenario[];
  total: number;
  page: number;
  size: number;
}

/**
 * 获取Scenario列表
 */
export async function getScenarioList(params: GetScenarioListParams): Promise<ScenarioListResponse> {
  return request<ScenarioListResponse>(`${API_BASE}/scenarios`, {
    method: 'GET',
    params,
  });
}

/**
 * 获取单个Scenario详情
 */
export async function getScenario(id: number): Promise<ScenarioAPI.Scenario> {
  return request<ScenarioAPI.Scenario>(`${API_BASE}/scenarios/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建Scenario
 */
export async function createScenario(params: ScenarioAPI.CreateScenarioRequest): Promise<ScenarioAPI.Scenario> {
  return request<ScenarioAPI.Scenario>(`${API_BASE}/scenarios`, {
    method: 'POST',
    data: params,
  });
}

/**
 * 更新Scenario
 */
export async function updateScenario(id: number, params: ScenarioAPI.UpdateScenarioRequest): Promise<ScenarioAPI.Scenario> {
  return request<ScenarioAPI.Scenario>(`${API_BASE}/scenarios/${id}`, {
    method: 'PUT',
    data: params,
  });
}

/**
 * 删除Scenario
 */
export async function deleteScenario(id: number): Promise<ScenarioAPI.SuccessResponse> {
  return request<ScenarioAPI.SuccessResponse>(`${API_BASE}/scenarios/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 获取所有Scenario选项（用于下拉框）
 */
export async function getScenarioOptions(): Promise<ScenarioAPI.Scenario[]> {
  const response = await request<ScenarioListResponse>(`${API_BASE}/scenarios`, {
    method: 'GET',
    params: {
      page: 1,
      page_size: 1000, // 获取所有选项
    },
  });
  return response.data;
}
