/**
 * SKU表单验证Schema
 * 使用Zod进行表单验证
 */
import { z } from 'zod';
import { SkuStatus } from '@/types/sku';

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
 * SKU表单完整Schema
 */
export const skuFormSchema = z.object({
  // 基础信息
  spuId: z.string().min(1, '请选择所属SPU'),
  name: z.string().min(1, '请输入SKU名称').max(200, 'SKU名称不能超过200个字符'),
  code: z.string().optional(), // 只读，系统生成

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

