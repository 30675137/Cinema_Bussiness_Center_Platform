import React from 'react';
import { Card, Button, Space, Typography, Row, Col, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  MonitorOutlined,
  RocketOutlined,
  SettingOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import LazyImage from '../optimization/LazyImage';
import VirtualScroll from '../optimization/VirtualScroll';
import { usePerformanceTracking } from '../hooks/usePerformanceTracking';
import { apiCache } from '../optimization/CacheManager';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { onRender } = usePerformanceTracking('HomePage');

  // 生成示例数据
  const generateTestData = () => {
    return Array.from({ length: 1000 }, (_, index) => ({
      id: index,
      name: `测试项目 ${index + 1}`,
      description: `这是第 ${index + 1} 个测试项目的描述信息`,
      value: Math.floor(Math.random() * 100),
    }));
  };

  const testAPICall = async () => {
    try {
      const response = await apiCache.request(
        'test-api',
        async () => {
          // 模拟API调用
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
          return { data: 'API调用成功', timestamp: Date.now() };
        },
        5000 // 5秒缓存
      );
      console.log('API响应:', response);
    } catch (error) {
      console.error('API调用失败:', error);
    }
  };

  const performanceFeatures = [
    {
      icon: <MonitorOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
      title: '实时性能监控',
      description: '监控页面加载、API响应、组件渲染等关键性能指标',
    },
    {
      icon: <LineChartOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      title: 'Web Vitals集成',
      description: '集成Google Web Vitals，监控FCP、LCP、FID、CLS等核心指标',
    },
    {
      icon: <DatabaseOutlined style={{ fontSize: 32, color: '#faad14' }} />,
      title: '内存使用监控',
      description: '实时监控JavaScript堆内存使用情况，防止内存泄漏',
    },
    {
      icon: <RocketOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      title: '代码分割优化',
      description: '智能懒加载和预加载策略，减少初始包大小',
    },
    {
      icon: <SettingOutlined style={{ fontSize: 32, color: '#eb2f96' }} />,
      title: '缓存策略',
      description: '多级缓存支持，LRU/LFU/FIFO淘汰策略，提升响应速度',
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: 32, color: '#ff7a45' }} />,
      title: '虚拟滚动',
      description: '高性能长列表渲染，支持动态高度，优化大数据量展示',
    },
  ];

  return (
    <React.Profiler id="HomePage" onRender={onRender}>
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* 页面标题 */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Title level={1}>
            <ThunderboltOutlined /> 性能监控系统
          </Title>
          <Paragraph style={{ fontSize: '18px', color: '#666' }}>
            基于React + TypeScript的全面性能监控和优化解决方案
          </Paragraph>
        </div>

        {/* 功能展示卡片 */}
        <Row gutter={[24, 24]} style={{ marginBottom: '48px' }}>
          {performanceFeatures.map((feature, index) => (
            <Col xs={24} sm={12} md={8} key={index}>
              <Card
                hoverable
                style={{ height: '200px' }}
                bodyStyle={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                <div style={{ marginBottom: '16px' }}>{feature.icon}</div>
                <Title level={4}>{feature.title}</Title>
                <Paragraph type="secondary" style={{ margin: 0 }}>
                  {feature.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>

        <Divider />

        {/* 功能演示区域 */}
        <Row gutter={[24, 24]}>
          {/* 图片懒加载演示 */}
          <Col xs={24} md={12}>
            <Card title="图片懒加载演示" style={{ height: '400px' }}>
              <LazyImage
                src="https://picsum.photos/400/300"
                alt="演示图片"
                placeholder="https://picsum.photos/10/10"
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
              <Paragraph>
                上方图片使用了懒加载技术，只有当图片进入视口时才会加载。
                这可以显著减少初始页面加载时间。
              </Paragraph>
            </Card>
          </Col>

          {/* API性能测试 */}
          <Col xs={24} md={12}>
            <Card title="API性能测试" style={{ height: '400px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button type="primary" block onClick={testAPICall} icon={<ThunderboltOutlined />}>
                  测试API调用（带缓存）
                </Button>
                <Paragraph>
                  点击按钮测试API性能监控，系统会自动记录：
                  <ul>
                    <li>请求响应时间</li>
                    <li>缓存命中率</li>
                    <li>重试机制</li>
                    <li>错误率统计</li>
                  </ul>
                </Paragraph>
              </Space>
            </Card>
          </Col>

          {/* 虚拟滚动演示 */}
          <Col xs={24}>
            <Card title="虚拟滚动演示（1000条数据）" style={{ height: '400px' }}>
              <VirtualScroll
                data={generateTestData()}
                itemHeight={60}
                containerHeight={300}
                renderItem={(item, index) => (
                  <div
                    style={{
                      height: '60px',
                      padding: '12px',
                      borderBottom: '1px solid #f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                      <div style={{ color: '#666', fontSize: '12px' }}>{item.description}</div>
                    </div>
                    <div
                      style={{
                        padding: '4px 8px',
                        background: '#1890ff',
                        color: 'white',
                        borderRadius: '4px',
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                )}
              />
              <Paragraph>
                上方列表包含1000条数据，但使用虚拟滚动技术只渲染可见区域的项目。
                这确保了即使数据量很大，页面依然保持流畅。
              </Paragraph>
            </Card>
          </Col>
        </Row>

        {/* 操作按钮 */}
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Space size="large">
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/performance')}
              icon={<MonitorOutlined />}
            >
              查看性能面板
            </Button>
            <Button
              size="large"
              onClick={() => window.open('/performance', '_blank')}
              icon={<LineChartOutlined />}
            >
              新窗口打开性能面板
            </Button>
          </Space>
        </div>

        {/* 页脚信息 */}
        <div style={{ textAlign: 'center', marginTop: '48px', color: '#999' }}>
          <Paragraph>
            性能监控系统 v1.0.0 | 支持React 18+ | TypeScript 5.0+ | Ant Design 5.x
          </Paragraph>
        </div>
      </div>
    </React.Profiler>
  );
};

export default HomePage;
