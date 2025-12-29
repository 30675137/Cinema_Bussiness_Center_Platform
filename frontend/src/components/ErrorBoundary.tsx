/**
 * ErrorBoundary 组件
 * 全局错误边界 - 捕获并优雅处理 React 组件树中的 JavaScript 错误
 * Feature: 001-scenario-package-tabs
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Result, Button, Typography, Collapse, Space } from 'antd';
import { ReloadOutlined, BugOutlined, HomeOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

interface ErrorBoundaryProps {
  /** 子组件 */
  children: ReactNode;
  /** 自定义错误回调 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** 自定义错误 UI */
  fallback?: ReactNode;
  /** 是否显示详细错误信息（开发模式） */
  showDetails?: boolean;
  /** 重试回调 */
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 错误边界组件
 * 用于捕获子组件树中的 JavaScript 错误，记录错误日志，并显示备用 UI
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // 更新 state 以便下次渲染显示备用 UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 记录错误信息
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({ errorInfo });
    
    // 调用自定义错误回调
    this.props.onError?.(error, errorInfo);
    
    // TODO: 可以在这里发送错误到错误监控服务（如 Sentry）
    // if (typeof window !== 'undefined' && (window as any).Sentry) {
    //   (window as any).Sentry.captureException(error);
    // }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onRetry?.();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = process.env.NODE_ENV === 'development' } = this.props;

    if (hasError) {
      // 如果提供了自定义 fallback，使用自定义 UI
      if (fallback) {
        return fallback;
      }

      // 默认错误 UI
      return (
        <div style={{ padding: 24, minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Result
            status="error"
            title="页面出现问题"
            subTitle="抱歉，页面遇到了一些问题。请尝试刷新页面或返回首页。"
            extra={
              <Space>
                <Button type="primary" icon={<ReloadOutlined />} onClick={this.handleRetry}>
                  重试
                </Button>
                <Button icon={<ReloadOutlined />} onClick={this.handleReload}>
                  刷新页面
                </Button>
                <Button icon={<HomeOutlined />} onClick={this.handleGoHome}>
                  返回首页
                </Button>
              </Space>
            }
          >
            {showDetails && error && (
              <div style={{ marginTop: 24, textAlign: 'left' }}>
                <Collapse
                  items={[
                    {
                      key: 'details',
                      label: (
                        <Space>
                          <BugOutlined />
                          <Text type="secondary">技术详情（开发人员）</Text>
                        </Space>
                      ),
                      children: (
                        <div>
                          <Paragraph>
                            <Text strong>错误信息：</Text>
                          </Paragraph>
                          <Paragraph code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {error.message}
                          </Paragraph>
                          
                          {error.stack && (
                            <>
                              <Paragraph>
                                <Text strong>错误堆栈：</Text>
                              </Paragraph>
                              <Paragraph
                                code
                                style={{
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                  maxHeight: 200,
                                  overflow: 'auto',
                                  fontSize: 12,
                                }}
                              >
                                {error.stack}
                              </Paragraph>
                            </>
                          )}
                          
                          {errorInfo?.componentStack && (
                            <>
                              <Paragraph>
                                <Text strong>组件堆栈：</Text>
                              </Paragraph>
                              <Paragraph
                                code
                                style={{
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                  maxHeight: 200,
                                  overflow: 'auto',
                                  fontSize: 12,
                                }}
                              >
                                {errorInfo.componentStack}
                              </Paragraph>
                            </>
                          )}
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            )}
          </Result>
        </div>
      );
    }

    return children;
  }
}

/**
 * 函数组件包装器 - 提供 hooks 支持
 */
interface ErrorBoundaryWrapperProps extends ErrorBoundaryProps {
  /** 错误边界的唯一 key，用于重置边界 */
  resetKey?: string | number;
}

/**
 * ErrorBoundary 包装组件
 * 支持通过 resetKey 重置错误状态
 */
export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({
  resetKey,
  ...props
}) => {
  return <ErrorBoundary key={resetKey} {...props} />;
};

export default ErrorBoundary;
