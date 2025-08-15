import { request } from '@umijs/max';

const API_BASE = '/api/v1/admin';

/**
 * Department 相关的 API 接口
 */

// 获取Department列表
export interface GetDepartmentListParams {
  page?: number;
  page_size?: number;
  search?: string;
  start_date?: string;
  end_date?: string;
  sort?: string;
  order?: string;
}

export interface DepartmentListResponse {
  data: DepartmentAPI.Department[];
  total: number;
  page: number;
  size: number;
}

/**
 * 获取Department列表
 */
export async function getDepartmentList(params: GetDepartmentListParams): Promise<DepartmentListResponse> {
  return request<DepartmentListResponse>(`${API_BASE}/departments`, {
    method: 'GET',
    params,
  });
}

/**
 * 获取单个Department详情
 */
export async function getDepartment(id: number): Promise<DepartmentAPI.Department> {
  return request<DepartmentAPI.Department>(`${API_BASE}/departments/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建Department
 */
export async function createDepartment(params: DepartmentAPI.CreateDepartmentRequest): Promise<DepartmentAPI.Department> {
  return request<DepartmentAPI.Department>(`${API_BASE}/departments`, {
    method: 'POST',
    data: params,
  });
}

/**
 * 更新Department
 */
export async function updateDepartment(id: number, params: DepartmentAPI.UpdateDepartmentRequest): Promise<DepartmentAPI.Department> {
  return request<DepartmentAPI.Department>(`${API_BASE}/departments/${id}`, {
    method: 'PUT',
    data: params,
  });
}

/**
 * 删除Department
 */
export async function deleteDepartment(id: number): Promise<DepartmentAPI.SuccessResponse> {
  return request<DepartmentAPI.SuccessResponse>(`${API_BASE}/departments/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 获取部门树结构
 */
export async function getDepartmentTree(): Promise<DepartmentAPI.Department[]> {
  return request<DepartmentAPI.Department[]>(`${API_BASE}/departments/tree`, {
    method: 'GET',
  });
}

/**
 * 获取子部门
 */
export async function getDepartmentChildren(id: number): Promise<DepartmentAPI.Department[]> {
  return request<DepartmentAPI.Department[]>(`${API_BASE}/departments/${id}/children`, {
    method: 'GET',
  });
}

/**
 * 获取部门路径
 */
export async function getDepartmentPath(id: number): Promise<DepartmentAPI.Department[]> {
  return request<DepartmentAPI.Department[]>(`${API_BASE}/departments/${id}/path`, {
    method: 'GET',
  });
}

/**
 * 移动部门
 */
export async function moveDepartment(id: number, params: { new_parent_id: number }): Promise<DepartmentAPI.SuccessResponse> {
  return request<DepartmentAPI.SuccessResponse>(`${API_BASE}/departments/${id}/move`, {
    method: 'PUT',
    data: params,
  });
}

/**
 * 导出Department数据
 */
export async function exportDepartment(params: GetDepartmentListParams): Promise<Blob> {
  return request<Blob>(`${API_BASE}/departments/export`, {
    method: 'GET',
    params,
    responseType: 'blob',
  });
}
