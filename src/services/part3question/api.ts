import { request } from '@umijs/max';

const API_BASE = '/api/v1/admin';

/**
 * Part3Question 相关的 API 接口
 */

// 获取Part3Conversation列表
export interface GetPart3ConversationListParams {
  page?: number;
  page_size?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
  sort?: string;
  order?: string;
  scenario_id?: string;
  difficulty_level_id?: string;
  test_id?: number;
  include_answer_options?: boolean;
}

export interface Part3ConversationListResponse {
  data: Part3QuestionAPI.Part3Conversation[];
  total: number;
  page: number;
  size: number;
}

/**
 * 获取Part3Conversation列表
 */
export async function getPart3ConversationList(params: GetPart3ConversationListParams): Promise<Part3ConversationListResponse> {
  return request<Part3ConversationListResponse>(`${API_BASE}/part3conversations`, {
    method: 'GET',
    params,
  });
}

/**
 * 获取单个Part3Conversation详情
 */
export async function getPart3Conversation(id: number): Promise<Part3QuestionAPI.Part3Conversation> {
  return request<Part3QuestionAPI.Part3Conversation>(`${API_BASE}/part3conversations/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建Part3Conversation
 */
export async function createPart3Conversation(params: Part3QuestionAPI.CreatePart3ConversationRequest): Promise<Part3QuestionAPI.Part3Conversation> {
  // Transform data to match backend expectations (sql.NullString and sql.NullInt32 format)
  const transformedData = {
    test_id: params.test_id,
    conversation_number: params.conversation_number,
    title: params.title ? { String: params.title, Valid: true } : { String: '', Valid: false },
    content: params.content,
    question1: params.question1,
    question2: params.question2,
    question3: params.question3,
    scenario_id: params.scenario_id ? { Int32: params.scenario_id, Valid: true } : { Int32: 0, Valid: false },
    difficulty_level_id: params.difficulty_level_id ? { Int32: params.difficulty_level_id, Valid: true } : { Int32: 0, Valid: false },
  };

  return request<Part3QuestionAPI.Part3Conversation>(`${API_BASE}/part3conversations`, {
    method: 'POST',
    data: transformedData,
  });
}

/**
 * 更新Part3Conversation
 */
export async function updatePart3Conversation(id: number, params: Part3QuestionAPI.UpdatePart3ConversationRequest): Promise<Part3QuestionAPI.Part3Conversation> {
  // Transform data to match backend expectations (sql.NullString and sql.NullInt32 format)
  const transformedData: any = {};

  if (params.test_id !== undefined) transformedData.test_id = params.test_id;
  if (params.conversation_number !== undefined) transformedData.conversation_number = params.conversation_number;
  if (params.title !== undefined) transformedData.title = params.title ? { String: params.title, Valid: true } : { String: '', Valid: false };
  if (params.content !== undefined) transformedData.content = params.content;
  if (params.question1 !== undefined) transformedData.question1 = params.question1;
  if (params.question2 !== undefined) transformedData.question2 = params.question2;
  if (params.question3 !== undefined) transformedData.question3 = params.question3;
  if (params.scenario_id !== undefined) transformedData.scenario_id = params.scenario_id ? { Int32: params.scenario_id, Valid: true } : { Int32: 0, Valid: false };
  if (params.difficulty_level_id !== undefined) transformedData.difficulty_level_id = params.difficulty_level_id ? { Int32: params.difficulty_level_id, Valid: true } : { Int32: 0, Valid: false };

  return request<Part3QuestionAPI.Part3Conversation>(`${API_BASE}/part3conversations/${id}`, {
    method: 'PUT',
    data: transformedData,
  });
}

/**
 * 删除Part3Conversation
 */
export async function deletePart3Conversation(id: number): Promise<Part3QuestionAPI.SuccessResponse> {
  return request<Part3QuestionAPI.SuccessResponse>(`${API_BASE}/part3conversations/${id}`, {
    method: 'DELETE',
  });
}

// Part3AnswerOption API functions

export interface GetPart3AnswerOptionListParams {
  page?: number;
  page_size?: number;
  search?: string;
  conversation_id?: number;
  question_number?: number;
}

export interface Part3AnswerOptionListResponse {
  data: Part3QuestionAPI.Part3AnswerOption[];
  total: number;
  page: number;
  size: number;
}

/**
 * 获取Part3AnswerOption列表
 */
export async function getPart3AnswerOptionList(params: GetPart3AnswerOptionListParams): Promise<Part3AnswerOptionListResponse> {
  return request<Part3AnswerOptionListResponse>(`${API_BASE}/part3answeroptions`, {
    method: 'GET',
    params,
  });
}

/**
 * 获取单个Part3AnswerOption详情
 */
export async function getPart3AnswerOption(id: number): Promise<Part3QuestionAPI.Part3AnswerOption> {
  return request<Part3QuestionAPI.Part3AnswerOption>(`${API_BASE}/part3answeroptions/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建Part3AnswerOption
 */
export async function createPart3AnswerOption(params: Part3QuestionAPI.CreatePart3AnswerOptionRequest): Promise<Part3QuestionAPI.Part3AnswerOption> {
  return request<Part3QuestionAPI.Part3AnswerOption>(`${API_BASE}/part3answeroptions`, {
    method: 'POST',
    data: params,
  });
}

/**
 * 更新Part3AnswerOption
 */
export async function updatePart3AnswerOption(id: number, params: Part3QuestionAPI.UpdatePart3AnswerOptionRequest): Promise<Part3QuestionAPI.Part3AnswerOption> {
  return request<Part3QuestionAPI.Part3AnswerOption>(`${API_BASE}/part3answeroptions/${id}`, {
    method: 'PUT',
    data: params,
  });
}

/**
 * 删除Part3AnswerOption
 */
export async function deletePart3AnswerOption(id: number): Promise<Part3QuestionAPI.SuccessResponse> {
  return request<Part3QuestionAPI.SuccessResponse>(`${API_BASE}/part3answeroptions/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 获取指定对话的所有答案选项
 */
export async function getPart3AnswerOptionsByConversation(conversationId: number): Promise<Part3QuestionAPI.Part3AnswerOption[]> {
  const response = await getPart3AnswerOptionList({
    conversation_id: conversationId,
    page_size: 100, // Get all options for the conversation
  });
  return response.data;
}

/**
 * 批量创建答案选项（为一个对话的3个问题创建选项）
 */
export async function batchCreatePart3AnswerOptions(
  conversationId: number,
  options: {
    question1: Omit<Part3QuestionAPI.CreatePart3AnswerOptionRequest, 'conversation_id' | 'question_number'>;
    question2: Omit<Part3QuestionAPI.CreatePart3AnswerOptionRequest, 'conversation_id' | 'question_number'>;
    question3: Omit<Part3QuestionAPI.CreatePart3AnswerOptionRequest, 'conversation_id' | 'question_number'>;
  }
): Promise<Part3QuestionAPI.Part3AnswerOption[]> {
  const results = await Promise.all([
    createPart3AnswerOption({ ...options.question1, conversation_id: conversationId, question_number: 1 }),
    createPart3AnswerOption({ ...options.question2, conversation_id: conversationId, question_number: 2 }),
    createPart3AnswerOption({ ...options.question3, conversation_id: conversationId, question_number: 3 }),
  ]);
  return results;
}
