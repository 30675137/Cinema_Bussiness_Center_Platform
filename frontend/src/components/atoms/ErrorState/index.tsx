/**
 * @spec O003-beverage-order
 * ErrorState - 通用错误状态组件
 */
import React from 'react';
import { Button, Result } from 'antd';
import type { ResultStatusType } from 'antd/es/result';

export interface ErrorStateProps {
  /**
   * 错误标题
   */
  title?: string;
  /**
   * 错误描述
   */
  description?: string;
  /**
   * 错误状态类型
   */
  status?: ResultStatusType;
  /**
   * 重试按钮文字
   */
  retryText?: string;
  /**
   * 重试回调
   */
  onRetry?: () => void;
  /**
   * 额外操作按钮
   */
  extra?: React.ReactNode;
  /**
   * 自定义类名
   */
  className?: string;
}

/**
 * 错误状态组件
 *
 * 使用场景:
 * - API 请求失败
 * - 数据加载错误
 * - 权限不足
 * - 404 资源不存在
 *
 * @example
 * ```tsx
 * // 默认错误状态
 * <ErrorState />
 *
 * // 带重试功能
 * <ErrorState
 *   title="加载失败"
 *   description="网络连接失败，请检查网络后重试"
 *   onRetry={() => refetch()}
 * />
 *
 * // 自定义状态
 * <ErrorState
 *   status="404"
 *   title="订单不存在"
 *   description="该订单已被删除或不存在"
 * />
 * ```
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = '出错了',
  description = '数据加载失败，请稍后重试',
  status = 'error',
  retryText = '重试',
  onRetry,
  extra,
  className = '',
}) => {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <Result
        status={status}
        title={title}
        subTitle={description}
        extra={
          extra ||
          (onRetry && (
            <Button type="primary" onClick={onRetry}>
              {retryText}
            </Button>
          ))
        }
      />
    </div>
  );
};

export default ErrorState;
