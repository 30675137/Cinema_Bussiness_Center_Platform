import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// 创建MSW worker实例
export const worker = setupWorker(...handlers)

// 启动Mock Service Worker
export const startMSW = async () => {
  if (import.meta.env.DEV) {
    try {
      // 检查 Service Worker 支持
      if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ Service Workers are not supported in this browser')
        return
      }

      await worker.start({
        onUnhandledRequest: (request, print) => {
          // 只警告 API 请求，忽略 Vite 的模块请求
          const url = typeof request === 'string' ? request : request.url
          const pathname = typeof url === 'string' 
            ? new URL(url).pathname 
            : url?.pathname || ''
          
          // 忽略 Vite 相关的请求（模块导入、HMR等）
          if (pathname.startsWith('/@') || 
              pathname.startsWith('/src/') ||
              pathname.startsWith('/node_modules/') ||
              pathname.includes('.ts') ||
              pathname.includes('.tsx') ||
              pathname.includes('.js') ||
              pathname.includes('.json')) {
            return // 忽略这些请求
          }
          
          // 只警告未处理的 API 请求
          if (pathname.startsWith('/api')) {
            console.warn('[MSW] Unhandled API request:', request.method || 'GET', url)
          }
        },
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
        quiet: false, // 显示 MSW 日志
      })
      
      console.log('✅ MSW Worker started successfully')
      console.log('📡 Mock handlers are active')
      console.log('📋 Registered handlers:', handlers.length)
      console.log('🔗 Service Worker URL: /mockServiceWorker.js')
      
      // 验证 handlers
      console.log('📝 Category handlers:', handlers.filter(h => 
        h.info?.header?.includes('categories')
      ).length)
    } catch (error) {
      console.error('❌ Failed to start MSW worker:', error)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      throw error
    }
  }
}