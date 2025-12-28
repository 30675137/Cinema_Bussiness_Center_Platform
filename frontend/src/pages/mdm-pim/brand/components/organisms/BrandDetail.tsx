import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Space,
  Button,
  Divider,
  Typography,
  Row,
  Col,
  Image,
  Empty,
  Spin,
  Alert,
  Tooltip,
} from 'antd';
import {
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { Brand } from '../../types/brand.types';
import { BrandStatus } from '../../types/brand.types';
import BrandStatusActions from '../molecules/BrandStatusActions';
import BrandStatusConfirm from '../molecules/BrandStatusConfirm';

const { Title, Text, Paragraph } = Typography;

export interface BrandDetailProps {
  brand?: Brand | null;
  loading?: boolean;
  error?: string | null;
  onEdit?: (brand: Brand) => void;
  onStatusChange?: (brand: Brand, newStatus: BrandStatus, reason?: string) => void;
  onRefresh?: () => void;
  editable?: boolean;
  mode?: 'view' | 'edit';
}

/**
 * 品牌详情有机体组件
 * 展示品牌的完整信息，包括基本信息、状态管理、使用统计等
 */
const BrandDetail: React.FC<BrandDetailProps> = ({
  brand,
  loading = false,
  error = null,
  onEdit,
  onStatusChange,
  onRefresh,
  editable = true,
  mode = 'view'
}) => {
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<BrandStatus | null>(null);

  // 处理状态变更
  const handleStatusChange = (brand: Brand, newStatus: BrandStatus, reason?: string) => {
    if (!onStatusChange) return;

    onStatusChange(brand, newStatus, reason);
    setShowStatusConfirm(false);
    setPendingStatus(null);
  };

  // 显示状态确认对话框
  const handleStatusAction = (newStatus: BrandStatus) => {
    setPendingStatus(newStatus);
    setShowStatusConfirm(true);
  };

  // 获取状态标签
  const getStatusTag = (status: BrandStatus) => {
    const statusConfig = {
      [BrandStatus.ENABLED]: { color: 'success', text: '启用', icon: <CheckOutlined /> },
      [BrandStatus.DISABLED]: { color: 'error', text: '停用', icon: <CloseOutlined /> },
      [BrandStatus.DRAFT]: { color: 'default', text: '草稿', icon: null },
    };

    const config = statusConfig[status];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // 获取品牌类型标签
  const getBrandTypeTag = (brandType: string) => {
    const typeConfig = {
      own: { color: 'blue', text: '自有品牌' },
      authorized: { color: 'green', text: '授权品牌' },
      agent: { color: 'orange', text: '代理品牌' },
    };

    const config = typeConfig[brandType as keyof typeof typeConfig] || {
      color: 'default',
      text: brandType
    };

    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 获取品牌等级标签
  const getBrandLevelTag = (level: string) => {
    const levelConfig = {
      A: { color: 'red', text: 'A级' },
      B: { color: 'orange', text: 'B级' },
      C: { color: 'blue', text: 'C级' },
    };

    const config = levelConfig[level as keyof typeof levelConfig] || {
      color: 'default',
      text: level
    };

    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 加载状态
  if (loading) {
    return (
      <Card
        data-testid="brand-detail-loading"
        style={{ textAlign: 'center', padding: '40px 0' }}
      >
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">加载品牌信息中...</Text>
        </div>
      </Card>
    );
  }

  // 错误状态
  if (error) {
    return (
      <Card data-testid="brand-detail-error">
        <Alert
          title="加载失败"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={onRefresh}>
              重试
            </Button>
          }
        />
      </Card>
    );
  }

  // 无数据状态
  if (!brand) {
    return (
      <Card data-testid="brand-detail-empty">
        <Empty
          description="暂无品牌信息"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <div data-testid="brand-detail-container">
      {/* 头部信息卡片 */}
      <Card
        data-testid="brand-detail-header"
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space>
              <span data-testid="brand-detail-name">{brand.name}</span>
              {getBrandTypeTag(brand.brandType)}
              {getBrandLevelTag(brand.brandLevel)}
              {getStatusTag(brand.status)}
            </Space>

            {/* 操作按钮 */}
            <Space>
              {mode === 'view' && editable && onEdit && (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(brand)}
                  data-testid="brand-edit-button"
                >
                  编辑
                </Button>
              )}

              {/* 状态管理 */}
              {onStatusChange && (
                <BrandStatusActions
                  brand={brand}
                  onStatusChange={onStatusChange}
                  data-testid="brand-status-actions"
                />
              )}
            </Space>
          </div>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={24}>
          {/* 品牌Logo */}
          <Col span={4}>
            <div style={{ textAlign: 'center' }}>
              {brand.logoUrl ? (
                <Image
                  src={brand.logoUrl}
                  alt={`${brand.name} Logo`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: 100,
                    objectFit: 'contain',
                  }}
                  data-testid="brand-logo-image"
                />
              ) : (
                <div
                  style={{
                    width: 100,
                    height: 100,
                    border: '2px dashed #d9d9d9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    margin: '0 auto',
                  }}
                  data-testid="brand-logo-placeholder"
                >
                  <Text type="secondary">无Logo</Text>
                </div>
              )}
            </div>
          </Col>

          {/* 基本信息 */}
          <Col span={20}>
            <Descriptions
              column={2}
              size="small"
              data-testid="brand-basic-info"
            >
              <Descriptions.Item label="品牌编码">
                <Text code data-testid="brand-code">{brand.brandCode}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="英文名称">
                <Text data-testid="brand-english-name">{brand.englishName || '-'}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="所属公司">
                <Text data-testid="brand-company">{brand.company || '-'}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="创建时间">
                <Text data-testid="brand-created-at">
                  {brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : '-'}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="更新时间">
                <Text data-testid="brand-updated-at">
                  {brand.updatedAt ? new Date(brand.updatedAt).toLocaleDateString() : '-'}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="创建人">
                <Text data-testid="brand-created-by">{brand.createdBy || '-'}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        {/* 品牌描述 */}
        {brand.description && (
          <>
            <Divider />
            <div>
              <Title level={5}>品牌描述</Title>
              <Paragraph
                style={{ marginBottom: 0 }}
                data-testid="brand-description"
              >
                {brand.description}
              </Paragraph>
            </div>
          </>
        )}

        {/* 主要类目 */}
        {brand.primaryCategories && brand.primaryCategories.length > 0 && (
          <>
            <Divider />
            <div>
              <Title level={5}>主要类目</Title>
              <Space wrap>
                {brand.primaryCategories.map((category, index) => (
                  <Tag key={index} data-testid={`brand-category-${index}`}>
                    {category}
                  </Tag>
                ))}
              </Space>
            </div>
          </>
        )}

        {/* 品牌标签 */}
        {brand.tags && brand.tags.length > 0 && (
          <>
            <Divider />
            <div>
              <Title level={5}>品牌标签</Title>
              <Space wrap>
                {brand.tags.map((tag, index) => (
                  <Tag key={index} color="geekblue" data-testid={`brand-tag-${index}`}>
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>
          </>
        )}
      </Card>

      {/* 使用统计信息 */}
      {(brand as any).usageStats && (
        <Card
          title="使用统计"
          style={{ marginBottom: 16 }}
          data-testid="brand-usage-stats"
        >
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                  {(brand as any).usageStats.spuCount || 0}
                </div>
                <div style={{ color: '#8c8c8c' }}>SPU数量</div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                  {(brand as any).usageStats.skuCount || 0}
                </div>
                <div style={{ color: '#8c8c8c' }}>SKU数量</div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: '#8c8c8c' }}>
                  最后使用: {(brand as any).usageStats.lastUsedAt
                    ? new Date((brand as any).usageStats.lastUsedAt).toLocaleDateString()
                    : '-'
                  }
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* 状态确认对话框 */}
      <BrandStatusConfirm
        visible={showStatusConfirm}
        brand={brand}
        targetStatus={pendingStatus || BrandStatus.ENABLED}
        onConfirm={handleStatusChange}
        onCancel={() => {
          setShowStatusConfirm(false);
          setPendingStatus(null);
        }}
        loading={false}
      />

      {/* 状态变更说明 */}
      <Alert
        title="状态管理说明"
        description={
          <div>
            <p style={{ margin: 0 }}>
              • <strong>启用</strong>：品牌可以正常用于创建商品和各项业务操作
            </p>
            <p style={{ margin: '4px 0' }}>
              • <strong>停用</strong>：品牌无法用于创建新商品，但现有商品不受影响
            </p>
            <p style={{ margin: '4px 0' }}>
              • <strong>草稿</strong>：品牌的初始状态，需要完善信息后才能启用
            </p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginTop: 16 }}
      />
    </div>
  );
};

export default BrandDetail;