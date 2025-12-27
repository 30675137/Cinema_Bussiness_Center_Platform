# 技术研究文档

**功能**: SKU 管理
**研究日期**: 2025-01-27
**技术栈**: React 18.2.0 + TypeScript 5.0.4 + Ant Design 6.1.0

## Mock数据策略研究

### 决策
采用**完整Mock数据**策略，生成1000+条SKU记录，包含完整的字段信息和关联关系，模拟真实业务场景。

### 理由
- 更接近真实使用场景，便于测试和演示
- 支持复杂查询和筛选功能验证
- 便于性能测试和优化验证
- 为后续后端对接提供数据参考

### 实现方案
```typescript
interface SKU {
  id: string;
  code: string;              // SKU编码（系统生成）
  name: string;              // SKU名称
  spuId: string;             // 所属SPU ID
  spuName: string;           // 所属SPU名称
  brand: string;             // 品牌（继承自SPU）
  category: string;          // 类目（继承自SPU）
  spec: string;              // 规格/型号
  mainUnit: string;          // 主库存单位
  mainBarcode: string;      // 主条码
  otherBarcodes: Barcode[];  // 其他条码列表
  salesUnits: SalesUnit[];   // 销售单位配置
  manageInventory: boolean;  // 是否管理库存
  allowNegativeStock: boolean; // 是否允许负库存
  minOrderQty?: number;       // 最小起订量
  minSaleQty?: number;       // 最小销售量
  status: 'draft' | 'enabled' | 'disabled'; // 状态
  createdAt: string;         // 创建时间
  updatedAt: string;         // 更新时间
  createdBy: string;         // 创建人
  updatedBy: string;         // 更新人
}
```

### 数据生成规则
- 生成1000条SKU记录
- 关联到50-100个不同的SPU
- 每个SKU配置1-3个销售单位
- 每个SKU配置0-2个其他条码
- 状态分布：草稿20%，启用60%，停用20%

## SPU关联方案研究

### 决策
通过**SPU选择器**选择所属SPU，选择后自动继承品牌和类目信息，用户无需单独选择。

### 理由
- 符合业务逻辑，SKU必须关联SPU
- 减少用户输入，提升体验
- 保证数据一致性，品牌和类目与SPU保持一致

### 实现方案
- 使用Select组件 + 搜索功能选择SPU
- 选择SPU后，品牌和类目字段自动填充（只读）
- 如果SPU不存在，提示用户先创建SPU
- 支持SPU名称模糊搜索

## 单位配置方案研究

### 决策
支持**主库存单位（必填）**和**多个销售单位（可选）**，每个销售单位配置与主库存单位的换算关系。

### 理由
- 满足不同销售场景的需求
- 支持灵活的库存和销售单位管理
- 符合零售行业常见业务模式

### 实现方案
```typescript
interface SalesUnit {
  id: string;
  unit: string;              // 销售单位名称
  conversionRate: number;     // 换算关系：1 销售单位 = X 主库存单位
  enabled: boolean;          // 是否启用
}
```
- 使用Form.List动态添加/删除销售单位
- 换算关系必须>0，且为数字
- 支持启用/禁用单个销售单位

## 条码管理方案研究

### 决策
支持**主条码（一个）**和**其他条码列表（多个）**，所有条码必须唯一，不能与其他SKU重复。

### 理由
- 满足商品多条码管理需求
- 保证条码唯一性，避免数据冲突
- 支持不同场景下的条码使用

### 实现方案
- 主条码：单个Input输入框
- 其他条码：Form.List动态列表，每个条码可配置备注
- 前端进行基础格式校验（长度、字符类型）
- 提交时检查条码唯一性（Mock API模拟）

## 状态管理方案研究

### 决策
使用**Zustand**管理列表筛选、分页、排序等UI状态，使用**TanStack Query**处理数据获取、缓存和更新。

### 理由
- Zustand轻量级，适合UI状态管理
- TanStack Query自动处理缓存和更新，减少重复请求
- 与项目其他模块保持一致的技术选型
- 提升开发效率和代码可维护性

### 实现方案
```typescript
// Zustand Store
interface SkuStoreState {
  filters: SkuQueryParams;
  pagination: { page: number; pageSize: number };
  sorting: { field: string; order: 'asc' | 'desc' };
  selectedSkuIds: string[];
}

// TanStack Query Hooks
useSkuListQuery(filters, pagination, sorting);
useSkuQuery(id);
useCreateSkuMutation();
useUpdateSkuMutation();
useToggleSkuStatusMutation();
```

## 表单验证方案研究

### 决策
采用**前端实时验证**，包括必填字段检查、格式校验、重复性检查（条码唯一性）。

### 理由
- 提升用户体验，及时反馈错误
- 减少无效请求，提升系统效率
- 符合前端最佳实践

### 实现方案
- 必填字段：所属SPU、SKU名称、主库存单位
- 格式校验：条码长度和字符类型、换算关系数值范围
- 重复性检查：主条码唯一性（通过Mock API检查）
- 实时验证：使用Ant Design Form的rules配置

## 选择器复用方案研究

### 决策
设计**可复用的SKU选择器组件**，支持单选和多选模式，供采购单、BOM配方、场景包配置、库存调整等模块使用。

### 理由
- 提升代码复用性，减少重复开发
- 统一用户体验，降低学习成本
- 便于维护和扩展

### 实现方案
```typescript
interface SkuSelectorProps {
  mode: 'single' | 'multiple';
  onSelect: (sku: SKU | SKU[]) => void;
  filters?: Partial<SkuQueryParams>;
  excludeIds?: string[];
}
```
- 使用Modal组件展示选择器
- 内部复用SkuFilters和SkuTable组件
- 支持搜索和筛选功能
- 返回选中的SKU信息给调用方

## 表单结构方案研究

### 决策
采用**标签页分组**方式组织表单内容，分为基础信息、单位条码、规格属性、其他配置四个标签页。

### 理由
- 信息组织清晰，降低表单复杂度
- 提升用户体验，避免长表单滚动
- 符合Ant Design最佳实践

### 实现方案
- 使用Tabs组件组织表单内容
- 每个标签页包含相关字段
- 支持标签页间切换，保持表单数据
- 表单验证跨标签页生效

## 性能优化方案研究

### 决策
采用**服务端分页**策略，列表数据分页加载，支持排序和筛选，避免一次性加载大量数据。

### 理由
- 支持1000+条SKU数据展示
- 提升页面加载速度
- 减少内存占用
- 符合成功标准要求（列表加载<2秒）

### 实现方案
- 默认每页显示20条记录
- 使用Ant Design Table的分页功能
- 筛选和排序触发新的数据请求
- 使用TanStack Query缓存分页数据

## 替代方案评估

### Mock数据复杂度
- **方案A（最小化Mock）**: 仅生成少量基础数据
- **方案B（完整Mock）**: 生成1000+条完整数据 ✅ **选择**
- **评估**: 方案B更接近真实场景，便于测试和演示

### 状态管理
- **方案A（仅Zustand）**: 所有状态都用Zustand管理
- **方案B（Zustand + TanStack Query）**: UI状态用Zustand，数据状态用TanStack Query ✅ **选择**
- **评估**: 方案B职责分离更清晰，符合最佳实践

### 表单结构
- **方案A（单页表单）**: 所有字段在一个页面
- **方案B（标签页分组）**: 使用标签页分组 ✅ **选择**
- **评估**: 方案B信息组织更清晰，用户体验更好

### 选择器实现
- **方案A（独立实现）**: 每个模块独立实现选择器
- **方案B（复用组件）**: 设计可复用的选择器组件 ✅ **选择**
- **评估**: 方案B代码复用性高，维护成本低

