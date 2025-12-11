/**
 * 库存流水筛选器组件
 * 提供库存流水数据的筛选、搜索和时间范围选择功能
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
  InputNumber,
} from 'antd';
import {
  SearchOutlined,
  ClearOutlined,
  FilterOutlined,
  DownOutlined,
  UpOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { InventoryMovementFilters } from '@types/inventory';
import { useResponsive } from '@/hooks/useResponsive';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface MovementsFiltersProps {
  filters: InventoryMovementFilters;
  onFiltersChange: (filters: Partial<InventoryMovementFilters>) => void;
  onClear: () => void;
  onReset: () => void;
  loading?: boolean;
}

// 筛选选项配置
const MOVEMENT_TYPE_OPTIONS = [
  { label: '入库', value: 'in', color: 'success' },
  { label: '出库', value: 'out', color: 'error' },
  { label: '调拨入库', value: 'transfer_in', color: 'processing' },
  { label: '调拨出库', value: 'transfer_out', color: 'processing' },
  { label: '盘盈', value: 'adjust_positive', color: 'success' },
  { label: '盘亏/报损', value: 'adjust_negative', color: 'error' },
];

const MOVEMENT_SUBTYPE_OPTIONS = [
  { label: '采购入库', value: '采购入库' },
  { label: '销售出库', value: '销售出库' },
  { label: '调拨入库', value: '调拨入库' },
  { label: '调拨出库', value: '调拨出库' },
  { label: '盘盈', value: '盘盈' },
  { label: '盘亏', value: '盘亏' },
  { label: '报损', value: '报损' },
  { label: '过期', value: '过期' },
  { label: '退货入库', value: '退货入库' },
  { label: '退货出库', value: '退货出库' },
];

const REFERENCE_TYPE_OPTIONS = [
  { label: '采购订单', value: 'purchase_order' },
  { label: '销售订单', value: 'sales_order' },
  { label: '调拨单', value: 'transfer_order' },
  { label: '调整单', value: 'adjustment_order' },
  { label: '盘点单', value: 'stocktaking_order' },
  { label: '退货单', value: 'return_order' },
];

const STATUS_OPTIONS = [
  { label: '待确认', value: 'pending', color: 'warning' },
  { label: '已确认', value: 'confirmed', color: 'processing' },
  { label: '已完成', value: 'completed', color: 'success' },
  { label: '已取消', value: 'cancelled', color: 'default' },
];

const LOCATION_OPTIONS = [
  { label: '主仓库', value: 'loc_main' },
  { label: '分仓A', value: 'loc_branch_a' },
  { label: '分仓B', value: 'loc_branch_b' },
  { label: '临时仓库', value: 'loc_temp' },
  { label: '残次品仓库', value: 'loc_defective' },
];

const MovementsFilters: React.FC<MovementsFiltersProps> = ({
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
    if (filters.sku) count++;
    if (filters.movementType) count++;
    if (filters.movementSubtype) count++;
    if (filters.locationId) count++;
    if (filters.operatorName) count++;
    if (filters.dateRange?.length) count++;
    if (filters.referenceType) count++;
    if (filters.referenceNo) count++;
    if (filters.status) count++;
    if (filters.minQuantity !== undefined || filters.maxQuantity !== undefined) count++;
    if (filters.onlyNegativeQuantity) count++;
    if (filters.onlyPositiveQuantity) count++;
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

  // 渲染变动类型选项
  const renderMovementTypeOptions = () => {
    return MOVEMENT_TYPE_OPTIONS.map(option => (
      <Select.Option key={option.value} value={option.value}>
        <Space>
          <Badge status={option.color as any} />
          {option.label}
        </Space>
      </Select.Option>
    ));
  };

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
            placeholder="SKU/商品名称/操作员"
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
        <Form.Item label="变动类型" name="movementType">
          <Select
            placeholder="请选择变动类型"
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {renderMovementTypeOptions()}
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
        <Form.Item label="操作时间" name="dateRange">
          <RangePicker
            style={{ width: '100%' }}
            placeholder={['开始时间', '结束时间']}
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm' }}
            ranges={{
              '今天': [() => {
                const now = new Date();
                return [now.setHours(0,0,0,0), now];
              }, () => {
                const now = new Date();
                return now;
              }],
              '本周': [() => {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
                start.setHours(0,0,0,0);
                return start;
              }, () => new Date()],
              '本月': [() => {
                const now = new Date();
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                start.setHours(0,0,0,0);
                return start;
              }, () => new Date()],
            }}
          />
        </Form.Item>
      </Col>
    </Row>
  );

  // 高级筛选表单
  const renderAdvancedFilters = () => (
    <>
      <Divider />
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item label="变动子类型" name="movementSubtype">
            <Select
              placeholder="请选择子类型"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {MOVEMENT_SUBTYPE_OPTIONS.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item label="单据类型" name="referenceType">
            <Select
              placeholder="请选择单据类型"
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {REFERENCE_TYPE_OPTIONS.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item label="单据号" name="referenceNo">
            <Input placeholder="请输入单据号" allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item label="状态" name="status">
            <Select
              placeholder="请选择状态"
              allowClear
            >
              {renderStatusOptions()}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="数量范围">
            <Input.Group compact>
              <Form.Item name="minQuantity" noStyle>
                <InputNumber
                  style={{ width: '45%' }}
                  placeholder="最小值"
                  min={0}
                />
              </Form.Item>
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
              <Form.Item name="maxQuantity" noStyle>
                <InputNumber
                  style={{ width: '45%' }}
                  placeholder="最大值"
                  min={0}
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="数量筛选">
            <Space wrap>
              <Form.Item name="onlyPositiveQuantity" valuePropName="checked" noStyle>
                <Button size="small">仅入库</Button>
              </Form.Item>
              <Form.Item name="onlyNegativeQuantity" valuePropName="checked" noStyle>
                <Button size="small">仅出库</Button>
              </Form.Item>
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
              <Text strong>流水筛选条件</Text>
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

export default MovementsFilters;