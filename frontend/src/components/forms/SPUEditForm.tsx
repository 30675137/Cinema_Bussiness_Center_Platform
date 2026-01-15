import React, { useState, useEffect, useCallback } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Upload,
  Space,
  Row,
  Col,
  Card,
  Switch,
  message,
  Divider,
  Typography,
  Alert,
  Spin,
  Tabs,
  Modal,
  Tag,
  Tooltip,
} from 'antd';
import {
  SaveOutlined,
  EyeOutlined,
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { SPUItem, SPUStatus, SPUAttribute, AttributeType } from '@/types/spu';
// @spec P008-sku-type-refactor: ProductType 已移除，SKU 类型由 SKU.skuType 管理
import { spuService } from '@/services/spuService';
import { BrandSelect } from '@/components/forms/BrandSelect';
import { CategorySelector } from '@/components/forms/CategorySelector';
import AttributeEditor from '@/components/Attribute/AttributeEditor';
import SPUAttributeTemplate from '@/components/Attribute/SPUAttributeTemplate';
import { SPUNotificationService } from '@/components/common/Notification';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

interface SPUEditFormProps {
  spuId?: string;
  initialData?: SPUItem;
  mode?: 'create' | 'edit';
  onSave?: (data: any) => void;
  onCancel?: () => void;
  loading?: boolean;
  brands?: any[];
  categories?: any[];
}

const SPUEditForm: React.FC<SPUEditFormProps> = ({
  spuId,
  initialData,
  mode = 'edit',
  onSave,
  onCancel,
  loading: externalLoading = false,
  brands = [],
  categories = [],
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [currentData, setCurrentData] = useState<SPUItem | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [templateAttributes, setTemplateAttributes] = useState<SPUAttribute[]>([]);
  const [templateValid, setTemplateValid] = useState(true);
  const [templateErrors, setTemplateErrors] = useState<string[]>([]);

  // 加载SPU数据
  const loadSPUData = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        const response = await spuService.getSPUDetail(id);

        if (response.success) {
          const spuData = response.data;
          setCurrentData(spuData);

          // 设置表单初始值
          // @spec P008-sku-type-refactor: productType 已移除，SKU 类型由 SKU.skuType 管理
          form.setFieldsValue({
            name: spuData.name,
            shortName: spuData.shortName,
            description: spuData.description,
            unit: spuData.unit,
            brandId: spuData.brandId,
            categoryId: spuData.categoryId,
            status: spuData.status,
            tags: spuData.tags || [],
          });

          // 设置图片
          if (spuData.images && spuData.images.length > 0) {
            const uploadFiles = spuData.images.map((image: any, index: number) => ({
              uid: image.id || `-${index}`,
              name: image.alt || `image${index}`,
              status: 'done' as const,
              url: image.url,
              thumbUrl: image.url,
              response: { url: image.url },
            }));
            setFileList(uploadFiles);
          }

          message.success('数据加载成功');
        } else {
          throw new Error(response.message || '加载SPU数据失败');
        }
      } catch (error) {
        console.error('Load SPU data error:', error);
        message.error('加载SPU数据失败');
      } finally {
        setLoading(false);
      }
    },
    [form]
  );

  // 初始化
  useEffect(() => {
    if (mode === 'edit' && spuId) {
      loadSPUData(spuId);
    } else if (initialData) {
      setCurrentData(initialData);
      form.setFieldsValue({
        ...initialData,
        brandId: initialData.brandId,
        categoryId: initialData.categoryId,
        tags: initialData.tags || [],
      });
    }
  }, [mode, spuId, initialData, form, loadSPUData]);

  // 表单变化处理函数
  const handleValuesChange = useCallback(() => {
    // 只要有任何表单值变化，就标记为有变化
    setHasChanges(true);
  }, []);

  // 将文件转换为 base64 URL
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // 处理保存
  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // 验证属性模板
      if (!templateValid) {
        message.error('属性模板验证失败，请检查属性配置');
        return;
      }

      // 处理图片：将本地文件转换为 base64 URL
      const processedImages = await Promise.all(
        fileList
          .filter((file) => file.status === 'done' || file.originFileObj)
          .map(async (file, index) => {
            let url = file.response?.url || file.url;

            // 如果是本地文件（有 originFileObj），转换为 base64
            if (!url && file.originFileObj) {
              url = await fileToBase64(file.originFileObj);
            }

            return {
              uid: file.uid,
              url: url || '',
              alt: file.name || `image${index}`,
              isPrimary: index === 0,
              sort: index,
            };
          })
      );

      // 过滤掉没有 URL 的图片
      const validImages = processedImages.filter((img) => img.url);

      const submitData = {
        ...values,
        attributes: templateAttributes,
        images: validImages,
      };

      let response;
      if (mode === 'create') {
        response = await spuService.createSPU(submitData);
      } else {
        // 更新时需要把 id 包含在 data 中，确保 id 不被覆盖
        const updateId = spuId || currentData?.id;
        if (!updateId) {
          throw new Error('SPU ID不能为空，请刷新页面重试');
        }
        // 构建最终更新对象
        const updatePayload = { ...submitData, id: updateId };
        response = await spuService.updateSPU(updatePayload);
      }

      if (response.success) {
        SPUNotificationService.success(
          mode === 'create' ? '创建' : '更新',
          response.data?.name || 'SPU'
        );
        setHasChanges(false);
        onSave?.(response.data);
      } else {
        throw new Error(response.message || `${mode === 'create' ? '创建' : '更新'}失败`);
      }
    } catch (error) {
      console.error('Save SPU error:', error);
      message.error(`${mode === 'create' ? '创建' : '更新'}SPU失败，请重试`);
    } finally {
      setSubmitting(false);
    }
  }, [form, fileList, mode, spuId, currentData, onSave, templateValid, templateAttributes]);

  // 处理预览
  const handlePreview = useCallback(() => {
    const values = form.getFieldsValue();
    const previewData = {
      ...currentData,
      ...values,
    };
    setPreviewVisible(true);
    console.log('Preview data:', previewData);
  }, [form, currentData]);

  // 处理取消
  const handleCancel = useCallback(() => {
    if (hasChanges) {
      Modal.confirm({
        title: '确认离开',
        icon: <ExclamationCircleOutlined />,
        content: '您有未保存的更改，确定要离开吗？',
        okText: '确定',
        cancelText: '取消',
        onOk: onCancel,
      });
    } else {
      onCancel?.();
    }
  }, [hasChanges, onCancel]);

  // 上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    accept: 'image/*',
    listType: 'picture-card',
    fileList,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('图片大小不能超过5MB');
        return false;
      }
      return false; // 阻止自动上传，仅预览
    },
    onChange: (info) => {
      setFileList(info.fileList);
      setHasChanges(true);
    },
    onRemove: () => {
      setHasChanges(true);
    },
  };

  // 渲染图片上传区域
  const renderImageUpload = () => (
    <Upload {...uploadProps}>
      {fileList.length >= 8 ? null : (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>上传图片</div>
        </div>
      )}
    </Upload>
  );

  // 渲染基础信息表单
  const renderBasicForm = () => (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={handleValuesChange}
      initialValues={{
        status: 'draft',
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="SPU名称"
            rules={[
              { required: true, message: '请输入SPU名称' },
              { max: 100, message: '名称不能超过100个字符' },
            ]}
          >
            <Input placeholder="请输入SPU名称" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="shortName"
            label="简称"
            rules={[{ max: 50, message: '简称不能超过50个字符' }]}
          >
            <Input placeholder="请输入简称（可选）" />
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
            <BrandSelect brands={brands} placeholder="请选择品牌" showSearch allowClear />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="categoryId"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <CategorySelector categories={categories} placeholder="请选择分类" allowClear />
          </Form.Item>
        </Col>
      </Row>

      {/* @spec P008-sku-type-refactor: productType 选择器已移除，SKU 类型由 SKU.skuType 管理 */}
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="unit" label="标准单位">
            <Input placeholder="如：个、箱、件等" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]}>
            <Select placeholder="请选择状态">
              <Option value="draft">草稿</Option>
              <Option value="active">启用</Option>
              <Option value="inactive">停用</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="tags" label="标签">
            <Select
              mode="tags"
              placeholder="请输入标签"
              style={{ width: '100%' }}
              tokenSeparators={[',']}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="description" label="商品描述">
        <TextArea rows={4} placeholder="请输入商品描述信息" showCount maxLength={1000} />
      </Form.Item>
    </Form>
  );

  if (loading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">正在加载数据...</Text>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 页面标题 */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            {mode === 'create' ? '创建SPU' : '编辑SPU'}
          </Title>
          {currentData && (
            <Text type="secondary" style={{ fontSize: '14px' }}>
              当前编辑: {currentData.name} ({currentData.code})
            </Text>
          )}
        </div>

        <Space>
          <Button icon={<EyeOutlined />} onClick={handlePreview}>
            预览
          </Button>
          <Button onClick={handleCancel}>取消</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={submitting || externalLoading}
            onClick={handleSave}
            disabled={!hasChanges || !templateValid}
          >
            {hasChanges ? '保存更改' : '保存'}
          </Button>
        </Space>
      </div>

      {/* 变更提醒 */}
      {hasChanges && (
        <Alert
          message="有未保存的更改"
          description="您对表单进行了修改，请记得保存更改"
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* 表单内容 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
          <TabPane
            tab={
              <span>
                <span>基础信息</span>
              </span>
            }
            key="basic"
          >
            {renderBasicForm()}
          </TabPane>

          <TabPane
            tab={
              <span>
                <span>图片管理</span>
                {fileList.length > 0 && (
                  <Tag size="small" style={{ marginLeft: 8 }}>
                    {fileList.length}
                  </Tag>
                )}
              </span>
            }
            key="images"
          >
            <div style={{ marginTop: 16 }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                支持jpg、png格式，单个文件不超过5MB，最多上传8张图片
              </Text>
              {renderImageUpload()}
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <span>属性模板</span>
                {templateAttributes.length > 0 && (
                  <Tag size="small" style={{ marginLeft: 8 }}>
                    {templateAttributes.length}
                  </Tag>
                )}
                {!templateValid && (
                  <Tag color="error" size="small" style={{ marginLeft: 4 }}>
                    有错误
                  </Tag>
                )}
              </span>
            }
            key="attributes"
          >
            <div style={{ marginTop: 16 }}>
              <SPUAttributeTemplate
                categoryId={form.getFieldValue('categoryId')}
                brandId={form.getFieldValue('brandId')}
                initialValues={currentData?.attributes?.reduce(
                  (acc, attr) => {
                    acc[attr.code] = attr.value;
                    return acc;
                  },
                  {} as Record<string, any>
                )}
                onChange={(attributes) => {
                  setTemplateAttributes(attributes);
                  setHasChanges(true);
                }}
                onValidationChange={(isValid, errors) => {
                  setTemplateValid(isValid);
                  setTemplateErrors(errors);
                }}
                readonly={mode === 'view'}
              />
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* 底部操作按钮 */}
      <div
        style={{
          marginTop: 24,
          padding: '16px 0',
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
        }}
      >
        <Button onClick={handleCancel}>取消</Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={submitting || externalLoading}
          onClick={handleSave}
          disabled={!hasChanges || !templateValid}
        >
          {hasChanges ? '保存更改' : '保存'}
        </Button>
      </div>

      {/* 预览弹窗 */}
      <Modal
        title="SPU预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>,
        ]}
        width={1000}
        style={{ top: 20 }}
      >
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* 这里可以集成SPUDetail组件进行预览 */}
          <Alert
            message="预览功能"
            description="当前显示的是表单数据的预览，实际预览需要集成详情组件"
            type="info"
            showIcon
          />
          <pre style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
            {JSON.stringify(form.getFieldsValue(), null, 2)}
          </pre>
        </div>
      </Modal>
    </div>
  );
};

export default SPUEditForm;
