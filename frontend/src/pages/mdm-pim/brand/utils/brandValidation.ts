import { z } from 'zod';
import { BrandType, BrandStatus } from '../types/brand.types';

/**
 * 品牌名称验证模式
 */
export const brandNameSchema = z
  .string({
    required_error: '品牌名称不能为空',
  })
  .min(1, '品牌名称不能为空')
  .max(100, '品牌名称不能超过100字符')
  .regex(
    /^[\u4e00-\u9fa5a-zA-Z0-9\s\-_&]+$/,
    '品牌名称只能包含中文、英文、数字、空格、连字符、下划线和&符号'
  );

/**
 * 英文名称验证模式
 */
export const englishNameSchema = z
  .string()
  .max(200, '英文名不能超过200字符')
  .regex(/^[a-zA-Z0-9\s\-_&]*$/, '英文名只能包含英文字母、数字、空格、连字符、下划线和&符号')
  .optional();

/**
 * 品牌类型验证模式
 */
export const brandTypeSchema = z.nativeEnum(BrandType, {
  required_error: '请选择品牌类型',
});

/**
 * 公司名称验证模式
 */
export const companyNameSchema = z.string().max(200, '公司名称不能超过200字符').optional();

/**
 * 品牌等级验证模式
 */
export const brandLevelSchema = z.string().max(50, '品牌等级不能超过50字符').optional();

/**
 * 主营类目验证模式
 */
export const primaryCategoriesSchema = z
  .array(z.string())
  .min(1, '请选择至少一个主营类目')
  .max(10, '主营类目不能超过10个');

/**
 * 品牌标签验证模式
 */
export const brandTagsSchema = z.array(z.string()).max(10, '标签不能超过10个').optional();

/**
 * 品牌描述验证模式
 */
export const brandDescriptionSchema = z.string().max(1000, '品牌介绍不能超过1000字符').optional();

/**
 * 品牌状态验证模式
 */
export const brandStatusSchema = z.nativeEnum(BrandStatus);

/**
 * 品牌Logo URL验证模式
 */
export const brandLogoUrlSchema = z
  .string()
  .url('请提供有效的LOGO URL')
  .optional()
  .or(z.literal(''));

/**
 * 创建品牌请求验证模式
 */
export const createBrandRequestSchema = z.object({
  name: brandNameSchema,
  englishName: englishNameSchema,
  brandType: brandTypeSchema,
  primaryCategories: primaryCategoriesSchema,
  company: companyNameSchema,
  brandLevel: brandLevelSchema,
  tags: brandTagsSchema,
  description: brandDescriptionSchema,
  status: brandStatusSchema.optional().default(BrandStatus.DRAFT),
});

/**
 * 更新品牌请求验证模式
 */
export const updateBrandRequestSchema = z
  .object({
    name: brandNameSchema.optional(),
    englishName: englishNameSchema,
    brandType: brandTypeSchema.optional(),
    primaryCategories: primaryCategoriesSchema.optional(),
    company: companyNameSchema,
    brandLevel: brandLevelSchema,
    tags: brandTagsSchema,
    description: brandDescriptionSchema,
  })
  .partial();

/**
 * 品牌状态更新请求验证模式
 */
export const updateBrandStatusRequestSchema = z.object({
  status: brandStatusSchema,
  reason: z.string().max(500, '变更原因不能超过500字符').optional(),
});

/**
 * 品牌查询参数验证模式
 */
export const brandQueryParamsSchema = z.object({
  keyword: z.string().max(100, '搜索关键词不能超过100字符').optional(),
  brandType: z.nativeEnum(BrandType).optional(),
  status: z.nativeEnum(BrandStatus).optional(),
  page: z.coerce
    .number()
    .int('页码必须是整数')
    .min(1, '页码不能小于1')
    .max(1000, '页码不能大于1000')
    .optional()
    .default(1),
  pageSize: z.coerce
    .number()
    .int('每页大小必须是整数')
    .min(1, '每页大小不能小于1')
    .max(100, '每页大小不能大于100')
    .optional()
    .default(20),
  sortBy: z.enum(['createdAt', 'name', 'updatedAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * 类型推断
 */
export type CreateBrandRequest = z.infer<typeof createBrandRequestSchema>;
export type UpdateBrandRequest = z.infer<typeof updateBrandRequestSchema>;
export type UpdateBrandStatusRequest = z.infer<typeof updateBrandStatusRequestSchema>;
export type BrandQueryParams = z.infer<typeof brandQueryParamsSchema>;

/**
 * 品牌表单验证函数
 */
export const validateBrandForm = (data: unknown): CreateBrandRequest => {
  return createBrandRequestSchema.parse(data);
};

/**
 * 品牌更新验证函数
 */
export const validateBrandUpdate = (data: unknown): UpdateBrandRequest => {
  return updateBrandRequestSchema.parse(data);
};

/**
 * 品牌状态变更验证函数
 */
export const validateBrandStatusChange = (data: unknown): UpdateBrandStatusRequest => {
  return updateBrandStatusRequestSchema.parse(data);
};

/**
 * 查询参数验证函数
 */
export const validateBrandQueryParams = (data: unknown): BrandQueryParams => {
  return brandQueryParamsSchema.parse(data);
};

/**
 * 品牌名称重复检查函数
 */
export const checkBrandNameDuplicate = async (
  name: string,
  brandType: BrandType,
  excludeId?: string
): Promise<boolean> => {
  // 这里应该调用API检查品牌名称是否重复
  // 暂时返回false，表示不重复
  try {
    // const response = await brandApi.checkNameDuplication({ name, brandType, excludeId });
    // return response.data.isDuplicate;

    // Mock实现
    return false;
  } catch (error) {
    console.error('检查品牌名称重复失败:', error);
    return false;
  }
};

/**
 * 品牌数据完整性检查函数
 */
export const validateBrandDataIntegrity = (brand: any): boolean => {
  if (!brand || typeof brand !== 'object') {
    return false;
  }

  // 必须字段检查
  const requiredFields = ['id', 'name', 'brandType', 'status'];
  for (const field of requiredFields) {
    if (!brand[field]) {
      return false;
    }
  }

  // 字段类型检查
  if (typeof brand.name !== 'string') return false;
  if (!Object.values(BrandType).includes(brand.brandType)) return false;
  if (!Object.values(BrandStatus).includes(brand.status)) return false;

  // 可选字段类型检查
  if (brand.englishName && typeof brand.englishName !== 'string') return false;
  if (brand.company && typeof brand.company !== 'string') return false;
  if (brand.description && typeof brand.description !== 'string') return false;
  if (brand.primaryCategories && !Array.isArray(brand.primaryCategories)) return false;
  if (brand.tags && !Array.isArray(brand.tags)) return false;

  return true;
};

/**
 * 品牌业务规则验证函数
 */
export const validateBrandBusinessRules = async (
  brandData: CreateBrandRequest,
  existingBrand?: any
): Promise<{ valid: boolean; errors: string[] }> => {
  const errors: string[] = [];

  // 规则1: 品牌名称在相同类型中必须唯一
  try {
    const isDuplicate = await checkBrandNameDuplicate(
      brandData.name,
      brandData.brandType,
      existingBrand?.id
    );
    if (isDuplicate) {
      errors.push('品牌名称在同类型中已存在');
    }
  } catch (error) {
    console.error('品牌名称重复检查失败:', error);
  }

  // 规则2: 草稿状态不能直接切换为停用
  if (brandData.status === BrandStatus.DISABLED && existingBrand?.status === BrandStatus.DRAFT) {
    errors.push('草稿状态的品牌不能直接停用，请先启用或删除');
  }

  // 规则3: 检查品牌名称中的敏感词
  const sensitiveWords = ['敏感词', '违禁词', '测试品牌'];
  const hasSensitiveWord = sensitiveWords.some((word) =>
    brandData.name.toLowerCase().includes(word.toLowerCase())
  );
  if (hasSensitiveWord) {
    errors.push('品牌名称包含敏感词汇，请修改后重试');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * 品牌Logo文件验证函数
 */
export const validateLogoFile = (file: File): { valid: boolean; error?: string } => {
  // 文件大小检查（2MB）
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return { valid: false, error: '文件大小不能超过2MB' };
  }

  // 文件类型检查
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: '只支持JPG、PNG、GIF格式的图片文件' };
  }

  // 文件扩展名检查
  const fileName = file.name.toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  const hasValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));
  if (!hasValidExtension) {
    return { valid: false, error: '文件扩展名不正确，请选择JPG、PNG或GIF文件' };
  }

  return { valid: true };
};

/**
 * 导出验证规则常量
 */
export const VALIDATION_RULES = {
  NAME_MAX_LENGTH: 100,
  ENGLISH_NAME_MAX_LENGTH: 200,
  COMPANY_MAX_LENGTH: 200,
  BRAND_LEVEL_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 1000,
  STATUS_CHANGE_REASON_MAX_LENGTH: 500,
  MAX_CATEGORIES: 10,
  MAX_TAGS: 10,
  MAX_KEYWORD_LENGTH: 100,
  LOGO_MAX_SIZE: 2 * 1024 * 1024, // 2MB
  ALLOWED_LOGO_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  ALLOWED_LOGO_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif'],
} as const;
