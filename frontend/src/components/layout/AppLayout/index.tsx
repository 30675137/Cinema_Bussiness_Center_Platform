/**
 * 应用主布局组件
 */

import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import Sidebar from '../Sidebar';
import LayoutHeader from '../LayoutHeader';
import Breadcrumb from '../Breadcrumb';
import { useLayoutStore } from '@/stores/layoutStore';
import { useResponsive } from '@/hooks/useResponsive';
import { defaultTheme, darkTheme } from '@/styles/theme';
import './index.css';

const { Content } = Layout;

/**
 * 主布局组件
 */
const AppLayout: React.FC = () => {
  const { sidebarCollapsed, theme: themeMode } = useLayoutStore();
  const { isMobile } = useResponsive();

  // 根据主题模式选择配置
  const themeConfig = themeMode === 'dark' ? darkTheme : defaultTheme;

  return (
    <ConfigProvider theme={themeConfig}>
      <Layout className="layout-container">
        {/* 侧边栏 */}
        <Sidebar />

        {/* 右侧内容区域 */}
        <Layout className={`layout-content ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'} ${isMobile ? 'mobile-layout' : ''}`}>
          {/* 头部 */}
          <LayoutHeader />

          {/* 面包屑导航 */}
          <Breadcrumb />

          {/* 主要内容区域 */}
          <Content className="main-content">
            <div className="page-container">
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AppLayout;