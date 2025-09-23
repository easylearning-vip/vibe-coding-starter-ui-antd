declare namespace ScenarioAPI {
  // Scenario model from API
  interface Scenario {
    id?: number;
    name?: string;
    description?: string;
    examples?: string;
    created_at?: string;
    updated_at?: string;
  }

  // Create Scenario request
  interface CreateScenarioRequest {
    name: string;
    description: string;
    examples?: string;
  }

  // Update Scenario request
  interface UpdateScenarioRequest {
    id: number;
    name?: string;
    description?: string;
    examples?: string;
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
