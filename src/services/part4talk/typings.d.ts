declare namespace Part4TalkAPI {
  // Part4Talk model from API
  interface Part4Talk {
    id?: number;
    test_id?: number;
    talk_number?: number;
    title?: string;
    content?: string;
    question1?: string;
    question2?: string;
    question3?: string;
    scenario_id?: number;
    difficulty_level_id?: number;
    created_at?: string;
    updated_at?: string;
    answer_options?: Part4AnswerOption[];
  }

  // Part4AnswerOption model from API
  interface Part4AnswerOption {
    id?: number;
    talk_id?: number;
    question_number?: number;
    option_a?: string;
    option_b?: string;
    option_c?: string;
    option_d?: string;
    correct_answer?: string;
    created_at?: string;
    updated_at?: string;
  }

  // Create Part4Talk request
  interface CreatePart4TalkRequest {
    test_id: number;
    talk_number: number;
    title?: string;
    content: string;
    question1: string;
    question2: string;
    question3: string;
    scenario_id?: number;
    difficulty_level_id?: number;
  }

  // Update Part4Talk request
  interface UpdatePart4TalkRequest {
    id: number;
    test_id?: number;
    talk_number?: number;
    title?: string;
    content?: string;
    question1?: string;
    question2?: string;
    question3?: string;
    scenario_id?: number;
    difficulty_level_id?: number;
  }

  // Create Part4AnswerOption request
  interface CreatePart4AnswerOptionRequest {
    talk_id: number;
    question_number: number;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string;
  }

  // Update Part4AnswerOption request
  interface UpdatePart4AnswerOptionRequest {
    id: number;
    talk_id?: number;
    question_number?: number;
    option_a?: string;
    option_b?: string;
    option_c?: string;
    option_d?: string;
    correct_answer?: string;
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

  // Combined Part4Question for frontend display
  interface Part4Question {
    id?: number;
    test_id?: number;
    talk_number?: number;
    title?: string;
    content?: string;
    question1?: string;
    question2?: string;
    question3?: string;
    scenario_id?: number;
    difficulty_level_id?: number;
    created_at?: string;
    updated_at?: string;
    // Answer options for each question
    question1_options?: Part4AnswerOption;
    question2_options?: Part4AnswerOption;
    question3_options?: Part4AnswerOption;
  }
}
