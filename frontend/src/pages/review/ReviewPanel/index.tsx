import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  Row,
  Col,
  Typography,
  Tag,
  Modal,
  Drawer,
  Timeline,
  Badge,
  Avatar,
  Divider,
  Alert,
  Statistic,
  Progress,
  Tabs,
  Tooltip,
  Popconfirm,
  message,
  Empty,
  Spin,
  Form,
  DatePicker,
  Checkbox
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  HistoryOutlined,
  FilterOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SettingOutlined,
  ReloadOutlined,
  ExportOutlined,
  BulkActions
} from '@ant-design/icons';
import dayjs from 'dayjs';

import {
  useAuditStore,
  useAuditsQuery,
  useAuditQuery,
  useAuditHistoryQuery,
  useAuditStatisticsQuery,
  useAuditActionMutation,
  useBatchAuditMutation,
  useMyPendingAuditsQuery,
  useAuditSelectors,
  AuditRecord,
  AuditStatus,
  AuditType,
  AuditQueryParams,
  AuditActionRequest
} from '@/stores/auditStore';
import { AUDIT_TYPE_OPTIONS, AUDIT_STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/types/audit';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ReviewPanel: React.FC = () => {
  // 本地状态
  const [activeTab, setActiveTab] = useState('pending');
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [currentAudit, setCurrentAudit] = useState<AuditRecord | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [rejectReason, setRejectReason] = useState('');

  // Store和Query
  const store = useAuditStore();
  const { filters, selectedAuditIds, setSelectedAuditIds, clearSelection } = useAuditStore();
  const {
    filteredAudits,
    selectedAudits,
    pendingCount,
    highPriorityPendingCount,
    hasSelection
  } = useAuditSelectors();

  // 数据查询
  const {
    data: auditsData,
    isLoading,
    refetch
  } = useAuditsQuery(filters);

  const {
    data: myPendingAudits,
    isLoading: pendingLoading
  } = useMyPendingAuditsQuery();

  const {
    data: statistics
  } = useAuditStatisticsQuery();

  // Mutations
  const actionMutation = useAuditActionMutation();
  const batchActionMutation = useBatchAuditMutation();

  // 审核操作
  const handleAuditAction = async (auditId: string, action: 'approve' | 'reject', comment?: string) => {
    try {
      await actionMutation.mutateAsync({
        auditId,
        action,
        comment,
        rejectionReason: action === 'reject' ? rejectReason : undefined,
        itemIds: selectedItemIds.length > 0 ? selectedItemIds : undefined
      });

      message.success(action === 'approve' ? '审核已批准' : '审核已驳回');
      setRejectModalVisible(false);
      setRejectReason('');
      setSelectedItemIds([]);
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 批量审核操作
  const handleBatchAction = async (action: 'approve' | 'reject') => {
    if (!hasSelection) {
      message.warning('请选择要操作的审核记录');
      return;
    }

    try {
      await batchActionMutation.mutateAsync({
        auditIds: selectedAuditIds,
        action,
        rejectionReason: action === 'reject' ? rejectReason : undefined
      });

      message.success(`批量${action === 'approve' ? '批准' : '驳回'}成功`);
      clearSelection();
      setRejectModalVisible(false);
      setRejectReason('');
    } catch (error) {
      message.error('批量操作失败');
    }
  };

  // 查看详情
  const handleViewDetail = (audit: AuditRecord) => {
    setCurrentAudit(audit);
    setDetailDrawerVisible(true);
  };

  // 筛选处理
  const handleFilterChange = (newFilters: Partial<AuditQueryParams>) => {
    store.setFilters(newFilters);
  };

  // 搜索处理
  const handleSearch = (value: string) => {
    handleFilterChange({ keyword: value });
  };

  // 表格列定义
  const columns = [
    {
      title: '审核标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text: string, record: AuditRecord) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ cursor: 'pointer' }} onClick={() => handleViewDetail(record)}>
            {text}
          </Text>
          {record.description && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.description}
            </Text>
          )}
          <Space size={4}>
            {record.tags.map(tag => (
              <Tag key={tag} size="small" color="blue">{tag}</Tag>
            ))}
          </Space>
        </Space>
      )
    },
    {
      title: '审核类型',
      dataIndex: 'auditType',
      key: 'auditType',
      width: 120,
      render: (type: AuditType) => {
        const config = AUDIT_TYPE_OPTIONS.find(opt => opt.value === type);
        return config ? <Tag color={config.color}>{config.label}</Tag> : type;
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: AuditStatus) => {
        const config = AUDIT_STATUS_OPTIONS.find(opt => opt.value === status);
        return config ? <Tag color={config.color}>{config.label}</Tag> : status;
      }
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority: string) => {
        const config = PRIORITY_OPTIONS.find(opt => opt.value === priority);
        return config ? <Tag color={config.color}>{config.label}</Tag> : priority;
      }
    },
    {
      title: '提交人',
      dataIndex: 'submitterName',
      key: 'submitterName',
      width: 120,
      render: (name: string, record: AuditRecord) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Space direction="vertical" size={0}>
            <Text>{name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.submitterRole}
            </Text>
          </Space>
        </Space>
      )
    },
    {
      title: '审核项目',
      key: 'items',
      width: 100,
      render: (_, record: AuditRecord) => (
        <Space direction="vertical" size={0}>
          <Text>{record.totalItems} 个项目</Text>
          {record.keyFieldChanges > 0 && (
            <Text type="danger" style={{ fontSize: 12 }}>
              {record.keyFieldChanges} 个关键字段变更
            </Text>
          )}
        </Space>
      )
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 150,
      render: (date: string, record: AuditRecord) => (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(date).format('YYYY-MM-DD')}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(date).format('HH:mm')}
          </Text>
          {record.dueDate && (
            <Text
              type={dayjs(record.dueDate).isBefore(dayjs()) ? 'danger' : 'warning'}
              style={{ fontSize: 12 }}
            >
              截止: {dayjs(record.dueDate).format('MM-DD')}
            </Text>
          )}
        </Space>
      )
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_, record: AuditRecord) => (
        <Space>
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.status === AuditStatus.PENDING && (
            <>
              <Tooltip title="批准">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleAuditAction(record.id, 'approve')}
                  loading={actionMutation.isPending}
                />
              </Tooltip>
              <Tooltip title="驳回">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => {
                    setCurrentAudit(record);
                    setRejectModalVisible(true);
                  }}
                />
              </Tooltip>
            </>
          )}
        </Space>
      )
    }
  ];

  // 渲染统计信息
  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审核"
              value={statistics.pendingAudits}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已批准"
              value={statistics.approvedAudits}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已驳回"
              value={statistics.rejectedAudits}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="平均审核时间"
              value={statistics.averageReviewTime}
              precision={1}
              suffix="小时"
              prefix={<HistoryOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  // Tab内容
  const tabItems = [
    {
      key: 'pending',
      label: (
        <span>
          <ClockCircleOutlined />
          待审核
          {pendingCount > 0 && <Badge count={pendingCount} style={{ marginLeft: 4 }} />}
        </span>
      ),
      children: (
        <Table
          columns={columns}
          dataSource={filteredAudits.filter(audit => audit.status === AuditStatus.PENDING)}
          rowKey="id"
          loading={isLoading}
          rowSelection={{
            selectedRowKeys: selectedAuditIds,
            onChange: setSelectedAuditIds,
            getCheckboxProps: (record: AuditRecord) => record.status === AuditStatus.PENDING
          }}
          pagination={{
            current: store.pagination.current,
            pageSize: store.pagination.pageSize,
            total: filteredAudits.filter(audit => audit.status === AuditStatus.PENDING).length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
        />
      )
    },
    {
      key: 'my-pending',
      label: (
        <span>
          <UserOutlined />
          我的待审核
          {myPendingAudits?.data?.length > 0 && (
            <Badge count={myPendingAudits.data.length} style={{ marginLeft: 4 }} />
          )}
        </span>
      ),
      children: (
        <Table
          columns={columns}
          dataSource={myPendingAudits?.data || []}
          rowKey="id"
          loading={pendingLoading}
          pagination={{
            current: myPendingAudits?.pagination?.current || 1,
            pageSize: myPendingAudits?.pagination?.pageSize || 20,
            total: myPendingAudits?.pagination?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
        />
      )
    },
    {
      key: 'all',
      label: '全部审核',
      children: (
        <Table
          columns={columns}
          dataSource={filteredAudits}
          rowKey="id"
          loading={isLoading}
          rowSelection={{
            selectedRowKeys: selectedAuditIds,
            onChange: setSelectedAuditIds,
            getCheckboxProps: (record: AuditRecord) => record.status === AuditStatus.PENDING
          }}
          pagination={{
            current: store.pagination.current,
            pageSize: store.pagination.pageSize,
            total: filteredAudits.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
        />
      )
    }
  ];

  return (
    <div className="review-panel">
      {/* 页面头部 */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              审核面板
              {highPriorityPendingCount > 0 && (
                <Badge count={highPriorityPendingCount} style={{ marginLeft: 8 }} />
              )}
            </Title>
            <Text type="secondary">
              管理和审核待处理的变更请求
            </Text>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
                刷新
              </Button>
              <Button icon={<ExportOutlined />}>
                导出
              </Button>
              <Button icon={<SettingOutlined />}>
                审核设置
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 统计信息 */}
      {renderStatistics()}

      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Search
              placeholder="搜索审核标题、描述或提交人"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col>
            <Select
              placeholder="审核类型"
              style={{ width: 150 }}
              allowClear
              value={filters.auditType}
              onChange={(value) => handleFilterChange({ auditType: value ? [value] : undefined })}
            >
              {AUDIT_TYPE_OPTIONS.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="状态"
              style={{ width: 120 }}
              allowClear
              value={filters.status?.[0]}
              onChange={(value) => handleFilterChange({
                status: value ? [value] : undefined
              })}
            >
              {AUDIT_STATUS_OPTIONS.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  handleFilterChange({
                    dateRange: [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]
                  });
                } else {
                  handleFilterChange({ dateRange: undefined });
                }
              }}
            />
          </Col>
        </Row>

        {/* 批量操作 */}
        {hasSelection && (
          <Row style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
            <Col>
              <Space>
                <Text>已选择 {selectedAuditIds.length} 项</Text>
                <Button size="small" onClick={clearSelection}>
                  取消选择
                </Button>
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleBatchAction('approve')}
                  loading={batchActionMutation.isPending}
                >
                  批量批准
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => setRejectModalVisible(true)}
                >
                  批量驳回
                </Button>
              </Space>
            </Col>
          </Row>
        )}
      </Card>

      {/* 审核列表 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        title="审核详情"
        open={detailDrawerVisible}
        onClose={() => {
          setDetailDrawerVisible(false);
          setCurrentAudit(null);
        }}
        width={800}
        destroyOnClose
      >
        {currentAudit && (
          <div>
            {/* 基本信息 */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text strong>审核标题：</Text>
                  <div style={{ marginTop: 4 }}>{currentAudit.title}</div>
                </Col>
                <Col span={12}>
                  <Text strong>审核类型：</Text>
                  <div style={{ marginTop: 4 }}>
                    {
                      AUDIT_TYPE_OPTIONS.find(opt => opt.value === currentAudit.auditType)
                        ?.label || currentAudit.auditType
                    }
                  </div>
                </Col>
              </Row>
              {currentAudit.description && (
                <Row style={{ marginTop: 16 }}>
                  <Col span={24}>
                    <Text strong>描述：</Text>
                    <div style={{ marginTop: 4 }}>{currentAudit.description}</div>
                  </Col>
                </Row>
              )}
            </Card>

            {/* 提交信息 */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Text strong>提交人：</Text>
                  <div style={{ marginTop: 4 }}>
                    <Space>
                      <Avatar size="small" icon={<UserOutlined />} />
                      <div>
                        <div>{currentAudit.submitterName}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {currentAudit.submitterRole}
                        </Text>
                      </div>
                    </Space>
                  </div>
                </Col>
                <Col span={8}>
                  <Text strong>提交时间：</Text>
                  <div style={{ marginTop: 4 }}>
                    {dayjs(currentAudit.submittedAt).format('YYYY-MM-DD HH:mm:ss')}
                  </div>
                </Col>
                <Col span={8}>
                  <Text strong>优先级：</Text>
                  <div style={{ marginTop: 4 }}>
                    {
                      PRIORITY_OPTIONS.find(opt => opt.value === currentAudit.priority)
                        ?.label || currentAudit.priority
                    }
                  </div>
                </Col>
              </Row>
            </Card>

            {/* 变更项目 */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Text strong>变更项目 ({currentAudit.totalItems})</Text>
              <div style={{ marginTop: 8 }}>
                {currentAudit.items.map(item => (
                  <Card key={item.id} size="small" style={{ marginBottom: 8 }}>
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Text strong>{item.entityName}</Text>
                        {item.entityCode && (
                          <Text type="secondary"> ({item.entityCode})</Text>
                        )}
                      </Col>
                      <Col>
                        <Space>
                          <Text>{item.changeCount} 个变更</Text>
                          {item.keyFieldChanges > 0 && (
                            <Text type="danger">{item.keyFieldChanges} 个关键字段</Text>
                          )}
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            </Card>

            {/* 操作按钮 */}
            {currentAudit.status === AuditStatus.PENDING && (
              <Card size="small">
                <Row justify="end">
                  <Col>
                    <Space>
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleAuditAction(currentAudit.id, 'approve')}
                        loading={actionMutation.isPending}
                      >
                        批准
                      </Button>
                      <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => {
                          setRejectModalVisible(true);
                        }}
                      >
                        驳回
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            )}
          </div>
        )}
      </Drawer>

      {/* 驳回原因模态框 */}
      <Modal
        title="驳回原因"
        open={rejectModalVisible}
        onOk={() => {
          if (currentAudit) {
            handleAuditAction(currentAudit.id, 'reject', rejectReason);
          } else {
            handleBatchAction('reject');
          }
        }}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason('');
        }}
        okText="确认驳回"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        confirmLoading={actionMutation.isPending || batchActionMutation.isPending}
      >
        <Form layout="vertical">
          <Form.Item
            label="驳回原因"
            required
            help="请详细说明驳回的原因，以便提交人了解问题所在"
          >
            <Input.TextArea
              rows={4}
              placeholder="请输入驳回原因..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              maxLength={1000}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReviewPanel;