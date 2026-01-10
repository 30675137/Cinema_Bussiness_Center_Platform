import React, { useState, useCallback, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Upload,
  Button,
  Card,
  Row,
  Col,
  Space,
  message,
  Divider,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  MinusCircleOutlined,
  UploadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import type {
  SPUItem,
  SPUStatus,
  Brand,
  Category,
  AttributeTemplate,
  AttributeTemplateItem,
} from '@/types/spu';
// @spec P008-sku-type-refactor: ProductType 已移除，SKU 类型由 SKU.skuType 管理
import { BrandSelect } from './BrandSelect';
import { CategorySelector } from './CategorySelector';
import AttributeEditor from '@/components/Attribute/AttributeEditor';
import { attributeService } from '@/services/attributeService';

const { TextArea } = Input;
const { Option } = Select;

interface SPUFormData {
  name: string;
  shortName?: string;
  description: string;
  unit?: string;
  brandId: string;
  categoryId: string;
  status: SPUStatus;
  // @spec P008-sku-type-refactor: productType 已移除，SKU 类型由 SKU.skuType 管理
  tags: string[];
  images: UploadFile[];
  specifications: Array<{ name: string; value: string }>;
  // 使用属性模板的动态属性
  attributeTemplateId?: string;
  attributeValues: Record<string, any>;
}

interface SPUFormProps {
  initialValues?: Partial<SPUFormData>;
  onSubmit: (values: SPUFormData) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  brands?: Brand[];
  categories?: Category[];
}

const SPUForm: React.FC<SPUFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
  brands = [],
  categories = [],
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>(initialValues?.images || []);
  const [availableTemplates, setAvailableTemplates] = useState<AttributeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<AttributeTemplate | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // 处理表单提交
  const handleSubmit = useCallback(
    async (values: any) => {
      try {
        const formData: SPUFormData = {
          ...values,
          images: fileList,
          specifications: values.specifications || [],
          attributes: values.attributes || [],
          tags: values.tags || [],
        };

        await onSubmit(formData);
      } catch (error) {
        console.error('Form submission error:', error);
        message.error('提交失败，请重试');
      }
    },
    [onSubmit, fileList]
  );

  // 处理文件上传
  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    // 限制最多10张图片
    if (newFileList.length > 10) {
      message.warning('最多只能上传10张图片');
      return;
    }
    setFileList(newFileList);
  };

  // 自定义上传函数（Mock）
  const customRequest = ({ onSuccess, onError, file }: any) => {
    // 模拟上传成功
    setTimeout(() => {
      onSuccess?.(file);
    }, 1000);
  };

  // 加载属性模板
  const loadAttributeTemplates = useCallback(async (categoryId?: string) => {
    try {
      setLoadingTemplates(true);
      const response = await attributeService.getTemplateList({
        page: 1,
        pageSize: 100,
        status: 'active',
      });

      if (response.list) {
        // 如果选择了分类，过滤适用于该分类的模板
        let filteredTemplates = response.list;
        if (categoryId) {
          filteredTemplates = response.list.filter(
            (template) =>
              !template.categoryId || // 通用模板
              template.categoryId === categoryId // 特定分类的模板
          );
        }
        setAvailableTemplates(filteredTemplates);
      }
    } catch (error) {
      console.error('Load attribute templates error:', error);
      message.error('加载属性模板失败');
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  // 处理属性模板选择
  const handleTemplateChange = useCallback(
    async (templateId: string) => {
      if (!templateId) {
        setSelectedTemplate(null);
        form.setFieldValue('attributeValues', {});
        return;
      }

      try {
        const template = availableTemplates.find((t) => t.id === templateId);
        if (template) {
          setSelectedTemplate(template);
          // 初始化属性值为空对象
          form.setFieldValue('attributeValues', {});
        }
      } catch (error) {
        console.error('Handle template change error:', error);
        message.error('切换属性模板失败');
      }
    },
    [availableTemplates, form]
  );

  // 处理表单字段值变化
  const onValuesChange = (changedValues: any, allValues: any) => {
    console.log('Form values changed:', changedValues, allValues);

    // 当分类改变时，重新加载属性模板
    if (changedValues.categoryId) {
      loadAttributeTemplates(changedValues.categoryId);
    }

    // 当属性模板改变时，处理模板选择
    if (changedValues.attributeTemplateId) {
      handleTemplateChange(changedValues.attributeTemplateId);
    }
  };

  // 初始化表单值
  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name || '',
        shortName: initialValues.shortName || '',
        description: initialValues.description || '',
        unit: initialValues.unit || '',
        brandId: initialValues.brandId || '',
        categoryId: initialValues.categoryId || '',
        status: initialValues.status || 'draft',
        // @spec P008-sku-type-refactor: productType 已移除
        tags: initialValues.tags || [],
        specifications: initialValues.specifications || [{ name: '', value: '' }],
        attributeTemplateId: initialValues.attributeTemplateId || '',
        attributeValues: initialValues.attributeValues || {},
      });
    }
  }, [initialValues, form]);

  // 初始化时加载属性模板
  React.useEffect(() => {
    loadAttributeTemplates(initialValues?.categoryId);
  }, [loadAttributeTemplates, initialValues?.categoryId]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      onValuesChange={onValuesChange}
      initialValues={{
        status: 'draft',
        // @spec P008-sku-type-refactor: productType 已移除，SKU 类型由 SKU.skuType 管理
        specifications: [{ name: '', value: '' }],
        attributeTemplateId: '',
        attributeValues: {},
        tags: [],
      }}
    >
      {/* 基础信息 */}
      <Card title="基础信息" className="form-section" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="SPU名称"
              rules={[
                { required: true, message: '请输入SPU名称' },
                { max: 100, message: 'SPU名称不能超过100个字符' },
              ]}
            >
              <Input placeholder="请输入SPU名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="shortName"
              label="标准简称"
              rules={[{ max: 50, message: '标准简称不能超过50个字符' }]}
            >
              <Input placeholder="请输入标准简称（可选）" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="brandId"
              label="品牌"
              rules={[{ required: true, message: '请选择品牌' }]}
            >
              <BrandSelect brands={brands} placeholder="请选择品牌" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="categoryId"
              label="分类"
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <CategorySelector categories={categories} placeholder="请选择分类" />
            </Form.Item>
          </Col>
        </Row>

        {/* @spec P008-sku-type-refactor: productType 选择器已移除，SKU 类型由 SKU.skuType 管理 */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="unit" label="标准单位">
              <Input placeholder="如：瓶/包/盒等（可选）" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select placeholder="请选择状态">
                <Option value="draft">草稿</Option>
                <Option value="active">已上架</Option>
                <Option value="inactive">已下架</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="tags" label="标签">
              <Select
                mode="tags"
                placeholder="请输入标签"
                style={{ width: '100%' }}
                maxTagCount={5}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="商品描述"
          rules={[
            { required: true, message: '请输入商品描述' },
            { max: 2000, message: '商品描述不能超过2000个字符' },
          ]}
        >
          <TextArea rows={4} placeholder="请输入商品基础描述信息" showCount maxLength={2000} />
        </Form.Item>

        {/* 属性模板选择 */}
        <Form.Item name="attributeTemplateId" label="属性模板">
          <Select
            placeholder="请选择属性模板（可选）"
            loading={loadingTemplates}
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {availableTemplates.map((template) => (
              <Option key={template.id} value={template.id}>
                <div>
                  <div style={{ fontWeight: 500 }}>{template.name}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {template.description} ({template.attributes.length} 个属性)
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* 属性模板ID (隐藏字段) */}
        <Form.Item name="attributeValues" hidden>
          <Input />
        </Form.Item>
      </Card>

      {/* 商品图片 */}
      <Card title="商品图片" className="form-section" style={{ marginBottom: 24 }}>
        <Form.Item name="images" rules={[{ required: true, message: '请至少上传一张商品图片' }]}>
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleUploadChange}
            customRequest={customRequest}
            beforeUpload={(file) => {
              const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
              if (!isJpgOrPng) {
                message.error('只能上传 JPG/PNG 格式的图片!');
              }
              const isLt2M = file.size / 1024 / 1024 < 2;
              if (!isLt2M) {
                message.error('图片大小不能超过 2MB!');
              }
              return isJpgOrPng && isLt2M;
            }}
          >
            {fileList.length >= 10 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            )}
          </Upload>
        </Form.Item>
        <div style={{ color: '#666', fontSize: '12px' }}>
          支持JPG/PNG格式，单张图片不超过2MB，最多上传10张
        </div>
      </Card>

      {/* 规格参数 */}
      <Card title="规格参数" className="form-section" style={{ marginBottom: 24 }}>
        <Form.List name="specifications">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <Row gutter={8} align="middle">
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[{ required: true, message: '请输入参数名称' }]}
                      >
                        <Input placeholder="参数名称（如：容量）" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        {...restField}
                        name={[name, 'value']}
                        rules={[{ required: true, message: '请输入参数值' }]}
                      >
                        <Input placeholder="参数值（如：500ml）" />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      {fields.length > 1 ? (
                        <Button
                          type="text"
                          icon={<MinusCircleOutlined />}
                          onClick={() => remove(name)}
                          danger
                        />
                      ) : null}
                    </Col>
                  </Row>
                </div>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  添加规格参数
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Card>

      {/* 模板属性 */}
      {selectedTemplate && (
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>
                <SettingOutlined /> 模板属性 - {selectedTemplate.name}
              </span>
              <span style={{ fontSize: '14px', color: '#666', fontWeight: 'normal' }}>
                共 {selectedTemplate.attributes.filter((attr) => attr.status === 'active').length}{' '}
                个属性
              </span>
            </div>
          }
          className="form-section"
          style={{ marginBottom: 24 }}
        >
          <div style={{ marginBottom: 16, color: '#666', fontSize: '14px' }}>
            {selectedTemplate.description}
          </div>

          {/* 使用Form.Item wrapper for attribute values */}
          <Form.Item name="attributeValues">
            <AttributeEditor
              attributes={selectedTemplate.attributes}
              onChange={(attributeValues) => {
                form.setFieldValue('attributeValues', attributeValues);
              }}
              readonly={false}
            />
          </Form.Item>
        </Card>
      )}

      {/* 无属性模板时的提示 */}
      {!selectedTemplate && (
        <Card title="模板属性" className="form-section" style={{ marginBottom: 24 }}>
          <div
            style={{
              textAlign: 'center',
              color: '#666',
              padding: '40px 0',
              backgroundColor: '#fafafa',
              borderRadius: '6px',
            }}
          >
            <SettingOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>暂无属性模板</div>
            <div style={{ fontSize: '14px' }}>
              请在上方"属性模板"字段中选择一个模板以启用结构化属性管理
            </div>
          </div>
        </Card>
      )}

      {/* 操作按钮 */}
      <Card style={{ textAlign: 'center', border: 'none', boxShadow: 'none' }}>
        <Space size="large">
          <Button size="large" onClick={onCancel}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" size="large" loading={loading}>
            {loading ? '提交中...' : '提交'}
          </Button>
        </Space>
      </Card>
    </Form>
  );
};

export default SPUForm;
