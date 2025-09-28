declare namespace Part4PracticeSetAPI {
  type Part4PracticeSet = {
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

  type Part4PracticeSetItem = {
    id?: number;
    set_id?: number;
    talk_id?: number;
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

  type CreatePart4SetItemRequest = {
    set_id: number;
    talk_id: number;
    question_index: number;
    order_index: number;
  };

  type Part4QuestionDetail = {
    item_id: number;
    set_id: number;
    order_index: number;
    question_index: number;
    talk: Part4TalkAPI.Part4Talk;
  };

  type SubmitPart4AnswerRequest = {
    selected_answer: 'A' | 'B' | 'C' | 'D';
    is_correct: boolean;
  };
}
