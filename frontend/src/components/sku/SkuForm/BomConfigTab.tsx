/**
 * SKU表单 - BOM配置步骤
 * 仅成品类型SKU可配置BOM
 * @since P001-sku-master-data T024
 * @spec N004-procurement-material-selector - 支持物料和 SKU 双选择
 */
import React, { useMemo } from 'react';
import { Alert, Divider, Typography, Tag } from 'antd';
import { DatabaseOutlined, ShoppingOutlined } from '@ant-design/icons';
import type {
  Control,
  FieldErrors,
  UseFormSetValue,
  UseFormGetValues,
  UseFormWatch,
} from 'react-hook-form';
import { BomConfiguration, type AvailableComponent } from '@/components/shared/BomConfiguration';
import { SkuType, SkuStatus } from '@/types/sku';
import type { SkuFormValues } from './schema';
import { useSkuListQuery } from '@/hooks/useSku';
import { useMaterials } from '@/hooks/useMaterials';
import { CostBreakdownTable } from '../CostBreakdownTable';

const { Title } = Typography;

/** N004: 扩展组件接口以支持类型区分 */
interface ExtendedAvailableComponent extends AvailableComponent {
  type: 'MATERIAL' | 'SKU';
}

interface BomConfigTabProps {
  control: Control<SkuFormValues>;
  errors: FieldErrors<SkuFormValues>;
  setValue: UseFormSetValue<SkuFormValues>;
  getValues: UseFormGetValues<SkuFormValues>;
  watch: UseFormWatch<SkuFormValues>;
  mode: 'create' | 'edit';
}

/**
 * BOM配置步骤组件
 */
export const BomConfigTab: React.FC<BomConfigTabProps> = ({
  control,
  errors,
  setValue,
  getValues,
  watch,
  mode,
}) => {
  const skuType = watch('skuType');

  // 获取可用的原料和包材SKU列表
  const { data: skuListResponse } = useSkuListQuery({
    status: SkuStatus.ENABLED, // 只显示启用状态的SKU
    page: 1,
    pageSize: 1000, // 获取足够多的数据
  });
  const allSkus = skuListResponse?.items || [];

  // N004: 获取物料列表
  const { data: materialsData } = useMaterials();
  const materials = materialsData || [];

  // N004: 合并物料和 SKU 作为可选组件
  const availableComponents: ExtendedAvailableComponent[] = useMemo(() => {
    // 物料组件
    const materialComponents: ExtendedAvailableComponent[] = materials.map((material) => ({
      id: material.id,
      name: `[物料] ${material.name}`,
      unit: material.inventoryUnit?.name || 'g',
      cost: material.standardCost || 0, // 使用物料的标准成本
      type: 'MATERIAL' as const,
    }));

    // SKU组件（原料和包材类型）
    const skuComponents: ExtendedAvailableComponent[] = allSkus
      .filter((sku) => sku.skuType === SkuType.RAW_MATERIAL || sku.skuType === SkuType.PACKAGING)
      .map((sku) => ({
        id: sku.id,
        name: `[SKU] ${sku.name}`,
        unit: sku.mainUnit || '个',
        cost: sku.standardCost || 0,
        type: 'SKU' as const,
      }));

    // 物料优先显示
    return [...materialComponents, ...skuComponents];
  }, [allSkus, materials]);

  // 如果不是成品类型，显示提示信息
  if (skuType !== SkuType.FINISHED_PRODUCT) {
    return (
      <div className="bom-config-tab">
        <Alert
          message="BOM配置仅适用于成品类型SKU"
          description={
            skuType
              ? `当前SKU类型为"${skuType === SkuType.RAW_MATERIAL ? '原料' : skuType === SkuType.PACKAGING ? '包材' : '套餐'}"，无需配置BOM。如需配置BOM，请在基础信息步骤中将SKU类型更改为"成品"。`
              : '请先在基础信息步骤中选择SKU类型为"成品"，然后再配置BOM。'
          }
          type="info"
          showIcon
          style={{ marginTop: 16 }}
        />
      </div>
    );
  }

  // 如果没有可用的原料/包材/物料，显示提示
  if (availableComponents.length === 0) {
    return (
      <div className="bom-config-tab">
        <Alert
          message="暂无可用的物料或原料"
          description="请先创建物料或原料/包材类型的SKU，然后再配置BOM。"
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      </div>
    );
  }

  const bomComponents = watch('bomComponents') || [];
  const wasteRate = watch('wasteRate') || 0;

  return (
    <div className="bom-config-tab" data-testid="sku-form-bom-config-tab">
      <BomConfiguration
        control={control}
        errors={errors}
        setValue={setValue}
        getValues={getValues}
        fieldPath="bomComponents"
        availableComponents={availableComponents}
        showWasteRate={true}
        wasteRateFieldPath="wasteRate"
        labels={{
          componentLabel: '组件 (物料/SKU)',
          title: 'BOM配置 - N004: 支持物料和 SKU 双选择',
        }}
        readOnly={false}
        onCostChange={(totalCost) => {
          // 成本变化时自动计算标准成本
          const wasteRate = getValues('wasteRate') || 0;
          const standardCost = totalCost * (1 + wasteRate / 100);
          setValue('standardCost', standardCost);
        }}
      />

      {/* 成本明细展示 (T027) */}
      {bomComponents.length > 0 && (
        <>
          <Divider />
          <Title level={5}>成本计算明细</Title>
          <CostBreakdownTable
            items={bomComponents}
            type="finished_product"
            wasteRate={wasteRate}
            compact={false}
          />
        </>
      )}
    </div>
  );
};
