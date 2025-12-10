/**
 * 应用根组件
 */

import React from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { BrowserRouter } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import AppRouter from '@/router';
import { defaultTheme, darkTheme } from '@/styles/theme';
import { useLayoutStore } from '@/stores/layoutStore';

/**
 * 应用根组件
 */
const App: React.FC = () => {
  const { theme } = useLayoutStore();

  // 根据主题模式选择配置
  const themeConfig = theme === 'dark' ? darkTheme : defaultTheme;

  return (
    <ConfigProvider locale={zhCN} theme={themeConfig}>
      <AntdApp>
        <BrowserRouter>
          <AppLayout>
            <AppRouter />
          </AppLayout>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;