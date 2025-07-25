import type { SelectProps } from 'antd';
import { Select, Tag } from 'antd';
import React from 'react';
import {
  createDictSelectProps,
  getStatusColor,
  useDictItems,
} from '@/hooks/useDict';

export interface DictSelectProps extends Omit<SelectProps, 'options'> {
  categoryCode: string;
  showColor?: boolean;
}

/**
 * 数据字典选择器组件
 * 自动从数据字典获取选项数据
 */
const DictSelect: React.FC<DictSelectProps> = ({
  categoryCode,
  showColor = false,
  ...selectProps
}) => {
  const { loading, options } = useDictItems(categoryCode);

  const defaultProps = createDictSelectProps(categoryCode);

  return (
    <Select
      {...defaultProps}
      {...selectProps}
      loading={loading}
      options={options.map((option) => ({
        ...option,
        label: showColor ? (
          <Tag color={getStatusColor(categoryCode, option.value)}>
            {option.label}
          </Tag>
        ) : (
          option.label
        ),
      }))}
    />
  );
};

export default DictSelect;
