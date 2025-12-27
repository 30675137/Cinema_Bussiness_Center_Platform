import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Spin, Result, Button } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'

// 加载状态接口
interface LoadingState {
  global: boolean
  page: boolean
  components: Record<string, boolean>
  requests: Record<string, boolean>
}

// 加载配置接口
interface LoadingConfig {
  showSpinner: boolean
  showProgress: boolean
  customMessage?: string
  delay?: number
  timeout?: number
}

// Loading上下文接口
interface LoadingContextType {
  loading: LoadingState
  setLoading: (key: string, isLoading: boolean, config?: LoadingConfig) => void
  clearLoading: (key: string) => void
  clearAllLoading: () => void
  isLoading: (key: string) => boolean
  hasAnyLoading: () => boolean
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

// Loading提供者组件属性
interface LoadingProviderProps {
  children: ReactNode
}

/**
 * 全局加载状态管理提供者
 */
export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loading, setLoadingState] = useState<LoadingState>({
    global: false,
    page: false,
    components: {},
    requests: {}
  })

  // 加载配置存储
  const [loadingConfigs, setLoadingConfigs] = useState<Record<string, LoadingConfig>>({})

  // 设置加载状态
  const setLoading = (
    key: string,
    isLoading: boolean,
    config?: LoadingConfig
  ) => {
    if (config) {
      setLoadingConfigs(prev => ({
        ...prev,
        [key]: config
      }))
    }

    setLoadingState(prev => {
      const newState = { ...prev }

      // 处理不同类型的key
      if (key === 'global') {
        newState.global = isLoading
      } else if (key === 'page') {
        newState.page = isLoading
      } else if (key.startsWith('component:')) {
        const componentKey = key.replace('component:', '')
        newState.components = {
          ...newState.components,
          [componentKey]: isLoading
        }
      } else if (key.startsWith('request:')) {
        const requestKey = key.replace('request:', '')
        newState.requests = {
          ...newState.requests,
          [requestKey]: isLoading
        }
      }

      return newState
    })
  }

  // 清除特定加载状态
  const clearLoading = (key: string) => {
    setLoading(key, false)
    setLoadingConfigs(prev => {
      const newState = { ...prev }
      delete newState[key]
      return newState
    })
  }

  // 清除所有加载状态
  const clearAllLoading = () => {
    setLoadingState({
      global: false,
      page: false,
      components: {},
      requests: {}
    })
    setLoadingConfigs({})
  }

  // 检查特定key是否在加载中
  const isLoading = (key: string): boolean => {
    if (key === 'global') return loading.global
    if (key === 'page') return loading.page
    if (key.startsWith('component:')) {
      const componentKey = key.replace('component:', '')
      return loading.components[componentKey] || false
    }
    if (key.startsWith('request:')) {
      const requestKey = key.replace('request:', '')
      return loading.requests[requestKey] || false
    }
    return false
  }

  // 检查是否有任何加载状态
  const hasAnyLoading = (): boolean => {
    return (
      loading.global ||
      loading.page ||
      Object.values(loading.components).some(Boolean) ||
      Object.values(loading.requests).some(Boolean)
    )
  }

  const value: LoadingContextType = {
    loading,
    setLoading,
    clearLoading,
    clearAllLoading,
    isLoading,
    hasAnyLoading
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}

/**
 * 使用Loading上下文的Hook
 */
export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

/**
 * 组件级加载Hook
 */
export const useComponentLoading = (componentName: string) => {
  const { setLoading, clearLoading, isLoading } = useLoading()
  const key = `component:${componentName}`

  return {
    setLoading: (isLoading: boolean, config?: LoadingConfig) =>
      setLoading(key, isLoading, config),
    clearLoading: () => clearLoading(key),
    isLoading: isLoading(key)
  }
}

/**
 * 请求级加载Hook
 */
export const useRequestLoading = (requestName: string) => {
  const { setLoading, clearLoading, isLoading } = useLoading()
  const key = `request:${requestName}`

  return {
    setLoading: (isLoading: boolean, config?: LoadingConfig) =>
      setLoading(key, isLoading, config),
    clearLoading: () => clearLoading(key),
    isLoading: isLoading(key)
  }
}

/**
 * 全局加载Hook
 */
export const useGlobalLoading = () => {
  const { setLoading, clearLoading, isLoading } = useLoading()

  return {
    setLoading: (isLoading: boolean, config?: LoadingConfig) =>
      setLoading('global', isLoading, config),
    clearLoading: () => clearLoading('global'),
    isLoading: isLoading('global')
  }
}

/**
 * 页面级加载Hook
 */
export const usePageLoading = () => {
  const { setLoading, clearLoading, isLoading } = useLoading()

  return {
    setLoading: (isLoading: boolean, config?: LoadingConfig) =>
      setLoading('page', isLoading, config),
    clearLoading: () => clearLoading('page'),
    isLoading: isLoading('page')
  }
}

/**
 * 异步操作包装器
 */
export const withLoading = async <T>(
  loadingKey: string,
  asyncFn: () => Promise<T>,
  config?: LoadingConfig
): Promise<T> => {
  const { setLoading } = useLoading()

  try {
    setLoading(loadingKey, true, config)
    return await asyncFn()
  } finally {
    setLoading(loadingKey, false)
  }
}

/**
 * 加载状态组件
 */
interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large'
  tip?: string
  delay?: number
  spinning?: boolean
  children?: ReactNode
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'default',
  tip,
  delay = 200,
  spinning = true,
  children
}) => {
  return (
    <Spin
      size={size}
      tip={tip}
      delay={delay}
      spinning={spinning}
    >
      {children}
    </Spin>
  )
}

/**
 * 全局加载遮罩组件
 */
export const GlobalLoadingMask: React.FC = () => {
  const { isLoading } = useGlobalLoading()

  if (!isLoading('global')) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(4px)'
      }}
    >
      <LoadingSpinner size="large" tip="系统处理中，请稍候..." />
    </div>
  )
}

/**
 * 页面加载组件
 */
export const PageLoading: React.FC<{ tip?: string }> = ({ tip = '页面加载中...' }) => {
  const { isLoading } = usePageLoading()

  if (!isLoading('page')) return null

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px'
    }}>
      <LoadingSpinner size="large" tip={tip} />
    </div>
  )
}

/**
 * 错误重试加载组件
 */
interface ErrorRetryProps {
  title?: string
  description?: string
  onRetry?: () => void
  loading?: boolean
}

export const ErrorRetry: React.FC<ErrorRetryProps> = ({
  title = '加载失败',
  description = '抱歉，页面加载失败，请重试',
  onRetry,
  loading = false
}) => {
  return (
    <Result
      status="error"
      title={title}
      subTitle={description}
      extra={
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={onRetry}
          loading={loading}
        >
          重新加载
        </Button>
      }
    />
  )
}

/**
 * 带加载状态的内容包装器
 */
interface LoadingWrapperProps {
  loadingKey: string
  children: ReactNode
  fallback?: ReactNode
  error?: Error
  onRetry?: () => void
  loadingConfig?: LoadingConfig
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  loadingKey,
  children,
  fallback,
  error,
  onRetry,
  loadingConfig
}) => {
  const { isLoading } = useLoading()

  // 显示错误状态
  if (error) {
    return fallback || (
      <ErrorRetry
        description={error.message}
        onRetry={onRetry}
      />
    )
  }

  // 显示加载状态
  if (isLoading(loadingKey)) {
    const config = loadingConfigs[loadingKey] || loadingConfig
    if (config?.customMessage) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px'
        }}>
          <LoadingSpinner
            size="large"
            tip={config.customMessage}
            delay={config.delay}
          />
        </div>
      )
    }
    return fallback || <PageLoading />
  }

  // 显示内容
  return <>{children}</>
}

export default LoadingProvider