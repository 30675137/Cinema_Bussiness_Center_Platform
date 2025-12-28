/**
 * DirtyTabIndicator 原子组件
 * 标签页未保存状态指示器
 * Feature: 001-scenario-package-tabs
 */

import React from 'react';
import { Badge, Tooltip } from 'antd';

interface DirtyTabIndicatorProps {
  /** 是否有未保存的修改 */
  isDirty: boolean;
  /** 标签名称 */
  tabName?: string;
  /** 子元素 */
  children: React.ReactNode;
}

/**
 * 标签页未保存状态指示器
 * 
 * 在标签名称旁显示一个小圆点，表示该标签页有未保存的修改
 * 
 * @example
 * <DirtyTabIndicator isDirty={true} tabName="基础信息">
 *   基础信息
 * </DirtyTabIndicator>
 */
const DirtyTabIndicator: React.FC<DirtyTabIndicatorProps> = ({
  isDirty,
  tabName,
  children,
}) => {
  if (!isDirty) {
    return <>{children}</>;
  }

  return (
    <Tooltip title={`${tabName || '当前页面'}有未保存的修改`}>
      <Badge
        dot
        offset={[6, 0]}
        status="warning"
      >
        {children}
      </Badge>
    </Tooltip>
  );
};

export default DirtyTabIndicator;
