/**
 * 布局内容区域组件
 */

import React from 'react';
import { Layout } from 'antd';
import './index.css';

const { Content } = Layout;

/**
 * 布局内容区域组件
 */
const LayoutContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Content className="layout-content">
      <div className="content-wrapper">
        {children}
      </div>
    </Content>
  );
};

export default LayoutContent;