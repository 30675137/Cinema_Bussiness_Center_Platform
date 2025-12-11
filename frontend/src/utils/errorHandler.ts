/**
 * 全局错误处理
 */

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

export {};
