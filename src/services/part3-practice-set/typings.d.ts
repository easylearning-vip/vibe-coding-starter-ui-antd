declare namespace Part3PracticeSetAPI {
  type Part3PracticeSet = {
    id?: number;
    user_id?: number;
    scenario_id?: number;
    difficulty_level_id?: number;
    total_questions?: number;
    completed_count?: number;
    correct_count?: number;
    created_at?: string;
    updated_at?: string;
  };

  type Part3PracticeSetItem = {
    id?: number;
    set_id?: number;
    conversation_id?: number;
    question_index?: number;
    order_index?: number;
    selected_answer?: string;
    is_correct?: boolean;
    answered_at?: string;
    created_at?: string;
    updated_at?: string;
  };

  type CreatePracticeSetRequest = {
    scenario_id: number;
    difficulty_level_id: number;
    total_questions: number;
  };

  type GeneratePracticeSetRequest = {
    scenario_id: number;
    difficulty_level_id: number;
    mode: 'sequential' | 'random';
    deduplicate?: boolean;
    total_questions: number;
  };

  type UpdatePracticeSetRequest = {
    total_questions?: number;
    completed_count?: number;
    correct_count?: number;
  };

  type CreatePart3SetItemRequest = {
    set_id: number;
    conversation_id: number;
    question_index: number;
    order_index: number;
  };

  type Part3QuestionDetail = {
    item_id: number;
    set_id: number;
    order_index: number;
    question_index: number;
    conversation: Part3QuestionAPI.Part3Conversation;
  };

  type SubmitPart3AnswerRequest = {
    selected_answer: 'A' | 'B' | 'C' | 'D';
    is_correct: boolean;
  };
}
