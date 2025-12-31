import React from 'react';
import { Form, Input, Select, Button, Space, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { BrandSearchFormProps, BrandFilters } from '../../types/brand.types';
import { BrandType, BrandStatus, BRAND_CONSTANTS } from '../../types/brand.types';

const { Option } = Select;

/**
 * 品牌搜索表单分子组件
 * 包含关键词搜索、品牌类型筛选、状态筛选等功能
 */
const BrandSearchForm: React.FC<BrandSearchFormProps> = ({
  onSearch,
  onReset,
  loading = false,
}) => {
  const [form] = Form.useForm();

  const handleSearch = (values: any) => {
    const filters: BrandFilters = {
      keyword: values.keyword?.trim(),
      brandType: values.brandType,
      status: values.status,
    };

    // 过滤掉空值
    const cleanedFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
    ) as BrandFilters;

    onSearch(cleanedFilters);
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  const handleSubmit = () => {
    form.submit();
  };

  return (
    <div className="brand-search-form" data-testid="brand-search-form">
      <Form form={form} onFinish={handleSearch} layout="vertical" className="search-form-content">
        <Row gutter={[16, 0]}>
          <Col xs={24} sm={24} md={8} lg={6}>
            <Form.Item name="keyword" label="关键词" className="search-keyword-item">
              <Input
                placeholder="输入品牌名称 / 英文名 / 编码"
                allowClear
                data-testid="keyword-input"
                onPressEnter={handleSubmit}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6} lg={4}>
            <Form.Item name="brandType" label="品牌类型" className="search-type-item">
              <Select placeholder="请选择" allowClear data-testid="brand-type-select">
                {Object.entries(BRAND_CONSTANTS.TYPE_LABELS).map(([value, label]) => (
                  <Option key={value} value={value}>
                    {label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={6} lg={4}>
            <Form.Item name="status" label="状态" className="search-status-item">
              <Select placeholder="请选择" allowClear data-testid="brand-status-select">
                {Object.entries(BRAND_CONSTANTS.STATUS_COLORS).map(([value, config]) => (
                  <Option key={value} value={value}>
                    {config.text}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={4} lg={6}>
            <Form.Item label=" " className="search-buttons-item">
              <Space size="small">
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  loading={loading}
                  onClick={handleSubmit}
                  data-testid="search-button"
                >
                  查询
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset} data-testid="reset-button">
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default BrandSearchForm;
