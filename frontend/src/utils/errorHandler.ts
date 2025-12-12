/**
 * 全局错误处理
 */

import { message } from 'antd';

// 忽略来自浏览器扩展的网络错误
window.addEventListener('error', (event) => {
  // 检查是否是来自 content.js 的错误（浏览器扩展）
  if (event.filename && event.filename.includes('content.js')) {
    console.warn('忽略浏览器扩展错误:', event.message);
    event.preventDefault();
    return false;
  }
});

// 忽略未处理的 Promise 拒绝（来自扩展）
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason;
  
  // 检查是否是 Axios 网络错误且来自扩展
  if (error && error.name === 'AxiosError' && error.code === 'ERR_NETWORK') {
    console.warn('忽略网络错误（可能来自浏览器扩展）');
    event.preventDefault();
    return false;
  }
});

/**
 * 显示错误消息
 */
export const showError = (error: string | Error, duration?: number) => {
  const errorMessage = error instanceof Error ? error.message : error;
  message.error(errorMessage, duration);
};

/**
 * 显示成功消息
 */
export const showSuccess = (msg: string, duration?: number) => {
  message.success(msg, duration);
};

/**
 * 获取友好的错误消息
 */
export const getFriendlyErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return '发生未知错误';
};

export {};
