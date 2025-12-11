/**
 * 库存台账筛选器组件
 * 提供库存数据的筛选、搜索和排序功能
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Space,
  Row,
  Col,
  DatePicker,
  Badge,
  Tooltip,
  Divider,
  Typography,
} from 'antd';
import {
  SearchOutlined,
  ClearOutlined,
  FilterOutlined,
  DownOutlined,
  UpOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { InventoryLedgerFilters } from '@types/inventory';
import { useResponsive } from '@/hooks/useResponsive';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface InventoryFiltersProps {
  filters: InventoryLedgerFilters;
  onFiltersChange: (filters: Partial<InventoryLedgerFilters>) => void;
  onClear: () => void;
  onReset: () => void;
  loading?: boolean;
}

// 筛选选项配置
const CATEGORY_OPTIONS = [
  { label: '爆米花', value: 'cat_popcorn' },
  { label: '饮料', value: 'cat_beverage' },
  { label: '零食', value: 'cat_snack' },
  { label: '3D眼镜', value: 'cat_glasses' },
  { label: '电影周边', value: 'cat_merchandise' },
];

const LOCATION_OPTIONS = [
  { label: '主仓库', value: 'loc_main' },
  { label: '分仓A', value: 'loc_branch_a' },
  { label: '分仓B', value: 'loc_branch_b' },
  { label: '临时仓库', value: 'loc_temp' },
  { label: '残次品仓库', value: 'loc_defective' },
];

const STATUS_OPTIONS = [
  { label: '库存不足', value: 'low', color: 'warning' },
  { label: '正常', value: 'normal', color: 'success' },
  { label: '库存积压', value: 'high', color: 'processing' },
  { label: '缺货', value: 'out_of_stock', color: 'error' },
];

const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  filters,
  onFiltersChange,
  onClear,
  onReset,
  loading = false,
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [advancedVisible, setAdvancedVisible] = useState(false);
  const [form] = Form.useForm();

  // 计算当前激活的筛选条件数量
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.keyword) count++;
    if (filters.categoryId) count++;
    if (filters.locationId) count++;
    if (filters.stockStatus) count++;
    if (filters.lowStockOnly) count++;
    if (filters.dateRange?.length) count++;
    if (filters.quantityRange) count++;
    return count;
  }, [filters]);

  // 处理筛选条件变化
  const handleFiltersChange = useCallback((changedValues: any, allValues: any) => {
    onFiltersChange(allValues);
  }, [onFiltersChange]);

  // 处理关键字搜索
  const handleKeywordSearch = useCallback((value: string) => {
    onFiltersChange({ keyword: value.trim() || undefined });
  }, [onFiltersChange]);

  // 清除所有筛选条件
  const handleClearAll = useCallback(() => {
    form.resetFields();
    onClear();
  }, [form, onClear]);

  // 重置筛选条件
  const handleReset = useCallback(() => {
    form.resetFields();
    onReset();
  }, [form, onReset]);

  // 渲染状态选项
  const renderStatusOptions = () => {
    return STATUS_OPTIONS.map(option => (
      <Select.Option key={option.value} value={option.value}>
        <Space>
          <Badge status={option.color as any} />
          {option.label}
        </Space>
      </Select.Option>
    ));
  };

  // 基础筛选表单
  const renderBasicFilters = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Form.Item label="搜索" name="keyword">
          <Input.Search
            placeholder="SKU/商品名称"
            allowClear
            enterButton={
              <Tooltip title="搜索">
                <SearchOutlined />
              </Tooltip>
            }
            onSearch={handleKeywordSearch}
            loading={loading}
          />
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item label="商品类别" name="categoryId">
          <Select
            placeholder="请选择类别"
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {CATEGORY_OPTIONS.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item label="仓库位置" name="locationId">
          <Select
            placeholder="请选择位置"
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {LOCATION_OPTIONS.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Form.Item label="库存状态" name="stockStatus">
          <Select
            placeholder="请选择状态"
            allowClear
          >
            {renderStatusOptions()}
          </Select>
        </Form.Item>
      </Col>
    </Row>
  );

  // 高级筛选表单
  const renderAdvancedFilters = () => (
    <>
      <Divider />
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="更新时间" name="dateRange">
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['开始时间', '结束时间']}
              format="YYYY-MM-DD HH:mm"
              showTime={{ format: 'HH:mm' }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="库存数量范围" name="quantityRange">
            <Input.Group compact>
              <Input
                style={{ width: '45%' }}
                placeholder="最小值"
                type="number"
              />
              <Input
                style={{
                  width: '10%',
                  textAlign: 'center',
                  borderLeft: 0,
                  borderRight: 0,
                  pointerEvents: 'none',
                }}
                placeholder="~"
                disabled
              />
              <Input
                style={{ width: '45%' }}
                placeholder="最大值"
                type="number"
              />
            </Input.Group>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="lowStockOnly" valuePropName="checked">
            <Space>
              <Badge status="warning" />
              <Text>仅显示低库存商品</Text>
            </Space>
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  // 操作按钮
  const renderActions = () => (
    <Space>
      <Button
        icon={<ClearOutlined />}
        onClick={handleClearAll}
        disabled={activeFiltersCount === 0}
      >
        清除
      </Button>
      <Button icon={<ReloadOutlined />} onClick={handleReset} loading={loading}>
        重置
      </Button>
    </Space>
  );

  return (
    <Card className="filter-section">
      <Form
        form={form}
        initialValues={filters}
        onValuesChange={handleFiltersChange}
        layout="vertical"
      >
        {/* 筛选器头部 */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Space>
              <FilterOutlined />
              <Text strong>筛选条件</Text>
              {activeFiltersCount > 0 && (
                <Badge count={activeFiltersCount} size="small" />
              )}
            </Space>
          </Col>
          <Col>
            <Space>
              {renderActions()}
              <Button
                type="link"
                size="small"
                icon={advancedVisible ? <UpOutlined /> : <DownOutlined />}
                onClick={() => setAdvancedVisible(!advancedVisible)}
              >
                {advancedVisible ? '收起高级筛选' : '展开高级筛选'}
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 基础筛选 */}
        {renderBasicFilters()}

        {/* 高级筛选 */}
        {advancedVisible && renderAdvancedFilters()}

        {/* 移动端展开/收起按钮 */}
        {isMobile && activeFiltersCount > 0 && (
          <Row justify="center" style={{ marginTop: 12 }}>
            <Col>
              <Text type="secondary">
                已选择 {activeFiltersCount} 个筛选条件
              </Text>
            </Col>
          </Row>
        )}
      </Form>
    </Card>
  );
};

export default InventoryFilters;