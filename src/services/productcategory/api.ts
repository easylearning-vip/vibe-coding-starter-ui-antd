import { request } from '@umijs/max';

const API_BASE = '/api/v1/admin';

/**
 * ProductCategory 相关的 API 接口
 */

// 获取ProductCategory列表
export interface GetProductCategoryListParams {
  page?: number;
  page_size?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
  sort?: string;
  order?: string;
}

export interface ProductCategoryListResponse {
  data: ProductCategoryAPI.ProductCategory[];
  total: number;
  page: number;
  size: number;
}

/**
 * 获取ProductCategory列表
 */
export async function getProductCategoryList(params: GetProductCategoryListParams): Promise<ProductCategoryListResponse> {
  return request<ProductCategoryListResponse>(`${API_BASE}/productcategories`, {
    method: 'GET',
    params,
  });
}

/**
 * 获取单个ProductCategory详情
 */
export async function getProductCategory(id: number): Promise<ProductCategoryAPI.ProductCategory> {
  return request<ProductCategoryAPI.ProductCategory>(`${API_BASE}/productcategories/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建ProductCategory
 */
export async function createProductCategory(params: ProductCategoryAPI.CreateProductCategoryRequest): Promise<ProductCategoryAPI.ProductCategory> {
  return request<ProductCategoryAPI.ProductCategory>(`${API_BASE}/productcategories`, {
    method: 'POST',
    data: params,
  });
}

/**
 * 更新ProductCategory
 */
export async function updateProductCategory(id: number, params: ProductCategoryAPI.UpdateProductCategoryRequest): Promise<ProductCategoryAPI.ProductCategory> {
  return request<ProductCategoryAPI.ProductCategory>(`${API_BASE}/productcategories/${id}`, {
    method: 'PUT',
    data: params,
  });
}

/**
 * 删除ProductCategory
 */
export async function deleteProductCategory(id: number): Promise<ProductCategoryAPI.SuccessResponse> {
  return request<ProductCategoryAPI.SuccessResponse>(`${API_BASE}/productcategories/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 获取分类树形结构
 */
export async function getProductCategoryTree(): Promise<ProductCategoryAPI.ProductCategory[]> {
  return request<ProductCategoryAPI.ProductCategory[]>(`${API_BASE}/productcategories/tree`, {
    method: 'GET',
  });
}

/**
 * 获取分类的子分类
 */
export async function getProductCategoryChildren(id: number): Promise<ProductCategoryAPI.ProductCategory[]> {
  return request<ProductCategoryAPI.ProductCategory[]>(`${API_BASE}/productcategories/${id}/children`, {
    method: 'GET',
  });
}

/**
 * 获取分类路径
 */
export async function getProductCategoryPath(id: number): Promise<ProductCategoryAPI.ProductCategory[]> {
  return request<ProductCategoryAPI.ProductCategory[]>(`${API_BASE}/productcategories/${id}/path`, {
    method: 'GET',
  });
}

/**
 * 批量更新排序
 */
export interface BatchSortRequest {
  items: Array<{
    id: number;
    sort_order: number;
  }>;
}

export async function batchUpdateSortOrder(params: BatchSortRequest): Promise<ProductCategoryAPI.SuccessResponse> {
  return request<ProductCategoryAPI.SuccessResponse>(`${API_BASE}/productcategories/batch-sort`, {
    method: 'POST',
    data: params,
  });
}

/**
 * 检查是否可以删除分类
 */
export async function canDeleteProductCategory(id: number): Promise<{ can_delete: boolean; reason?: string }> {
  return request<{ can_delete: boolean; reason?: string }>(`${API_BASE}/productcategories/${id}/can-delete`, {
    method: 'GET',
  });
}
