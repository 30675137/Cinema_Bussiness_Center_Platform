/**
 * @spec N004-procurement-material-selector
 * 物料/SKU 双选择器组件
 *
 * 支持在 Material（物料，占95%业务）和 SKU（成品，占5%业务）之间切换选择
 * 主要用于采购订单创建场景
 */
import React, { useState, useCallback, useMemo } from 'react';
import { Select, Space, Tag, Spin, Empty, Segmented, Input, Tooltip, Typography } from 'antd';
import { SearchOutlined, DatabaseOutlined, ShoppingOutlined } from '@ant-design/icons';
import { useMaterials } from '@/hooks/useMaterials';
import { useSKUs } from '@/hooks/useSKUs';
import type { Material } from '@/types/material';
import type { SKU } from '@/types/sku';
import { PurchaseOrderItemType } from '@/types/purchase';
import { useDebounce } from '@/hooks/useDebounce';

const { Text } = Typography;

/** 选中项类型 */
export interface SelectedItem {
  type: PurchaseOrderItemType;
  id: string;
  name: string;
  code: string;
  unit?: string;
  purchaseUnit?: string;
  inventoryUnit?: string;
}

/** 组件属性 */
export interface MaterialSkuSelectorProps {
  /** 选中值 */
  value?: SelectedItem;
  /** 选中值变化回调 */
  onChange?: (value: SelectedItem | undefined) => void;
  /** 默认选择类型 */
  defaultType?: PurchaseOrderItemType;
  /** 占位文本 */
  placeholder?: string;
  /** 禁用状态 */
  disabled?: boolean;
  /** 是否允许清除 */
  allowClear?: boolean;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 是否显示类型切换器 */
  showTypeSwitch?: boolean;
  /** 仅允许选择的类型（限制只能选某一种类型） */
  allowedTypes?: PurchaseOrderItemType[];
  /** 尺寸 */
  size?: 'small' | 'middle' | 'large';
}

/**
 * MaterialSkuSelector - 物料/SKU 双选择器
 *
 * @example
 * ```tsx
 * <MaterialSkuSelector
 *   value={selectedItem}
 *   onChange={setSelectedItem}
 *   defaultType={PurchaseOrderItemType.MATERIAL}
 * />
 * ```
 */
export const MaterialSkuSelector: React.FC<MaterialSkuSelectorProps> = ({
  value,
  onChange,
  defaultType = PurchaseOrderItemType.MATERIAL,
  placeholder,
  disabled = false,
  allowClear = true,
  style,
  showTypeSwitch = true,
  allowedTypes,
  size = 'middle',
}) => {
  // 当前选择的类型
  const [itemType, setItemType] = useState<PurchaseOrderItemType>(
    value?.type || defaultType
  );
  // 搜索关键词
  const [searchKeyword, setSearchKeyword] = useState('');
  const debouncedKeyword = useDebounce(searchKeyword, 300);

  // 获取物料数据
  const {
    data: materials,
    isLoading: materialsLoading,
  } = useMaterials();

  // 获取 SKU 数据
  const {
    data: skusData,
    isLoading: skusLoading,
  } = useSKUs({ keyword: debouncedKeyword, page: 1, pageSize: 50 });

  // 过滤后的物料列表
  const filteredMaterials = useMemo(() => {
    if (!materials) return [];
    if (!debouncedKeyword) return materials;
    const keyword = debouncedKeyword.toLowerCase();
    return materials.filter(
      (m) =>
        m.name.toLowerCase().includes(keyword) ||
        m.code.toLowerCase().includes(keyword)
    );
  }, [materials, debouncedKeyword]);

  // SKU 列表
  const skuList = useMemo((): SKU[] => {
    return skusData?.items || [];
  }, [skusData]);

  // 是否加载中
  const isLoading = itemType === PurchaseOrderItemType.MATERIAL ? materialsLoading : skusLoading;

  // 当前显示的选项
  const options = useMemo(() => {
    if (itemType === PurchaseOrderItemType.MATERIAL) {
      return filteredMaterials.map((material) => ({
        value: material.id,
        label: (
          <Space>
            <Tag color="blue">物料</Tag>
            <Text>{material.name}</Text>
            <Text type="secondary">({material.code})</Text>
            {material.purchaseUnit && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                采购单位: {material.purchaseUnit.name}
              </Text>
            )}
          </Space>
        ),
        data: material,
      }));
    } else {
      return skuList.map((sku: SKU) => ({
        value: sku.id,
        label: (
          <Space>
            <Tag color="green">SKU</Tag>
            <Text>{sku.name}</Text>
            <Text type="secondary">({sku.code})</Text>
            {sku.mainUnit && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                单位: {sku.mainUnit}
              </Text>
            )}
          </Space>
        ),
        data: sku,
      }));
    }
  }, [itemType, filteredMaterials, skuList]);

  // 处理选择变化
  const handleSelect = useCallback(
    (selectedValue: string, option: any) => {
      if (!onChange) return;

      if (itemType === PurchaseOrderItemType.MATERIAL) {
        const material = option.data as Material;
        onChange({
          type: PurchaseOrderItemType.MATERIAL,
          id: material.id,
          name: material.name,
          code: material.code,
          purchaseUnit: material.purchaseUnit?.code,
          inventoryUnit: material.inventoryUnit?.code,
        });
      } else {
        const sku = option.data as SKU;
        onChange({
          type: PurchaseOrderItemType.SKU,
          id: sku.id,
          name: sku.name,
          code: sku.code,
          unit: sku.mainUnit,
        });
      }
    },
    [itemType, onChange]
  );

  // 处理类型切换
  const handleTypeChange = useCallback(
    (newType: string | number) => {
      const type = newType as PurchaseOrderItemType;
      setItemType(type);
      // 切换类型时清空选择
      if (value && value.type !== type) {
        onChange?.(undefined);
      }
    },
    [value, onChange]
  );

  // 处理清除
  const handleClear = useCallback(() => {
    onChange?.(undefined);
  }, [onChange]);

  // 类型切换选项
  const typeOptions = useMemo(() => {
    const allOptions = [
      {
        label: (
          <Space>
            <DatabaseOutlined />
            物料
          </Space>
        ),
        value: PurchaseOrderItemType.MATERIAL,
      },
      {
        label: (
          <Space>
            <ShoppingOutlined />
            SKU
          </Space>
        ),
        value: PurchaseOrderItemType.SKU,
      },
    ];

    if (allowedTypes && allowedTypes.length > 0) {
      return allOptions.filter((opt) => allowedTypes.includes(opt.value));
    }
    return allOptions;
  }, [allowedTypes]);

  // 计算选中值
  const selectedValue = useMemo(() => {
    if (!value) return undefined;
    if (value.type === itemType) {
      return value.id;
    }
    return undefined;
  }, [value, itemType]);

  // 获取占位文本
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    return itemType === PurchaseOrderItemType.MATERIAL
      ? '搜索并选择物料...'
      : '搜索并选择 SKU...';
  };

  return (
    <Space direction="vertical" style={{ width: '100%', ...style }}>
      {/* 类型切换器 */}
      {showTypeSwitch && typeOptions.length > 1 && (
        <Segmented
          value={itemType}
          onChange={handleTypeChange}
          options={typeOptions}
          disabled={disabled}
          size={size}
          block
        />
      )}

      {/* 选择器 */}
      <Select
        value={selectedValue}
        onChange={handleSelect}
        placeholder={getPlaceholder()}
        disabled={disabled}
        allowClear={allowClear}
        onClear={handleClear}
        loading={isLoading}
        showSearch
        filterOption={false}
        onSearch={setSearchKeyword}
        notFoundContent={
          isLoading ? (
            <Spin size="small" />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                itemType === PurchaseOrderItemType.MATERIAL
                  ? '未找到物料'
                  : '未找到 SKU'
              }
            />
          )
        }
        style={{ width: '100%' }}
        size={size}
        options={options}
        suffixIcon={<SearchOutlined />}
        optionFilterProp="children"
      />

      {/* 显示当前选中项信息 */}
      {value && (
        <div style={{ padding: '4px 0' }}>
          <Space>
            <Tag color={value.type === PurchaseOrderItemType.MATERIAL ? 'blue' : 'green'}>
              {value.type === PurchaseOrderItemType.MATERIAL ? '物料' : 'SKU'}
            </Tag>
            <Text strong>{value.name}</Text>
            <Text type="secondary">({value.code})</Text>
            {value.purchaseUnit && (
              <Tooltip title="采购单位">
                <Tag>{value.purchaseUnit}</Tag>
              </Tooltip>
            )}
            {value.unit && (
              <Tooltip title="主单位">
                <Tag>{value.unit}</Tag>
              </Tooltip>
            )}
          </Space>
        </div>
      )}
    </Space>
  );
};

export default MaterialSkuSelector;
