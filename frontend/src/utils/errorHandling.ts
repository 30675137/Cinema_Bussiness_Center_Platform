/**
 * 错误处理工具类
 * 提供统一的错误处理、日志记录和用户反馈机制
 */

import { message, notification } from 'antd';
import type { AxiosError } from 'axios';

// 错误类型枚举
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  BUSINESS = 'BUSINESS',
  SYSTEM = 'SYSTEM',
  UNKNOWN = 'UNKNOWN',
}

// 错误级别枚举
export enum ErrorLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// 错误信息接口
export interface ErrorInfo {
  type: ErrorType;
  level: ErrorLevel;
  message: string;
  details?: string;
  code?: string | number;
  timestamp: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  stack?: string;
  context?: Record<string, any>;
}

// 错误处理配置
export interface ErrorHandlerConfig {
  enableLogging: boolean;
  enableNotification: boolean;
  enableMessage: boolean;
  logEndpoint?: string;
  maxErrorCount: number;
  errorCountWindow: number; // 毫秒
}

/**
 * 错误处理工具类
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private config: ErrorHandlerConfig;
  private errorQueue: ErrorInfo[] = [];
  private errorCount = new Map<string, number>();
  private lastErrorTime = new Map<string, number>();

  private constructor() {
    this.config = {
      enableLogging: true,
      enableNotification: true,
      enableMessage: true,
      maxErrorCount: 5,
      errorCountWindow: 30000, // 30秒内最多显示5个错误
    };
  }

  /**
   * 获取单例实例
   */
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * 配置错误处理器
   */
  configure(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 处理错误
   */
  handleError(error: any, context?: Record<string, any>): void {
    const errorInfo = this.parseError(error, context);
    this.processError(errorInfo);
  }

  /**
   * 处理网络错误
   */
  handleNetworkError(error: AxiosError, context?: Record<string, any>): void {
    const errorInfo: ErrorInfo = {
      type: ErrorType.NETWORK,
      level: ErrorLevel.ERROR,
      message: this.getNetworkErrorMessage(error),
      details: error.message,
      code: error.response?.status,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      stack: error.stack,
      context,
    };

    this.processError(errorInfo);
  }

  /**
   * 处理业务错误
   */
  handleBusinessError(message: string, details?: string, context?: Record<string, any>): void {
    const errorInfo: ErrorInfo = {
      type: ErrorType.BUSINESS,
      level: ErrorLevel.WARNING,
      message,
      details,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context,
    };

    this.processError(errorInfo);
  }

  /**
   * 处理验证错误
   */
  handleValidationError(errors: Record<string, string>, context?: Record<string, any>): void {
    const errorMessage = Object.values(errors).join(', ');
    const errorInfo: ErrorInfo = {
      type: ErrorType.VALIDATION,
      level: ErrorLevel.WARNING,
      message: '表单验证失败',
      details: errorMessage,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context: { ...context, errors },
    };

    this.processError(errorInfo);
  }

  /**
   * 处理权限错误
   */
  handlePermissionError(message: string = '权限不足', context?: Record<string, any>): void {
    const errorInfo: ErrorInfo = {
      type: ErrorType.PERMISSION,
      level: ErrorLevel.WARNING,
      message,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context,
    };

    this.processError(errorInfo);
  }

  /**
   * 解析错误信息
   */
  private parseError(error: any, context?: Record<string, any>): ErrorInfo {
    if (error instanceof Error) {
      return {
        type: this.getErrorType(error),
        level: ErrorLevel.ERROR,
        message: error.message,
        details: error.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        stack: error.stack,
        context,
      };
    }

    return {
      type: ErrorType.UNKNOWN,
      level: ErrorLevel.ERROR,
      message: String(error),
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context,
    };
  }

  /**
   * 获取错误类型
   */
  private getErrorType(error: Error): ErrorType {
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      return ErrorType.NETWORK;
    }
    if (error.message.includes('permission') || error.message.includes('授权')) {
      return ErrorType.PERMISSION;
    }
    if (error.message.includes('validation') || error.message.includes('验证')) {
      return ErrorType.VALIDATION;
    }
    return ErrorType.SYSTEM;
  }

  /**
   * 获取网络错误信息
   */
  private getNetworkErrorMessage(error: AxiosError): string {
    if (!error.response) {
      return '网络连接失败，请检查网络设置';
    }

    const status = error.response.status;
    switch (status) {
      case 400:
        return '请求参数错误';
      case 401:
        return '身份验证失败，请重新登录';
      case 403:
        return '权限不足，无法访问该资源';
      case 404:
        return '请求的资源不存在';
      case 500:
        return '服务器内部错误，请稍后重试';
      case 502:
        return '网关错误，请稍后重试';
      case 503:
        return '服务暂时不可用，请稍后重试';
      default:
        return `网络错误 (${status})，请稍后重试`;
    }
  }

  /**
   * 处理错误信息
   */
  private processError(errorInfo: ErrorInfo): void {
    // 记录错误日志
    if (this.config.enableLogging) {
      this.logError(errorInfo);
    }

    // 检查错误频率
    const errorKey = `${errorInfo.type}-${errorInfo.message}`;
    const now = Date.now();
    const lastTime = this.lastErrorTime.get(errorKey) || 0;

    if (now - lastTime < this.config.errorCountWindow) {
      const count = this.errorCount.get(errorKey) || 0;
      if (count >= this.config.maxErrorCount) {
        return; // 限制相同错误的显示频率
      }
      this.errorCount.set(errorKey, count + 1);
    } else {
      this.errorCount.set(errorKey, 1);
      this.lastErrorTime.set(errorKey, now);
    }

    // 显示用户反馈
    this.showUserFeedback(errorInfo);
  }

  /**
   * 记录错误日志
   */
  private logError(errorInfo: ErrorInfo): void {
    // 控制台输出
    console.group(`🚨 [${errorInfo.level.toUpperCase()}] ${errorInfo.type}`);
    console.error('Message:', errorInfo.message);
    if (errorInfo.details) {
      console.error('Details:', errorInfo.details);
    }
    if (errorInfo.context) {
      console.error('Context:', errorInfo.context);
    }
    console.groupEnd();

    // 添加到错误队列（用于调试）
    this.errorQueue.unshift(errorInfo);
    if (this.errorQueue.length > 100) {
      this.errorQueue = this.errorQueue.slice(0, 100);
    }

    // 发送到日志服务器（如果配置了）
    if (this.config.logEndpoint && this.shouldSendToServer(errorInfo)) {
      this.sendErrorToServer(errorInfo);
    }
  }

  /**
   * 显示用户反馈
   */
  private showUserFeedback(errorInfo: ErrorInfo): void {
    const { message, details, level } = errorInfo;

    // 高级别错误使用通知
    if (level === ErrorLevel.CRITICAL || errorInfo.type === ErrorType.NETWORK) {
      notification.error({
        message: '系统错误',
        description: details || message,
        duration: 0, // 不自动关闭
      });
      return;
    }

    // 中级错误使用通知
    if (level === ErrorLevel.ERROR || errorInfo.type === ErrorType.PERMISSION) {
      notification.error({
        message: '操作失败',
        description: details || message,
        duration: 6,
      });
      return;
    }

    // 低级错误使用消息提示
    if (this.config.enableMessage) {
      const messageType = level === ErrorLevel.WARNING ? 'warning' : 'error';
      message[messageType]({
        content: details || message,
        duration: 4,
      });
    }
  }

  /**
   * 判断是否应该发送到服务器
   */
  private shouldSendToServer(errorInfo: ErrorInfo): boolean {
    // 只发送ERROR和CRITICAL级别的错误
    return errorInfo.level === ErrorLevel.ERROR || errorInfo.level === ErrorLevel.CRITICAL;
  }

  /**
   * 发送错误到服务器
   */
  private async sendErrorToServer(errorInfo: ErrorInfo): Promise<void> {
    try {
      if (!this.config.logEndpoint) return;

      await fetch(this.config.logEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorInfo),
      });
    } catch (error) {
      console.warn('Failed to send error to server:', error);
    }
  }

  /**
   * 获取错误历史
   */
  getErrorHistory(): ErrorInfo[] {
    return [...this.errorQueue];
  }

  /**
   * 清空错误历史
   */
  clearErrorHistory(): void {
    this.errorQueue = [];
  }

  /**
   * 清空错误计数
   */
  clearErrorCount(): void {
    this.errorCount.clear();
    this.lastErrorTime.clear();
  }
}

// 创建全局错误处理器实例
export const errorHandler = ErrorHandler.getInstance();

// 全局错误处理函数
export const handleError = (error: any, context?: Record<string, any>) => {
  errorHandler.handleError(error, context);
};

export const handleNetworkError = (error: AxiosError, context?: Record<string, any>) => {
  errorHandler.handleNetworkError(error, context);
};

export const handleBusinessError = (
  message: string,
  details?: string,
  context?: Record<string, any>
) => {
  errorHandler.handleBusinessError(message, details, context);
};

export const handleValidationError = (
  errors: Record<string, string>,
  context?: Record<string, any>
) => {
  errorHandler.handleValidationError(errors, context);
};

export const handlePermissionError = (message?: string, context?: Record<string, any>) => {
  errorHandler.handlePermissionError(message, context);
};

/**
 * React错误边界专用处理函数
 */
export const handleReactError = (error: Error, errorInfo: any): void => {
  const errorInfoData: ErrorInfo = {
    type: ErrorType.SYSTEM,
    level: ErrorLevel.CRITICAL,
    message: 'React组件渲染错误',
    details: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    context: {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    },
  };

  errorHandler.processError(errorInfoData);
};

/**
 * 异步操作错误包装器
 */
export const withErrorHandling = async <T>(
  asyncFn: () => Promise<T>,
  context?: Record<string, any>
): Promise<T> => {
  try {
    return await asyncFn();
  } catch (error) {
    handleError(error, context);
    throw error;
  }
};

/**
 * API响应错误处理
 */
export const handleApiResponseError = (response: any): void => {
  if (!response.success && response.message) {
    handleBusinessError(response.message, response.details, {
      code: response.code,
      data: response.data,
    });
  }
};

export default errorHandler;
