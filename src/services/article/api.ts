import { request } from '@umijs/max';

const API_BASE = '/api/v1';

/**
 * 文章相关的 API 接口
 */

// 文章数据类型定义
export interface Article {
  id: number;
  title: string;
  content: string;
  summary?: string;
  cover_image?: string;
  status: string; // 使用数据字典，不再硬编码状态值
  author_id: number;
  author?: {
    id: number;
    username: string;
    nickname?: string;
    avatar?: string;
  };
  category_id?: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  tags?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  view_count: number;
  like_count: number;
  slug?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  summary?: string;
  cover_image?: string;
  status?: string; // 使用数据字典
  category_id?: number;
  tag_ids?: number[];
}

export interface UpdateArticleRequest {
  title?: string;
  content?: string;
  summary?: string;
  cover_image?: string;
  status?: string; // 使用数据字典
  category_id?: number;
  tag_ids?: number[];
}

export interface ArticleListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string; // 使用数据字典
  author_id?: number | string;
  category_id?: number | string;
  start_date?: string;
  end_date?: string;
  sort?: string;
  order?: string;
}

export interface ArticleListResponse {
  data: Article[];
  page: number;
  size: number;
  total: number;
}

/**
 * 获取文章列表（公共接口，不需要认证）
 */
export async function getArticleList(params?: ArticleListParams): Promise<ArticleListResponse> {
  return request<ArticleListResponse>(`${API_BASE}/articles`, {
    method: 'GET',
    params,
  });
}

/**
 * 获取当前用户的文章列表（需要认证）
 */
export async function getUserArticleList(params?: ArticleListParams): Promise<ArticleListResponse> {
  return request<ArticleListResponse>(`${API_BASE}/user/articles`, {
    method: 'GET',
    params,
  });
}

/**
 * 获取所有文章列表（管理员专用）
 */
export async function getAdminArticleList(params?: ArticleListParams): Promise<ArticleListResponse> {
  return request<ArticleListResponse>(`${API_BASE}/admin/articles`, {
    method: 'GET',
    params,
  });
}

/**
 * 获取文章详情
 */
export async function getArticle(id: number): Promise<Article> {
  return request<Article>(`${API_BASE}/articles/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建文章
 */
export async function createArticle(data: CreateArticleRequest): Promise<Article> {
  return request<Article>(`${API_BASE}/articles`, {
    method: 'POST',
    data,
  });
}

/**
 * 更新文章
 */
export async function updateArticle(id: number, data: UpdateArticleRequest): Promise<Article> {
  return request<Article>(`${API_BASE}/articles/${id}`, {
    method: 'PUT',
    data,
  });
}

/**
 * 删除文章
 */
export async function deleteArticle(id: number): Promise<{ message: string }> {
  return request<{ message: string }>(`${API_BASE}/articles/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 搜索文章
 */
export async function searchArticles(params: {
  q: string;
  page?: number;
  page_size?: number;
}): Promise<ArticleListResponse> {
  return request<ArticleListResponse>(`${API_BASE}/articles/search`, {
    method: 'GET',
    params,
  });
}
