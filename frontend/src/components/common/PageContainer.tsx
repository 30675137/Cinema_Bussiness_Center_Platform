import React, { ReactNode } from 'react';
import { Breadcrumb, Card, Space, Button, Typography, Row, Col } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export interface PageContainerProps {
  title?: string;
  subtitle?: string;
  breadcrumb?: Array<{ title: string; path?: string }>;
  extra?: ReactNode;
  children?: ReactNode;
  showBack?: boolean;
  backText?: string;
  onBack?: () => void;
  className?: string;
  style?: React.CSSProperties;
  header?: ReactNode;
  footer?: ReactNode;
  bordered?: boolean;
  size?: 'default' | 'small';
}

const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  breadcrumb,
  extra,
  children,
  showBack = false,
  backText = '返回',
  onBack,
  className = '',
  style,
  header,
  footer,
  bordered = false,
  size = 'default',
}) => {
  const navigate = useNavigate();

  // 处理返回操作
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // 渲染面包屑
  const renderBreadcrumb = () => {
    if (!breadcrumb || breadcrumb.length === 0) {
      return null;
    }

    return (
      <Breadcrumb className="mb-4">
        {breadcrumb.map((item, index) => (
          <Breadcrumb.Item key={index}>
            {item.path ? <a onClick={() => navigate(item.path!)}>{item.title}</a> : item.title}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    );
  };

  // 渲染页面头部
  const renderHeader = () => {
    if (header) {
      return header;
    }

    return (
      <div className="page-header">
        <Row justify="space-between" align="middle">
          <Col>
            <Space align="center">
              {showBack && (
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={handleBack}
                  className="back-button"
                >
                  {backText}
                </Button>
              )}
              {title && (
                <div>
                  <Title level={4} className="m-0">
                    {title}
                  </Title>
                  {subtitle && (
                    <Paragraph type="secondary" className="m-0">
                      {subtitle}
                    </Paragraph>
                  )}
                </div>
              )}
            </Space>
          </Col>
          {extra && (
            <Col>
              <Space>{extra}</Space>
            </Col>
          )}
        </Row>
      </div>
    );
  };

  return (
    <div className={`page-container ${className}`} style={style}>
      {/* 面包屑 */}
      {renderBreadcrumb()}

      {/* 页面头部 */}
      {renderHeader()}

      {/* 页面内容 */}
      <Card
        className="page-content"
        bordered={bordered}
        size={size}
        bodyStyle={{ padding: size === 'small' ? 12 : 24 }}
      >
        {children}
      </Card>

      {/* 页面底部 */}
      {footer && <div className="page-footer mt-4">{footer}</div>}
    </div>
  );
};

export default PageContainer;
