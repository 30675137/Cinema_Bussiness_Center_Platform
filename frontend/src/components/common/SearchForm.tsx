import React, { useState } from 'react';
import { Form, Input, Select, DatePicker, Button, Space, Row, Col, Card, Tooltip } from 'antd';
import { SearchOutlined, ReloadOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import type { RangePickerProps } from 'antd/es/date-picker';

export interface SearchFormField {
  name: string;
  label: string;
  type: 'input' | 'select' | 'dateRange' | 'numberRange';
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  width?: number;
  span?: number;
  rules?: any[];
  defaultValue?: any;
}

export interface SearchFormProps {
  fields: SearchFormField[];
  onSearch?: (values: Record<string, any>) => void;
  onReset?: () => void;
  loading?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  layout?: 'horizontal' | 'vertical' | 'inline';
  colon?: boolean;
  initialValues?: Record<string, any>;
}

const SearchForm: React.FC<SearchFormProps> = ({
  fields,
  onSearch,
  onReset,
  loading = false,
  defaultCollapsed = false,
  className = '',
  layout = 'inline',
  colon = true,
  initialValues = {},
}) => {
  const [form] = Form.useForm();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const displayFields = collapsed ? fields.slice(0, 3) : fields;

  // 渲染搜索字段
  const renderField = (field: SearchFormField) => {
    const { name, type, placeholder, options, width, rules, defaultValue } = field;

    switch (type) {
      case 'input':
        return (
          <Input
            placeholder={placeholder || `请输入${field.label}`}
            allowClear
            style={{ width: width || 200 }}
          />
        );

      case 'select':
        return (
          <Select
            placeholder={placeholder || `请选择${field.label}`}
            allowClear
            style={{ width: width || 150 }}
            options={options}
          />
        );

      case 'dateRange':
        return (
          <DatePicker.RangePicker
            style={{ width: width || 250 }}
            placeholder={['开始日期', '结束日期']}
            format="YYYY-MM-DD"
          />
        );

      case 'numberRange':
        return (
          <Input.Group compact style={{ width: width || 200 }}>
            <Input style={{ width: '45%' }} placeholder="最小值" type="number" />
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
            <Input style={{ width: '45%' }} placeholder="最大值" type="number" />
          </Input.Group>
        );

      default:
        return null;
    }
  };

  // 处理搜索
  const handleSearch = (values: Record<string, any>) => {
    // 处理日期范围字段
    const processedValues = { ...values };

    fields.forEach((field) => {
      if (field.type === 'dateRange' && processedValues[field.name]) {
        const [startDate, endDate] = processedValues[field.name];
        processedValues[`${field.name}Start`] = startDate?.format('YYYY-MM-DD');
        processedValues[`${field.name}End`] = endDate?.format('YYYY-MM-DD');
        delete processedValues[field.name];
      }
    });

    onSearch?.(processedValues);
  };

  // 处理重置
  const handleReset = () => {
    form.resetFields();
    onReset?.();
  };

  // 处理展开/收起
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Card className={`search-form ${className}`} size="small">
      <Form
        form={form}
        layout={layout}
        colon={colon}
        onFinish={handleSearch}
        initialValues={initialValues}
        className="w-full"
      >
        <Row gutter={[16, 16]} align="middle">
          {displayFields.map((field) => (
            <Col key={field.name} span={field.span || layout === 'inline' ? undefined : 8}>
              <Form.Item
                name={field.name}
                label={layout === 'inline' ? undefined : field.label}
                rules={field.rules}
                initialValue={field.defaultValue}
                className="mb-0"
              >
                {renderField(field)}
              </Form.Item>
            </Col>
          ))}

          <Col>
            <Space>
              <Tooltip title="搜索">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                  loading={loading}
                >
                  搜索
                </Button>
              </Tooltip>

              <Tooltip title="重置">
                <Button onClick={handleReset} icon={<ReloadOutlined />}>
                  重置
                </Button>
              </Tooltip>

              {fields.length > 3 && (
                <Button
                  type="link"
                  onClick={toggleCollapse}
                  icon={collapsed ? <DownOutlined /> : <UpOutlined />}
                >
                  {collapsed ? '展开' : '收起'}
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default SearchForm;
