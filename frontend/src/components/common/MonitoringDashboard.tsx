/**
 * 监控仪表板组件
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Button,
  Space,
  Tooltip,
  Alert,
  Tabs,
  List,
  Timeline,
  Switch,
  Select,
  DatePicker,
  Modal,
} from 'antd';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BugOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  MemoryStickOutlined,
  GlobalOutlined,
  UserOutlined,
  EyeOutlined,
  SettingOutlined,
  DownloadOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { monitoring, getMetrics } from '@/utils/monitoring';
import { logger, LogCategories } from '@/utils/logger';
import type { PerformanceMetrics, ErrorMetrics, UserBehaviorMetrics } from '@/utils/monitoring';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

interface MonitoringDashboardProps {
  visible: boolean;
  onClose: () => void;
}

const COLORS = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  purple: '#722ed1',
  cyan: '#13c2c2',
};

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({ visible, onClose }) => {
  const [metrics, setMetrics] = useState<{
    performance: PerformanceMetrics;
    errors: ErrorMetrics;
    behavior: UserBehaviorMetrics;
  } | null>(null);

  const [refreshInterval, setRefreshInterval] = useState<number>(5000);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<string>('1h');

  // 获取监控数据
  const fetchMetrics = () => {
    try {
      const currentMetrics = getMetrics();
      setMetrics(currentMetrics);
    } catch (error) {
      console.error('Failed to fetch monitoring metrics:', error);
    }
  };

  // 自动刷新
  useEffect(() => {
    if (!visible) return;

    fetchMetrics();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchMetrics, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible, autoRefresh, refreshInterval]);

  // 性能图表数据
  const getPerformanceChartData = () => {
    if (!metrics) return [];

    return [
      {
        name: 'DOM加载',
        value: Math.round(metrics.performance.pageLoad.domContentLoaded),
        unit: 'ms',
      },
      {
        name: '页面完全加载',
        value: Math.round(metrics.performance.pageLoad.loadComplete),
        unit: 'ms',
      },
      {
        name: '首次内容绘制',
        value: Math.round(metrics.performance.pageLoad.firstContentfulPaint),
        unit: 'ms',
      },
      {
        name: '首次输入延迟',
        value: Math.round(metrics.performance.pageLoad.firstInputDelay),
        unit: 'ms',
      },
    ];
  };

  // 错误分布数据
  const getErrorDistributionData = () => {
    if (!metrics) return [];

    return Object.entries(metrics.errors.errorsByType).map(([type, count]) => ({
      name: type,
      value: count,
    }));
  };

  // 内存使用数据
  const getMemoryData = () => {
    if (!metrics) return [];

    const { memory } = metrics.performance;
    return [
      {
        name: '已使用',
        value: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
        color: COLORS.error,
      },
      {
        name: '未使用',
        value: Math.round((memory.totalJSHeapSize - memory.usedJSHeapSize) / 1024 / 1024), // MB
        color: COLORS.success,
      },
    ];
  };

  // 获取内存使用百分比
  const getMemoryUsagePercentage = () => {
    if (!metrics) return 0;

    const { memory } = metrics.performance;
    return Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100);
  };

  // 获取网络请求成功率
  const getNetworkSuccessRate = () => {
    if (!metrics) return 0;

    const { network } = metrics.performance;
    if (network.totalRequests === 0) return 100;

    return Math.round(
      ((network.totalRequests - network.failedRequests) / network.totalRequests) * 100
    );
  };

  // 导出日志
  const exportLogs = () => {
    try {
      const logs = logger.exportLogs();
      const blob = new Blob([logs], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export logs:', error);
    }
  };

  // 清空日志
  const clearLogs = () => {
    Modal.confirm({
      title: '确认清空',
      content: '确定要清空所有日志吗？此操作不可恢复。',
      onOk: () => {
        logger.clear();
      },
    });
  };

  if (!visible || !metrics) return null;

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined />
          监控仪表板
          <Switch
            checked={autoRefresh}
            onChange={setAutoRefresh}
            checkedChildren="自动刷新"
            unCheckedChildren="手动刷新"
            size="small"
          />
        </Space>
      }
      visible={visible}
      onCancel={onClose}
      width="90%"
      style={{ top: 20 }}
      footer={[
        <Button key="refresh" icon={<ReloadOutlined />} onClick={fetchMetrics}>
          刷新数据
        </Button>,
        <Button key="export" icon={<DownloadOutlined />} onClick={exportLogs}>
          导出日志
        </Button>,
        <Button key="clear" icon={<DeleteOutlined />} onClick={clearLogs} danger>
          清空日志
        </Button>,
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
      ]}
    >
      <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Tabs defaultActiveKey="overview" size="small">
          {/* 概览标签页 */}
          <TabPane tab="概览" key="overview">
            <Row gutter={[16, 16]}>
              {/* 性能指标 */}
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="页面加载时间"
                    value={metrics.performance.pageLoad.loadComplete}
                    suffix="ms"
                    prefix={<ThunderboltOutlined />}
                    valueStyle={{
                      color:
                        metrics.performance.pageLoad.loadComplete > 3000
                          ? COLORS.error
                          : COLORS.success,
                    }}
                  />
                </Card>
              </Col>

              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="错误数量"
                    value={metrics.errors.totalErrors}
                    prefix={<BugOutlined />}
                    valueStyle={{
                      color: metrics.errors.totalErrors > 0 ? COLORS.error : COLORS.success,
                    }}
                  />
                </Card>
              </Col>

              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="页面访问量"
                    value={metrics.behavior.pageViews}
                    prefix={<EyeOutlined />}
                    suffix="次"
                  />
                </Card>
              </Col>

              <Col span={6}>
                <Card size="small">
                  <div>
                    <div style={{ marginBottom: 8 }}>内存使用率</div>
                    <Progress
                      percent={getMemoryUsagePercentage()}
                      size="small"
                      status={getMemoryUsagePercentage() > 80 ? 'exception' : 'normal'}
                    />
                  </div>
                </Card>
              </Col>
            </Row>

            {/* 性能图表 */}
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card title="页面性能指标" size="small">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={getPerformanceChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip
                        formatter={(value: number, name: string, props: any) => [
                          `${value} ${props.payload.unit}`,
                          name,
                        ]}
                      />
                      <Bar dataKey="value" fill={COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="内存使用情况" size="small">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={getMemoryData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {getMemoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: number) => [`${value} MB`, '内存']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* 性能标签页 */}
          <TabPane tab="性能" key="performance">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card title="性能指标详情" size="small">
                  <List
                    size="small"
                    dataSource={[
                      {
                        label: 'DOM 内容加载',
                        value: `${Math.round(metrics.performance.pageLoad.domContentLoaded)}ms`,
                      },
                      {
                        label: '页面完全加载',
                        value: `${Math.round(metrics.performance.pageLoad.loadComplete)}ms`,
                      },
                      {
                        label: '首次内容绘制',
                        value: `${Math.round(metrics.performance.pageLoad.firstContentfulPaint)}ms`,
                      },
                      {
                        label: '最大内容绘制',
                        value: `${Math.round(metrics.performance.pageLoad.largestContentfulPaint)}ms`,
                      },
                      {
                        label: '首次输入延迟',
                        value: `${Math.round(metrics.performance.pageLoad.firstInputDelay)}ms`,
                      },
                      {
                        label: '累积布局偏移',
                        value: metrics.performance.pageLoad.cumulativeLayoutShift.toFixed(3),
                      },
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta title={item.label} description={item.value} />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>

              <Col span={12}>
                <Card title="网络性能" size="small">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="总请求数"
                        value={metrics.performance.network.totalRequests}
                        prefix={<GlobalOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="成功率"
                        value={getNetworkSuccessRate()}
                        suffix="%"
                        valueStyle={{
                          color: getNetworkSuccessRate() > 95 ? COLORS.success : COLORS.error,
                        }}
                      />
                    </Col>
                  </Row>
                  <div style={{ marginTop: 16 }}>
                    <Statistic
                      title="平均响应时间"
                      value={Math.round(metrics.performance.network.averageResponseTime)}
                      suffix="ms"
                    />
                  </div>
                  {metrics.performance.network.slowEndpoints.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <h4>慢请求列表：</h4>
                      <List
                        size="small"
                        dataSource={metrics.performance.network.slowEndpoints.slice(0, 5)}
                        renderItem={(item) => (
                          <List.Item>
                            <List.Item.Meta
                              title={`${item.method} ${item.url}`}
                              description={`${item.duration}ms - ${item.status}`}
                            />
                          </List.Item>
                        )}
                      />
                    </div>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* 错误标签页 */}
          <TabPane tab="错误" key="errors">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card title="错误分布" size="small">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={getErrorDistributionData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                      >
                        {getErrorDistributionData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={Object.values(COLORS)[index % Object.values(COLORS).length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col span={16}>
                <Card title="最近错误" size="small">
                  <Timeline
                    mode="left"
                    items={metrics.errors.recentErrors.slice(0, 10).map((error, index) => ({
                      key: index,
                      color:
                        error.type === 'fatal' ? 'red' : error.type === 'error' ? 'orange' : 'blue',
                      children: (
                        <div>
                          <div>
                            <strong>{error.type}</strong>
                          </div>
                          <div>{error.message}</div>
                          <div style={{ fontSize: 12, color: '#666' }}>
                            {new Date(error.timestamp).toLocaleString()} - {error.url}
                          </div>
                        </div>
                      ),
                    }))}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* 用户行为标签页 */}
          <TabPane tab="用户行为" key="behavior">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Card title="会话统计" size="small">
                  <Statistic
                    title="会话时长"
                    value={Math.round(metrics.behavior.sessionDuration / 1000 / 60)}
                    suffix="分钟"
                    prefix={<ClockCircleOutlined />}
                  />
                  <div style={{ marginTop: 16 }}>
                    <Statistic
                      title="唯一页面数"
                      value={metrics.behavior.uniquePageViews}
                      prefix={<EyeOutlined />}
                    />
                  </div>
                </Card>
              </Col>

              <Col span={16}>
                <Card title="热门页面" size="small">
                  <Table
                    size="small"
                    dataSource={metrics.behavior.topPages.slice(0, 10)}
                    pagination={false}
                    columns={[
                      {
                        title: '页面',
                        dataIndex: 'url',
                        key: 'url',
                        ellipsis: true,
                        render: (url: string) => (
                          <Tooltip title={url}>
                            <span>{url.split('/').pop() || '/'}</span>
                          </Tooltip>
                        ),
                      },
                      {
                        title: '访问次数',
                        dataIndex: 'views',
                        key: 'views',
                        render: (views: number) => <Tag color="blue">{views}</Tag>,
                      },
                      {
                        title: '平均停留时间',
                        dataIndex: 'avgDuration',
                        key: 'avgDuration',
                        render: (duration: number) => `${Math.round(duration / 1000)}s`,
                      },
                    ]}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </div>
    </Modal>
  );
};

export default MonitoringDashboard;
