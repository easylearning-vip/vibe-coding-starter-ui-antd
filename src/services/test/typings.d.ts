declare namespace TestAPI {
  // Test model from API
  interface Test {
    id?: number;
    name?: string;
    description?: string;
    difficulty_level_id?: number;
    scenario_id?: number;
    created_at?: string;
    updated_at?: string;
  }

  // Create Test request
  interface CreateTestRequest {
    name: string;
    description?: string;
    difficulty_level_id?: number;
    scenario_id?: number;
  }

  // Update Test request
  interface UpdateTestRequest {
    id: number;
    name?: string;
    description?: string;
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
