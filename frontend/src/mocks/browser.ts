import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// 创建MSW worker实例
export const worker = setupWorker(...handlers)

// 启动Mock Service Worker
export const startMSW = async () => {
  if (process.env.NODE_ENV === 'development' || process.env.VITEST) {
    await worker.start({
      onUnhandledRequest: 'warn',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    })
    console.log('🔧 MSW Worker started')
  }
}