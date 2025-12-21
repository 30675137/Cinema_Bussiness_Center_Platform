# 类目管理功能数据模型设计

## 概述

本文档定义了类目管理功能涉及的所有数据实体、字段定义、验证规则和关系约束，作为前后端开发的统一数据规范。

## 核心实体定义

### 1. Category (类目)

类目是商品管理中台的基础数据，采用三级层次结构（一级类目 -> 二级类目 -> 三级类目）。

```typescript
export interface Category {
  // 基本字段
  id: string;                    // 唯一标识符，系统生成的UUID
  name: string;                  // 类目名称，用户可见，必填
  code?: string;                 // 类目编码，系统生成或外部维护，只读
  level: CategoryLevel;          // 类目等级：1/2/3，只读
  parentId?: string;             // 父类目ID，一级类目为空
  sortOrder?: number;            // 排序序号，可选，用于同级排序
  status: CategoryStatus;        // 类目状态：enabled/disabled

  // 系统字段
  createdAt: string;             // 创建时间，ISO 8601格式
  updatedAt: string;             // 更新时间，ISO 8601格式
  createdBy?: string;            // 创建人ID
  updatedBy?: string;            // 更新人ID
}

// 枚举类型定义
export type CategoryLevel = 1 | 2 | 3;
export type CategoryStatus = 'enabled' | 'disabled';

// 树结构中的节点（用于前端展示）
export interface CategoryTreeNode extends Category {
  children?: CategoryTreeNode[];  // 子节点列表
  path: string;                   // 完整路径：一级/二级/三级
  isLeaf: boolean;                // 是否为叶子节点（三级类目）
}
```

#### 字段验证规则

| 字段 | 验证规则 | 错误提示 |
|------|----------|----------|
| name | 必填，长度2-50字符，不允许特殊字符 | 类目名称不能为空，长度应在2-50字符之间 |
| level | 只读，由系统根据父类目自动计算 | - |
| parentId | 可为空（一级类目），如果存在则必须引用有效类目 | 上级类目不存在 |
| sortOrder | 可选，必须为非负整数，默认按创建时间排序 | 排序序号必须为非负整数 |
| status | 必填，默认为enabled | - |

### 2. AttributeTemplate (属性模板)

属性模板定义了类目下SPU需要填写的属性字段规范。

```typescript
export interface AttributeTemplate {
  id: string;                    // 唯一标识符，UUID
  categoryId: string;            // 关联的类目ID，一对一关系
  attributes: CategoryAttribute[]; // 属性列表
  createdAt: string;             // 创建时间
  updatedAt: string;             // 更新时间
}
```

### 3. CategoryAttribute (类目属性)

属性模板中的具体属性定义。

```typescript
export interface CategoryAttribute {
  id: string;                    // 唯一标识符，UUID
  name: string;                  // 属性名称，必填
  type: AttributeType;           // 属性类型
  required: boolean;             // 是否必填
  optionalValues?: string[];     // 可选值列表（用于select类型）
  defaultValue?: string;         // 默认值
  placeholder?: string;          // 占位符文本
  description?: string;          // 属性描述
  sortOrder: number;             // 排序序号
  validation?: ValidationRule[]; // 验证规则列表

  // 系统字段
  createdAt: string;
  updatedAt: string;
}

// 属性类型枚举
export type AttributeType = 'text' | 'number' | 'single-select' | 'multi-select';

// 验证规则
export interface ValidationRule {
  type: 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'custom';
  value: string | number;
  message: string;               // 错误提示信息
}
```

#### 属性类型详细说明

| 类型 | 说明 | 适用场景 | 可选值要求 |
|------|------|----------|------------|
| text | 文本类型 | 短文本描述，如品牌、型号等 | - |
| number | 数字类型 | 数量、重量、尺寸等数值 | - |
| single-select | 单选类型 | 固定选项的选择，如颜色、尺寸等 | 必须提供可选值列表 |
| multi-select | 多选类型 | 支持多选的标签、特性等 | 必须提供可选值列表 |

#### 字段验证规则

| 字段 | 验证规则 | 错误提示 |
|------|----------|----------|
| name | 必填，长度2-30字符 | 属性名称不能为空，长度应在2-30字符之间 |
| type | 必填，为预定义的四种类型之一 | 属性类型无效 |
| optionalValues | 当type为select类型时必填，数组不能为空 | 单选/多选类型必须提供可选值 |
| sortOrder | 必填，必须为非负整数 | 排序序号必须为非负整数 |

### 4. API 请求/响应模型

#### 类目相关

```typescript
// 类目查询参数
export interface CategoryQueryParams {
  level?: CategoryLevel;         // 按等级筛选
  parentId?: string;             // 按父类目筛选
  status?: CategoryStatus;       // 按状态筛选
  keyword?: string;              // 搜索关键词（按名称搜索）
  includeChildren?: boolean;     // 是否包含子节点
  page?: number;                 // 页码（从1开始）
  pageSize?: number;             // 每页大小
  sortBy?: 'name' | 'sortOrder' | 'createdAt'; // 排序字段
  sortOrder?: 'asc' | 'desc';    // 排序方向
}

// 创建类目请求
export interface CreateCategoryRequest {
  name: string;                  // 必填
  parentId?: string;             // 可选（一级类目时为空）
  sortOrder?: number;            // 可选
  status?: CategoryStatus;       // 可选，默认enabled
}

// 更新类目请求
export interface UpdateCategoryRequest {
  name?: string;                 // 可选
  sortOrder?: number;            // 可选
  status?: CategoryStatus;       // 可选
  // 注意：parentId、level不可修改
}

// 类目树响应
export interface CategoryTreeResponse {
  success: boolean;
  data: CategoryTreeNode[];
  total: number;                 // 总节点数
}
```

#### 属性模板相关

```typescript
// 创建属性请求
export interface CreateAttributeRequest {
  name: string;
  type: AttributeType;
  required: boolean;
  optionalValues?: string[];
  defaultValue?: string;
  placeholder?: string;
  description?: string;
  sortOrder: number;
  validation?: ValidationRule[];
}

// 更新属性请求
export interface UpdateAttributeRequest {
  name?: string;
  type?: AttributeType;
  required?: boolean;
  optionalValues?: string[];
  defaultValue?: string;
  placeholder?: string;
  description?: string;
  sortOrder?: number;
  validation?: ValidationRule[];
}

// 属性模板响应
export interface AttributeTemplateResponse {
  success: boolean;
  data: AttributeTemplate;
}
```

### 5. 错误响应模型

```typescript
// API标准响应格式
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;              // 成功或错误信息
  code?: string;                 // 错误代码
  details?: any;                 // 错误详情
}

// 错误代码定义
export enum ErrorCode {
  // 通用错误
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',

  // 类目相关错误
  CATEGORY_NOT_FOUND = 'CATEGORY_NOT_FOUND',
  CATEGORY_NAME_EXISTS = 'CATEGORY_NAME_EXISTS',
  CATEGORY_HAS_CHILDREN = 'CATEGORY_HAS_CHILDREN',
  CATEGORY_IN_USE = 'CATEGORY_IN_USE',
  INVALID_CATEGORY_LEVEL = 'INVALID_CATEGORY_LEVEL',
  INVALID_PARENT_CATEGORY = 'INVALID_PARENT_CATEGORY',

  // 属性相关错误
  ATTRIBUTE_NOT_FOUND = 'ATTRIBUTE_NOT_FOUND',
  ATTRIBUTE_NAME_EXISTS = 'ATTRIBUTE_NAME_EXISTS',
  ATTRIBUTE_IN_USE = 'ATTRIBUTE_IN_USE',
  INVALID_ATTRIBUTE_TYPE = 'INVALID_ATTRIBUTE_TYPE',
  REQUIRED_OPTIONAL_VALUES = 'REQUIRED_OPTIONAL_VALUES',
}

// 错误信息映射
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCode.INVALID_REQUEST]: '请求参数无效',
  [ErrorCode.UNAUTHORIZED]: '未授权访问',
  // FORBIDDEN removed - no permission control in frontend mock implementation
  [ErrorCode.NOT_FOUND]: '资源不存在',

  [ErrorCode.CATEGORY_NOT_FOUND]: '类目不存在',
  [ErrorCode.CATEGORY_NAME_EXISTS]: '类目名称已存在',
  [ErrorCode.CATEGORY_HAS_CHILDREN]: '类目下存在子类目，无法删除',
  [ErrorCode.CATEGORY_IN_USE]: '类目已被SPU使用，无法删除',
  [ErrorCode.INVALID_CATEGORY_LEVEL]: '类目等级无效',
  [ErrorCode.INVALID_PARENT_CATEGORY]: '上级类目无效',

  [ErrorCode.ATTRIBUTE_NOT_FOUND]: '属性不存在',
  [ErrorCode.ATTRIBUTE_NAME_EXISTS]: '属性名称已存在',
  [ErrorCode.ATTRIBUTE_IN_USE]: '属性已被SPU使用，无法删除',
  [ErrorCode.INVALID_ATTRIBUTE_TYPE]: '属性类型无效',
  [ErrorCode.REQUIRED_OPTIONAL_VALUES]: '选择类型属性必须提供可选值',
};
```

## 数据关系图

```mermaid
erDiagram
    Category ||--o{ Category : parent-child
    Category ||--|| AttributeTemplate : one-to-one
    AttributeTemplate ||--o{ CategoryAttribute : contains

    Category {
        string id PK
        string name
        string code
        number level
        string parentId FK
        number sortOrder
        string status
        string createdAt
        string updatedAt
    }

    AttributeTemplate {
        string id PK
        string categoryId FK
        string createdAt
        string updatedAt
    }

    CategoryAttribute {
        string id PK
        string name
        string type
        boolean required
        string[] optionalValues
        number sortOrder
        string createdAt
        string updatedAt
    }
```

## 业务规则

### 1. 类目层级规则
- 系统严格限制为三级类目结构（Level 1/2/3）
- 一级类目无父类目（parentId为null）
- 二级类目的父类目必须是一级类目
- 三级类目的父类目必须是二级类目
- 三级类目为叶子节点，不能有子类目

### 2. 类目名称规则
- 同一父类目下的子类目名称不能重复
- 类目名称支持中文字符、数字、字母和部分特殊字符（- _ /）
- 类目名称长度限制在2-50字符之间

### 3. 类目状态规则
- 类目状态只有两种：enabled（启用）和disabled（停用）
- 停用类目不影响已有SPU，只是新建SPU时不可选择
- 父类目停用不影响子类目的状态
- 删除类目前必须检查是否被SPU使用

### 4. 属性模板规则
- 每个类目最多只能有一个属性模板
- 属性模板中的属性名称在同一模板内不能重复
- 单选和多选类型的属性必须提供可选值列表
- 可选值列表不能为空，每个值长度不超过50字符
- 已被SPU使用的属性不能删除

### 5. 排序规则
- 默认按创建时间排序（sortOrder为null时）
- 相同sortOrder按名称拼音排序
- sortOrder必须为非负整数
- 子类目可以设置独立的sortOrder，不继承父类目

## 性能考虑

### 1. 数据量限制
- 单个类目树的节点总数限制为1000个
- 单个属性模板的属性数量限制为50个
- 单个属性的可选值数量限制为100个

### 2. 查询优化
- 类目树查询支持按层级过滤
- 支持分页查询，避免一次性加载大量数据
- 类目名称搜索使用索引优化
- 属性模板查询支持缓存策略

### 3. 并发控制
- 类目创建和更新操作支持乐观锁
- 属性模板编辑时采用加锁机制
- 批量操作支持事务处理

## 扩展性设计

### 1. 类目等级扩展
- 虽然当前限制为三级，数据模型支持未来扩展到更多层级
- CategoryLevel类型可以轻松扩展为更多选项
- 树结构算法支持任意层级深度

### 2. 属性类型扩展
- AttributeType枚举可以添加新的属性类型
- ValidationRule结构支持自定义验证规则
- 可选值支持复杂数据类型（如对象）

### 3. 多租户支持
- Category模型可以添加tenantId字段支持多租户
- 数据查询可以按租户过滤

## 与其他模块的集成

### 1. SPU管理模块
- SPU创建时需要选择类目，系统会检查类目状态
- 如果类目配置了属性模板，SPU创建页面会显示相应属性字段
- SPU会保存类目引用，类目删除时需要检查依赖关系

### 2. 用户权限模块
- **Note**: 权限控制不在本次实现范围内（Out of Scope）
- 所有功能对所有用户开放，不进行权限区分
- 如果未来需要实现权限控制，可以参考基于角色的访问控制（RBAC）模式

### 3. 审计日志模块
- 所有类目和属性模板的变更操作都会记录审计日志
- 日志包含操作人、操作时间、操作内容等信息
- 支持操作历史查询和回滚功能