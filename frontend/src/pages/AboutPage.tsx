import React from 'react';
import { Card, Typography, Tag } from 'antd';

const { Title, Paragraph } = Typography;

const AboutPage: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={1}>关于性能监控系统</Title>

      <Card>
        <Title level={3}>系统特性</Title>
        <div style={{ marginBottom: '16px' }}>
          <Tag color="blue">React 18</Tag>
          <Tag color="green">TypeScript 5.0</Tag>
          <Tag color="orange">Ant Design 5.x</Tag>
          <Tag color="purple">Web Vitals</Tag>
        </div>

        <Paragraph>
          这是一个全面的性能监控和优化系统，提供实时性能数据监控、
          智能优化建议和详细的性能分析报告。
        </Paragraph>

        <Title level={4}>主要功能</Title>
        <ul>
          <li>页面加载性能监控</li>
          <li>API响应时间跟踪</li>
          <li>组件渲染性能分析</li>
          <li>内存使用情况监控</li>
          <li>Web Vitals核心指标</li>
          <li>Bundle分析和优化</li>
        </ul>
      </Card>
    </div>
  );
};

export default AboutPage;
