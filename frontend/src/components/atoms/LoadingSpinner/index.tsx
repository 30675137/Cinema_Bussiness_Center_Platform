/**
 * @spec O003-beverage-order
 * LoadingSpinner - 通用加载中组件
 */
import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export interface LoadingSpinnerProps {
  /**
   * 加载提示文字
   */
  tip?: string;
  /**
   * 尺寸大小
   */
  size?: 'small' | 'default' | 'large';
  /**
   * 是否全屏居中
   */
  fullscreen?: boolean;
  /**
   * 自定义类名
   */
  className?: string;
}

/**
 * 加载中组件
 *
 * 使用场景:
 * - 数据加载中
 * - 页面切换
 * - 异步操作等待
 *
 * @example
 * ```tsx
 * // 默认使用
 * <LoadingSpinner />
 *
 * // 带提示文字
 * <LoadingSpinner tip="加载中..." />
 *
 * // 全屏居中
 * <LoadingSpinner tip="正在加载订单数据..." fullscreen />
 * ```
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  tip = '加载中...',
  size = 'default',
  fullscreen = false,
  className = '',
}) => {
  const antIcon = (
    <LoadingOutlined
      style={{ fontSize: size === 'large' ? 48 : size === 'small' ? 16 : 24 }}
      spin
    />
  );

  if (fullscreen) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${className}`}>
        <Spin indicator={antIcon} tip={tip} size={size} />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <Spin indicator={antIcon} tip={tip} size={size} />
    </div>
  );
};

export default LoadingSpinner;
