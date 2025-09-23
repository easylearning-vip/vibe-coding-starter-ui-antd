declare namespace Part2QuestionAPI {
  // Part2Question model from API
  interface Part2Question {
    id?: number;
    test_id?: number;
    question_number?: number;
    question_text?: string;
    option_a?: string;
    option_b?: string;
    option_c?: string;
    correct_answer?: string;
    explanation?: string;
    audio_url?: string;
    difficulty_level_id?: number;
    scenario_id?: number;
    created_at?: string;
    updated_at?: string;
  }

  // Create Part2Question request
  interface CreatePart2QuestionRequest {
    test_id: number;
    question_number: number;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    correct_answer: string;
    explanation?: string;
    audio_url?: string;
    difficulty_level_id?: number;
    scenario_id?: number;
  }

  // Update Part2Question request
  interface UpdatePart2QuestionRequest {
    id: number;
    test_id?: number;
    question_number?: number;
    question_text?: string;
    option_a?: string;
    option_b?: string;
    option_c?: string;
    correct_answer?: string;
    explanation?: string;
    audio_url?: string;
    difficulty_level_id?: number;
    scenario_id?: number;
  }

  // Success response
  interface SuccessResponse {
    success: boolean;
    message: string;
  }

  // List response
  interface ListResponse<T> {
    data: T[];
    total: number;
    page: number;
    size: number;
  }
}
