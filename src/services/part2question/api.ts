import { request } from '@umijs/max';

const API_BASE = '/api/v1/admin';

/**
 * Part2Question 相关的 API 接口
 */

// 获取Part2Question列表
export interface GetPart2QuestionListParams {
  page?: number;
  page_size?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
  sort?: string;
  order?: string;
}

export interface Part2QuestionListResponse {
  data: Part2QuestionAPI.Part2Question[];
  total: number;
  page: number;
  size: number;
}

/**
 * 获取Part2Question列表
 */
export async function getPart2QuestionList(params: GetPart2QuestionListParams): Promise<Part2QuestionListResponse> {
  return request<Part2QuestionListResponse>(`${API_BASE}/part2questions`, {
    method: 'GET',
    params,
  });
}

/**
 * 获取单个Part2Question详情
 */
export async function getPart2Question(id: number): Promise<Part2QuestionAPI.Part2Question> {
  return request<Part2QuestionAPI.Part2Question>(`${API_BASE}/part2questions/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建Part2Question
 */
export async function createPart2Question(params: Part2QuestionAPI.CreatePart2QuestionRequest): Promise<Part2QuestionAPI.Part2Question> {
  return request<Part2QuestionAPI.Part2Question>(`${API_BASE}/part2questions`, {
    method: 'POST',
    data: params,
  });
}

/**
 * 更新Part2Question
 */
export async function updatePart2Question(id: number, params: Part2QuestionAPI.UpdatePart2QuestionRequest): Promise<Part2QuestionAPI.Part2Question> {
  return request<Part2QuestionAPI.Part2Question>(`${API_BASE}/part2questions/${id}`, {
    method: 'PUT',
    data: params,
  });
}

/**
 * 删除Part2Question
 */
export async function deletePart2Question(id: number): Promise<Part2QuestionAPI.SuccessResponse> {
  return request<Part2QuestionAPI.SuccessResponse>(`${API_BASE}/part2questions/${id}`, {
    method: 'DELETE',
  });
}
