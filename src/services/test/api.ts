import { request } from '@umijs/max';

const API_BASE = '/api/v1/admin';

/**
 * Test 相关的 API 接口
 */

// 获取Test列表
export interface GetTestListParams {
  page?: number;
  page_size?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
  sort?: string;
  order?: string;
}

export interface TestListResponse {
  data: TestAPI.Test[];
  total: number;
  page: number;
  size: number;
}

/**
 * 获取Test列表
 */
export async function getTestList(params: GetTestListParams): Promise<TestListResponse> {
  return request<TestListResponse>(`${API_BASE}/tests`, {
    method: 'GET',
    params,
  });
}

/**
 * 获取单个Test详情
 */
export async function getTest(id: number): Promise<TestAPI.Test> {
  return request<TestAPI.Test>(`${API_BASE}/tests/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建Test
 */
export async function createTest(params: TestAPI.CreateTestRequest): Promise<TestAPI.Test> {
  return request<TestAPI.Test>(`${API_BASE}/tests`, {
    method: 'POST',
    data: params,
  });
}

/**
 * 更新Test
 */
export async function updateTest(id: number, params: TestAPI.UpdateTestRequest): Promise<TestAPI.Test> {
  return request<TestAPI.Test>(`${API_BASE}/tests/${id}`, {
    method: 'PUT',
    data: params,
  });
}

/**
 * 删除Test
 */
export async function deleteTest(id: number): Promise<TestAPI.SuccessResponse> {
  return request<TestAPI.SuccessResponse>(`${API_BASE}/tests/${id}`, {
    method: 'DELETE',
  });
}
