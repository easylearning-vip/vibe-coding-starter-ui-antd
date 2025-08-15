declare namespace DepartmentAPI {
  // Department model from API
  interface Department {
  }

  // Create Department request
  interface CreateDepartmentRequest {
  }

  // Update Department request
  interface UpdateDepartmentRequest {
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
