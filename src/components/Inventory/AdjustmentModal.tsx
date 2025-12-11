/**
 * 库存调整弹窗组件
 * 提供库存调整申请和审批功能的弹窗界面
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  Steps,
  Card,
  Descriptions,
  Tag,
  Space,
  Typography,
  Alert,
  Divider,
  Row,
  Col,
  Button,
  Form,
  InputNumber,
  Select,
  Input,
  Radio,
  Statistic,
  Progress,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { InventoryAdjustment, InventoryLedger } from '@/types/inventory';
import { formatNumber, formatCurrency } from '@/utils/inventoryHelpers';
import { getAdjustmentTypeConfig, getAdjustmentStatusConfig } from '@/utils/inventoryHelpers';
import { useResponsive } from '@/hooks/useResponsive';
import { usePermissions } from '@/hooks/usePermissions';
import AdjustmentForm from './AdjustmentForm';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { TextArea } = Input;

interface AdjustmentModalProps {
  visible: boolean;
  onCancel: () => void;
  mode: 'create' | 'view' | 'approve' | 'execute';
  adjustment?: InventoryAdjustment;
  inventoryItem?: InventoryLedger;
  onSubmit?: (values: any) => Promise<void>;
  onApprove?: (id: string, approved: boolean, remark?: string) => Promise<void>;
  onExecute?: (id: string) => Promise<void>;
}

const AdjustmentModal: React.FC<AdjustmentModalProps> = ({
  visible,
  onCancel,
  mode,
  adjustment,
  inventoryItem,
  onSubmit,
  onApprove,
  onExecute,
}) => {
  const { isMobile } = useResponsive();
  const { canAdjust, canAdmin } = usePermissions();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitData, setSubmitData] = useState<any>(null);
  const [approvalRemark, setApprovalRemark] = useState('');

  // 步骤配置
  const steps = [
    {
      title: '填写调整信息',
      description: '选择调整类型并填写相关信息',
      icon: <EditOutlined />,
    },
    {
      title: '确认信息',
      description: '确认调整详情和影响',
      icon: <EyeOutlined />,
    },
    {
      title: '完成',
      description: '提交申请并等待审批',
      icon: <CheckCircleOutlined />,
    },
  ];

  // 重置状态
  const resetModal = useCallback(() => {
    form.resetFields();
    setCurrentStep(0);
    setSubmitData(null);
    setApprovalRemark('');
    setLoading(false);
  }, [form]);

  // 监听visible变化
  useEffect(() => {
    if (!visible) {
      resetModal();
    } else if (adjustment && mode === 'view') {
      // 查看模式：设置表单数据为只读
      form.setFieldsValue({
        adjustmentType: adjustment.adjustmentType,
        reason: adjustment.reason,
        quantity: Math.abs(adjustment.adjustmentQuantity),
        remark: adjustment.remark,
      });
    }
  }, [visible, adjustment, mode, form, resetModal]);

  // 模态框标题
  const getModalTitle = () => {
    switch (mode) {
      case 'create':
        return '申请库存调整';
      case 'view':
        return '查看调整详情';
      case 'approve':
        return '审批调整申请';
      case 'execute':
        return '执行库存调整';
      default:
        return '库存调整';
    }
  };

  // 处理提交申请
  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      if (!inventoryItem) {
        message.error('缺少库存项目信息');
        return;
      }

      // 计算调整数量
      const adjustmentQuantity = values.adjustmentType.includes('profit')
        ? values.quantity
        : -values.quantity;

      const submitData = {
        sku: inventoryItem.sku,
        productName: inventoryItem.productName,
        locationId: inventoryItem.locationId,
        locationName: inventoryItem.locationName,
        adjustmentType: values.adjustmentType,
        reason: values.reason,
        originalQuantity: inventoryItem.physicalQuantity,
        adjustedQuantity: inventoryItem.physicalQuantity + adjustmentQuantity,
        adjustmentQuantity,
        requestedBy: '当前用户', // 这里应该从用户上下文获取
        remark: values.remark,
      };

      if (mode === 'create') {
        setCurrentStep(1);
        setSubmitData(submitData);
      } else if (mode === 'approve' && onApprove) {
        await onApprove(adjustment!.id, true, approvalRemark);
        onCancel();
      } else if (mode === 'execute' && onExecute) {
        await onExecute(adjustment!.id);
        onCancel();
      } else if (onSubmit) {
        await onSubmit(submitData);
        onCancel();
      }

      if (mode === 'create') {
        message.success('调整申请提交成功，等待审批');
      }
    } catch (error) {
      console.error('提交失败:', error);
      message.error('提交失败，请检查信息是否正确');
    } finally {
      setLoading(false);
    }
  }, [form, inventoryItem, mode, adjustment, onSubmit, onApprove, onExecute, approvalRemark, onCancel]);

  // 处理拒绝申请
  const handleReject = useCallback(async () => {
    if (!adjustment || !onApprove) return;

    try {
      setLoading(true);
      await onApprove(adjustment.id, false, approvalRemark);
      message.success('调整申请已拒绝');
      onCancel();
    } catch (error) {
      console.error('拒绝失败:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  }, [adjustment, onApprove, approvalRemark, onCancel, setLoading]);

  // 处理步骤变化
  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  // 渲染调整类型配置
  const renderAdjustmentTypeConfig = (type: string) => {
    const config = getAdjustmentTypeConfig(type);
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // 渲染状态配置
  const renderStatusConfig = (status: string) => {
    const config = getAdjustmentStatusConfig(status);
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // 渲染填写表单步骤
  const renderFormStep = () => (
    <Card title="调整信息" size="small">
      <AdjustmentForm
        form={form}
        inventoryItem={inventoryItem}
        mode={mode}
        adjustment={adjustment}
      />
    </Card>
  );

  // 渲染确认信息步骤
  const renderConfirmStep = () => {
    if (!submitData && adjustment) {
      // 查看模式使用原始数据
      return (
        <Card title="调整信息确认" size="small">
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="SKU">{adjustment.sku}</Descriptions.Item>
            <Descriptions.Item label="商品名称">{adjustment.productName}</Descriptions.Item>
            <Descriptions.Item label="仓库">{adjustment.locationName}</Descriptions.Item>
            <Descriptions.Item label="调整类型">
              {renderAdjustmentConfig(adjustment.adjustmentType)}
            </Descriptions.Item>
            <Descriptions.Item label="原始数量">{adjustment.originalQuantity}</Descriptions.Item>
            <Descriptions.Item label="调整后数量">{adjustment.adjustedQuantity}</Descriptions.Item>
            <Descriptions.Item label="调整数量">
              <Text strong style={{ color: adjustment.adjustmentQuantity > 0 ? '#52c41a' : '#f5222d' }}>
                {adjustment.adjustmentQuantity > 0 ? '+' : ''}{adjustment.adjustmentQuantity}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="调整原因">{adjustment.reason}</Descriptions.Item>
            <Descriptions.Item label="申请人">{adjustment.requestedBy}</Descriptions.Item>
            <Descriptions.Item label="申请时间">{adjustment.requestedAt}</Descriptions.Item>
            <Descriptions.Item label="当前状态">{renderStatusConfig(adjustment.status)}</Descriptions.Item>
            {adjustment.approvedBy && (
              <>
                <Descriptions.Item label="审批人">{adjustment.approvedBy}</Descriptions.Item>
                <Descriptions.Item label="审批时间">{adjustment.approvedAt}</Descriptions.Item>
              </>
            )}
            {adjustment.completedAt && (
              <Descriptions.Item label="完成时间" span={2}>{adjustment.completedAt}</Descriptions.Item>
            )}
            <Descriptions.Item label="备注" span={2}>{adjustment.remark || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
      );
    }

    return (
      <Card title="调整信息确认" size="small">
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="SKU">{submitData.sku}</Descriptions.Item>
          <Descriptions.Item label="商品名称">{submitData.productName}</Descriptions.Item>
          <Descriptions.Item label="仓库">{submitData.locationName}</Descriptions.Item>
          <Descriptions.Item label="调整类型">
            {renderAdjustmentConfig(submitData.adjustmentType)}
          </Descriptions.Item>
          <Descriptions.Item label="原始数量">{submitData.originalQuantity}</Descriptions.Item>
          <Descriptions.Item label="调整后数量">{submitData.adjustedQuantity}</Descriptions.Item>
          <Descriptions.Item label="调整数量">
            <Text strong style={{ color: submitData.adjustmentQuantity > 0 ? '#52c41a' : '#f5222d' }}>
              {submitData.adjustmentQuantity > 0 ? '+' : ''}{submitData.adjustmentQuantity}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="调整原因">{submitData.reason}</Descriptions.Item>
          <Descriptions.Item label="备注">{submitData.remark || '-'}</Descriptions.Item>
        </Descriptions>

        {/* 调整影响提示 */}
        <Alert
          style={{ marginTop: 16 }}
          message={
            <Space direction="vertical" size="small">
              <Text>调整影响说明：</Text>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>商品 <Text strong>{submitData.productName}</Text> 的库存将从 <Text strong>{submitData.originalQuantity}</Text> 调整为 <Text strong>{submitData.adjustedQuantity}</Text></li>
                <li>调整数量为 <Text strong style={{ color: submitData.adjustmentQuantity > 0 ? '#52c41a' : '#f5222d' }}>
                  {submitData.adjustmentQuantity > 0 ? '+' : ''}{submitData.adjustmentQuantity}
                </Text>
              </li>
                <li>调整后需要等待管理员审批才能生效</li>
              </ul>
            </Space>
          }
          type="info"
          showIcon
        />
      </Card>
    );
  };

  // 渲染完成步骤
  const renderCompleteStep = () => (
    <Card title="申请提交成功" size="small">
      <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
        <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
        <div>
          <Title level={4} style={{ margin: 0 }}>调整申请已提交</Title>
          <Paragraph type="secondary">
            您的库存调整申请已成功提交，系统将自动通知相关管理人员进行审批。
          </Paragraph>
          <Paragraph>
            申请编号：<Text code>{submitData?.adjustmentNo || 'ADJ-' + Date.now()}</Text>
          </Paragraph>
        </div>
      </Space>
    </Card>
  );

  // 渲染审批界面
  const renderApprovalStep = () => {
    if (!adjustment) return null;

    return (
      <>
        <Card title="调整申请信息" size="small">
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="申请编号">{adjustment.adjustmentNo || adjustment.id}</Descriptions.Item>
            <Descriptions.Item label="SKU">{adjustment.sku}</Descriptions.Item>
            <Descriptions.Item label="商品名称">{adjustment.productName}</Descriptions.Item>
            <Descriptions.Item label="仓库">{adjustment.locationName}</Descriptions.Item>
            <Descriptions.Item label="调整类型">
              {renderAdjustmentConfig(adjustment.adjustmentType)}
            </Descriptions.Item>
            <Descriptions.Item label="原始数量">{adjustment.originalQuantity}</Descriptions.Item>
            <Descriptions.Item label="调整后数量">{adjustment.adjustedQuantity}</Descriptions.Item>
            <Descriptions.Item label="调整数量">
              <Text strong style={{ color: adjustment.adjustmentQuantity > 0 ? '#52c41a' : '#f5222d' }}>
                {adjustment.adjustmentQuantity > 0 ? '+' : ''}{adjustment.adjustmentQuantity}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="申请人">{adjustment.requestedBy}</Descriptions.Item>
            <Descriptions.Item label="申请时间">{adjustment.requestedAt}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="审批意见" size="small" style={{ marginTop: 16 }}>
          <Form layout="vertical">
            <Form.Item label="审批备注">
              <TextArea
                placeholder="请输入审批意见（可选）"
                value={approvalRemark}
                onChange={(e) => setApprovalRemark(e.target.value)}
                rows={4}
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>
        </Card>
      </>
    );
  };

  // 渲染执行界面
  const renderExecuteStep = () => {
    if (!adjustment) return null;

    return (
      <Card title="执行库存调整" size="small">
        <Alert
          message={
            <Space direction="vertical" size="small">
              <Text>即将执行以下库存调整：</Text>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>商品：<Text strong>{adjustment.productName}</Text></li>
                <li>调整类型：<Text strong>{getAdjustmentTypeConfig(adjustment.adjustmentType).text}</Text></li>
                <li>调整数量：<Text strong style={{ color: adjustment.adjustmentQuantity > 0 ? '#52c41a' : '#f5222d' }}>
                  {adjustment.adjustmentQuantity > 0 ? '+' : ''}{adjustment.adjustmentQuantity}
                </Text></li>
                <li>当前库存：<Text strong>{adjustment.originalQuantity}</Text> → <Text strong>{adjustment.adjustedQuantity}</Text></li>
              </ul>
              <Text type="warning">此操作不可撤销，请确认无误后执行。</Text>
            </Space>
          }
          type="warning"
          showIcon
        />

        <Descriptions column={2} size="small" bordered style={{ marginTop: 16 }}>
          <Descriptions.Item label="SKU">{adjustment.sku}</Descriptions.Item>
          <Descriptions.Item label="商品名称">{adjustment.productName}</Descriptions.Item>
          <Descriptions.Item label="仓库">{adjustment.locationName}</Descriptions.Item>
          <Descriptions.Item label="调整类型">
            {renderAdjustmentConfig(adjustment.adjustmentType)}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    );
  };

  // 确定内容渲染
  let content;
  switch (mode) {
    case 'create':
      content = (
        <Steps current={currentStep} onChange={handleStepChange} items={steps}>
          <Step key="form" title={renderFormStep()} />
          <Step key="confirm" title={renderConfirmStep()} />
          <Step key="complete" title={renderCompleteStep()} />
        </Steps>
      );
      break;
    case 'view':
      content = renderConfirmStep();
      break;
    case 'approve':
      content = renderApprovalStep();
      break;
    case 'execute':
      content = renderExecuteStep();
      break;
    default:
      content = null;
  }

  // 确定底部按钮
  let footer;
  switch (mode) {
    case 'create':
      footer = (
        <Space>
          <Button onClick={onCancel}>
            {currentStep === 0 ? '取消' : '上一步'}
          </Button>
          {currentStep === 2 ? (
            <Button type="primary" onClick={() => onCancel()}>
              完成
            </Button>
          ) : (
            <Button type="primary" onClick={handleSubmit} loading={loading}>
              {currentStep === 0 ? '下一步' : '提交申请'}
            </Button>
          )}
        </Space>
      );
      break;
    case 'approve':
      footer = (
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button onClick={handleReject} danger loading={loading}>
            拒绝
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            批准
          </Button>
        </Space>
      );
      break;
    case 'execute':
      footer = (
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" danger onClick={handleSubmit} loading={loading}>
            确认执行
          </Button>
        </Space>
      );
      break;
    default:
      footer = null;
  }

  return (
    <Modal
      title={getModalTitle()}
      open={visible}
      onCancel={onCancel}
      footer={footer}
      width={isMobile ? '95%' : 800}
      centered
      destroyOnClose
      maskClosable={mode !== 'execute'}
      keyboard={mode !== 'execute'}
    >
      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {content}
      </div>
    </Modal>
  );
};

export default AdjustmentModal;