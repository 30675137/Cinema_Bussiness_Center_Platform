/**
 * 快速页面占位组件
 * 用于快速生成基础功能页面，简化配置
 */

import React from 'react';
import { Card, Typography, Alert, Empty } from 'antd';
import { SettingOutlined, ClockCircleOutlined } from '@ant-design/icons';
import PagePlaceholder, { PagePlaceholderProps } from '../PagePlaceholder';
import './styles.css';

const { Title, Text } = Typography;

/**
 * 快速页面组件Props接口
 */
export interface QuickPageProps extends Omit<PagePlaceholderProps, 'title' | 'children'> {
  /** 功能名称（自动生成标题和描述） */
  featureName: string;
  /** 功能描述 */
  featureDescription?: string;
  /** 功能状态 */
  featureStatus?: 'planning' | 'developing' | 'testing' | 'completed';
  /** 是否显示详细信息 */
  showDetails?: boolean;
  /** 预计完成时间 */
  estimatedCompletion?: string;
  /** 负责人 */
  owner?: string;
  /** 优先级 */
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  /** 自定义内容 */
  customContent?: React.ReactNode;
}

/**
 * 功能状态映射
 */
const statusConfig = {
  planning: {
    text: '规划中',
    color: 'default',
    description: '该功能正在需求分析和规划阶段'
  },
  developing: {
    text: '开发中',
    color: 'processing',
    description: '该功能正在开发实现中'
  },
  testing: {
    text: '测试中',
    color: 'warning',
    description: '该功能正在测试验证阶段'
  },
  completed: {
    text: '已完成',
    color: 'success',
    description: '该功能已经开发完成'
  }
};

/**
 * 优先级映射
 */
const priorityConfig = {
  low: { text: '低', color: 'green' },
  medium: { text: '中', color: 'blue' },
  high: { text: '高', color: 'orange' },
  urgent: { text: '紧急', color: 'red' }
};

/**
 * 快速页面占位组件
 */
const QuickPage: React.FC<QuickPageProps> = ({
  featureName,
  featureDescription,
  featureStatus = 'developing',
  showDetails = true,
  estimatedCompletion,
  owner,
  priority = 'medium',
  customContent,
  ...restProps
}) => {
  const status = statusConfig[featureStatus];
  const priorityInfo = priorityConfig[priority];

  // 生成页面内容
  const renderContent = () => {
    if (customContent) {
      return customContent;
    }

    return (
      <div className="quick-page-content">
        <div className="quick-page-header">
          <SettingOutlined className="quick-page-icon" />
          <Title level={4}>{featureName}</Title>
          <Text type="secondary">
            {featureDescription || `这是${featureName}功能的基础页面`}
          </Text>
        </div>

        {showDetails && (
          <div className="quick-page-details">
            <Card size="small" title="功能信息" className="details-card">
              <div className="detail-item">
                <Text strong>状态：</Text>
                <span className={`status-badge status-${featureStatus}`}>
                  {status.text}
                </span>
              </div>

              <div className="detail-item">
                <Text strong>优先级：</Text>
                <span className={`priority-badge priority-${priority}`}>
                  {priorityInfo.text}
                </span>
              </div>

              {owner && (
                <div className="detail-item">
                  <Text strong>负责人：</Text>
                  <span>{owner}</span>
                </div>
              )}

              {estimatedCompletion && (
                <div className="detail-item">
                  <Text strong>预计完成：</Text>
                  <span>
                    <ClockCircleOutlined className="mr-1" />
                    {estimatedCompletion}
                  </span>
                </div>
              )}

              <div className="detail-item">
                <Text strong>描述：</Text>
                <Text type="secondary">{status.description}</Text>
              </div>
            </Card>

            {featureStatus === 'developing' && (
              <Alert
                message="功能开发中"
                description={`"${featureName}"功能正在开发中，请关注后续更新。如有问题请联系相关负责人。`}
                type="info"
                showIcon
                className="development-alert"
              />
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <PagePlaceholder
      title={featureName}
      description={featureDescription}
      isUnderDevelopment={featureStatus !== 'completed'}
      developmentMessage={`"${featureName}"功能${status.text}`}
      estimatedCompletion={estimatedCompletion}
      {...restProps}
    >
      {renderContent()}
    </PagePlaceholder>
  );
};

export default QuickPage;