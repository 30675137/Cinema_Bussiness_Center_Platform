import React, { useState, useCallback } from 'react';
import {
  Card,
  Button,
  Space,
  Badge,
  Dropdown,
  Modal,
  Form,
  Select,
  Input,
  Typography,
  message,
  Timeline,
  List,
  Avatar,
  Tag,
  Tooltip,
  Alert,
} from 'antd';
import {
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  EyeOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { SPUStatus } from '@/types/spu';
import { statusColors } from '@/theme';
import { spuService } from '@/services/spuService';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface StatusManagerProps {
  spuId: string;
  currentStatus: SPUStatus;
  onStatusChange?: (newStatus: SPUStatus, reason?: string) => void;
  showHistory?: boolean;
  compact?: boolean;
}

interface StatusHistoryItem {
  id: string;
  status: SPUStatus;
  previousStatus: SPUStatus | null;
  reason: string;
  operator: string;
  timestamp: string;
  description?: string;
}

const StatusManager: React.FC<StatusManagerProps> = ({
  spuId,
  currentStatus,
  onStatusChange,
  showHistory = true,
  compact = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [statusForm] = Form.useForm();
  const [targetStatus, setTargetStatus] = useState<SPUStatus | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);

  // 获取当前状态信息
  const currentStatusInfo = statusColors[currentStatus as keyof typeof statusColors];

  // 获取可转换的状态列表
  const getAvailableStatuses = (): { status: SPUStatus; label: string; description: string }[] => {
    const transitions: Record<
      SPUStatus,
      { status: SPUStatus; label: string; description: string }[]
    > = {
      draft: [
        { status: 'active', label: '启用', description: '将SPU设置为启用状态，可以正常使用' },
        { status: 'inactive', label: '停用', description: '将SPU设置为停用状态，暂时不可用' },
      ],
      active: [
        { status: 'inactive', label: '停用', description: '将SPU设置为停用状态，暂时不可用' },
        { status: 'draft', label: '设为草稿', description: '将SPU回退到草稿状态' },
      ],
      inactive: [
        { status: 'active', label: '启用', description: '将SPU设置为启用状态，可以正常使用' },
        { status: 'draft', label: '设为草稿', description: '将SPU回退到草稿状态' },
      ],
    };

    return transitions[currentStatus] || [];
  };

  // 加载状态历史
  const loadStatusHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await spuService.getStatusHistory(spuId);

      if (response.success) {
        setStatusHistory(response.data);
      } else {
        throw new Error(response.message || '加载状态历史失败');
      }
    } catch (error) {
      console.error('Load status history error:', error);
      message.error('加载状态历史失败');
    } finally {
      setLoading(false);
    }
  }, [spuId]);

  // 处理状态变更
  const handleStatusChange = useCallback((status: SPUStatus) => {
    setTargetStatus(status);
    setStatusModalVisible(true);
  }, []);

  // 确认状态变更
  const confirmStatusChange = useCallback(async () => {
    try {
      const values = await statusForm.validateFields();
      setLoading(true);

      const response = await spuService.updateSPUStatus(spuId, targetStatus!, values.reason);

      if (response.success) {
        message.success('状态更新成功');
        onStatusChange?.(targetStatus!, values.reason);
        setStatusModalVisible(false);
        statusForm.resetFields();
        setTargetStatus(null);
      } else {
        throw new Error(response.message || '状态更新失败');
      }
    } catch (error) {
      console.error('Update status error:', error);
      message.error('状态更新失败，请重试');
    } finally {
      setLoading(false);
    }
  }, [spuId, targetStatus, statusForm, onStatusChange]);

  // 获取状态历史记录
  const renderStatusHistory = () => {
    if (statusHistory.length === 0) {
      return <Alert message="暂无状态变更记录" type="info" showIcon style={{ margin: '16px 0' }} />;
    }

    return (
      <Timeline style={{ marginTop: 16 }}>
        {statusHistory.map((item, index) => {
          const statusInfo = statusColors[item.status as keyof typeof statusColors];
          const previousStatusInfo = item.previousStatus
            ? statusColors[item.previousStatus as keyof typeof statusColors]
            : null;

          return (
            <Timeline.Item
              key={item.id}
              color={index === 0 ? 'green' : 'blue'}
              dot={index === 0 ? <CheckOutlined /> : <ClockCircleOutlined />}
            >
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Tag color={statusInfo.color} style={{ fontSize: '12px' }}>
                    {statusInfo.text}
                  </Tag>
                  {previousStatusInfo && (
                    <>
                      <Text type="secondary">从</Text>
                      <Tag color={previousStatusInfo.color} style={{ fontSize: '12px' }}>
                        {previousStatusInfo.text}
                      </Tag>
                      <Text type="secondary">变更</Text>
                    </>
                  )}
                  {index === 0 && <Badge status="success" text="最新" />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <UserOutlined style={{ fontSize: '12px' }} />
                  <Text type="secondary" style={{ fontSize: '13px' }}>
                    {item.operator}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                </div>
                {item.reason && (
                  <div
                    style={{
                      marginTop: 4,
                      padding: '8px 12px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: 4,
                    }}
                  >
                    <Text style={{ fontSize: '13px' }}>{item.reason}</Text>
                  </div>
                )}
                {item.description && (
                  <Text
                    type="secondary"
                    style={{ fontSize: '12px', marginTop: 4, display: 'block' }}
                  >
                    {item.description}
                  </Text>
                )}
              </div>
            </Timeline.Item>
          );
        })}
      </Timeline>
    );
  };

  // 构建状态变更菜单
  const statusMenuItems: MenuProps['items'] = getAvailableStatuses().map((item) => ({
    key: item.status,
    label: (
      <div>
        <div style={{ fontWeight: 500 }}>{item.label}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>{item.description}</div>
      </div>
    ),
    onClick: () => handleStatusChange(item.status),
  }));

  // 紧凑模式渲染
  if (compact) {
    const availableStatuses = getAvailableStatuses();
    return (
      <Space>
        <Tag color={currentStatusInfo.color} style={{ fontSize: '14px' }}>
          {currentStatusInfo.text}
        </Tag>
        {availableStatuses.length > 0 && (
          <Dropdown menu={{ items: statusMenuItems }} trigger={['click']} placement="bottomLeft">
            <Button size="small" icon={<EditOutlined />}>
              更改状态
            </Button>
          </Dropdown>
        )}
        {showHistory && (
          <Button
            size="small"
            icon={<HistoryOutlined />}
            onClick={() => {
              loadStatusHistory();
              setHistoryModalVisible(true);
            }}
          >
            历史记录
          </Button>
        )}
      </Space>
    );
  }

  // 标准模式渲染
  return (
    <div>
      <Card
        size="small"
        title={
          <Space>
            <span>状态管理</span>
            <Badge count={statusHistory.length} showZero>
              <HistoryOutlined style={{ cursor: 'pointer' }} />
            </Badge>
          </Space>
        }
        extra={
          showHistory && (
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                loadStatusHistory();
                setHistoryModalVisible(true);
              }}
            >
              查看历史
            </Button>
          )
        }
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Tag color={currentStatusInfo.color} style={{ fontSize: '16px', padding: '6px 16px' }}>
              {currentStatusInfo.text}
            </Tag>
            <div>
              <Text strong style={{ fontSize: '14px' }}>
                当前状态
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {currentStatusInfo.description}
              </Text>
            </div>
          </div>

          <div>
            {getAvailableStatuses().length > 0 ? (
              <Dropdown
                menu={{ items: statusMenuItems }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button type="primary" icon={<EditOutlined />} loading={loading}>
                  更改状态
                </Button>
              </Dropdown>
            ) : (
              <Alert message="当前状态无可变更选项" type="info" showIcon style={{ margin: 0 }} />
            )}
          </div>
        </div>

        {/* 最近的状态变更 */}
        {statusHistory.length > 0 && !showHistory && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              最近变更
            </Text>
            <div style={{ marginTop: 8 }}>
              <Text strong>{statusHistory[0].operator}</Text>
              <Text type="secondary" style={{ marginLeft: 8, fontSize: '12px' }}>
                {new Date(statusHistory[0].timestamp).toLocaleString()}
              </Text>
              {statusHistory[0].reason && (
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    原因: {statusHistory[0].reason}
                  </Text>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* 状态变更弹窗 */}
      <Modal
        title="更改SPU状态"
        open={statusModalVisible}
        onCancel={() => {
          setStatusModalVisible(false);
          statusForm.resetFields();
          setTargetStatus(null);
        }}
        onOk={confirmStatusChange}
        confirmLoading={loading}
        width={500}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>将状态从</Text>
          <Tag color={currentStatusInfo.color} style={{ margin: '0 8px' }}>
            {currentStatusInfo.text}
          </Tag>
          <Text>更改为</Text>
          {targetStatus && (
            <Tag
              color={statusColors[targetStatus as keyof typeof statusColors].color}
              style={{ margin: '0 8px' }}
            >
              {statusColors[targetStatus as keyof typeof statusColors].text}
            </Tag>
          )}
        </div>

        <Form form={statusForm} layout="vertical">
          <Form.Item
            name="reason"
            label="变更原因"
            rules={[{ required: true, message: '请输入变更原因' }]}
          >
            <TextArea
              rows={3}
              placeholder="请详细说明状态变更的原因..."
              showCount
              maxLength={200}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 状态历史弹窗 */}
      <Modal
        title="状态变更历史"
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setHistoryModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <SyncOutlined spin style={{ fontSize: 24 }} />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">正在加载状态历史...</Text>
            </div>
          </div>
        ) : (
          renderStatusHistory()
        )}
      </Modal>
    </div>
  );
};

export default StatusManager;
