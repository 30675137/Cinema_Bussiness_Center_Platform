/**
 * 规则配置组件
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */
import React from 'react';
import { Form, InputNumber, Card, Typography, Row, Col, Divider } from 'antd';
import { ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import type { PackageRule } from '../../types';

const { Text } = Typography;

export interface RuleConfiguratorProps {
  value?: Partial<PackageRule>;
  onChange?: (value: Partial<PackageRule>) => void;
  disabled?: boolean;
}

/**
 * 规则配置器
 *
 * 用于配置场景包的使用规则：
 * - 包场时长（小时）
 * - 人数范围（最小-最大）
 */
export const RuleConfigurator: React.FC<RuleConfiguratorProps> = ({
  value = {},
  onChange,
  disabled = false,
}) => {
  const handleChange = (field: keyof PackageRule, fieldValue: number | null) => {
    onChange?.({
      ...value,
      [field]: fieldValue ?? undefined,
    });
  };

  return (
    <Card
      size="small"
      title={
        <span>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          使用规则
        </span>
      }
      className="rule-configurator"
    >
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item label="包场时长" style={{ marginBottom: 0 }}>
            <InputNumber
              value={value.durationHours}
              onChange={(v) => handleChange('durationHours', v)}
              min={0.5}
              max={24}
              step={0.5}
              precision={1}
              addonAfter="小时"
              disabled={disabled}
              style={{ width: '100%' }}
              placeholder="如 3"
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="最少人数" style={{ marginBottom: 0 }}>
            <InputNumber
              value={value.minPeople}
              onChange={(v) => handleChange('minPeople', v)}
              min={1}
              max={value.maxPeople || 999}
              precision={0}
              addonAfter="人"
              disabled={disabled}
              style={{ width: '100%' }}
              placeholder="如 2"
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="最多人数" style={{ marginBottom: 0 }}>
            <InputNumber
              value={value.maxPeople}
              onChange={(v) => handleChange('maxPeople', v)}
              min={value.minPeople || 1}
              max={999}
              precision={0}
              addonAfter="人"
              disabled={disabled}
              style={{ width: '100%' }}
              placeholder="如 10"
            />
          </Form.Item>
        </Col>
      </Row>

      {value.durationHours && value.minPeople && value.maxPeople && (
        <>
          <Divider style={{ margin: '12px 0' }} />
          <Text type="secondary">
            <TeamOutlined style={{ marginRight: 4 }} />
            规则摘要：包场 {value.durationHours} 小时，{value.minPeople}-{value.maxPeople} 人
          </Text>
        </>
      )}
    </Card>
  );
};

export default RuleConfigurator;
