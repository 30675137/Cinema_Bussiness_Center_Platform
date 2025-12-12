/**
 * 库存调整筛选器组件
 * 提供调整记录的多维度筛选功能
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Card,
  Form,
  Select,
  Input,
  DatePicker,
  Button,
  Space,
  Row,
  Col,
  Typography,
  InputNumber,
  Divider,
} from 'antd';
import {
  SearchOutlined,
  ClearOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { InventoryAdjustmentFilters } from '@/types/inventory';
import { useResponsive } from '@/hooks/useResponsive';

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface AdjustmentFiltersProps {
  filters: InventoryAdjustmentFilters;
  onFiltersChange: (filters: Partial<InventoryAdjustmentFilters>) => void;
  onClear: () => void;
  onReset: () => void;
  loading?: boolean;
}

// 调整类型选项
const ADJUSTMENT_TYPE_OPTIONS = [
  { label: '盘盈', value: 'stocktaking_profit' },
  { label: '盘亏', value: 'stocktaking_loss' },
  { label: '报损', value: 'damage' },
  { label: '过期', value: 'expired' },
  { label: '其他', value: 'other' },
];

// 调整状态选项
const STATUS_OPTIONS = [
  { label: '待审批', value: 'pending' },
  { label: '已批准', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
  { label: '已完成', value: 'completed' },
];

const AdjustmentFilters: React.FC<AdjustmentFiltersProps> = ({
  filters,
  onFiltersChange,
  onClear,
  onReset,
  loading = false,
}) => {
  const { isMobile } = useResponsive();
  const [form] = Form.useForm();
  const [expanded, setExpanded] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    form.setFieldsValue({
      keyword: filters.sku || filters.productName,
      adjustmentType: filters.adjustmentType,
      status: filters.status,
      requestedBy: filters.requestedBy,
      dateRange: filters.dateRange,
      quantityRange: filters.quantityRange,
    });
  }, [filters, form]);

  // 处理表单提交
  const handleSubmit = useCallback((values: any) => {
    const newFilters: Partial<InventoryAdjustmentFilters> = {};

    // 处理关键词搜索（SKU或商品名称）
    if (values.keyword) {
      newFilters.sku = values.keyword;
      newFilters.productName = values.keyword;
    } else {
      delete newFilters.sku;
      delete newFilters.productName;
    }

    // 处理调整类型
    if (values.adjustmentType) {
      newFilters.adjustmentType = values.adjustmentType;
    } else {
      delete newFilters.adjustmentType;
    }

    // 处理状态
    if (values.status) {
      newFilters.status = values.status;
    } else {
      delete newFilters.status;
    }

    // 处理申请人
    if (values.requestedBy) {
      newFilters.requestedBy = values.requestedBy;
    } else {
      delete newFilters.requestedBy;
    }

    // 处理时间范围
    if (values.dateRange && values.dateRange.length === 2) {
      newFilters.dateRange = values.dateRange;
    } else {
      delete newFilters.dateRange;
    }

    // 处理数量范围
    if (values.quantityRange && values.quantityRange.length === 2) {
      newFilters.quantityRange = values.quantityRange;
    } else {
      delete newFilters.quantityRange;
    }

    onFiltersChange(newFilters);
  }, [onFiltersChange]);

  // 处理重置
  const handleReset = useCallback(() => {
    form.resetFields();
    onReset();
  }, [form, onReset]);

  // 处理清除
  const handleClear = useCallback(() => {
    form.resetFields();
    onClear();
  }, [form, onClear]);

  // 渲染基础筛选器
  const renderBasicFilters = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Form.Item name="keyword" label="搜索">
          <Input
            placeholder="SKU或商品名称"
            allowClear
            prefix={<SearchOutlined />}
          />
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Form.Item name="adjustmentType" label="调整类型">
          <Select
            placeholder="请选择调整类型"
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {ADJUSTMENT_TYPE_OPTIONS.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Form.Item name="status" label="状态">
          <Select
            placeholder="请选择状态"
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {STATUS_OPTIONS.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Form.Item name="requestedBy" label="申请人">
          <Input
            placeholder="请输入申请人"
            allowClear
          />
        </Form.Item>
      </Col>
    </Row>
  );

  // 渲染高级筛选器
  const renderAdvancedFilters = () => (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="dateRange" label="申请时间">
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['开始日期', '结束日期']}
              format="YYYY-MM-DD"
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Form.Item name="quantityRange" label="调整数量范围">
            <Space.Compact style={{ width: '100%' }}>
              <InputNumber
                style={{ width: '45%' }}
                placeholder="最小值"
                min={0}
              />
              <InputNumber
                style={{ width: '45%' }}
                placeholder="最大值"
                min={0}
              />
            </Space.Compact>
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  // 渲染操作按钮
  const renderActions = () => (
    <Space size="small">
      <Button
        type="primary"
        icon={<SearchOutlined />}
        onClick={() => form.submit()}
        loading={loading}
      >
        搜索
      </Button>
      <Button
        icon={<ClearOutlined />}
        onClick={handleClear}
      >
        清除
      </Button>
      <Button
        onClick={handleReset}
      >
        重置
      </Button>
    </Space>
  );

  return (
    <Card size="small" title={
      <Space>
        <FilterOutlined />
        <Text>筛选条件</Text>
      </Space>
    }>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {renderBasicFilters()}

          {expanded && (
            <>
              <Divider />
              {renderAdvancedFilters()}
            </>
          )}

          <Row justify="space-between" align="middle">
            <Col>
              <Button
                type="link"
                size="small"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? '收起高级筛选' : '展开高级筛选'}
              </Button>
            </Col>
            <Col>
              {renderActions()}
            </Col>
          </Row>
        </Space>
      </Form>
    </Card>
  );
};

export default AdjustmentFilters;