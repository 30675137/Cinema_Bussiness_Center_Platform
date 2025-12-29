/**
 * 换算规则统计卡片组件
 * P002-unit-conversion
 */

import React from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import {
  ExperimentOutlined,
  GoldOutlined,
  NumberOutlined,
  CalculatorOutlined
} from '@ant-design/icons';
import { useConversionStats } from '../hooks/useConversions';

const ConversionStats: React.FC = () => {
  const { data: stats, isLoading, error } = useConversionStats();

  if (isLoading) {
    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {[1, 2, 3, 4].map((i) => (
          <Col xs={24} sm={12} md={6} key={i}>
            <Card>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Spin />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  if (error || !stats) {
    return null;
  }

  const statItems = [
    {
      title: '体积换算',
      value: stats.volumeCount,
      icon: <ExperimentOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      color: '#e6f7ff',
    },
    {
      title: '重量换算',
      value: stats.weightCount,
      icon: <GoldOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
      color: '#f6ffed',
    },
    {
      title: '计数换算',
      value: stats.countCount,
      icon: <NumberOutlined style={{ fontSize: 24, color: '#faad14' }} />,
      color: '#fffbe6',
    },
    {
      title: '总规则数',
      value: stats.totalCount,
      icon: <CalculatorOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      color: '#f9f0ff',
    },
  ];

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      {statItems.map((item) => (
        <Col xs={24} sm={12} md={6} key={item.title}>
          <Card
            hoverable
            style={{ backgroundColor: item.color }}
            styles={{ body: { padding: '20px 24px' } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Statistic
                title={item.title}
                value={item.value}
                suffix="条"
              />
              {item.icon}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ConversionStats;
