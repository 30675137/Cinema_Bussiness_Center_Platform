import { PropsWithChildren, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { silentLogin, checkTokenExpiry, refreshToken } from './services/authService'
import { getUser, getAccessToken } from './utils/storage'
import { useUserStore } from './stores/userStore'
import './app.less'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 分钟缓存
      cacheTime: 10 * 60 * 1000,   // 10 分钟内存保留
      retry: 2,                     // 失败重试 2 次
    },
  },
})

function App({ children }: PropsWithChildren) {
  const setUser = useUserStore((state) => state.setUser)

  /**
   * 小程序启动时优化的认证初始化流程
   *
   * User Story 2 优化:
   * 1. 先检查本地是否有有效令牌
   * 2. 如果令牌即将过期(< 1天),尝试刷新
   * 3. 如果令牌无效或不存在,执行静默登录
   */
  useEffect(() => {
    const initAuth = async () => {
      console.log('[App] Initializing authentication...')

      // Step 1: 恢复本地缓存的用户信息
      const cachedUser = getUser()
      const cachedToken = getAccessToken()

      if (cachedUser && cachedToken) {
        console.log('[App] Found cached user and token, restoring session:', cachedUser.id)
        setUser(cachedUser)

        // Step 2: 检查令牌是否即将过期
        try {
          const isExpiringSoon = await checkTokenExpiry()

          if (isExpiringSoon) {
            console.log('[App] Token expiring soon, attempting refresh...')
            try {
              await refreshToken()
              console.log('[App] Token refreshed successfully')
            } catch (refreshError) {
              console.warn('[App] Token refresh failed, falling back to silent login')
              // 刷新失败,执行静默登录
              const loginResponse = await silentLogin()
              setUser(loginResponse.user)
            }
          } else {
            console.log('[App] Token is still valid, skipping refresh')
          }
        } catch (error) {
          console.error('[App] Error checking token expiry:', error)
        }
      } else {
        // Step 3: 没有本地令牌,执行静默登录
        console.log('[App] No cached token found, performing silent login...')
        try {
          const loginResponse = await silentLogin()
          setUser(loginResponse.user)
          console.log('[App] Silent login successful')
        } catch (error) {
          console.error('[App] Silent login failed:', error)
          // 静默登录失败不影响应用启动,用户可继续浏览公开页面
        }
      }
    }

    initAuth()
  }, [setUser])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

export default App
