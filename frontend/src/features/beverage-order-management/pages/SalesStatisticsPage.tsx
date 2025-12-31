/**
 * @spec O003-beverage-order
 * 销售统计页面 (B端)
 *
 * US3: FR-022 - B端管理员查看营业统计
 * US3: FR-023 - B端管理员导出报表
 */
import React, { useState } from 'react';
import {
  Layout,
  Card,
  Typography,
  Select,
  DatePicker,
  Button,
  Space,
  message,
  Row,
  Col,
} from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { useOrderStatistics, useExportReport } from '../hooks';
import { SalesChart, BestSellingList } from '../components';

const { Title } = Typography;
const { RangePicker } = DatePicker;

type RangeType = 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM';

/**
 * 销售统计页面
 *
 * 功能：
 * - T134: 显示今日/本周/本月营业统计
 * - T135: 时间范围选择和门店筛选
 * - T136: 导出Excel报表
 *
 * @returns 销售统计页面组件
 */
export const SalesStatisticsPage: React.FC = () => {
  // 状态管理
  const [rangeType, setRangeType] = useState<RangeType>('TODAY');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [storeId, setStoreId] = useState<string | undefined>(undefined);

  // 计算自定义时间范围的日期字符串
  const startDate = dateRange ? dateRange[0].format('YYYY-MM-DD') : undefined;
  const endDate = dateRange ? dateRange[1].format('YYYY-MM-DD') : undefined;

  // 获取统计数据
  const {
    data: statistics,
    isLoading,
    refetch,
  } = useOrderStatistics({
    storeId,
    rangeType,
    startDate,
    endDate,
  });

  // 导出报表
  const { exportReport } = useExportReport();
  const [isExporting, setIsExporting] = useState(false);

  // 时间范围选项
  const rangeOptions = [
    { label: '今日', value: 'TODAY' },
    { label: '本周', value: 'WEEK' },
    { label: '本月', value: 'MONTH' },
    { label: '自定义', value: 'CUSTOM' },
  ];

  // 处理时间范围类型变更
  const handleRangeTypeChange = (value: RangeType) => {
    setRangeType(value);
    if (value !== 'CUSTOM') {
      setDateRange(null);
    }
  };

  // 处理自定义日期范围变更
  const handleDateRangeChange = (dates: [Dayjs, Dayjs] | null) => {
    setDateRange(dates);
  };

  // 处理导出报表
  const handleExport = async () => {
    try {
      setIsExporting(true);

      // 确定导出的日期范围
      let exportStartDate: string;
      let exportEndDate: string;

      if (rangeType === 'CUSTOM' && dateRange) {
        exportStartDate = dateRange[0].format('YYYY-MM-DD');
        exportEndDate = dateRange[1].format('YYYY-MM-DD');
      } else if (statistics?.dateRange) {
        exportStartDate = statistics.dateRange.startDate;
        exportEndDate = statistics.dateRange.endDate;
      } else {
        message.error('无法确定导出日期范围');
        return;
      }

      await exportReport({
        storeId,
        startDate: exportStartDate,
        endDate: exportEndDate,
      });

      message.success('报表导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  // 处理刷新
  const handleRefresh = () => {
    refetch();
    message.success('数据已刷新');
  };

  return (
    <Layout style={{ padding: '24px' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>销售统计</Title>
      </div>

      {/* 筛选和操作栏 */}
      <Card style={{ marginBottom: '24px' }}>
        <Space size="large" wrap>
          {/* 时间范围选择 */}
          <Space direction="vertical" size="small">
            <span style={{ color: '#8c8c8c', fontSize: '14px' }}>时间范围</span>
            <Select
              value={rangeType}
              onChange={handleRangeTypeChange}
              options={rangeOptions}
              style={{ width: 150 }}
            />
          </Space>

          {/* 自定义日期范围 */}
          {rangeType === 'CUSTOM' && (
            <Space direction="vertical" size="small">
              <span style={{ color: '#8c8c8c', fontSize: '14px' }}>选择日期</span>
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                format="YYYY-MM-DD"
                style={{ width: 260 }}
              />
            </Space>
          )}

          {/* 门店筛选（暂时隐藏，后续可扩展） */}
          {/* <Space direction="vertical" size="small">
            <span style={{ color: '#8c8c8c', fontSize: '14px' }}>门店</span>
            <Select
              value={storeId}
              onChange={setStoreId}
              placeholder="全部门店"
              allowClear
              style={{ width: 200 }}
              options={[]}
            />
          </Space> */}

          {/* 操作按钮 */}
          <Space direction="vertical" size="small">
            <span style={{ color: '#8c8c8c', fontSize: '14px' }}>&nbsp;</span>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh} disabled={isLoading}>
                刷新
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExport}
                loading={isExporting}
                disabled={isLoading || !statistics}
              >
                导出报表
              </Button>
            </Space>
          </Space>
        </Space>
      </Card>

      {/* 统计图表和数据 */}
      {statistics && (
        <Row gutter={[24, 24]}>
          {/* 销售图表 */}
          <Col xs={24} xl={14}>
            <SalesChart
              dateRange={statistics.dateRange}
              orderMetrics={statistics.orderMetrics}
              salesMetrics={statistics.salesMetrics}
              loading={isLoading}
            />
          </Col>

          {/* 热销排行榜 */}
          <Col xs={24} xl={10}>
            <BestSellingList
              items={statistics.bestSellingBeverages}
              loading={isLoading}
              limit={10}
            />
          </Col>
        </Row>
      )}

      {/* 加载状态 */}
      {!statistics && isLoading && (
        <Card>
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Title level={4} type="secondary">
              加载中...
            </Title>
          </div>
        </Card>
      )}
    </Layout>
  );
};

export default SalesStatisticsPage;
