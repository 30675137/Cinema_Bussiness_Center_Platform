import React, { useEffect, useCallback } from 'react';
import { Form, Input, Select, Button, Space, Row, Col, Typography, Divider, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { BrandFormProps, Brand } from '../../types/brand.types';
import { BrandType, BrandStatus, BRAND_CONSTANTS } from '../../types/brand.types';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/**
 * 品牌表单分子组件
 * 用于品牌创建和编辑的表单
 */
const BrandForm: React.FC<BrandFormProps> = ({
  brand,
  mode = 'create',
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();

  // 初始化表单数据
  useEffect(() => {
    if (brand && mode === 'edit') {
      form.setFieldsValue({
        name: brand.name,
        englishName: brand.englishName || '',
        brandType: brand.brandType,
        primaryCategories: brand.primaryCategories || [],
        company: brand.company || '',
        brandLevel: brand.brandLevel || '',
        tags: brand.tags || [],
        description: brand.description || '',
        status: brand.status || BrandStatus.DRAFT,
      });
    } else {
      // 创建模式的默认值
      form.setFieldsValue({
        status: BrandStatus.DRAFT,
      });
    }
  }, [brand, mode, form]);

  // 处理表单提交
  const handleSubmit = useCallback(
    async (values: any) => {
      try {
        const formData = {
          ...values,
          // 清理空值
          englishName: values.englishName?.trim() || undefined,
          company: values.company?.trim() || undefined,
          brandLevel: values.brandLevel?.trim() || undefined,
          tags: values.tags?.filter((tag: string) => tag.trim()) || [],
          description: values.description?.trim() || undefined,
          primaryCategories: values.primaryCategories || [],
        };

        await onSubmit(formData);
      } catch (error) {
        message.error('提交失败，请稍后重试');
      }
    },
    [onSubmit]
  );

  // 处理取消
  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  // 处理键盘快捷键
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        form.submit();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    },
    [form, handleCancel]
  );

  // 表单标题
  const getFormTitle = () => {
    switch (mode) {
      case 'create':
        return '新建品牌';
      case 'edit':
        return '编辑品牌';
      case 'view':
        return '品牌详情';
      default:
        return '品牌信息';
    }
  };

  return (
    <div className="brand-form" data-testid="brand-form" onKeyDown={handleKeyDown}>
      <div className="brand-form-header" data-testid="brand-form-header">
        <Title level={4} data-testid="brand-form-title">
          {getFormTitle()}
        </Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={mode === 'view' || loading}
        className="brand-form-content"
        data-testid="brand-form-content"
      >
        {/* 基本信息 */}
        <div className="form-section">
          <Title level={5}>基本信息</Title>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="name"
                label="品牌名称"
                rules={[
                  { required: true, message: '品牌名称不能为空' },
                  { max: 100, message: '品牌名称不能超过100字符' },
                  {
                    pattern: /^[\u4e00-\u9fa5a-zA-Z0-9\s\-_&]+$/,
                    message: '品牌名称只能包含中文、英文、数字、空格、连字符、下划线和&符号',
                  },
                ]}
                data-testid="brand-name-form-item"
              >
                <Input
                  placeholder="请输入品牌名称"
                  data-testid="brand-name-input"
                  autoComplete="off"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="englishName"
                label="英文名称"
                rules={[
                  { max: 200, message: '英文名不能超过200字符' },
                  {
                    pattern: /^[a-zA-Z0-9\s\-_&]+$/,
                    message: '英文名只能包含英文字母、数字、空格、连字符、下划线和&符号',
                  },
                ]}
                data-testid="english-name-form-item"
              >
                <Input
                  placeholder="请输入英文名称"
                  data-testid="english-name-input"
                  autoComplete="off"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="brandType"
                label="品牌类型"
                rules={[{ required: true, message: '请选择品牌类型' }]}
                data-testid="brand-type-form-item"
              >
                <Select
                  placeholder="请选择品牌类型"
                  data-testid="brand-type-select"
                  allowClear={false}
                >
                  {Object.entries(BRAND_CONSTANTS.TYPE_LABELS).map(([value, label]) => (
                    <Option key={value} value={value}>
                      {label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* 详细信息 */}
        <div className="form-section">
          <Title level={5}>详细信息</Title>

          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="primaryCategories"
                label="主营类目"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value || value.length === 0) {
                        return Promise.reject(new Error('请选择至少一个主营类目'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                data-testid="primary-categories-form-item"
              >
                <Select
                  mode="multiple"
                  placeholder="请选择主营类目"
                  data-testid="primary-categories-select"
                  allowClear
                >
                  <Option value="饮料">饮料</Option>
                  <Option value="酒水">酒水</Option>
                  <Option value="食品">食品</Option>
                  <Option value="服装">服装</Option>
                  <Option value="电子">电子产品</Option>
                  <Option value="家居">家居用品</Option>
                  <Option value="美妆">美妆护肤</Option>
                  <Option value="母婴">母婴用品</Option>
                  <Option value="运动">运动户外</Option>
                  <Option value="汽车">汽车用品</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="company"
                label="所属公司"
                rules={[{ max: 200, message: '公司名称不能超过200字符' }]}
                data-testid="company-form-item"
              >
                <Input
                  placeholder="请输入所属公司"
                  data-testid="company-input"
                  autoComplete="off"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="brandLevel"
                label="品牌等级"
                rules={[{ max: 50, message: '品牌等级不能超过50字符' }]}
                data-testid="brand-level-form-item"
              >
                <Select placeholder="请选择品牌等级" data-testid="brand-level-select" allowClear>
                  <Option value="A">A级</Option>
                  <Option value="B">B级</Option>
                  <Option value="C">C级</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="tags"
                label="品牌标签"
                rules={[
                  {
                    validator: (_, value) => {
                      if (value && value.length > 10) {
                        return Promise.reject(new Error('标签不能超过10个'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                data-testid="brand-tags-form-item"
              >
                <Select
                  mode="tags"
                  placeholder="请输入品牌标签，按回车添加"
                  data-testid="brand-tags-input"
                  style={{ width: '100%' }}
                  tokenSeparators={[',']}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="status" label="品牌状态" data-testid="brand-status-form-item">
                <Select
                  placeholder="请选择品牌状态"
                  data-testid="brand-status-select"
                  disabled={mode === 'view'}
                >
                  {Object.entries(BRAND_CONSTANTS.STATUS_COLORS).map(([value, config]) => (
                    <Option key={value} value={value}>
                      {config.text}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* 品牌描述 */}
        <div className="form-section">
          <Title level={5}>品牌描述</Title>

          <Form.Item
            name="description"
            rules={[{ max: 1000, message: '品牌介绍不能超过1000字符' }]}
            data-testid="brand-description-form-item"
          >
            <TextArea
              placeholder="请输入品牌介绍"
              rows={4}
              showCount
              maxLength={1000}
              data-testid="brand-description-textarea"
            />
          </Form.Item>
        </div>

        {/* 操作按钮 */}
        <div className="form-actions" data-testid="form-actions">
          <Space>
            {mode !== 'view' && (
              <>
                <Button onClick={handleCancel} disabled={loading} data-testid="cancel-brand-button">
                  取消
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={mode === 'create' ? <PlusOutlined /> : undefined}
                  data-testid="save-brand-button"
                >
                  {mode === 'create' ? '新建品牌' : '保存修改'}
                </Button>
              </>
            )}
            {mode === 'view' && (
              <Button onClick={handleCancel} data-testid="close-brand-button">
                关闭
              </Button>
            )}
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default BrandForm;
