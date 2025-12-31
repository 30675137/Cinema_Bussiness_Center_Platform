/**
 * SKU表单 - 套餐配置步骤
 * 仅套餐类型SKU可配置套餐子项
 * @since P001-sku-master-data T025
 */
import React, { useMemo } from 'react';
import { Alert, Divider, Typography } from 'antd';
import type {
  Control,
  FieldErrors,
  UseFormSetValue,
  UseFormGetValues,
  UseFormWatch,
} from 'react-hook-form';
import { ComboConfiguration, type AvailableSubItem } from '@/components/shared/ComboConfiguration';
import { SkuType, SKU_TYPE_CONFIG, SkuStatus } from '@/types/sku';
import type { SkuFormValues } from './schema';
import { useSkuListQuery } from '@/hooks/useSku';
import { CostBreakdownTable } from '../CostBreakdownTable';

const { Title } = Typography;

interface ComboConfigTabProps {
  control: Control<SkuFormValues>;
  errors: FieldErrors<SkuFormValues>;
  setValue: UseFormSetValue<SkuFormValues>;
  getValues: UseFormGetValues<SkuFormValues>;
  watch: UseFormWatch<SkuFormValues>;
  mode: 'create' | 'edit';
}

/**
 * 套餐配置步骤组件
 */
export const ComboConfigTab: React.FC<ComboConfigTabProps> = ({
  control,
  errors,
  setValue,
  getValues,
  watch,
  mode,
}) => {
  const skuType = watch('skuType');

  // 获取所有启用状态的SKU列表
  const { data: skuListResponse } = useSkuListQuery({
    status: SkuStatus.ENABLED, // 只显示启用状态的SKU
    page: 1,
    pageSize: 1000, // 获取足够多的数据
  });
  const allSkus = skuListResponse?.items || [];

  // 筛选出非套餐类型的SKU作为可选子项
  const availableSubItems: AvailableSubItem[] = useMemo(() => {
    return allSkus
      .filter((sku) => sku.skuType !== SkuType.COMBO) // 套餐不能包含套餐
      .map((sku) => ({
        id: sku.id,
        name: sku.name,
        unit: sku.mainUnit || '个',
        cost: sku.standardCost || 0,
        type: SKU_TYPE_CONFIG[sku.skuType]?.text || '',
      }));
  }, [allSkus]);

  // 如果不是套餐类型，显示提示信息
  if (skuType !== SkuType.COMBO) {
    return (
      <div className="combo-config-tab">
        <Alert
          message="套餐配置仅适用于套餐类型SKU"
          description={
            skuType
              ? `当前SKU类型为"${SKU_TYPE_CONFIG[skuType]?.text}"，无需配置套餐子项。如需配置套餐，请在基础信息步骤中将SKU类型更改为"套餐"。`
              : '请先在基础信息步骤中选择SKU类型为"套餐"，然后再配置套餐子项。'
          }
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </div>
    );
  }

  // 如果没有可用的子项，显示提示
  if (availableSubItems.length === 0) {
    return (
      <div className="combo-config-tab">
        <Alert
          message="暂无可用的子项SKU"
          description="请先创建原料、包材或成品类型的SKU，然后再配置套餐。"
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      </div>
    );
  }

  const comboItems = watch('comboItems') || [];

  return (
    <div className="combo-config-tab" data-testid="sku-form-combo-config-tab">
      <ComboConfiguration
        control={control}
        errors={errors}
        setValue={setValue}
        getValues={getValues}
        fieldPath="comboItems"
        availableSubItems={availableSubItems}
        labels={{
          subItemLabel: '子项SKU',
          title: '套餐配置',
        }}
        readOnly={false}
        onCostChange={(totalCost) => {
          // 套餐成本直接等于子项总成本
          setValue('standardCost', totalCost);
        }}
      />

      {/* 成本明细展示 (T027) */}
      {comboItems.length > 0 && (
        <>
          <Divider />
          <Title level={5}>成本计算明细</Title>
          <CostBreakdownTable items={comboItems} type="combo" compact={false} />
        </>
      )}
    </div>
  );
};
