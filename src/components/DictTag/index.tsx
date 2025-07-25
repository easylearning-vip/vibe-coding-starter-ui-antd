import type { TagProps } from 'antd';
import { Tag } from 'antd';
import React from 'react';
import { getStatusColor, useDictItems } from '@/hooks/useDict';

export interface DictTagProps extends Omit<TagProps, 'color' | 'children'> {
  categoryCode: string;
  itemKey: string;
  showColor?: boolean;
}

/**
 * 数据字典标签组件
 * 自动从数据字典获取显示文本和颜色
 */
const DictTag: React.FC<DictTagProps> = ({
  categoryCode,
  itemKey,
  showColor = true,
  ...tagProps
}) => {
  const { getLabel } = useDictItems(categoryCode);

  const color = showColor ? getStatusColor(categoryCode, itemKey) : undefined;
  const label = getLabel(itemKey);

  return (
    <Tag color={color} {...tagProps}>
      {label}
    </Tag>
  );
};

export default DictTag;
