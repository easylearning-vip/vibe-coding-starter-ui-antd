declare namespace Part3QuestionAPI {
  // Part3Conversation model from API
  interface Part3Conversation {
    id?: number;
    test_id?: number;
    conversation_number?: number;
    title?: string;
    content?: string;
    question1?: string;
    question2?: string;
    question3?: string;
    scenario_id?: number;
    difficulty_level_id?: number;
    created_at?: string;
    updated_at?: string;
    answer_options?: Part3AnswerOption[];
  }

  // Part3AnswerOption model from API
  interface Part3AnswerOption {
    id?: number;
    conversation_id?: number;
    question_number?: number;
    option_a?: string;
    option_b?: string;
    option_c?: string;
    option_d?: string;
    correct_answer?: string;
    created_at?: string;
    updated_at?: string;
  }

  // Create Part3Conversation request
  interface CreatePart3ConversationRequest {
    test_id: number;
    conversation_number: number;
    title?: string;
    content: string;
    question1: string;
    question2: string;
    question3: string;
    scenario_id?: number;
    difficulty_level_id?: number;
  }

  // Update Part3Conversation request
  interface UpdatePart3ConversationRequest {
    id: number;
    test_id?: number;
    conversation_number?: number;
    title?: string;
    content?: string;
    question1?: string;
    question2?: string;
    question3?: string;
    scenario_id?: number;
    difficulty_level_id?: number;
  }

  // Create Part3AnswerOption request
  interface CreatePart3AnswerOptionRequest {
    conversation_id: number;
    question_number: number;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string;
  }

  // Update Part3AnswerOption request
  interface UpdatePart3AnswerOptionRequest {
    id: number;
    conversation_id?: number;
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

  // Combined Part3Question for frontend display
  interface Part3Question {
    id?: number;
    test_id?: number;
    conversation_number?: number;
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
    question1_options?: Part3AnswerOption;
    question2_options?: Part3AnswerOption;
    question3_options?: Part3AnswerOption;
  }
}
