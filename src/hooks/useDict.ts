import { message } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DICT_CATEGORIES,
  type DictCategory,
  type DictItem,
  getDictCategories,
  getDictItems,
} from '@/services/dict/api';

// 字典项选项类型（用于Select组件）
export interface DictOption {
  label: string | React.ReactElement;
  value: string;
  disabled?: boolean;
  color?: string;
}

// 字典数据缓存
const dictCache = new Map<string, DictItem[]>();
const categoriesCache = new Map<string, DictCategory[]>();

/**
 * 数据字典Hook - 提供全局的数据字典功能
 */
export function useDict() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<DictCategory[]>([]);

  // 获取所有分类
  const fetchCategories = useCallback(async () => {
    if (categoriesCache.has('all')) {
      setCategories(categoriesCache.get('all') || []);
      return;
    }

    setLoading(true);
    try {
      const response = await getDictCategories();
      if (response.code === 200) {
        setCategories(response.data);
        categoriesCache.set('all', response.data);
      } else {
        message.error(response.message || '获取字典分类失败');
      }
    } catch (error) {
      console.error('获取字典分类失败:', error);
      message.error('获取字典分类失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取指定分类的字典项
  const fetchDictItems = useCallback(
    async (categoryCode: string): Promise<DictItem[]> => {
      if (dictCache.has(categoryCode)) {
        return dictCache.get(categoryCode) || [];
      }

      try {
        const response = await getDictItems(categoryCode);
        if (response.code === 200) {
          dictCache.set(categoryCode, response.data);
          return response.data;
        } else {
          message.error(response.message || `获取字典项失败: ${categoryCode}`);
          return [];
        }
      } catch (error) {
        console.error(`获取字典项失败 [${categoryCode}]:`, error);
        message.error(`获取字典项失败: ${categoryCode}`);
        return [];
      }
    },
    [],
  );

  // 清除缓存
  const clearCache = useCallback((categoryCode?: string) => {
    if (categoryCode) {
      dictCache.delete(categoryCode);
    } else {
      dictCache.clear();
      categoriesCache.clear();
    }
  }, []);

  // 初始化时获取分类
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    loading,
    categories,
    fetchCategories,
    fetchDictItems,
    clearCache,
  };
}

/**
 * 获取指定分类的字典项Hook
 */
export function useDictItems(categoryCode: string) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<DictItem[]>([]);

  const fetchItems = useCallback(async () => {
    if (!categoryCode) return;

    if (dictCache.has(categoryCode)) {
      setItems(dictCache.get(categoryCode) || []);
      return;
    }

    setLoading(true);
    try {
      const response = await getDictItems(categoryCode);
      if (response.code === 200) {
        setItems(response.data);
        dictCache.set(categoryCode, response.data);
      } else {
        message.error(response.message || `获取字典项失败: ${categoryCode}`);
      }
    } catch (error) {
      console.error(`获取字典项失败 [${categoryCode}]:`, error);
      message.error(`获取字典项失败: ${categoryCode}`);
    } finally {
      setLoading(false);
    }
  }, [categoryCode]);

  // 转换为Select选项格式
  const options = useMemo((): DictOption[] => {
    return items
      .filter((item) => item.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        label: item.item_value,
        value: item.item_key,
        disabled: !item.is_active,
      }));
  }, [items]);

  // 根据key获取显示文本
  const getLabel = useCallback(
    (key: string): string => {
      const item = items.find((item) => item.item_key === key);
      return item?.item_value || key;
    },
    [items],
  );

  // 根据key获取字典项
  const getItem = useCallback(
    (key: string): DictItem | undefined => {
      return items.find((item) => item.item_key === key);
    },
    [items],
  );

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    loading,
    items,
    options,
    getLabel,
    getItem,
    refetch: fetchItems,
  };
}

/**
 * 预定义的常用字典Hook
 */

// 文章状态
export function useArticleStatus() {
  return useDictItems(DICT_CATEGORIES.ARTICLE_STATUS);
}

// 用户角色
export function useUserRole() {
  return useDictItems(DICT_CATEGORIES.USER_ROLE);
}

// 用户状态
export function useUserStatus() {
  return useDictItems(DICT_CATEGORIES.USER_STATUS);
}

// 评论状态
export function useCommentStatus() {
  return useDictItems(DICT_CATEGORIES.COMMENT_STATUS);
}

// 存储类型
export function useStorageType() {
  return useDictItems(DICT_CATEGORIES.STORAGE_TYPE);
}

/**
 * 字典项渲染工具函数
 */

// 获取状态标签颜色
export function getStatusColor(categoryCode: string, itemKey: string): string {
  const colorMap: Record<string, Record<string, string>> = {
    [DICT_CATEGORIES.ARTICLE_STATUS]: {
      draft: 'orange',
      published: 'green',
      archived: 'gray',
    },
    [DICT_CATEGORIES.USER_STATUS]: {
      active: 'green',
      inactive: 'orange',
      banned: 'red',
    },
    [DICT_CATEGORIES.USER_ROLE]: {
      admin: 'red',
      user: 'blue',
    },
    [DICT_CATEGORIES.COMMENT_STATUS]: {
      pending: 'orange',
      approved: 'green',
      rejected: 'red',
    },
    [DICT_CATEGORIES.STORAGE_TYPE]: {
      local: 'blue',
      s3: 'green',
      oss: 'purple',
    },
  };

  return colorMap[categoryCode]?.[itemKey] || 'default';
}

// 创建字典选择器组件的props
export function createDictSelectProps(_categoryCode: string) {
  return {
    placeholder: '请选择',
    allowClear: true,
    showSearch: true,
    filterOption: (input: string, option?: DictOption) => {
      const label = typeof option?.label === 'string' ? option.label : '';
      return label.toLowerCase().includes(input.toLowerCase());
    },
  };
}
