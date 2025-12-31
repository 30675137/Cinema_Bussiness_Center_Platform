/**
 * SKU表单验证Schema
 * 使用Zod进行表单验证
 */
import { z } from 'zod';
import { SkuStatus, SkuType } from '@/types/sku';

/**
 * 销售单位表单Schema
 */
export const salesUnitSchema = z.object({
  unitId: z.string().min(1, '请选择销售单位'),
  conversionRate: z.number().min(0.01, '换算关系必须大于0'),
  enabled: z.boolean().default(true),
});

/**
 * 条码表单Schema
 */
export const barcodeSchema = z.object({
  code: z.string().min(1, '请输入条码').max(20, '条码长度不能超过20个字符'),
  remark: z.string().max(200, '备注长度不能超过200个字符').optional(),
});

/**
 * BOM组件表单Schema (P001-sku-master-data)
 */
export const bomComponentSchema = z.object({
  id: z.string(),
  componentId: z.string().min(1, '请选择组件SKU'),
  componentName: z.string(),
  quantity: z.number().min(0.01, '数量必须大于0'),
  unit: z.string(),
  unitCost: z.number().optional(),
  totalCost: z.number().optional(),
  isOptional: z.boolean().default(false),
  sortOrder: z.number().default(0),
});

/**
 * 套餐子项表单Schema (P001-sku-master-data)
 */
export const comboItemSchema = z.object({
  id: z.string(),
  subItemId: z.string().min(1, '请选择子项SKU'),
  subItemName: z.string(),
  quantity: z.number().min(0.01, '数量必须大于0'),
  unit: z.string(),
  unitCost: z.number().optional(),
  totalCost: z.number().optional(),
  isOptional: z.boolean().default(false),
  sortOrder: z.number().default(0),
});

/**
 * SKU表单完整Schema
 */
export const skuFormSchema = z.object({
  // 基础信息
  spuId: z.string().min(1, '请选择所属SPU'),
  name: z.string().min(1, '请输入SKU名称').max(200, 'SKU名称不能超过200个字符'),
  code: z.string().optional(), // 只读，系统生成
  skuType: z.nativeEnum(SkuType, { required_error: '请选择SKU类型' }), // P001-sku-master-data

  // 规格属性
  spec: z.string().max(200, '规格/型号不能超过200个字符').optional(),
  flavor: z.string().optional(),
  packaging: z.string().optional(),

  // 单位配置
  mainUnitId: z.string().min(1, '请选择主库存单位'),
  salesUnits: z.array(salesUnitSchema).default([]),

  // 条码信息
  mainBarcode: z.string().min(1, '请输入主条码').max(20, '条码长度不能超过20个字符'),
  otherBarcodes: z.array(barcodeSchema).default([]),

  // 成本和门店配置 (P001-sku-master-data)
  standardCost: z.number().min(0, '标准成本不能为负数').optional(), // 原料/包材必填，成品/套餐自动计算
  wasteRate: z.number().min(0, '损耗率不能为负数').max(100, '损耗率不能超过100%').optional(), // 仅成品类型使用
  storeScope: z.array(z.string()).default([]), // 空数组表示全门店

  // BOM配置 (P001-sku-master-data)
  bomComponents: z.array(bomComponentSchema).default([]), // BOM组件列表（仅成品类型）

  // 套餐配置 (P001-sku-master-data)
  comboItems: z.array(comboItemSchema).default([]), // 套餐子项列表（仅套餐类型）

  // 其他配置
  manageInventory: z.boolean().default(true),
  allowNegativeStock: z.boolean().default(false),
  minOrderQty: z.number().min(0.01, '最小起订量必须大于0').optional(),
  minSaleQty: z.number().min(0.01, '最小销售量必须大于0').optional(),
  status: z.nativeEnum(SkuStatus).default(SkuStatus.DRAFT),
});

/**
 * SKU表单数据类型
 */
export type SkuFormValues = z.infer<typeof skuFormSchema>;
