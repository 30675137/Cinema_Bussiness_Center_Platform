/**
 * @spec M002-material-filter
 * Material Error Boundary Component
 * 
 * 捕获物料管理组件树中的错误，显示友好的错误提示
 */
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Alert, Button, Space } from 'antd'
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class MaterialErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误到控制台
    console.error('MaterialErrorBoundary caught an error:', error, errorInfo)
    
    // 更新状态
    this.setState({
      error,
      errorInfo,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
          <Alert
            message="物料管理功能出现错误"
            description={
              <div>
                <p>抱歉，物料管理功能遇到了一个意外错误。请尝试以下操作：</p>
                <ul>
                  <li>刷新页面重新加载</li>
                  <li>返回首页重新导航</li>
                  <li>如果问题持续存在，请联系技术支持</li>
                </ul>
                {this.state.error && (
                  <details style={{ marginTop: '16px' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                      错误详情（点击展开）
                    </summary>
                    <pre
                      style={{
                        marginTop: '8px',
                        padding: '12px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                        overflow: 'auto',
                        maxHeight: '300px',
                      }}
                    >
                      {this.state.error.toString()}
                      {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            }
            type="error"
            showIcon
          />
          
          <Space style={{ marginTop: '24px' }}>
            <Button type="primary" icon={<ReloadOutlined />} onClick={this.handleReload}>
              刷新页面
            </Button>
            <Button icon={<HomeOutlined />} onClick={this.handleGoHome}>
              返回首页
            </Button>
          </Space>
        </div>
      )
    }

    return this.props.children
  }
}
