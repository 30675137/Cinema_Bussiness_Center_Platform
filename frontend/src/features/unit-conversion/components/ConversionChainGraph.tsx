/**
 * 换算链可视化组件
 * P002-unit-conversion
 */

import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  Tag,
  Alert,
  Spin,
  Divider,
  Select,
  Tooltip,
} from 'antd';
import {
  ArrowRightOutlined,
  SearchOutlined,
  SwapOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useCalculatePath } from '../hooks/useConversionCalculation';
import { roundByCategory, DEFAULT_PRECISION } from '../utils/rounding';
import type { UnitCategory } from '../types';

const { Text, Title } = Typography;

const CATEGORY_OPTIONS = [
  { value: 'VOLUME', label: '体积 (1位小数)' },
  { value: 'WEIGHT', label: '重量 (整数)' },
  { value: 'COUNT', label: '计数 (整数)' },
];

interface ConversionChainGraphProps {
  title?: string;
}

const ConversionChainGraph: React.FC<ConversionChainGraphProps> = ({ title = '换算路径计算' }) => {
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [roundingCategory, setRoundingCategory] = useState<UnitCategory>('VOLUME');

  const { mutate, data: result, isPending, reset } = useCalculatePath();

  // 格式化换算率（根据选择的舍入类别）
  const formatRate = (rate: number): string => {
    const rounded = roundByCategory(rate, roundingCategory);
    const precision = DEFAULT_PRECISION[roundingCategory];
    return rounded.toFixed(precision);
  };

  const handleCalculate = () => {
    if (!fromUnit.trim() || !toUnit.trim()) {
      return;
    }
    mutate({ fromUnit: fromUnit.trim(), toUnit: toUnit.trim() });
  };

  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    reset();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  };

  return (
    <Card title={title} style={{ marginTop: 24 }}>
      {/* 输入区域 */}
      <Space wrap style={{ marginBottom: 16 }}>
        <Input
          placeholder="源单位"
          value={fromUnit}
          onChange={(e) => setFromUnit(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ width: 120 }}
        />
        <Button icon={<SwapOutlined />} onClick={handleSwap} title="交换单位" />
        <Input
          placeholder="目标单位"
          value={toUnit}
          onChange={(e) => setToUnit(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ width: 120 }}
        />
        <Button
          type="primary"
          icon={<SearchOutlined />}
          onClick={handleCalculate}
          loading={isPending}
          disabled={!fromUnit.trim() || !toUnit.trim()}
        >
          计算路径
        </Button>
      </Space>

      {/* 加载状态 */}
      {isPending && (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
        </div>
      )}

      {/* 结果显示 */}
      {result && !isPending && (
        <div>
          <Divider />

          {result.found ? (
            <>
              {/* 路径可视化 */}
              <div style={{ marginBottom: 16 }}>
                <Title level={5}>换算路径</Title>
                <Space size={4} wrap>
                  {result.path.map((unit, index) => (
                    <React.Fragment key={index}>
                      <Tag
                        color={
                          index === 0
                            ? 'green'
                            : index === result.path.length - 1
                              ? 'blue'
                              : 'default'
                        }
                        style={{ fontSize: 14, padding: '4px 8px' }}
                      >
                        {unit}
                      </Tag>
                      {index < result.path.length - 1 && (
                        <ArrowRightOutlined style={{ color: '#999' }} />
                      )}
                    </React.Fragment>
                  ))}
                </Space>
              </div>

              {/* 换算结果 */}
              <div style={{ marginBottom: 16 }}>
                <Title level={5}>换算率</Title>
                <Space direction="vertical" size={8}>
                  {/* 原始精度 */}
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    原始值: 1 {result.fromUnit} = {result.totalRate.toFixed(6)} {result.toUnit}
                  </Text>
                  {/* 舍入后显示 */}
                  <Space align="center">
                    <Text code style={{ fontSize: 16 }}>
                      1 {result.fromUnit} = {formatRate(result.totalRate)} {result.toUnit}
                    </Text>
                    <Tooltip title="选择单位类别以应用对应的舍入规则">
                      <Select
                        value={roundingCategory}
                        onChange={setRoundingCategory}
                        options={CATEGORY_OPTIONS}
                        style={{ width: 140 }}
                        size="small"
                      />
                    </Tooltip>
                    <Tooltip title="舍入规则说明：体积保留1位小数，重量和计数为整数">
                      <InfoCircleOutlined style={{ color: '#999' }} />
                    </Tooltip>
                  </Space>
                </Space>
              </div>

              {/* 统计信息 */}
              <Space>
                <Tag color="cyan">中间步骤: {result.steps}</Tag>
                <Tag color="purple">路径长度: {result.path.length}</Tag>
              </Space>
            </>
          ) : (
            <Alert
              type="warning"
              message="未找到换算路径"
              description={`无法从 "${result.fromUnit}" 换算到 "${result.toUnit}"。请检查是否已配置相关换算规则。`}
              showIcon
            />
          )}
        </div>
      )}
    </Card>
  );
};

export default ConversionChainGraph;
