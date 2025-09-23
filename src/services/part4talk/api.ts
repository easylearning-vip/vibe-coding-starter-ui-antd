import { request } from '@umijs/max';

const API_BASE = '/api/v1/admin';

/**
 * Part4Talk 相关的 API 接口
 */

// 获取Part4Talk列表
export interface GetPart4TalkListParams {
  page?: number;
  page_size?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
  sort?: string;
  order?: string;
  scenario_id?: string;
  difficulty_level_id?: string;
}

export interface Part4TalkListResponse {
  data: Part4TalkAPI.Part4Talk[];
  total: number;
  page: number;
  size: number;
}

/**
 * 获取Part4Talk列表
 */
export async function getPart4TalkList(params: GetPart4TalkListParams): Promise<Part4TalkListResponse> {
  return request<Part4TalkListResponse>(`${API_BASE}/part4talks`, {
    method: 'GET',
    params,
  });
}

/**
 * 获取单个Part4Talk详情
 */
export async function getPart4Talk(id: number): Promise<Part4TalkAPI.Part4Talk> {
  return request<Part4TalkAPI.Part4Talk>(`${API_BASE}/part4talks/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建Part4Talk
 */
export async function createPart4Talk(params: Part4TalkAPI.CreatePart4TalkRequest): Promise<Part4TalkAPI.Part4Talk> {
  // Transform data to match backend expectations (sql.NullString and sql.NullInt32 format)
  const transformedData: any = {
    ...params,
    title: params.title ? { String: params.title, Valid: true } : { String: '', Valid: false },
    scenario_id: params.scenario_id ? { Int32: params.scenario_id, Valid: true } : { Int32: 0, Valid: false },
    difficulty_level_id: params.difficulty_level_id ? { Int32: params.difficulty_level_id, Valid: true } : { Int32: 0, Valid: false },
  };

  return request<Part4TalkAPI.Part4Talk>(`${API_BASE}/part4talks`, {
    method: 'POST',
    data: transformedData,
  });
}

/**
 * 更新Part4Talk
 */
export async function updatePart4Talk(id: number, params: Part4TalkAPI.UpdatePart4TalkRequest): Promise<Part4TalkAPI.Part4Talk> {
  // Transform data to match backend expectations (sql.NullString and sql.NullInt32 format)
  const transformedData: any = {};
  
  Object.keys(params).forEach(key => {
    if (key === 'id') return; // Skip id field
    
    const value = (params as any)[key];
    if (key === 'title') {
      transformedData[key] = value ? { String: value, Valid: true } : { String: '', Valid: false };
    } else if (key === 'scenario_id' || key === 'difficulty_level_id') {
      transformedData[key] = value ? { Int32: value, Valid: true } : { Int32: 0, Valid: false };
    } else {
      transformedData[key] = value;
    }
  });

  return request<Part4TalkAPI.Part4Talk>(`${API_BASE}/part4talks/${id}`, {
    method: 'PUT',
    data: transformedData,
  });
}

/**
 * 删除Part4Talk
 */
export async function deletePart4Talk(id: number): Promise<Part4TalkAPI.SuccessResponse> {
  return request<Part4TalkAPI.SuccessResponse>(`${API_BASE}/part4talks/${id}`, {
    method: 'DELETE',
  });
}

// Part4AnswerOption API functions

export interface GetPart4AnswerOptionListParams {
  page?: number;
  page_size?: number;
  search?: string;
  talk_id?: number;
  question_number?: number;
}

export interface Part4AnswerOptionListResponse {
  data: Part4TalkAPI.Part4AnswerOption[];
  total: number;
  page: number;
  size: number;
}

/**
 * 获取Part4AnswerOption列表
 */
export async function getPart4AnswerOptionList(params: GetPart4AnswerOptionListParams): Promise<Part4AnswerOptionListResponse> {
  return request<Part4AnswerOptionListResponse>(`${API_BASE}/part4answeroptions`, {
    method: 'GET',
    params,
  });
}

/**
 * 获取单个Part4AnswerOption详情
 */
export async function getPart4AnswerOption(id: number): Promise<Part4TalkAPI.Part4AnswerOption> {
  return request<Part4TalkAPI.Part4AnswerOption>(`${API_BASE}/part4answeroptions/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建Part4AnswerOption
 */
export async function createPart4AnswerOption(params: Part4TalkAPI.CreatePart4AnswerOptionRequest): Promise<Part4TalkAPI.Part4AnswerOption> {
  // Transform data to match backend expectations
  const transformedData: any = {
    ...params,
    correct_answer: params.correct_answer ? { String: params.correct_answer, Valid: true } : { String: '', Valid: false },
  };

  return request<Part4TalkAPI.Part4AnswerOption>(`${API_BASE}/part4answeroptions`, {
    method: 'POST',
    data: transformedData,
  });
}

/**
 * 更新Part4AnswerOption
 */
export async function updatePart4AnswerOption(id: number, params: Part4TalkAPI.UpdatePart4AnswerOptionRequest): Promise<Part4TalkAPI.Part4AnswerOption> {
  // Transform data to match backend expectations
  const transformedData: any = {};
  
  Object.keys(params).forEach(key => {
    if (key === 'id') return; // Skip id field
    
    const value = (params as any)[key];
    if (key === 'correct_answer') {
      transformedData[key] = value ? { String: value, Valid: true } : { String: '', Valid: false };
    } else {
      transformedData[key] = value;
    }
  });

  return request<Part4TalkAPI.Part4AnswerOption>(`${API_BASE}/part4answeroptions/${id}`, {
    method: 'PUT',
    data: transformedData,
  });
}

/**
 * 删除Part4AnswerOption
 */
export async function deletePart4AnswerOption(id: number): Promise<Part4TalkAPI.SuccessResponse> {
  return request<Part4TalkAPI.SuccessResponse>(`${API_BASE}/part4answeroptions/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 获取指定对话的所有答案选项
 */
export async function getPart4AnswerOptionsByTalk(talkId: number): Promise<Part4TalkAPI.Part4AnswerOption[]> {
  const response = await getPart4AnswerOptionList({
    talk_id: talkId,
    page_size: 100, // Get all options for the talk
  });
  return response.data;
}

/**
 * 批量创建答案选项（为一个对话的3个问题创建选项）
 */
export async function batchCreatePart4AnswerOptions(
  talkId: number,
  options: {
    question1: Omit<Part4TalkAPI.CreatePart4AnswerOptionRequest, 'talk_id' | 'question_number'>;
    question2: Omit<Part4TalkAPI.CreatePart4AnswerOptionRequest, 'talk_id' | 'question_number'>;
    question3: Omit<Part4TalkAPI.CreatePart4AnswerOptionRequest, 'talk_id' | 'question_number'>;
  }
): Promise<Part4TalkAPI.Part4AnswerOption[]> {
  const results = await Promise.all([
    createPart4AnswerOption({ ...options.question1, talk_id: talkId, question_number: 1 }),
    createPart4AnswerOption({ ...options.question2, talk_id: talkId, question_number: 2 }),
    createPart4AnswerOption({ ...options.question3, talk_id: talkId, question_number: 3 }),
  ]);
  return results;
}
