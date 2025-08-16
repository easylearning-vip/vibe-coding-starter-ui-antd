declare namespace ProductCategoryAPI {
  // ProductCategory model from API
  interface ProductCategory {
    id: number;
    name: string;
    description?: string;
    parent_id?: number;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }

  // Create ProductCategory request
  interface CreateProductCategoryRequest {
    name: string;
    description?: string;
    parent_id?: number;
    sort_order: number;
    is_active: boolean;
  }

  // Update ProductCategory request
  interface UpdateProductCategoryRequest {
    name?: string;
    description?: string;
    parent_id?: number;
    sort_order?: number;
    is_active?: boolean;
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
