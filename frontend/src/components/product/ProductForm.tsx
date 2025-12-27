import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Space,
  Row,
  Col,
  Divider,
  Upload,
  message,
  Card,
  Tooltip,
  TreeSelect
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  UploadOutlined,
  DeleteOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Product, ProductStatus, MaterialType } from '../../types/product';
import { useCategories } from '../../hooks/useCategories';
import { useBrands } from '../../hooks/useBrands';
import { useUnits } from '../../hooks/useUnits';

const { TextArea } = Input;
const { Option } = Select;

interface ProductFormProps {
  product?: Product | null;
  mode: 'create' | 'edit' | 'view';
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * 商品表单组件
 */
const ProductForm: React.FC<ProductFormProps> = ({
  product,
  mode,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [imageList, setImageList] = useState<UploadFile[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const { categories, loading: categoriesLoading } = useCategories();
  const { brands, loading: brandsLoading } = useBrands();
  const { units, loading: unitsLoading } = useUnits();

  // 是否为查看模式
  const isViewMode = mode === 'view';

  // 初始化表单数据
  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        name: product.name,
        sku: product.sku,
        categoryId: product.categoryId,
        brandId: product.brandId,
        unitId: product.unitId,
        materialType: product.materialType,
        basePrice: product.basePrice,
        costPrice: product.costPrice,
        currentStock: product.currentStock,
        safetyStock: product.safetyStock,
        barcode: product.barcode,
        description: product.description,
      });

      // 设置图片
      if (product.content?.images) {
        const files = product.content.images.map((url: string, index: number) => ({
          uid: `${index}`,
          name: `image${index + 1}`,
          status: 'done' as const,
          url,
        }));
        setImageList(files);
      }
    } else {
      // 新建时重置表单
      form.resetFields();
      setImageList([]);
    }
  }, [product, form]);

  // 监听表单变化
  const handleFormChange = () => {
    if (!isViewMode) {
      setHasChanges(true);
    }
  };

  // 处理图片上传
  const handleImageUpload = ({ fileList }: { fileList: UploadFile[] }) => {
    setImageList(fileList);
    setHasChanges(true);
  };

  // 处理删除图片
  const handleRemoveImage = (file: UploadFile) => {
    const newImageList = imageList.filter(item => item.uid !== file.uid);
    setImageList(newImageList);
    setHasChanges(true);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 验证数据格式
      const formData = {
        ...values,
        content: {
          ...product?.content,
          images: imageList.map(file => file.url || file.response?.url).filter(Boolean),
        }
      };

      await onSubmit(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 取消操作
  const handleCancel = () => {
    if (hasChanges) {
      // TODO: 添加未保存更改确认对话框
      onCancel();
    } else {
      onCancel();
    }
  };

  // 处理类目变化
  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      // 根据类目自动设置物料类型
      if (category.allowedMaterialTypes.length === 1) {
        form.setFieldValue('materialType', category.allowedMaterialTypes[0]);
      }
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={handleFormChange}
      disabled={isViewMode}
      className="product-form"
    >
      {/* 核心信息 */}
      <Card
        title={
          <div className="flex items-center">
            <span>核心信息</span>
            <Tooltip title="商品的基本信息，带 * 号的为必填项">
              <InfoCircleOutlined className="ml-2 text-gray-400" />
            </Tooltip>
          </div>
        }
        className="mb-4"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="商品名称"
              rules={[
                { required: true, message: '请输入商品名称' },
                { max: 100, message: '商品名称不能超过100个字符' }
              ]}
            >
              <Input placeholder="请输入商品名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="sku"
              label="SKU编码"
              rules={[
                { required: true, message: '请输入SKU编码' },
                { pattern: /^[A-Za-z0-9_-]+$/, message: 'SKU只能包含字母、数字、下划线和横线' }
              ]}
            >
              <Input placeholder="系统将自动生成" disabled={mode === 'edit'} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="categoryId"
              label="商品类目"
              rules={[{ required: true, message: '请选择商品类目' }]}
            >
              <TreeSelect
                placeholder="请选择商品类目"
                treeData={categories.map(cat => ({
                  value: cat.id,
                  title: cat.name,
                  children: cat.children?.map(child => ({
                    value: child.id,
                    title: child.name
                  }))
                }))}
                loading={categoriesLoading}
                onChange={handleCategoryChange}
                showSearch
                treeDefaultExpandAll
                treeLine
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="materialType"
              label="物料类型"
              rules={[{ required: true, message: '请选择物料类型' }]}
            >
              <Select placeholder="请选择物料类型">
                <Option value={MaterialType.FINISHED_GOOD}>成品</Option>
                <Option value={MaterialType.RAW_MATERIAL}>原材料</Option>
                <Option value={MaterialType.CONSUMABLE}>耗材</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="brandId"
              label="品牌"
            >
              <Select
                placeholder="请选择品牌"
                allowClear
                loading={brandsLoading}
                showSearch
                filterOption={(input, option) =>
                  (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {brands.map(brand => (
                  <Option key={brand.id} value={brand.id}>
                    {brand.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="unitId"
              label="单位"
              rules={[{ required: true, message: '请选择单位' }]}
            >
              <Select
                placeholder="请选择单位"
                loading={unitsLoading}
                showSearch
                filterOption={(input, option) =>
                  (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {units.map(unit => (
                  <Option key={unit.id} value={unit.id}>
                    {unit.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="barcode"
              label="条码"
            >
              <Input placeholder="请输入或扫描条码" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="description"
              label="商品描述"
            >
              <TextArea
                rows={2}
                placeholder="请输入商品描述"
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* 价格和库存 */}
      <Card title="价格和库存" className="mb-4">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="basePrice"
              label="基础价 (元)"
              rules={[
                { required: true, message: '请输入基础价' },
                { type: 'number', min: 0, message: '价格不能为负数' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="0.00"
                precision={2}
                min={0}
                formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/¥\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="costPrice"
              label="成本价 (元)"
              rules={[
                { type: 'number', min: 0, message: '价格不能为负数' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="0.00"
                precision={2}
                min={0}
                formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/¥\s?|(,*)/g, '')}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="currentStock"
              label="当前库存"
              rules={[
                { required: true, message: '请输入当前库存' },
                { type: 'number', min: 0, message: '库存不能为负数' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="0"
                min={0}
                precision={0}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="safetyStock"
              label="安全库存"
              rules={[
                { type: 'number', min: 0, message: '安全库存不能为负数' }
              ]}
              tooltip="库存低于此数值时将显示预警"
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="0"
                min={0}
                precision={0}
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* 商品图片 */}
      <Card title="商品图片" className="mb-4">
        <Form.Item name="images">
          <Upload
            listType="picture-card"
            fileList={imageList}
            onChange={handleImageUpload}
            onRemove={handleRemoveImage}
            beforeUpload={() => false} // 阻止自动上传
            maxCount={5}
            accept="image/*"
          >
            {imageList.length < 5 && (
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            )}
          </Upload>
          <div className="text-xs text-gray-500 mt-2">
            最多上传5张图片，支持 JPG、PNG 格式，单张图片不超过 2MB
          </div>
        </Form.Item>
      </Card>

      {/* 操作按钮 */}
      <div className="sticky bottom-0 bg-white border-t pt-4">
        <Space>
          {!isViewMode && (
            <>
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={loading}
                disabled={!hasChanges && !!product}
              >
                {product ? '保存更改' : '创建商品'}
              </Button>

              {product && product.status === ProductStatus.DRAFT && (
                <Button
                  type="default"
                  onClick={() => {
                    // TODO: 实现提交审核功能
                    message.info('提交审核功能开发中');
                  }}
                >
                  提交审核
                </Button>
              )}
            </>
          )}

          <Button onClick={handleCancel}>
            {isViewMode ? '关闭' : '取消'}
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default ProductForm;