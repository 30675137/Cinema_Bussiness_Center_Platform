/**
 * MDM/PIM (商品数据管理/商品信息管理) 模块索引文件
 * 统一导出所有子模块，便于其他模块导入使用
 */

// 类目管理
export { default as CategoryManagement } from './category/CategoryManagement';
export type {
  Category,
  CategoryTreeNode,
  CategoryAttribute,
  AttributeTemplate,
  CategoryLevel,
  CategoryStatus,
  AttributeType,
} from './category/types/category.types';

// 属性字典管理
export { default as AttributeManagement } from './attribute';
export * from './attribute/types/attribute.types';

// 预留其他模块的导出位置
// - 商品管理
// export { default as ProductManagement } from './product/ProductManagement';

// - 品牌管理
// export { default as BrandManagement } from './brand/BrandManagement';

// - 属性管理
// export { default as AttributeManagement } from './attribute/AttributeManagement';
