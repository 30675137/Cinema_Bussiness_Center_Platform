/**
 * 页面内容占位组件
 * 用于显示各个功能页面的基础框架，包含标题、操作区、内容区等
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Breadcrumb,
  Typography,
  Empty,
  Spin,
  Alert,
  Tabs,
  Row,
  Col,
  Statistic,
  Progress,
  Tag
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  ReloadOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  HomeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import BreadcrumbNavigation from '@/components/layout/Breadcrumb';
import { useCurrentUser, useUserPermissions } from '@/stores/userStore';
import './styles.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

/**
 * 页面占位组件Props接口
 */
export interface PagePlaceholderProps {
  /** 页面标题 */
  title: string;
  /** 页面描述 */
  description?: string;
  /** 页面图标 */
  icon?: React.ReactNode;
  /** 是否显示搜索区域 */
  showSearch?: boolean;
  /** 是否显示操作按钮 */
  showActions?: boolean;
  /** 自定义操作按钮 */
  actions?: React.ReactNode[];
  /** 是否显示统计卡片 */
  showStats?: boolean;
  /** 统计数据 */
  statistics?: Array<{
    title: string;
    value: string | number;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    trend?: {
      value: number;
      isPositive: boolean;
    };
  }>;
  /** 是否显示标签页 */
  showTabs?: boolean;
  /** 标签页配置 */
  tabs?: Array<{
    key: string;
    label: string;
    content: React.ReactNode;
    disabled?: boolean;
  }>;
  /** 是否显示面包屑 */
  showBreadcrumb?: boolean;
  /** 自定义面包屑项 */
  breadcrumbItems?: Array<{
    title: string;
    path?: string;
  }>;
  /** 页面状态 */
  status?: 'loading' | 'empty' | 'error' | 'success';
  /** 错误信息 */
  errorMessage?: string;
  /** 空状态描述 */
  emptyDescription?: string;
  /** 是否显示开发中提示 */
  isUnderDevelopment?: boolean;
  /** 开发提示信息 */
  developmentMessage?: string;
  /** 预计完成时间 */
  estimatedCompletion?: string;
  /** 子内容 */
  children?: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 页面内容占位组件
 */
const PagePlaceholder: React.FC<PagePlaceholderProps> = ({
  title,
  description,
  icon,
  showSearch = true,
  showActions = true,
  actions,
  showStats = false,
  statistics,
  showTabs = false,
  tabs,
  showBreadcrumb = true,
  breadcrumbItems,
  status = 'success',
  errorMessage,
  emptyDescription,
  isUnderDevelopment = false,
  developmentMessage = '该功能正在开发中，敬请期待',
  estimatedCompletion,
  children,
  className,
  style
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useCurrentUser();
  const userPermissions = useUserPermissions();
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.key || '');

  // 默认操作按钮
  const defaultActions = [
    <Button key="add" type="primary" icon={<PlusOutlined />}>
      新增
    </Button>,
    <Button key="search" icon={<SearchOutlined />}>
      搜索
    </Button>,
    <Button key="filter" icon={<FilterOutlined />}>
      筛选
    </Button>,
    <Button key="export" icon={<ExportOutlined />}>
      导出
    </Button>,
    <Button key="refresh" icon={<ReloadOutlined />}>
      刷新
    </Button>,
    <Button key="settings" icon={<SettingOutlined />}>
      设置
    </Button>
  ];

  // 处理操作按钮点击
  const handleActionClick = (actionKey: string) => {
    console.log(`Action clicked: ${actionKey}`);
    // 这里可以根据不同的操作类型执行不同的逻辑
    switch (actionKey) {
      case 'add':
        // 导航到新增页面
        break;
      case 'refresh':
        // 刷新页面数据
        window.location.reload();
        break;
      case 'settings':
        // 导航到设置页面
        break;
      default:
        break;
    }
  };

  // 渲染页面头部
  const renderPageHeader = () => (
    <div className="page-header">
      <div className="page-header-content">
        <div className="page-title-section">
          {icon && <span className="page-icon">{icon}</span>}
          <div>
            <Title level={3} className="page-title">
              {title}
            </Title>
            {description && (
              <Paragraph className="page-description">
                {description}
              </Paragraph>
            )}
          </div>
        </div>

        {showActions && (
          <div className="page-actions">
            <Space>
              {(actions || defaultActions).map((action, index) => (
                <div key={index} onClick={() => {
                  const actionElement = action as React.ReactElement;
                  const actionKey = actionElement.key || `action-${index}`;
                  handleActionClick(actionKey as string);
                }}>
                  {action}
                </div>
              ))}
            </Space>
          </div>
        )}
      </div>

      {showSearch && (
        <div className="page-search-section">
          <div className="search-container">
            <SearchOutlined className="search-icon" />
            <input
              type="text"
              placeholder="搜索内容..."
              className="search-input"
            />
          </div>
        </div>
      )}
    </div>
  );

  // 渲染统计卡片
  const renderStatistics = () => {
    if (!showStats || !statistics) return null;

    return (
      <Row gutter={[16, 16]} className="page-statistics">
        {statistics.map((stat, index) => (
          <Col xs={24} sm={12} md={8} lg={6} key={index}>
            <Card size="small" className="statistic-card">
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                valueStyle={{ color: stat.trend ? (stat.trend.isPositive ? '#3f8600' : '#cf1322') : undefined }}
              />
              {stat.trend && (
                <div className="statistic-trend">
                  <Tag color={stat.trend.isPositive ? 'success' : 'error'}>
                    {stat.trend.isPositive ? '+' : ''}{stat.trend}%
                  </Tag>
                  <Text type="secondary" className="trend-text">较上期</Text>
                </div>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // 渲染开发中提示
  const renderUnderDevelopment = () => {
    if (!isUnderDevelopment) return null;

    return (
      <Alert
        message="功能开发中"
        description={
          <div>
            <p>{developmentMessage}</p>
            {estimatedCompletion && (
              <p>
                <ClockCircleOutlined className="mr-1" />
                预计完成时间：{estimatedCompletion}
              </p>
            )}
          </div>
        }
        type="info"
        showIcon
        className="development-alert"
      />
    );
  };

  // 渲染页面内容
  const renderPageContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="page-loading">
            <Spin size="large" tip="页面加载中..." />
          </div>
        );

      case 'error':
        return (
          <div className="page-error">
            <Alert
              message="页面加载失败"
              description={errorMessage || '未知错误，请稍后重试'}
              type="error"
              showIcon
              action={
                <Button size="small" onClick={() => window.location.reload()}>
                  重试
                </Button>
              }
            />
          </div>
        );

      case 'empty':
        return (
          <div className="page-empty">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={emptyDescription || '暂无数据'}
            >
              <Button type="primary" icon={<PlusOutlined />}>
                创建
              </Button>
            </Empty>
          </div>
        );

      default:
        return (
          <div className="page-content">
            {children || (
              <div className="default-content">
                <div className="content-placeholder">
                  <SettingOutlined className="placeholder-icon" />
                  <Title level={4}>功能页面</Title>
                  <Text type="secondary">
                    这是 {title} 页面的基础框架，具体功能正在开发中
                  </Text>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`page-placeholder ${className || ''}`} style={style}>
      {/* 面包屑导航 */}
      {showBreadcrumb && (
        <div className="page-breadcrumb">
          <BreadcrumbNavigation
            items={breadcrumbItems}
            showHome={true}
            homePath="/"
          />
        </div>
      )}

      {/* 页面主体内容 */}
      <div className="page-main">
        <Card className="page-card">
          {/* 页面头部 */}
          {renderPageHeader()}

          {/* 开发中提示 */}
          {renderUnderDevelopment()}

          {/* 统计卡片 */}
          {renderStatistics()}

          {/* 标签页 */}
          {showTabs && tabs && tabs.length > 0 && (
            <div className="page-tabs">
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                type="card"
                size="small"
              >
                {tabs.map(tab => (
                  <TabPane
                    key={tab.key}
                    tab={tab.label}
                    disabled={tab.disabled}
                  >
                    {tab.content}
                  </TabPane>
                ))}
              </Tabs>
            </div>
          )}

          {/* 页面内容 */}
          {renderPageContent()}
        </Card>
      </div>
    </div>
  );
};

export default PagePlaceholder;