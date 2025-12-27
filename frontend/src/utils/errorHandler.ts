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
export const showError = (error: any, defaultMessage = '操作失败') => {
  const errorMessage = error?.message || error?.response?.data?.message || defaultMessage;
  message.error(errorMessage);
};

/**
 * 显示成功消息
 */
export const showSuccess = (msg: string) => {
  message.success(msg);
};

/**
 * 获取友好的错误消息
 */
export const getFriendlyErrorMessage = (error: any): string => {
  if (error?.response) {
    const status = error.response.status;
    switch (status) {
      case 400:
        return '请求参数错误';
      case 401:
        return '未授权，请先登录';
      case 403:
        return '没有权限访问';
      case 404:
        return '请求的资源不存在';
      case 500:
        return '服务器错误';
      default:
        return error.response.data?.message || '请求失败';
    }
  }
  return error?.message || '未知错误';
};
