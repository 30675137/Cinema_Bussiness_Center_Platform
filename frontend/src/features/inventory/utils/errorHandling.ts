/**
 * P004-inventory-adjustment: 统一错误处理工具
 *
 * 提供跨所有调整操作的一致性错误处理。
 * 实现 T063 任务。
 *
 * @since Phase 8 - Polish
 */

import { message, Modal } from 'antd';
import axios, { AxiosError } from 'axios';

/**
 * API 错误码枚举
 */
export enum ErrorCode {
  // 通用错误
  UNKNOWN = 'UNKNOWN',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',

  // 业务错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONCURRENT_MODIFICATION = 'CONCURRENT_MODIFICATION',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  ADJUSTMENT_NOT_FOUND = 'ADJUSTMENT_NOT_FOUND',
  INVALID_STATUS = 'INVALID_STATUS',
  APPROVAL_REQUIRED = 'APPROVAL_REQUIRED',
  ALREADY_APPROVED = 'ALREADY_APPROVED',
  ALREADY_REJECTED = 'ALREADY_REJECTED',
  CANNOT_WITHDRAW = 'CANNOT_WITHDRAW',
}

/**
 * 错误码到中文消息的映射
 */
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.UNKNOWN]: '未知错误，请稍后重试',
  [ErrorCode.NETWORK_ERROR]: '网络连接失败，请检查网络后重试',
  [ErrorCode.TIMEOUT]: '请求超时，请稍后重试',
  [ErrorCode.UNAUTHORIZED]: '登录已过期，请重新登录',
  [ErrorCode.FORBIDDEN]: '您没有权限执行此操作',
  [ErrorCode.NOT_FOUND]: '请求的资源不存在',

  [ErrorCode.VALIDATION_ERROR]: '输入数据格式错误，请检查后重试',
  [ErrorCode.CONCURRENT_MODIFICATION]: '数据已被他人修改，请刷新后重试',
  [ErrorCode.INSUFFICIENT_STOCK]: '库存不足，无法完成调整',
  [ErrorCode.ADJUSTMENT_NOT_FOUND]: '调整记录不存在',
  [ErrorCode.INVALID_STATUS]: '当前状态不允许执行此操作',
  [ErrorCode.APPROVAL_REQUIRED]: '此调整需要审批',
  [ErrorCode.ALREADY_APPROVED]: '该记录已被审批通过',
  [ErrorCode.ALREADY_REJECTED]: '该记录已被驳回',
  [ErrorCode.CANNOT_WITHDRAW]: '当前状态无法撤回',
};

/**
 * API 错误响应结构
 */
export interface ApiErrorResponse {
  success: false;
  error?: string;
  message?: string;
  code?: ErrorCode | string;
  details?: Record<string, string[]>;
}

/**
 * 解析错误码
 */
export function parseErrorCode(error: unknown): ErrorCode {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    // 网络错误
    if (!axiosError.response) {
      if (axiosError.code === 'ECONNABORTED') {
        return ErrorCode.TIMEOUT;
      }
      return ErrorCode.NETWORK_ERROR;
    }

    // HTTP 状态码
    const status = axiosError.response.status;
    if (status === 401) return ErrorCode.UNAUTHORIZED;
    if (status === 403) return ErrorCode.FORBIDDEN;
    if (status === 404) return ErrorCode.NOT_FOUND;
    if (status === 409) return ErrorCode.CONCURRENT_MODIFICATION;
    if (status === 422) return ErrorCode.VALIDATION_ERROR;

    // 业务错误码
    const code = axiosError.response.data?.code || axiosError.response.data?.error;
    if (code && Object.values(ErrorCode).includes(code as ErrorCode)) {
      return code as ErrorCode;
    }
  }

  return ErrorCode.UNKNOWN;
}

/**
 * 获取错误消息
 */
export function getErrorMessage(error: unknown): string {
  // 优先使用服务器返回的消息
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
  }

  // 使用错误码对应的默认消息
  const code = parseErrorCode(error);
  return ERROR_MESSAGES[code] || ERROR_MESSAGES[ErrorCode.UNKNOWN];
}

/**
 * 显示错误提示
 */
export function showError(error: unknown, fallbackMessage?: string): void {
  const errorMessage = getErrorMessage(error);
  message.error(fallbackMessage || errorMessage);
}

/**
 * 显示冲突错误弹窗
 */
export function showConflictModal(options: {
  onRefresh?: () => void;
  title?: string;
  content?: string;
}): void {
  Modal.warning({
    title: options.title || '数据冲突',
    content: options.content || '该记录已被他人修改，请刷新后重试。',
    okText: '刷新',
    onOk: options.onRefresh,
  });
}

/**
 * 显示授权错误
 */
export function showUnauthorizedError(): void {
  Modal.error({
    title: '登录已过期',
    content: '您的登录状态已过期，请重新登录。',
    okText: '去登录',
    onOk: () => {
      // 可以跳转到登录页面
      window.location.href = '/login';
    },
  });
}

/**
 * 判断是否为特定错误类型
 */
export function isErrorCode(error: unknown, code: ErrorCode): boolean {
  return parseErrorCode(error) === code;
}

/**
 * 判断是否为网络相关错误
 */
export function isNetworkError(error: unknown): boolean {
  const code = parseErrorCode(error);
  return code === ErrorCode.NETWORK_ERROR || code === ErrorCode.TIMEOUT;
}

/**
 * 判断是否为授权相关错误
 */
export function isAuthError(error: unknown): boolean {
  const code = parseErrorCode(error);
  return code === ErrorCode.UNAUTHORIZED || code === ErrorCode.FORBIDDEN;
}

/**
 * 判断是否为冲突错误
 */
export function isConflictError(error: unknown): boolean {
  return parseErrorCode(error) === ErrorCode.CONCURRENT_MODIFICATION;
}

/**
 * 统一错误处理函数
 *
 * 根据错误类型执行不同的处理逻辑
 */
export function handleApiError(
  error: unknown,
  options: {
    onConflict?: () => void;
    onUnauthorized?: () => void;
    onNotFound?: () => void;
    fallbackMessage?: string;
  } = {}
): void {
  const code = parseErrorCode(error);

  switch (code) {
    case ErrorCode.CONCURRENT_MODIFICATION:
      if (options.onConflict) {
        showConflictModal({ onRefresh: options.onConflict });
      } else {
        showError(error);
      }
      break;

    case ErrorCode.UNAUTHORIZED:
      if (options.onUnauthorized) {
        options.onUnauthorized();
      } else {
        showUnauthorizedError();
      }
      break;

    case ErrorCode.NOT_FOUND:
      if (options.onNotFound) {
        options.onNotFound();
      } else {
        showError(error, options.fallbackMessage || '资源不存在');
      }
      break;

    default:
      showError(error, options.fallbackMessage);
  }
}

export default {
  ErrorCode,
  parseErrorCode,
  getErrorMessage,
  showError,
  showConflictModal,
  showUnauthorizedError,
  isErrorCode,
  isNetworkError,
  isAuthError,
  isConflictError,
  handleApiError,
};
