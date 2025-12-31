import React from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Row,
  Col,
  Image,
  Timeline,
  Divider,
  message,
  Spin,
  Empty,
  Tooltip,
  Modal,
} from 'antd';
import {
  EditOutlined,
  EyeOutlined,
  CopyOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
  UserOutlined,
  TagOutlined,
  InfoCircleOutlined,
  SettingOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SPUItem } from '../../../types/spu';
import { spuService } from '../../../services/spuService';
import { StatusManager } from '../StatusManager';
import { AttributePanel } from '../AttributePanel';
import { SPUImageGallery } from '../SPUImageGallery';

interface SPUDetailProps {
  mode?: 'view' | 'edit';
  onEdit?: (record: SPUItem) => void;
  onDelete?: (record: SPUItem) => void;
  onCopy?: (record: SPUItem) => void;
}

const SPUDetail: React.FC<SPUDetailProps> = ({ mode = 'view', onEdit, onDelete, onCopy }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 获取SPU详情数据
  const {
    data: spuData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['spuDetail', id],
    queryFn: () => spuService.getSPUDetail(id),
    enabled: !!id,
    retry: 1,
    onError: (error: any) => {
      message.error('获取SPU详情失败');
      console.error('Get SPU detail error:', error);
    },
  });

  // 获取状态变更历史
  const { data: historyData } = useQuery({
    queryKey: ['spuStatusHistory', id],
    queryFn: () => spuService.getStatusHistory(id),
    enabled: !!id,
    retry: 1,
  });

  const handleBack = () => {
    navigate('/spu/list');
  };

  const handleEdit = () => {
    if (onEdit && spuData?.data) {
      onEdit(spuData.data);
    } else {
      navigate(`/spu/${id}/edit`);
    }
  };

  const handleCopy = () => {
    if (onCopy && spuData?.data) {
      onCopy(spuData.data);
    } else {
      navigate(`/spu/create?copyId=${id}`);
    }
  };

  const handleDelete = () => {
    if (onDelete && spuData?.data) {
      onDelete(spuData.data);
    } else {
      Modal.confirm({
        title: '确认删除',
        content: `确定要删除SPU "${spuData.data.name}" 吗？`,
        okText: '确认',
        cancelText: '取消',
        okType: 'danger',
        onOk: async () => {
          try {
            await spuService.deleteSPU(id);
            message.success('SPU删除成功');
            navigate('/spu/list');
          } catch (error: any) {
            message.error('删除失败');
            console.error('Delete SPU error:', error);
          }
        },
      });
    }
  };

  const handleStatusChange = async (status: string, reason?: string) => {
    try {
      const response = await spuService.updateSPUStatus(id, status, reason);
      if (response.success) {
        message.success('状态更新成功');
      }
    } catch (error: any) {
      message.error('状态更新失败');
      console.error('Update status error:', error);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error || !spuData?.data) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Empty description="加载SPU详情失败" image={Empty.PRESENTED_IMAGE_SIMPLE}>
          <Button type="primary" onClick={() => window.location.reload()}>
            重新加载
          </Button>
        </Empty>
      </div>
    );
  }

  const spu = spuData.data;

  // 状态标签配置
  const statusConfig = {
    active: { text: '启用', color: 'success' },
    inactive: { text: '停用', color: 'error' },
    draft: { text: '草稿', color: 'default' },
  };

  return (
    <div className="spu-detail">
      {/* 页面头部 */}
      <Card className="mb-4">
        <div className="flex justify-between items-center">
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              返回列表
            </Button>
            <div>
              <h2 className="text-xl font-semibold mb-1">{spu.name}</h2>
              <div className="text-gray-600">
                编码: <span className="font-mono">{spu.code}</span>
              </div>
            </div>
          </Space>

          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
              disabled={mode === 'edit'}
            >
              编辑
            </Button>
            <Button icon={<CopyOutlined />} onClick={handleCopy}>
              复制
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              disabled={mode === 'edit'}
            >
              删除
            </Button>
          </Space>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要信息 */}
        <Col span={24} lg={16}>
          {/* 基本信息 */}
          <Card
            title={
              <span className="flex items-center">
                <InfoCircleOutlined className="mr-2" />
                基本信息
              </span>
            }
            className="mb-4"
            extra={
              <StatusManager
                status={spu.status}
                onStatusChange={handleStatusChange}
                disabled={mode === 'edit'}
              />
            }
          >
            <Descriptions column={2} bordered>
              <Descriptions.Item label="SPU编码">{spu.code}</Descriptions.Item>
              <Descriptions.Item label="SPU名称">{spu.name}</Descriptions.Item>
              <Descriptions.Item label="标准简称">{spu.shortName || '-'}</Descriptions.Item>
              <Descriptions.Item label="单位">{spu.unit || '-'}</Descriptions.Item>
              <Descriptions.Item label="品牌">{spu.brand?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="分类">
                {spu.categoryPath && spu.categoryPath.length > 0 ? (
                  <div className="space-x-2">
                    {spu.categoryPath.map((cat, index) => (
                      <span key={index}>
                        {cat}
                        {index < spu.categoryPath.length - 1 && ' > '}
                      </span>
                    ))}
                  </div>
                ) : (
                  spu.categoryName || '-'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="创建人">
                <span className="flex items-center">
                  <UserOutlined className="mr-2" />
                  {spu.createdBy || '-'}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="更新人">
                <span className="flex items-center">
                  <UserOutlined className="mr-2" />
                  {spu.updatedBy || '-'}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                <span className="flex items-center">
                  <ClockCircleOutlined className="mr-2" />
                  {new Date(spu.createdAt).toLocaleString('zh-CN')}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                <span className="flex items-center">
                  <ClockCircleOutlined className="mr-2" />
                  {new Date(spu.updatedAt).toLocaleString('zh-CN')}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="SKU数量" span={2}>
                <Tag color="blue">{spu.skuCount || 0} 个SKU</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态" span={2}>
                <Tag color={statusConfig[spu.status as keyof typeof statusConfig]?.color}>
                  {statusConfig[spu.status as keyof typeof statusConfig]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="商品描述" span={2}>
                <div className="max-h-32 overflow-y-auto">{spu.description || '-'}</div>
              </Descriptions.Item>
              <Descriptions.Item label="标签" span={2}>
                <div className="flex flex-wrap gap-2">
                  {spu.tags && spu.tags.length > 0 ? (
                    spu.tags.map((tag) => (
                      <Tag key={tag} color="blue">
                        {tag}
                      </Tag>
                    ))
                  ) : (
                    <span className="text-gray-400">无标签</span>
                  )}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 商品规格 */}
          <Card
            title={
              <span className="flex items-center">
                <SettingOutlined className="mr-2" />
                商品规格
              </span>
            }
            className="mb-4"
          >
            {spu.specifications && spu.specifications.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {spu.specifications.map((spec, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="font-medium text-gray-700">{spec.name}</div>
                    <div className="text-lg mt-1">{spec.value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="暂无规格信息" />
            )}
          </Card>

          {/* 动态属性 */}
          <AttributePanel
            attributes={spu.attributes || []}
            mode={mode}
            onChange={(attributes) => {
              // 处理属性变更
              console.log('Attributes changed:', attributes);
            }}
          />
        </Col>

        {/* 右侧信息 */}
        <Col span={24} lg={8}>
          {/* 商品图片 */}
          <SPUImageGallery
            images={spu.images || []}
            mode={mode}
            onChange={(images) => {
              // 处理图片变更
              console.log('Images changed:', images);
            }}
          />

          {/* 变更历史 */}
          <Card
            title={
              <span className="flex items-center">
                <FileTextOutlined className="mr-2" />
                变更历史
              </span>
            }
            className="mt-4"
          >
            {historyData?.data && historyData.data.length > 0 ? (
              <Timeline
                mode="left"
                items={historyData.data.map((history, index) => ({
                  key: history.id,
                  dot: history.status === 'active' ? 'green' : 'blue',
                  children: (
                    <div>
                      <div className="font-medium">{history.description}</div>
                      <div className="text-sm text-gray-600 mt-1">操作人: {history.operator}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(history.timestamp).toLocaleString('zh-CN')}
                      </div>
                      {history.reason && (
                        <div className="text-sm text-gray-500 mt-1">原因: {history.reason}</div>
                      )}
                    </div>
                  ),
                }))}
              />
            ) : (
              <Empty description="暂无变更历史" />
            )}
          </Card>
        </Col>
      </div>
    </div>
  );
};

export default SPUDetail;
