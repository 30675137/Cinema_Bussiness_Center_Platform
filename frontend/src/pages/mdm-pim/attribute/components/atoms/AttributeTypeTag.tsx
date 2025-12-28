/**
 * AttributeTypeTag Component (Atom)
 *
 * Displays attribute type badges (text/number/select/boolean/date)
 */

import React from 'react';
import { Tag } from 'antd';
import type { AttributeType } from '@/features/attribute-dictionary/types';

interface AttributeTypeTagProps {
  type: AttributeType;
  size?: 'small' | 'default';
}

const TYPE_CONFIG: Record<
  AttributeType,
  { color: string; text: string }
> = {
  text: {
    color: 'blue',
    text: '文本',
  },
  number: {
    color: 'green',
    text: '数字',
  },
  'single-select': {
    color: 'orange',
    text: '单选',
  },
  'multi-select': {
    color: 'purple',
    text: '多选',
  },
  boolean: {
    color: 'cyan',
    text: '布尔',
  },
  date: {
    color: 'magenta',
    text: '日期',
  },
};

/**
 * Attribute type tag component
 */
const AttributeTypeTag: React.FC<AttributeTypeTagProps> = ({
  type,
  size = 'default',
}) => {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.text;

  return (
    <Tag
      color={config.color}
      style={size === 'small' ? { fontSize: 12 } : undefined}
    >
      {config.text}
    </Tag>
  );
};

export default AttributeTypeTag;


