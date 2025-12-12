/**
 * 错误处理和加载状态管理Hook
 * 提供统一的错误处理、重试机制和加载状态管理
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { ErrorState, LoadingState } from '@types/inventory';

// 错误类型枚举
export enum ErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  BUSINESS = 'business',
  SYSTEM = 'system',
  TIMEOUT = 'timeout',
}

// 错误严重程度
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// 错误信息接口
export interface ErrorInfo extends ErrorState {
  type: ErrorType;
  severity: ErrorSeverity;
  timestamp: string;
  context?: Record<string, any>;
  retryable: boolean;
  retryCount?: number;
  maxRetries?: number;
}

// 加载状态接口
export interface LoadingStateWithProgress extends LoadingState {
  progress?: number;
  message?: string;
  startTime?: number;
  estimatedDuration?: number;
}

// 重试配置
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  maxDelay: number;
}

// 默认重试配置
const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
  maxDelay: 10000,
};

// 错误处理Hook
export const useErrorHandling = (initialRetryConfig?: Partial<RetryConfig>) => {
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingState, setLoadingState] = useState<LoadingStateWithProgress>({
    data: false,
    creating: false,
    updating: false,
    deleting: false,
  });
  const retryConfig = { ...defaultRetryConfig, ...initialRetryConfig };
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 清除当前错误
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 设置错误
  const setErrorWithInfo = useCallback((
    message: string,
    type: ErrorType = ErrorType.SYSTEM,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    code?: string,
    context?: Record<string, any>,
    retryable: boolean = true
  ) => {
    const errorInfo: ErrorInfo = {
      hasError: true,
      message,
      code: code || type,
      type,
      severity,
      timestamp: new Date().toISOString(),
      context,
      retryable,
      retryCount: 0,
      maxRetries: retryConfig.maxRetries,
    };
    setError(errorInfo);
  }, [retryConfig.maxRetries]);

  // 异步操作包装器
  const withErrorHandling = useCallback(async <T,>(
    operation: () => Promise<T>,
    operationType: keyof LoadingStateWithProgress = 'data',
    options?: {
      errorType?: ErrorType;
      errorSeverity?: ErrorSeverity;
      retryable?: boolean;
      context?: Record<string, any>;
      progressCallback?: (progress: number) => void;
      loadingMessage?: string;
    }
  ): Promise<T | null> => {
    const {
      errorType = ErrorType.SYSTEM,
      errorSeverity = ErrorSeverity.MEDIUM,
      retryable = true,
      context,
      progressCallback,
      loadingMessage,
    } = options || {};

    // 设置加载状态
    setIsLoading(true);
    setLoadingState(prev => ({
      ...prev,
      [operationType]: true,
      message: loadingMessage,
      startTime: Date.now(),
    }));

    // 清除之前的错误
    clearError();

    try {
      const result = await operation();

      // 清除加载状态
      setIsLoading(false);
      setLoadingState(prev => ({
        ...prev,
        [operationType]: false,
        progress: undefined,
        message: undefined,
      }));

      return result;
    } catch (err) {
      // 清除加载状态
      setIsLoading(false);
      setLoadingState(prev => ({
        ...prev,
        [operationType]: false,
        progress: undefined,
        message: undefined,
      }));

      // 处理错误
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      const errorCode = (err as any)?.code;

      setErrorWithInfo(
        errorMessage,
        errorType,
        errorSeverity,
        errorCode,
        { ...context, originalError: err },
        retryable
      );

      return null;
    }
  }, [clearError, setErrorWithInfo]);

  // 重试机制
  const retry = useCallback(async (operation?: () => Promise<any>): Promise<boolean> => {
    if (!error || !error.retryable || error.retryCount! >= error.maxRetries!) {
      return false;
    }

    // 清除重试超时
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    // 计算重试延迟
    const delay = Math.min(
      retryConfig.retryDelay * Math.pow(retryConfig.backoffMultiplier, error.retryCount!),
      retryConfig.maxDelay
    );

    // 更新错误状态
    setError(prev => prev ? {
      ...prev,
      retryCount: (prev.retryCount || 0) + 1,
    } : null);

    // 延迟后重试
    return new Promise((resolve) => {
      retryTimeoutRef.current = setTimeout(async () => {
        if (operation) {
          const result = await withErrorHandling(operation);
          resolve(result !== null);
        } else {
          resolve(true);
        }
      }, delay);
    });
  }, [error, retryConfig, withErrorHandling]);

  // 网络错误处理
  const handleNetworkError = useCallback((err: any, context?: Record<string, any>) => {
    const isNetworkError = !navigator.onLine || err?.message?.includes('network') || err?.code === 'NETWORK_ERROR';
    const isTimeoutError = err?.message?.includes('timeout') || err?.code === 'TIMEOUT';

    let errorType = ErrorType.SYSTEM;
    if (isNetworkError) {
      errorType = ErrorType.NETWORK;
    } else if (isTimeoutError) {
      errorType = ErrorType.TIMEOUT;
    }

    setErrorWithInfo(
      err?.message || '网络连接失败',
      errorType,
      isTimeoutError ? ErrorSeverity.MEDIUM : ErrorSeverity.HIGH,
      err?.code,
      context,
      true
    );
  }, [setErrorWithInfo]);

  // 验证错误处理
  const handleValidationError = useCallback((errors: string[], context?: Record<string, any>) => {
    const message = errors.join('; ');
    setErrorWithInfo(
      message,
      ErrorType.VALIDATION,
      ErrorSeverity.MEDIUM,
      'VALIDATION_ERROR',
      context,
      false
    );
  }, [setErrorWithInfo]);

  // 权限错误处理
  const handlePermissionError = useCallback((action: string, context?: Record<string, any>) => {
    setErrorWithInfo(
      `没有权限执行操作: ${action}`,
      ErrorType.PERMISSION,
      ErrorSeverity.HIGH,
      'PERMISSION_DENIED',
      context,
      false
    );
  }, [setErrorWithInfo]);

  // 业务逻辑错误处理
  const handleBusinessError = useCallback((message: string, context?: Record<string, any>) => {
    setErrorWithInfo(
      message,
      ErrorType.BUSINESS,
      ErrorSeverity.MEDIUM,
      'BUSINESS_ERROR',
      context,
      true
    );
  }, [setErrorWithInfo]);

  // 更新加载进度
  const updateProgress = useCallback((progress: number, message?: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
      ...(message && { message }),
    }));
  }, []);

  // 设置加载状态
  const setLoading = useCallback((state: Partial<LoadingStateWithProgress>) => {
    setLoadingState(prev => ({ ...prev, ...state }));
    setIsLoading(Object.values(state).some(Boolean));
  }, []);

  // 清理效果
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    // 错误状态
    error,
    isLoading,
    loadingState,

    // 错误操作
    setError: setErrorWithInfo,
    clearError,
    retry,

    // 便捷错误处理
    handleNetworkError,
    handleValidationError,
    handlePermissionError,
    handleBusinessError,

    // 加载状态操作
    setLoading,
    updateProgress,
    withErrorHandling,

    // 工具方法
    hasError: !!error,
    canRetry: error?.retryable && (error.retryCount || 0) < (error.maxRetries || 0),
    retryCount: error?.retryCount || 0,
    maxRetries: error?.maxRetries || retryConfig.maxRetries,
  };
};

// 全局错误边界Hook
export const useGlobalErrorHandler = () => {
  const { error, setError, clearError } = useErrorHandling();

  // 全局错误监听
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setError(
        event.reason?.message || '未处理的Promise错误',
        ErrorType.SYSTEM,
        ErrorSeverity.HIGH,
        'UNHANDLED_REJECTION',
        { promise: event.promise }
      );
    };

    const handleError = (event: ErrorEvent) => {
      setError(
        event.message || '脚本错误',
        ErrorType.SYSTEM,
        ErrorSeverity.HIGH,
        'SCRIPT_ERROR',
        { filename: event.filename, lineno: event.lineno, colno: event.colno }
      );
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [setError]);

  return { error, clearError };
};

// 错误Toast Hook
export const useErrorToast = () => {
  const { error, clearError } = useErrorHandling();

  // 显示错误提示
  const showErrorToast = useCallback((error: ErrorInfo) => {
    // 这里可以集成Ant Design的message或notification
    console.error(`[${error.type.toUpperCase()}] ${error.message}`);

    // 如果使用Ant Design:
    // message.error({
    //   content: error.message,
    //   duration: error.severity === ErrorSeverity.CRITICAL ? 0 : 4.5,
    // });
  }, []);

  // 自动显示错误
  useEffect(() => {
    if (error) {
      showErrorToast(error);
    }
  }, [error, showErrorToast]);

  return {
    showErrorToast,
    clearError,
  };
};

export default useErrorHandling;