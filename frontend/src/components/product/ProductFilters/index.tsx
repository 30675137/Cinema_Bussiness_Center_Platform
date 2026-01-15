import React, { useState, useEffect } from 'react';
import { Card, Form, Select, InputNumber, Row, Col, Button, Space, Tag, DatePicker } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import type { ProductFilters as ProductFiltersType } from '@/types';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onFilter: (filters: ProductFiltersType) => void;
  onClear?: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ filters, onFilter, onClear }) => {
  const [form] = Form.useForm();
  const [localFilters, setLocalFilters] = useState<ProductFiltersType>(filters);

  // 监听外部filters变化
  useEffect(() => {
    setLocalFilters(filters);
    form.setFieldsValue(filters);
  }, [filters, form]);

  // 表单值变化处理
  const handleValuesChange = (changedValues: any, allValues: any) => {
    const newFilters = { ...localFilters, ...allValues };
    setLocalFilters(newFilters);
    onFilter(newFilters);
  };

  // 重置筛选
  const handleReset = () => {
    const emptyFilters: ProductFiltersType = {};
    setLocalFilters(emptyFilters);
    form.resetFields();
    onClear?.();
  };

  // 应用筛选
  const handleApply = () => {
    onFilter(localFilters);
  };

  return (
    <Card size="small">
      <Form
        form={form}
        layout="vertical"
        initialValues={localFilters}
        onValuesChange={handleValuesChange}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="商品类目" name="categoryId">
              <Select
                placeholder="请选择类目"
                allowClear
                showSearch
                style={{ width: '100%' }}
                optionFilterProp="children"
              >
                <Option value="1">电子产品</Option>
                <Option value="2">食品饮料</Option>
                <Option value="3">日用品</Option>
                <Option value="4">服装鞋帽</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="物料类型" name="materialType">
              <Select placeholder="请选择物料类型" allowClear style={{ width: '100%' }}>
                <Option value="raw_material">原材料</Option>
                <Option value="semi_finished">半成品</Option>
                <Option value="finished_good">成品</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="商品状态" name="status">
              <Select mode="multiple" placeholder="请选择状态" allowClear style={{ width: '100%' }}>
                <Option value="draft">草稿</Option>
                <Option value="pending_review">待审核</Option>
                <Option value="approved">已审核</Option>
                <Option value="published">已发布</Option>
                <Option value="disabled">已禁用</Option>
                <Option value="archived">已归档</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="价格区间" name="priceRange">
              <div style={{ display: 'flex', gap: 8 }}>
                <InputNumber
                  style={{ width: '50%' }}
                  placeholder="最低价格"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{1,3})+(?=\d{3})\b)/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
                <span>-</span>
                <InputNumber
                  style={{ width: '50%' }}
                  placeholder="最高价格"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{1,3})+(?=\d{3})\b)/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </div>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="关键词" name="keyword">
              <Select
                placeholder="请选择关键词"
                allowClear
                style={{ width: '100%' }}
                mode="tags"
                maxTagCount={3}
              >
                <Option value="热销">热销</Option>
                <Option value="新品">新品</Option>
                <Option value="限量版">限量版</Option>
                <Option value="特价">特价</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="创建时间" name="dateRange">
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleApply}>
                  应用筛选
                </Button>
                <Button icon={<ClearOutlined />} onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>

        {/* 当前筛选条件显示 */}
        <Row gutter={8}>
          {Object.entries(localFilters).map(([key, value]) => {
            if (!value || (Array.isArray(value) && value.length === 0)) return null;

            let label = '';
            let displayValue = '';

            switch (key) {
              case 'categoryId':
                label = '类目';
                // 这里可以根据categoryId获取类目名称
                displayValue = `类目ID: ${value}`;
                break;
              case 'materialType':
                label = '物料类型';
                displayValue =
                  value === 'raw_material'
                    ? '原材料'
                    : value === 'semi_finished'
                      ? '半成品'
                      : '成品';
                break;
              case 'status':
                label = '状态';
                if (Array.isArray(value)) {
                  const statusMap: Record<string, string> = {
                    draft: '草稿',
                    pending_review: '待审核',
                    approved: '已审核',
                    published: '已发布',
                    disabled: '已禁用',
                    archived: '已归档',
                  };
                  displayValue = value.map((s) => statusMap[s]).join('、');
                }
                break;
              case 'priceRange':
                label = '价格区间';
                if (Array.isArray(value)) {
                  displayValue = `¥${value[0]} - ¥${value[1]}`;
                }
                break;
              case 'keyword':
                label = '关键词';
                if (Array.isArray(value)) {
                  displayValue = value.join('、');
                }
                break;
              case 'dateRange':
                label = '创建时间';
                if (value) {
                  displayValue = `${value[0]} 至 ${value[1]}`;
                }
                break;
              default:
                return null;
            }

            return (
              <Col key={key} style={{ marginBottom: 8 }}>
                <Tag
                  closable
                  onClose={() => {
                    const newFilters = { ...localFilters };
                    delete newFilters[key as keyof ProductFiltersType];
                    setLocalFilters(newFilters);
                    form.setFieldValue(key, undefined);
                    onFilter(newFilters);
                  }}
                >
                  {label}: {displayValue}
                </Tag>
              </Col>
            );
          })}
        </Row>
      </Form>
    </Card>
  );
};

export default ProductFilters;
