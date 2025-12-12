/**
 * 错误处理工具函数
 * 提供统一的错误处理和错误消息格式化
 */
import { message } from 'antd';

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
}

/**
 * 解析错误对象，提取错误信息
 */
export const parseError = (error: any): ErrorInfo => {
  // 如果已经是格式化后的错误信息
  if (error?.type && error?.message) {
    return error;
  }

  // 网络错误
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('network') || error?.message?.includes('Network')) {
    return {
      type: ErrorType.NETWORK,
      message: '网络连接失败，请检查网络设置后重试',
      code: error?.code,
      details: error,
    };
  }

  // 404 错误
  if (error?.status === 404 || error?.code === 'NOT_FOUND' || error?.message?.includes('not found')) {
    return {
      type: ErrorType.NOT_FOUND,
      message: '请求的资源不存在',
      code: error?.code,
      details: error,
    };
  }

  // 403 权限错误
  if (error?.status === 403 || error?.code === 'FORBIDDEN' || error?.message?.includes('permission')) {
    return {
      type: ErrorType.PERMISSION,
      message: '您没有权限执行此操作',
      code: error?.code,
      details: error,
    };
  }

  // 表单验证错误
  if (error?.errorFields || error?.name === 'ValidationError') {
    return {
      type: ErrorType.VALIDATION,
      message: '表单验证失败，请检查输入内容',
      code: 'VALIDATION_ERROR',
      details: error?.errorFields || error,
    };
  }

  // 服务器错误（5xx）
  if (error?.status >= 500 || error?.code === 'SERVER_ERROR') {
    return {
      type: ErrorType.SERVER,
      message: '服务器错误，请稍后重试',
      code: error?.code,
      details: error,
    };
  }

  // 从错误消息中提取信息
  const errorMessage = error?.message || error?.error?.message || error?.response?.data?.message || '操作失败';

  return {
    type: ErrorType.UNKNOWN,
    message: errorMessage,
    code: error?.code || error?.response?.data?.code,
    details: error,
  };
};

/**
 * 显示错误消息
 */
export const showError = (error: any, defaultMessage?: string): void => {
  const errorInfo = parseError(error);
  const messageToShow = defaultMessage || errorInfo.message;
  
  message.error(messageToShow);
  
  // 在开发环境下输出详细错误信息
  if (process.env.NODE_ENV === 'development') {
    console.error('错误详情:', errorInfo);
  }
};

/**
 * 显示成功消息
 */
export const showSuccess = (msg: string): void => {
  message.success(msg);
};

/**
 * 显示警告消息
 */
export const showWarning = (msg: string): void => {
  message.warning(msg);
};

/**
 * 显示信息消息
 */
export const showInfo = (msg: string): void => {
  message.info(msg);
};

/**
 * 处理异步操作的错误
 */
export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> => {
  try {
    return await asyncFn();
  } catch (error) {
    showError(error, errorMessage);
    return null;
  }
};

/**
 * 获取友好的错误消息
 */
export const getFriendlyErrorMessage = (error: any, context?: string): string => {
  const errorInfo = parseError(error);
  
  // 根据上下文添加更具体的错误信息
  if (context) {
    return `${context}：${errorInfo.message}`;
  }
  
  return errorInfo.message;
};

