declare namespace DifficultyLevelAPI {
  // DifficultyLevel model from API
  interface DifficultyLevel {
    id?: number;
    name?: string;
    description?: string;
    characteristics?: string;
    created_at?: string;
    updated_at?: string;
  }

  // Create DifficultyLevel request
  interface CreateDifficultyLevelRequest {
    name: string;
    description: string;
    characteristics?: string;
  }

  // Update DifficultyLevel request
  interface UpdateDifficultyLevelRequest {
    id: number;
    name?: string;
    description?: string;
    characteristics?: string;
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
