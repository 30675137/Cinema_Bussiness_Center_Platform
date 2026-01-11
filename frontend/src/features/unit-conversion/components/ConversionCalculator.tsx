/**
 * 单位换算计算器组件
 * M001-material-unit-system / P002-unit-conversion
 *
 * 功能：输入数量、选择单位，计算换算结果
 */

import React, { useState } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Button,
  Space,
  Alert,
  Typography,
  Divider,
  Spin,
} from 'antd';
import { SwapOutlined, CalculatorOutlined } from '@ant-design/icons';
import { UnitSelector } from '@/components/common/UnitSelector';
import { MaterialSelector } from '@/components/common/MaterialSelector';
import { useUnitConversion } from '@/hooks/useUnitConversion';

const { Text, Title } = Typography;

interface ConversionCalculatorProps {
  title?: string;
}

const ConversionCalculator: React.FC<ConversionCalculatorProps> = ({
  title = '单位换算计算器',
}) => {
  const [form] = Form.useForm();
  const { convert, loading, result } = useUnitConversion();
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    try {
      // 清除之前的结果和错误
      setShowResult(false);
      setError(null);
      
      const values = await form.validateFields();
      const response = await convert({
        fromUnitCode: values.fromUnitCode,
        toUnitCode: values.toUnitCode,
        quantity: values.quantity,
        materialId: values.materialId || undefined,
      });

      if (response) {
        setShowResult(true);
      }
    } catch (err: unknown) {
      // 显示错误信息
      const errorMessage = err instanceof Error ? err.message : '换算失败';
      setError(errorMessage);
      setShowResult(false);
    }
  };

  const handleSwap = () => {
    const fromUnit = form.getFieldValue('fromUnitCode');
    const toUnit = form.getFieldValue('toUnitCode');
    form.setFieldsValue({
      fromUnitCode: toUnit,
      toUnitCode: fromUnit,
    });
    setShowResult(false);
  };

  const handleReset = () => {
    form.resetFields();
    setShowResult(false);
    setError(null);
  };

  return (
    <Card title={title} style={{ marginTop: 24 }}>
      <Form form={form} layout="vertical">
        {/* 数量输入 */}
        <Form.Item
          name="quantity"
          label="数量"
          rules={[{ required: true, message: '请输入数量' }]}
          initialValue={1}
        >
          <InputNumber
            min={0.000001}
            precision={6}
            style={{ width: '100%' }}
            placeholder="输入要换算的数量"
          />
        </Form.Item>

        {/* 单位选择区域 */}
        <Space align="start" style={{ width: '100%' }} size={16}>
          <Form.Item
            name="fromUnitCode"
            label="源单位"
            rules={[{ required: true, message: '请选择源单位' }]}
            style={{ flex: 1, minWidth: 150 }}
          >
            <UnitSelector placeholder="选择源单位" valueType="code" />
          </Form.Item>

          <div style={{ paddingTop: 30 }}>
            <Button
              icon={<SwapOutlined />}
              onClick={handleSwap}
              title="交换单位"
            />
          </div>

          <Form.Item
            name="toUnitCode"
            label="目标单位"
            rules={[{ required: true, message: '请选择目标单位' }]}
            style={{ flex: 1, minWidth: 150 }}
          >
            <UnitSelector placeholder="选择目标单位" valueType="code" />
          </Form.Item>
        </Space>

        {/* 物料选择（可选，用于物料级换算） */}
        <Form.Item
          name="materialId"
          label="物料（可选）"
          extra="留空则使用全局换算规则，选择物料则优先使用物料级换算率"
        >
          <MaterialSelector placeholder="选择物料（可选）" allowClear />
        </Form.Item>

        {/* 操作按钮 */}
        <Form.Item>
          <Space>
            <Button
              type="primary"
              icon={<CalculatorOutlined />}
              onClick={handleConvert}
              loading={loading}
            >
              换算
            </Button>
            <Button onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      {/* 加载状态 */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
        </div>
      )}

      {/* 错误提示 */}
      {error && !loading && (
        <>
          <Divider />
          <Alert
            message="换算失败"
            description={error}
            type="error"
            showIcon
          />
        </>
      )}

      {/* 换算结果 */}
      {showResult && result && !loading && (
        <>
          <Divider />
          <Alert
            message={
              <Title level={5} style={{ margin: 0 }}>
                换算结果
              </Title>
            }
            description={
              <div style={{ marginTop: 12 }}>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    marginBottom: 16,
                    padding: '16px',
                    backgroundColor: '#f6ffed',
                    borderRadius: 8,
                    textAlign: 'center',
                  }}
                >
                  <Text style={{ fontSize: 24 }}>
                    {result.originalQuantity}{' '}
                    <Text type="secondary">{result.fromUnitCode}</Text>
                  </Text>
                  <Text style={{ margin: '0 16px', color: '#52c41a' }}>=</Text>
                  <Text strong style={{ fontSize: 28, color: '#52c41a' }}>
                    {result.convertedQuantity}
                  </Text>{' '}
                  <Text type="secondary">{result.toUnitCode}</Text>
                </div>

                {result.conversionPath && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      换算路径: {result.conversionPath}
                    </Text>
                  </div>
                )}

                {result.source && (
                  <div style={{ marginTop: 4 }}>
                    <Text
                      type={result.source === 'MATERIAL' ? 'success' : 'secondary'}
                      style={{ fontSize: 12 }}
                    >
                      换算来源: {result.source === 'MATERIAL' ? '物料级换算' : '全局换算'}
                    </Text>
                  </div>
                )}
              </div>
            }
            type="success"
            showIcon
          />
        </>
      )}
    </Card>
  );
};

export default ConversionCalculator;
