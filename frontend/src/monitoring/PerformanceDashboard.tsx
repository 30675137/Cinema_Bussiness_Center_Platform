import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Alert, List, Progress, Tabs, Timeline, Badge } from 'antd';
import {
  ClockCircleOutlined,
  WarningOutlined,
  ThunderboltOutlined,
  MonitorOutlined,
  ApiOutlined,
  DatabaseOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { usePerformance } from './PerformanceProvider';
import type { PerformanceMetrics, PerformanceAlert } from './types';

const { TabPane } = Tabs;

export const PerformanceDashboard: React.FC = () => {
  const { getMetrics, getAlerts, getWebVitals } = usePerformance();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [webVitals, setWebVitals] = useState<any>(null);

  useEffect(() => {
    const updateData = () => {
      setMetrics(getMetrics());
      setAlerts(getAlerts());
      setWebVitals(getWebVitals());
    };

    updateData();
    const interval = setInterval(updateData, 2000); // 每2秒更新一次

    return () => clearInterval(interval);
  }, [getMetrics, getAlerts, getWebVitals]);

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatMemory = (bytes: number): string => {
    return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return '#ff4d4f';
      case 'high':
        return '#ff7a45';
      case 'medium':
        return '#ffa940';
      case 'low':
        return '#52c41a';
      default:
        return '#d9d9d9';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'page_load':
        return <ClockCircleOutlined />;
      case 'api':
        return <ApiOutlined />;
      case 'component':
        return <MonitorOutlined />;
      case 'memory':
        return <DatabaseOutlined />;
      default:
        return <WarningOutlined />;
    }
  };

  const calculateMemoryUsagePercent = (): number => {
    if (!metrics || metrics.memory.length === 0) return 0;
    const latestMemory = metrics.memory[metrics.memory.length - 1];
    return (latestMemory.usedJSHeapSize / latestMemory.jsHeapSizeLimit) * 100;
  };

  const getAverageAPITime = (): number => {
    if (!metrics || metrics.api.length === 0) return 0;
    const totalTime = metrics.api.reduce((sum, api) => sum + api.duration, 0);
    return totalTime / metrics.api.length;
  };

  const getAverageComponentRenderTime = (): number => {
    if (!metrics || metrics.components.length === 0) return 0;
    const totalTime = metrics.components.reduce((sum, comp) => sum + comp.renderTime, 0);
    return totalTime / metrics.components.length;
  };

  if (!metrics) {
    return <div>加载中...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1>性能监控面板</h1>

      {/* 关键指标概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="页面加载时间"
              value={metrics.pageLoad.loadComplete}
              suffix="ms"
              prefix={<ThunderboltOutlined />}
              valueStyle={{
                color: metrics.pageLoad.loadComplete > 3000 ? '#ff4d4f' : '#3f8600',
              }}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="平均API响应时间"
              value={getAverageAPITime()}
              suffix="ms"
              prefix={<ApiOutlined />}
              valueStyle={{
                color: getAverageAPITime() > 500 ? '#ff7a45' : '#3f8600',
              }}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="平均组件渲染时间"
              value={getAverageComponentRenderTime()}
              suffix="ms"
              prefix={<MonitorOutlined />}
              valueStyle={{
                color: getAverageComponentRenderTime() > 100 ? '#ffa940' : '#3f8600',
              }}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Statistic
              title="内存使用率"
              value={calculateMemoryUsagePercent()}
              suffix="%"
              prefix={<DatabaseOutlined />}
              valueStyle={{
                color: calculateMemoryUsagePercent() > 80 ? '#ff4d4f' : '#3f8600',
              }}
            />
            <Progress
              percent={calculateMemoryUsagePercent()}
              strokeColor={calculateMemoryUsagePercent() > 80 ? '#ff4d4f' : '#3f8600'}
              showInfo={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* 详细信息标签页 */}
      <Tabs defaultActiveKey="webvitals">
        <TabPane tab="Web Vitals" key="webvitals">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="核心网页指标" extra={<LineChartOutlined />}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic title="FCP (首次内容绘制)" value={webVitals?.fcp || 0} suffix="ms" />
                  </Col>
                  <Col span={12}>
                    <Statistic title="LCP (最大内容绘制)" value={webVitals?.lcp || 0} suffix="ms" />
                  </Col>
                  <Col span={12}>
                    <Statistic title="FID (首次输入延迟)" value={webVitals?.fid || 0} suffix="ms" />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="CLS (累积布局偏移)"
                      value={webVitals?.cls || 0}
                      precision={3}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="网络信息">
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic title="下行速度" value={metrics.network.downlink} suffix="Mbps" />
                  </Col>
                  <Col span={12}>
                    <Statistic title="延迟" value={metrics.network.rtt} suffix="ms" />
                  </Col>
                  <Col span={24}>
                    <Statistic title="网络类型" value={metrics.network.effectiveType} />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="API性能" key="api">
          <Card title="API调用记录">
            <List
              dataSource={metrics.api.slice(-10).reverse()}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<ApiOutlined />}
                    title={item.endpoint}
                    description={`${item.duration}ms - ${item.success ? '成功' : '失败'}`}
                  />
                  <Badge status={item.success ? 'success' : 'error'} text={item.status} />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        <TabPane tab="组件性能" key="components">
          <Card title="组件渲染记录">
            <List
              dataSource={metrics.components.slice(-10).reverse()}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<MonitorOutlined />}
                    title={item.name}
                    description={`渲染: ${item.renderTime}ms | 挂载: ${item.mountTime}ms`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </TabPane>

        <TabPane tab="性能警告" key="alerts">
          <Card title={`性能警告 (${alerts.length})`}>
            {alerts.length === 0 ? (
              <Alert message="没有性能警告" type="success" showIcon />
            ) : (
              <Timeline>
                {alerts
                  .slice(-10)
                  .reverse()
                  .map((alert) => (
                    <Timeline.Item
                      key={alert.id}
                      dot={getAlertIcon(alert.type)}
                      color={getSeverityColor(alert.severity)}
                    >
                      <div>
                        <strong>{alert.message}</strong>
                        <br />
                        <small>
                          当前值: {alert.value.toFixed(2)} | 阈值: {alert.threshold}
                        </small>
                        <br />
                        <Badge color={getSeverityColor(alert.severity)} text={alert.severity} />
                        <span style={{ marginLeft: '8px', color: '#999' }}>
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </Timeline.Item>
                  ))}
              </Timeline>
            )}
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;
