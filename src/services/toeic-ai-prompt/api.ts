import { request } from '@umijs/max';
import type {
  ToeicAiPrompt,
  CreateToeicAiPromptRequest,
  UpdateToeicAiPromptRequest,
  ToeicAiPromptListResponse,
  ToeicAiPromptListParams,
} from './typings';

const API_PREFIX = '/api/v1/admin/toeic-ai-prompts';

/**
 * 获取TOEIC AI提示词列表
 */
export async function getToeicAiPromptList(params?: ToeicAiPromptListParams) {
  return request<ToeicAiPromptListResponse>(`${API_PREFIX}`, {
    method: 'GET',
    params,
  });
}

/**
 * 根据ID获取TOEIC AI提示词详情
 */
export async function getToeicAiPromptById(id: number) {
  return request<ToeicAiPrompt>(`${API_PREFIX}/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建TOEIC AI提示词
 */
export async function createToeicAiPrompt(data: CreateToeicAiPromptRequest) {
  return request<ToeicAiPrompt>(`${API_PREFIX}`, {
    method: 'POST',
    data,
  });
}

/**
 * 更新TOEIC AI提示词
 */
export async function updateToeicAiPrompt(id: number, data: UpdateToeicAiPromptRequest) {
  return request<ToeicAiPrompt>(`${API_PREFIX}/${id}`, {
    method: 'PUT',
    data,
  });
}

/**
 * 删除TOEIC AI提示词
 */
export async function deleteToeicAiPrompt(id: number) {
  return request(`${API_PREFIX}/${id}`, {
    method: 'DELETE',
  });
}
