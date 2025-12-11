/**
 * 应用入口文件
 * React应用的启动点
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 确保浏览器兼容性
if (!import.meta.env.DEV) {
  // 生产环境下的错误处理
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
}

// 创建根元素并渲染应用
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 热模块替换支持
if (import.meta.hot) {
  import.meta.hot.accept();
}