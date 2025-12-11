import React from 'react';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppRouter } from './router';
import { useUserStore } from './stores/userStore';
import './styles/globals.css';

// 创建React Query客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟
      retry: 1,
    },
  },
});

/**
 * 应用初始化组件
 */
const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initializeMockUser, isAuthenticated, user } = useUserStore();

  // 应用初始化逻辑
  React.useEffect(() => {
    // 初始化Mock用户（取消登录功能）
    if (!isAuthenticated) {
      initializeMockUser();
    }
    console.log('应用启动', { isAuthenticated, user });
  }, [isAuthenticated, user, initializeMockUser]);

  return <>{children}</>;
};

/**
 * 主应用组件
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff', // Ant Design 主要颜色
            borderRadius: 6,
            wireframe: false, // 禁用线框模式
          },
          components: {
            Layout: {
              headerBg: '#fff',
              siderBg: '#fff',
            },
            Menu: {
              itemBg: 'transparent',
              itemSelectedBg: '#e6f7ff',
              itemHoverBg: '#f5f5f5',
            },
          },
        }}
      >
        <AppInitializer>
          <AppRouter />
        </AppInitializer>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;