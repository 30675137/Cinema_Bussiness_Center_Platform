/**
 * SKU简化表单组件
 * 左右布局：左侧基础属性 + 右侧BOM配方管理
 * 参考设计原型: ProductBOM.tsx
 * @spec N004-procurement-material-selector - 支持物料和 SKU 双选择
 */
import React, { useEffect, useState, useMemo } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Row,
  Col,
  Card,
  Button,
  Empty,
  message,
  Spin,
  Typography,
  Table,
  Tooltip,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  DeleteOutlined,
  SearchOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useSpusQuery,
  useUnitsQuery,
  useCreateSkuMutation,
  useUpdateSkuMutation,
  useSkuQuery,
  useIngredientsQuery,
  useComboItemsQuery,
} from '@/hooks/useSku';
import { useStoresQuery } from '@/pages/stores/hooks/useStoresQuery';
import { useMaterials } from '@/hooks/useMaterials';
import { useQueryClient } from '@tanstack/react-query';
import { skuKeys } from '@/services';
import { skuService } from '@/services/skuService';
import { SkuStatus, SkuType, SKU_TYPE_CONFIG } from '@/types/sku';
import type { SPU } from '@/types/sku';
// @spec P008-sku-type-refactor: PRODUCT_TYPE_OPTIONS 已移除，使用 SKU_TYPE_CONFIG

const { Option } = Select;
const { Text } = Typography;

// 原料接口 (基于真实 SKU 和物料数据)
interface Ingredient {
  id: string;
  name: string;
  unit: string;
  unitPrice: number;
  // N004: 区分类型
  type: 'MATERIAL' | 'SKU';
}

// BOM配方项接口
interface BOMItem {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  cost: number;
  // N004: 组件类型
  type?: 'MATERIAL' | 'SKU';
}

// @spec P008-sku-type-refactor: 简化版表单Schema，添加 skuType 字段
const simpleFormSchema = z.object({
  spuId: z.string().min(1, '请选择所属SPU'),
  name: z.string().min(1, '请输入商品名称').max(200, '商品名称不能超过200个字符'),
  skuType: z.nativeEnum(SkuType), // SKU类型（创建时必选，编辑时只读）
  price: z.number().min(0, '零售价不能为负'),
  standardCost: z.number().min(0, '标准成本不能为负').optional(),
  status: z.nativeEnum(SkuStatus),
  storeScope: z.array(z.string()), // 门店范围：空数组表示全门店
});

type SimpleFormValues = z.infer<typeof simpleFormSchema>;

interface SkuSimpleFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: 'create' | 'edit';
  skuId?: string;
}

/**
 * SKU简化表单 - 左右布局
 */
export const SkuSimpleForm: React.FC<SkuSimpleFormProps> = ({
  open,
  onClose,
  onSuccess,
  mode = 'create',
  skuId,
}) => {
  const { data: spus = [] } = useSpusQuery();
  const { data: units = [] } = useUnitsQuery();
  const { data: rawIngredients = [] } = useIngredientsQuery();
  const { data: rawComboItems = [] } = useComboItemsQuery(); // 套餐子项包含成品
  const { data: stores = [] } = useStoresQuery(); // 获取门店列表
  // N004: 获取物料列表
  const { data: materialsData } = useMaterials();
  const materials = materialsData || [];
  const createMutation = useCreateSkuMutation();
  const updateMutation = useUpdateSkuMutation();
  const queryClient = useQueryClient();

  // 编辑模式下加载SKU数据
  const { data: skuData, isLoading: loadingSku } = useSkuQuery(
    mode === 'edit' ? skuId || null : null,
    mode === 'edit' && open
  );

  const isEditMode = mode === 'edit';
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // BOM配方状态
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  // 原料选择弹窗状态
  const [isIngModalOpen, setIsIngModalOpen] = useState(false);
  const [ingSearchTerm, setIngSearchTerm] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<SimpleFormValues>({
    resolver: zodResolver(simpleFormSchema),
    defaultValues: {
      spuId: '',
      name: '',
      skuType: SkuType.FINISHED_PRODUCT, // @spec P008-sku-type-refactor: 默认成品类型
      price: 0,
      standardCost: 0,
      status: SkuStatus.DRAFT,
      storeScope: [], // 默认全门店
    },
  });

  const price = watch('price') || 0;
  const spuId = watch('spuId');
  const skuTypeFromForm = watch('skuType'); // @spec P008-sku-type-refactor: 从表单获取类型

  // 获取选中的SPU信息
  const selectedSpu = spus.find((spu: SPU) => spu.id === spuId);

  // @spec P008-sku-type-refactor: 创建模式从表单获取，编辑模式从 skuData 获取
  const currentSkuType = useMemo(() => {
    if (isEditMode && skuData?.skuType) {
      return skuData.skuType;
    }
    return skuTypeFromForm; // 创建模式从表单获取
  }, [isEditMode, skuData?.skuType, skuTypeFromForm]);

  // 是否为原料/包材类型
  const isRawOrPackaging =
    currentSkuType === SkuType.RAW_MATERIAL || currentSkuType === SkuType.PACKAGING;

  // 是否为套餐类型
  const isComboType = currentSkuType === SkuType.COMBO;

  // N004: 根据产品类型选择数据源：套餐可选成品，成品可选原料/包材/物料
  const ingredients: Ingredient[] = useMemo(() => {
    if (isComboType) {
      // 套餐类型：只能选择成品 SKU
      return rawComboItems.map((sku: any) => ({
        id: sku.id,
        name: `[SKU] ${sku.name}`,
        unit: sku.mainUnit || 'g',
        unitPrice: sku.standardCost || 0,
        type: 'SKU' as const,
      }));
    }

    // 成品类型：可选择物料和原料/包材 SKU
    // 物料组件
    const materialIngredients: Ingredient[] = materials.map((material: any) => ({
      id: material.id,
      name: `[物料] ${material.name}`,
      unit: material.inventoryUnit?.name || 'g',
      unitPrice: material.standardCost || 0, // 使用物料的标准成本
      type: 'MATERIAL' as const,
    }));

    // SKU 组件（原料和包材类型）
    const skuIngredients: Ingredient[] = rawIngredients.map((sku: any) => ({
      id: sku.id,
      name: `[SKU] ${sku.name}`,
      unit: sku.mainUnit || 'g',
      unitPrice: sku.standardCost || 0,
      type: 'SKU' as const,
    }));

    // 物料优先显示
    return [...materialIngredients, ...skuIngredients];
  }, [isComboType, rawComboItems, rawIngredients, materials]);

  // 过滤后的原料列表
  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ing: Ingredient) =>
      ing.name.toLowerCase().includes(ingSearchTerm.toLowerCase())
    );
  }, [ingSearchTerm, ingredients]);

  // 计算BOM总成本
  const totalCost = useMemo(() => {
    return bomItems.reduce((sum, item) => sum + item.cost, 0);
  }, [bomItems]);

  // 计算毛利率
  const marginRate = useMemo(() => {
    if (price <= 0) return 0;
    return ((price - totalCost) / price) * 100;
  }, [price, totalCost]);

  // 添加原料到BOM
  const addBOMItem = (ing: Ingredient) => {
    if (bomItems.find((b) => b.ingredientId === ing.id)) return;
    const newItem: BOMItem = {
      ingredientId: ing.id,
      name: ing.name,
      quantity: 1,
      unit: ing.unit,
      cost: ing.unitPrice,
      // N004: 保存组件类型
      type: ing.type,
    };
    setBomItems([...bomItems, newItem]);
  };

  // 更新BOM项数量
  const updateBOMItemQuantity = (ingredientId: string, quantity: number) => {
    const ing = ingredients.find((i: Ingredient) => i.id === ingredientId);
    setBomItems((items) =>
      items.map((item) =>
        item.ingredientId === ingredientId
          ? { ...item, quantity, cost: Number((quantity * (ing?.unitPrice || 0)).toFixed(3)) }
          : item
      )
    );
  };

  // 删除BOM项
  const removeBOMItem = (ingredientId: string) => {
    setBomItems((items) => items.filter((item) => item.ingredientId !== ingredientId));
  };

  // 关闭时重置表单
  useEffect(() => {
    if (!open) {
      reset();
      setBomItems([]);
    }
  }, [open, reset]);

  // 编辑模式下填充表单数据
  // 使用 setValue 而不是 reset，避免 destroyOnClose 导致的时序问题
  useEffect(() => {
    if (open && isEditMode && skuData && spus.length > 0 && ingredients.length > 0) {
      // 确保 SPU 存在于列表中
      const spuExists = spus.some((spu: SPU) => spu.id === skuData.spuId);

      // 根据 SKU 类型获取对应的数据
      const skuDataWithItems = skuData as any;
      const isCombo = skuDataWithItems.skuType === 'combo';

      // 套餐类型读取 comboItems，成品类型读取 bomComponents
      const itemsData = isCombo
        ? skuDataWithItems.comboItems || []
        : skuDataWithItems.bomComponents || [];

      console.log('[Edit Mode] Setting form values:', {
        spuId: skuData.spuId,
        spuExists,
        spusCount: spus.length,
        ingredientsCount: ingredients.length,
        name: skuData.name,
        status: skuData.status,
        standardCost: skuData.standardCost,
        skuType: skuDataWithItems.skuType,
        isCombo,
        itemsCount: itemsData.length,
        itemsData,
      });

      // 填充 BOM/套餐子项数据（从 ingredients 列表查找组件名称）
      if (itemsData.length > 0) {
        const convertedItems: BOMItem[] = itemsData.map((item: any) => {
          // 套餐类型使用 subItemId，成品类型使用 componentId
          const itemId = isCombo
            ? item.subItemId || item.sub_item_id || item.id
            : item.componentId || item.component_id || item.id;
          // 从 ingredients 列表中查找名称
          const ingredient = ingredients.find((ing: Ingredient) => ing.id === itemId);
          // 套餐子项名称优先从 subItemName 获取，BOM 从 componentName 获取
          const itemName = isCombo
            ? item.subItemName || ingredient?.name || '未知商品'
            : item.componentName || ingredient?.name || '未知原料';

          return {
            ingredientId: itemId,
            name: itemName,
            quantity: Number(item.quantity) || 0,
            unit: item.unit || ingredient?.unit || 'g',
            cost: Number(item.unitCost) || Number(item.quantity) * (ingredient?.unitPrice || 0),
          };
        });
        setBomItems(convertedItems);
        console.log('[Edit Mode] Converted items:', convertedItems);
      }

      // 延迟设置值，确保 Select 组件已渲染完成
      setTimeout(() => {
        if (spuExists) {
          setValue('spuId', skuData.spuId, { shouldValidate: true });
        }
        setValue('name', skuData.name || '', { shouldValidate: true });
        // @spec P008-sku-type-refactor: 编辑模式填充 skuType
        setValue('skuType', skuData.skuType || SkuType.FINISHED_PRODUCT, { shouldValidate: true });
        setValue('price', (skuData as any).price || 0); // 零售价（成品/套餐类型）
        setValue('standardCost', skuData.standardCost || 0);
        setValue('status', skuData.status || SkuStatus.DRAFT, { shouldValidate: true });
        // 门店范围 (US-001 用户故事5)
        setValue('storeScope', skuData.storeScope || []);
      }, 100);
    }
  }, [open, isEditMode, skuData, spus, ingredients, setValue]);

  // 提交表单
  const onSubmit = async (values: SimpleFormValues) => {
    try {
      // 获取默认单位ID（优先使用“份”，如果没有则使用第一个单位）
      const defaultUnit = units.find((u: { name: string }) => u.name === '份') || units[0];
      const mainUnitId = defaultUnit?.id || '';

      if (!mainUnitId) {
        message.error('未找到可用的库存单位，请先配置单位数据');
        return;
      }

      if (isEditMode && skuId) {
        // 编辑模式
        await updateMutation.mutateAsync({
          id: skuId,
          formData: {
            spuId: values.spuId,
            name: values.name,
            mainUnitId: skuData?.mainUnitId || mainUnitId,
            status: values.status,
            standardCost: values.standardCost,
            price: values.price, // 零售价（成品/套餐类型）
            storeScope: values.storeScope, // 门店范围 (US-001 用户故事5)
            manageInventory: skuData?.manageInventory ?? true,
            allowNegativeStock: skuData?.allowNegativeStock ?? false,
            salesUnits:
              skuData?.salesUnits?.map((su) => ({
                unitId: su.unitId,
                conversionRate: su.conversionRate,
                enabled: su.enabled,
              })) || [],
            otherBarcodes:
              skuData?.otherBarcodes?.map((b) => ({
                code: b.code,
                remark: b.remark,
              })) || [],
            mainBarcode: skuData?.mainBarcode || skuData?.code || '',
          },
        });

        // 更新BOM配方或套餐子项（根据SKU类型）
        if (bomItems.length > 0) {
          const isComboType = skuData?.skuType === 'combo';

          try {
            if (isComboType) {
              // 套餐类型：更新套餐子项
              const comboItems = bomItems.map((item, index) => ({
                subItemId: item.ingredientId,
                quantity: item.quantity,
                unit: item.unit,
                sortOrder: index,
              }));
              await skuService.updateComboItems(skuId, comboItems);
              // 关键修复：使 SKU 缓存失效，强制下次获取最新数据（含 comboItems）
              queryClient.invalidateQueries({ queryKey: skuKeys.sku(skuId) });
              console.log('[Edit Mode] Combo items updated successfully, cache invalidated');
            } else {
              // 成品类型：更新BOM配方
              const bomComponents = bomItems.map((item, index) => ({
                componentId: item.ingredientId,
                componentType: item.type || 'SKU', // N004: 传递组件类型
                quantity: item.quantity,
                unit: item.unit,
                isOptional: false,
                sortOrder: index,
              }));
              await skuService.updateBom(skuId, bomComponents, 0);
              // 关键修复：使 SKU 缓存失效，强制下次获取最新数据（含 bomComponents）
              queryClient.invalidateQueries({ queryKey: skuKeys.sku(skuId) });
              console.log('[Edit Mode] BOM updated successfully, cache invalidated');
            }
          } catch (bomError: any) {
            console.error('[Edit Mode] BOM/Combo update failed:', bomError);
            const updateType = isComboType ? '套餐子项' : 'BOM配方';
            message.warning(
              `SKU信息已更新，但${updateType}更新失败: ` + (bomError?.message || '未知错误')
            );
          }
        }

        message.success('SKU更新成功');
      } else {
        // 创建模式
        const autoCode = `SKU${Date.now()}`;
        // @spec P008-sku-type-refactor: 从表单获取用户选择的 SKU 类型
        const selectedSkuType = values.skuType;

        // 根据SKU类型构建不同的子项数据
        const isComboTypeCreate = selectedSkuType === SkuType.COMBO;

        // BOM组件数据（成品类型需要）
        const bomComponents =
          !isComboTypeCreate && bomItems.length > 0
            ? bomItems.map((item, index) => ({
                componentId: item.ingredientId,
                componentType: item.type || 'SKU', // N004: 传递组件类型
                quantity: item.quantity,
                unit: item.unit,
                isOptional: false,
                sortOrder: index,
              }))
            : undefined;

        // 套餐子项数据（套餐类型需要）
        const comboItems =
          isComboTypeCreate && bomItems.length > 0
            ? bomItems.map((item, index) => ({
                subItemId: item.ingredientId,
                quantity: item.quantity,
                unit: item.unit,
                sortOrder: index,
              }))
            : undefined;

        await createMutation.mutateAsync({
          spuId: values.spuId,
          name: values.name,
          mainUnitId: mainUnitId,
          status: values.status,
          skuType: selectedSkuType, // @spec P008-sku-type-refactor: 使用表单选择的类型
          standardCost: values.standardCost, // 标准成本（原料/包材必填）
          bomComponents, // BOM组件（成品类型必填）
          comboItems, // 套餐子项（套餐类型必填）
          price: values.price, // 零售价（成品/套餐类型）
          storeScope: values.storeScope, // 门店范围 (US-001 用户故事5)
          manageInventory: true,
          allowNegativeStock: false,
          salesUnits: [],
          otherBarcodes: [],
          mainBarcode: autoCode,
        });
        message.success('SKU创建成功');
      }
      onClose();
      onSuccess?.();
    } catch (error: any) {
      message.error(error?.message || (isEditMode ? 'SKU更新失败' : 'SKU创建失败'));
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ArrowLeftOutlined onClick={onClose} style={{ cursor: 'pointer' }} />
          <span>{isEditMode ? '编辑 SKU' : '新建 SKU'}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose
      styles={{ body: { padding: '24px', background: '#f5f5f5' } }}
    >
      <Spin spinning={isSubmitting || loadingSku}>
        <Row gutter={24}>
          {/* 左侧 - 基础属性 */}
          <Col span={10}>
            <Card
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🎁</span>
                  基础属性
                </span>
              }
              style={{ marginBottom: 16 }}
            >
              <Form layout="vertical">
                {/* 所属SPU */}
                <Form.Item
                  label="所属 SPU"
                  required
                  validateStatus={errors.spuId ? 'error' : undefined}
                  help={errors.spuId?.message}
                >
                  <Controller
                    name="spuId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="请选择SPU"
                        showSearch
                        filterOption={(input, option) =>
                          (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                        }
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

                {/* 品牌、分类和产品类型（自动继承自SPU） */}
                {selectedSpu && (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item label="品牌">
                          <Input
                            value={selectedSpu.brand || '-'}
                            disabled
                            style={{ background: '#f5f5f5' }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="分类">
                          <Input
                            value={selectedSpu.category || '-'}
                            disabled
                            style={{ background: '#f5f5f5' }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    {/* @spec P008-sku-type-refactor: 创建模式可选择，编辑模式只读 */}
                    <Form.Item
                      label="SKU类型"
                      required={!isEditMode}
                      validateStatus={errors.skuType ? 'error' : undefined}
                      help={errors.skuType?.message}
                      extra={isEditMode ? 'SKU 类型创建后不可修改' : undefined}
                    >
                      {isEditMode ? (
                        // 编辑模式：只读显示
                        currentSkuType && SKU_TYPE_CONFIG[currentSkuType] ? (
                          <Tag
                            color={SKU_TYPE_CONFIG[currentSkuType].color}
                            style={{ fontSize: 14, padding: '4px 12px' }}
                          >
                            {SKU_TYPE_CONFIG[currentSkuType].text}
                          </Tag>
                        ) : (
                          <Text type="secondary">未知类型</Text>
                        )
                      ) : (
                        // 创建模式：可选择
                        <Controller
                          name="skuType"
                          control={control}
                          render={({ field }) => (
                            <Select {...field} placeholder="请选择SKU类型">
                              {Object.entries(SKU_TYPE_CONFIG).map(([value, config]) => (
                                <Option key={value} value={value}>
                                  <Tag color={config.color} style={{ marginRight: 8 }}>
                                    {config.text}
                                  </Tag>
                                  {config.description}
                                </Option>
                              ))}
                            </Select>
                          )}
                        />
                      )}
                    </Form.Item>
                  </>
                )}

                {/* 商品名称 */}
                <Form.Item
                  label="商品名称"
                  required
                  validateStatus={errors.name ? 'error' : undefined}
                  help={errors.name?.message}
                >
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => <Input {...field} placeholder="如: 经典马天尼" />}
                  />
                </Form.Item>

                {/* 状态（所有类型都显示） + 零售价（仅成品/套餐显示） */}
                <Row gutter={16}>
                  {/* 零售价 - 仅成品/套餐显示 */}
                  {!isRawOrPackaging && (
                    <Col span={12}>
                      <Form.Item
                        label="零售价 (¥)"
                        validateStatus={errors.price ? 'error' : undefined}
                        help={errors.price?.message}
                      >
                        <Controller
                          name="price"
                          control={control}
                          render={({ field }) => (
                            <InputNumber
                              {...field}
                              min={0}
                              precision={2}
                              style={{ width: '100%' }}
                              placeholder="0"
                            />
                          )}
                        />
                      </Form.Item>
                    </Col>
                  )}
                  <Col span={isRawOrPackaging ? 24 : 12}>
                    <Form.Item label="当前状态">
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <Select {...field}>
                            <Option value={SkuStatus.DRAFT}>草稿</Option>
                            <Option value={SkuStatus.ENABLED}>启用</Option>
                            <Option value={SkuStatus.DISABLED}>停用</Option>
                          </Select>
                        )}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* 标准成本（仅原料/包材类型显示） */}
                {isRawOrPackaging && (
                  <Form.Item
                    label="标准成本 (¥)"
                    required
                    extra="原料和包材需要设置标准成本，用于BOM成本计算"
                    validateStatus={errors.standardCost ? 'error' : undefined}
                    help={errors.standardCost?.message}
                  >
                    <Controller
                      name="standardCost"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          min={0}
                          precision={2}
                          style={{ width: '100%' }}
                          placeholder="请输入标准成本"
                          addonAfter="元"
                        />
                      )}
                    />
                  </Form.Item>
                )}

                {/* 门店范围配置 (US-001 用户故事5 - P2) */}
                <Form.Item
                  label="门店范围"
                  extra="空表示全门店可用，选择特定门店则仅在这些门店可用"
                >
                  <Controller
                    name="storeScope"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        mode="multiple"
                        placeholder="全门店可用（或选择特定门店）"
                        allowClear
                        showSearch
                        filterOption={(input, option) =>
                          (option?.children as unknown as string)
                            ?.toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        style={{ width: '100%' }}
                      >
                        {stores.map((store: any) => (
                          <Option key={store.id} value={store.id}>
                            {store.name}
                          </Option>
                        ))}
                      </Select>
                    )}
                  />
                </Form.Item>
              </Form>
            </Card>

            {/* 盈利分析卡片 */}
            <Card
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                color: 'white',
                border: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 16 }}>📊</span>
                <span style={{ fontWeight: 'bold' }}>盈利分析</span>
              </div>
              <Row gutter={32}>
                <Col span={12}>
                  <Text
                    style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    估算成本
                  </Text>
                  <div style={{ fontSize: 24, fontWeight: 'bold' }}>¥ {totalCost.toFixed(2)}</div>
                </Col>
                <Col span={12}>
                  <Text
                    style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: 12,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    预估毛利
                  </Text>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: marginRate > 60 ? '#4ade80' : marginRate > 30 ? '#fbbf24' : '#f87171',
                    }}
                  >
                    {marginRate.toFixed(1)}%
                  </div>
                </Col>
              </Row>
              <div
                style={{
                  marginTop: 16,
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.5)',
                  fontStyle: 'italic',
                }}
              >
                * 成本基于{isComboType ? '套餐子项' : 'BOM 配方各原料'}单价累加自动计算得出
              </div>
            </Card>
          </Col>

          {/* 右侧 - BOM配方管理/套餐子项管理 */}
          <Col span={14}>
            <Card
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, color: '#1890ff' }}>◇</span>
                  {isComboType ? '套餐子项管理' : 'BOM 配方管理'}
                </span>
              }
              extra={
                <Button
                  type="primary"
                  ghost
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setIngSearchTerm('');
                    setIsIngModalOpen(true);
                  }}
                >
                  {isComboType ? '添加套餐商品' : '添加配方原料'}
                </Button>
              }
              style={{ minHeight: 400 }}
              styles={{ body: { padding: bomItems.length > 0 ? 0 : 24 } }}
            >
              {bomItems.length > 0 ? (
                <>
                  <Table
                    dataSource={bomItems}
                    rowKey="ingredientId"
                    pagination={false}
                    size="middle"
                    columns={[
                      {
                        title: isComboType ? '商品名称' : '原料名称',
                        dataIndex: 'name',
                        key: 'name',
                        render: (name: string) => (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                background: '#e6f7ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#1890ff',
                              }}
                            >
                              ◇
                            </div>
                            <span style={{ fontWeight: 500 }}>{name}</span>
                          </div>
                        ),
                      },
                      {
                        title: '标准用量',
                        dataIndex: 'quantity',
                        key: 'quantity',
                        width: 150,
                        align: 'center' as const,
                        render: (quantity: number, record: BOMItem) => (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 4,
                            }}
                          >
                            <InputNumber
                              value={quantity}
                              min={0}
                              style={{ width: 80 }}
                              onChange={(val) =>
                                updateBOMItemQuantity(record.ingredientId, val || 0)
                              }
                            />
                            <span style={{ color: '#999' }}>{record.unit}</span>
                          </div>
                        ),
                      },
                      {
                        title: '成本小计',
                        dataIndex: 'cost',
                        key: 'cost',
                        width: 100,
                        align: 'right' as const,
                        render: (cost: number) => (
                          <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>
                            ¥ {cost.toFixed(2)}
                          </span>
                        ),
                      },
                      {
                        title: '操作',
                        key: 'action',
                        width: 60,
                        align: 'center' as const,
                        render: (_: unknown, record: BOMItem) => (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeBOMItem(record.ingredientId)}
                          />
                        ),
                      },
                    ]}
                    summary={() => (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={2}>
                          <span style={{ color: '#999' }}>
                            共 {bomItems.length} 项{isComboType ? '商品' : '原料'}
                          </span>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                          <span style={{ fontSize: 16, fontWeight: 600 }}>
                            ¥ {totalCost.toFixed(2)}
                          </span>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2} />
                      </Table.Summary.Row>
                    )}
                  />
                </>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span style={{ color: '#999' }}>
                      {isComboType
                        ? '尚未配置套餐，点击右上角按钮从成品库中选择'
                        : '尚未配置配方，点击右上角按钮从原料库中选择'}
                    </span>
                  }
                  style={{ marginTop: 80 }}
                >
                  <Button type="primary" ghost onClick={() => setIsIngModalOpen(true)}>
                    立即去添加
                  </Button>
                </Empty>
              )}
            </Card>
          </Col>
        </Row>

        {/* 原料/子项选择弹窗 */}
        <Modal
          title={
            <div style={{ paddingBottom: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 20, color: '#1a1a2e' }}>
                {isComboType ? '🎁 选择套餐子项' : '🧪 选择原料库'}
              </div>
              <div style={{ fontSize: 14, color: '#666', fontWeight: 'normal', marginTop: 6 }}>
                点击下方卡片将{isComboType ? '商品' : '原料'}添加至{isComboType ? '套餐' : '配方'}
              </div>
            </div>
          }
          open={isIngModalOpen}
          onCancel={() => setIsIngModalOpen(false)}
          footer={
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
              }}
            >
              <div style={{ fontSize: 14, color: '#666' }}>
                已选择{' '}
                <span style={{ color: '#1890ff', fontWeight: 700, fontSize: 18 }}>
                  {bomItems.length}
                </span>{' '}
                种{isComboType ? '商品' : '原料'}
              </div>
              <Button
                type="primary"
                size="large"
                onClick={() => setIsIngModalOpen(false)}
                style={{
                  borderRadius: 10,
                  fontWeight: 600,
                  paddingLeft: 32,
                  paddingRight: 32,
                  height: 44,
                  fontSize: 15,
                }}
              >
                完成选择
              </Button>
            </div>
          }
          width={560}
          styles={{
            body: {
              padding: 0,
              maxHeight: '60vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
            header: {
              borderBottom: '2px solid #f0f0f0',
              padding: '20px 24px 16px',
            },
            footer: {
              borderTop: '2px solid #f0f0f0',
              padding: '16px 24px',
            },
          }}
        >
          {/* 搜索框 */}
          <div
            style={{
              padding: '20px 24px',
              background: 'linear-gradient(180deg, #f8f9fc 0%, #fff 100%)',
              borderBottom: '1px solid #eee',
            }}
          >
            <Input
              placeholder={isComboType ? '🔍  输入商品名称搜索...' : '🔍  输入原料名称搜索...'}
              value={ingSearchTerm}
              onChange={(e) => setIngSearchTerm(e.target.value)}
              allowClear
              autoFocus
              size="large"
              style={{
                borderRadius: 12,
                background: '#fff',
                height: 48,
                fontSize: 15,
                border: '2px solid #e8e8e8',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            />
          </div>

          {/* 原料列表 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#fafbfc' }}>
            {filteredIngredients.map((ing, index) => {
              const isAdded = bomItems.some((b) => b.ingredientId === ing.id);
              return (
                <div
                  key={ing.id}
                  onClick={() => !isAdded && addBOMItem(ing)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: 14,
                    cursor: isAdded ? 'default' : 'pointer',
                    background: isAdded
                      ? 'linear-gradient(135deg, #f0fff4 0%, #e8f5e9 100%)'
                      : '#fff',
                    border: isAdded ? '2px solid #95de64' : '2px solid #f0f0f0',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    marginBottom: 12,
                    boxShadow: isAdded
                      ? '0 4px 12px rgba(82,196,26,0.15)'
                      : '0 2px 8px rgba(0,0,0,0.04)',
                    transform: 'translateY(0)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isAdded) {
                      e.currentTarget.style.background =
                        'linear-gradient(135deg, #e6f4ff 0%, #f0f7ff 100%)';
                      e.currentTarget.style.border = '2px solid #69b1ff';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(24,144,255,0.2)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isAdded) {
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.border = '2px solid #f0f0f0';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {/* 序号标识 */}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: isAdded ? '#52c41a' : '#f0f0f0',
                        color: isAdded ? '#fff' : '#999',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}
                    </div>
                    {/* 原料图标 */}
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        background: isAdded
                          ? '#fff'
                          : 'linear-gradient(135deg, #e6f4ff 0%, #bae0ff 100%)',
                        border: isAdded ? '2px solid #b7eb8f' : '2px solid #91caff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isAdded ? '#52c41a' : '#1890ff',
                        fontSize: 22,
                        fontWeight: 600,
                      }}
                    >
                      {isAdded ? '✓' : '◇'}
                    </div>
                    {/* 原料信息 */}
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 16,
                          color: isAdded ? '#389e0d' : '#1a1a2e',
                          marginBottom: 4,
                          letterSpacing: 0.3,
                        }}
                      >
                        {ing.name}
                      </div>
                      <div
                        style={{
                          fontSize: 14,
                          color: isAdded ? '#73d13d' : '#666',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            background: isAdded ? '#f6ffed' : '#fff7e6',
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: 13,
                            color: isAdded ? '#52c41a' : '#fa8c16',
                          }}
                        >
                          ¥{ing.unitPrice}
                        </span>
                        <span style={{ color: '#999' }}>/ {ing.unit}</span>
                      </div>
                    </div>
                  </div>
                  {/* 操作按钮区域 */}
                  {isAdded ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        color: '#52c41a',
                        fontSize: 14,
                        fontWeight: 700,
                        padding: '10px 16px',
                        background: '#fff',
                        borderRadius: 10,
                        border: '2px solid #b7eb8f',
                        boxShadow: '0 2px 6px rgba(82,196,26,0.15)',
                      }}
                    >
                      <CheckCircleOutlined style={{ fontSize: 18 }} /> 已添加
                    </div>
                  ) : (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%)',
                        border: '2px dashed #91caff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                    >
                      <PlusOutlined style={{ color: '#1890ff', fontSize: 20, fontWeight: 700 }} />
                    </div>
                  )}
                </div>
              );
            })}
            {filteredIngredients.length === 0 && (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ color: '#999', fontSize: 15 }}>
                    未找到相关原料，请尝试其他关键词
                  </span>
                }
                style={{ marginTop: 60, marginBottom: 60 }}
              />
            )}
          </div>
        </Modal>

        {/* 保存按钮 */}
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            size="large"
            onClick={handleSubmit(onSubmit)}
            loading={isSubmitting}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              paddingLeft: 32,
              paddingRight: 32,
            }}
          >
            保存商品
          </Button>
        </div>
      </Spin>
    </Modal>
  );
};

export default SkuSimpleForm;
