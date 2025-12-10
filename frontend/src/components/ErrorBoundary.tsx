import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Result, Button } from 'antd';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // 在生产环境中，这里可以将错误信息发送到错误监控服务
    if (import.meta.env.PROD) {
      this.logErrorToService(error, errorInfo);
    } else {
      console.error('ErrorBoundary捕获到错误:', error, errorInfo);
    }
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // 这里可以集成错误监控服务，如Sentry
    try {
      // 示例：发送错误信息到监控服务
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // 这里可以调用API发送错误信息
      console.log('错误信息已记录:', errorData);
    } catch (err) {
      console.error('发送错误信息失败:', err);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 如果有自定义fallback，使用自定义fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误页面
      return (
        <div style={{
          padding: '50px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5'
        }}>
          <Result
            status="error"
            title="应用程序遇到错误"
            subTitle={
              import.meta.env.DEV ? (
                <div>
                  <p>错误信息: {this.state.error?.message}</p>
                  <details style={{ marginTop: '16px' }}>
                    <summary>查看详细错误信息</summary>
                    <pre style={{
                      background: '#f5f5f5',
                      padding: '12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      overflow: 'auto',
                      maxHeight: '200px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {this.state.error?.stack}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                </div>
              ) : (
                '系统遇到意外错误，请稍后重试或联系技术支持。'
              )
            }
            extra={[
              <Button type="primary" key="reset" onClick={this.handleReset}>
                重试
              </Button>,
              <Button key="reload" onClick={this.handleReload}>
                刷新页面
              </Button>,
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;