# SPU 管理功能数据模型设计文档

## 概述

基于规格文档和前端Mock数据实现策略，本文档定义了SPU（Standard Product Unit）管理功能的完整TypeScript数据模型、状态管理架构、API接口规范和组件接口设计，为前端开发提供全面的数据结构支持。

### 技术栈
- **Language**: TypeScript 5.0.4
- **Framework**: React 18.2.0
- **UI Library**: Ant Design 6.1.0
- **State Management**: Redux Toolkit + TanStack Query
- **Mock Service**: MSW (Mock Service Worker)
- **Storage**: Mock data (in-memory + local storage persistence)

### 核心概念
- **SPU**: 标准产品单元，定义"这一类商品是什么"，是商品主数据的骨架
- **SKU**: 库存量单位，隶属于SPU的具体可销售单位
- **三级分类**: 一级/二级/三级分类体系
- **属性模板**: 基于分类的动态属性定义
- **状态流转**: 草稿 → 启用 → 停用的状态管理

## 核心数据类型定义

### 1. SPU 相关类型

```typescript
// 基础SPU类型
export interface SPUItem {
  // 基础信息
  id: string;                          // 唯一标识
  code: string;                        // SPU编码（系统生成）
  name: string;                        // SPU名称，必填，最大100字符
  shortName?: string;                  // 标准简称，可选
  description?: string;                // 商品基础描述信息
  unit?: string;                       // 标准单位（瓶/包/盒等）

  // 分类和品牌
  categoryId: string;                  // 三级分类ID，必填
  categoryName: string;                // 分类名称（完整路径）
  categoryPath: string[];              // 分类路径数组
  brandId: string;                     // 品牌ID，必填
  brandName: string;                   // 品牌名称

  // 状态管理
  status: SPUStatus;                   // 状态：草稿/启用/停用

  // 属性信息
  attributes: SPUAttribute[];          // 动态属性列表
  images: ProductImage[];              // 商品图片数组
  tags: string[];                      // 标签数组

  // 价格库存信息（关联SKU的聚合信息）
  priceInfo: PriceAggregate;           // 价格聚合信息
  stockInfo: StockAggregate;           // 库存聚合信息
  skuCount: number;                    // 关联SKU数量

  // 审计信息
  createdAt: string;                   // 创建时间
  updatedAt: string;                   // 更新时间
  createdBy: string;                   // 创建人
  updatedBy: string;                   // 更新人
}

// SPU状态枚举
export enum SPUStatus {
  DRAFT = 'draft',                     // 草稿 - 未对外使用，仅内部编辑阶段
  ACTIVE = 'active',                   // 启用 - 可被SKU使用，可被其他模块引用
  INACTIVE = 'inactive',               // 停用 - 保留历史数据，不允许创建新SKU关联
}

// 商品图片类型
export interface ProductImage {
  id: string;                          // 图片ID
  url: string;                         // 图片URL
  alt?: string;                        // 图片描述
  type: ImageType;                     // 图片类型
  sortOrder: number;                   // 排序序号
  isMain: boolean;                     // 是否主图
}

// 图片类型枚举
export enum ImageType {
  MAIN = 'main',                       // 主图
  DETAIL = 'detail',                   // 详情图
  GALLERY = 'gallery',                 // 商品图库
  PACKAGING = 'packaging',             // 包装图
}

// 价格聚合信息
export interface PriceAggregate {
  minPrice: number;                    // 最低价格
  maxPrice: number;                    // 最高价格
  avgPrice: number;                    // 平均价格
  currency: string;                    // 货币单位
}

// 库存聚合信息
export interface StockAggregate {
  totalStock: number;                  // 总库存
  availableStock: number;              // 可用库存
  reservedStock: number;               // 预留库存
  lowStockWarning: boolean;            // 是否低库存预警
}

// SPU属性类型
export interface SPUAttribute {
  id: string;                          // 属性ID
  key: string;                         // 属性键
  name: string;                        // 属性显示名称
  type: AttributeType;                 // 属性类型
  value: AttributeValue;               // 属性值
  required: boolean;                   // 是否必填
  unit?: string;                       // 单位
  options?: AttributeOption[];         // 选项（用于select类型）
  validationRules?: ValidationRule[];  // 验证规则
  sortOrder: number;                   // 排序序号
  groupId?: string;                    // 属性分组ID
  groupName?: string;                  // 属性分组名称
}

// 属性值类型
export type AttributeValue = string | number | boolean | string[] | Date;

// 属性类型枚举
export enum AttributeType {
  TEXT = 'text',                       // 文本输入
  TEXTAREA = 'textarea',               // 多行文本
  NUMBER = 'number',                   // 数字输入
  SELECT = 'select',                   // 单选下拉
  MULTI_SELECT = 'multi_select',       // 多选
  RADIO = 'radio',                     // 单选按钮
  CHECKBOX = 'checkbox',               // 复选框
  DATE = 'date',                       // 日期选择
  DATETIME = 'datetime',               // 日期时间选择
  BOOLEAN = 'boolean',                 // 布尔值
  SWITCH = 'switch',                   // 开关
  SLIDER = 'slider',                   // 滑块
  COLOR = 'color',                     // 颜色选择
  URL = 'url',                         // URL链接
  EMAIL = 'email',                     // 邮箱
  PHONE = 'phone',                     // 电话号码
}

// 属性选项
export interface AttributeOption {
  id: string;                          // 选项ID
  value: string | number;              // 选项值
  label: string;                       // 显示标签
  description?: string;                // 选项描述
  sortOrder: number;                   // 排序序号
  disabled?: boolean;                  // 是否禁用
  icon?: string;                       // 选项图标
}

// 验证规则
export interface ValidationRule {
  type: ValidationType;                // 验证类型
  value?: any;                         // 验证值
  message: string;                     // 错误消息
  trigger?: ValidationTrigger;         // 触发时机
}

// 验证类型枚举
export enum ValidationType {
  REQUIRED = 'required',               // 必填
  MIN_LENGTH = 'minLength',            // 最小长度
  MAX_LENGTH = 'maxLength',            // 最大长度
  MIN = 'min',                         // 最小值
  MAX = 'max',                         // 最大值
  PATTERN = 'pattern',                 // 正则表达式
  EMAIL = 'email',                     // 邮箱格式
  URL = 'url',                         // URL格式
  PHONE = 'phone',                     // 电话格式
  CUSTOM = 'custom',                   // 自定义验证
}

// 验证触发时机
export enum ValidationTrigger {
  CHANGE = 'change',                   // 值变化时
  BLUR = 'blur',                       // 失焦时
  SUBMIT = 'submit',                   // 提交时
}
```

### 2. 分类和品牌类型

```typescript
// 三级商品分类类型
export interface CategoryItem {
  // 基础信息
  id: string;                          // 分类ID
  code: string;                        // 分类编码
  name: string;                        // 分类名称
  description?: string;                // 分类描述
  icon?: string;                       // 分类图标

  // 层级结构
  parentId?: string;                   // 父分类ID
  level: CategoryLevel;                // 分类层级（1-3）
  path: string[];                      // 分类路径数组
  fullPath: string;                    // 完整分类路径字符串

  // 属性模板
  attributeTemplateId?: string;        // 属性模板ID
  attributeTemplates: AttributeTemplate[]; // 继承的属性模板列表

  // 状态管理
  status: CategoryStatus;              // 启用/停用状态
  sortOrder: number;                   // 排序序号

  // 业务统计
  spuCount: number;                    // 关联SPU数量
  skuCount: number;                    // 关联SKU数量

  // 审计信息
  createdAt: string;                   // 创建时间
  updatedAt: string;                   // 更新时间
  createdBy: string;                   // 创建人
  updatedBy: string;                   // 更新人

  // 树形结构
  children?: CategoryItem[];           // 子分类列表（仅查询时使用）
}

// 分类层级枚举
export enum CategoryLevel {
  LEVEL_1 = 1,                         // 一级分类
  LEVEL_2 = 2,                         // 二级分类
  LEVEL_3 = 3,                         // 三级分类
}

// 分类状态枚举
export enum CategoryStatus {
  ACTIVE = 1,                          // 启用
  INACTIVE = 0                         // 停用
}

// 品牌类型
export interface BrandItem {
  // 基础信息
  id: string;                          // 品牌ID
  code: string;                        // 品牌编码
  name: string;                        // 品牌名称
  shortName?: string;                  // 品牌简称
  englishName?: string;                // 英文名称
  logo?: string;                       // 品牌Logo URL
  description?: string;                // 品牌描述

  // 联系信息
  website?: string;                    // 官方网站
  contactPhone?: string;               // 联系电话
  contactEmail?: string;               // 联系邮箱

  // 状态管理
  status: BrandStatus;                 // 启用/停用状态
  sortOrder: number;                   // 排序序号
  featured: boolean;                   // 是否推荐品牌

  // 业务统计
  spuCount: number;                    // 关联SPU数量
  skuCount: number;                    // 关联SKU数量

  // 审计信息
  createdAt: string;                   // 创建时间
  updatedAt: string;                   // 更新时间
  createdBy: string;                   // 创建人
  updatedBy: string;                   // 更新人
}

// 品牌状态枚举
export enum BrandStatus {
  ACTIVE = 1,                          // 启用
  INACTIVE = 0                         // 停用
}
```

### 3. 属性模板类型

```typescript
// 属性模板类型
export interface AttributeTemplate {
  // 基础信息
  id: string;                          // 模板ID
  code: string;                        // 模板编码
  name: string;                        // 模板名称
  description?: string;                // 模板描述

  // 关联关系
  categoryId: string;                  // 关联分类ID
  categoryName: string;                // 分类名称
  categoryLevel: CategoryLevel;        // 分类层级

  // 模板配置
  type: TemplateType;                  // 模板类型
  status: TemplateStatus;              // 启用/停用状态
  inheritable: boolean;                // 是否可被子分类继承

  // 属性定义
  attributeGroups: AttributeGroup[];   // 属性分组列表
  attributeDefinitions: AttributeDefinition[]; // 属性定义列表

  // 使用统计
  usageCount: number;                  // 使用次数
  lastUsedAt?: string;                 // 最后使用时间

  // 审计信息
  createdAt: string;                   // 创建时间
  updatedAt: string;                   // 更新时间
  createdBy: string;                   // 创建人
  updatedBy: string;                   // 更新人
}

// 模板类型枚举
export enum TemplateType {
  BASIC = 'basic',                     // 基础属性 - 商品固有属性
  SALE = 'sale',                       // 销售属性 - 影响销售决策的属性
  MARKETING = 'marketing',             // 营销属性 - 营销活动相关属性
  QUALITY = 'quality',                 // 质量属性 - 质量控制相关属性
  LOGISTICS = 'logistics',             // 物流属性 - 物流配送相关属性
  EXTEND = 'extend'                    // 扩展属性 - 其他自定义属性
}

// 模板状态枚举
export enum TemplateStatus {
  ACTIVE = 1,                          // 启用
  INACTIVE = 0,                         // 停用
}

// 属性分组
export interface AttributeGroup {
  id: string;                          // 分组ID
  templateId: string;                  // 模板ID
  name: string;                        // 分组名称
  description?: string;                // 分组描述
  sortOrder: number;                   // 排序序号
  collapsible: boolean;                // 是否可折叠
  collapsed: boolean;                  // 默认是否折叠
  columnCount: number;                 // 列数（1-4）
}

// 属性定义
export interface AttributeDefinition {
  // 基础信息
  id: string;                          // 属性ID
  templateId: string;                  // 模板ID
  groupId?: string;                    // 分组ID
  key: string;                         // 属性键（编程用）
  name: string;                        // 属性名称（显示用）
  description?: string;                // 属性描述
  placeholder?: string;                // 占位符文本

  // 类型配置
  type: AttributeType;                 // 属性类型
  required: boolean;                   // 是否必填
  multiple: boolean;                   // 是否支持多值
  searchable: boolean;                 // 是否可搜索
  filterable: boolean;                 // 是否可筛选

  // 默认值和选项
  defaultValue?: AttributeValue;       // 默认值
  options?: AttributeOption[];         // 选项列表（选择类型使用）

  // 验证规则
  validationRules?: ValidationRule[];  // 验证规则数组

  // 显示配置
  sortOrder: number;                   // 排序序号
  width?: number;                      // 显示宽度（栅格系统）
  span?: number;                       // 占用列数（1-24）
  direction?: 'horizontal' | 'vertical'; // 排列方向

  // 高级配置
  dependentFields?: string[];          // 依赖字段
  condition?: FieldCondition;          // 显示条件
  transform?: ValueTransform;          // 值转换规则

  // 审计信息
  createdAt: string;                   // 创建时间
  updatedAt: string;                   // 更新时间
  createdBy: string;                   // 创建人
  updatedBy: string;                   // 更新人
}

// 字段显示条件
export interface FieldCondition {
  field: string;                       // 依赖字段
  operator: ConditionOperator;         // 条件操作符
  value: any;                          // 条件值
  logic?: 'AND' | 'OR';                // 多条件逻辑关系
}

// 条件操作符
export enum ConditionOperator {
  EQUALS = 'equals',                   // 等于
  NOT_EQUALS = 'notEquals',           // 不等于
  CONTAINS = 'contains',               // 包含
  NOT_CONTAINS = 'notContains',       // 不包含
  STARTS_WITH = 'startsWith',         // 开始于
  ENDS_WITH = 'endsWith',             // 结束于
  GREATER_THAN = 'greaterThan',       // 大于
  LESS_THAN = 'lessThan',             // 小于
  GREATER_EQUAL = 'greaterEqual',     // 大于等于
  LESS_EQUAL = 'lessEqual',           // 小于等于
  IN = 'in',                         // 在数组中
  NOT_IN = 'notIn',                   // 不在数组中
  IS_EMPTY = 'isEmpty',               // 为空
  IS_NOT_EMPTY = 'isNotEmpty',       // 不为空
}

// 值转换规则
export interface ValueTransform {
  input: (value: any) => any;         // 输入转换
  output: (value: any) => any;        // 输出转换
  display?: (value: any) => string;   // 显示转换
}
```

### 4. UI 状态和交互类型

```typescript
// 分页信息
export interface PaginationInfo {
  current: number;                     // 当前页码
  pageSize: number;                    // 每页大小
  total: number;                       // 总记录数
  totalPages: number;                  // 总页数
  showSizeChanger?: boolean;           // 是否显示每页大小选择器
  showQuickJumper?: boolean;           // 是否显示快速跳转
  showTotal?: boolean;                 // 是否显示总数
  pageSizeOptions?: number[];          // 可选每页大小
}

// SPU筛选条件
export interface SPUFilters {
  // 基础筛选
  keyword?: string;                    // 关键词搜索（SPU名称/编码）
  categoryId?: string;                 // 分类筛选（支持多级分类）
  brandId?: string;                    // 品牌筛选
  status?: SPUStatus[];                // 状态筛选（支持多选）

  // 价格筛选
  priceRange?: PriceRangeFilter;       // 价格区间筛选
  priceRangeType?: PriceRangeType;     // 价格区间类型

  // 库存筛选
  stockRange?: StockRangeFilter;       // 库存区间筛选
  lowStockOnly?: boolean;              // 仅显示低库存商品

  // 标签筛选
  tags?: string[];                     // 标签筛选
  hasImagesOnly?: boolean;             // 仅显示有图片商品

  // 时间筛选
  dateRange?: DateRangeFilter;         // 创建时间范围
  updateDateRange?: DateRangeFilter;   // 更新时间范围

  // 创建人筛选
  createdBy?: string;                  // 创建人筛选
  updatedBy?: string;                  // 更新人筛选

  // 属性筛选
  attributeFilters?: AttributeFilter[]; // 动态属性筛选
}

// 价格区间筛选
export interface PriceRangeFilter {
  min?: number;                        // 最低价格
  max?: number;                        // 最高价格
}

// 价格区间类型
export enum PriceRangeType {
  AVG_PRICE = 'avgPrice',              // 平均价格
  MIN_PRICE = 'minPrice',              // 最低价格
  MAX_PRICE = 'maxPrice',              // 最高价格
}

// 库存区间筛选
export interface StockRangeFilter {
  min?: number;                        // 最小库存
  max?: number;                        // 最大库存
  stockType?: StockType;               // 库存类型
}

// 库存类型
export enum StockType {
  TOTAL = 'total',                     // 总库存
  AVAILABLE = 'available',             // 可用库存
  RESERVED = 'reserved',               // 预留库存
}

// 日期区间筛选
export interface DateRangeFilter {
  start?: string;                      // 开始日期
  end?: string;                        // 结束日期
  preset?: DatePreset;                 // 预设选项
}

// 日期预设选项
export enum DatePreset {
  TODAY = 'today',                     // 今天
  YESTERDAY = 'yesterday',             // 昨天
  THIS_WEEK = 'thisWeek',             // 本周
  LAST_WEEK = 'lastWeek',             // 上周
  THIS_MONTH = 'thisMonth',           // 本月
  LAST_MONTH = 'lastMonth',           // 上月
  LAST_7_DAYS = 'last7Days',          // 最近7天
  LAST_30_DAYS = 'last30Days',        // 最近30天
  LAST_90_DAYS = 'last90Days',        // 最近90天
}

// 动态属性筛选
export interface AttributeFilter {
  attributeId: string;                 // 属性ID
  attributeKey: string;                // 属性键
  attributeName: string;               // 属性名称
  attributeType: AttributeType;        // 属性类型
  operator: FilterOperator;            // 筛选操作符
  values: AttributeValue[];            // 筛选值（支持多值）
}

// 筛选操作符
export enum FilterOperator {
  EQUALS = 'equals',                   // 等于
  NOT_EQUALS = 'notEquals',           // 不等于
  CONTAINS = 'contains',               // 包含
  NOT_CONTAINS = 'notContains',       // 不包含
  STARTS_WITH = 'startsWith',         // 开始于
  ENDS_WITH = 'endsWith',             // 结束于
  GREATER_THAN = 'greaterThan',       // 大于
  LESS_THAN = 'lessThan',             // 小于
  GREATER_EQUAL = 'greaterEqual',     // 大于等于
  LESS_EQUAL = 'lessEqual',           // 小于等于
  IN = 'in',                         // 在数组中
  NOT_IN = 'notIn',                   // 不在数组中
  IS_EMPTY = 'isEmpty',               // 为空
  IS_NOT_EMPTY = 'isNotEmpty',       // 不为空
  BETWEEN = 'between',               // 区间之间
}

// 排序配置
export interface SortConfig {
  field: SortField;                    // 排序字段
  order: SortOrder;                    // 排序方向
}

// 排序字段枚举
export enum SortField {
  CREATED_TIME = 'createdAt',         // 创建时间
  UPDATED_TIME = 'updatedAt',         // 更新时间
  NAME = 'name',                       // SPU名称
  CODE = 'code',                       // SPU编码
  CATEGORY_NAME = 'categoryName',     // 分类名称
  BRAND_NAME = 'brandName',           // 品牌名称
  AVG_PRICE = 'priceInfo.avgPrice',   // 平均价格
  MIN_PRICE = 'priceInfo.minPrice',   // 最低价格
  MAX_PRICE = 'priceInfo.maxPrice',   // 最高价格
  TOTAL_STOCK = 'stockInfo.totalStock', // 总库存
  SKU_COUNT = 'skuCount',             // SKU数量
  STATUS = 'status'                   // 状态
}

// 排序方向枚举
export enum SortOrder {
  ASC = 'asc',                         // 升序
  DESC = 'desc'                        // 降序
}

// 表格列配置
export interface ColumnConfig {
  key: string;                         // 列键
  title: string;                       // 列标题
  dataIndex: string;                  // 数据字段
  width?: number;                      // 列宽度
  minWidth?: number;                   // 最小宽度
  maxWidth?: number;                   // 最大宽度
  fixed?: 'left' | 'right';           // 固定位置
  sortable?: boolean;                  // 是否可排序
  filterable?: boolean;                // 是否可筛选
  resizable?: boolean;                 // 是否可调整大小
  ellipsis?: boolean;                  // 是否超出省略
  align?: 'left' | 'center' | 'right'; // 对齐方式
  render?: (value: any, record: any, index: number) => React.ReactNode; // 自定义渲染
  shouldCellUpdate?: (prevRecord: any, nextRecord: any) => boolean; // 是否更新单元格
  className?: string;                  // 自定义类名
  onHeaderCell?: (column: ColumnConfig) => any; // 表头单元格配置
  onCell?: (record: any) => any;       // 单元格配置
}

// 列固定配置
export interface ColumnFixedConfig {
  left?: number;                       // 左侧固定宽度
  right?: number;                      // 右侧固定宽度
}

// 表格配置
export interface TableConfig {
  columns: ColumnConfig[];             // 列配置
  rowSelection?: RowSelectionConfig;   // 行选择配置
  scroll?: ScrollConfig;               // 滚动配置
  pagination?: PaginationConfig;       // 分页配置
  size?: 'small' | 'middle' | 'large'; // 表格尺寸
  bordered?: boolean;                  // 是否显示边框
  showHeader?: boolean;                // 是否显示表头
  loading?: boolean;                   // 加载状态
  emptyText?: string;                  // 空数据文本
  rowKey?: string;                     // 行键
  expandable?: ExpandableConfig;       // 展开配置
}

// 行选择配置
export interface RowSelectionConfig {
  type?: 'checkbox' | 'radio';        // 选择类型
  selectedRowKeys?: string[];          // 选中的行键
  onChange?: (selectedRowKeys: string[], selectedRows: any[]) => void; // 选择变化回调
  getCheckboxProps?: (record: any) => any; // 复选框属性
  columnWidth?: number;                // 选择列宽度
  fixed?: boolean | 'left' | 'right';  // 是否固定
  hideDefaultSelections?: boolean;     // 隐藏默认选择
  selections?: any[];                  // 自定义选择项
}

// 滚动配置
export interface ScrollConfig {
  x?: number | true | string;          // 横向滚动
  y?: number | string;                 // 纵向滚动
  scrollToFirstRowOnChange?: boolean;  // 变化时滚动到第一行
}

// 分页配置
export interface PaginationConfig extends PaginationInfo {
  showSizeChanger?: boolean;           // 是否显示每页大小选择器
  showQuickJumper?: boolean;           // 是否显示快速跳转
  showTotal?: boolean | ((total: number, range: [number, number]) => React.ReactNode); // 显示总数
  size?: 'default' | 'small';         // 分页尺寸
  simple?: boolean;                    // 简单模式
  position?: 'top' | 'bottom' | 'both'; // 分页位置
}

// 展开配置
export interface ExpandableConfig {
  expandedRowKeys?: string[];          // 展开的行键
  defaultExpandedRowKeys?: string[];   // 默认展开的行键
  expandedRowRender?: (record: any, index: number, indent: number, expanded: boolean) => React.ReactNode; // 展开行渲染
  onExpandedRowsChange?: (expandedRows: string[]) => void; // 展开行变化回调
  columnWidth?: number;                // 展开列宽度
  fixed?: boolean | 'left' | 'right';  // 是否固定
  rowExpandable?: (record: any) => boolean; // 行是否可展开
}
```

## 状态管理架构

### 1. Redux Store 结构

```typescript
// 全局Store状态结构
export interface RootState {
  spu: SPUState;                       // SPU相关状态
  category: CategoryState;             // 分类相关状态
  brand: BrandState;                   // 品牌相关状态
  attributeTemplate: AttributeTemplateState; // 属性模板相关状态
  ui: UIState;                         // UI相关状态
  user: UserState;                     // 用户相关状态（Mock）
  app: AppState;                       // 应用全局状态
}

// SPU状态结构
export interface SPUState {
  // 数据状态
  items: SPUItem[];                    // SPU列表
  selectedItem: SPUItem | null;        // 当前选中项
  itemsMap: Record<string, SPUItem>;   // SPU映射表（快速查找）
  categories: CategoryItem[];          // 分类列表
  brands: BrandItem[];                 // 品牌列表
  attributeTemplates: AttributeTemplate[]; // 属性模板列表

  // UI状态
  loading: LoadingState;               // 加载状态
  errors: ErrorState;                  // 错误状态

  // 交互状态
  filters: SPUFilters;                 // 当前筛选条件
  pagination: PaginationInfo;          // 分页信息
  sortConfig: SortConfig;              // 排序配置
  selectedRowKeys: string[];           // 选中的行ID
  selectedItems: SPUItem[];            // 选中的SPU列表

  // 表单状态
  formMode: FormMode;                  // 表单模式
  formData: Partial<SPUItem>;          // 表单数据
  formErrors: FormErrors;              // 表单错误
  isFormDirty: boolean;                // 表单是否已修改
  formValidationSchema?: any;          // 表单验证模式

  // 缓存状态
  lastFetchTime: number;               // 最后获取时间
  cacheExpiry: number;                 // 缓存过期时间

  // 批量操作状态
  batchOperation: BatchOperationState;  // 批量操作状态
}

// 分类状态结构
export interface CategoryState {
  // 数据状态
  items: CategoryItem[];               // 分类列表
  itemTree: CategoryItem[];            // 分类树形结构
  itemsMap: Record<string, CategoryItem>; // 分类映射表

  // UI状态
  loading: LoadingState;
  errors: ErrorState;

  // 展开状态
  expandedKeys: string[];              // 展开的分类键
  selectedKeys: string[];              // 选中的分类键
}

// 品牌状态结构
export interface BrandState {
  // 数据状态
  items: BrandItem[];                  // 品牌列表
  itemsMap: Record<string, BrandItem>; // 品牌映射表
  featuredItems: BrandItem[];          // 推荐品牌

  // UI状态
  loading: LoadingState;
  errors: ErrorState;

  // 筛选状态
  selectedBrandIds: string[];          // 选中的品牌ID
}

// 属性模板状态结构
export interface AttributeTemplateState {
  // 数据状态
  items: AttributeTemplate[];          // 模板列表
  itemsMap: Record<string, AttributeTemplate>; // 模板映射表
  currentTemplate: AttributeTemplate | null; // 当前模板

  // UI状态
  loading: LoadingState;
  errors: ErrorState;
}

// UI状态结构
export interface UIState {
  // 布局状态
  sidebarCollapsed: boolean;           // 侧边栏折叠状态
  theme: 'light' | 'dark';             // 主题模式
  language: string;                    // 语言设置

  // 页面状态
  currentPage: string;                 // 当前页面
  breadcrumbs: BreadcrumbItem[];       // 面包屑导航

  // 模态框状态
  modals: Record<string, ModalState>;  // 模态框状态映射
  drawers: Record<string, DrawerState>; // 抽屉状态映射

  // 通知状态
  notifications: NotificationState[];  // 通知列表

  // 响应式状态
  screenSize: ScreenSize;              // 屏幕尺寸
  isMobile: boolean;                   // 是否移动端
  isTablet: boolean;                   // 是否平板
}

// 应用全局状态
export interface AppState {
  // 系统信息
  version: string;                     // 应用版本
  buildTime: string;                   // 构建时间
  environment: 'development' | 'production' | 'test'; // 环境类型

  // 性能监控
  performance: PerformanceState;       // 性能状态

  // 错误监控
  globalErrors: GlobalError[];         // 全局错误列表

  // 用户偏好设置
  preferences: UserPreferences;        // 用户偏好设置
}

// 加载状态
export interface LoadingState {
  // 基础操作加载状态
  list: boolean;                       // 列表加载
  detail: boolean;                     // 详情加载
  create: boolean;                     // 创建操作
  update: boolean;                     // 更新操作
  delete: boolean;                     // 删除操作
  batch: boolean;                      // 批量操作

  // 特定操作加载状态
  upload: boolean;                     // 文件上传
  export: boolean;                     // 数据导出
  import: boolean;                     // 数据导入
  validation: boolean;                 // 表单验证

  // 全局加载状态
  global: boolean;                     // 全局加载遮罩
}

// 错误状态
export interface ErrorState {
  // 基础操作错误
  list?: string;                       // 列表错误
  detail?: string;                     // 详情错误
  create?: string;                     // 创建错误
  update?: string;                     // 更新错误
  delete?: string;                     // 删除错误
  batch?: string;                      // 批量操作错误

  // 特定操作错误
  upload?: string;                     // 上传错误
  export?: string;                     // 导出错误
  import?: string;                     // 导入错误
  validation?: Record<string, string>; // 字段验证错误

  // 网络错误
  network?: NetworkError;              // 网络错误
  server?: ServerError;                // 服务器错误
}

// 网络错误
export interface NetworkError {
  code: string;                        // 错误代码
  message: string;                     // 错误消息
  status?: number;                     // HTTP状态码
  url?: string;                        // 请求URL
  timestamp: number;                   // 错误时间戳
}

// 服务器错误
export interface ServerError {
  code: string;                        // 错误代码
  message: string;                     // 错误消息
  details?: any;                       // 错误详情
  traceId?: string;                    // 追踪ID
  timestamp: number;                   // 错误时间戳
}

// 表单模式枚举
export enum FormMode {
  CREATE = 'create',                   // 创建模式
  EDIT = 'edit',                       // 编辑模式
  VIEW = 'view',                       // 查看模式
  COPY = 'copy',                       // 复制模式
  BATCH_EDIT = 'batchEdit',            // 批量编辑模式
}

// 表单错误
export interface FormErrors {
  [key: string]: string | undefined;   // 字段错误信息
}

// 批量操作状态
export interface BatchOperationState {
  operation: 'create' | 'update' | 'delete' | 'export' | 'import' | null; // 操作类型
  selectedIds: string[];               // 选中项ID列表
  progress: number;                    // 操作进度 (0-100)
  currentStep: number;                 // 当前步骤
  totalSteps: number;                  // 总步骤数
  results: BatchOperationResult[];     // 操作结果
  status: BatchOperationStatus;        // 操作状态
}

// 批量操作状态枚举
export enum BatchOperationStatus {
  IDLE = 'idle',                       // 空闲
  PREPARING = 'preparing',             // 准备中
  PROCESSING = 'processing',           // 处理中
  COMPLETED = 'completed',             // 已完成
  FAILED = 'failed',                   // 失败
  CANCELLED = 'cancelled'              // 已取消
}

// 批量操作结果
export interface BatchOperationResult {
  id: string;                          // 项目ID
  success: boolean;                    // 是否成功
  error?: string;                      // 错误信息
  data?: any;                          // 返回数据
}

// 面包屑项
export interface BreadcrumbItem {
  title: string;                       // 标题
  path?: string;                       // 路径
  icon?: string;                       // 图标
}

// 模态框状态
export interface ModalState {
  visible: boolean;                    // 是否可见
  title?: string;                      // 标题
  content?: any;                       // 内容
  width?: number;                      // 宽度
  height?: number;                     // 高度
  closable?: boolean;                  // 是否可关闭
  maskClosable?: boolean;              // 点击遮罩关闭
  destroyOnClose?: boolean;            // 关闭时销毁
}

// 抽屉状态
export interface DrawerState {
  visible: boolean;                    // 是否可见
  title?: string;                      // 标题
  content?: any;                       // 内容
  placement: 'left' | 'right' | 'top' | 'bottom'; // 位置
  width?: number;                      // 宽度
  height?: number;                     // 高度
  closable?: boolean;                  // 是否可关闭
  maskClosable?: boolean;              // 点击遮罩关闭
}

// 通知状态
export interface NotificationState {
  id: string;                          // 通知ID
  type: 'success' | 'error' | 'warning' | 'info'; // 通知类型
  title: string;                       // 标题
  message?: string;                    // 消息
  duration?: number;                   // 显示时长
  timestamp: number;                   // 时间戳
  read: boolean;                       // 是否已读
}

// 屏幕尺寸枚举
export enum ScreenSize {
  XS = 'xs',                           // 超小屏 (<576px)
  SM = 'sm',                           // 小屏 (≥576px)
  MD = 'md',                           // 中屏 (≥768px)
  LG = 'lg',                           // 大屏 (≥992px)
  XL = 'xl',                           // 超大屏 (≥1200px)
  XXL = 'xxl'                          // 超超大屏 (≥1600px)
}

// 性能状态
export interface PerformanceState {
  // 页面性能
  pageLoadTime: number;                // 页面加载时间
  firstContentfulPaint: number;        // 首次内容绘制
  largestContentfulPaint: number;      // 最大内容绘制

  // 内存使用
  memoryUsed: number;                  // 已用内存
  memoryTotal: number;                 // 总内存
  memoryUsage: number;                 // 内存使用率

  // 渲染性能
  renderTime: number;                  // 渲染时间
  frameRate: number;                   // 帧率
}

// 全局错误
export interface GlobalError {
  id: string;                          // 错误ID
  type: 'javascript' | 'network' | 'runtime'; // 错误类型
  message: string;                     // 错误消息
  stack?: string;                      // 错误堆栈
  url: string;                         // 发生错误的URL
  timestamp: number;                   // 时间戳
  resolved: boolean;                   // 是否已解决
}

// 用户偏好设置
export interface UserPreferences {
  // 界面设置
  theme: 'light' | 'dark' | 'auto';   // 主题设置
  language: string;                    // 语言设置
  fontSize: 'small' | 'medium' | 'large'; // 字体大小

  // 表格设置
  tablePageSize: number;               // 表格每页大小
  tableDensity: 'small' | 'middle' | 'large'; // 表格密度

  // 功能设置
  autoSave: boolean;                   // 自动保存
  showTips: boolean;                   // 显示提示
  enableAnimations: boolean;           // 启用动画
}

// 用户状态（Mock）
export interface UserState {
  // 基础信息
  id: string;                          // 用户ID
  username: string;                    // 用户名
  email: string;                       // 邮箱
  displayName: string;                 // 显示名称
  avatar?: string;                     // 头像URL

  // 角色权限
  roles: string[];                     // 角色列表
  permissions: string[];               // 权限列表

  // 状态信息
  status: 'active' | 'inactive' | 'suspended'; // 用户状态
  lastLoginAt: string;                 // 最后登录时间
  createdAt: string;                   // 创建时间
}
```

### 2. Action 类型定义

```typescript
// SPU Action类型
export interface SPUActionTypes {
  // 异步Actions
  FETCH_SPUS_REQUEST: 'spu/fetchSpusRequest';
  FETCH_SPUS_SUCCESS: 'spu/fetchSpusSuccess';
  FETCH_SPUS_FAILURE: 'spu/fetchSpusFailure';

  FETCH_SPU_DETAIL_REQUEST: 'spu/fetchSpuDetailRequest';
  FETCH_SPU_DETAIL_SUCCESS: 'spu/fetchSpuDetailSuccess';
  FETCH_SPU_DETAIL_FAILURE: 'spu/fetchSpuDetailFailure';

  CREATE_SPU_REQUEST: 'spu/createSpuRequest';
  CREATE_SPU_SUCCESS: 'spu/createSpuSuccess';
  CREATE_SPU_FAILURE: 'spu/createSpuFailure';

  UPDATE_SPU_REQUEST: 'spu/updateSpuRequest';
  UPDATE_SPU_SUCCESS: 'spu/updateSpuSuccess';
  UPDATE_SPU_FAILURE: 'spu/updateSpuFailure';

  DELETE_SPU_REQUEST: 'spu/deleteSpuRequest';
  DELETE_SPU_SUCCESS: 'spu/deleteSpuSuccess';
  DELETE_SPU_FAILURE: 'spu/deleteSpuFailure';

  BATCH_UPDATE_REQUEST: 'spu/batchUpdateRequest';
  BATCH_UPDATE_SUCCESS: 'spu/batchUpdateSuccess';
  BATCH_UPDATE_FAILURE: 'spu/batchUpdateFailure';

  // 同步Actions
  SET_FILTERS: 'spu/setFilters';
  CLEAR_FILTERS: 'spu/clearFilters';
  SET_PAGINATION: 'spu/setPagination';
  SET_SORT_CONFIG: 'spu/setSortConfig';
  SET_SELECTED_ROWS: 'spu/setSelectedRows';
  CLEAR_SELECTED_ROWS: 'spu/clearSelectedRows';

  SET_FORM_MODE: 'spu/setFormMode';
  SET_FORM_DATA: 'spu/setFormData';
  UPDATE_FORM_DATA: 'spu/updateFormData';
  CLEAR_FORM_DATA: 'spu/clearFormData';
  SET_FORM_ERRORS: 'spu/setFormErrors';
  CLEAR_FORM_ERRORS: 'spu/clearFormErrors';
  SET_FORM_DIRTY: 'spu/setFormDirty';

  SET_LOADING: 'spu/setLoading';
  CLEAR_ERROR: 'spu/clearError';
  CLEAR_ERRORS: 'spu/clearErrors';
}

// Action创建器类型
export type SPUAction =
  | FetchSPUsAction
  | FetchSPUDetailAction
  | CreateSPUAction
  | UpdateSPUAction
  | DeleteSPUAction
  | BatchUpdateSPUAction
  | SetFiltersAction
  | SetPaginationAction
  | SetSortConfigAction
  | SetSelectedRowsAction
  | SetFormModeAction
  | SetFormDataAction
  | UpdateFormDataAction
  | SetFormErrorsAction
  | SetLoadingAction
  | ClearErrorAction;
```

## 组件接口定义

### 1. 列表组件接口

```typescript
// SPU列表组件Props
export interface SPUListProps {
  // 数据相关
  items?: SPUItem[];                   // 外部数据（Mock测试用）
  loading?: boolean;                   // 加载状态
  pagination?: PaginationInfo;         // 分页信息

  // 功能配置
  enableSelection?: boolean;           // 是否启用选择
  enableActions?: boolean;             // 是否启用操作按钮
  enableSearch?: boolean;              // 是否启用搜索
  enableFilter?: boolean;              // 是否启用筛选
  enableSort?: boolean;                // 是否启用排序

  // 事件回调
  onRowSelect?: (selectedRows: SPUItem[]) => void;
  onEdit?: (item: SPUItem) => void;
  onView?: (item: SPUItem) => void;
  onDelete?: (id: string) => void;
  onCopy?: (item: SPUItem) => void;
  onStatusChange?: (id: string, status: SPUStatus) => void;

  // 配置选项
  columnConfig?: ColumnConfig[];       // 列配置
  searchConfig?: SearchConfig;         // 搜索配置
  filterConfig?: FilterConfig;         // 筛选配置

  // 样式配置
  className?: string;                  // 自定义类名
  style?: React.CSSProperties;         // 自定义样式
  height?: number | string;            // 列表高度
  scroll?: { x?: number; y?: number };  // 滚动配置
}

// 搜索配置
export interface SearchConfig {
  placeholder?: string;                // 搜索框占位符
  fields?: string[];                   // 搜索字段
  maxLength?: number;                  // 最大输入长度
  allowClear?: boolean;                // 是否允许清空
  debounceTime?: number;               // 防抖时间（ms）
}

// 筛选配置
export interface FilterConfig {
  categories?: CategoryItem[];         // 分类选项
  brands?: BrandItem[];                // 品牌选项
  statuses?: Array<{ value: SPUStatus; label: string }>; // 状态选项
  priceRanges?: Array<{ min: number; max: number; label: string }>; // 价格区间选项
  tags?: string[];                     // 可用标签
  datePresets?: Array<{ label: string; value: [string, string] }>; // 日期预设
}
```

### 2. 表单组件接口

```typescript
// SPU表单组件Props
export interface SPUFormProps {
  // 表单模式和数据
  mode: FormMode;                      // 表单模式
  initialValues?: Partial<SPUItem>;    // 初始值

  // 配置选项
  enableValidation?: boolean;          // 是否启用验证
  enableAutoSave?: boolean;            // 是否启用自动保存
  enableReset?: boolean;               // 是否启用重置
  enablePreview?: boolean;             // 是否启用预览

  // 数据选项
  categories?: CategoryItem[];         // 分类选项
  brands?: BrandItem[];                // 品牌选项
  attributeTemplates?: AttributeTemplate[]; // 属性模板

  // 事件回调
  onSubmit?: (data: Partial<SPUItem>) => void;
  onCancel?: () => void;
  onSaveDraft?: (data: Partial<SPUItem>) => void;
  onPreview?: (data: Partial<SPUItem>) => void;
  onValuesChange?: (changedValues: any, allValues: any) => void;
  onValidationChange?: (errors: FormErrors) => void;

  // 验证规则
  validationRules?: ValidationRuleMap; // 自定义验证规则

  // 样式配置
  layout?: 'horizontal' | 'vertical' | 'inline'; // 表单布局
  colon?: boolean;                     // 是否显示冒号
  labelCol?: { span: number };        // 标签宽度
  wrapperCol?: { span: number };      // 输入框宽度

  // 其他配置
  className?: string;                  // 自定义类名
  style?: React.CSSProperties;         // 自定义样式
}

// 验证规则映射
export interface ValidationRuleMap {
  [field: string]: ValidationRule[];
}

// 表单字段配置
export interface FormFieldConfig {
  name: string;                        // 字段名称
  label: string;                       // 字段标签
  type: FormFieldType;                 // 字段类型
  required?: boolean;                  // 是否必填
  placeholder?: string;                // 占位符
  disabled?: boolean;                  // 是否禁用
  visible?: boolean;                   // 是否可见
  options?: FormFieldOption[];         // 选项配置
  validation?: ValidationRule[];       // 验证规则
  dependencies?: string[];              // 依赖字段
  extra?: React.ReactNode;            // 额外内容
  tooltip?: string;                    // 提示信息
  help?: string;                       // 帮助信息
}

// 表单字段类型
export enum FormFieldType {
  INPUT = 'input',                     // 输入框
  TEXTAREA = 'textarea',               // 文本域
  SELECT = 'select',                   // 下拉选择
  MULTI_SELECT = 'multiSelect',       // 多选
  RADIO = 'radio',                     // 单选
  CHECKBOX = 'checkbox',               // 复选框
  DATE_PICKER = 'datePicker',         // 日期选择
  TIME_PICKER = 'timePicker',         // 时间选择
  DATETIME_PICKER = 'dateTimePicker', // 日期时间选择
  NUMBER_INPUT = 'numberInput',       // 数字输入
  SWITCH = 'switch',                   // 开关
  SLIDER = 'slider',                   // 滑块
  RATE = 'rate',                       // 评分
  UPLOAD = 'upload',                   // 上传
  CATEGORY_SELECT = 'categorySelect', // 分类选择
  BRAND_SELECT = 'brandSelect',       // 品牌选择
  ATTRIBUTE_GROUP = 'attributeGroup', // 属性组
  IMAGE_UPLOAD = 'imageUpload',       // 图片上传
  COLOR_PICKER = 'colorPicker',       // 颜色选择器
  URL_INPUT = 'urlInput',             // URL输入
  EMAIL_INPUT = 'emailInput',         // 邮箱输入
  PHONE_INPUT = 'phoneInput',         // 电话输入
  CUSTOM = 'custom'                    // 自定义
}

// 表单字段选项
export interface FormFieldOption {
  value: string | number;              // 选项值
  label: string;                       // 显示标签
  disabled?: boolean;                  // 是否禁用
  description?: string;                // 描述信息
  icon?: string;                       // 选项图标
  color?: string;                      // 选项颜色
}
```

### 3. 详情组件接口

```typescript
// SPU详情组件Props
export interface SPUDetailProps {
  // 数据
  item?: SPUItem;                      // SPU数据
  itemId?: string;                     // SPU ID（用于异步加载）

  // 配置选项
  enableEdit?: boolean;                // 是否启用编辑
  enableDelete?: boolean;              // 是否启用删除
  enableCopy?: boolean;                // 是否启用复制
  enableExport?: boolean;              // 是否启用导出

  // 显示配置
  showBasicInfo?: boolean;             // 是否显示基本信息
  showAttributes?: boolean;           // 是否显示属性
  showImages?: boolean;               // 是否显示图片
  showPriceInfo?: boolean;             // 是否显示价格信息
  showStockInfo?: boolean;             // 是否显示库存信息
  showAuditInfo?: boolean;             // 是否显示审计信息

  // 事件回调
  onEdit?: (item: SPUItem) => void;
  onDelete?: (id: string) => void;
  onCopy?: (item: SPUItem) => void;
  onExport?: (item: SPUItem) => void;
  onStatusChange?: (id: string, status: SPUStatus) => void;

  // 样式配置
  layout?: 'vertical' | 'horizontal';  // 布局方式
  bordered?: boolean;                  // 是否显示边框
  size?: 'small' | 'middle' | 'large'; // 组件尺寸

  // 其他配置
  className?: string;                  // 自定义类名
  style?: React.CSSProperties;         // 自定义样式
}
```

## API 接口类型定义

### 1. 请求和响应类型

```typescript
// SPU列表查询参数
export interface SPUListQueryParams {
  // 分页参数
  page: number;                        // 页码
  pageSize: number;                    // 每页大小

  // 搜索参数
  keyword?: string;                    // 关键词搜索

  // 筛选参数
  categoryId?: string;                 // 分类ID
  brandId?: string;                    // 品牌ID
  status?: SPUStatus[];                // 状态筛选
  priceRange?: PriceRangeFilter;       // 价格区间
  stockRange?: StockRangeFilter;       // 库存区间
  tags?: string[];                     // 标签筛选
  hasImagesOnly?: boolean;             // 仅显示有图片

  // 时间参数
  dateRange?: DateRangeFilter;         // 创建时间范围
  updateDateRange?: DateRangeFilter;   // 更新时间范围

  // 排序参数
  sortBy?: SortField;                  // 排序字段
  sortOrder?: SortOrder;               // 排序方向

  // 属性筛选
  attributeFilters?: AttributeFilter[]; // 动态属性筛选
}

// SPU创建请求
export interface CreateSPURequest {
  // 基础信息
  name: string;                        // SPU名称
  shortName?: string;                  // 简称
  description?: string;                // 描述
  unit?: string;                       // 单位

  // 分类和品牌
  categoryId: string;                  // 分类ID
  brandId: string;                     // 品牌ID

  // 属性信息
  attributes: Record<string, AttributeValue>; // 属性键值对
  tags?: string[];                     // 标签

  // 图片信息
  images?: CreateImageRequest[];       // 图片列表
}

// 图片创建请求
export interface CreateImageRequest {
  url: string;                         // 图片URL
  alt?: string;                        // 图片描述
  type: ImageType;                     // 图片类型
  sortOrder: number;                   // 排序序号
  isMain: boolean;                     // 是否主图
}

// SPU更新请求
export interface UpdateSPURequest {
  id: string;                          // SPU ID
  data: Partial<CreateSPURequest>;     // 更新数据
}

// SPU状态更新请求
export interface UpdateSPUStatusRequest {
  ids: string[];                       // SPU ID列表
  status: SPUStatus;                   // 目标状态
  reason?: string;                     // 变更原因
}

// SPU批量操作请求
export interface BatchSPURequest {
  ids: string[];                       // SPU ID列表
  operation: BatchOperationType;        // 操作类型
  data?: any;                          // 操作数据
}

// 批量操作类型
export enum BatchOperationType {
  DELETE = 'delete',                   // 批量删除
  ENABLE = 'enable',                   // 批量启用
  DISABLE = 'disable',                 // 批量停用
  EXPORT = 'export',                   // 批量导出
  UPDATE_CATEGORY = 'updateCategory',  // 批量更新分类
  UPDATE_BRAND = 'updateBrand',        // 批量更新品牌
  ADD_TAG = 'addTag',                  // 批量添加标签
  REMOVE_TAG = 'removeTag',            // 批量移除标签
}
```

### 2. 响应类型

```typescript
// API响应基类
export interface BaseApiResponse<T = any> {
  success: boolean;                    // 请求是否成功
  code: number;                        // 响应代码
  message: string;                     // 响应消息
  data?: T;                           // 响应数据
  timestamp: number;                   // 响应时间戳
  traceId?: string;                    // 追踪ID
}

// 分页响应数据
export interface PaginatedResponse<T> {
  list: T[];                          // 数据列表
  total: number;                       // 总记录数
  page: number;                        // 当前页码
  pageSize: number;                    // 每页大小
  totalPages: number;                  // 总页数
}

// SPU列表响应
export type SPUListResponse = BaseApiResponse<PaginatedResponse<SPUItem>>;

// SPU详情响应
export type SPUDetailResponse = BaseApiResponse<SPUItem>;

// SPU创建响应
export type CreateSPUResponse = BaseApiResponse<SPUItem>;

// SPU更新响应
export type UpdateSPUResponse = BaseApiResponse<SPUItem>;

// SPU删除响应
export type DeleteSPUResponse = BaseApiResponse<{ successCount: number; failCount: number }>;

// SPU批量操作响应
export type BatchSPUResponse = BaseApiResponse<BatchOperationResult[]>;

// 错误响应
export interface ErrorResponse extends BaseApiResponse {
  success: false;
  error: {
    code: string;                      // 错误代码
    message: string;                   // 错误消息
    details?: any;                     // 错误详情
    field?: string;                    // 错误字段（表单验证错误）
  };
}
```

## Mock数据生成器接口

### 1. 数据生成器核心接口

```typescript
// 通用数据生成器接口
export interface DataGenerator<T, C = GeneratorConfig> {
  // 基础生成方法
  generateSingle(overrides?: Partial<T>): T;
  generateBatch(count: number, overrides?: Partial<T>): T[];

  // 场景生成方法
  generateScenario(type: ScenarioType, config?: C): T[];

  // 数据管理方法
  getGeneratedData(): T[];
  clearData(): void;
  updateData(id: string, updates: Partial<T>): void;
  deleteData(id: string): boolean;
  findData(predicate: (item: T) => boolean): T | undefined;
  filterData(predicate: (item: T) => boolean): T[];

  // 配置管理
  setConfig(config: C): void;
  getConfig(): C;
  resetConfig(): void;
}

// 业务场景类型
export enum ScenarioType {
  // 正常业务场景
  NORMAL = 'normal',                   // 正常业务数据
  FULL_FEATURED = 'fullFeatured',       // 全功能数据（包含所有属性）
  DRAFT_STATUS = 'draftStatus',         // 草稿状态数据
  ACTIVE_STATUS = 'activeStatus',       // 启用状态数据
  INACTIVE_STATUS = 'inactiveStatus',   // 停用状态数据

  // 特殊业务场景
  LOW_STOCK = 'lowStock',             // 低库存场景
  HIGH_PRICE = 'highPrice',           // 高价格商品
  NEW_PRODUCTS = 'newProducts',       // 新品上市场景
  FEATURED_PRODUCTS = 'featuredProducts', // 推荐商品
  DISCOUNTED_PRODUCTS = 'discountedProducts', // 折扣商品

  // 测试场景
  PERFORMANCE_TEST = 'performanceTest', // 性能测试数据
  STRESS_TEST = 'stressTest',         // 压力测试数据
  EDGE_CASES = 'edgeCases',           // 边界情况
  ERROR_CASES = 'errorCases',         // 错误场景

  // 数据质量场景
  EMPTY_FIELDS = 'emptyFields',       // 空字段场景
  MAX_LENGTH_FIELDS = 'maxLengthFields', // 最大长度字段
  SPECIAL_CHARACTERS = 'specialCharacters', // 特殊字符
  UNICODE_DATA = 'unicodeData',       // Unicode数据

  // 业务规则场景
  DUPLICATE_NAMES = 'duplicateNames', // 重复名称
  INVALID_STATUS_TRANSITIONS = 'invalidStatusTransitions', // 无效状态转换
  CATEGORY_MISMATCH = 'categoryMismatch', // 分类不匹配
  BRAND_MISMATCH = 'brandMismatch',   // 品牌不匹配
}

// 生成器配置
export interface GeneratorConfig {
  // 基础配置
  seed?: number;                       // 随机种子（用于可复现的数据）
  locale?: string;                     // 本地化设置（zh-CN, en-US等）

  // 数据规模配置
  spuCount?: number;                   // SPU数量
  categoryCount?: number;              // 分类数量
  brandCount?: number;                 // 品牌数量
  attributeTemplateCount?: number;     // 属性模板数量

  // 业务数据配置
  categories?: CategoryConfig[];       // 分类配置
  brands?: BrandConfig[];              // 品牌配置
  attributeTemplates?: AttributeTemplateConfig[]; // 属性模板配置
  tagOptions?: string[];               // 标签选项

  // 数据分布配置
  statusDistribution?: StatusDistribution; // 状态分布
  priceRange?: PriceRange;             // 价格范围
  stockRange?: StockRange;             // 库存范围

  // 高级配置
  enableRelations?: boolean;           // 是否启用关联数据
  enableValidation?: boolean;          // 是否启用数据验证
  enableAuditData?: boolean;           // 是否启用审计数据
  correlationRules?: CorrelationRule[]; // 数据关联规则
}

// 分类配置
export interface CategoryConfig {
  level: CategoryLevel;                // 分类层级
  namePrefix?: string;                 // 名称前缀
  attributeTemplateCount?: number;     // 属性模板数量
  spuWeight?: number;                  // SPU权重（用于分配SPU数量）
}

// 品牌配置
export interface BrandConfig {
  namePrefix?: string;                 // 名称前缀
  featuredProbability?: number;         // 推荐概率(0-1)
  spuWeight?: number;                  // SPU权重
}

// 属性模板配置
export interface AttributeTemplateConfig {
  categoryLevel: CategoryLevel;        // 适用分类层级
  attributeCount: number;              // 属性数量
  requiredRatio?: number;               // 必填属性比例(0-1)
  typeDistribution?: AttributeTypeDistribution; // 属性类型分布
}

// 属性类型分布
export interface AttributeTypeDistribution {
  [key in AttributeType]?: number;     // 各类型属性的比例
}

// 状态分布
export interface StatusDistribution {
  [key in SPUStatus]: number;         // 各状态的比例
}

// 价格范围
export interface PriceRange {
  min: number;                         // 最低价格
  max: number;                         // 最高价格
  distribution?: 'normal' | 'uniform' | 'exponential'; // 分布类型
}

// 库存范围
export interface StockRange {
  min: number;                         // 最小库存
  max: number;                         // 最大库存
  lowStockThreshold?: number;          // 低库存阈值
  outOfStockRatio?: number;            // 缺货比例(0-1)
}

// 数据关联规则
export interface CorrelationRule {
  type: 'category-price' | 'brand-stock' | 'status-images' | 'custom'; // 关联类型
  sourceField: string;                 // 源字段
  targetField: string;                 // 目标字段
  rule: CorrelationFunction;           // 关联函数
}

// 关联函数类型
export type CorrelationFunction = (sourceValue: any, context: any) => any;
```

### 2. SPU专用数据生成器

```typescript
// SPU数据生成器
export class SPUDataGenerator implements DataGenerator<SPUItem, SPUGeneratorConfig> {
  private config: SPUGeneratorConfig;
  private data: SPUItem[] = [];
  private faker: Faker;
  private categoryCache: Map<string, CategoryItem> = new Map();
  private brandCache: Map<string, BrandItem> = new Map();
  private templateCache: Map<string, AttributeTemplate> = new Map();

  constructor(config: SPUGeneratorConfig = {}) {
    this.config = { ...DEFAULT_SPU_GENERATOR_CONFIG, ...config };
    this.faker = new Faker({ locale: this.config.locale || 'zh_CN' });
    this.initializeCaches();
  }

  // 生成单个SPU
  generateSingle(overrides: Partial<SPUItem> = {}): SPUItem {
    const category = this.getRandomCategory();
    const brand = this.getRandomBrand();
    const template = this.getCategoryTemplate(category.id);

    const spu: SPUItem = {
      id: this.generateId('spu'),
      code: this.generateSPUCode(),
      name: this.generateSPUName(category, brand),
      shortName: this.faker.lorem.words(2),
      description: this.faker.lorem.sentences(2),
      unit: this.getRandomUnit(),

      categoryId: category.id,
      categoryName: category.name,
      categoryPath: category.path,
      brandId: brand.id,
      brandName: brand.name,

      status: this.getRandomStatus(),
      attributes: this.generateAttributes(template),
      images: this.generateImages(),
      tags: this.generateTags(),

      priceInfo: this.generatePriceInfo(),
      stockInfo: this.generateStockInfo(),
      skuCount: this.faker.datatype.number({ min: 1, max: 10 }),

      createdAt: this.faker.date.past().toISOString(),
      updatedAt: this.faker.date.recent().toISOString(),
      createdBy: this.faker.name.fullName(),
      updatedBy: this.faker.name.fullName(),

      ...overrides
    };

    // 应用关联规则
    return this.applyCorrelationRules(spu);
  }

  // 生成多个SPU
  generateBatch(count: number, overrides: Partial<SPUItem> = {}): SPUItem[] {
    const spus: SPUItem[] = [];
    for (let i = 0; i < count; i++) {
      const itemOverrides = { ...overrides };
      if (overrides.name) {
        itemOverrides.name = `${overrides.name} ${i + 1}`;
      }
      spus.push(this.generateSingle(itemOverrides));
    }
    return spus;
  }

  // 生成特定场景数据
  generateScenario(type: ScenarioType, config?: Partial<SPUGeneratorConfig>): SPUItem[] {
    const effectiveConfig = { ...this.config, ...config };
    const count = effectiveConfig.spuCount || 50;

    switch (type) {
      case ScenarioType.NORMAL:
        return this.generateNormalScenario(count);
      case ScenarioType.LOW_STOCK:
        return this.generateLowStockScenario(count);
      case ScenarioType.HIGH_PRICE:
        return this.generateHighPriceScenario(count);
      case ScenarioType.NEW_PRODUCTS:
        return this.generateNewProductsScenario(count);
      case ScenarioType.FEATURED_PRODUCTS:
        return this.generateFeaturedProductsScenario(count);
      case ScenarioType.DRAFT_STATUS:
        return this.generateDraftStatusScenario(count);
      case ScenarioType.PERFORMANCE_TEST:
        return this.generatePerformanceTestScenario(count);
      case ScenarioType.EDGE_CASES:
        return this.generateEdgeCasesScenario(count);
      default:
        return this.generateBatch(count);
    }
  }

  // 数据管理方法
  getGeneratedData(): SPUItem[] {
    return [...this.data];
  }

  clearData(): void {
    this.data = [];
  }

  updateData(id: string, updates: Partial<SPUItem>): void {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...updates, updatedAt: new Date().toISOString() };
    }
  }

  deleteData(id: string): boolean {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data.splice(index, 1);
      return true;
    }
    return false;
  }

  findData(predicate: (item: SPUItem) => boolean): SPUItem | undefined {
    return this.data.find(predicate);
  }

  filterData(predicate: (item: SPUItem) => boolean): SPUItem[] {
    return this.data.filter(predicate);
  }

  // 配置管理
  setConfig(config: Partial<SPUGeneratorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): SPUGeneratorConfig {
    return { ...this.config };
  }

  resetConfig(): void {
    this.config = { ...DEFAULT_SPU_GENERATOR_CONFIG };
  }

  // 私有方法
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSPUCode(): string {
    return `SPU${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  private generateSPUName(category: CategoryItem, brand: BrandItem): string {
    const productNames = this.getProductNamesForCategory(category);
    const baseName = productNames[Math.floor(Math.random() * productNames.length)];
    const modifier = this.faker.lorem.words(1);
    return `${brand.name} ${baseName} ${modifier}`;
  }

  private generateRandomUnit(): string {
    const units = ['个', '瓶', '盒', '包', '袋', '支', '条', '套', '份', '张'];
    return units[Math.floor(Math.random() * units.length)];
  }

  private generateAttributes(template: AttributeTemplate): SPUAttribute[] {
    return template.attributeDefinitions.map(def => ({
      id: this.generateId('attr'),
      key: def.key,
      name: def.name,
      type: def.type,
      value: this.generateAttributeValue(def),
      required: def.required,
      unit: def.type === AttributeType.NUMBER ? this.getRandomUnit() : undefined,
      validationRules: def.validationRules,
      sortOrder: def.sortOrder,
      groupId: def.groupId,
      groupName: def.groupId ? this.getGroupName(def.groupId) : undefined
    }));
  }

  private generateAttributeValue(definition: AttributeDefinition): AttributeValue {
    switch (definition.type) {
      case AttributeType.TEXT:
      case AttributeType.TEXTAREA:
        return this.faker.lorem.words(3);
      case AttributeType.NUMBER:
        return this.faker.datatype.number({ min: 1, max: 1000 });
      case AttributeType.SELECT:
      case AttributeType.RADIO:
        const options = definition.options || [];
        const selectedOption = options[Math.floor(Math.random() * options.length)];
        return selectedOption?.value || '';
      case AttributeType.MULTI_SELECT:
      case AttributeType.CHECKBOX:
        const multiOptions = definition.options || [];
        return multiOptions
          .filter(() => Math.random() > 0.5)
          .map(opt => opt.value);
      case AttributeType.BOOLEAN:
      case AttributeType.SWITCH:
        return Math.random() > 0.5;
      case AttributeType.DATE:
        return this.faker.date.past();
      case AttributeType.COLOR:
        return this.faker.internet.color();
      default:
        return this.faker.lorem.word();
    }
  }

  // 场景生成方法
  private generateNormalScenario(count: number): SPUItem[] {
    return this.generateBatch(count);
  }

  private generateLowStockScenario(count: number): SPUItem[] {
    return this.generateBatch(count).map(spu => ({
      ...spu,
      stockInfo: {
        ...spu.stockInfo,
        totalStock: this.faker.datatype.number({ min: 0, max: 10 }),
        lowStockWarning: true
      }
    }));
  }

  private generateHighPriceScenario(count: number): SPUItem[] {
    return this.generateBatch(count).map(spu => ({
      ...spu,
      priceInfo: {
        ...spu.priceInfo,
        minPrice: this.faker.datatype.number({ min: 500, max: 2000 }),
        maxPrice: this.faker.datatype.number({ min: 2000, max: 5000 }),
        avgPrice: 0 // 将在后续计算
      }
    }));
  }

  // 其他私有方法...
}

// SPU生成器配置
export interface SPUGeneratorConfig extends GeneratorConfig {
  // 继承基础配置

  // SPU特有配置
  enableImages?: boolean;              // 是否生成图片
  enableAttributes?: boolean;          // 是否生成属性
  enableTags?: boolean;                // 是否生成标签
  imageCountRange?: [number, number]; // 图片数量范围
  attributeValueComplexity?: 'simple' | 'medium' | 'complex'; // 属性值复杂度
}

// 默认SPU生成器配置
export const DEFAULT_SPU_GENERATOR_CONFIG: SPUGeneratorConfig = {
  spuCount: 50,
  categoryCount: 10,
  brandCount: 8,
  attributeTemplateCount: 15,
  locale: 'zh_CN',
  statusDistribution: {
    [SPUStatus.DRAFT]: 0.2,
    [SPUStatus.ACTIVE]: 0.7,
    [SPUStatus.INACTIVE]: 0.1
  },
  priceRange: {
    min: 10,
    max: 500,
    distribution: 'normal'
  },
  stockRange: {
    min: 0,
    max: 1000,
    lowStockThreshold: 20,
    outOfStockRatio: 0.05
  },
  enableImages: true,
  enableAttributes: true,
  enableTags: true,
  imageCountRange: [1, 5],
  attributeValueComplexity: 'medium',
  enableRelations: true,
  enableValidation: true,
  enableAuditData: true
};
```

## 表单验证规则类型

### 1. 验证规则定义

```typescript
// 表单验证器接口
export interface FormValidator {
  validate: (value: any, rule: ValidationRule, data?: any) => ValidationResult;
  trigger?: ValidationTrigger;
  message?: string;
}

// 验证结果
export interface ValidationResult {
  valid: boolean;                      // 是否验证通过
  message?: string;                    // 错误消息
  field?: string;                      // 错误字段
  value?: any;                         // 验证值
}

// 内置验证器
export class BuiltInValidators {
  // 必填验证
  static required(message?: string): FormValidator {
    return {
      validate: (value) => ({
        valid: value !== null && value !== undefined && value !== '' &&
              (!Array.isArray(value) || value.length > 0),
        message: message || '此字段为必填项'
      }),
      trigger: ValidationTrigger.CHANGE
    };
  }

  // 字符串长度验证
  static length(min?: number, max?: number, message?: string): FormValidator {
    return {
      validate: (value) => {
        if (value === null || value === undefined || value === '') {
          return { valid: true };
        }
        const length = String(value).length;
        const valid = (min === undefined || length >= min) &&
                     (max === undefined || length <= max);
        return {
          valid,
          message: message || `长度必须在${min || 0}-${max || '∞'}个字符之间`
        };
      },
      trigger: ValidationTrigger.BLUR
    };
  }

  // 数值范围验证
  static range(min?: number, max?: number, message?: string): FormValidator {
    return {
      validate: (value) => {
        if (value === null || value === undefined || value === '') {
          return { valid: true };
        }
        const num = Number(value);
        const valid = !isNaN(num) &&
                     (min === undefined || num >= min) &&
                     (max === undefined || num <= max);
        return {
          valid,
          message: message || `数值必须在${min || '-∞'}-${max || '∞'}之间`
        };
      },
      trigger: ValidationTrigger.BLUR
    };
  }

  // 正则表达式验证
  static pattern(pattern: RegExp, message?: string): FormValidator {
    return {
      validate: (value) => {
        if (value === null || value === undefined || value === '') {
          return { valid: true };
        }
        const valid = pattern.test(String(value));
        return {
          valid,
          message: message || '格式不正确'
        };
      },
      trigger: ValidationTrigger.BLUR
    };
  }

  // 邮箱验证
  static email(message?: string): FormValidator {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return BuiltInValidators.pattern(emailPattern, message || '请输入有效的邮箱地址');
  }

  // 电话号码验证
  static phone(message?: string): FormValidator {
    const phonePattern = /^1[3-9]\d{9}$/;
    return BuiltInValidators.pattern(phonePattern, message || '请输入有效的手机号码');
  }

  // URL验证
  static url(message?: string): FormValidator {
    const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    return BuiltInValidators.pattern(urlPattern, message || '请输入有效的URL地址');
  }

  // 日期验证
  static date(min?: Date, max?: Date, message?: string): FormValidator {
    return {
      validate: (value) => {
        if (value === null || value === undefined || value === '') {
          return { valid: true };
        }
        const date = new Date(value);
        const valid = !isNaN(date.getTime()) &&
                     (min === undefined || date >= min) &&
                     (max === undefined || date <= max);
        return {
          valid,
          message: message || `请选择有效的日期`
        };
      },
      trigger: ValidationTrigger.CHANGE
    };
  }

  // 数组长度验证
  static arrayLength(min?: number, max?: number, message?: string): FormValidator {
    return {
      validate: (value) => {
        if (!Array.isArray(value)) {
          return { valid: false, message: '此字段必须是数组' };
        }
        const valid = (min === undefined || value.length >= min) &&
                     (max === undefined || value.length <= max);
        return {
          valid,
          message: message || `数组长度必须在${min || 0}-${max || '∞'}之间`
        };
      },
      trigger: ValidationTrigger.CHANGE
    };
  }

  // 自定义验证
  static custom(validator: (value: any, data?: any) => boolean | string, message?: string): FormValidator {
    return {
      validate: (value, rule, data) => {
        const result = validator(value, data);
        if (typeof result === 'boolean') {
          return { valid: result, message: result ? undefined : (message || '验证失败') };
        }
        return { valid: false, message: result };
      },
      trigger: ValidationTrigger.BLUR
    };
  }

  // 异步验证
  static async(asyncValidator: (value: any, data?: any) => Promise<boolean | string>, message?: string): FormValidator {
    return {
      validate: async (value, rule, data) => {
        try {
          const result = await asyncValidator(value, data);
          if (typeof result === 'boolean') {
            return { valid: result, message: result ? undefined : (message || '验证失败') };
          }
          return { valid: false, message: result };
        } catch (error) {
          return { valid: false, message: error instanceof Error ? error.message : '验证出错' };
        }
      },
      trigger: ValidationTrigger.BLUR
    };
  }
}

// 复合验证器
export class CompositeValidators {
  // SPU名称验证
  static spuName(): FormValidator[] {
    return [
      BuiltInValidators.required('SPU名称不能为空'),
      BuiltInValidators.length(2, 100, 'SPU名称长度必须在2-100个字符之间'),
      BuiltInValidators.pattern(/^[\u4e00-\u9fa5a-zA-Z0-9\s\-_()（）]+$/, 'SPU名称只能包含中文、英文、数字、空格和常用符号')
    ];
  }

  // SPU编码验证
  static spuCode(): FormValidator[] {
    return [
      BuiltInValidators.required('SPU编码不能为空'),
      BuiltInValidators.pattern(/^[A-Z0-9]{2,20}$/, 'SPU编码必须为2-20位大写字母和数字组合')
    ];
  }

  // 价格验证
  static price(): FormValidator[] {
    return [
      BuiltInValidators.required('价格不能为空'),
      BuiltInValidators.range(0.01, 999999.99, '价格必须在0.01-999999.99之间'),
      BuiltInValidators.pattern(/^\d+(\.\d{1,2})?$/, '价格格式不正确，最多两位小数')
    ];
  }

  // 库存验证
  static stock(): FormValidator[] {
    return [
      BuiltInValidators.required('库存不能为空'),
      BuiltInValidators.range(0, 9999999, '库存必须在0-9999999之间'),
      BuiltInValidators.pattern(/^\d+$/, '库存必须为整数')
    ];
  }

  // 网址验证
  static website(): FormValidator[] {
    return [
      BuiltInValidators.url('请输入有效的网址')
    ];
  }

  // 分类验证
  static category(): FormValidator[] {
    return [
      BuiltInValidators.required('请选择商品分类'),
      BuiltInValidators.custom((value, data) => {
        // 验证是否为三级分类
        return value && typeof value === 'string' && value.length > 0;
      }, '请选择完整的三级分类路径')
    ];
  }

  // 品牌验证
  static brand(): FormValidator[] {
    return [
      BuiltInValidators.required('请选择商品品牌'),
      BuiltInValidators.custom((value, data) => {
        return value && typeof value === 'string' && value.length > 0;
      }, '请选择有效的商品品牌')
    ];
  }

  // 属性值验证（根据属性类型）
  static attributeValue(attributeType: AttributeType, required: boolean, options?: AttributeOption[]): FormValidator[] {
    const validators: FormValidator[] = [];

    if (required) {
      validators.push(BuiltInValidators.required('此属性为必填项'));
    }

    switch (attributeType) {
      case AttributeType.NUMBER:
        validators.push(BuiltInValidators.range(0, 9999999, '数值必须在0-9999999之间'));
        break;
      case AttributeType.EMAIL:
        validators.push(BuiltInValidators.email());
        break;
      case AttributeType.PHONE:
        validators.push(BuiltInValidators.phone());
        break;
      case AttributeType.URL:
        validators.push(BuiltInValidators.url());
        break;
      case AttributeType.MULTI_SELECT:
      case AttributeType.CHECKBOX:
        if (options && options.length > 0) {
          validators.push(
            BuiltInValidators.custom((value) => {
              if (!Array.isArray(value)) return false;
              return value.every(val => options.some(opt => opt.value === val));
            }, '请选择有效的选项')
          );
        }
        break;
      case AttributeType.SELECT:
      case AttributeType.RADIO:
        if (options && options.length > 0) {
          validators.push(
            BuiltInValidators.custom((value) => {
              return options.some(opt => opt.value === value);
            }, '请选择有效的选项')
          );
        }
        break;
      case AttributeType.COLOR:
        validators.push(
          BuiltInValidators.pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, '请输入有效的颜色值')
        );
        break;
    }

    return validators;
  }

  // 图片验证
  static image(): FormValidator[] {
    return [
      BuiltInValidators.required('请上传商品图片'),
      BuiltInValidators.arrayLength(1, 10, '图片数量必须在1-10张之间'),
      BuiltInValidators.custom((images) => {
        return Array.isArray(images) && images.every(img => img && img.url);
      }, '图片格式不正确')
    ];
  }
}

// 表单验证工具类
export class FormValidationUtils {
  // 验证整个表单
  static async validateForm(
    data: Record<string, any>,
    rules: Record<string, FormValidator[]>,
    options?: ValidationOptions
  ): Promise<FormValidationResult> {
    const result: FormValidationResult = {
      valid: true,
      errors: {},
      data: { ...data }
    };

    for (const [field, fieldRules] of Object.entries(rules)) {
      const fieldResult = await this.validateField(data[field], fieldRules, data, field);

      if (!fieldResult.valid) {
        result.valid = false;
        result.errors[field] = fieldResult.message;
      }
    }

    // 处理验证选项
    if (options?.stopOnFirstError && !result.valid) {
      const firstError = Object.entries(result.errors)[0];
      return {
        valid: false,
        errors: { [firstError[0]]: firstError[1] },
        data: result.data
      };
    }

    return result;
  }

  // 验证单个字段
  static async validateField(
    value: any,
    rules: FormValidator[],
    data?: any,
    fieldName?: string
  ): Promise<ValidationResult> {
    for (const validator of rules) {
      const result = validator.validate(value, undefined, data);

      // 支持异步验证
      if (result instanceof Promise) {
        const asyncResult = await result;
        if (!asyncResult.valid) {
          return asyncResult;
        }
      } else if (!result.valid) {
        return {
          ...result,
          field: fieldName
        };
      }
    }

    return { valid: true };
  }

  // 创建验证规则映射
  static createValidationRules(config: ValidationRuleConfig): Record<string, FormValidator[]> {
    const rules: Record<string, FormValidator[]> = {};

    for (const [field, fieldRules] of Object.entries(config)) {
      rules[field] = fieldRules.map(rule => this.createValidator(rule));
    }

    return rules;
  }

  // 创建单个验证器
  static createValidator(rule: ValidationRule): FormValidator {
    switch (rule.type) {
      case ValidationType.REQUIRED:
        return BuiltInValidators.required(rule.message);
      case ValidationType.MIN_LENGTH:
        return BuiltInValidators.length(rule.value, undefined, rule.message);
      case ValidationType.MAX_LENGTH:
        return BuiltInValidators.length(undefined, rule.value, rule.message);
      case ValidationType.MIN:
        return BuiltInValidators.range(rule.value, undefined, rule.message);
      case ValidationType.MAX:
        return BuiltInValidators.range(undefined, rule.value, rule.message);
      case ValidationType.PATTERN:
        return BuiltInValidators.pattern(new RegExp(rule.value), rule.message);
      case ValidationType.EMAIL:
        return BuiltInValidators.email(rule.message);
      case ValidationType.PHONE:
        return BuiltInValidators.phone(rule.message);
      case ValidationType.URL:
        return BuiltInValidators.url(rule.message);
      case ValidationType.CUSTOM:
        return BuiltInValidators.custom(rule.value, rule.message);
      default:
        return BuiltInValidators.required(rule.message);
    }
  }
}

// 验证选项
export interface ValidationOptions {
  stopOnFirstError?: boolean;          // 遇到第一个错误时停止
  validateOnChange?: boolean;          // 值变化时验证
  validateOnBlur?: boolean;            // 失焦时验证
  validateOnSubmit?: boolean;          // 提交时验证
}

// 表单验证结果
export interface FormValidationResult {
  valid: boolean;                      // 整体验证结果
  errors: Record<string, string>;       // 字段错误信息
  data: Record<string, any>;            // 验证后的数据
}

// 验证规则配置
export interface ValidationRuleConfig {
  [field: string]: ValidationRule[];    // 字段验证规则配置
}

// SPU表单验证规则配置
export const SPU_FORM_VALIDATION_RULES: ValidationRuleConfig = {
  name: [
    { type: ValidationType.REQUIRED, message: 'SPU名称不能为空' },
    { type: ValidationType.MIN_LENGTH, value: 2, message: 'SPU名称至少2个字符' },
    { type: ValidationType.MAX_LENGTH, value: 100, message: 'SPU名称最多100个字符' }
  ],
  categoryId: [
    { type: ValidationType.REQUIRED, message: '请选择商品分类' }
  ],
  brandId: [
    { type: ValidationType.REQUIRED, message: '请选择商品品牌' }
  ],
  description: [
    { type: ValidationType.MAX_LENGTH, value: 1000, message: '描述最多1000个字符' }
  ],
  shortName: [
    { type: ValidationType.MAX_LENGTH, value: 50, message: '简称最多50个字符' }
  ]
};
```

### 2. 高级验证功能

```typescript
// 条件验证器
export class ConditionalValidators {
  // 基于其他字段值的条件验证
  static when(
    condition: (data: Record<string, any>) => boolean,
    validator: FormValidator,
    elseValidator?: FormValidator
  ): FormValidator {
    return {
      validate: (value, rule, data) => {
        const shouldValidate = condition(data || {});
        const targetValidator = shouldValidate ? validator : (elseValidator || { validate: () => ({ valid: true }) });
        return targetValidator.validate(value, rule, data);
      }
    };
  }

  // 字段依赖验证
  static dependsOn(
    dependencyFields: string[],
    validator: FormValidator
  ): FormValidator {
    return {
      validate: (value, rule, data) => {
        if (!data) return validator.validate(value, rule, data);

        const hasDependency = dependencyFields.every(field =>
          data[field] !== null && data[field] !== undefined && data[field] !== ''
        );

        return hasDependency ? validator.validate(value, rule, data) : { valid: true };
      }
    };
  }
}

// 异步验证场景
export class AsyncValidators {
  // SPU名称唯一性验证
  static spuNameExists(excludeId?: string): FormValidator {
    return BuiltInValidators.async(async (value) => {
      // 这里应该调用实际的API检查名称唯一性
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300));
      const existingNames = ['可口可乐330ml', '百事可乐500ml']; // 模拟已存在的名称
      const isUnique = !existingNames.includes(value) || value === excludeId;
      return isUnique || 'SPU名称已存在';
    }, '检查SPU名称唯一性中...');
  }

  // 分类有效性验证
  static categoryExists(): FormValidator {
    return BuiltInValidators.async(async (value) => {
      if (!value) return true;

      // 模拟API调用验证分类存在性
      await new Promise(resolve => setTimeout(resolve, 200));
      const validCategories = ['cat1', 'cat2', 'cat3']; // 模拟有效分类ID
      return validCategories.includes(value) || '选择的分类不存在';
    });
  }

  // 品牌有效性验证
  static brandExists(): FormValidator {
    return BuiltInValidators.async(async (value) => {
      if (!value) return true;

      // 模拟API调用验证品牌存在性
      await new Promise(resolve => setTimeout(resolve, 200));
      const validBrands = ['brand1', 'brand2', 'brand3']; // 模拟有效品牌ID
      return validBrands.includes(value) || '选择的品牌不存在';
    });
  }
}
```

## 工具类型和常量

### 1. 工具类型

```typescript
// 部分更新类型
export type PartialUpdate<T> = {
  [P in keyof T]?: T[P];
};

// 必需字段类型
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// 可选字段类型
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// 深度只读类型
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[]
    ? DeepReadonlyArray<U>
    : T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

// 深度部分类型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartialArray<U>
    : T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

// 数组深度部分类型
type DeepPartialArray<T> = DeepPartial<T>[];

// 条件类型
export type NonNullable<T> = T extends null | undefined ? never : T;

// 提取数组元素类型
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

// 元组转联合类型
export type TupleToUnion<T extends any[]> = T[number];

// 创建对象类型
export type Createable<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>;

// 可更新对象类型
export type Updatable<T> = Partial<Pick<T, Exclude<keyof T, 'id' | 'createdAt' | 'createdBy'>>>;

// 查询参数类型
export type QueryParams<T> = {
  [K in keyof T]?: T[K] extends string
    ? string
    : T[K] extends number
    ? number
    : T[K] extends boolean
    ? boolean
    : T[K] extends Array<infer U>
    ? U[]
    : T[K] extends object
    ? Partial<T[K]>
    : T[K];
};

// 选择字段类型
export type SelectFields<T, K extends keyof T> = Pick<T, K>;

// 排除字段类型
export type ExcludeFields<T, K extends keyof T> = Omit<T, K>;

// 字段值类型
export type FieldValue<T, K extends keyof T> = T[K];

// 操作类型
export type ActionType = 'create' | 'update' | 'delete' | 'read';

// 操作结果类型
export type OperationResult<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

// Promise类型工具
export type PromiseValue<T> = T extends PromiseLike<infer U> ? U : T;

// 函数参数类型
export type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// 函数返回值类型
export type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

// 监听器类型
export type EventListener<T = any> = (event: T) => void;

// 事件处理器类型
export type EventHandler<T = any> = (event: T) => void | Promise<void>;

// 回调函数类型
export type Callback<T = any> = (...args: any[]) => T;

// 异步回调函数类型
export type AsyncCallback<T = any> = (...args: any[]) => Promise<T>;

// 条件类型
export type ConditionalType<T, U, V> = T extends U ? V : never;

// 映射类型
export type MapType<T, U> = { [K in keyof T]: U };

// 键值对类型
export type KeyValuePair<K, V> = { key: K; value: V };

// ID类型
export type ID = string | number;

// 时间戳类型
export type Timestamp = number | string;

// JSON类型
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONObject
  | JSONArray;

export interface JSONObject {
  [key: string]: JSONValue;
}

export interface JSONArray extends Array<JSONValue> {}
```

### 2. 常量定义

```typescript
// 分页默认配置
export const DEFAULT_PAGINATION = {
  current: 1,
  pageSize: 20,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: [10, 20, 50, 100],
  showTotal: (total: number, range: [number, number]) =>
    `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
} as const;

// 默认筛选配置
export const DEFAULT_FILTERS: SPUFilters = {};

// 默认排序配置
export const DEFAULT_SORT: SortConfig = {
  field: SortField.CREATED_TIME,
  order: SortOrder.DESC
};

// 表单默认配置
export const DEFAULT_FORM_CONFIG = {
  layout: 'vertical' as const,
  colon: true,
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
  scrollToFirstError: true,
  validateTrigger: 'onBlur' as const
};

// 字段长度限制
export const FIELD_LIMITS = {
  SPU_NAME_MAX_LENGTH: 100,
  SPU_SHORT_NAME_MAX_LENGTH: 50,
  SPU_DESCRIPTION_MAX_LENGTH: 1000,
  SPU_CODE_MAX_LENGTH: 50,
  BRAND_NAME_MAX_LENGTH: 100,
  BRAND_CODE_MAX_LENGTH: 50,
  CATEGORY_NAME_MAX_LENGTH: 100,
  CATEGORY_CODE_MAX_LENGTH: 50,
  ATTRIBUTE_NAME_MAX_LENGTH: 100,
  ATTRIBUTE_VALUE_MAX_LENGTH: 500,
  TAG_MAX_LENGTH: 20,
  UNIT_MAX_LENGTH: 10
} as const;

// 价格限制
export const PRICE_LIMITS = {
  MIN_PRICE: 0.01,
  MAX_PRICE: 999999.99,
  DECIMAL_PLACES: 2
} as const;

// 库存限制
export const STOCK_LIMITS = {
  MIN_STOCK: 0,
  MAX_STOCK: 9999999,
  DEFAULT_LOW_STOCK_THRESHOLD: 20
} as const;

// 文件上传限制
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  MAX_FILES: 10,
  MIN_IMAGES: 1,
  MAX_IMAGES: 10
} as const;

// 状态颜色映射
export const STATUS_COLORS = {
  [SPUStatus.DRAFT]: '#faad14',     // 橙色
  [SPUStatus.ACTIVE]: '#52c41a',     // 绿色
  [SPUStatus.INACTIVE]: '#f5222d'    // 红色
} as const;

// 状态文本映射
export const STATUS_TEXT = {
  [SPUStatus.DRAFT]: '草稿',
  [SPUStatus.ACTIVE]: '启用',
  [SPUStatus.INACTIVE]: '停用'
} as const;

// 默认图片占位符
export const DEFAULT_IMAGE_PLACEHOLDER = 'https://via.placeholder.com/300x300/e8e8e8/a8a8a8?text=暂无图片';

// 防抖时间配置
export const DEBOUNCE_TIME = {
  SEARCH: 300,      // 搜索防抖时间（毫秒）
  FORM_CHANGE: 500, // 表单变化防抖时间（毫秒）
  AUTO_SAVE: 2000   // 自动保存防抖时间（毫秒）
} as const;

// 节流时间配置
export const THROTTLE_TIME = {
  BUTTON_CLICK: 1000, // 按钮点击节流时间（毫秒）
  SCROLL: 16,        // 滚动节流时间（毫秒）
  RESIZE: 100        // 窗口调整节流时间（毫秒）
} as const;

// 缓存配置
export const CACHE_CONFIG = {
  DEFAULT_EXPIRY: 5 * 60 * 1000,    // 默认缓存过期时间（5分钟）
  LONG_EXPIRY: 30 * 60 * 1000,      // 长期缓存过期时间（30分钟）
  SHORT_EXPIRY: 1 * 60 * 1000,      // 短期缓存过期时间（1分钟）
  MAX_CACHE_SIZE: 100                // 最大缓存条目数
} as const;

// 本地存储键名
export const STORAGE_KEYS = {
  SPU_FORM_DRAFT: 'spu_form_draft',
  USER_PREFERENCES: 'user_preferences',
  TABLE_SETTINGS: 'table_settings',
  FILTER_SETTINGS: 'filter_settings',
  AUTH_TOKEN: 'auth_token',
  THEME: 'theme'
} as const;

// API路径常量
export const API_PATHS = {
  SPU: '/api/spus',
  CATEGORY: '/api/categories',
  BRAND: '/api/brands',
  ATTRIBUTE_TEMPLATE: '/api/attribute-templates',
  UPLOAD: '/api/upload',
  EXPORT: '/api/export',
  IMPORT: '/api/import'
} as const;

// 错误代码
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

// 响应代码
export const RESPONSE_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
} as const;

// 业务常量
export const BUSINESS_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MAX_EXPORT_COUNT: 10000,
  MAX_IMPORT_COUNT: 5000,
  BATCH_OPERATION_LIMIT: 100,
  SEARCH_MIN_LENGTH: 2,
  AUTO_SAVE_INTERVAL: 30000, // 30秒
  SESSION_TIMEOUT: 1800000  // 30分钟
} as const;
```

## 类型守卫和工具函数

```typescript
// 类型守卫函数
export const isSPUItem = (item: any): item is SPUItem => {
  return item && typeof item === 'object' &&
         typeof item.id === 'string' &&
         typeof item.name === 'string' &&
         typeof item.code === 'string' &&
         typeof item.categoryId === 'string' &&
         typeof item.brandId === 'string';
};

export const isSPUStatus = (status: any): status is SPUStatus => {
  return Object.values(SPUStatus).includes(status);
};

export const isAttributeType = (type: any): type is AttributeType => {
  return Object.values(AttributeType).includes(type);
};

export const isCategoryItem = (item: any): item is CategoryItem => {
  return item && typeof item === 'object' &&
         typeof item.id === 'string' &&
         typeof item.name === 'string' &&
         typeof item.level === 'number';
};

export const isBrandItem = (item: any): item is BrandItem => {
  return item && typeof item === 'object' &&
         typeof item.id === 'string' &&
         typeof item.name === 'string';
};

export const isValidationResult = (result: any): result is ValidationResult => {
  return result && typeof result === 'object' &&
         typeof result.valid === 'boolean';
};

// 数据格式化函数
export const formatPrice = (price: number, currency: string = 'CNY'): string => {
  return `${currency} ${price.toFixed(PRICE_LIMITS.DECIMAL_PLACES)}`;
};

export const formatNumber = (num: number, digits: number = 2): string => {
  return num.toLocaleString('zh-CN', { minimumFractionDigits: digits });
};

export const formatDate = (date: string | Date, format: 'date' | 'datetime' | 'time' = 'date'): string => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = format === 'date'
    ? { year: 'numeric', month: '2-digit', day: '2-digit' }
    : format === 'time'
    ? { hour: '2-digit', minute: '2-digit', second: '2-digit' }
    : { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };

  return d.toLocaleString('zh-CN', options);
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'datetime');
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatPercentage = (value: number, total: number, digits: number = 2): string => {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(digits)}%`;
};

// ID生成函数
export const generateId = (prefix: string = '', length: number = 9): string => {
  const randomStr = Math.random().toString(36).substr(2, length);
  return prefix ? `${prefix}_${Date.now()}_${randomStr}` : `${Date.now()}_${randomStr}`;
};

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const generateSPUCode = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `SPU${timestamp}${random}`;
};

// 函数式编程工具
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const memoize = <T extends (...args: any[]) => any>(func: T): T => {
  const cache = new Map();
  return (...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
};

// 数组工具函数
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const groupBy = <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

export const uniqueBy = <T, K extends keyof T>(array: T[], key: K): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

export const sortBy = <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

export const findIndex = <T>(array: T[], predicate: (item: T, index: number) => boolean): number => {
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i)) {
      return i;
    }
  }
  return -1;
};

// 对象工具函数
export const pick = <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const omit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj } as any;
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }
  if (typeof obj === 'object') {
    const cloned = {} as any;
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key as any]);
    });
    return cloned;
  }
  return obj;
};

export const mergeDeep = <T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key] as any, source[key] as any);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    });
  }

  return mergeDeep(target, ...sources);
};

const isObject = (item: any): item is Record<string, any> => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

// 字符串工具函数
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const camelCase = (str: string): string => {
  return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
};

export const kebabCase = (str: string): string => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
};

export const snakeCase = (str: string): string => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
};

export const truncate = (str: string, length: number, suffix: string = '...'): string => {
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// 验证工具函数
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

// 本地存储工具
export const storage = {
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },

  get: <T>(key: string, defaultValue?: T): T | undefined => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return defaultValue;
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
};

// URL工具函数
export const getQueryParam = (name: string): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
};

export const setQueryParam = (name: string, value: string): void => {
  const url = new URL(window.location.href);
  url.searchParams.set(name, value);
  window.history.replaceState({}, '', url.toString());
};

export const removeQueryParam = (name: string): void => {
  const url = new URL(window.location.href);
  url.searchParams.delete(name);
  window.history.replaceState({}, '', url.toString());
};

// 时间工具函数
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const timeAgo = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (seconds < 60) return '刚刚';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时前`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}天前`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}个月前`;
  return `${Math.floor(seconds / 31536000)}年前`;
};

export const isToday = (date: string | Date): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  return checkDate.toDateString() === today.toDateString();
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const startOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const endOfDay = (date: Date): Date => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};
```

## 使用示例

### 1. 基础类型使用

```typescript
// 创建SPU实例
const spu: SPUItem = {
  id: generateId('spu'),
  code: generateSPUCode(),
  name: '可口可乐330ml',
  categoryId: 'cat_001',
  categoryName: '饮料/碳酸饮料/可乐',
  categoryPath: ['饮料', '碳酸饮料', '可乐'],
  brandId: 'brand_001',
  brandName: '可口可乐',
  status: SPUStatus.ACTIVE,
  attributes: [
    {
      id: generateId('attr'),
      key: 'capacity',
      name: '容量',
      type: AttributeType.NUMBER,
      value: 330,
      required: true,
      unit: 'ml'
    }
  ],
  images: [
    {
      id: generateId('img'),
      url: 'https://example.com/image.jpg',
      alt: '可口可乐',
      type: ImageType.MAIN,
      sortOrder: 0,
      isMain: true
    }
  ],
  tags: ['畅销', '经典'],
  priceInfo: {
    minPrice: 3.5,
    maxPrice: 5.0,
    avgPrice: 4.2,
    currency: 'CNY'
  },
  stockInfo: {
    totalStock: 1000,
    availableStock: 800,
    reservedStock: 200,
    lowStockWarning: false
  },
  skuCount: 5,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'admin',
  updatedBy: 'admin'
};

// 使用类型守卫
if (isSPUItem(spu)) {
  console.log('这是一个有效的SPU对象');
}

// 使用格式化函数
console.log(formatPrice(spu.priceInfo.avgPrice)); // "CNY 4.20"
console.log(formatDate(spu.createdAt)); // "2025-12-12"
```

### 2. 表单验证使用

```typescript
// 创建验证规则
const validationRules = FormValidationUtils.createValidationRules({
  name: CompositeValidators.spuName(),
  categoryId: CompositeValidators.category(),
  brandId: CompositeValidators.brand(),
  price: CompositeValidators.price(),
  stock: CompositeValidators.stock()
});

// 验证表单数据
const formData = {
  name: '新商品',
  categoryId: 'cat_001',
  brandId: 'brand_001',
  price: 99.99,
  stock: 100
};

const validationResult = await FormValidationUtils.validateForm(formData, validationRules);
if (!validationResult.valid) {
  console.log('表单验证失败:', validationResult.errors);
}
```

### 3. Mock数据生成器使用

```typescript
// 创建SPU数据生成器
const generator = new SPUDataGenerator({
  spuCount: 50,
  enableImages: true,
  enableAttributes: true,
  enableTags: true
});

// 生成正常业务场景数据
const normalSpus = generator.generateScenario(ScenarioType.NORMAL);

// 生成低库存场景数据
const lowStockSpus = generator.generateScenario(ScenarioType.LOW_STOCK);

// 生成性能测试数据
const performanceData = generator.generateScenario(ScenarioType.PERFORMANCE_TEST, {
  spuCount: 1000
});

// 获取生成的数据
const allData = generator.getGeneratedData();

// 更新特定数据
generator.updateData(normalSpus[0].id, {
  name: '更新后的商品名称',
  status: SPUStatus.INACTIVE
});
```

---

**文档版本**: v3.0（完整版）
**创建日期**: 2025-12-12
**技术栈**: TypeScript 5.0.4 + React 18.2.0 + Redux Toolkit + MSW + TanStack Query
**维护者**: Frontend Development Team

**文档特性**:
- ✅ 完整的TypeScript类型定义
- ✅ 全面的状态管理架构
- ✅ 强大的Mock数据生成器
- ✅ 完善的表单验证系统
- ✅ 实用的工具函数库
- ✅ 详细的API接口定义
- ✅ 清晰的使用示例

**覆盖范围**:
- 🔹 SPU核心数据模型
- 🔹 三级分类体系
- 🔹 品牌管理
- 🔹 动态属性模板
- 🔹 完整的验证规则
- 🔹 状态管理和缓存
- 🔹 Mock数据生成
- 🔹 API接口规范