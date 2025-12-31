/**
 * SKU表单 - 基础信息步骤
 * 使用 React Hook Form Controller
 */
import React, { useState } from 'react';
import { Form, Input, Select, InputNumber, Tag, Button, Alert, Space } from 'antd';
import { CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { Controller } from 'react-hook-form';
import type {
  Control,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
  UseFormGetValues,
} from 'react-hook-form';
import type { SPU } from '@/types/sku';
import { SkuType, SKU_TYPE_CONFIG } from '@/types/sku';
import { useSpusQuery } from '@/hooks/useSku';
import type { SkuFormValues } from './schema';

const { Option } = Select;

interface BasicInfoTabProps {
  control: Control<SkuFormValues>;
  errors: FieldErrors<SkuFormValues>;
  mode: 'create' | 'edit';
  setValue: UseFormSetValue<SkuFormValues>;
  watch: UseFormWatch<SkuFormValues>;
  getValues: UseFormGetValues<SkuFormValues>;
  initialData?: any; // 保留以兼容现有调用
}

// 门店范围验证结果类型
interface ValidationResult {
  valid: boolean;
  type: 'success' | 'error' | 'warning';
  message: string;
  details?: string[];
}

/**
 * 基础信息步骤组件
 */
export const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  control,
  errors,
  mode,
  setValue,
  watch,
  getValues,
}) => {
  const { data: spus = [] } = useSpusQuery();
  const spuId = watch('spuId');
  const skuType = watch('skuType'); // 监听SKU类型变化
  const storeScope = watch('storeScope'); // 监听门店范围变化

  // 门店范围验证状态
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);

  // 验证门店范围
  const handleValidateStoreScope = async () => {
    setValidating(true);
    setValidationResult(null);

    try {
      // 模拟 API 调用验证门店范围
      // TODO: 替换为真实 API 调用 POST /api/skus/{id}/validate-store-scope
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const bomComponents = getValues('bomComponents') || [];
      const comboItems = getValues('comboItems') || [];
      const selectedStores = storeScope || [];

      // 模拟验证逻辑
      if (skuType === SkuType.FINISHED_PRODUCT && bomComponents.length === 0) {
        setValidationResult({
          valid: false,
          type: 'error',
          message: '成品SKU必须配置BOM组件',
          details: ['请先在"BOM配置"步骤中添加组件'],
        });
      } else if (skuType === SkuType.COMBO && comboItems.length === 0) {
        setValidationResult({
          valid: false,
          type: 'error',
          message: '套餐SKU必须配置子项',
          details: ['请先在"套餐配置"步骤中添加子项'],
        });
      } else if (selectedStores.length === 0) {
        setValidationResult({
          valid: true,
          type: 'success',
          message: '全门店可用，所有组件/子项均可用',
        });
      } else {
        // 模拟检查组件在选定门店的可用性
        setValidationResult({
          valid: true,
          type: 'success',
          message: `所有组件/子项在选定的 ${selectedStores.length} 个门店均可用`,
        });
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        type: 'error',
        message: '验证失败',
        details: ['网络错误，请重试'],
      });
    } finally {
      setValidating(false);
    }
  };

  // 监听SKU类型或门店范围变化时清除验证结果
  React.useEffect(() => {
    setValidationResult(null);
  }, [skuType, storeScope]);

  // 监听SPU选择变化，自动填充品牌和类目（这些字段不在表单中，仅用于显示）
  // 注意：brand 和 category 不在 SkuFormValues 中，因为它们继承自 SPU
  // 这里我们只是获取 SPU 信息用于显示

  return (
    <div data-testid="sku-form-basic-info-tab">
      <Form.Item
        label="SKU编码"
        validateStatus={errors.code ? 'error' : undefined}
        help={errors.code?.message as string}
        id="field-code"
      >
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              disabled
              placeholder="系统自动生成"
              data-testid="sku-form-code-input"
              id="code"
            />
          )}
        />
      </Form.Item>

      <Form.Item
        label="所属SPU"
        required
        validateStatus={errors.spuId ? 'error' : undefined}
        help={errors.spuId?.message as string}
        id="field-spuId"
      >
        <Controller
          name="spuId"
          control={control}
          rules={{ required: '请选择所属SPU' }}
          render={({ field }) => (
            <Select
              {...field}
              placeholder="请选择SPU"
              showSearch
              filterOption={(input, option) =>
                (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
              }
              disabled={mode === 'edit'}
              data-testid="sku-form-spu-select"
              id="spuId"
            >
              {spus.map((spu: SPU) => (
                <Option key={spu.id} value={spu.id}>
                  {spu.name}
                </Option>
              ))}
            </Select>
          )}
        />
      </Form.Item>

      {/* 品牌和类目（只读显示，继承自SPU） */}
      {spuId && (
        <>
          <Form.Item label="品牌">
            <Input
              value={spus.find((spu: SPU) => spu.id === spuId)?.brand || ''}
              disabled
              placeholder="继承自SPU"
            />
          </Form.Item>
          <Form.Item label="类目">
            <Input
              value={spus.find((spu: SPU) => spu.id === spuId)?.category || ''}
              disabled
              placeholder="继承自SPU"
            />
          </Form.Item>
        </>
      )}

      <Form.Item
        label="SKU名称"
        required
        validateStatus={errors.name ? 'error' : undefined}
        help={errors.name?.message as string}
        id="field-name"
      >
        <Controller
          name="name"
          control={control}
          rules={{
            required: '请输入SKU名称',
            maxLength: { value: 200, message: 'SKU名称不能超过200个字符' },
          }}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="请输入SKU名称"
              maxLength={200}
              data-testid="sku-form-name-input"
              id="name"
            />
          )}
        />
      </Form.Item>

      {/* SKU类型选择器 (P001-sku-master-data) */}
      <Form.Item
        label="SKU类型"
        required
        validateStatus={errors.skuType ? 'error' : undefined}
        help={errors.skuType?.message as string}
        id="field-skuType"
      >
        <Controller
          name="skuType"
          control={control}
          rules={{ required: '请选择SKU类型' }}
          render={({ field }) => (
            <Select
              {...field}
              placeholder="请选择SKU类型"
              disabled={mode === 'edit'} // 编辑模式下类型不可修改
              data-testid="sku-form-type-select"
              id="skuType"
            >
              {Object.entries(SKU_TYPE_CONFIG).map(([value, config]) => (
                <Option key={value} value={value}>
                  <Tag color={config.color}>{config.text}</Tag>
                  <span style={{ marginLeft: 8 }}>
                    {value === SkuType.RAW_MATERIAL && '原料（需手动设置成本）'}
                    {value === SkuType.PACKAGING && '包材（需手动设置成本）'}
                    {value === SkuType.FINISHED_PRODUCT && '成品（BOM自动计算成本）'}
                    {value === SkuType.COMBO && '套餐（子项自动计算成本）'}
                  </span>
                </Option>
              ))}
            </Select>
          )}
        />
      </Form.Item>

      {/* 条件显示：标准成本（原料/包材） */}
      {(skuType === SkuType.RAW_MATERIAL || skuType === SkuType.PACKAGING) && (
        <Form.Item
          label="标准成本"
          required
          validateStatus={errors.standardCost ? 'error' : undefined}
          help={errors.standardCost?.message as string}
          id="field-standardCost"
          extra="原料和包材需要手动设置成本"
        >
          <Controller
            name="standardCost"
            control={control}
            rules={{ required: '请输入标准成本' }}
            render={({ field }) => (
              <InputNumber
                {...field}
                style={{ width: '100%' }}
                placeholder="请输入标准成本"
                min={0}
                precision={2}
                addonAfter="元"
                data-testid="sku-form-cost-input"
                id="standardCost"
              />
            )}
          />
        </Form.Item>
      )}

      {/* 条件显示：损耗率（成品） */}
      {skuType === SkuType.FINISHED_PRODUCT && (
        <Form.Item
          label="损耗率"
          validateStatus={errors.wasteRate ? 'error' : undefined}
          help={errors.wasteRate?.message as string}
          id="field-wasteRate"
          extra="成品成本将根据BOM配置和损耗率自动计算"
        >
          <Controller
            name="wasteRate"
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                style={{ width: '100%' }}
                placeholder="请输入损耗率"
                min={0}
                max={100}
                precision={2}
                addonAfter="%"
                data-testid="sku-form-waste-rate-input"
                id="wasteRate"
              />
            )}
          />
        </Form.Item>
      )}

      {/* 条件显示：成本说明（成品/套餐） */}
      {(skuType === SkuType.FINISHED_PRODUCT || skuType === SkuType.COMBO) && (
        <Form.Item label="标准成本">
          <Input
            value="自动计算"
            disabled
            placeholder={
              skuType === SkuType.FINISHED_PRODUCT ? '根据BOM配置自动计算' : '根据套餐子项自动计算'
            }
          />
        </Form.Item>
      )}

      {/* 门店范围多选框 (P001-sku-master-data) */}
      <Form.Item
        label="门店范围"
        validateStatus={errors.storeScope ? 'error' : undefined}
        help={errors.storeScope?.message as string}
        id="field-storeScope"
        extra="不选择表示全门店可用"
      >
        <Controller
          name="storeScope"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              mode="multiple"
              placeholder="选择可用门店（不选择表示全门店）"
              allowClear
              data-testid="sku-form-store-scope-select"
              id="storeScope"
            >
              {/* TODO: 从门店API获取门店列表 */}
              <Option value="store-1">北京朝阳影城</Option>
              <Option value="store-2">上海浦东影城</Option>
              <Option value="store-3">广州天河影城</Option>
              <Option value="store-4">深圳福田影城</Option>
            </Select>
          )}
        />
      </Form.Item>

      {/* 门店范围验证按钮和结果 (P001-sku-master-data T026) */}
      {(skuType === SkuType.FINISHED_PRODUCT || skuType === SkuType.COMBO) && (
        <Form.Item label=" " colon={false}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              type="default"
              icon={<CheckCircleOutlined />}
              loading={validating}
              onClick={handleValidateStoreScope}
              data-testid="validate-store-scope-button"
            >
              验证门店范围
            </Button>

            {validationResult && (
              <Alert
                message={validationResult.message}
                description={
                  validationResult.details && validationResult.details.length > 0 ? (
                    <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
                      {validationResult.details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                  ) : null
                }
                type={validationResult.type}
                showIcon
                icon={
                  validationResult.type === 'success' ? (
                    <CheckCircleOutlined />
                  ) : (
                    <WarningOutlined />
                  )
                }
                closable
                onClose={() => setValidationResult(null)}
                data-testid="validation-result-alert"
              />
            )}
          </Space>
        </Form.Item>
      )}
    </div>
  );
};
