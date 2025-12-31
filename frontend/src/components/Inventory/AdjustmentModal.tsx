import React, { useState } from 'react';
import { Modal, Form, Select, InputNumber, Input, Alert, Space, Typography, Divider } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { CurrentInventory } from '@/types/inventory';
import {
  useInventoryAdjustment,
  type AdjustmentType,
  type AdjustmentParams,
} from '@/hooks/useInventoryAdjustment';
import { formatQuantity } from '@/utils/inventoryHelpers';

const { Text } = Typography;
const { TextArea } = Input;

interface AdjustmentModalProps {
  open: boolean;
  inventory: CurrentInventory | null;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * 库存调整对话框组件
 * 支持盘盈、盘亏、报损等调整操作
 */
export const AdjustmentModal: React.FC<AdjustmentModalProps> = ({
  open,
  inventory,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [adjustmentData, setAdjustmentData] = useState<AdjustmentParams | null>(null);

  const adjustmentMutation = useInventoryAdjustment();

  const adjustmentTypeOptions: { label: string; value: AdjustmentType }[] = [
    { label: '盘盈（库存增加）', value: '盘盈' },
    { label: '盘亏（库存减少）', value: '盘亏' },
    { label: '报损（库存减少）', value: '报损' },
  ];

  const reasonOptions = {
    盘盈: ['实物盘点发现多余', '系统录入错误', '退货未入账', '其他原因'],
    盘亏: ['实物盘点发现短缺', '系统录入错误', '丢失或被盗', '其他原因'],
    报损: ['商品损坏', '商品过期', '质量问题', '运输损坏', '其他原因'],
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (!inventory) return;

      const params: AdjustmentParams = {
        skuId: inventory.skuId,
        storeId: inventory.storeId,
        adjustmentType: values.adjustmentType,
        quantity: values.quantity,
        reason: values.reason,
        remarks: values.remarks,
      };

      // 显示二次确认
      setAdjustmentData(params);
      setConfirmVisible(true);
    });
  };

  const handleConfirm = async () => {
    if (!adjustmentData) return;

    try {
      await adjustmentMutation.mutateAsync(adjustmentData);
      setConfirmVisible(false);
      form.resetFields();
      onClose();
      onSuccess?.();
    } catch (error) {
      // 错误已在mutation中处理
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setConfirmVisible(false);
    onClose();
  };

  const watchedType = Form.useWatch('adjustmentType', form);

  return (
    <>
      <Modal
        title="库存调整"
        open={open && !confirmVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
        okText="提交"
        cancelText="取消"
      >
        {inventory && (
          <>
            <Alert
              message="当前库存信息"
              description={
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text>
                    SKU: {inventory.sku?.skuCode} - {inventory.sku?.name}
                  </Text>
                  <Text>门店: {inventory.store?.name}</Text>
                  <Text strong>
                    现存数量: {formatQuantity(inventory.onHandQty, inventory.sku?.unit)}
                  </Text>
                  <Text>
                    可用数量: {formatQuantity(inventory.availableQty, inventory.sku?.unit)}
                  </Text>
                </Space>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Form
              form={form}
              layout="vertical"
              initialValues={{
                adjustmentType: '盘盈',
              }}
            >
              <Form.Item
                label="调整类型"
                name="adjustmentType"
                rules={[{ required: true, message: '请选择调整类型' }]}
              >
                <Select options={adjustmentTypeOptions} />
              </Form.Item>

              <Form.Item
                label="调整数量"
                name="quantity"
                rules={[
                  { required: true, message: '请输入调整数量' },
                  {
                    type: 'number',
                    min: 0.01,
                    message: '调整数量必须大于0',
                  },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="请输入调整数量"
                  addonAfter={inventory.sku?.unit || '件'}
                  precision={2}
                />
              </Form.Item>

              <Form.Item
                label="调整原因"
                name="reason"
                rules={[{ required: true, message: '请选择调整原因' }]}
              >
                <Select
                  placeholder="请选择调整原因"
                  options={
                    watchedType
                      ? reasonOptions[watchedType as AdjustmentType].map((r: string) => ({
                          label: r,
                          value: r,
                        }))
                      : []
                  }
                />
              </Form.Item>

              <Form.Item label="备注说明" name="remarks">
                <TextArea rows={3} placeholder="请输入备注说明（选填）" maxLength={200} showCount />
              </Form.Item>
            </Form>

            <Alert
              message="温馨提示"
              description={
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>库存调整操作将直接影响库存数量</li>
                  <li>所有调整都会记录在库存流水中</li>
                  <li>请确保调整数量和原因准确无误</li>
                  <li>提交前会进行二次确认</li>
                </ul>
              }
              type="warning"
              showIcon
            />
          </>
        )}
      </Modal>

      {/* 二次确认对话框 */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            <span>确认库存调整</span>
          </Space>
        }
        open={confirmVisible}
        onOk={handleConfirm}
        onCancel={() => setConfirmVisible(false)}
        okText="确认调整"
        cancelText="返回修改"
        confirmLoading={adjustmentMutation.isPending}
        okButtonProps={{ danger: adjustmentData?.adjustmentType !== '盘盈' }}
      >
        {adjustmentData && inventory && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Divider style={{ margin: '12px 0' }} />
            <Text>
              <Text strong>SKU:</Text> {inventory.sku?.skuCode} - {inventory.sku?.name}
            </Text>
            <Text>
              <Text strong>门店:</Text> {inventory.store?.name}
            </Text>
            <Text>
              <Text strong>调整类型:</Text>{' '}
              <Text type={adjustmentData.adjustmentType === '盘盈' ? 'success' : 'danger'} strong>
                {adjustmentData.adjustmentType}
              </Text>
            </Text>
            <Text>
              <Text strong>调整数量:</Text>{' '}
              <Text strong style={{ fontSize: 16 }}>
                {adjustmentData.adjustmentType === '盘盈' ? '+' : '-'}
                {formatQuantity(adjustmentData.quantity, inventory.sku?.unit)}
              </Text>
            </Text>
            <Text>
              <Text strong>调整原因:</Text> {adjustmentData.reason}
            </Text>
            {adjustmentData.remarks && (
              <Text>
                <Text strong>备注:</Text> {adjustmentData.remarks}
              </Text>
            )}
            <Divider style={{ margin: '12px 0' }} />
            <Alert
              message="请仔细核对以上信息，确认无误后点击确认调整按钮"
              type="warning"
              showIcon
            />
          </Space>
        )}
      </Modal>
    </>
  );
};

export default AdjustmentModal;
