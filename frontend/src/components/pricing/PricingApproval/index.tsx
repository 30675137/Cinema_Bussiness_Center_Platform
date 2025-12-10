import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tooltip,
  Badge,
  Timeline,
  Avatar,
  Popconfirm,
  Steps,
  Descriptions,
  Alert,
  Divider,
  Typography
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  ClockCircleOutlined,
  UserOutlined,
  EyeOutlined,
  MessageOutlined,
  HistoryOutlined,
  WarningOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface ApprovalRequest {
  id: string;
  requestType: 'price_create' | 'price_update' | 'strategy_create' | 'strategy_update' | 'batch_import';
  title: string;
  description: string;
  requesterId: string;
  requesterName: string;
  targetData: any;
  currentStep: number;
  totalSteps: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  steps: ApprovalStep[];
  comments: ApprovalComment[];
}

interface ApprovalStep {
  id: string;
  name: string;
  assigneeId?: string;
  assigneeName?: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  completedAt?: string;
  comments?: string;
}

interface ApprovalComment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface PricingApprovalProps {
  type?: 'inbox' | 'sent' | 'all';
}

const PricingApproval: React.FC<PricingApprovalProps> = ({ type = 'inbox' }) => {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [approveVisible, setApproveVisible] = useState(false);
  const [commentVisible, setCommentVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [form] = Form.useForm();
  const [commentForm] = Form.useForm();

  // 模拟数据
  useEffect(() => {
    const mockData: ApprovalRequest[] = [
      {
        id: 'REQ001',
        requestType: 'price_update',
        title: '线上商城爆米花价格调整申请',
        description: '由于原材料成本上涨，申请将爆米花中份价格从22.50元调整至24.00元',
        requesterId: 'USER001',
        requesterName: '李四',
        targetData: {
          productId: 'PROD001',
          productName: '爆米花-中份',
          channelName: '线上商城',
          oldPrice: 22.50,
          newPrice: 24.00,
          effectiveDate: '2024-02-01'
        },
        currentStep: 1,
        totalSteps: 3,
        status: 'pending',
        priority: 'medium',
        createdAt: '2024-01-25T10:30:00',
        updatedAt: '2024-01-25T10:30:00',
        steps: [
          {
            id: 'STEP001',
            name: '部门主管审批',
            assigneeId: 'MANAGER001',
            assigneeName: '张经理',
            status: 'approved',
            completedAt: '2024-01-25T14:20:00',
            comments: '同意调整，符合市场行情'
          },
          {
            id: 'STEP002',
            name: '财务部审批',
            assigneeId: 'FINANCE001',
            assigneeName: '王财务',
            status: 'pending'
          },
          {
            id: 'STEP003',
            name: '总经理审批',
            assigneeId: 'GM001',
            assigneeName: '陈总经理',
            status: 'pending'
          }
        ],
        comments: [
          {
            id: 'COMMENT001',
            authorId: 'MANAGER001',
            authorName: '张经理',
            content: '同意调整，符合市场行情。建议同步调整其他渠道价格。',
            createdAt: '2024-01-25T14:20:00'
          }
        ]
      },
      {
        id: 'REQ002',
        requestType: 'strategy_create',
        title: 'VIP会员定价策略创建申请',
        description: '创建VIP会员专属定价策略，提供88折优惠',
        requesterId: 'USER002',
        requesterName: '张三',
        targetData: {
          strategyName: 'VIP会员88折',
          discountRate: 0.12,
          applicableProducts: ['PROD001', 'PROD002', 'PROD003'],
          minLevel: 'VIP1'
        },
        currentStep: 0,
        totalSteps: 2,
        status: 'pending',
        priority: 'high',
        createdAt: '2024-01-26T09:15:00',
        updatedAt: '2024-01-26T09:15:00',
        steps: [
          {
            id: 'STEP004',
            name: '营销部审批',
            assigneeId: 'MARKET001',
            assigneeName: '赵营销',
            status: 'pending'
          },
          {
            id: 'STEP005',
            name: '财务部审批',
            assigneeId: 'FINANCE001',
            assigneeName: '王财务',
            status: 'pending'
          }
        ],
        comments: []
      },
      {
        id: 'REQ003',
        requestType: 'batch_import',
        title: '企业采购渠道批量价格导入',
        description: '批量导入100+企业采购渠道价格配置',
        requesterId: 'USER003',
        requesterName: '赵六',
        targetData: {
          fileUrl: '/uploads/channel_prices_batch.xlsx',
          recordCount: 156,
          totalValue: 125600.00
        },
        currentStep: 2,
        totalSteps: 2,
        status: 'approved',
        priority: 'low',
        createdAt: '2024-01-20T16:45:00',
        updatedAt: '2024-01-24T11:30:00',
        steps: [
          {
            id: 'STEP006',
            name: '系统审核',
            assigneeId: 'SYSTEM',
            assigneeName: '系统自动',
            status: 'approved',
            completedAt: '2024-01-21T09:00:00',
            comments: '数据格式正确，价格范围合理'
          },
          {
            id: 'STEP007',
            name: '价格专员审批',
            assigneeId: 'PRICE001',
            assigneeName: '钱专员',
            status: 'approved',
            completedAt: '2024-01-24T11:30:00',
            comments: '审核通过，已安排系统导入'
          }
        ],
        comments: []
      }
    ];

    // 根据类型过滤数据
    let filteredData = mockData;
    if (type === 'inbox') {
      filteredData = mockData.filter(req =>
        req.status === 'pending' &&
        req.steps.some(step =>
          step.status === 'pending' &&
          step.assigneeId === 'CURRENT_USER' // 模拟当前用户
        )
      );
    } else if (type === 'sent') {
      filteredData = mockData.filter(req => req.requesterId === 'USER001');
    }

    setRequests(filteredData);
  }, [type]);

  // 获取类型标签
  const getTypeTag = (type: string) => {
    const typeMap = {
      price_create: { color: 'blue', text: '价格创建' },
      price_update: { color: 'orange', text: '价格更新' },
      strategy_create: { color: 'green', text: '策略创建' },
      strategy_update: { color: 'purple', text: '策略更新' },
      batch_import: { color: 'cyan', text: '批量导入' }
    };
    const config = typeMap[type as keyof typeof typeMap];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 获取优先级标签
  const getPriorityTag = (priority: string) => {
    const priorityMap = {
      low: { color: 'default', text: '低' },
      medium: { color: 'orange', text: '中' },
      high: { color: 'red', text: '高' },
      urgent: { color: 'red', text: '紧急' }
    };
    const config = priorityMap[priority as keyof typeof priorityMap];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 获取状态标签
  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { status: 'processing', text: '待处理' },
      approved: { status: 'success', text: '已通过' },
      rejected: { status: 'error', text: '已拒绝' },
      cancelled: { status: 'default', text: '已取消' }
    };
    const config = statusMap[status as keyof typeof statusMap];
    return <Badge status={config.status as any} text={config.text} />;
  };

  // 表格列配置
  const columns: ColumnsType<ApprovalRequest> = [
    {
      title: '申请信息',
      key: 'requestInfo',
      render: (_, record: ApprovalRequest) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
            {record.title}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            申请人: {record.requesterName}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {dayjs(record.createdAt).format('YYYY-MM-DD HH:mm')}
          </div>
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'requestType',
      key: 'requestType',
      render: (type: string) => getTypeTag(type)
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => getPriorityTag(priority)
    },
    {
      title: '审批进度',
      key: 'progress',
      render: (_, record: ApprovalRequest) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <Text type="secondary">{record.currentStep}/{record.totalSteps}</Text>
          </div>
          <Steps
            size="small"
            current={record.currentStep}
            items={record.steps.map((step, index) => ({
              title: step.name,
              status: step.status === 'approved' ? 'finish' :
                     step.status === 'rejected' ? 'error' :
                     step.status === 'skipped' ? 'wait' : 'process'
            }))}
          />
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusBadge(status)
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: ApprovalRequest) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === 'pending' && record.steps.some(step =>
            step.status === 'pending' && step.assigneeId === 'CURRENT_USER'
          ) && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record)}
              >
                审批
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record)}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  // 处理查看详情
  const handleViewDetail = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setDetailVisible(true);
  };

  // 处理审批
  const handleApprove = (request: ApprovalRequest) => {
    setSelectedRequest(request);
    setApproveVisible(true);
  };

  // 处理拒绝
  const handleReject = (request: ApprovalRequest) => {
    Modal.confirm({
      title: '确认拒绝',
      icon: <WarningOutlined />,
      content: `确定要拒绝申请"${request.title}"吗？`,
      okText: '确认拒绝',
      cancelText: '取消',
      onOk() {
        // 更新请求状态
        setRequests(requests.map(req =>
          req.id === request.id
            ? {
                ...req,
                status: 'rejected',
                updatedAt: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
                steps: req.steps.map(step =>
                  step.status === 'pending' && step.assigneeId === 'CURRENT_USER'
                    ? { ...step, status: 'rejected', completedAt: dayjs().format('YYYY-MM-DDTHH:mm:ss') }
                    : step
                )
              }
            : req
        ));
        message.success('已拒绝申请');
      }
    });
  };

  // 处理审批提交
  const handleApproveSubmit = (values: any) => {
    if (!selectedRequest) return;

    // 更新请求状态
    const updatedRequest = {
      ...selectedRequest,
      status: 'approved' as const,
      updatedAt: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      steps: selectedRequest.steps.map(step => {
        if (step.status === 'pending' && step.assigneeId === 'CURRENT_USER') {
          return {
            ...step,
            status: 'approved' as const,
            completedAt: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
            comments: values.comments
          };
        }
        return step;
      })
    };

    setRequests(requests.map(req =>
      req.id === selectedRequest.id ? updatedRequest : req
    ));

    setApproveVisible(false);
    setSelectedRequest(null);
    form.resetFields();
    message.success('审批通过');
  };

  // 处理评论提交
  const handleCommentSubmit = (values: any) => {
    if (!selectedRequest) return;

    const newComment: ApprovalComment = {
      id: Date.now().toString(),
      authorId: 'CURRENT_USER',
      authorName: '当前用户',
      content: values.comment,
      createdAt: dayjs().format('YYYY-MM-DDTHH:mm:ss')
    };

    setRequests(requests.map(req =>
      req.id === selectedRequest.id
        ? { ...req, comments: [...req.comments, newComment] }
        : req
    ));

    setCommentVisible(false);
    commentForm.resetFields();
    message.success('评论已添加');
  };

  return (
    <div>
      <Card title="价格审批工作流">
        <Table
          columns={columns}
          dataSource={requests}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="审批详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="comment" icon={<MessageOutlined />} onClick={() => setCommentVisible(true)}>
            添加评论
          </Button>,
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedRequest && (
          <div>
            <Descriptions title="基本信息" bordered size="small" column={2}>
              <Descriptions.Item label="申请标题" span={2}>
                {selectedRequest.title}
              </Descriptions.Item>
              <Descriptions.Item label="申请类型">
                {getTypeTag(selectedRequest.requestType)}
              </Descriptions.Item>
              <Descriptions.Item label="优先级">
                {getPriorityTag(selectedRequest.priority)}
              </Descriptions.Item>
              <Descriptions.Item label="申请人">
                {selectedRequest.requesterName}
              </Descriptions.Item>
              <Descriptions.Item label="申请时间">
                {dayjs(selectedRequest.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {getStatusBadge(selectedRequest.status)}
              </Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>
                <Paragraph>{selectedRequest.description}</Paragraph>
              </Descriptions.Item>
            </Descriptions>

            <Divider>审批流程</Divider>
            <Timeline>
              {selectedRequest.steps.map((step, index) => (
                <Timeline.Item
                  key={step.id}
                  color={
                    step.status === 'approved' ? 'green' :
                    step.status === 'rejected' ? 'red' :
                    step.status === 'skipped' ? 'gray' : 'blue'
                  }
                  dot={
                    step.status === 'approved' ? <CheckOutlined /> :
                    step.status === 'rejected' ? <CloseOutlined /> :
                    <ClockCircleOutlined />
                  }
                >
                  <div>
                    <div style={{ fontWeight: 'bold' }}>
                      {step.name}
                      {step.assigneeName && (
                        <Text type="secondary"> - {step.assigneeName}</Text>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {step.status === 'approved' && `完成于 ${dayjs(step.completedAt).format('MM-DD HH:mm')}`}
                      {step.status === 'pending' && '待处理'}
                      {step.status === 'rejected' && '已拒绝'}
                      {step.comments && (
                        <div style={{ marginTop: 4, padding: '4px 8px', background: '#f5f5f5', borderRadius: 4 }}>
                          {step.comments}
                        </div>
                      )}
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>

            {selectedRequest.comments.length > 0 && (
              <>
                <Divider>评论记录</Divider>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {selectedRequest.comments.map(comment => (
                    <div key={comment.id} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                        <Avatar size="small" icon={<UserOutlined />} />
                        <span style={{ marginLeft: 8, fontWeight: 'bold' }}>{comment.authorName}</span>
                        <span style={{ marginLeft: 8, fontSize: '12px', color: '#666' }}>
                          {dayjs(comment.createdAt).format('MM-DD HH:mm')}
                        </span>
                      </div>
                      <div style={{ marginLeft: 32, padding: '8px 12px', background: '#f9f9f9', borderRadius: 4 }}>
                        {comment.content}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* 审批弹窗 */}
      <Modal
        title="审批操作"
        open={approveVisible}
        onCancel={() => {
          setApproveVisible(false);
          setSelectedRequest(null);
          form.resetFields();
        }}
        footer={null}
      >
        {selectedRequest && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleApproveSubmit}
          >
            <Alert
              message={`审批申请: ${selectedRequest.title}`}
              description={selectedRequest.description}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Form.Item
              name="comments"
              label="审批意见"
              rules={[{ required: true, message: '请输入审批意见' }]}
            >
              <TextArea
                rows={4}
                placeholder="请输入审批意见..."
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => {
                  setApproveVisible(false);
                  setSelectedRequest(null);
                  form.resetFields();
                }}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit" icon={<CheckOutlined />}>
                  通过审批
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* 评论弹窗 */}
      <Modal
        title="添加评论"
        open={commentVisible}
        onCancel={() => {
          setCommentVisible(false);
          commentForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={commentForm}
          layout="vertical"
          onFinish={handleCommentSubmit}
        >
          <Form.Item
            name="comment"
            label="评论内容"
            rules={[{ required: true, message: '请输入评论内容' }]}
          >
            <TextArea
              rows={4}
              placeholder="请输入评论内容..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setCommentVisible(false);
                commentForm.resetFields();
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" icon={<MessageOutlined />}>
                发表评论
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PricingApproval;