import React, { useEffect } from 'react';
import { useDict } from '@/hooks/useDict';
import { DICT_CATEGORIES } from '@/services/dict/api';

interface DictProviderProps {
  children: React.ReactNode;
}

/**
 * 数据字典提供者组件
 * 在应用启动时预加载常用的数据字典
 */
const DictProvider: React.FC<DictProviderProps> = ({ children }) => {
  const { fetchDictItems } = useDict();

  useEffect(() => {
    // 预加载常用的数据字典
    const preloadDictionaries = async () => {
      try {
        // 并行加载所有常用字典
        await Promise.all([
          fetchDictItems(DICT_CATEGORIES.ARTICLE_STATUS),
          fetchDictItems(DICT_CATEGORIES.USER_ROLE),
          fetchDictItems(DICT_CATEGORIES.USER_STATUS),
          fetchDictItems(DICT_CATEGORIES.COMMENT_STATUS),
          fetchDictItems(DICT_CATEGORIES.STORAGE_TYPE),
        ]);
      } catch (error) {
        console.warn('预加载数据字典失败:', error);
      }
    };

    preloadDictionaries();
  }, [fetchDictItems]);

  return <>{children}</>;
};

export default DictProvider;
