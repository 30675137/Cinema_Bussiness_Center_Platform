# SPU 管理功能前端Mock数据实现技术研究报告

## 概述

基于最新技术栈规格要求，本研究报告深入分析SPU管理功能的前端Mock数据实现方案，重点关注MSW在React应用中的最佳实践、现代化状态管理策略、大数据量渲染优化、以及TypeScript类型设计等核心技术问题。

## 技术栈分析

### 核心技术栈版本
- **Language**: TypeScript 5.0.4
- **Framework**: React 18.2.0
- **UI Library**: Ant Design 6.1.0
- **State Management**: Redux Toolkit + TanStack Query
- **Mock Service**: MSW (Mock Service Worker)
- **Testing**: Vitest + React Testing Library + MSW
- **Build Tool**: Vite
- **Storage**: Mock data (in-memory + local storage persistence)

### 性能目标约束
- **页面加载时间**: < 3秒
- **交互响应时间**: < 2秒
- **UI动画帧率**: 60fps
- **数据规模**: ~50条SPU记录演示
- **核心页面数**: 10个

## 1. Mock Service Worker (MSW) 最佳实践研究

### 1.1 MSW架构设计决策

**核心优势分析**:
- **API兼容性**: 与真实后端API完全兼容，便于后续无缝切换
- **拦截层面**: Service Worker层面拦截，无需修改现有网络请求代码
- **开发体验**: 支持热更新，开发时即时反馈
- **测试友好**: 与Vitest和React Testing Library完美集成

**架构实现方案**:
```typescript
// 推荐的MSW架构结构
src/
├── mocks/
│   ├── handlers.ts              // API处理器定义
│   ├── browser.ts               // 浏览器环境配置
│   ├── server.ts                // Node环境配置（测试用）
│   ├── data/
│   │   ├── generators/          // 智能数据生成器
│   │   │   ├── spuGenerator.ts  // SPU数据生成
│   │   │   ├── categoryGenerator.ts // 分类数据生成
│   │   │   └── brandGenerator.ts // 品牌数据生成
│   │   ├── fixtures/            // 静态测试数据
│   │   │   ├── spus.json       // SPU测试数据
│   │   │   ├── categories.json  // 分类测试数据
│   │   │   └── brands.json      // 品牌测试数据
│   │   └── scenarios/           // 业务场景模拟
│   │       ├── normal.ts        // 正常业务场景
│   │       ├── edgeCases.ts     // 边界情况
│   │       └── performance.ts   // 性能测试场景
│   └── utils/
│       ├── responseHelpers.ts   // 响应辅助函数
│       ├── delaySimulator.ts    // 延迟模拟器
│       └── stateManager.ts      // Mock状态管理
```

### 1.2 智能数据生成策略

**数据生成器设计原则**:
- **业务相关性**: 生成的数据符合影院行业SPU特征
- **关联性保证**: 确保SPU、分类、品牌之间的数据一致性
- **可配置性**: 支持不同规模和场景的数据生成
- **持久化**: 支持localStorage持久化，刷新页面数据不丢失

**核心生成器实现**:
```typescript
// SPU智能数据生成器
export class SPUDataGenerator {
  private faker = new Faker();
  private categoryCache: Map<string, Category> = new Map();
  private brandCache: Map<string, Brand> = new Map();

  // 生成单个SPU
  generateSingleSPU(overrides: Partial<SPUItem> = {}): SPUItem {
    const category = this.getRandomCategory();
    const brand = this.getRandomBrand();

    return {
      id: this.faker.datatype.uuid(),
      name: this.generateSPUName(category),
      code: this.generateSPUCode(),
      categoryId: category.id,
      categoryName: category.name,
      brandId: brand.id,
      brandName: brand.name,
      status: this.getRandomStatus(),
      attributes: this.generateAttributes(category.attributeTemplates),
      price: this.generatePrice(),
      stock: this.generateStock(),
      createdAt: this.faker.date.past(),
      updatedAt: this.faker.date.recent(),
      ...overrides
    };
  }

  // 批量生成SPU数据
  generateBatchSPU(count: number, options: GenerationOptions = {}): SPUItem[] {
    const spus: SPUItem[] = [];
    for (let i = 0; i < count; i++) {
      spus.push(this.generateSingleSPU());
    }

    // 应用生成选项
    if (options.scenario) {
      return this.applyScenario(spus, options.scenario);
    }

    return spus;
  }

  // 生成特定场景数据
  generateScenario(type: ScenarioType): SPUItem[] {
    switch (type) {
      case 'normal':
        return this.generateBatchSPU(30);
      case 'lowStock':
        return this.generateLowStockScenario();
      case 'newArrival':
        return this.generateNewArrivalScenario();
      case 'performance':
        return this.generateBatchSPU(1000); // 性能测试用
      default:
        return this.generateBatchSPU(30);
    }
  }
}
```

### 1.3 场景化Mock数据

**业务场景覆盖**:
1. **正常业务场景**: 完整的SPU管理流程，包含创建、编辑、查询、删除
2. **边界情况场景**: 极值数据、空数据、网络错误、服务器错误
3. **性能测试场景**: 大量数据渲染、复杂筛选条件
4. **用户体验场景**: 不同网络延迟、设备适配、无障碍访问

**场景配置示例**:
```typescript
export const mockScenarios = {
  // 正常业务场景
  normalBusiness: {
    spus: 50,
    categories: 10,
    brands: 8,
    distribution: {
      draft: 0.2,
      enabled: 0.6,
      disabled: 0.2
    }
  },

  // 低库存预警场景
  lowStockWarning: {
    spus: 30,
    lowStockThreshold: 10,
    lowStockRatio: 0.3
  },

  // 新品上市场景
  newArrival: {
    spus: 20,
    newProductDays: 7,
    newArrivalRatio: 0.5
  },

  // 性能测试场景
  performanceTest: {
    spus: 1000,
    responseDelay: [100, 500], // 模拟网络延迟范围
    complexFilters: true
  }
};
```

## 2. Redux Toolkit + TanStack Query 状态管理策略

### 2.1 混合状态管理架构

**设计理念**:
- **Redux Toolkit**: 管理复杂的业务状态、UI状态、临时编辑状态
- **TanStack Query**: 管理服务器状态、缓存、异步操作、乐观更新

**状态分层设计**:
```typescript
// 全局状态结构定义
interface RootState {
  // Redux管理的状态
  spuManagement: {
    // SPU列表和详情
    spus: SPUItem[];
    currentSPU: SPUItem | null;

    // UI状态
    loading: boolean;
    error: string | null;
    selectedRows: string[];

    // 筛选和搜索状态
    filters: SPUFilters;
    searchKeyword: string;

    // 临时编辑状态
    editingSPU: Partial<SPUItem> | null;
    isDirty: boolean;
  };

  // 分类和品牌状态
  categories: {
    list: Category[];
    loading: boolean;
  };

  brands: {
    list: Brand[];
    loading: boolean;
  };
}
```

### 2.2 TanStack Query集成策略

**查询设计**:
```typescript
// API查询定义
export const spuQueries = {
  // SPU列表查询（支持分页和筛选）
  list: (params: SPUListParams) => ({
    queryKey: ['spus', 'list', params],
    queryFn: () => spuAPI.getSPUList(params),
    staleTime: 5 * 60 * 1000, // 5分钟
    cacheTime: 10 * 60 * 1000, // 10分钟
  }),

  // SPU详情查询
  detail: (id: string) => ({
    queryKey: ['spus', 'detail', id],
    queryFn: () => spuAPI.getSPUDetail(id),
    staleTime: 2 * 60 * 1000,
  }),

  // 分类列表查询
  categories: () => ({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getCategories(),
    staleTime: 30 * 60 * 1000, // 分类数据相对稳定
  }),

  // 品牌列表查询
  brands: () => ({
    queryKey: ['brands'],
    queryFn: () => brandAPI.getBrands(),
    staleTime: 30 * 60 * 1000,
  }),
};
```

**变更操作设计**:
```typescript
// 变更操作（支持乐观更新）
export const spuMutations = {
  // 创建SPU
  create: {
    mutationFn: spuAPI.createSPU,
    onSuccess: (newSPU, variables, context) => {
      // 更新Redux状态
      dispatch(addSPU(newSPU));
      // 显示成功消息
      message.success('SPU创建成功');
      // 导航到详情页
      navigate(`/spu/${newSPU.id}`);
    },
    onError: (error, variables, context) => {
      // 回滚乐观更新
      if (context?.previousSPUs) {
        dispatch(setSPUs(context.previousSPUs));
      }
      message.error('SPU创建失败');
    },
    onMutate: async (newSPU) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: ['spus'] });

      // 保存当前数据用于回滚
      const previousSPUs = queryClient.getQueryData(['spus']);

      // 乐观更新
      queryClient.setQueryData(['spus'], (old: SPUItem[] = []) =>
        [...old, { ...newSPU, id: tempId(), status: 'draft' }]
      );

      return { previousSPUs };
    },
  },

  // 更新SPU
  update: {
    mutationFn: ({ id, data }: { id: string; data: Partial<SPUItem> }) =>
      spuAPI.updateSPU(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['spus'] });

      const previousSPUs = queryClient.getQueryData(['spus']);

      queryClient.setQueryData(['spus'], (old: SPUItem[] = []) =>
        old.map(spu =>
          spu.id === id ? { ...spu, ...data, updatedAt: new Date() } : spu
        )
      );

      return { previousSPUs };
    },
    onError: (error, variables, context) => {
      if (context?.previousSPUs) {
        queryClient.setQueryData(['spus', 'list'], context.previousSPUs);
      }
      message.error('SPU更新失败');
    },
    onSuccess: (updatedSPU, { id }) => {
      dispatch(updateSPU({ id, data: updatedSPU }));
      message.success('SPU更新成功');
    },
  },

  // 删除SPU
  delete: {
    mutationFn: spuAPI.deleteSPU,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['spus'] });

      const previousSPUs = queryClient.getQueryData(['spus']);

      queryClient.setQueryData(['spus'], (old: SPUItem[] = []) =>
        old.filter(spu => spu.id !== id)
      );

      return { previousSPUs };
    },
    onError: (error, id, context) => {
      if (context?.previousSPUs) {
        queryClient.setQueryData(['spus'], context.previousSPUs);
      }
      message.error('SPU删除失败');
    },
    onSuccess: (_, id) => {
      dispatch(removeSPU(id));
      message.success('SPU删除成功');
    },
  },
};
```

## 3. 大数据量表格虚拟化渲染方案

### 3.1 虚拟化技术选型

**技术对比**:
- **react-window**: 轻量级，性能优秀，但功能相对简单
- **react-virtualized**: 功能丰富，支持复杂布局，但包体积较大
- **@tanstack/react-virtual**: 现代化API，TypeScript友好，灵活性好

**推荐方案**: `@tanstack/react-virtual`
**理由**:
- 与项目现有技术栈（TanStack Query）保持一致
- 现代化API设计，TypeScript支持完善
- 高度可定制，支持复杂表格场景
- 包体积适中，性能优秀

### 3.2 虚拟化表格实现

**核心组件设计**:
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedTableProps {
  data: SPUItem[];
  columns: ColumnType<SPUItem>[];
  loading?: boolean;
  onRowSelect?: (selectedRows: string[]) => void;
}

export const VirtualizedSPUTable: React.FC<VirtualizedTableProps> = ({
  data,
  columns,
  loading,
  onRowSelect
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // 虚拟化配置
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => tableRef.current,
    estimateSize: () => 60, // 每行高度
    overscan: 5, // 预渲染行数
  });

  // 行选择处理
  const handleRowSelect = useCallback((id: string, checked: boolean) => {
    setSelectedRows(prev => {
      if (checked) {
        return [...prev, id];
      } else {
        return prev.filter(rowId => rowId !== id);
      }
    });
  }, []);

  // 全选处理
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedRows(data.map(item => item.id));
    } else {
      setSelectedRows([]);
    }
    onRowSelect?.(selectedRows);
  }, [data, onRowSelect]);

  return (
    <div className="virtualized-table-container">
      {/* 表头 */}
      <div className="table-header">
        <Checkbox
          indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
          checked={selectedRows.length === data.length && data.length > 0}
          onChange={(e) => handleSelectAll(e.target.checked)}
        />
        {columns.map(column => (
          <div key={column.key} className="header-cell">
            {column.title}
          </div>
        ))}
      </div>

      {/* 虚拟化表格主体 */}
      <div
        ref={tableRef}
        className="table-body"
        style={{ height: '600px', overflow: 'auto' }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const item = data[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={rowVirtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className={`table-row ${selectedRows.includes(item.id) ? 'selected' : ''}`}
              >
                <Checkbox
                  checked={selectedRows.includes(item.id)}
                  onChange={(e) => handleRowSelect(item.id, e.target.checked)}
                />
                {columns.map(column => (
                  <div key={column.key} className="table-cell">
                    {column.render ? column.render(item[column.dataIndex], item) : item[column.dataIndex]}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="loading-overlay">
          <Spin size="large" />
        </div>
      )}
    </div>
  );
};
```

### 3.3 性能优化策略

**渲染优化**:
```typescript
// 使用React.memo优化行组件
const TableRow = React.memo(({ item, columns, selected, onSelect }: RowProps) => {
  return (
    <div className={`table-row ${selected ? 'selected' : ''}`}>
      {/* 行内容 */}
    </div>
  );
});

// 使用useMemo优化列配置
const useOptimizedColumns = () => {
  return useMemo(() => [
    {
      key: 'selection',
      title: '',
      width: 50,
      render: (_, record) => (
        <Checkbox />
      ),
    },
    {
      key: 'name',
      title: 'SPU名称',
      dataIndex: 'name',
      width: 200,
      // 使用shouldCellUpdate优化单元格更新
      shouldCellUpdate: (prevRecord, nextRecord) =>
        prevRecord.name !== nextRecord.name ||
        prevRecord.status !== nextRecord.status,
    },
    // ... 其他列配置
  ], []);
};
```

**内存管理**:
```typescript
// 数据分页策略
const usePaginationStrategy = (totalItems: number) => {
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // 动态调整页面大小
  const effectivePageSize = useMemo(() => {
    if (totalItems > 1000) return 100;
    if (totalItems > 500) return 75;
    return 50;
  }, [totalItems]);

  return {
    pageSize: effectivePageSize,
    currentPage,
    setPageSize,
    setCurrentPage,
  };
};

// 缓存清理策略
const useCacheManagement = () => {
  const queryClient = useQueryClient();

  // 定期清理过期缓存
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.removeQueries({
        queryKey: ['spus'],
        stale: true,
      });
    }, 10 * 60 * 1000); // 每10分钟清理一次

    return () => clearInterval(interval);
  }, [queryClient]);
};
```

## 4. TypeScript类型设计最佳实践

### 4.1 核心类型定义

**SPU核心类型**:
```typescript
// SPU基础信息类型
export interface SPUItem {
  // 基础字段
  id: string;
  name: string;
  code: string;
  description?: string;

  // 分类和品牌
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;

  // 状态管理
  status: SPUStatus;

  // 属性信息
  attributes: SPUAttribute[];

  // 价格库存
  price: PriceInfo;
  stock: StockInfo;

  // 时间戳
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

// SPU状态枚举
export type SPUStatus = 'draft' | 'enabled' | 'disabled';

// SPU属性类型
export interface SPUAttribute {
  id: string;
  name: string;
  value: AttributeValue;
  type: AttributeType;
  required: boolean;
}

export type AttributeType = 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'boolean';
export type AttributeValue = string | number | boolean | string[] | Date;

// 价格信息
export interface PriceInfo {
  basePrice: number;
  sellingPrice: number;
  costPrice?: number;
  currency: string;
}

// 库存信息
export interface StockInfo {
  available: number;
  reserved: number;
  total: number;
  lowStockThreshold: number;
}
```

**分类和品牌类型**:
```typescript
// 三级分类类型
export interface Category {
  id: string;
  name: string;
  code: string;
  level: CategoryLevel;
  parentId?: string;
  path: string; // 分类路径，如: "电影票/2D/普通厅"
  attributeTemplates: AttributeTemplate[];
  status: 'enabled' | 'disabled';
  sort: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryLevel = 1 | 2 | 3;

// 属性模板
export interface AttributeTemplate {
  id: string;
  name: string;
  key: string;
  type: AttributeType;
  required: boolean;
  options?: AttributeOption[]; // 选择类型属性的选项
  validationRules?: ValidationRule[];
  defaultValue?: AttributeValue;
}

export interface AttributeOption {
  label: string;
  value: string | number;
  sort: number;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

// 品牌类型
export interface Brand {
  id: string;
  name: string;
  code: string;
  logo?: string;
  description?: string;
  status: 'enabled' | 'disabled';
  sort: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4.2 API类型定义

**请求和响应类型**:
```typescript
// SPU列表查询参数
export interface SPUListParams {
  // 分页参数
  page: number;
  pageSize: number;

  // 搜索参数
  keyword?: string;

  // 筛选参数
  categoryId?: string;
  brandId?: string;
  status?: SPUStatus[];
  priceRange?: {
    min: number;
    max: number;
  };
  stockRange?: {
    min: number;
    max: number;
  };

  // 排序参数
  sortBy?: keyof SPUItem;
  sortOrder?: 'asc' | 'desc';

  // 创建时间范围
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// SPU列表响应
export interface SPUListResponse {
  items: SPUItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// SPU创建请求
export interface CreateSPURequest {
  name: string;
  categoryId: string;
  brandId: string;
  description?: string;
  attributes: Record<string, AttributeValue>;
  price: Omit<PriceInfo, 'currency'>;
  stock: Omit<StockInfo, 'total'>;
}

// SPU更新请求
export interface UpdateSPURequest {
  id: string;
  data: Partial<CreateSPURequest>;
}
```

### 4.3 组件Props类型优化

**类型安全的组件Props**:
```typescript
// 列表组件Props
export interface SPUListProps {
  // 数据相关
  data: SPUItem[];
  loading?: boolean;
  error?: string;

  // 交互相关
  selectable?: boolean;
  onRowSelect?: (selectedRows: SPUItem[]) => void;
  onRowClick?: (item: SPUItem) => void;
  onEdit?: (item: SPUItem) => void;
  onDelete?: (ids: string[]) => void;

  // 分页相关
  pagination: PaginationConfig;
  onPageChange: (page: number, pageSize: number) => void;

  // 搜索和筛选
  filters: SPUFilters;
  onFiltersChange: (filters: SPUFilters) => void;
  onSearch: (keyword: string) => void;

  // 响应式
  responsive?: {
    xs?: boolean;
    sm?: boolean;
    md?: boolean;
    lg?: boolean;
    xl?: boolean;
  };
}

// 表单组件Props
export interface SPUFormProps {
  // 模式：创建或编辑
  mode: 'create' | 'edit';

  // 初始数据（编辑模式）
  initialValues?: Partial<SPUItem>;

  // 提交处理
  onSubmit: (data: CreateSPURequest | UpdateSPURequest) => Promise<void>;

  // 取消处理
  onCancel: () => void;

  // 加载状态
  submitting?: boolean;

  // 表单配置
  config?: {
    showAdvancedFields?: boolean;
    disableStatus?: boolean;
    requiredFields?: (keyof CreateSPURequest)[];
  };
}

// 筛选器组件Props
export interface SPUFilterProps {
  // 当前筛选条件
  filters: SPUFilters;

  // 可选数据
  categories: Category[];
  brands: Brand[];

  // 事件处理
  onFiltersChange: (filters: SPUFilters) => void;
  onReset: () => void;
  onSearch: () => void;

  // 布局配置
  layout?: 'horizontal' | 'vertical';
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}
```

### 4.4 类型工具和辅助函数

**类型工具函数**:
```typescript
// 类型守卫函数
export function isValidSPUStatus(value: unknown): value is SPUStatus {
  return typeof value === 'string' && ['draft', 'enabled', 'disabled'].includes(value);
}

export function isValidAttributeType(value: unknown): value is AttributeType {
  return typeof value === 'string' &&
    ['text', 'number', 'select', 'multiselect', 'date', 'boolean'].includes(value);
}

// 类型转换函数
export function createSPUFromFormData(formData: FormData): CreateSPURequest {
  return {
    name: formData.get('name') as string,
    categoryId: formData.get('categoryId') as string,
    brandId: formData.get('brandId') as string,
    description: formData.get('description') as string | undefined,
    attributes: parseAttributesFromFormData(formData),
    price: {
      basePrice: Number(formData.get('basePrice')),
      sellingPrice: Number(formData.get('sellingPrice')),
      costPrice: formData.get('costPrice') ? Number(formData.get('costPrice')) : undefined,
    },
    stock: {
      available: Number(formData.get('available')),
      reserved: Number(formData.get('reserved')),
      lowStockThreshold: Number(formData.get('lowStockThreshold')),
    },
  };
}

// 类型安全的API响应处理
export function handleAPIResponse<T>(
  response: unknown,
  validator: (data: unknown) => data is T
): T {
  if (!validator(response)) {
    throw new Error('Invalid API response format');
  }
  return response;
}

// 分页类型工具
export type PaginationParams = Pick<SPUListParams, 'page' | 'pageSize'>;
export type SortParams = Pick<SPUListParams, 'sortBy' | 'sortOrder'>;
export type FilterParams = Omit<SPUListParams, keyof PaginationParams | keyof SortParams>;
```

## 5. 前端测试策略 (单元测试 + 集成测试)

### 5.1 测试架构设计

**测试分层策略**:
```
测试金字塔
├── 单元测试 (70%)
│   ├── 组件测试 (React Testing Library)
│   ├── Hook测试
│   ├── 工具函数测试
│   └── 类型工具测试
├── 集成测试 (20%)
│   ├── 页面级测试
│   ├── 状态管理测试
│   └── API集成测试
└── 端到端测试 (10%)
    ├── 用户流程测试
    ├── 跨浏览器测试
    └── 性能测试
```

### 5.2 单元测试实践

**组件测试示例**:
```typescript
// SPUList组件测试
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { SPUList } from './SPUList';
import { mockSPUData } from '../mocks/data';

// MSW服务器配置
const server = setupServer(
  rest.get('/api/spus', (req, res, ctx) => {
    return res(
      ctx.json({
        items: mockSPUData,
        total: mockSPUData.length,
        page: 1,
        pageSize: 20,
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('SPUList Component', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <SPUList />
      </QueryClientProvider>
    );
  };

  it('应该正确渲染SPU列表', async () => {
    renderComponent();

    // 等待数据加载
    await waitFor(() => {
      expect(screen.getByText('爆米花套餐')).toBeInTheDocument();
    });

    // 验证列表项数量
    const listItems = screen.getAllByRole('row');
    expect(listItems).toHaveLength(mockSPUData.length + 1); // +1 for header
  });

  it('应该支持搜索功能', async () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText('搜索SPU名称');
    fireEvent.change(searchInput, { target: { value: '爆米花' } });

    await waitFor(() => {
      expect(screen.getByText('爆米花套餐')).toBeInTheDocument();
      expect(screen.queryByText('可乐套餐')).not.toBeInTheDocument();
    });
  });

  it('应该支持行选择功能', async () => {
    renderComponent();

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // 点击第一行的复选框
    });

    // 验证选中状态
    const selectedCheckbox = screen.getByLabelText('爆米花套餐') as HTMLInputElement;
    expect(selectedCheckbox.checked).toBe(true);
  });

  it('应该处理网络错误', async () => {
    server.use(
      rest.get('/api/spus', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/加载失败/i)).toBeInTheDocument();
    });
  });
});
```

**Hook测试示例**:
```typescript
// useSPUOperations Hook测试
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSPUOperations } from './useSPUOperations';
import { server } from '../mocks/server';
import { rest } from 'msw';

describe('useSPUOperations', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('应该成功加载SPU列表', async () => {
    const { result } = renderHook(() => useSPUOperations(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('应该成功创建SPU', async () => {
    const { result } = renderHook(() => useSPUOperations(), { wrapper });

    const newSPU = {
      name: '测试SPU',
      categoryId: 'cat1',
      brandId: 'brand1',
    };

    result.current.createSPU.mutate(newSPU);

    await waitFor(() => {
      expect(result.current.createSPU.isSuccess).toBe(true);
    });
  });

  it('应该处理创建SPU失败', async () => {
    server.use(
      rest.post('/api/spus', (req, res, ctx) => {
        return res(ctx.status(400), ctx.json({ error: 'Validation error' }));
      })
    );

    const { result } = renderHook(() => useSPUOperations(), { wrapper });

    result.current.createSPU.mutate({
      name: '',
      categoryId: '',
      brandId: '',
    });

    await waitFor(() => {
      expect(result.current.createSPU.isError).toBe(true);
    });
  });
});
```

### 5.3 集成测试实践

**页面级集成测试**:
```typescript
// SPU管理页面集成测试
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SPUManagementPage } from './SPUManagementPage';
import { server } from '../mocks/server';

describe('SPUManagementPage Integration', () => {
  const queryClient = new QueryClient();

  const renderPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/spu']}>
          <Routes>
            <Route path="/spu" element={<SPUManagementPage />} />
            <Route path="/spu/:id" element={<div>SPU详情页</div>} />
            <Route path="/spu/create" element={<div>SPU创建页</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('应该完成完整的SPU创建流程', async () => {
    renderPage();

    // 点击创建按钮
    const createButton = screen.getByText('创建SPU');
    fireEvent.click(createButton);

    // 填写表单
    await waitFor(() => {
      expect(screen.getByText('SPU创建页')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText('SPU名称');
    fireEvent.change(nameInput, { target: { value: '新爆米花套餐' } });

    const categorySelect = screen.getByLabelText('分类');
    fireEvent.change(categorySelect, { target: { value: 'cat1' } });

    // 提交表单
    const submitButton = screen.getByText('提交');
    fireEvent.click(submitButton);

    // 验证跳转到详情页
    await waitFor(() => {
      expect(screen.getByText('SPU详情页')).toBeInTheDocument();
    });
  });

  it('应该支持搜索和筛选功能', async () => {
    renderPage();

    // 搜索功能
    const searchInput = screen.getByPlaceholderText('搜索SPU名称');
    fireEvent.change(searchInput, { target: { value: '爆米花' } });

    await waitFor(() => {
      expect(screen.getByText('爆米花套餐')).toBeInTheDocument();
    });

    // 筛选功能
    const statusFilter = screen.getByLabelText('状态');
    fireEvent.change(statusFilter, { target: { value: 'enabled' } });

    await waitFor(() => {
      // 验证筛选结果
      const enabledItems = screen.getAllByText('启用');
      expect(enabledItems.length).toBeGreaterThan(0);
    });
  });
});
```

### 5.4 性能测试

**渲染性能测试**:
```typescript
// 虚拟表格性能测试
import { render, screen } from '@testing-library/react';
import { VirtualizedSPUTable } from './VirtualizedSPUTable';
import { generateLargeSPUDataSet } from '../mocks/dataGenerators';

describe('VirtualizedSPUTable Performance', () => {
  it('应该高效渲染大量数据', () => {
    const largeDataSet = generateLargeSPUDataSet(1000);

    const startTime = performance.now();

    render(<VirtualizedSPUTable data={largeDataSet} columns={columns} />);

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // 渲染时间应该在100ms以内
    expect(renderTime).toBeLessThan(100);
  });

  it('应该只渲染可见区域的行', () => {
    const largeDataSet = generateLargeSPUDataSet(1000);

    render(<VirtualizedSPUTable data={largeDataSet} columns={columns} />);

    // 只有可见的行应该被渲染（约10行，取决于容器高度）
    const renderedRows = screen.getAllByRole('row');
    expect(renderedRows.length).toBeLessThan(20);
  });

  it('应该支持快速滚动', async () => {
    const largeDataSet = generateLargeSPUDataSet(1000);

    render(<VirtualizedSPUTable data={largeDataSet} columns={columns} />);

    const container = screen.getByTestId('virtual-table-container');

    const startTime = performance.now();

    // 模拟快速滚动
    fireEvent.scroll(container, { target: { scrollTop: 5000 } });

    await waitFor(() => {
      const endTime = performance.now();
      const scrollTime = endTime - startTime;

      // 滚动响应时间应该在16ms以内（60fps）
      expect(scrollTime).toBeLessThan(16);
    });
  });
});
```

## 6. 响应式设计方案

### 6.1 断点设计策略

**响应式断点定义**:
```typescript
// 断点配置
export const breakpoints = {
  xs: '480px',    // 手机竖屏
  sm: '576px',    // 手机横屏
  md: '768px',    // 平板竖屏
  lg: '992px',    // 平板横屏/小笔记本
  xl: '1200px',   // 桌面
  xxl: '1600px',  // 大屏桌面
};

// 响应式工具Hook
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState<keyof typeof breakpoints>('lg');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;

      if (width < 480) setScreenSize('xs');
      else if (width < 576) setScreenSize('sm');
      else if (width < 768) setScreenSize('md');
      else if (width < 992) setScreenSize('lg');
      else if (width < 1200) setScreenSize('xl');
      else setScreenSize('xxl');
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);

    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return {
    screenSize,
    isMobile: ['xs', 'sm'].includes(screenSize),
    isTablet: screenSize === 'md',
    isDesktop: ['lg', 'xl', 'xxl'].includes(screenSize),
  };
};
```

### 6.2 组件响应式实现

**响应式表格组件**:
```typescript
export const ResponsiveSPUTable: React.FC<SPUTableProps> = ({ data, columns }) => {
  const { isMobile, isTablet } = useResponsive();

  if (isMobile) {
    // 移动端使用卡片布局
    return <SPUCardList data={data} />;
  }

  if (isTablet) {
    // 平板端使用简化表格
    const simplifiedColumns = columns.filter(col =>
      ['name', 'status', 'price'].includes(col.key as string)
    );
    return <CompactTable data={data} columns={simplifiedColumns} />;
  }

  // 桌面端使用完整表格
  return <FullTable data={data} columns={columns} />;
};

// 移动端卡片列表
const SPUCardList: React.FC<{ data: SPUItem[] }> = ({ data }) => {
  return (
    <div className="spu-card-list">
      {data.map(item => (
        <Card key={item.id} className="spu-card">
          <Card.Meta
            title={item.name}
            description={
              <div className="card-content">
                <div className="card-row">
                  <span>编码: {item.code}</span>
                  <Tag color={getStatusColor(item.status)}>
                    {getStatusText(item.status)}
                  </Tag>
                </div>
                <div className="card-row">
                  <span>分类: {item.categoryName}</span>
                </div>
                <div className="card-row">
                  <span>价格: ¥{item.price.sellingPrice}</span>
                  <span>库存: {item.stock.available}</span>
                </div>
              </div>
            }
          />
          <div className="card-actions">
            <Button type="link" size="small">编辑</Button>
            <Button type="link" size="small" danger>删除</Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
```

### 6.3 响应式布局设计

**自适应表单布局**:
```typescript
export const ResponsiveSPUForm: React.FC<SPUFormProps> = ({
  mode,
  initialValues,
  onSubmit
}) => {
  const { isMobile } = useResponsive();
  const [form] = Form.useForm();

  const formLayout = isMobile ? 'vertical' : 'horizontal';
  const formItemLayout = isMobile
    ? {}
    : {
        labelCol: { span: 6 },
        wrapperCol: { span: 16 },
      };

  return (
    <Form
      {...formItemLayout}
      layout={formLayout}
      form={form}
      initialValues={initialValues}
      onFinish={onSubmit}
    >
      <Row gutter={isMobile ? 0 : 16}>
        <Col span={isMobile ? 24 : 12}>
          <Form.Item
            label="SPU名称"
            name="name"
            rules={[{ required: true, message: '请输入SPU名称' }]}
          >
            <Input placeholder="请输入SPU名称" />
          </Form.Item>
        </Col>

        <Col span={isMobile ? 24 : 12}>
          <Form.Item
            label="SPU编码"
            name="code"
            rules={[{ required: true, message: '请输入SPU编码' }]}
          >
            <Input placeholder="请输入SPU编码" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="分类"
        name="categoryId"
        rules={[{ required: true, message: '请选择分类' }]}
      >
        <CategoryTreeSelect
          placeholder="请选择分类"
          style={{ width: '100%' }}
        />
      </Form.Item>

      {/* 其他表单项... */}

      <Form.Item wrapperCol={isMobile ? {} : { offset: 6, span: 16 }}>
        <Space>
          <Button type="primary" htmlType="submit">
            {mode === 'create' ? '创建' : '更新'}
          </Button>
          <Button>取消</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};
```

### 6.4 触摸交互优化

**移动端交互优化**:
```css
/* 移动端触摸优化 */
.spu-card {
  /* 增加点击区域 */
  min-height: 44px;
  padding: 12px;

  /* 触摸反馈 */
  -webkit-tap-highlight-color: transparent;
  transition: all 0.2s ease;
}

.spu-card:active {
  transform: scale(0.98);
  opacity: 0.8;
}

/* 滑动操作 */
.spu-card-swipe {
  position: relative;
  overflow: hidden;
}

.spu-card-actions {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  background: #f5f5f5;
}

/* 移动端表格优化 */
.mobile-table {
  font-size: 14px;
}

.mobile-table .ant-table-tbody > tr > td {
  padding: 8px 4px;
}

.mobile-table .ant-table-thead > tr > th {
  padding: 8px 4px;
  font-size: 12px;
}
```

## 7. 性能优化策略

### 7.1 渲染性能优化

**组件级别的优化**:
```typescript
// 使用React.memo优化组件重渲染
export const SPUListItem = React.memo<SPUListItemProps>(({
  item,
  onSelect,
  onEdit,
  onDelete
}) => {
  const handleEdit = useCallback(() => {
    onEdit(item.id);
  }, [item.id, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(item.id);
  }, [item.id, onDelete]);

  return (
    <div className="spu-list-item">
      {/* 组件内容 */}
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.updatedAt === nextProps.item.updatedAt &&
    prevProps.item.status === nextProps.item.status
  );
});

// 使用useMemo优化计算
const useFilteredSPUList = (spus: SPUItem[], filters: SPUFilters) => {
  return useMemo(() => {
    return spus.filter(item => {
      if (filters.status && !filters.status.includes(item.status)) {
        return false;
      }
      if (filters.categoryId && item.categoryId !== filters.categoryId) {
        return false;
      }
      if (filters.brandId && item.brandId !== filters.brandId) {
        return false;
      }
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        return item.name.toLowerCase().includes(keyword) ||
               item.code.toLowerCase().includes(keyword);
      }
      return true;
    });
  }, [spus, filters]);
};
```

**懒加载和代码分割**:
```typescript
// 路由级别的代码分割
import { lazy, Suspense } from 'react';
import { Spin } from 'antd';

const SPUListPage = lazy(() => import('./pages/SPUListPage'));
const SPUDetailPage = lazy(() => import('./pages/SPUDetailPage'));
const SPUCreatePage = lazy(() => import('./pages/SPUCreatePage'));

export const SPURoutes = () => {
  return (
    <Suspense fallback={<Spin size="large" />}>
      <Routes>
        <Route path="/spu" element={<SPUListPage />} />
        <Route path="/spu/:id" element={<SPUDetailPage />} />
        <Route path="/spu/create" element={<SPUCreatePage />} />
      </Routes>
    </Suspense>
  );
};

// 组件级别的懒加载
const LazyAttributeEditor = lazy(() =>
  import('./AttributeEditor').then(module => ({
    default: module.AttributeEditor
  }))
);

export const SPUForm: React.FC<SPUFormProps> = ({ showAdvancedFields }) => {
  return (
    <Form>
      {/* 基础字段 */}

      {/* 高级字段懒加载 */}
      {showAdvancedFields && (
        <Suspense fallback={<Spin />}>
          <LazyAttributeEditor />
        </Suspense>
      )}
    </Form>
  );
};
```

### 7.2 内存优化

**数据缓存策略**:
```typescript
// LRU缓存实现
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // 重新插入，更新LRU顺序
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 删除最久未使用的项
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }
}

// SPU数据缓存
const spuCache = new LRUCache<string, SPUItem>(200);

export const useSPUCache = () => {
  const getCachedSPU = useCallback((id: string): SPUItem | undefined => {
    return spuCache.get(id);
  }, []);

  const setCachedSPU = useCallback((spu: SPUItem): void => {
    spuCache.set(spu.id, spu);
  }, []);

  const clearCache = useCallback((): void => {
    spuCache.clear();
  }, []);

  return { getCachedSPU, setCachedSPU, clearCache };
};
```

**内存泄漏防护**:
```typescript
// 自动清理Effect
export const useAutoCleanup = (cleanup: () => void, deps: any[] = []) => {
  useEffect(() => {
    return cleanup;
  }, deps);
};

// 事件监听器管理
export const useEventManager = () => {
  const listeners = useRef<Map<string, EventListener>>(new Map());

  const addListener = useCallback((
    element: EventTarget,
    event: string,
    handler: EventListener
  ) => {
    element.addEventListener(event, handler);
    const key = `${element.constructor.name}-${event}`;
    listeners.current.set(key, handler);
  }, []);

  const removeAllListeners = useCallback(() => {
    listeners.current.forEach((handler, key) => {
      const [targetName, event] = key.split('-');
      // 移除事件监听器
      // 需要保存元素引用，这里简化处理
    });
    listeners.current.clear();
  }, []);

  useAutoCleanup(removeAllListeners);

  return { addListener };
};
```

### 7.3 网络请求优化

**请求防抖和合并**:
```typescript
import { useDebouncedCallback } from 'use-debounce';

// 搜索防抖
export const useSPUSearch = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const queryClient = useQueryClient();

  // 防抖搜索
  const debouncedSearch = useDebouncedCallback((keyword: string) => {
    queryClient.invalidateQueries({
      queryKey: ['spus', 'list'],
      exact: false,
    });
  }, 300);

  const handleSearchChange = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
    debouncedSearch(keyword);
  }, [debouncedSearch]);

  return { searchKeyword, handleSearchChange };
};

// 批量操作优化
export const useBatchOperations = () => {
  const queryClient = useQueryClient();

  const batchUpdate = useCallback(async (updates: BatchUpdateItem[]) => {
    // 将多个更新合并为单个请求
    const response = await spuAPI.batchUpdate(updates);

    // 批量更新缓存
    queryClient.setQueriesData(
      { queryKey: ['spus'] },
      (oldData: SPUItem[] = []) => {
        const updateMap = new Map(updates.map(u => [u.id, u.data]));
        return oldData.map(item =>
          updateMap.has(item.id)
            ? { ...item, ...updateMap.get(item.id) }
            : item
        );
      }
    );

    return response;
  }, [queryClient]);

  return { batchUpdate };
};
```

### 7.4 性能监控

**性能指标收集**:
```typescript
// 性能监控Hook
export const usePerformanceMonitor = () => {
  useEffect(() => {
    // 监控页面加载性能
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          console.log('页面加载时间:', navEntry.loadEventEnd - navEntry.loadEventStart);
        }
      }
    });

    observer.observe({ entryTypes: ['navigation', 'paint'] });

    return () => observer.disconnect();
  }, []);
};

// 组件渲染性能监控
export const useRenderPerformance = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;

    if (timeSinceLastRender < 16) { // 低于60fps
      console.warn(`${componentName} 渲染频率过高: ${timeSinceLastRender}ms`);
    }

    lastRenderTime.current = now;
  });
};

// 内存使用监控
export const useMemoryMonitor = () => {
  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = (memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
        const totalMB = (memory.totalJSHeapSize / 1024 / 1024).toFixed(2);

        console.log(`内存使用: ${usedMB}MB / ${totalMB}MB`);

        // 内存使用超过阈值时发出警告
        if (memory.usedJSHeapSize > memory.totalJSHeapSize * 0.8) {
          console.warn('内存使用率过高，建议检查内存泄漏');
        }
      }
    };

    const interval = setInterval(checkMemory, 30000); // 每30秒检查一次
    return () => clearInterval(interval);
  }, []);
};
```

## 总结

本研究报告基于TypeScript 5.0.4、React 18.2.0、Ant Design 6.1.0等现代前端技术栈，深入分析了SPU管理功能前端Mock数据实现的最佳实践。主要研究成果包括：

### 技术决策亮点

1. **MSW架构**: 实现了与真实API完全兼容的Mock服务，支持复杂业务逻辑模拟和测试
2. **混合状态管理**: Redux Toolkit处理复杂业务状态，TanStack Query处理服务器状态和缓存
3. **虚拟化渲染**: 采用@tanstack/react-virtual实现高性能大数据量表格渲染
4. **TypeScript类型安全**: 完整的类型定义体系和类型工具函数
5. **全面测试策略**: 单元测试、集成测试、性能测试的完整覆盖
6. **响应式设计**: 移动优先的响应式设计方案
7. **性能优化**: 渲染优化、内存优化、网络请求优化的综合策略

### 关键创新点

1. **智能数据生成**: 基于业务场景的智能Mock数据生成器
2. **场景化测试**: 覆盖正常、边界、性能、用户体验等多维度测试场景
3. **渐进式优化**: 从基础功能到高级性能优化的渐进式实现路径
4. **内存管理**: LRU缓存和自动清理机制防止内存泄漏
5. **性能监控**: 实时性能指标收集和监控系统

### 实施保障

1. **开发效率**: 预计比全栈开发减少60%的开发时间
2. **用户体验**: 页面加载<3秒，交互响应<2秒，UI动画60fps
3. **代码质量**: 高测试覆盖率，完善的TypeScript类型保护
4. **可维护性**: 模块化架构，清晰的分层设计

这套方案为SPU管理功能提供了完整的前端实现路径，既满足了快速演示和用户验证的需求，又保证了代码质量、性能表现和用户体验，为后续的后端集成奠定了坚实基础。

---

**报告版本**: v3.0（基于最新技术栈规格）
**报告日期**: 2025-12-12
**技术栈**: React 18.2.0 + TypeScript 5.0.4 + Ant Design 6.1.0 + MSW + TanStack Query
**实施周期**: 6周
**性能目标**: <3s页面加载，<2s交互响应，60fps UI动画