/**
 * 场景包编辑器错误处理工具
 * Feature: 001-scenario-package-tabs
 * T095: Comprehensive error messages for all API failure scenarios
 */

import { message, notification } from 'antd';
import type { AxiosError } from 'axios';

/**
 * API错误响应类型
 */
interface ApiErrorResponse {
  code?: string;
  message?: string;
  details?: Record<string, string[]>;
  missingItems?: string[];
}

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  CONFLICT = 'CONFLICT',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * 错误信息映射
 */
const ERROR_MESSAGES: Record<ErrorType, { title: string; description: string }> = {
  [ErrorType.NETWORK]: {
    title: '网络连接失败',
    description: '请检查您的网络连接后重试',
  },
  [ErrorType.UNAUTHORIZED]: {
    title: '登录已过期',
    description: '请重新登录后继续操作',
  },
  [ErrorType.FORBIDDEN]: {
    title: '权限不足',
    description: '您没有权限执行此操作',
  },
  [ErrorType.NOT_FOUND]: {
    title: '资源不存在',
    description: '请求的数据不存在或已被删除',
  },
  [ErrorType.VALIDATION]: {
    title: '数据验证失败',
    description: '请检查输入数据是否正确',
  },
  [ErrorType.CONFLICT]: {
    title: '数据冲突',
    description: '数据已被其他用户修改，请刷新后重试',
  },
  [ErrorType.SERVER]: {
    title: '服务器错误',
    description: '服务器处理请求时发生错误，请稍后重试',
  },
  [ErrorType.UNKNOWN]: {
    title: '未知错误',
    description: '发生未知错误，请稍后重试',
  },
};

/**
 * 场景包编辑器特定错误消息
 */
const SCENARIO_PACKAGE_ERROR_MESSAGES: Record<string, string> = {
  // 基础信息相关
  BASIC_INFO_INCOMPLETE: '请完成基础信息的填写（名称、分类、主图）',
  NAME_REQUIRED: '场景包名称不能为空',
  NAME_TOO_LONG: '场景包名称不能超过100个字符',
  CATEGORY_REQUIRED: '请选择场景包分类',
  MAIN_IMAGE_REQUIRED: '请上传场景包主图',

  // 套餐相关
  NO_PACKAGES: '请至少添加一个套餐',
  PACKAGE_PRICE_INVALID: '套餐价格必须大于0',
  ORIGINAL_PRICE_LESS_THAN_PRICE: '原价必须大于或等于售价',
  PACKAGE_NAME_DUPLICATE: '套餐名称不能重复',

  // 加购项相关
  ADDON_NOT_FOUND: '加购项不存在或已下架',
  ADDON_ALREADY_ASSOCIATED: '该加购项已关联',

  // 时段相关
  NO_TIME_SLOTS: '请至少配置一个时段模板',
  TIME_SLOT_CONFLICT: '时段存在冲突，请检查时间范围',
  END_TIME_BEFORE_START: '结束时间必须晚于开始时间',

  // 发布相关
  PUBLISH_VALIDATION_FAILED: '发布验证失败，请检查必填项',
  ALREADY_PUBLISHED: '场景包已发布',
  ALREADY_ARCHIVED: '场景包已下架',
  EFFECTIVE_DATE_INVALID: '生效日期设置无效',
  END_DATE_BEFORE_START: '结束日期必须晚于开始日期',
};

/**
 * 获取错误类型
 */
export function getErrorType(error: unknown): ErrorType {
  if (!error) return ErrorType.UNKNOWN;

  // 网络错误
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return ErrorType.NETWORK;
  }

  // Axios 错误
  const axiosError = error as AxiosError<ApiErrorResponse>;
  if (axiosError.response) {
    const status = axiosError.response.status;
    switch (status) {
      case 401:
        return ErrorType.UNAUTHORIZED;
      case 403:
        return ErrorType.FORBIDDEN;
      case 404:
        return ErrorType.NOT_FOUND;
      case 400:
      case 422:
        return ErrorType.VALIDATION;
      case 409:
        return ErrorType.CONFLICT;
      case 500:
      case 502:
      case 503:
      case 504:
        return ErrorType.SERVER;
      default:
        return ErrorType.UNKNOWN;
    }
  }

  // 网络错误（无响应）
  if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ERR_NETWORK') {
    return ErrorType.NETWORK;
  }

  return ErrorType.UNKNOWN;
}

/**
 * 获取错误消息
 */
export function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiErrorResponse>;

  // 尝试获取后端返回的错误信息
  if (axiosError.response?.data) {
    const data = axiosError.response.data;

    // 检查是否有特定错误码
    if (data.code && SCENARIO_PACKAGE_ERROR_MESSAGES[data.code]) {
      return SCENARIO_PACKAGE_ERROR_MESSAGES[data.code];
    }

    // 返回后端消息
    if (data.message) {
      return data.message;
    }

    // 处理验证错误详情
    if (data.details) {
      const messages = Object.values(data.details).flat();
      if (messages.length > 0) {
        return messages.join('；');
      }
    }

    // 处理发布验证错误
    if (data.missingItems && data.missingItems.length > 0) {
      return `缺少必填项：${data.missingItems.join('、')}`;
    }
  }

  // 使用默认错误消息
  const errorType = getErrorType(error);
  return ERROR_MESSAGES[errorType].description;
}

/**
 * 显示错误通知
 */
export function showErrorNotification(error: unknown, customTitle?: string): void {
  const errorType = getErrorType(error);
  const { title, description } = ERROR_MESSAGES[errorType];
  const errorMessage = getErrorMessage(error);

  notification.error({
    message: customTitle || title,
    description: errorMessage || description,
    duration: 5,
  });
}

/**
 * 显示错误消息（简洁版）
 */
export function showErrorMessage(error: unknown, prefix?: string): void {
  const errorMessage = getErrorMessage(error);
  message.error(prefix ? `${prefix}：${errorMessage}` : errorMessage);
}

/**
 * 显示成功消息
 */
export function showSuccessMessage(msg: string): void {
  message.success(msg);
}

/**
 * 显示成功通知
 */
export function showSuccessNotification(title: string, description?: string): void {
  notification.success({
    message: title,
    description,
    duration: 3,
  });
}

/**
 * 处理 mutation 错误
 * 用于 TanStack Query 的 onError 回调
 */
export function handleMutationError(
  error: unknown,
  context: {
    operation: string;
    onUnauthorized?: () => void;
    onNotFound?: () => void;
    onValidationError?: (details: Record<string, string[]>) => void;
  }
): void {
  const errorType = getErrorType(error);
  const axiosError = error as AxiosError<ApiErrorResponse>;

  // 特殊处理
  switch (errorType) {
    case ErrorType.UNAUTHORIZED:
      context.onUnauthorized?.();
      break;
    case ErrorType.NOT_FOUND:
      context.onNotFound?.();
      break;
    case ErrorType.VALIDATION:
      if (axiosError.response?.data?.details) {
        context.onValidationError?.(axiosError.response.data.details);
      }
      break;
  }

  // 显示通知
  showErrorNotification(error, `${context.operation}失败`);

  // 开发环境下打印详细错误
  if (import.meta.env.DEV) {
    console.error(`[${context.operation}] 错误详情:`, error);
  }
}

/**
 * 创建错误边界回退组件的错误信息
 */
export function formatErrorForBoundary(error: Error): {
  title: string;
  message: string;
  stack?: string;
} {
  return {
    title: '页面加载出错',
    message: error.message || '发生未知错误',
    stack: import.meta.env.DEV ? error.stack : undefined,
  };
}

/**
 * 日志记录（生产环境可对接 Sentry 等服务）
 */
export function logError(
  error: unknown,
  context?: {
    operation?: string;
    packageId?: string;
    userId?: string;
    extra?: Record<string, unknown>;
  }
): void {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    errorType: getErrorType(error),
    errorMessage: getErrorMessage(error),
    ...context,
  };

  // 开发环境下打印
  if (import.meta.env.DEV) {
    console.error('[Error Log]', errorInfo, error);
  }

  // TODO: 生产环境对接 Sentry
  // if (import.meta.env.PROD && typeof Sentry !== 'undefined') {
  //   Sentry.captureException(error, { extra: errorInfo });
  // }
}

export default {
  getErrorType,
  getErrorMessage,
  showErrorNotification,
  showErrorMessage,
  showSuccessMessage,
  showSuccessNotification,
  handleMutationError,
  formatErrorForBoundary,
  logError,
};
