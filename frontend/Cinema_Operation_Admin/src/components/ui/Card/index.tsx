import React from 'react';
import { Card as AntCard, Button, Space, Typography, Avatar } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { cn } from '../../../utils/cn';
import type { CardProps, StatCardProps } from './types';
import { CardSize, CardVariant } from './types';

const { Title, Text } = Typography;

/**
 * 基础Card组件
 */
function Card({
  title,
  subtitle,
  children,
  extra,
  footer,
  actions,
  cover,
  avatar,
  size = CardSize.MEDIUM,
  variant = CardVariant.DEFAULT,
  bordered = true,
  hoverable = false,
  shadow = false,
  loading = false,
  width,
  height,
  padding,
  headStyle,
  bodyStyle,
  footerStyle,
  className,
  style,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: CardProps) {
  // 计算尺寸样式
  const sizeClasses = {
    [CardSize.SMALL]: 'card-small',
    [CardSize.MEDIUM]: 'card-medium',
    [CardSize.LARGE]: 'card-large',
  };

  // 计算变体样式
  const variantClasses = {
    [CardVariant.DEFAULT]: 'card-default',
    [CardVariant.OUTLINED]: 'card-outlined',
    [CardVariant.FILLED]: 'card-filled',
    [CardVariant.SHADOW]: 'card-shadow',
    [CardVariant.GHOST]: 'card-ghost',
  };

  // 渲染卡片头部
  const renderTitle = () => {
    if (!title && !avatar) return null;

    return (
      <div className="flex items-center gap-3">
        {avatar && (
          <Avatar size={size === CardSize.SMALL ? 'small' : size === CardSize.LARGE ? 'large' : 'default'}>
            {avatar}
          </Avatar>
        )}
        <div className="flex-1">
          {title && (
            <Title level={size === CardSize.SMALL ? 5 : 4} className="!mb-0">
              {title}
            </Title>
          )}
          {subtitle && (
            <Text type="secondary" className="text-sm">
              {subtitle}
            </Text>
          )}
        </div>
        {extra && <div>{extra}</div>}
      </div>
    );
  };

  // 渲染操作按钮
  const renderActions = () => {
    if (!actions || actions.length === 0) return null;

    return (
      <div className="card-actions">
        <Space size="small">
          {actions.map((action) => (
            <Button
              key={action.key}
              type={action.type || 'text'}
              size="small"
              icon={action.icon}
              disabled={action.disabled}
              loading={action.loading}
              danger={action.danger}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </Space>
      </div>
    );
  };

  // 计算自定义样式
  const customStyle: React.CSSProperties = {
    ...style,
    ...(width && { width }),
    ...(height && { height }),
  };

  // 计算内容样式
  const customBodyStyle: React.CSSProperties = {
    ...bodyStyle,
    ...(padding && { padding }),
  };

  return (
    <AntCard
      className={cn(
        'custom-card',
        sizeClasses[size],
        variantClasses[variant],
        hoverable && 'card-hoverable',
        shadow && 'card-shadow',
        !bordered && 'card-borderless',
        className
      )}
      style={customStyle}
      bordered={bordered}
      hoverable={hoverable}
      loading={loading}
      cover={cover}
      title={title ? renderTitle() : undefined}
      extra={title ? undefined : extra}
      actions={actions && actions.length > 0 ? actions.map(action => (
        <Button
          key={action.key}
          type={action.type || 'text'}
          size="small"
          icon={action.icon}
          disabled={action.disabled}
          loading={action.loading}
          danger={action.danger}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )) : undefined}
      headStyle={headStyle}
      bodyStyle={customBodyStyle}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}

      {(actions || footer) && (
        <div className="card-footer">
          {actions && renderActions()}
          {footer && (
            <div className="card-footer-content" style={footerStyle}>
              {footer}
            </div>
          )}
        </div>
      )}
    </AntCard>
  );
}

/**
 * 统计卡片组件
 */
function StatCard({
  data,
  showTrendIcon = true,
  formatValue = (value) => String(value),
  formatTrend = (value) => `${value > 0 ? '+' : ''}${value}%`,
  ...cardProps
}: StatCardProps) {
  const renderTrend = () => {
    if (!data.trend) return null;

    const { value, isUp, description } = data.trend;
    const TrendIcon = isUp ? ArrowUpOutlined : ArrowDownOutlined;
    const trendColor = isUp ? '#52c41a' : '#ff4d4f';

    return (
      <div className="flex items-center gap-1">
        {showTrendIcon && (
          <TrendIcon style={{ color: trendColor, fontSize: '12px' }} />
        )}
        <Text style={{ color: trendColor, fontSize: '12px' }}>
          {formatTrend(value)}
        </Text>
        {description && (
          <Text type="secondary" className="text-xs ml-1">
            {description}
          </Text>
        )}
      </div>
    );
  };

  return (
    <Card
      {...cardProps}
      className={cn('stat-card', cardProps.className)}
    >
      <div className="stat-card-content">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="stat-card-title">
              <Text type="secondary" className="text-sm">
                {data.title}
              </Text>
            </div>

            <div className="stat-card-value my-2">
              <Title
                level={cardProps.size === CardSize.SMALL ? 4 : 3}
                className="!mb-0 font-semibold"
                style={{ color: data.color }}
              >
                {formatValue(data.value)}
              </Title>
            </div>

            {data.subtitle && (
              <div className="stat-card-subtitle">
                <Text type="secondary" className="text-xs">
                  {data.subtitle}
                </Text>
              </div>
            )}

            {data.trend && (
              <div className="stat-card-trend mt-2">
                {renderTrend()}
              </div>
            )}
          </div>

          {data.icon && (
            <div className="stat-card-icon ml-4" style={{ color: data.color }}>
              {data.icon}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// 附加样式到文档
const cardStyles = `
  /* Card组件样式 */
  .custom-card {
    transition: all 0.3s ease;
  }

  .card-small .ant-card-body {
    padding: 12px;
  }

  .card-medium .ant-card-body {
    padding: 20px;
  }

  .card-large .ant-card-body {
    padding: 24px;
  }

  .card-default {
    background-color: #ffffff;
  }

  .card-outlined {
    background-color: transparent;
    border: 1px solid #d9d9d9;
  }

  .card-filled {
    background-color: #f5f5f5;
    border: none;
  }

  .card-shadow {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .card-ghost {
    background-color: transparent;
    border: none;
    box-shadow: none;
  }

  .card-hoverable:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  .card-borderless {
    border: none;
  }

  .card-actions {
    border-top: 1px solid #f0f0f0;
    padding-top: 12px;
    margin-top: 12px;
  }

  .card-footer-content {
    border-top: 1px solid #f0f0f0;
    padding-top: 12px;
    margin-top: 12px;
  }

  /* StatCard组件样式 */
  .stat-card .ant-card-body {
    display: flex;
    align-items: center;
  }

  .stat-card-icon {
    font-size: 32px;
    opacity: 0.8;
  }

  .stat-card-value .ant-typography {
    line-height: 1.2;
  }

  .ant-table-row-striped > td {
    background-color: #fafafa;
  }
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = cardStyles;
  if (!document.head.querySelector('style[data-card-styles]')) {
    styleElement.setAttribute('data-card-styles', 'true');
    document.head.appendChild(styleElement);
  }
}

// 导出类型
export type {
  CardProps,
  CardAction,
  StatCardProps,
  StatCardData,
  CardSize,
  CardVariant,
} from './types';

Card.Stat = StatCard;
export { Card, StatCard };
export default Card;