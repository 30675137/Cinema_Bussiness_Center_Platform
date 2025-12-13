// 分类状态
export type CategoryStatus = 'active' | 'inactive'

// 分类层级
export type CategoryLevel = 1 | 2 | 3

// 属性类型（基于 data-model.md 规范）- 提前定义，避免循环依赖
export type AttributeType = 'text' | 'number' | 'single-select' | 'multi-select'

// 属性验证规则 - 提前定义
export interface AttributeValidation {
  min?: number
  max?: number
  pattern?: string
  options?: string[]
  required?: boolean
}

// 类目属性定义（基于 data-model.md 规范）- 提前定义
export interface CategoryAttribute {
  // 基础标识
  id: string                    // 属性唯一标识
  name: string                  // 属性名称（必填）
  displayName: string           // 显示名称（用于UI展示）
  
  // 属性配置
  type: AttributeType           // 属性类型
  required: boolean            // 是否必填
  optionalValues?: string[]     // 可选值列表（用于 select 类型）
  sortOrder: number            // 排序序号
  
  // 元数据
  description?: string          // 属性描述
  createdAt: string            // 创建时间
  updatedAt: string            // 更新时间
}

// 属性模板（基于 data-model.md 规范）- 提前定义
export interface AttributeTemplate {
  // 基础标识
  id: string                    // 模板唯一标识
  categoryId: string           // 关联的类目ID
  
  // 属性列表
  attributes: CategoryAttribute[]  // 属性定义列表
  
  // 元数据
  createdAt: string            // 创建时间
  updatedAt: string            // 更新时间
}

// 类目实体（基于 data-model.md 规范）
export interface Category {
  // 基础标识
  id: string                    // 类目唯一标识
  code: string                  // 类目编码（系统生成或只读）
  name: string                  // 类目名称（必填）
  description?: string           // 类目描述（可选）
  
  // 层级关系
  level: CategoryLevel          // 类目层级（1/2/3，只读）
  parentId?: string             // 父类目ID（一级类目为空）
  parentName?: string           // 父类目名称（用于显示）
  path: string[]                // 类目路径（如：['饮料', '碳酸饮料', '可乐']）
  
  // 状态和排序
  status: CategoryStatus         // 类目状态（启用/停用）
  sortOrder: number             // 排序序号（用于展示顺序）
  
  // 关联数据
  spuCount: number              // 关联的SPU数量（用于删除校验）
  attributeTemplateId?: string  // 属性模板ID（可选）
  
  // 元数据
  createdAt: string             // 创建时间
  updatedAt: string             // 更新时间
  createdBy?: string            // 创建人
  updatedBy?: string            // 更新人
}

// 基础分类类型（兼容旧接口，保留向后兼容）
export interface CategoryItem extends Category {
  icon?: string
  image?: string
  hasChildren: boolean
  children?: CategoryItem[]
  attributeTemplate?: AttributeTemplate
}

// 兼容旧接口
export interface ProductCategory {
  id: string;
  name: string;
  code: string;
  level: number;
  parentId?: string;
  path: string;
  children?: ProductCategory[];
  sortOrder: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// 类目树节点（基于 data-model.md 规范）
export interface CategoryTree extends Category {
  // 树结构特有字段
  children?: CategoryTree[]      // 子节点列表
  hasChildren: boolean          // 是否有子节点（用于懒加载）
  isLeaf: boolean               // 是否为叶子节点
  key: string                   // Ant Design Tree 需要的 key
  title: string                 // Ant Design Tree 需要的 title
}

export interface CategoryTreeNode extends CategoryTree {
  key: string;
  title: string;
  value: string;
  children?: CategoryTreeNode[];
  isLeaf: boolean; // 必须与 CategoryTree 保持一致
  checkable?: boolean;
  selectable?: boolean;
}

// 兼容旧接口的模板属性（保留向后兼容）
export interface TemplateAttribute {
  id: string
  name: string
  displayName: string
  type: AttributeType
  required: boolean
  defaultValue?: any
  options?: string[]
  validation?: AttributeValidation
  description?: string
  sortOrder: number
}

// 类目创建请求参数
export interface CreateCategoryRequest {
  name: string                  // 必填
  parentId?: string            // 可选，用于创建子类目
  description?: string         // 可选
  sortOrder?: number           // 可选，默认 0
  status?: CategoryStatus       // 可选，默认 'active'
}

// 类目更新请求参数
export interface UpdateCategoryRequest {
  id: string                   // 必填
  name?: string               // 可选
  description?: string         // 可选
  sortOrder?: number          // 可选
  status?: CategoryStatus     // 可选
}

// 确保所有类型都被正确导出
export type {
  CategoryStatus,
  CategoryLevel,
  AttributeType
}