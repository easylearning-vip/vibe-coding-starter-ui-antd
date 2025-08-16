import { request } from '@umijs/max';

const API_BASE = '/api/v1/admin';

/**
 * Product 相关的 API 接口
 */

// 获取Product列表
export interface GetProductListParams {
  page?: number;
  page_size?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
  sort?: string;
  order?: string;
}

export interface ProductListResponse {
  data: ProductAPI.Product[];
  total: number;
  page: number;
  size: number;
}

/**
 * 获取Product列表
 */
export async function getProductList(params: GetProductListParams): Promise<ProductListResponse> {
  return request<ProductListResponse>(`${API_BASE}/products`, {
    method: 'GET',
    params,
  });
}

/**
 * 获取单个Product详情
 */
export async function getProduct(id: number): Promise<ProductAPI.Product> {
  return request<ProductAPI.Product>(`${API_BASE}/products/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建Product
 */
export async function createProduct(params: ProductAPI.CreateProductRequest): Promise<ProductAPI.Product> {
  return request<ProductAPI.Product>(`${API_BASE}/products`, {
    method: 'POST',
    data: params,
  });
}

/**
 * 更新Product
 */
export async function updateProduct(id: number, params: ProductAPI.UpdateProductRequest): Promise<ProductAPI.Product> {
  return request<ProductAPI.Product>(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    data: params,
  });
}

/**
 * 删除Product
 */
export async function deleteProduct(id: number): Promise<ProductAPI.SuccessResponse> {
  return request<ProductAPI.SuccessResponse>(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
  });
}
