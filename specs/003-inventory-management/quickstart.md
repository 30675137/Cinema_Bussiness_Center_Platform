# 库存管理系统快速开始指南

**功能**: 库存与仓店库存管理系统
**版本**: 1.0.0
**最后更新**: 2025-12-11

## 系统概述

库存管理系统是一个基于React + Ant Design的前端应用，提供库存台账查看、库存流水追踪、库存调整等功能。本系统采用纯前端实现，使用mock数据模拟后端接口。

## 技术栈

- **前端框架**: React 18.2.0 + TypeScript 5.0
- **UI组件库**: Ant Design 6.1.0
- **状态管理**: Zustand
- **构建工具**: Vite 6.0.7
- **样式框架**: Tailwind CSS 4.1.17
- **数据请求**: TanStack Query
- **路由**: React Router 6

## 功能模块

### 1. 库存台账管理 (`/inventory/ledger`)

**主要功能**:
- 查看各仓库/门店的SKU库存状态
- 多维度筛选：SKU关键词、仓库门店、类目、品牌、库存状态
- 表格排序：现存库存、可用库存、在途库存、更新时间
- 库存详情抽屉：显示完整的库存信息和近期流水
- 数据导出：支持Excel格式导出

**权限控制**:
- 所有用户默认有查看权限
- 需要调整权限的用户可见"库存调整"按钮

**关键组件**:
- `InventoryTable`: 库存台账表格组件
- `InventoryFilters`: 筛选器组件
- `InventoryDetails`: 库存详情抽屉组件
- `PermissionGuard`: 权限控制组件

### 2. 库存流水查询 (`/inventory/movements`)

**主要功能**:
- 查看库存变动历史记录
- 时间范围筛选
- 单据类型筛选：采购入库、销售出库、调拨、盘点等
- 操作员筛选
- 单据号跳转：点击跳转到对应业务单据

**数据展示**:
- 变动数量：入库显示绿色"+"号，出库显示红色"-"号
- 单据类型：彩色标签标识
- 变动后结余：显示每次变动后的库存余额

### 3. 库存调整操作

**调整类型**:
- 盘盈：盘点发现库存比系统记录多
- 盘亏：盘点发现库存比系统记录少
- 报损：商品损坏或过期
- 其他：其他调整原因

**操作流程**:
1. 在台账页面点击"库存调整"按钮
2. 选择调整类型和输入调整数量
3. 填写调整原因
4. 二次确认后执行调整
5. 系统显示操作成功提示

## 用户权限系统

### 权限角色

1. **查看者** (`inventory.viewer`)
   - 只能查看库存台账和流水
   - 不能进行任何修改操作

2. **操作员** (`inventory.operator`)
   - 可以查看所有信息
   - 可以进行库存调整操作
   - 不能导出数据

3. **管理员** (`inventory.admin`)
   - 拥有所有权限
   - 可以导出数据
   - 可以进行所有操作

### 权限切换

系统右上角提供用户角色选择器，可以实时切换不同权限角色来测试功能。

## Mock数据说明

### 数据范围
- 库存台账：200条记录
- 库存流水：500条记录
- 商品SKU：1000个
- 仓库门店：4个（2个仓库，2个门店）

### 数据生成规则
- SKU编码：`SKU000001` - `SKU001000`
- 商品名称：品牌 + 类目 + 序号
- 库存数量：随机生成，保证逻辑合理性
- 时间范围：最近30天内

### 无状态设计
- 页面刷新后所有数据重置到初始状态
- 筛选条件不持久化
- 调整操作只在当前会话有效

## 响应式设计

### 断点配置
- **移动端** (`< 768px`): 单列布局，折叠式操作
- **平板端** (`768px - 992px`): 双列布局，简化表格
- **桌面端** (`> 992px`): 完整布局，所有功能

### 移动端优化
- 表格横向滚动
- 操作按钮折叠
- 筛选器简化显示
- 统计卡片单列显示

## 性能优化

### 虚拟滚动
- 数据量 > 100条时自动启用
- 每行高度80px
- 缓冲区5项

### 表格优化
- 列固定：左侧固定SKU和名称，右侧固定操作
- 分页加载：每页20条记录
- 懒加载：大数据组件按需加载

### 状态管理
- 使用Zustand进行轻量级状态管理
- 组件级缓存，避免全局状态污染
- React.memo优化组件重渲染

## 开发指南

### 环境搭建

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 目录结构

```
src/
├── components/
│   └── Inventory/              # 库存管理组件
│       ├── InventoryTable.tsx
│       ├── InventoryFilters.tsx
│       ├── InventoryDetails.tsx
│       └── PermissionGuard.tsx
├── pages/
│   └── inventory/              # 库存管理页面
│       ├── InventoryLedger.tsx
│       ├── InventoryMovements.tsx
│       └── InventoryAdjustment.tsx
├── hooks/
│   ├── useInventoryData.ts     # 库存数据钩子
│   ├── usePermissions.ts       # 权限钩子
│   └── useResponsive.ts        # 响应式钩子
├── stores/
│   └── inventoryStore.ts       # 库存状态管理
├── services/
│   └── inventoryMockData.ts    # Mock数据服务
└── types/
    └── inventory.ts            # 类型定义
```

### 关键文件说明

#### `inventoryMockData.ts`
提供所有mock数据的生成和查询逻辑：

```typescript
// 获取库存台账数据
export const getInventoryLedger = (params: {
  page: number;
  pageSize: number;
  filters?: any;
  sortBy?: string;
}) => Promise<InventoryLedgerResponse>;

// 获取库存流水数据
export const getInventoryMovements = (params: {
  page: number;
  pageSize: number;
  sku?: string;
  locationId?: string;
  startTime?: string;
  endTime?: string;
}) => Promise<InventoryMovementResponse>;

// 执行库存调整
export const adjustInventory = (params: {
  sku: string;
  locationId: string;
  adjustmentType: string;
  quantity: number;
  reason: string;
}) => Promise<void>;
```

#### `useInventoryData.ts`
自定义Hook，封装库存数据获取逻辑：

```typescript
export const useInventoryData = () => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    pagination: { current: 1, pageSize: 20, total: 0 },
    filters: {},
    sortBy: null
  });

  const fetchData = useCallback(async (params) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const result = await getInventoryLedger(params);
      setState(prev => ({
        ...prev,
        data: result.data,
        pagination: result.pagination,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  return {
    ...state,
    fetchData,
    updateFilters,
    updateSort,
    refresh: () => fetchData()
  };
};
```

#### `inventoryStore.ts`
Zustand状态管理，处理复杂的库存状态：

```typescript
interface InventoryState {
  inventoryItems: any[];
  filters: any;
  pagination: any;
  statistics: any;
  loading: any;
  errors: any;
}

export const useInventoryStore = create<InventoryState & {
  setInventoryItems: (items: any[]) => void;
  updateFilters: (filters: any) => void;
  adjustStock: (itemId: string, quantity: number, reason: string) => Promise<void>;
}>()((set, get) => ({
  inventoryItems: [],
  filters: {},
  pagination: { current: 1, pageSize: 20, total: 0 },
  statistics: { totalItems: 0, lowStockItems: 0, outOfStockItems: 0 },
  loading: { inventory: false, movements: false },
  errors: {},

  setInventoryItems: (items) => set({ inventoryItems: items }),
  updateFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
    pagination: { ...state.pagination, current: 1 }
  })),

  adjustStock: async (itemId, quantity, reason) => {
    // 库存调整逻辑
  }
}));
```

## 测试指南

### 单元测试
```bash
# 运行单元测试
npm run test

# 生成覆盖率报告
npm run test:coverage
```

### E2E测试
```bash
# 运行端到端测试
npm run test:e2e

# 录制测试
npm run test:e2e:record
```

### 测试重点
1. **库存台账功能测试**
   - 筛选功能
   - 排序功能
   - 分页功能
   - 详情查看

2. **库存流水功能测试**
   - 时间范围筛选
   - 单据类型筛选
   - 数据展示正确性

3. **库存调整功能测试**
   - 不同调整类型
   - 权限控制
   - 操作反馈

4. **权限系统测试**
   - 不同角色的权限控制
   - 按钮显示/隐藏
   - 页面访问控制

## 常见问题

### Q: 为什么刷新页面后数据会重置？
A: 系统采用无状态设计，这是有意的设计选择，便于演示和测试。

### Q: 如何切换不同的用户权限？
A: 在页面右上角的用户选择器中可以选择不同的角色。

### Q: 支持哪些数据导出格式？
A: 目前支持Excel格式导出，包含当前筛选条件下的所有数据。

### Q: 为什么某些操作按钮不可见？
A: 这是权限控制的效果，请检查当前用户角色是否有相应权限。

### Q: 如何查看商品的历史库存变动？
A: 点击台账页面的"查看流水"按钮，可以查看该商品的所有变动记录。

## 技术支持

如有技术问题，请参考以下资源：

1. **项目文档**: 查看项目根目录的README文件
2. **组件文档**: 查看各组件的JSDoc注释
3. **API文档**: 查看`contracts/api-contract.yaml`文件
4. **数据模型**: 查看`data-model.md`文件

---

**开发团队**: 前端开发组
**维护负责人**: 前端技术负责人
**文档版本**: v1.0.0
**最后更新**: 2025-12-11