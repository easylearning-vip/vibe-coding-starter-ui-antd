declare namespace Part2PracticeSetAPI {
  type Part2PracticeSet = {
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

  type Part2PracticeSetItem = {
    id?: number;
    set_id?: number;
    question_id?: number;
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

  type CreatePart2SetItemRequest = {
    set_id: number;
    question_id: number;
    order_index: number;
  };

  type Part2QuestionDetail = {
    item_id: number;
    set_id: number;
    order_index: number;
    question: Part2QuestionAPI.Part2Question;
  };

  type SubmitPart2AnswerRequest = {
    selected_answer: 'A' | 'B' | 'C';
    is_correct: boolean;
  };
}
