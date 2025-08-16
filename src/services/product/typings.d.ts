declare namespace ProductAPI {
  // Product model from API
  interface Product {
    id: number;
    name: string;
    description?: string;
    category_id: number;
    sku: string;
    price: number;
    cost_price: number;
    stock_quantity: number;
    min_stock: number;
    is_active: boolean;
    weight?: number;
    dimensions?: string;
    created_at: string;
    updated_at: string;
  }

  // Create Product request
  interface CreateProductRequest {
    name: string;
    description?: string;
    category_id: number;
    sku: string;
    price: number;
    cost_price: number;
    stock_quantity?: number;
    min_stock?: number;
    is_active?: boolean;
    weight?: number;
    dimensions?: string;
  }

  // Update Product request
  interface UpdateProductRequest {
    name?: string;
    description?: string;
    category_id?: number;
    sku?: string;
    price?: number;
    cost_price?: number;
    stock_quantity?: number;
    min_stock?: number;
    is_active?: boolean;
    weight?: number;
    dimensions?: string;
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
