/**
 * 库存调整表单组件
 * 提供调整类型选择、数量输入和原因填写功能
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Form,
  Select,
  InputNumber,
  Input,
  Radio,
  Button,
  Space,
  Typography,
  Alert,
  Row,
  Col,
  Card,
  Divider,
  Tag,
  Statistic,
} from 'antd';
import {
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { InventoryAdjustment, InventoryLedger } from '@/types/inventory';
import { getAdjustmentTypeConfig } from '@/utils/inventoryHelpers';
import { usePermissions } from '@/hooks/usePermissions';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface AdjustmentFormProps {
  form: any;
  inventoryItem?: InventoryLedger;
  mode: 'create' | 'edit' | 'view';
  adjustment?: InventoryAdjustment;
  onValuesChange?: (values: any) => void;
}

// 调整类型选项
const ADJUSTMENT_TYPE_OPTIONS = [
  {
    value: 'stocktaking_profit',
    label: '盘盈',
    description: '盘点时发现实际库存多于账面库存',
    icon: 'check-circle',
    color: 'success',
  },
  {
    value: 'stocktaking_loss',
    label: '盘亏',
    description: '盘点时发现实际库存少于账面库存',
    icon: 'close-circle',
    color: 'error',
  },
  {
    value: 'damage',
    label: '报损',
    description: '商品损坏或变质需要报损处理',
    icon: 'warning',
    color: 'warning',
  },
  {
    value: 'expired',
    label: '过期',
    description: '商品超过保质期需要处理',
    icon: 'clock-circle',
    color: 'orange',
  },
  {
    value: 'other',
    label: '其他',
    description: '其他原因导致的库存调整',
    icon: 'info-circle',
    color: 'default',
  },
];

// 调整原因选项（根据类型动态生成）
const getReasonOptions = (adjustmentType: string) => {
  const reasonMap: Record<string, Array<{ label: string; value: string; description?: string }>> = {
    stocktaking_profit: [
      { label: '盘点错误', value: '盘点错误导致数量不符', description: '之前盘点有误，现在更正' },
      { label: '收货漏记', value: '收货时漏记入库', description: '收货时未及时登记' },
      { label: '系统异常', value: '系统数据异常', description: '系统计算错误导致' },
      { label: '其他', value: '其他原因', description: '其他盘盈原因' },
    ],
    stocktaking_loss: [
      { label: '盘点错误', value: '盘点错误导致数量不符', description: '之前盘点有误，现在更正' },
      { label: '发货错误', value: '发货时多发货物', description: '发货时数量有误' },
      { label: '被盗损失', value: '货物被盗', description: '货物被盗或丢失' },
      { label: '其他', value: '其他原因', description: '其他盘亏原因' },
    ],
    damage: [
      { label: '运输损坏', value: '运输过程中损坏', description: '物流运输导致商品损坏' },
      { label: '存储不当', value: '存储环境不当', description: '仓库条件问题导致' },
      { label: '包装破损', value: '包装问题导致', description: '包装破损影响商品' },
      { label: '质量问题', value: '商品质量问题', description: '商品本身质量问题' },
      { label: '其他', value: '其他原因', description: '其他报损原因' },
    ],
    expired: [
      { label: '食品过期', value: '食品超过保质期', description: '食品类商品过期' },
      { label: '药品过期', value: '药品超过有效期', description: '药品类商品过期' },
      { label: '化妆品过期', value: '化妆品超过保质期', description: '化妆品类商品过期' },
      { label: '其他', value: '其他过期类型', description: '其他类型商品过期' },
    ],
    other: [
      { label: '系统调账', value: '系统数据调账', description: '系统数据调整' },
      { label: '数据修正', value: '基础数据修正', description: '基础数据需要修正' },
      { label: '业务调整', value: '业务需求调整', description: '业务需求导致调整' },
      { label: '其他', value: '其他调整原因', description: '其他库存调整' },
    ],
  };

  return reasonMap[adjustmentType] || reasonMap.other;
};

const AdjustmentForm: React.FC<AdjustmentFormProps> = ({
  form,
  inventoryItem,
  mode,
  adjustment,
  onValuesChange,
}) => {
  const { canAdjust, canAdmin } = usePermissions();
  const [adjustmentType, setAdjustmentType] = useState<string>();
  const [quantity, setQuantity] = useState<number>();
  const [reason, setReason] = useState<string>();
  const [remark, setRemark] = useState<string>();
  const [customReason, setCustomReason] = useState<string>('');
  const [useCustomReason, setUseCustomReason] = useState(false);

  // 表单值变化处理
  const handleValuesChange = useCallback((changedValues: any, allValues: any) => {
    if (changedValues.adjustmentType !== undefined) {
      setAdjustmentType(changedValues.adjustmentType);
      setQuantity(undefined);
      setReason(undefined);
      setCustomReason('');
      setUseCustomReason(false);
    }

    if (changedValues.quantity !== undefined) {
      setQuantity(changedValues.quantity);
    }

    if (changedValues.reason !== undefined) {
      if (changedValues.reason === '__custom__') {
        setUseCustomReason(true);
        setReason('');
      } else {
        setUseCustomReason(false);
        setReason(changedValues.reason);
      }
    }

    if (changedValues.remark !== undefined) {
      setRemark(changedValues.remark);
    }

    onValuesChange?.(allValues);
  }, [onValuesChange]);

  // 监听表单字段变化
  useEffect(() => {
    const unsubscribe = form.onFieldsChange(
      (changedFields, allFields) => {
        handleValuesChange(
          Object.fromEntries(
            changedFields.map(field => [field.name[0], allFields[field.name[0]]])
          ),
          allFields
        );
      }
    );

    return unsubscribe;
  }, [form, handleValuesChange]);

  // 初始化表单数据
  useEffect(() => {
    if (adjustment && mode === 'edit') {
      form.setFieldsValue({
        adjustmentType: adjustment.adjustmentType,
        quantity: Math.abs(adjustment.adjustmentQuantity),
        reason: adjustment.reason,
        remark: adjustment.remark,
      });
      setAdjustmentType(adjustment.adjustmentType);
      setQuantity(Math.abs(adjustment.adjustmentQuantity));
      setReason(adjustment.reason);
      setRemark(adjustment.remark);
    }
  }, [adjustment, form, mode]);

  // 计算调整后的数量
  const adjustedQuantity = inventoryItem && quantity !== undefined
    ? (adjustmentType?.includes('profit') ? inventoryItem.physicalQuantity + quantity : inventoryItem.physicalQuantity - quantity)
    : 0;

  // 计算库存状态影响
  const getStockImpact = () => {
    if (!inventoryItem || adjustedQuantity === 0) return null;

    const impact = adjustedQuantity - inventoryItem.physicalQuantity;
    const percentage = inventoryItem.physicalQuantity > 0 ? (Math.abs(impact) / inventoryItem.physicalQuantity * 100) : 0;

    if (impact > 0) {
      return {
        type: 'increase',
        message: `库存将增加 ${impact} 件 (+${percentage.toFixed(1)}%)`,
        color: 'success',
      };
    } else if (impact < 0) {
      return {
        type: 'decrease',
        message: `库存将减少 ${Math.abs(impact)} 件 (${percentage.toFixed(1)}%)`,
        color: 'error',
      };
    } else {
      return {
        type: 'no_change',
        message: '库存数量无变化',
        color: 'default',
      };
    }
  };

  const stockImpact = getStockImpact();

  // 处理自定义原因输入
  const handleCustomReasonChange = useCallback((value: string) => {
    setCustomReason(value);
    if (value.trim()) {
      form.setFieldValue('reason', value);
    }
  }, [form]);

  // 处理使用自定义原因
  const handleUseCustomReasonChange = useCallback((checked: boolean) => {
    setUseCustomReason(checked);
    if (checked) {
      setReason('');
      form.setFieldValue('reason', '__custom__');
    } else {
      setReason('');
      form.setFieldValue('reason', undefined);
      setCustomReason('');
    }
  }, [form]);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* 库存信息显示 */}
      {inventoryItem && (
        <Card size="small" title="当前库存信息">
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="当前库存"
                value={inventoryItem.physicalQuantity}
                suffix="件"
                valueStyle={{ color: inventoryItem.physicalQuantity <= 0 ? '#f5222d' : undefined }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="可用库存"
                value={inventoryItem.availableQuantity}
                suffix="件"
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="安全库存"
                value={inventoryItem.safetyStock}
                suffix="件"
                valueStyle={{ color: inventoryItem.physicalQuantity <= inventoryItem.safetyStock ? '#f5222d' : undefined }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="库存状态"
                value={
                  inventoryItem.stockStatus === 'low' ? '库存不足' :
                  inventoryItem.stockStatus === 'out_of_stock' ? '缺货' :
                  inventoryItem.stockStatus === 'high' ? '库存积压' : '正常'
                }
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* 调整类型选择 */}
      <Card size="small" title="调整类型">
        <Form.Item
          name="adjustmentType"
          rules={[
            { required: true, message: '请选择调整类型' }
          ]}
        >
          <Radio.Group
            value={adjustmentType}
            onChange={(e) => form.setFieldValue('adjustmentType', e.target.value)}
            disabled={mode === 'view'}
          >
            <Row gutter={[16, 16]}>
              {ADJUSTMENT_TYPE_OPTIONS.map(option => (
                <Col span={12} key={option.value}>
                  <Radio
                    value={option.value}
                    style={{ display: 'flex', alignItems: 'center', padding: '8px' }}
                    disabled={mode === 'view'}
                  >
                    <Tag color={option.color} icon={option.icon} style={{ marginRight: 8 }}>
                      {option.label}
                    </Tag>
                    <div style={{ flex: 1 }}>
                      <div>{option.label}</div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {option.description}
                      </Text>
                    </div>
                  </Radio>
                </Col>
              ))}
            </Row>
          </Radio.Group>
        </Form.Item>
      </Card>

      {/* 调整数量 */}
      {adjustmentType && (
        <Card size="small" title="调整数量">
          <Form.Item
            label="调整数量"
            name="quantity"
            rules={[
              { required: true, message: '请输入调整数量' },
              { type: 'number', min: 1, message: '调整数量必须大于0' },
              {
                validator: (_, value) => {
                  if (adjustmentType === 'stocktaking_loss' && inventoryItem) {
                    if (value > inventoryItem.physicalQuantity) {
                      return Promise.reject('出库数量不能超过当前库存');
                    }
                  }
                  return Promise.resolve();
                },
              },
            ]}
            extra={
              <Text type="secondary">
                {adjustmentType?.includes('profit') ? '增加数量' : '减少数量'}
              </Text>
            }
          >
            <InputNumber
              min={1}
              max={adjustmentType === 'stocktaking_loss' ? inventoryItem?.physicalQuantity : undefined}
              placeholder="请输入调整数量"
              onChange={(value) => {
                if (value) {
                  setQuantity(value);
                }
              }}
              disabled={mode === 'view'}
              style={{ width: '100%' }}
              addonAfter={
                <Space>
                  <Text>件</Text>
                  {adjustedQuantity !== 0 && (
                    <Tag
                      color={stockImpact?.color}
                      style={{ marginLeft: 8 }}
                    >
                      {adjustedQuantity}件
                    </Tag>
                  )}
                </Space>
              }
            />
          </Form.Item>

          {/* 库存影响提示 */}
          {stockImpact && (
            <Alert
              message={stockImpact.message}
              type={stockImpact.color === 'success' ? 'success' : stockImpact.color === 'error' ? 'error' : 'default'}
              showIcon
              style={{ marginTop: 8 }}
            />
          )}
        </Card>
      )}

      {/* 调整原因 */}
      <Card size="small" title="调整原因">
        <Form.Item
          name="reason"
          rules={[
            { required: true, message: '请选择或输入调整原因' }
          ]}
        >
          {!useCustomReason && (
            <Select
              placeholder="请选择调整原因"
              style={{ width: '100%', marginBottom: 16 }}
              onChange={(value) => {
                if (value === '__custom__') {
                  handleUseCustomReasonChange(true);
                } else {
                  handleUseCustomReasonChange(false);
                }
              }}
              disabled={mode === 'view'}
              options={[
                {
                  label: '选择常用原因',
                  options: getReasonOptions(adjustmentType!).map(option => ({
                    label: option.label,
                    value: option.value,
                  })),
                },
                {
                  label: '自定义原因',
                  value: '__custom__',
                },
              ]}
            />
          )}

          {useCustomReason && (
            <Input
              placeholder="请输入自定义调整原因"
              value={customReason}
              onChange={handleCustomReasonChange}
              maxLength={200}
              showCount
              disabled={mode === 'view'}
            />
          )}
        </Form.Item>
      </Card>

      {/* 备注 */}
      <Card size="small" title="备注">
        <Form.Item name="remark">
          <TextArea
            placeholder="请输入备注信息（可选）"
            rows={3}
            maxLength={500}
            showCount
            disabled={mode === 'view'}
            onChange={(e) => setRemark(e.target.value)}
          />
        </Form.Item>
      </Card>

      {/* 调整说明 */}
      {mode === 'create' && (
        <Card size="small" title="调整说明">
          <Alert
            message={
              <Space direction="vertical" size="small">
                <Text strong>调整流程说明：</Text>
                <ol style={{ margin: 0, paddingLeft: 20 }}>
                  <li>填写调整信息并提交申请</li>
                  <li>等待管理员审批调整申请</li>
                  <li>审批通过后系统自动执行调整</li>
                  <li>调整完成后可在库存台账中查看最新库存</li>
                </ol>
                <Text type="warning">
                  注意：调整操作需要有相应权限，并经过审批流程才能生效。
                </Text>
              </Space>
            }
            type="info"
            showIcon
          />
        </Card>
      )}
    </Space>
  );
};

export default AdjustmentForm;