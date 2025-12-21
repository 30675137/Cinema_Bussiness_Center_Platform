import React, { useState, useEffect, useCallback } from 'react';
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
  Typography,
  Radio,
  Divider
} from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LeftOutlined,
  RightOutlined
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
  ProductFormSchema
} from '../../../types/product';
import { FormStep } from '../../../types/product';
import { ProductStatus } from '../../../types/index';

// 临时内联定义需要的类型以解决导入问题
interface FormStepConfig {
  key: FormStep;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  valid: boolean;
}

interface ProductFormData {
  // 基础信息
  name: string;
  shortTitle?: string;
  description?: string;
  categoryId: string;
  materialType: any;
  basePrice: number;
  barcode?: string;
  unit?: string;
  brand?: string;
  weight?: number;
  volume?: number;
  shelfLife?: number;
  storageCondition?: string;

  // 内容管理
  content: any;

  // 规格属性
  specifications: any[];

  // BOM配方（仅成品）
  bom?: any;

  // 渠道覆写
  channelOverrides?: any[];

  // 状态
  status: any;
}
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
  const [stepUpdateKey, setStepUpdateKey] = useState(0); // 用于强制更新步骤状态

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
      status: ProductStatus.DRAFT,
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
    setValue: formSetValue,
    getValues,
    formState: { errors, touched, isValid },
    trigger
  } = form;

  // 使用 useCallback 包装 setValue 以确保正确的 this 上下文
  const setValue = useCallback((name: string, value: any, options?: any) => {
    form.setValue(name as any, value, options);
  }, [form]);

  // 检查步骤是否有错误
  const checkStepErrors = useCallback((stepKey: FormStep): boolean => {
    const currentErrors = form.formState.errors;
    
    switch (stepKey) {
      case FormStep.BASIC_INFO:
        return !!(currentErrors.name || currentErrors.categoryId || currentErrors.materialType || currentErrors.basePrice);
      case FormStep.CONTENT:
        return !!currentErrors.content;
      case FormStep.SPECS:
        return !!currentErrors.specifications;
      case FormStep.BOM:
        return !!currentErrors.bom;
      case FormStep.CHANNEL_OVERRIDE:
        return !!currentErrors.channelOverrides;
      default:
        return false;
    }
  }, [form.formState.errors]);

  // 检查步骤是否完成
  const checkStepCompleted = useCallback((stepKey: FormStep): boolean => {
    const values = getValues();
    
    switch (stepKey) {
      case FormStep.BASIC_INFO:
        return !!(values.name && values.categoryId && values.materialType && values.basePrice);
      case FormStep.CONTENT:
        return !!(values.content?.title);
      case FormStep.SPECS:
        return true; // 可选步骤，只要有值就算完成
      case FormStep.BOM:
        if (values.materialType === 'finished_goods') {
          return !!(values.bom && Array.isArray(values.bom) && values.bom.length > 0);
        }
        return true; // 非成品不需要BOM
      case FormStep.CHANNEL_OVERRIDE:
        return true; // 可选步骤
      default:
        return false;
    }
  }, [getValues]);

  // 步骤配置（动态计算状态）
  const steps: FormStepConfig[] = [
    {
      key: FormStep.BASIC_INFO,
      title: '基础信息',
      description: '填写商品基础信息',
      required: true,
      completed: checkStepCompleted(FormStep.BASIC_INFO),
      valid: !checkStepErrors(FormStep.BASIC_INFO)
    },
    {
      key: FormStep.CONTENT,
      title: '内容管理',
      description: '管理商品展示内容',
      required: true,
      completed: checkStepCompleted(FormStep.CONTENT),
      valid: !checkStepErrors(FormStep.CONTENT)
    },
    {
      key: FormStep.SPECS,
      title: '规格属性',
      description: '配置商品规格属性',
      required: false,
      completed: checkStepCompleted(FormStep.SPECS),
      valid: !checkStepErrors(FormStep.SPECS)
    },
    {
      key: FormStep.BOM,
      title: 'BOM配方',
      description: '配置BOM配方（仅成品）',
      required: false,
      completed: checkStepCompleted(FormStep.BOM),
      valid: !checkStepErrors(FormStep.BOM)
    },
    {
      key: FormStep.CHANNEL_OVERRIDE,
      title: '渠道覆写',
      description: '设置渠道特定内容',
      required: false,
      completed: checkStepCompleted(FormStep.CHANNEL_OVERRIDE),
      valid: !checkStepErrors(FormStep.CHANNEL_OVERRIDE)
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
      // 更新步骤状态显示
      setStepUpdateKey(prev => prev + 1);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // 获取字段的中文名称映射
  const getFieldLabel = (fieldName: string): string => {
    const fieldLabels: Record<string, string> = {
      name: '商品名称',
      categoryId: '商品类目',
      materialType: '物料类型',
      basePrice: '基础价格',
      content: '商品内容',
      'content.title': '展示标题',
      'content.subtitle': '副标题',
      'content.description': '详细描述',
      bom: '物料清单(BOM)',
      barcode: '条形码',
      brand: '品牌',
      unit: '单位',
      weight: '重量',
      volume: '体积',
      shelfLife: '保质期',
      storageCondition: '储存条件',
    };
    return fieldLabels[fieldName] || fieldName;
  };

  // 滚动并聚焦到指定字段
  const scrollToField = (fieldName: string) => {
    // 延迟执行，确保 DOM 已更新和错误消息已显示
    setTimeout(() => {
      // 尝试多种方式查找字段元素
      const fieldId = `field-${fieldName.replace(/\./g, '-')}`;
      let element: HTMLElement | null = null;
      let formItem: HTMLElement | null = null;

      // 方法1: 通过 id 查找
      element = document.getElementById(fieldId);
      if (element) {
        formItem = element.closest('.ant-form-item') as HTMLElement;
      }
      
      // 方法2: 通过 name 属性查找（react-hook-form 会设置 name）
      if (!element) {
        const input = document.querySelector(`input[name="${fieldName}"], textarea[name="${fieldName}"]`) as HTMLElement;
        if (input) {
          element = input;
          formItem = input.closest('.ant-form-item') as HTMLElement;
        }
      }

      // 方法3: 通过 Form.Item 的标签查找（更可靠）
      if (!element) {
        const label = getFieldLabel(fieldName);
        const formItems = document.querySelectorAll('.ant-form-item');
        formItems.forEach((item) => {
          const labelElement = item.querySelector('.ant-form-item-label label');
          if (labelElement && labelElement.textContent?.trim() === label) {
            formItem = item as HTMLElement;
            // 查找输入元素
            const input = item.querySelector('input, textarea, .ant-input-number-input, .ant-select-selector') as HTMLElement;
            if (input) {
              element = input;
            }
          }
        });
      }

      // 如果找到 Form.Item，滚动到它
      if (formItem) {
        formItem.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
        
        // 添加高亮效果
        formItem.style.transition = 'box-shadow 0.3s ease';
        formItem.style.boxShadow = '0 0 0 2px rgba(255, 77, 79, 0.2)';
        setTimeout(() => {
          if (formItem) {
            formItem.style.boxShadow = '';
          }
        }, 2000);
      }

      // 聚焦到输入元素
      if (element) {
        // 对于 InputNumber，需要找到内部的 input
        if (element.classList.contains('ant-input-number-input')) {
          const input = element.querySelector('input') as HTMLInputElement;
          if (input) {
            setTimeout(() => input.focus(), 100);
          }
        } else if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          setTimeout(() => (element as HTMLInputElement).focus(), 100);
        } else if (element.classList.contains('ant-select-selector')) {
          // 对于 Select，点击触发器
          const select = element.closest('.ant-select');
          if (select) {
            setTimeout(() => (select as HTMLElement).click(), 100);
          }
        }
      }
    }, 300); // 延迟 300ms，确保错误消息已显示且 DOM 已更新
  };

  // 获取验证失败的字段列表（从 errors 对象中）
  const getFailedFields = (fields: string[]): string[] => {
    const failedFields: string[] = [];
    fields.forEach(field => {
      // 检查字段是否有错误，支持嵌套字段（如 content.title）
      const fieldError = errors[field];
      if (fieldError) {
        failedFields.push(getFieldLabel(field));
      }
    });
    return failedFields;
  };

  // 验证当前步骤并返回失败的字段
  const validateCurrentStep = async (): Promise<{ isValid: boolean; failedFields: string[] }> => {
    let fieldsToCheck: string[] = [];
    
    switch (currentStep) {
      case FormStep.BASIC_INFO:
        fieldsToCheck = ['name', 'categoryId', 'materialType', 'basePrice'];
        break;
      case FormStep.CONTENT:
        fieldsToCheck = ['content'];
        break;
      case FormStep.BOM:
        if (getValues('materialType') === 'finished_goods') {
          fieldsToCheck = ['bom'];
        }
        break;
      default:
        return { isValid: true, failedFields: [] };
    }

    const isValid = await trigger(fieldsToCheck);
    
    // trigger 会同步更新 errors，但为了确保获取最新的错误状态，
    // 我们使用 formState 来获取最新的错误信息
    const currentErrors = form.formState.errors;
    const failedFields = fieldsToCheck
      .filter(field => {
        // 检查字段是否有错误
        const fieldError = currentErrors[field as keyof typeof currentErrors];
        return !!fieldError;
      })
      .map(field => getFieldLabel(field));
    
    return { isValid, failedFields };
  };

  // 下一步
  const handleNext = async () => {
    const { isValid, failedFields } = await validateCurrentStep();
    if (!isValid) {
      const currentStepName = steps.find(step => step.key === currentStep)?.title || '当前步骤';
      
      // 获取第一个失败的字段名（用于跳转）
      let firstFailedField: string | null = null;
      switch (currentStep) {
        case FormStep.BASIC_INFO:
          const basicFields = ['name', 'categoryId', 'materialType', 'basePrice'];
          firstFailedField = basicFields.find(field => {
            const fieldError = form.formState.errors[field as keyof typeof form.formState.errors];
            return !!fieldError;
          }) || null;
          break;
        case FormStep.CONTENT:
          // 检查 content 相关字段
          const contentError = form.formState.errors.content;
          if (contentError) {
            // 优先检查 content.title
            if ((contentError as any)?.title) {
              firstFailedField = 'content.title';
            } else if ((contentError as any)?.subtitle) {
              firstFailedField = 'content.subtitle';
            } else if ((contentError as any)?.description) {
              firstFailedField = 'content.description';
            } else {
              firstFailedField = 'content';
            }
          }
          break;
        case FormStep.BOM:
          if (getValues('materialType') === 'finished_goods') {
            firstFailedField = 'bom';
          }
          break;
      }
      
      if (failedFields.length > 0) {
        message.error({
          content: `请完善${currentStepName}的必填信息：${failedFields.join('、')}`,
          duration: 5,
        });
        
        // 自动跳转到第一个失败的字段
        if (firstFailedField) {
          scrollToField(firstFailedField);
        }
      } else {
        message.error(`请完善${currentStepName}的必填信息`);
      }
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

  // 切换到指定步骤（带验证）
  const handleStepChange = async (targetStep: FormStep) => {
    const currentIndex = steps.findIndex(step => step.key === currentStep);
    const targetIndex = steps.findIndex(step => step.key === targetStep);
    
    // 如果向后跳转，需要先验证当前步骤
    if (targetIndex > currentIndex) {
      const { isValid } = await validateCurrentStep();
      if (!isValid) {
        // 验证失败，不切换步骤
        return;
      }
    }
    
    // 切换步骤
    setCurrentStep(targetStep);
  };

  // 查找第一个有错误的步骤
  const findFirstErrorStep = useCallback((): FormStep | null => {
    const stepOrder = [
      FormStep.BASIC_INFO,
      FormStep.CONTENT,
      FormStep.SPECS,
      FormStep.BOM,
      FormStep.CHANNEL_OVERRIDE
    ];
    
    for (const stepKey of stepOrder) {
      if (checkStepErrors(stepKey)) {
        return stepKey;
      }
    }
    return null;
  }, [checkStepErrors]);

  // 保存表单
  const handleSave = async () => {
    try {
      setSaving(true);

      // 验证所有字段
      const isValid = await trigger();
      if (!isValid) {
        // 获取最新的错误状态
        const currentErrors = form.formState.errors;
        // 收集所有验证失败的字段
        const allFailedFields = Object.keys(currentErrors)
          .filter(field => {
            const fieldError = currentErrors[field as keyof typeof currentErrors];
            return !!fieldError;
          })
          .map(field => getFieldLabel(field));
        
        // 查找第一个有错误的步骤并自动切换
        const firstErrorStep = findFirstErrorStep();
        if (firstErrorStep && firstErrorStep !== currentStep) {
          setCurrentStep(firstErrorStep);
          // 等待步骤切换完成后再滚动
          setTimeout(() => {
            // 获取第一个失败的字段名（用于跳转）
            const firstFailedFieldName = Object.keys(currentErrors).find(field => {
              const fieldError = currentErrors[field as keyof typeof currentErrors];
              return !!fieldError;
            });
            if (firstFailedFieldName) {
              scrollToField(firstFailedFieldName);
            }
          }, 100);
        } else {
          // 获取第一个失败的字段名（用于跳转）
          const firstFailedFieldName = Object.keys(currentErrors).find(field => {
            const fieldError = currentErrors[field as keyof typeof currentErrors];
            return !!fieldError;
          });
          if (firstFailedFieldName) {
            scrollToField(firstFailedFieldName);
          }
        }
        
        if (allFailedFields.length > 0) {
          // 显示前5个失败的字段，避免消息过长
          const displayFields = allFailedFields.slice(0, 5);
          const moreCount = allFailedFields.length > 5 ? `等${allFailedFields.length}个字段` : '';
          const stepName = firstErrorStep ? steps.find(s => s.key === firstErrorStep)?.title : '';
          const errorMessage = firstErrorStep && firstErrorStep !== currentStep
            ? `已自动切换到"${stepName}"步骤，请完善以下必填信息：${displayFields.join('、')}${moreCount}`
            : `请完善以下必填信息：${displayFields.join('、')}${moreCount}`;
          
          message.error({
            content: errorMessage,
            duration: 6,
          });
        } else {
          message.error('请完善所有必填信息');
        }
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

  const statusValue = form.watch('status') || ProductStatus.DRAFT;

  return (
    <div className="product-form" data-testid="product-form" style={{ padding: 8 }}>
      <Card>
        <Title level={3} style={{ marginBottom: 8 }}>
          {mode === 'create' ? t('product.create') : t('product.edit')}
        </Title>

        <Form
          layout="vertical"
          onSubmit={handleSubmit(handleSave)}
        >
          {/* 顶部区域：步骤导航 + 状态设置 + 操作按钮 */}
          <div style={{ marginBottom: 8 }}>
            {/* 步骤导航 */}
            <Steps
              current={steps.findIndex(step => step.key === currentStep)}
              items={steps.map((step, index) => {
                let stepStatus: 'wait' | 'process' | 'finish' | 'error' = 'wait';
                
                if (step.completed) {
                  stepStatus = 'finish';
                } else if (currentStep === step.key) {
                  stepStatus = step.valid ? 'process' : 'error';
                } else if (!step.valid) {
                  stepStatus = 'error';
                }
                
                return {
                  title: (
                    <span 
                      style={{ 
                        cursor: 'pointer',
                        color: stepStatus === 'error' ? '#ff4d4f' : undefined
                      }}
                      onClick={() => handleStepChange(step.key)}
                    >
                      {step.title}
                      {step.required && <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>}
                    </span>
                  ),
                  description: (
                    <span 
                      style={{ 
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: stepStatus === 'error' ? '#ff4d4f' : undefined
                      }}
                      onClick={() => handleStepChange(step.key)}
                    >
                      {step.description}
                      {stepStatus === 'error' && ' (有错误)'}
                    </span>
                  ),
                  icon: step.completed ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
                         stepStatus === 'error' ? <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} /> : undefined,
                  status: stepStatus
                };
              })}
              style={{ marginBottom: 8 }}
              data-testid="product-form-steps"
            />

            {/* 状态设置区域（步骤导航下方、内容区域上方） */}
            <Card size="small" style={{ marginBottom: 8, backgroundColor: '#fafafa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontWeight: 500 }}>状态设置：</span>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Radio.Group
                      {...field}
                      value={statusValue}
                      onChange={(e) => {
                        field.onChange(e);
                        setIsDirty(true);
                      }}
                      data-testid="product-form-status-radio"
                    >
                      <Radio value={ProductStatus.DRAFT} data-testid="product-form-status-draft">草稿</Radio>
                      <Radio value={ProductStatus.PENDING_REVIEW} data-testid="product-form-status-pending">待审核</Radio>
                      <Radio value={ProductStatus.APPROVED} data-testid="product-form-status-approved">已审核</Radio>
                      <Radio value={ProductStatus.PUBLISHED} data-testid="product-form-status-published">已发布</Radio>
                      <Radio value={ProductStatus.DISABLED} data-testid="product-form-status-disabled">已禁用</Radio>
                    </Radio.Group>
                  )}
                />
                {errors.status && (
                  <span style={{ color: '#ff4d4f', fontSize: 12 }}>
                    {errors.status.message as string}
                  </span>
                )}
              </div>
            </Card>

            {/* 操作按钮区 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Space>
                <Button
                  icon={<LeftOutlined />}
                  onClick={handlePrevious}
                  disabled={currentStep === steps[0].key}
                  data-testid="product-form-previous-button"
                >
                  上一步
                </Button>
                <Button
                  icon={<RightOutlined />}
                  onClick={handleNext}
                  disabled={currentStep === steps[steps.length - 1].key}
                  data-testid="product-form-next-button"
                >
                  下一步
                </Button>
              </Space>
              <Space>
                <Button
                  icon={<EyeOutlined />}
                  onClick={handlePreview}
                  data-testid="product-form-preview-button"
                >
                  预览
                </Button>
                <Button
                  onClick={handleCancel}
                  icon={<CloseOutlined />}
                  disabled={saving}
                  data-testid="product-form-cancel-button"
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  onClick={handleSubmit(handleSave)}
                  loading={saving}
                  icon={<SaveOutlined />}
                  data-testid="product-form-submit-button"
                >
                  {mode === 'create' ? '创建商品' : '保存更改'}
                </Button>
              </Space>
            </div>
          </div>

          <Divider />

          {/* 底部区域：内容录入区 */}
          <div style={{ minHeight: 133 }}>
            {currentStep === FormStep.BASIC_INFO && (
              <div data-testid="basic-info-tab">
                {renderStepContent()}
              </div>
            )}
            {currentStep === FormStep.CONTENT && (
              <div data-testid="content-tab">
                {renderStepContent()}
              </div>
            )}
            {currentStep === FormStep.SPECS && (
              <div data-testid="specs-tab">
                {renderStepContent()}
              </div>
            )}
            {currentStep === FormStep.BOM && (
              <div data-testid="bom-tab">
                {renderStepContent()}
              </div>
            )}
            {currentStep === FormStep.CHANNEL_OVERRIDE && (
              <div data-testid="channel-override-tab">
                {renderStepContent()}
              </div>
            )}
          </div>
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