import React, { useState, useEffect } from 'react';
import {
  Card,
  Steps,
  Form,
  Button,
  Space,
  message,
  Modal,
  Row,
  Col,
  Spin,
  Alert,
  Typography
} from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import BasicInfoTab from '@/components/product/ProductForm/BasicInfoTab';
import ContentTab from '@/components/product/ProductForm/ContentTab';
import SpecsTab from '@/components/product/ProductForm/SpecsTab';
import BomTab from '@/components/product/ProductForm/BomTab';
import ChannelOverrideTab from '@/components/product/ProductForm/ChannelOverrideTab';

import {
  ProductFormSchema,
  ProductFormData,
  FormStep,
  FormStepConfig,
  ProductFormInput
} from '@/types/product';
import { useAppActions } from '@/stores/appStore';
import { useProductsQuery, useCreateProductMutation, useUpdateProductMutation } from '@/stores/productStore';

const { Title, Text } = Typography;
const { Step } = Steps;

interface ProductFormProps {
  productId?: string;
  mode?: 'create' | 'edit';
}

const ProductForm: React.FC<ProductFormProps> = ({
  productId,
  mode = 'create'
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { setBreadcrumbs } = useAppActions();
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.BASIC_INFO);
  const [saving, setSaving] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const { data: product, isLoading } = useProductsQuery({
    page: 1,
    pageSize: 1,
    ...(productId && { skuId: productId })
  });

  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(ProductFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      shortTitle: '',
      description: '',
      categoryId: '',
      materialType: 'raw_material',
      basePrice: 0,
      barcode: '',
      unit: '',
      brand: '',
      weight: undefined,
      volume: undefined,
      shelfLife: undefined,
      storageCondition: '',
      status: 'draft',
      content: {
        title: '',
        subtitle: '',
        description: '',
        images: []
      },
      specifications: [],
      channelOverrides: []
    }
  });

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, touched, isValid },
    trigger
  } = form;

  // 步骤配置
  const steps: FormStepConfig[] = [
    {
      key: FormStep.BASIC_INFO,
      title: t('product.basicInfo'),
      description: '填写商品基础信息',
      required: true,
      completed: false,
      valid: false
    },
    {
      key: FormStep.CONTENT,
      title: t('product.content'),
      description: '管理商品展示内容',
      required: true,
      completed: false,
      valid: false
    },
    {
      key: FormStep.SPECS,
      title: t('product.specs'),
      description: '配置商品规格属性',
      required: false,
      completed: false,
      valid: true
    },
    {
      key: FormStep.BOM,
      title: t('product.bom'),
      description: '配置BOM配方（仅成品）',
      required: false,
      completed: false,
      valid: true
    },
    {
      key: FormStep.CHANNEL_OVERRIDE,
      title: t('product.channelOverride'),
      description: '设置渠道特定内容',
      required: false,
      completed: false,
      valid: true
    }
  ];

  // 设置面包屑
  useEffect(() => {
    const breadcrumbItems = [
      { title: t('menu.product') },
      { title: mode === 'create' ? t('product.create') : t('product.edit') }
    ];
    setBreadcrumbs(breadcrumbItems);
  }, [mode, setBreadcrumbs, t]);

  // 编辑模式加载商品数据
  useEffect(() => {
    if (mode === 'edit' && product && product.length > 0) {
      const productData = product[0];
      Object.keys(productData).forEach(key => {
        if (key in getValues()) {
          setValue(key as keyof ProductFormData, productData[key as any]);
        }
      });
    }
  }, [mode, product, setValue, getValues]);

  // 监听表单变化
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      setIsDirty(true);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // 验证当前步骤
  const validateCurrentStep = async (): Promise<boolean> => {
    const currentStepConfig = steps.find(step => step.key === currentStep);

    switch (currentStep) {
      case FormStep.BASIC_INFO:
        return await trigger(['name', 'categoryId', 'materialType', 'basePrice']);
      case FormStep.CONTENT:
        return await trigger(['content']);
      case FormStep.BOM:
        if (getValues('materialType') === 'finished_goods') {
          return await trigger(['bom']);
        }
        return true;
      default:
        return true;
    }
  };

  // 下一步
  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) {
      message.error('请完善当前步骤的必填信息');
      return;
    }

    const currentIndex = steps.findIndex(step => step.key === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].key);
    }
  };

  // 上一步
  const handlePrevious = () => {
    const currentIndex = steps.findIndex(step => step.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key);
    }
  };

  // 保存表单
  const handleSave = async () => {
    try {
      setSaving(true);

      // 验证所有字段
      const isValid = await trigger();
      if (!isValid) {
        message.error('请完善所有必填信息');
        return;
      }

      const formData = getValues();

      if (mode === 'create') {
        await createMutation.mutateAsync(formData);
        message.success('商品创建成功');
      } else {
        await updateMutation.mutateAsync({
          id: productId!,
          ...formData
        });
        message.success('商品更新成功');
      }

      setIsDirty(false);
      navigate('/product');
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 取消编辑
  const handleCancel = () => {
    if (isDirty) {
      Modal.confirm({
        title: '确认离开',
        icon: <ExclamationCircleOutlined />,
        content: '您有未保存的更改，确定要离开吗？',
        okText: '离开',
        cancelText: '继续编辑',
        onOk: () => navigate('/product')
      });
    } else {
      navigate('/product');
    }
  };

  // 预览商品
  const handlePreview = () => {
    setPreviewVisible(true);
  };

  // 渲染当前步骤内容
  const renderStepContent = () => {
    switch (currentStep) {
      case FormStep.BASIC_INFO:
        return (
          <BasicInfoTab
            control={control}
            errors={errors}
            touched={touched}
            materialType={form.watch('materialType')}
            setValue={setValue}
          />
        );
      case FormStep.CONTENT:
        return (
          <ContentTab
            control={control}
            errors={errors}
            touched={touched}
          />
        );
      case FormStep.SPECS:
        return (
          <SpecsTab
            control={control}
            errors={errors}
            touched={touched}
          />
        );
      case FormStep.BOM:
        return (
          <BomTab
            control={control}
            errors={errors}
            touched={touched}
            materialType={form.watch('materialType')}
            setValue={setValue}
            getValues={getValues}
          />
        );
      case FormStep.CHANNEL_OVERRIDE:
        return (
          <ChannelOverrideTab
            control={control}
            errors={errors}
            touched={touched}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading && mode === 'edit') {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <div className="loading-text">加载商品数据中...</div>
      </div>
    );
  }

  return (
    <div className="product-form" data-testid="product-form">
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleCancel}
            data-testid="cancel-button"
          >
            返回
          </Button>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Space>
            <Button
              icon={<EyeOutlined />}
              onClick={handlePreview}
            >
              预览
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit(handleSave)}
              loading={saving}
              disabled={!isDirty}
              data-testid="save-button"
            >
              {mode === 'create' ? '创建商品' : '保存更改'}
            </Button>
          </Space>
        </Col>
      </Row>

      <Card>
        <Title level={3}>
          {mode === 'create' ? t('product.create') : t('product.edit')}
        </Title>

        <Form
          layout="vertical"
          onSubmit={handleSubmit(handleSave)}
        >
          {/* 步骤指示器 */}
          <Steps
            current={steps.findIndex(step => step.key === currentStep)}
            items={steps.map((step, index) => ({
              title: step.title,
              description: step.description,
              icon: step.completed ? <CheckCircleOutlined /> : undefined,
              status: step.completed ? 'finish' :
                     currentStep === step.key ? 'process' : 'wait'
            }))}
            style={{ marginBottom: 32 }}
            data-testid="product-tabs"
          />

          {/* 表单内容 */}
          <div style={{ minHeight: 400 }}>
            <div
              data-testid="basic-info-tab"
              style={{ display: currentStep === FormStep.BASIC_INFO ? 'block' : 'none' }}
            >
              {currentStep === FormStep.BASIC_INFO && renderStepContent()}
            </div>
            <div
              data-testid="content-tab"
              style={{ display: currentStep === FormStep.CONTENT ? 'block' : 'none' }}
            >
              {currentStep === FormStep.CONTENT && renderStepContent()}
            </div>
            <div
              data-testid="specs-tab"
              style={{ display: currentStep === FormStep.SPECS ? 'block' : 'none' }}
            >
              {currentStep === FormStep.SPECS && renderStepContent()}
            </div>
            <div
              data-testid="bom-tab"
              style={{ display: currentStep === FormStep.BOM ? 'block' : 'none' }}
            >
              {currentStep === FormStep.BOM && renderStepContent()}
            </div>
          </div>

          {/* 步骤操作按钮 */}
          <Row justify="space-between" style={{ marginTop: 32 }}>
            <Col>
              {currentStep !== steps[0].key && (
                <Button onClick={handlePrevious}>
                  上一步
                </Button>
              )}
            </Col>
            <Col>
              <Space>
                {currentStep !== steps[steps.length - 1].key && (
                  <Button
                    type="primary"
                    onClick={handleNext}
                  >
                    下一步
                  </Button>
                )}
                {currentStep === steps[steps.length - 1].key && (
                  <Button
                    type="primary"
                    onClick={handleSubmit(handleSave)}
                    loading={saving}
                  >
                    {mode === 'create' ? '创建商品' : '保存更改'}
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 预览模态框 */}
      <Modal
        title="商品预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        <div>
          {/* 这里可以添加商品预览内容 */}
          <Text>商品预览功能开发中...</Text>
        </div>
      </Modal>
    </div>
  );
};

export default ProductForm;