export interface ToeicAiPrompt {
  id: number;
  part2_prompt: string;
  part3_prompt: string;
  part4_prompt: string;
  created_at: string;
  updated_at: string;
}

export interface CreateToeicAiPromptRequest {
  part2_prompt: string;
  part3_prompt: string;
  part4_prompt: string;
}

export interface UpdateToeicAiPromptRequest {
  part2_prompt: string;
  part3_prompt: string;
  part4_prompt: string;
}

export interface ToeicAiPromptListResponse {
  data: ToeicAiPrompt[];
  total: number;
  page: number;
  size: number;
}

export interface ToeicAiPromptListParams {
  page?: number;
  page_size?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
}
