import { request } from '@umijs/max';

const API_BASE = '/api/v1';

/**
 * 数据字典相关的 API 接口
 */

// 数据字典分类类型定义
export interface DictCategory {
  id: number;
  code: string;
  name: string;
  description?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  items?: DictItem[];
}

// 数据字典项类型定义
export interface DictItem {
  id: number;
  category_code: string;
  item_key: string;
  item_value: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: DictCategory;
}

// 创建分类请求
export interface CreateCategoryRequest {
  code: string;
  name: string;
  description?: string;
  sort_order?: number;
}

// 创建字典项请求
export interface CreateItemRequest {
  category_code: string;
  item_key: string;
  item_value: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

// 更新字典项请求
export interface UpdateItemRequest {
  item_value?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

// API 响应类型
export interface DictResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 获取所有字典分类
 */
export async function getDictCategories(): Promise<DictResponse<DictCategory[]>> {
  return request<DictResponse<DictCategory[]>>(`${API_BASE}/dict/categories`, {
    method: 'GET',
  });
}

/**
 * 根据分类代码获取字典项
 */
export async function getDictItems(categoryCode: string): Promise<DictResponse<DictItem[]>> {
  return request<DictResponse<DictItem[]>>(`${API_BASE}/dict/items/${categoryCode}`, {
    method: 'GET',
  });
}

/**
 * 获取特定字典项
 */
export async function getDictItem(categoryCode: string, itemKey: string): Promise<DictResponse<DictItem>> {
  return request<DictResponse<DictItem>>(`${API_BASE}/dict/item/${categoryCode}/${itemKey}`, {
    method: 'GET',
  });
}

/**
 * 创建字典分类
 */
export async function createDictCategory(data: CreateCategoryRequest): Promise<DictResponse<DictCategory>> {
  return request<DictResponse<DictCategory>>(`${API_BASE}/dict/categories`, {
    method: 'POST',
    data,
  });
}

/**
 * 删除字典分类
 */
export async function deleteDictCategory(id: number): Promise<DictResponse<{ message: string }>> {
  return request<DictResponse<{ message: string }>>(`${API_BASE}/dict/categories/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 创建字典项
 */
export async function createDictItem(data: CreateItemRequest): Promise<DictResponse<DictItem>> {
  return request<DictResponse<DictItem>>(`${API_BASE}/dict/items`, {
    method: 'POST',
    data,
  });
}

/**
 * 更新字典项
 */
export async function updateDictItem(id: number, data: UpdateItemRequest): Promise<DictResponse<DictItem>> {
  return request<DictResponse<DictItem>>(`${API_BASE}/dict/items/${id}`, {
    method: 'PUT',
    data,
  });
}

/**
 * 删除字典项
 */
export async function deleteDictItem(id: number): Promise<DictResponse<{ message: string }>> {
  return request<DictResponse<{ message: string }>>(`${API_BASE}/dict/items/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 初始化默认数据字典数据
 */
export async function initDictData(): Promise<DictResponse<{ message: string }>> {
  return request<DictResponse<{ message: string }>>(`${API_BASE}/dict/init`, {
    method: 'POST',
  });
}

// 常用的数据字典分类代码常量
export const DICT_CATEGORIES = {
  ARTICLE_STATUS: 'article_status',
  COMMENT_STATUS: 'comment_status', 
  USER_ROLE: 'user_role',
  USER_STATUS: 'user_status',
  STORAGE_TYPE: 'storage_type',
} as const;

// 常用的数据字典项键值常量
export const DICT_ITEMS = {
  // 文章状态
  ARTICLE_STATUS_DRAFT: 'draft',
  ARTICLE_STATUS_PUBLISHED: 'published',
  ARTICLE_STATUS_ARCHIVED: 'archived',
  
  // 评论状态
  COMMENT_STATUS_PENDING: 'pending',
  COMMENT_STATUS_APPROVED: 'approved',
  COMMENT_STATUS_REJECTED: 'rejected',
  
  // 用户角色
  USER_ROLE_ADMIN: 'admin',
  USER_ROLE_USER: 'user',
  
  // 用户状态
  USER_STATUS_ACTIVE: 'active',
  USER_STATUS_INACTIVE: 'inactive',
  USER_STATUS_BANNED: 'banned',
  
  // 存储类型
  STORAGE_TYPE_LOCAL: 'local',
  STORAGE_TYPE_S3: 's3',
  STORAGE_TYPE_OSS: 'oss',
} as const;
