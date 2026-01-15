/**
 * AttributeStatusTag Component (Atom)
 *
 * Displays a status badge for dictionary items and attributes.
 * Shows "启用" (active) or "停用" (inactive) with appropriate colors.
 */

import React from 'react';
import { Tag } from 'antd';

export type AttributeStatus = 'active' | 'inactive';

interface AttributeStatusTagProps {
  status: AttributeStatus;
  size?: 'small' | 'default';
}

const STATUS_CONFIG: Record<AttributeStatus, { color: string; text: string }> = {
  active: {
    color: 'success',
    text: '启用',
  },
  inactive: {
    color: 'default',
    text: '停用',
  },
};

/**
 * Status tag component for displaying active/inactive state
 */
const AttributeStatusTag: React.FC<AttributeStatusTagProps> = ({ status, size = 'default' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;

  return (
    <Tag color={config.color} style={size === 'small' ? { fontSize: 12 } : undefined}>
      {config.text}
    </Tag>
  );
};

export default AttributeStatusTag;
