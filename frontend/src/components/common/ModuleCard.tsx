/**
 * @spec D001-menu-panel
 * 模块卡片组件 - 展示单个业务模块的导航卡片
 */
import React from 'react';
import { Card, Tag, Typography, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { ModuleCard as ModuleCardType } from '@/types/module';

const { Text, Paragraph } = Typography;

interface ModuleCardProps {
  module: ModuleCardType;
}

/**
 * ModuleCard 组件
 * 
 * 功能：
 * - 展示模块名称、描述、图标
 * - 显示功能链接列表
 * - 悬停效果（阴影、上移）
 * - 点击卡片跳转到默认页面
 * - 支持"开发中"状态标识
 */
export const ModuleCard: React.FC<ModuleCardProps> = React.memo(({ module }) => {
  const navigate = useNavigate();
  const Icon = module.icon;

  const handleCardClick = () => {
    navigate(module.defaultPath);
  };

  const handleLinkClick = (path: string, event: React.MouseEvent) => {
    event.stopPropagation(); // 阻止冒泡到卡片点击事件
    navigate(path);
  };

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      data-testid={`module-card-${module.id}`}
      style={{
        height: '100%',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      styles={{
        body: {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      className="module-card"
    >
      <Space direction="vertical" size="middle" style={{ width: '100%', height: '100%' }}>
        {/* 图标和状态标签 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Icon style={{ fontSize: 32, color: '#1890ff' }} />
          {module.status === 'developing' && (
            <Tag color="orange">开发中</Tag>
          )}
          {module.badge && (
            <Tag color="red">{module.badge}</Tag>
          )}
        </div>

        {/* 模块标题 */}
        <div>
          <Text strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>
            {module.name}
          </Text>
          <Paragraph
            type="secondary"
            style={{ margin: 0, fontSize: 12 }}
            ellipsis={{ rows: 2 }}
          >
            {module.description}
          </Paragraph>
        </div>

        {/* 功能链接列表 */}
        <div style={{ marginTop: 'auto' }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {module.functionLinks.slice(0, 4).map((link) => (
              <Text
                key={link.path}
                style={{
                  fontSize: 13,
                  color: link.enabled === false ? '#d9d9d9' : '#262626',
                  fontWeight: link.enabled === false ? 'normal' : 500,
                  cursor: link.enabled === false ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  textDecoration: link.enabled === false ? 'line-through' : 'none',
                  opacity: link.enabled === false ? 0.5 : 1,
                }}
                onClick={(e) => link.enabled !== false && handleLinkClick(link.path, e)}
                className={link.enabled === false ? 'function-link-disabled' : 'function-link'}
              >
                <span>{link.enabled === false ? '○' : '•'}</span>
                <span style={{ flex: 1 }}>{link.name}</span>
                {link.enabled === false && (
                  <Tag color="default" style={{ margin: 0, fontSize: 11, color: '#999' }}>
                    未开发
                  </Tag>
                )}
                {link.enabled !== false && link.badge && (
                  <Tag color="red" style={{ margin: 0, fontSize: 11 }}>
                    {link.badge}
                  </Tag>
                )}
              </Text>
            ))}
          </Space>
        </div>
      </Space>

      {/* 自定义悬停样式 */}
      <style>
        {`
          .module-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
            transform: translateY(-4px);
          }
          .function-link:hover {
            color: #1890ff !important;
            font-weight: 600;
          }
          .function-link-disabled:hover {
            color: #d9d9d9 !important;
            cursor: not-allowed !important;
          }
        `}
      </style>
    </Card>
  );
});

ModuleCard.displayName = 'ModuleCard';
