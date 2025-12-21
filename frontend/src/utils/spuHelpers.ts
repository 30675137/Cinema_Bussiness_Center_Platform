import dayjs from 'dayjs';
import type { SPUItem, SPUQueryParams, SPUStatus, Category, Brand } from '@/types/spu';

/**
 * 格式化SPU状态
 * @param status - SPU状态
 * @returns 状态标签和样式信息
 */
export const formatSPUStatus = (status: SPUStatus): {
  label: string;
  color: string;
  bgColor: string;
} => {
  const statusMap = {
    draft: { label: '草稿', color: '#faad14', bgColor: '#fffbe6' },
    active: { label: '已上架', color: '#52c41a', bgColor: '#f6ffed' },
    inactive: { label: '已下架', color: '#ff4d4f', bgColor: '#fff2f0' },
    archived: { label: '已归档', color: '#8c8c8c', bgColor: '#f5f5f5' },
  };

  return statusMap[status] || { label: '未知', color: '#d9d9d9', bgColor: '#fafafa' };
};

/**
 * 格式化SPU编码（自动补零）
 * @param code - SPU编码
 * @returns 格式化后的编码
 */
export const formatSPUCode = (code: string): string => {
  if (!code) return '';

  // 移除非数字字符
  const numericCode = code.replace(/\D/g, '');

  // 如果已经是完整格式，直接返回
  if (/^SPU\d{8}$/.test(code)) {
    return code;
  }

  // 补零到8位
  const paddedCode = numericCode.padStart(8, '0');
  return `SPU${paddedCode}`;
};

/**
 * 生成SPU编码
 * @param prefix - 前缀，默认为当前日期
 * @returns 新的SPU编码
 */
export const generateSPUCode = (prefix?: string): string => {
  const datePrefix = prefix || dayjs().format('YYYYMMDD');
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `SPU${datePrefix}${random}`;
};

/**
 * 格式化分类路径
 * @param category - 分类对象
 * @param separator - 分隔符
 * @returns 完整分类路径
 */
export const formatCategoryPath = (
  category: Category | null,
  separator = ' / '
): string => {
  if (!category) return '-';

  const pathParts: string[] = [];
  let currentCategory: Category | null = category;

  // 构建路径
  while (currentCategory) {
    pathParts.unshift(currentCategory.name);
    currentCategory = currentCategory.parent || null;
  }

  return pathParts.join(separator);
};

/**
 * 格式化品牌信息
 * @param brand - 品牌对象
 * @returns 格式化后的品牌信息
 */
export const formatBrandInfo = (brand: Brand | null): string => {
  if (!brand) return '-';
  return `${brand.name}${brand.code ? ` (${brand.code})` : ''}`;
};

/**
 * 格式化SPU创建时间
 * @param date - 日期
 * @param format - 格式模板
 * @returns 格式化后的日期字符串
 */
export const formatSPUDate = (
  date: string | Date | undefined,
  format = 'YYYY-MM-DD HH:mm'
): string => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

/**
 * 格式化相对时间
 * @param date - 日期
 * @returns 相对时间字符串
 */
export const formatRelativeTime = (date: string | Date | undefined): string => {
  if (!date) return '-';

  const now = dayjs();
  const targetDate = dayjs(date);
  const diffDays = now.diff(targetDate, 'day');
  const diffHours = now.diff(targetDate, 'hour');
  const diffMinutes = now.diff(targetDate, 'minute');

  if (diffDays > 0) {
    return `${diffDays}天前`;
  } else if (diffHours > 0) {
    return `${diffHours}小时前`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes}分钟前`;
  } else {
    return '刚刚';
  }
};

/**
 * 计算SPU完整度
 * @param spu - SPU对象
 * @returns 完整度百分比和缺失字段
 */
export const calculateSPUCompleteness = (
  spu: Partial<SPUItem>
): {
  percentage: number;
  missingFields: string[];
  level: 'low' | 'medium' | 'high';
} => {
  const requiredFields = [
    { key: 'name', label: '商品名称' },
    { key: 'code', label: '商品编码' },
    { key: 'brandId', label: '品牌' },
    { key: 'categoryId', label: '分类' },
    { key: 'description', label: '商品描述' },
    { key: 'images', label: '商品图片' },
    { key: 'specifications', label: '规格参数' },
  ];

  const optionalFields = [
    { key: 'tags', label: '标签' },
    { key: 'attributes', label: '属性' },
    { key: 'status', label: '状态' },
  ];

  const filledRequired = requiredFields.filter(field => {
    const value = spu[field.key as keyof SPUItem];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '';
  });

  const filledOptional = optionalFields.filter(field => {
    const value = spu[field.key as keyof SPUItem];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '';
  });

  const missingRequired = requiredFields.filter(field => {
    const value = spu[field.key as keyof SPUItem];
    if (Array.isArray(value)) return value.length === 0;
    return value === undefined || value === null || value === '';
  });

  const requiredPercentage = (filledRequired.length / requiredFields.length) * 70;
  const optionalPercentage = (filledOptional.length / optionalFields.length) * 30;
  const totalPercentage = Math.round(requiredPercentage + optionalPercentage);

  let level: 'low' | 'medium' | 'high' = 'low';
  if (totalPercentage >= 80) level = 'high';
  else if (totalPercentage >= 50) level = 'medium';

  return {
    percentage: totalPercentage,
    missingFields: missingRequired.map(field => field.label),
    level,
  };
};

/**
 * 生成SPU搜索关键词
 * @param spu - SPU对象
 * @returns 搜索关键词数组
 */
export const generateSPUSearchKeywords = (spu: SPUItem): string[] => {
  const keywords: string[] = [
    spu.code.toLowerCase(),
    spu.name.toLowerCase(),
  ];

  if (spu.description) {
    keywords.push(spu.description.toLowerCase());
  }

  if (spu.tags && spu.tags.length > 0) {
    keywords.push(...spu.tags.map(tag => tag.toLowerCase()));
  }

  if (spu.brand?.name) {
    keywords.push(spu.brand.name.toLowerCase());
  }

  if (spu.category?.name) {
    keywords.push(spu.category.name.toLowerCase());
    // 同时添加分类路径
    keywords.push(formatCategoryPath(spu.category).toLowerCase());
  }

  // 分词处理名称
  keywords.push(...spu.name.split(/\s+/).map(word => word.toLowerCase()));

  return [...new Set(keywords)]; // 去重
};

/**
 * 按关键词过滤SPU列表
 * @param spus - SPU列表
 * @param keyword - 搜索关键词
 * @returns 过滤后的SPU列表
 */
export const filterSPUByKeyword = (
  spus: SPUItem[],
  keyword: string
): SPUItem[] => {
  if (!keyword || keyword.trim() === '') return spus;

  const lowerKeyword = keyword.toLowerCase().trim();

  return spus.filter(spu => {
    const searchKeywords = generateSPUSearchKeywords(spu);
    return searchKeywords.some(kw => kw.includes(lowerKeyword));
  });
};

/**
 * 构建查询参数
 * @param params - 查询参数
 * @returns 标准化的查询参数
 */
export const buildQueryParams = (params: Partial<SPUQueryParams>): SPUQueryParams => {
  return {
    page: params.page || 1,
    pageSize: params.pageSize || 20,
    keyword: params.keyword || '',
    status: params.status || undefined,
    brandId: params.brandId || undefined,
    categoryId: params.categoryId || undefined,
    sortBy: params.sortBy || 'createdAt',
    sortOrder: params.sortOrder || 'desc',
  };
};

/**
 * 格式化查询参数用于URL
 * @param params - 查询参数
 * @returns URL查询字符串
 */
export const formatQueryParams = (params: Partial<SPUQueryParams>): string => {
  const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = String(value);
    }
    return acc;
  }, {} as Record<string, string>);

  const searchParams = new URLSearchParams(cleanParams);
  return searchParams.toString();
};

/**
 * 从URL解析查询参数
 * @param search - URL搜索字符串
 * @returns 查询参数对象
 */
export const parseQueryParams = (search: string): Partial<SPUQueryParams> => {
  const searchParams = new URLSearchParams(search);
  const params: Partial<SPUQueryParams> = {};

  const page = searchParams.get('page');
  if (page) params.page = parseInt(page, 10);

  const pageSize = searchParams.get('pageSize');
  if (pageSize) params.pageSize = parseInt(pageSize, 10);

  const keyword = searchParams.get('keyword');
  if (keyword) params.keyword = keyword;

  const status = searchParams.get('status') as SPUStatus;
  if (status) params.status = status;

  const brandId = searchParams.get('brandId');
  if (brandId) params.brandId = brandId;

  const categoryId = searchParams.get('categoryId');
  if (categoryId) params.categoryId = categoryId;

  const sortBy = searchParams.get('sortBy');
  if (sortBy) params.sortBy = sortBy;

  const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc';
  if (sortOrder) params.sortOrder = sortOrder;

  return params;
};

/**
 * 验证SPU表单数据
 * @param data - SPU数据
 * @returns 验证结果
 */
export const validateSPUData = (
  data: Partial<SPUItem>
): {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  // 必填字段验证
  if (!data.name || data.name.trim() === '') {
    errors.name = '商品名称不能为空';
  } else if (data.name.length > 100) {
    errors.name = '商品名称不能超过100个字符';
  }

  if (!data.code) {
    errors.code = '商品编码不能为空';
  } else if (!/^SPU\d{12}$/.test(data.code)) {
    errors.code = '商品编码格式不正确，应为SPU开头的12位数字';
  }

  if (!data.brandId) {
    errors.brandId = '请选择品牌';
  }

  if (!data.categoryId) {
    errors.categoryId = '请选择分类';
  }

  if (!data.description || data.description.trim() === '') {
    errors.description = '商品描述不能为空';
  } else if (data.description.length > 2000) {
    errors.description = '商品描述不能超过2000个字符';
  }

  // 图片验证
  if (!data.images || data.images.length === 0) {
    errors.images = '请至少上传一张商品图片';
  } else if (data.images.length > 10) {
    errors.images = '商品图片不能超过10张';
  }

  // 规格参数验证
  if (!data.specifications || data.specifications.length === 0) {
    warnings.specifications = '建议添加规格参数信息';
  }

  // 标签验证
  if (data.tags && data.tags.length > 0) {
    if (data.tags.length > 10) {
      errors.tags = '标签不能超过10个';
    }
    const invalidTags = data.tags.filter(tag => tag.length > 20);
    if (invalidTags.length > 0) {
      errors.tags = '标签长度不能超过20个字符';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
};

/**
 * 比较两个SPU对象的变化
 * @param original - 原始SPU
 * @param modified - 修改后的SPU
 * @returns 变化字段列表
 */
export const compareSPUChanges = (
  original: SPUItem,
  modified: Partial<SPUItem>
): {
  hasChanges: boolean;
  changedFields: string[];
  changeDetails: Record<string, { old: any; new: any }>;
} => {
  const changedFields: string[] = [];
  const changeDetails: Record<string, { old: any; new: any }> = {};

  // 比较各个字段
  const fieldsToCompare = [
    'name', 'description', 'brandId', 'categoryId', 'status',
    'tags', 'specifications', 'images', 'attributes'
  ];

  for (const field of fieldsToCompare) {
    const oldValue = original[field as keyof SPUItem];
    const newValue = modified[field as keyof SPUItem];

    // 数组类型的特殊比较
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      if (JSON.stringify(oldValue.sort()) !== JSON.stringify(newValue.sort())) {
        changedFields.push(field);
        changeDetails[field] = { old: oldValue, new: newValue };
      }
    } else if (oldValue !== newValue) {
      changedFields.push(field);
      changeDetails[field] = { old: oldValue, new: newValue };
    }
  }

  return {
    hasChanges: changedFields.length > 0,
    changedFields,
    changeDetails,
  };
};

/**
 * 格式化规格参数为显示文本
 * @param specifications - 规格参数数组
 * @returns 格式化后的文本
 */
export const formatSpecifications = (specifications: Array<{ name: string; value: string }>): string => {
  if (!specifications || specifications.length === 0) return '-';

  return specifications
    .map(spec => `${spec.name}: ${spec.value}`)
    .join(' | ');
};

/**
 * 导出SPU数据为CSV
 * @param spus - SPU列表
 * @param filename - 文件名
 */
export const exportSPUToCSV = (spus: SPUItem[], filename = 'spu-list'): void => {
  if (!spus || spus.length === 0) return;

  const headers = [
    '编码',
    '名称',
    '品牌',
    '分类',
    '状态',
    '描述',
    '标签',
    '创建时间',
    '更新时间'
  ];

  const csvContent = [
    headers.join(','),
    ...spus.map(spu => [
      spu.code,
      spu.name,
      spu.brand?.name || '',
      formatCategoryPath(spu.category),
      formatSPUStatus(spu.status).label,
      `"${spu.description.replace(/"/g, '""')}"`, // 处理描述中的引号
      `"${(spu.tags || []).join('; ')}"`,
      formatSPUDate(spu.createdAt),
      formatSPUDate(spu.updatedAt)
    ].join(','))
  ].join('\n');

  // 创建Blob并下载
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};