import { request } from '@umijs/max';

const API_PREFIX = '/api/v1/user/part4-practice-sets';
const ITEM_API_PREFIX = '/api/v1/user/part4-practice-set-items';

export async function createPracticeSet(data: Part4PracticeSetAPI.CreatePracticeSetRequest) {
  return request<Part4PracticeSetAPI.Part4PracticeSet>(API_PREFIX, {
    method: 'POST',
    data,
  });
}

export async function autoGeneratePracticeSet(data: Part4PracticeSetAPI.GeneratePracticeSetRequest) {
  return request<{
    set: Part4PracticeSetAPI.Part4PracticeSet;
    items: Part4PracticeSetAPI.Part4PracticeSetItem[];
  }>(`${API_PREFIX}/auto-generate`, {
    method: 'POST',
    data,
  });
}

export async function getPracticeSetList(params: {
  page?: number;
  page_size?: number;
  scenario_id?: number;
  difficulty_level_id?: number;
  sort?: string;
  order?: string;
}) {
  return request<{
    data: Part4PracticeSetAPI.Part4PracticeSet[];
    total: number;
    page: number;
    size: number;
  }>(API_PREFIX, {
    method: 'GET',
    params,
  });
}

export async function getPracticeSetById(id: number) {
  return request<Part4PracticeSetAPI.Part4PracticeSet>(`${API_PREFIX}/${id}`, {
    method: 'GET',
  });
}

export async function updatePracticeSet(id: number, data: Part4PracticeSetAPI.UpdatePracticeSetRequest) {
  return request<Part4PracticeSetAPI.Part4PracticeSet>(`${API_PREFIX}/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deletePracticeSet(id: number) {
  return request(`${API_PREFIX}/${id}`, {
    method: 'DELETE',
  });
}

export async function getPracticeSetQuestions(id: number) {
  return request<Part4PracticeSetAPI.Part4QuestionDetail[]>(`${API_PREFIX}/${id}/questions`, {
    method: 'GET',
  });
}

export async function addQuestionsToPracticeSet(id: number, data: { question_ids: number[] }) {
  return request(`${API_PREFIX}/${id}/questions`, {
    method: 'POST',
    data,
  });
}

// Practice Set Items
export async function createPracticeSetItem(data: Part4PracticeSetAPI.CreatePart4SetItemRequest) {
  return request<Part4PracticeSetAPI.Part4PracticeSetItem>(ITEM_API_PREFIX, {
    method: 'POST',
    data,
  });
}

export async function getPracticeSetItems(params: {
  set_id: number;
  page?: number;
  page_size?: number;
  sort?: string;
  order?: string;
}) {
  return request<{
    data: Part4PracticeSetAPI.Part4PracticeSetItem[];
    total: number;
    page: number;
    size: number;
  }>(ITEM_API_PREFIX, {
    method: 'GET',
    params,
  });
}

export async function getPracticeSetItemDetail(id: number) {
  return request<Part4PracticeSetAPI.Part4QuestionDetail>(`${ITEM_API_PREFIX}/${id}/detail`, {
    method: 'GET',
  });
}

export async function submitAnswer(id: number, data: Part4PracticeSetAPI.SubmitPart4AnswerRequest) {
  return request(`${ITEM_API_PREFIX}/${id}/answer`, {
    method: 'POST',
    data,
  });
}

export async function deletePracticeSetItem(id: number) {
  return request(`${ITEM_API_PREFIX}/${id}`, {
    method: 'DELETE',
  });
}
