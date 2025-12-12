/**
 * 调拨详情组件
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Table,
  Tag,
  Button,
  Space,
  Divider,
  Row,
  Col,
  Modal,
  Form,
  Input,
  message,
  Tabs,
  Timeline,
  Badge,
  Upload,
  Image,
} from 'antd';
import {
  EditOutlined,
  PrinterOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  TruckOutlined,
  ExclamationCircleOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  Transfer,
  TransferStatus,
  TransferType,
  TransferPriority,
  TransferLog,
  TransferFormData,
} from '@/types/transfer';
import { useTransferStore } from '@/stores/transferStore';
import TransferForm from './TransferForm';
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters';

const { TextArea } = Input;
const { TabPane } = Tabs;

/**
 * 调拨详情组件属性
 */
interface TransferDetailProps {
  transferId: string;
  onEdit?: (transfer: Transfer) => void;
  onBack?: () => void;
}

/**
 * 调拨详情组件
 */
const TransferDetail: React.FC<TransferDetailProps> = ({
  transferId,
  onEdit,
  onBack,
}) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [approvalForm] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const [startForm] = Form.useForm();

  const {
    currentTransfer,
    loading,
    transferLogs,
    fetchTransferById,
    fetchTransferLogs,
    approveTransfer,
    rejectTransfer,
    startTransfer,
    completeTransfer,
    cancelTransfer,
  } = useTransferStore();

  // 初始化数据
  useEffect(() => {
    if (transferId) {
      fetchTransferById(transferId);
      fetchTransferLogs(transferId);
    }
  }, [transferId]);

  // 获取状态标签
  const getStatusTag = (status: TransferStatus) => {
    const statusMap = {
      [TransferStatus.DRAFT]: { color: 'default', text: '草稿' },
      [TransferStatus.PENDING_APPROVAL]: { color: 'processing', text: '待审批' },
      [TransferStatus.APPROVED]: { color: 'success', text: '已审批' },
      [TransferStatus.REJECTED]: { color: 'error', text: '已拒绝' },
      [TransferStatus.IN_TRANSIT]: { color: 'warning', text: '调拨中' },
      [TransferStatus.PARTIAL_RECEIVED]: { color: 'warning', text: '部分收货' },
      [TransferStatus.COMPLETED]: { color: 'success', text: '已完成' },
      [TransferStatus.CANCELLED]: { color: 'default', text: '已取消' },
      [TransferStatus.EXCEPTION]: { color: 'error', text: '异常' },
    };

    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 获取类型标签
  const getTypeTag = (type: TransferType) => {
    const typeMap = {
      [TransferType.WAREHOUSE_TO_WAREHOUSE]: '仓库间调拨',
      [TransferType.STORE_TO_STORE]: '门店间调拨',
      [TransferType.WAREHOUSE_TO_STORE]: '仓库到门店',
      [TransferType.STORE_TO_WAREHOUSE]: '门店到仓库',
      [TransferType.EMERGENCY]: '紧急调拨',
    };

    return <Tag>{typeMap[type] || type}</Tag>;
  };

  // 获取优先级标签
  const getPriorityTag = (priority: TransferPriority) => {
    const priorityMap = {
      [TransferPriority.LOW]: { color: 'default', text: '低' },
      [TransferPriority.NORMAL]: { color: 'blue', text: '普通' },
      [TransferPriority.HIGH]: { color: 'orange', text: '高' },
      [TransferPriority.URGENT]: { color: 'red', text: '紧急' },
    };

    const config = priorityMap[priority] || { color: 'default', text: priority };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 编辑调拨
  const handleEdit = () => {
    if (currentTransfer) {
      onEdit?.(currentTransfer);
      setShowEditForm(true);
    }
  };

  // 审批通过
  const handleApprove = async () => {
    try {
      const values = await approvalForm.validateFields();
      await approveTransfer(transferId, values.remarks);
      message.success('审批通过');
      setShowApprovalModal(false);
      await fetchTransferById(transferId);
    } catch (error) {
      message.error('审批失败');
    }
  };

  // 审批拒绝
  const handleReject = async () => {
    try {
      const values = await rejectForm.validateFields();
      await rejectTransfer(transferId, values.reason);
      message.success('已拒绝');
      setShowRejectModal(false);
      await fetchTransferById(transferId);
    } catch (error) {
      message.error('拒绝失败');
    }
  };

  // 开始调拨
  const handleStart = async () => {
    try {
      const values = await startForm.validateFields();
      await startTransfer(transferId, values.trackingNumber);
      message.success('调拨已开始');
      setShowStartModal(false);
      await fetchTransferById(transferId);
    } catch (error) {
      message.error('开始调拨失败');
    }
  };

  // 完成调拨
  const handleComplete = async () => {
    message.info('完成调拨功能开发中...');
  };

  // 取消调拨
  const handleCancel = () => {
    Modal.confirm({
      title: '确认取消',
      content: '确定要取消此调拨单吗？',
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await cancelTransfer(transferId, '用户取消');
          message.success('已取消调拨');
          await fetchTransferById(transferId);
        } catch (error) {
          message.error('取消失败');
        }
      },
    });
  };

  // 打印功能
  const handlePrint = () => {
    window.print();
  };

  // 导出功能
  const handleExport = () => {
    message.info('导出功能开发中...');
  };

  // 商品表格列
  const itemColumns: ColumnsType<any> = [
    {
      title: '商品编码',
      dataIndex: 'productCode',
      key: 'productCode',
      width: 120,
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 150,
    },
    {
      title: 'SKU编码',
      dataIndex: 'skuCode',
      key: 'skuCode',
      width: 120,
    },
    {
      title: 'SKU名称',
      dataIndex: 'skuName',
      key: 'skuName',
      width: 150,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
    },
    {
      title: '计划数量',
      dataIndex: 'plannedQuantity',
      key: 'plannedQuantity',
      width: 100,
      align: 'right',
    },
    {
      title: '实际数量',
      dataIndex: 'actualQuantity',
      key: 'actualQuantity',
      width: 100,
      align: 'right',
      render: (value: number) => value || '-',
    },
    {
      title: '已收数量',
      dataIndex: 'receivedQuantity',
      key: 'receivedQuantity',
      width: 100,
      align: 'right',
      render: (value: number) => value || '-',
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      align: 'right',
      render: (value: number) => formatCurrency(value),
    },
    {
      title: '小计',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      align: 'right',
      render: (value: number) => formatCurrency(value),
    },
    {
      title: '批次号',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 120,
    },
    {
      title: '生产日期',
      dataIndex: 'productionDate',
      key: 'productionDate',
      width: 120,
      render: (value: string) => value ? formatDate(value) : '-',
    },
    {
      title: '有效期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (value: string) => value ? formatDate(value) : '-',
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 150,
      ellipsis: true,
    },
  ];

  // 操作日志表格列
  const logColumns: ColumnsType<TransferLog> = [
    {
      title: '操作时间',
      dataIndex: 'actionTime',
      key: 'actionTime',
      width: 150,
      render: (time: string) => formatDateTime(time),
    },
    {
      title: '操作人',
      dataIndex: ['actionBy', 'name'],
      key: 'operator',
      width: 100,
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 120,
      render: (action: string) => {
        const actionMap: Record<string, string> = {
          created: '创建',
          submitted: '提交审批',
          approved: '审批通过',
          rejected: '审批拒绝',
          shipped: '开始调拨',
          received: '收货确认',
          cancelled: '取消',
          modified: '修改',
        };
        return actionMap[action] || action;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
  ];

  if (!currentTransfer) {
    return (
      <Card loading={true}>
        <div className="text-center py-8">加载中...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 操作栏 */}
      <Card>
        <div className="flex items-center justify-between">
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
              返回
            </Button>
            <Divider type="vertical" />
            <span className="text-lg font-semibold">
              调拨详情 - {currentTransfer.transferNumber}
            </span>
          </Space>

          <Space>
            {currentTransfer.status === TransferStatus.DRAFT && (
              <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                编辑
              </Button>
            )}

            {currentTransfer.status === TransferStatus.PENDING_APPROVAL && (
              <>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => setShowApprovalModal(true)}
                >
                  审批通过
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => setShowRejectModal(true)}
                >
                  审批拒绝
                </Button>
              </>
            )}

            {currentTransfer.status === TransferStatus.APPROVED && (
              <Button
                type="primary"
                icon={<TruckOutlined />}
                onClick={() => setShowStartModal(true)}
              >
                开始调拨
              </Button>
            )}

            {currentTransfer.status === TransferStatus.IN_TRANSIT && (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => setShowCompleteModal(true)}
              >
                完成收货
              </Button>
            )}

            {[TransferStatus.DRAFT, TransferStatus.PENDING_APPROVAL, TransferStatus.REJECTED].includes(
              currentTransfer.status
            ) && (
              <Button danger onClick={handleCancel}>
                取消调拨
              </Button>
            )}

            <Divider type="vertical" />

            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              打印
            </Button>

            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              导出
            </Button>
          </Space>
        </div>
      </Card>

      {/* 基本信息 */}
      <Card title="基本信息">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="调拨单号">
                {currentTransfer.transferNumber}
              </Descriptions.Item>
              <Descriptions.Item label="调拨标题">
                {currentTransfer.title}
              </Descriptions.Item>
              <Descriptions.Item label="调拨类型">
                {getTypeTag(currentTransfer.type)}
              </Descriptions.Item>
              <Descriptions.Item label="调拨状态">
                {getStatusTag(currentTransfer.status)}
              </Descriptions.Item>
              <Descriptions.Item label="优先级">
                {getPriorityTag(currentTransfer.priority)}
              </Descriptions.Item>
            </Descriptions>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="计划调拨日期">
                {formatDate(currentTransfer.plannedDate)}
              </Descriptions.Item>
              <Descriptions.Item label="实际发货日期">
                {currentTransfer.actualShipDate
                  ? formatDate(currentTransfer.actualShipDate)
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="实际收货日期">
                {currentTransfer.actualReceiveDate
                  ? formatDate(currentTransfer.actualReceiveDate)
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="运输方式">
                {currentTransfer.shippingMethod === 'self_pickup' && '自提'}
                {currentTransfer.shippingMethod === 'company_logistics' && '公司物流'}
                {currentTransfer.shippingMethod === 'third_party_logistics' && '第三方物流'}
                {currentTransfer.shippingMethod === 'express' && '快递'}
              </Descriptions.Item>
              <Descriptions.Item label="运输单号">
                {currentTransfer.trackingNumber || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="承运商">
                {currentTransfer.carrier || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="预计到达日期">
                {currentTransfer.estimatedArrivalDate
                  ? formatDate(currentTransfer.estimatedArrivalDate)
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="总金额">
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(currentTransfer.totalAmount)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="运费">
                {currentTransfer.shippingCost
                  ? formatCurrency(currentTransfer.shippingCost)
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="保险费">
                {currentTransfer.insuranceCost
                  ? formatCurrency(currentTransfer.insuranceCost)
                  : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>

        {currentTransfer.description && (
          <div className="mt-4">
            <Descriptions column={1}>
              <Descriptions.Item label="调拨描述">
                {currentTransfer.description}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}

        {currentTransfer.remarks && (
          <div className="mt-4">
            <Descriptions column={1}>
              <Descriptions.Item label="备注">
                {currentTransfer.remarks}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Card>

      {/* 位置信息 */}
      <Card title="位置信息">
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-semibold mb-3">调出位置</h4>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="类型">
                  {currentTransfer.fromLocation.type === 'warehouse' ? '仓库' : '门店'}
                </Descriptions.Item>
                <Descriptions.Item label="名称">
                  {currentTransfer.fromLocation.name}
                </Descriptions.Item>
                <Descriptions.Item label="编码">
                  {currentTransfer.fromLocation.code}
                </Descriptions.Item>
                <Descriptions.Item label="地址">
                  {currentTransfer.fromLocation.address || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="联系人">
                  {currentTransfer.fromLocation.contactName || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="联系电话">
                  {currentTransfer.fromLocation.contactPhone || '-'}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-semibold mb-3">调入位置</h4>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="类型">
                  {currentTransfer.toLocation.type === 'warehouse' ? '仓库' : '门店'}
                </Descriptions.Item>
                <Descriptions.Item label="名称">
                  {currentTransfer.toLocation.name}
                </Descriptions.Item>
                <Descriptions.Item label="编码">
                  {currentTransfer.toLocation.code}
                </Descriptions.Item>
                <Descriptions.Item label="地址">
                  {currentTransfer.toLocation.address || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="联系人">
                  {currentTransfer.toLocation.contactName || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="联系电话">
                  {currentTransfer.toLocation.contactPhone || '-'}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 人员信息 */}
      <Card title="人员信息">
        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12} md={8}>
            <div className="bg-blue-50 p-4 rounded">
              <h4 className="font-semibold mb-3">申请人</h4>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="姓名">
                  {currentTransfer.applicant.name}
                </Descriptions.Item>
                <Descriptions.Item label="部门">
                  {currentTransfer.applicant.department}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Col>

          <Col xs={24} sm={12} md={8}>
            {currentTransfer.approver && (
              <div className="bg-green-50 p-4 rounded">
                <h4 className="font-semibold mb-3">审批人</h4>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="姓名">
                    {currentTransfer.approver.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="职位">
                    {currentTransfer.approver.position}
                  </Descriptions.Item>
                  <Descriptions.Item label="审批时间">
                    {currentTransfer.approver.approveTime
                      ? formatDateTime(currentTransfer.approver.approveTime)
                      : '-'}
                  </Descriptions.Item>
                  {currentTransfer.approver.remarks && (
                    <Descriptions.Item label="审批意见">
                      {currentTransfer.approver.remarks}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </div>
            )}
          </Col>

          <Col xs={24} sm={12} md={8}>
            {currentTransfer.operator && (
              <div className="bg-orange-50 p-4 rounded">
                <h4 className="font-semibold mb-3">操作员</h4>
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="姓名">
                    {currentTransfer.operator.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="职位">
                    {currentTransfer.operator.position}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}
          </Col>
        </Row>
      </Card>

      {/* 详细信息标签页 */}
      <Card>
        <Tabs defaultActiveKey="items">
          <TabPane tab="调拨商品" key="items">
            <Table
              columns={itemColumns}
              dataSource={currentTransfer.items}
              rowKey="id"
              pagination={false}
              scroll={{ x: 1500 }}
              size="small"
            />
          </TabPane>

          <TabPane tab="操作日志" key="logs">
            <Table
              columns={logColumns}
              dataSource={transferLogs}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </TabPane>

          <TabPane tab="附件" key="attachments">
            {currentTransfer.attachments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentTransfer.attachments.map(attachment => (
                  <div
                    key={attachment.id}
                    className="border rounded p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <PaperClipOutlined className="text-gray-500" />
                      <span className="font-medium text-sm truncate">
                        {attachment.fileName}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {attachment.fileType} • {(attachment.fileSize / 1024).toFixed(2)} KB
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(attachment.uploadedAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                暂无附件
              </div>
            )}
          </TabPane>
        </Tabs>
      </Card>

      {/* 编辑表单 */}
      {showEditForm && currentTransfer && (
        <TransferForm
          mode="edit"
          initialData={{
            type: currentTransfer.type,
            priority: currentTransfer.priority,
            title: currentTransfer.title,
            description: currentTransfer.description,
            fromLocationId: currentTransfer.fromLocation.id,
            toLocationId: currentTransfer.toLocation.id,
            plannedDate: currentTransfer.plannedDate,
            shippingMethod: currentTransfer.shippingMethod,
            estimatedArrivalDate: currentTransfer.estimatedArrivalDate,
            items: currentTransfer.items.map(item => ({
              productId: item.productId,
              productName: item.productName,
              productCode: item.productCode,
              skuId: item.skuId,
              skuCode: item.skuCode,
              skuName: item.skuName,
              unit: item.unit,
              plannedQuantity: item.plannedQuantity,
              unitPrice: item.unitPrice,
              batchNumber: item.batchNumber,
              productionDate: item.productionDate,
              expiryDate: item.expiryDate,
              remarks: item.remarks,
            })),
            remarks: currentTransfer.remarks,
          }}
          onSubmit={async (data) => {
            // 这里应该调用更新API
            message.success('更新成功');
            setShowEditForm(false);
            await fetchTransferById(transferId);
          }}
          onCancel={() => setShowEditForm(false)}
        />
      )}

      {/* 审批通过对话框 */}
      <Modal
        title="审批通过"
        open={showApprovalModal}
        onCancel={() => setShowApprovalModal(false)}
        onOk={handleApprove}
        okText="确认通过"
        cancelText="取消"
      >
        <Form form={approvalForm} layout="vertical">
          <Form.Item
            label="审批意见"
            name="remarks"
          >
            <TextArea
              rows={4}
              placeholder="请输入审批意见（可选）"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 审批拒绝对话框 */}
      <Modal
        title="审批拒绝"
        open={showRejectModal}
        onCancel={() => setShowRejectModal(false)}
        onOk={handleReject}
        okText="确认拒绝"
        cancelText="取消"
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            label="拒绝原因"
            name="reason"
            rules={[{ required: true, message: '请输入拒绝原因' }]}
          >
            <TextArea
              rows={4}
              placeholder="请输入拒绝原因"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 开始调拨对话框 */}
      <Modal
        title="开始调拨"
        open={showStartModal}
        onCancel={() => setShowStartModal(false)}
        onOk={handleStart}
        okText="确认开始"
        cancelText="取消"
      >
        <Form form={startForm} layout="vertical">
          <Form.Item
            label="运输单号"
            name="trackingNumber"
          >
            <Input
              placeholder="请输入运输单号（可选）"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 完成收货对话框 */}
      <Modal
        title="完成收货"
        open={showCompleteModal}
        onCancel={() => setShowCompleteModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowCompleteModal(false)}>
            取消
          </Button>,
          <Button key="complete" type="primary" onClick={handleComplete}>
            完成收货
          </Button>,
        ]}
      >
        <div className="py-4">
          <p>完成收货功能开发中...</p>
        </div>
      </Modal>
    </div>
  );
};

export default TransferDetail;