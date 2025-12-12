/**
 * SKU表单组件（重构版）
 * 使用 Steps 导航和 React Hook Form + Zod 验证
 * 实现上下分离布局：顶部为步骤导航和操作按钮区，底部为内容录入区
 * 状态字段统一放在页面顶部（步骤导航下方、内容区域上方）
 */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Drawer, Steps, Button, Space, message, Modal, Spin, Alert, Radio, Card, Divider } from 'antd';
import { 
  SaveOutlined, 
  CloseOutlined, 
  ReloadOutlined,
  LeftOutlined,
  RightOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { showError, showSuccess } from '@/utils/errorHandler';
import { SkuFormData, SKU, SkuStatus } from '@/types/sku';
import { useSkuStore } from '@/stores/skuStore';
import {
  useCreateSkuMutation,
  useUpdateSkuMutation,
  useSkuQuery,
  useSpusQuery,
} from '@/hooks/useSku';
import { skuService } from '@/services/skuService';
import { BasicInfoTab } from './BasicInfoTab';
import { UnitBarcodeTab } from './UnitBarcodeTab';
import { SpecAttrTab } from './SpecAttrTab';
import { OtherConfigTab } from './OtherConfigTab';

const { Step } = Steps;

/**
 * 表单步骤枚举
 */
enum FormStep {
  BASIC_INFO = 0,      // 基础信息
  UNIT_BARCODE = 1,    // 单位条码
  SPEC_ATTR = 2,       // 规格属性
  OTHER_CONFIG = 3,    // 其他配置
}

/**
 * 步骤配置
 */
const steps = [
  {
    title: '基础信息',
    description: 'SPU、名称等',
    key: FormStep.BASIC_INFO,
    required: true,
  },
  {
    title: '单位条码',
    description: '单位、条码配置',
    key: FormStep.UNIT_BARCODE,
    required: true,
  },
  {
    title: '规格属性',
    description: '规格、口味等',
    key: FormStep.SPEC_ATTR,
    required: false,
  },
  {
    title: '其他配置',
    description: '库存、状态等',
    key: FormStep.OTHER_CONFIG,
    required: false,
  },
];

/**
 * Zod 验证 Schema
 */
const salesUnitSchema = z.object({
  unitId: z.string().min(1, '请选择销售单位'),
  conversionRate: z.number().min(0.01, '换算关系必须大于0'),
  enabled: z.boolean().optional().default(true),
});

const barcodeSchema = z.object({
  code: z.string().min(1, '请输入条码'),
  remark: z.string().optional(),
});

const skuFormSchema = z.object({
  // 基础信息
  spuId: z.string().min(1, '请选择所属SPU'),
  name: z.string().min(1, '请输入SKU名称').max(200, 'SKU名称不能超过200个字符'),
  code: z.string().optional(),
  
  // 规格属性
  spec: z.string().max(200, '规格不能超过200个字符').optional(),
  flavor: z.string().optional(),
  packaging: z.string().optional(),
  
  // 单位配置
  mainUnitId: z.string().min(1, '请选择主库存单位'),
  salesUnits: z.array(salesUnitSchema).optional().default([]),
  
  // 条码信息
  mainBarcode: z.string().min(1, '请输入主条码'),
  otherBarcodes: z.array(barcodeSchema).optional().default([]),
  
  // 库存配置
  manageInventory: z.boolean().optional().default(true),
  allowNegativeStock: z.boolean().optional().default(false),
  minOrderQty: z.number().min(0).optional(),
  minSaleQty: z.number().min(0).optional(),
  
  // 状态
  status: z.nativeEnum(SkuStatus).optional().default(SkuStatus.DRAFT),
});

type SkuFormValues = z.infer<typeof skuFormSchema>;

interface SkuFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  skuId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * SKU表单组件
 */
export const SkuForm: React.FC<SkuFormProps> = ({
  open,
  mode,
  skuId,
  onClose,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.BASIC_INFO);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [stepUpdateKey, setStepUpdateKey] = useState(0);
  const { closeFormDrawer } = useSkuStore();

  // React Hook Form
  const form = useForm<SkuFormValues>({
    resolver: zodResolver(skuFormSchema),
    defaultValues: {
      status: SkuStatus.DRAFT,
      manageInventory: true,
      allowNegativeStock: false,
      salesUnits: [],
      otherBarcodes: [],
    },
    mode: 'onChange',
  });

  const { control, handleSubmit, formState: { errors }, watch, setValue, getValues, trigger, reset } = form;

  // 获取SKU详情（编辑模式）
  const { data: skuData, isLoading: loadingSku, error: skuError } = useSkuQuery(
    mode === 'edit' ? skuId || null : null,
    mode === 'edit' && open
  );

  // 获取SPU列表
  const { data: spus = [] } = useSpusQuery();

  // 创建和更新Mutation
  const createMutation = useCreateSkuMutation();
  const updateMutation = useUpdateSkuMutation();

  // 监听表单变化
  useEffect(() => {
    if (open) {
      const subscription = watch(() => {
        setHasUnsavedChanges(true);
      });
      return () => subscription.unsubscribe();
    }
  }, [open, watch]);

  // 初始化表单数据
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && skuData) {
        // 编辑模式：填充现有数据
        const formData: Partial<SkuFormValues> = {
          spuId: skuData.spuId,
          name: skuData.name,
          code: skuData.code,
          spec: skuData.spec,
          flavor: skuData.flavor,
          packaging: skuData.packaging,
          mainUnitId: skuData.mainUnitId,
          salesUnits: skuData.salesUnits.map((su) => ({
            unitId: su.unitId,
            conversionRate: su.conversionRate,
            enabled: su.enabled,
          })),
          mainBarcode: skuData.mainBarcode,
          otherBarcodes: skuData.otherBarcodes.map((b) => ({
            code: b.code,
            remark: b.remark,
          })),
          manageInventory: skuData.manageInventory,
          allowNegativeStock: skuData.allowNegativeStock,
          minOrderQty: skuData.minOrderQty,
          minSaleQty: skuData.minSaleQty,
          status: skuData.status,
        };
        reset(formData);
        setHasUnsavedChanges(false);
      } else {
        // 创建模式：重置表单
        reset({
          status: SkuStatus.DRAFT,
          manageInventory: true,
          allowNegativeStock: false,
          salesUnits: [],
          otherBarcodes: [],
        });
        setHasUnsavedChanges(false);
        setCurrentStep(FormStep.BASIC_INFO);
      }
    }
  }, [open, mode, skuData, reset]);

  // 获取字段标签
  const getFieldLabel = (fieldName: string): string => {
    const fieldLabels: Record<string, string> = {
      spuId: '所属SPU',
      name: 'SKU名称',
      mainUnitId: '主库存单位',
      mainBarcode: '主条码',
      spec: '规格/型号',
      flavor: '口味',
      packaging: '包装形式',
      manageInventory: '是否管理库存',
      allowNegativeStock: '是否允许负库存',
      minOrderQty: '最小起订量',
      minSaleQty: '最小销售量',
      status: '状态',
    };
    return fieldLabels[fieldName] || fieldName;
  };

  // 滚动到字段
  const scrollToField = useCallback((fieldName: string) => {
    setTimeout(() => {
      let element: HTMLElement | null = null;
      // 尝试通过 id 查找
      element = document.getElementById(`field-${fieldName}`);
      // 如果没有 id，尝试通过 name 属性查找
      if (!element) {
        element = document.querySelector(`[name="${fieldName}"]`);
      }
      // 如果是嵌套字段，尝试查找父级
      if (!element && fieldName.includes('.')) {
        const parentField = fieldName.split('.')[0];
        element = document.getElementById(`field-${parentField}`);
      }

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // 尝试聚焦到输入框
        const inputElement = element.querySelector('input, textarea, select') as HTMLElement;
        if (inputElement) {
          inputElement.focus();
        }
        // 添加高亮效果
        element.style.transition = 'box-shadow 0.3s ease-in-out';
        element.style.boxShadow = '0 0 0 2px rgba(255, 0, 0, 0.2)';
        setTimeout(() => {
          if (element) {
            element.style.boxShadow = '';
          }
        }, 2000);
      }
    }, 300);
  }, []);

  // 验证当前步骤
  const validateCurrentStep = useCallback(async (): Promise<{ 
    isValid: boolean; 
    failedFields: string[]; 
    firstFailedFieldName: string | null 
  }> => {
    let fieldsToCheck: string[] = [];
    switch (currentStep) {
      case FormStep.BASIC_INFO:
        fieldsToCheck = ['spuId', 'name'];
        break;
      case FormStep.UNIT_BARCODE:
        fieldsToCheck = ['mainUnitId', 'mainBarcode'];
        break;
      case FormStep.SPEC_ATTR:
        // 规格属性为可选，不需要验证
        return { isValid: true, failedFields: [], firstFailedFieldName: null };
      case FormStep.OTHER_CONFIG:
        // 其他配置为可选，不需要验证
        return { isValid: true, failedFields: [], firstFailedFieldName: null };
      default:
        return { isValid: true, failedFields: [], firstFailedFieldName: null };
    }

    const isValid = await trigger(fieldsToCheck as any);
    const currentErrors = errors;

    const failedFields = fieldsToCheck.filter(field => {
      const fieldError = currentErrors[field as keyof typeof currentErrors];
      return !!fieldError;
    }).map(field => getFieldLabel(field));

    const firstFailedFieldName = fieldsToCheck.find(field => {
      const fieldError = currentErrors[field as keyof typeof currentErrors];
      return !!fieldError;
    }) || null;

    return { isValid, failedFields, firstFailedFieldName };
  }, [currentStep, trigger, errors, getFieldLabel]);

  // 检查步骤完成状态
  const checkStepCompleted = useCallback((step: FormStep): boolean => {
    const values = getValues();
    switch (step) {
      case FormStep.BASIC_INFO:
        return !!(values.spuId && values.name);
      case FormStep.UNIT_BARCODE:
        return !!(values.mainUnitId && values.mainBarcode);
      case FormStep.SPEC_ATTR:
        return true; // 可选步骤
      case FormStep.OTHER_CONFIG:
        return true; // 可选步骤
      default:
        return false;
    }
  }, [getValues]);

  // 检查步骤错误状态
  const checkStepErrors = useCallback((step: FormStep): boolean => {
    const currentErrors = errors;
    switch (step) {
      case FormStep.BASIC_INFO:
        return !!(currentErrors.spuId || currentErrors.name);
      case FormStep.UNIT_BARCODE:
        return !!(currentErrors.mainUnitId || currentErrors.mainBarcode);
      case FormStep.SPEC_ATTR:
        return !!(currentErrors.spec || currentErrors.flavor || currentErrors.packaging);
      case FormStep.OTHER_CONFIG:
        return !!(currentErrors.manageInventory || currentErrors.allowNegativeStock || 
                  currentErrors.minOrderQty || currentErrors.minSaleQty || currentErrors.status);
      default:
        return false;
    }
  }, [errors]);

  // 获取步骤状态
  const getStepStatus = useCallback((step: FormStep) => {
    if (checkStepErrors(step)) {
      return 'error';
    }
    if (checkStepCompleted(step)) {
      return 'finish';
    }
    if (currentStep === step) {
      return 'process';
    }
    return 'wait';
  }, [currentStep, checkStepCompleted, checkStepErrors]);

  // 处理步骤点击
  const handleStepClick = useCallback((step: FormStep) => {
    if (step <= currentStep || checkStepCompleted(step)) {
      setCurrentStep(step);
      setStepUpdateKey(prev => prev + 1);
    }
  }, [currentStep, checkStepCompleted]);

  // 处理上一步
  const handlePrevious = useCallback(() => {
    if (currentStep > FormStep.BASIC_INFO) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // 处理下一步
  const handleNext = useCallback(async () => {
    const { isValid, failedFields, firstFailedFieldName } = await validateCurrentStep();
    if (!isValid) {
      const currentStepName = steps.find(step => step.key === currentStep)?.title || '当前步骤';
      if (failedFields.length > 0) {
        message.error({
          content: `请完善${currentStepName}的必填信息：${failedFields.join('、')}`,
          duration: 5,
        });
        if (firstFailedFieldName) {
          scrollToField(firstFailedFieldName);
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
  }, [currentStep, validateCurrentStep, scrollToField]);

  // 处理表单提交
  const onSubmit = useCallback(async (values: SkuFormValues) => {
    try {
      // 检查主条码重复
      if (values.mainBarcode) {
        const excludeSkuId = mode === 'edit' ? skuId : undefined;
        try {
          const barcodeCheck = await skuService.checkBarcodeDuplicate(
            values.mainBarcode,
            excludeSkuId
          );
          if (!barcodeCheck.available) {
            setCurrentStep(FormStep.UNIT_BARCODE);
            message.error(barcodeCheck.message || '条码已存在');
            scrollToField('mainBarcode');
            return;
          }
        } catch (error: any) {
          // 如果检查失败，继续提交（由后端验证）
          console.warn('条码检查失败:', error);
        }
      }

      // 从SPU获取品牌和类目信息
      const selectedSpu = spus.find((spu) => spu.id === values.spuId);
      if (!selectedSpu) {
        showError({ message: '请选择有效的SPU' }, 'SPU选择错误');
        return;
      }

      // 构建表单数据
      const formData: SkuFormData = {
        spuId: values.spuId,
        name: values.name,
        code: mode === 'edit' ? values.code : undefined,
        spec: values.spec,
        flavor: values.flavor,
        packaging: values.packaging,
        mainUnitId: values.mainUnitId,
        salesUnits: (values.salesUnits || []).map((su) => ({
          unitId: su.unitId,
          conversionRate: su.conversionRate,
          enabled: su.enabled ?? true,
        })),
        mainBarcode: values.mainBarcode,
        otherBarcodes: (values.otherBarcodes || []).map((b) => ({
          code: b.code,
          remark: b.remark,
        })),
        manageInventory: values.manageInventory ?? true,
        allowNegativeStock: values.allowNegativeStock ?? false,
        minOrderQty: values.minOrderQty,
        minSaleQty: values.minSaleQty,
        status: values.status || SkuStatus.DRAFT,
      };

      if (mode === 'create') {
        await createMutation.mutateAsync(formData);
      } else if (skuId) {
        await updateMutation.mutateAsync({ id: skuId, formData });
      }

      reset();
      setHasUnsavedChanges(false);
      closeFormDrawer();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      if (error?.errorFields) {
        // 表单验证错误
        const firstErrorField = error.errorFields[0]?.name?.[0];
        if (firstErrorField) {
          // 找到错误字段所属的步骤
          const targetStep = steps.find(step => {
            switch (step.key) {
              case FormStep.BASIC_INFO:
                return ['spuId', 'name'].includes(firstErrorField);
              case FormStep.UNIT_BARCODE:
                return ['mainUnitId', 'mainBarcode', 'salesUnits', 'otherBarcodes'].includes(firstErrorField);
              case FormStep.SPEC_ATTR:
                return ['spec', 'flavor', 'packaging'].includes(firstErrorField);
              case FormStep.OTHER_CONFIG:
                return ['manageInventory', 'allowNegativeStock', 'minOrderQty', 'minSaleQty', 'status'].includes(firstErrorField);
              default:
                return false;
            }
          });
          if (targetStep) {
            setCurrentStep(targetStep.key);
          }
          scrollToField(firstErrorField);
        }
        showError(error, '请检查表单输入内容');
      } else {
        const errorMessage = mode === 'create' ? 'SKU创建失败' : 'SKU更新失败';
        showError(error, errorMessage);
      }
    }
  }, [mode, skuId, spus, checkBarcodeMutation, createMutation, updateMutation, reset, closeFormDrawer, onClose, onSuccess, scrollToField]);

  // 处理保存（直接提交）
  const handleSave = useCallback(async () => {
    const isValid = await trigger();
    if (!isValid) {
      const currentErrors = errors;
      const allFailedFields = Object.keys(currentErrors)
        .filter(field => {
          const fieldError = currentErrors[field as keyof typeof currentErrors];
          return !!fieldError;
        })
        .map(field => getFieldLabel(field));

      const firstFailedFieldName = Object.keys(currentErrors).find(field => {
        const fieldError = currentErrors[field as keyof typeof currentErrors];
        return !!fieldError;
      }) || null;

      if (allFailedFields.length > 0) {
        const displayFields = allFailedFields.slice(0, 5);
        const moreCount = allFailedFields.length > 5 ? `等${allFailedFields.length}个字段` : '';
        message.error({
          content: `请完善以下必填信息：${displayFields.join('、')}${moreCount}`,
          duration: 6,
        });
        if (firstFailedFieldName) {
          // 找到第一个失败字段所属的步骤并跳转
          const targetStep = steps.find(step => {
            switch (step.key) {
              case FormStep.BASIC_INFO:
                return ['spuId', 'name'].includes(firstFailedFieldName);
              case FormStep.UNIT_BARCODE:
                return ['mainUnitId', 'mainBarcode', 'salesUnits', 'otherBarcodes'].includes(firstFailedFieldName);
              case FormStep.SPEC_ATTR:
                return ['spec', 'flavor', 'packaging'].includes(firstFailedFieldName);
              case FormStep.OTHER_CONFIG:
                return ['manageInventory', 'allowNegativeStock', 'minOrderQty', 'minSaleQty', 'status'].includes(firstFailedFieldName);
              default:
                return false;
            }
          });
          if (targetStep && targetStep.key !== currentStep) {
            setCurrentStep(targetStep.key);
            message.warning(`已自动切换到'${targetStep.title}'步骤，请完善必填信息`);
          }
          scrollToField(firstFailedFieldName);
        }
      } else {
        message.error('请完善所有必填信息');
      }
      return;
    }
    handleSubmit(onSubmit)();
  }, [trigger, errors, getFieldLabel, currentStep, scrollToField, handleSubmit, onSubmit]);

  // 处理关闭
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: '确认关闭',
        content: '表单有未保存的修改，确定要关闭吗？',
        onOk: () => {
          reset();
          setHasUnsavedChanges(false);
          closeFormDrawer();
          onClose();
        },
      });
    } else {
      reset();
      setHasUnsavedChanges(false);
      closeFormDrawer();
      onClose();
    }
  }, [hasUnsavedChanges, reset, closeFormDrawer, onClose]);

  const isLoading = loadingSku || createMutation.isPending || updateMutation.isPending;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // 加载状态
  if (mode === 'edit' && loadingSku) {
    return (
      <Drawer
        title={mode === 'create' ? '新建SKU' : '编辑SKU'}
        open={open}
        onClose={handleClose}
        width={900}
        footer={null}
      >
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" tip="加载SKU信息中..." />
        </div>
      </Drawer>
    );
  }

  // 错误状态
  if (mode === 'edit' && skuError && !loadingSku) {
    return (
      <Drawer
        title="编辑SKU"
        open={open}
        onClose={handleClose}
        width={900}
        footer={null}
      >
        <Alert
          message="加载失败"
          description={skuError instanceof Error ? skuError.message : '获取SKU信息失败'}
          type="error"
          showIcon
          action={
            <Button size="small" icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
              重试
            </Button>
          }
        />
      </Drawer>
    );
  }

  // 获取当前状态值
  const statusValue = watch('status');

  return (
    <Drawer
      title={mode === 'create' ? '新建SKU' : '编辑SKU'}
      open={open}
      onClose={handleClose}
      width={900}
      destroyOnClose
      data-testid={`sku-form-drawer-${mode}`}
      footer={null}
    >
      <Spin spinning={isSubmitting} tip="保存中...">
        <form onSubmit={handleSubmit(onSubmit)} data-testid="sku-form">
          {/* 顶部区域：步骤导航 */}
          <div style={{ marginBottom: 8 }}>
            <Steps
              current={currentStep}
              items={steps.map((step, index) => ({
                title: (
                  <span
                    style={{ 
                      cursor: index <= currentStep || checkStepCompleted(step.key) ? 'pointer' : 'not-allowed',
                      color: checkStepErrors(step.key) ? '#ff4d4f' : undefined 
                    }}
                    onClick={() => handleStepClick(step.key)}
                  >
                    {step.title}
                    {step.required && <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>}
                  </span>
                ),
                description: (
                  <span
                    style={{ 
                      cursor: index <= currentStep || checkStepCompleted(step.key) ? 'pointer' : 'not-allowed',
                      color: checkStepErrors(step.key) ? '#ff4d4f' : undefined 
                    }}
                    onClick={() => handleStepClick(step.key)}
                  >
                    {step.description}
                    {checkStepErrors(step.key) && (
                      <span style={{ color: '#ff4d4f', marginLeft: 4 }}>有错误</span>
                    )}
                  </span>
                ),
                icon: checkStepCompleted(step.key) ? (
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                ) : checkStepErrors(step.key) ? (
                  <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                ) : undefined,
                status: getStepStatus(step.key) as any,
              }))}
              style={{ marginBottom: 8 }}
              data-testid="sku-form-steps"
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
                        setHasUnsavedChanges(true);
                      }}
                      data-testid="sku-form-status-radio"
                    >
                      <Radio value={SkuStatus.DRAFT} data-testid="sku-form-status-draft">
                        草稿
                      </Radio>
                      <Radio value={SkuStatus.ENABLED} data-testid="sku-form-status-enabled">
                        启用
                      </Radio>
                      <Radio value={SkuStatus.DISABLED} data-testid="sku-form-status-disabled">
                        停用
                      </Radio>
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
                  disabled={currentStep === FormStep.BASIC_INFO}
                  data-testid="sku-form-previous-button"
                >
                  上一步
                </Button>
                <Button
                  icon={<RightOutlined />}
                  onClick={handleNext}
                  disabled={currentStep === FormStep.OTHER_CONFIG}
                  data-testid="sku-form-next-button"
                >
                  下一步
                </Button>
              </Space>
              <Space>
                <Button
                  onClick={handleClose}
                  icon={<CloseOutlined />}
                  disabled={isSubmitting}
                  data-testid="sku-form-cancel-button"
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  onClick={handleSave}
                  loading={isSubmitting}
                  icon={<SaveOutlined />}
                  data-testid="sku-form-submit-button"
                >
                  保存
                </Button>
              </Space>
            </div>
          </div>

          <Divider />

          {/* 底部区域：内容录入区 */}
          <div style={{ minHeight: 133 }}>
            {currentStep === FormStep.BASIC_INFO && (
              <BasicInfoTab
                control={control}
                errors={errors}
                mode={mode}
                initialData={skuData}
                setValue={setValue}
                watch={watch}
              />
            )}
            {currentStep === FormStep.UNIT_BARCODE && (
              <UnitBarcodeTab
                control={control}
                errors={errors}
                mode={mode}
                initialData={skuData}
                setValue={setValue}
                watch={watch}
                excludeSkuId={mode === 'edit' ? skuId : undefined}
              />
            )}
            {currentStep === FormStep.SPEC_ATTR && (
              <SpecAttrTab
                control={control}
                errors={errors}
                mode={mode}
                initialData={skuData}
                setValue={setValue}
                watch={watch}
              />
            )}
            {currentStep === FormStep.OTHER_CONFIG && (
              <OtherConfigTab
                control={control}
                errors={errors}
                mode={mode}
                initialData={skuData}
                setValue={setValue}
                watch={watch}
              />
            )}
          </div>
        </form>
      </Spin>
    </Drawer>
  );
};

export default SkuForm;

