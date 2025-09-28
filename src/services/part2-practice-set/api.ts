import { request } from '@umijs/max';

const API_PREFIX = '/api/v1/user/part2-practice-sets';
const ITEM_API_PREFIX = '/api/v1/user/part2-practice-set-items';

export async function createPracticeSet(data: Part2PracticeSetAPI.CreatePracticeSetRequest) {
  return request<Part2PracticeSetAPI.Part2PracticeSet>(API_PREFIX, {
    method: 'POST',
    data,
  });
}

export async function autoGeneratePracticeSet(data: Part2PracticeSetAPI.GeneratePracticeSetRequest) {
  return request<{
    set: Part2PracticeSetAPI.Part2PracticeSet;
    items: Part2PracticeSetAPI.Part2PracticeSetItem[];
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
    data: Part2PracticeSetAPI.Part2PracticeSet[];
    total: number;
    page: number;
    size: number;
  }>(API_PREFIX, {
    method: 'GET',
    params,
  });
}

export async function getPracticeSetById(id: number) {
  return request<Part2PracticeSetAPI.Part2PracticeSet>(`${API_PREFIX}/${id}`, {
    method: 'GET',
  });
}

export async function updatePracticeSet(id: number, data: Part2PracticeSetAPI.UpdatePracticeSetRequest) {
  return request<Part2PracticeSetAPI.Part2PracticeSet>(`${API_PREFIX}/${id}`, {
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
  return request<Part2PracticeSetAPI.Part2QuestionDetail[]>(`${API_PREFIX}/${id}/questions`, {
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
export async function createPracticeSetItem(data: Part2PracticeSetAPI.CreatePart2SetItemRequest) {
  return request<Part2PracticeSetAPI.Part2PracticeSetItem>(ITEM_API_PREFIX, {
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
    data: Part2PracticeSetAPI.Part2PracticeSetItem[];
    total: number;
    page: number;
    size: number;
  }>(ITEM_API_PREFIX, {
    method: 'GET',
    params,
  });
}

export async function getPracticeSetItemDetail(id: number) {
  return request<Part2PracticeSetAPI.Part2QuestionDetail>(`${ITEM_API_PREFIX}/${id}/detail`, {
    method: 'GET',
  });
}

export async function submitAnswer(id: number, data: Part2PracticeSetAPI.SubmitPart2AnswerRequest) {
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
