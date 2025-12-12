# SPU 管理功能前端快速开始指南

## 概述

本文档为前端开发团队提供 SPU（Standard Product Unit）管理功能的快速上手指南，基于当前项目的技术栈和 Mock 数据实现策略，专注于前端功能开发和用户体验实现。

## 技术栈

### 核心技术栈
- **框架**: React 19.2.0 + TypeScript 5.9.3
- **UI库**: Ant Design 6.1.0（企业级组件库）
- **状态管理**: Zustand 5.0.9 + TanStack Query 5.90.12
- **Mock服务**: MSW (Mock Service Worker) - 需要安装
- **构建工具**: Vite 7.2.4（快速开发体验）
- **路由**: React Router DOM 7.10.1
- **表单**: React Hook Form 7.68.0 + Zod 4.1.13
- **测试**: Playwright 1.57.0（E2E测试）
- **国际化**: i18next 25.7.2
- **样式**: Tailwind CSS 4.1.17 + Ant Design

### 开发环境要求
- **Node.js**: 18.x 或更高版本
- **npm**: 9.x 或更高版本
- **浏览器**: Chrome 90+（支持Service Worker）

## 项目初始化

### 1. 安装额外依赖

SPU管理功能需要以下额外依赖：

```bash
# 安装 MSW (Mock Service Worker)
npm install -D msw

# 安装 @faker-js/faker 用于生成 Mock 数据
npm install -D @faker-js/faker

# 如果需要额外的开发工具
npm install -D @types/file-saver file-saver
```

### 2. 生成 MSW Service Worker

```bash
# 在项目根目录执行
npx msw init public --save
```

### 3. 项目结构

```
src/
├── components/           # 组件目录
│   ├── SPU/            # SPU相关组件
│   │   ├── SPUList/   # 列表组件
│   │   │   ├── index.tsx
│   │   │   ├── columns.tsx
│   │   │   └── filters.tsx
│   │   ├── SPUForm/   # 表单组件
│   │   │   ├── index.tsx
│   │   │   ├── BasicInfo.tsx
│   │   │   ├── AttributeForm.tsx
│   │   │   └── ImageUpload.tsx
│   │   ├── SPUDetail/ # 详情组件
│   │   └── index.ts
│   ├── Common/         # 公共组件
│   └── Layout/         # 布局组件
├── hooks/              # 自定义 Hooks
│   ├── useSPU.ts       # SPU 相关 hooks
│   └── useMockData.ts  # Mock 数据 hooks
├── services/           # API 服务
│   ├── spuAPI.ts       # SPU API 接口
│   ├── categoryAPI.ts  # 分类 API
│   └── brandAPI.ts     # 品牌 API
├── stores/             # Zustand 状态管理
│   ├── spuStore.ts     # SPU 状态
│   ├── categoryStore.ts # 分类状态
│   └── brandStore.ts   # 品牌状态
├── types/              # TypeScript 类型定义
│   ├── spu.ts          # SPU 相关类型
│   ├── category.ts     # 分类类型
│   └── brand.ts        # 品牌类型
├── mocks/              # Mock 数据和服务
│   ├── handlers.ts     # MSW 处理器
│   ├── browser.ts      # 浏览器环境配置
│   ├── data/           # Mock 数据
│   │   ├── generators/ # 数据生成器
│   │   └── fixtures/   # 静态数据
│   └── scenarios/      # 业务场景
├── utils/              # 工具函数
├── styles/             # 样式文件
└── pages/              # 页面组件
    └── SPU/            # SPU 页面
        ├── List.tsx    # 列表页面
        ├── Create.tsx  # 创建页面
        ├── Edit.tsx    # 编辑页面
        └── Detail.tsx  # 详情页面

public/
└── mockServiceWorker.js # MSW 生成的 Service Worker
```

## MSW Mock 服务配置

### 1. 创建 Mock 处理器

```typescript
// src/mocks/handlers.ts
import { rest } from 'msw';
import { mockSPUData, generateMockSPUList } from './data/spu';
import { mockCategories } from './data/categories';
import { mockBrands } from './data/brands';

export const handlers = [
  // SPU 列表查询
  rest.get('/api/spu/list', (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page') || '1');
    const pageSize = Number(req.url.searchParams.get('pageSize') || '20');
    const category = req.url.searchParams.get('categoryId');
    const keyword = req.url.searchParams.get('keyword');
    const status = req.url.searchParams.get('status');

    let filteredData = generateMockSPUList(1000);

    // 应用筛选条件
    if (category) {
      filteredData = filteredData.filter(spu => spu.categoryId === category);
    }

    if (status) {
      filteredData = filteredData.filter(spu => spu.status === status);
    }

    if (keyword) {
      filteredData = filteredData.filter(spu =>
        spu.name.toLowerCase().includes(keyword.toLowerCase()) ||
        spu.code.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return res(
      ctx.delay(500), // 模拟网络延迟
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          list: paginatedData,
          pagination: {
            current: page,
            pageSize,
            total: filteredData.length,
            totalPages: Math.ceil(filteredData.length / pageSize)
          }
        }
      })
    );
  }),

  // SPU 详情查询
  rest.get('/api/spu/:id', (req, res, ctx) => {
    const { id } = req.params;
    const spu = mockSPUData.find(item => item.id === (id as string));

    if (!spu) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: 'SPU不存在'
        })
      );
    }

    return res(
      ctx.delay(300),
      ctx.status(200),
      ctx.json({
        success: true,
        data: spu
      })
    );
  }),

  // 创建 SPU
  rest.post('/api/spu', async (req, res, ctx) => {
    const spuData = await req.json();

    const newSPU = {
      id: `SPU_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      code: `SPU${Date.now()}`,
      ...spuData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    };

    mockSPUData.push(newSPU);

    return res(
      ctx.delay(800),
      ctx.status(201),
      ctx.json({
        success: true,
        data: newSPU,
        message: 'SPU创建成功'
      })
    );
  }),

  // 更新 SPU
  rest.put('/api/spu/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const updateData = await req.json();

    const index = mockSPUData.findIndex(spu => spu.id === (id as string));
    if (index === -1) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: 'SPU不存在'
        })
      );
    }

    mockSPUData[index] = {
      ...mockSPUData[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return res(
      ctx.delay(600),
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockSPUData[index],
        message: 'SPU更新成功'
      })
    );
  }),

  // 删除 SPU
  rest.delete('/api/spu/:id', (req, res, ctx) => {
    const { id } = req.params;
    const index = mockSPUData.findIndex(spu => spu.id === (id as string));

    if (index === -1) {
      return res(
        ctx.status(404),
        ctx.json({
          success: false,
          message: 'SPU不存在'
        })
      );
    }

    mockSPUData.splice(index, 1);

    return res(
      ctx.delay(400),
      ctx.status(200),
      ctx.json({
        success: true,
        message: 'SPU删除成功'
      })
    );
  }),

  // 批量删除 SPU
  rest.delete('/api/spu/batch', async (req, res, ctx) => {
    const { ids } = await req.json();

    const deletedCount = ids.reduce((count: number, id: string) => {
      const index = mockSPUData.findIndex(spu => spu.id === id);
      if (index !== -1) {
        mockSPUData.splice(index, 1);
        return count + 1;
      }
      return count;
    }, 0);

    return res(
      ctx.delay(600),
      ctx.status(200),
      ctx.json({
        success: true,
        data: { deletedCount },
        message: `成功删除${deletedCount}个SPU`
      })
    );
  }),

  // 获取分类列表
  rest.get('/api/categories', (req, res, ctx) => {
    const level = req.url.searchParams.get('level');
    const parentId = req.url.searchParams.get('parentId');

    let categories = mockCategories;

    if (level) {
      categories = categories.filter(cat => cat.level === Number(level));
    }

    if (parentId) {
      categories = categories.filter(cat => cat.parentId === parentId);
    }

    return res(
      ctx.delay(200),
      ctx.status(200),
      ctx.json({
        success: true,
        data: categories
      })
    );
  }),

  // 获取品牌列表
  rest.get('/api/brands', (req, res, ctx) => {
    return res(
      ctx.delay(200),
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockBrands
      })
    );
  }),

  // 获取属性模板
  rest.get('/api/attribute-templates/:categoryId', (req, res, ctx) => {
    const { categoryId } = req.params;

    // 根据分类返回不同的属性模板
    const templates = {
      'CAT_101': [ // 食品饮料
        { id: 'attr_1', name: '保质期', type: 'date', required: true },
        { id: 'attr_2', name: '储存条件', type: 'select', options: ['常温', '冷藏', '冷冻'], required: true },
        { id: 'attr_3', name: '规格', type: 'text', required: true }
      ],
      'CAT_102': [ // 电影票务
        { id: 'attr_4', name: '场次类型', type: 'select', options: ['2D', '3D', 'IMAX', '4DX'], required: true },
        { id: 'attr_5', name: '有效期限', type: 'date', required: true }
      ]
    };

    const template = templates[categoryId as keyof typeof templates] || [];

    return res(
      ctx.delay(200),
      ctx.status(200),
      ctx.json({
        success: true,
        data: template
      })
    );
  })
];
```

### 2. 配置 Mock 服务

```typescript
// src/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// 设置 Service Worker
export const worker = setupWorker(...handlers);

// 开发环境自动启动
export const startMockService = async () => {
  if (process.env.NODE_ENV === 'development') {
    await worker.start({
      onUnhandledRequest: 'warn',
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    });
    console.log('🔧 Mock Service Worker started');
  }
};
```

### 3. 在应用入口启动 Mock 服务

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App.tsx';
import './index.css';
import './i18n/config.ts';
import { startMockService } from './mocks/browser';

// 创建 React Query 客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// 启动 Mock 服务
startMockService().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </React.StrictMode>,
  );
});
```

## Mock 数据生成

### 1. 创建数据生成器

```typescript
// src/mocks/data/generators/spuGenerator.ts
import { faker } from '@faker-js/faker/locale/zh_CN';
import { SPUItem, SPUStatus, SPUAttribute, ProductImage, PriceAggregate, StockAggregate } from '../../../types/spu';

// 影院相关数据模板
const cinemaCategories = [
  { id: 'CAT_101', name: '食品饮料' },
  { id: 'CAT_102', name: '电影票务' },
  { id: 'CAT_103', name: '会员服务' },
  { id: 'CAT_104', name: '周边商品' },
  { id: 'CAT_105', name: '体验项目' }
];

const productTags = [
  '热销', '新品', '限量', '推荐', '特价', '精品', '经典', '人气'
];

const attributeTemplates = {
  'CAT_101': [
    { name: '保质期', type: 'date', required: true },
    { name: '储存条件', type: 'select', options: ['常温', '冷藏', '冷冻'], required: true },
    { name: '规格', type: 'text', required: true },
    { name: '成分', type: 'textarea', required: false }
  ],
  'CAT_102': [
    { name: '场次类型', type: 'select', options: ['2D', '3D', 'IMAX', '4DX'], required: true },
    { name: '有效期限', type: 'date', required: true },
    { name: '适用影厅', type: 'select', options: ['标准厅', 'VIP厅', 'IMAX厅'], required: false }
  ],
  'CAT_103': [
    { name: '会员等级', type: 'select', options: ['普通', '银卡', '金卡', '钻石'], required: true },
    { name: '有效期', type: 'number', required: true, unit: '月' }
  ]
};

export class SPUDataGenerator {
  private static instance: SPUDataGenerator;
  private generatedData: Map<string, SPUItem> = new Map();

  static getInstance(): SPUDataGenerator {
    if (!SPUDataGenerator.instance) {
      SPUDataGenerator.instance = new SPUDataGenerator();
    }
    return SPUDataGenerator.instance;
  }

  generateSingleSPU(overrides?: Partial<SPUItem>): SPUItem {
    const category = faker.helpers.arrayElement(cinemaCategories);
    const id = `SPU_${faker.datatype.number({ min: 100000, max: 999999 })}`;
    const code = `SPU${faker.datatype.number({ min: 10000, max: 99999 })}`;

    const baseSPU: SPUItem = {
      id,
      code,
      name: this.generateProductName(category.name),
      shortName: faker.lorem.words(3),
      description: faker.commerce.productDescription(),
      unit: faker.helpers.arrayElement(['瓶', '包', '盒', '张', '个', '份']),
      categoryId: category.id,
      categoryName: category.name,
      categoryPath: [category.name],
      brandId: this.generateBrandId(),
      brandName: this.generateBrandName(),
      status: faker.helpers.weightedArrayElement([
        { weight: 30, value: SPUStatus.DRAFT },
        { weight: 60, value: SPUStatus.ACTIVE },
        { weight: 10, value: SPUStatus.INACTIVE }
      ]),
      attributes: this.generateAttributes(category.id),
      images: this.generateProductImages(),
      tags: faker.helpers.arrayElements(productTags, { min: 1, max: 3 }),
      priceInfo: this.generatePriceAggregate(),
      stockInfo: this.generateStockAggregate(),
      skuCount: faker.datatype.number({ min: 1, max: 10 }),
      createdAt: faker.date.past(2).toISOString(),
      updatedAt: faker.date.recent(30).toISOString(),
      createdBy: faker.name.fullName(),
      updatedBy: faker.name.fullName()
    };

    const spu = { ...baseSPU, ...overrides };
    this.generatedData.set(id, spu);

    return spu;
  }

  generateBatchSPU(count: number, categoryId?: string): SPUItem[] {
    return Array.from({ length: count }, () =>
      this.generateSingleSPU(categoryId ? { categoryId } : undefined)
    );
  }

  generateScenario(type: 'normal' | 'lowStock' | 'newProducts' | 'inactive'): SPUItem[] {
    switch (type) {
      case 'lowStock':
        return this.generateLowStockScenario();
      case 'newProducts':
        return this.generateNewProductsScenario();
      case 'inactive':
        return this.generateInactiveScenario();
      default:
        return this.generateNormalScenario();
    }
  }

  getGeneratedData(): SPUItem[] {
    return Array.from(this.generatedData.values());
  }

  clearData(): void {
    this.generatedData.clear();
  }

  private generateProductName(category: string): string {
    const templates = {
      '食品饮料': [
        '爆米花{{size}}装',
        '可乐{{volume}}ml',
        '果汁{{volume}}ml',
        '奶茶{{flavor}}味',
        '薯片{{brand}}'
      ],
      '电影票务': [
        '标准场{{type}}电影票',
        'VIP场{{type}}电影票',
        '情侣座{{type}}票',
        '家庭套票{{type}}'
      ],
      '会员服务': [
        '会员卡{{type}}',
        '积分兑换{{item}}',
        '生日特权{{type}}',
        '观影优惠{{type}}'
      ],
      '周边商品': [
        '电影周边{{item}}',
        '影城纪念品{{variant}}',
        '明星签名版{{item}}',
        '限量版{{variant}}'
      ],
      '体验项目': [
        '{{type}}观影体验',
        '影城{{type}}活动',
        '主题{{type}}互动',
        '{{type}}工作坊'
      ]
    };

    const categoryTemplates = templates[category as keyof typeof templates] || ['{{category}}商品{{variant}}'];
    const template = faker.helpers.arrayElement(categoryTemplates);

    return template
      .replace('{{size}}', faker.helpers.arrayElement(['小', '中', '大', '特大']))
      .replace('{{volume}}', faker.datatype.number({ min: 300, max: 600 }).toString())
      .replace('{{type}}', faker.helpers.arrayElement(['2D', '3D', 'IMAX', '4DX']))
      .replace('{{flavor}}', faker.helpers.arrayElement(['原味', '草莓', '巧克力', '香草']))
      .replace('{{brand}}', faker.helpers.arrayElement(['乐事', '可比克', '品客']))
      .replace('{{item}}', faker.helpers.arrayElement(['A款', 'B款', 'C款', 'D款']))
      .replace('{{variant}}', faker.helpers.arrayElement(['经典款', '限量版', '特别版', '定制版']))
      .replace('{{category}}', category);
  }

  private generateProductImages(): ProductImage[] {
    const count = faker.datatype.number({ min: 1, max: 4 });
    return Array.from({ length: count }, (_, index) => ({
      id: faker.datatype.uuid(),
      url: faker.image.imageUrl(400, 400, 'product', true),
      alt: `${faker.lorem.words(3)} - 图片${index + 1}`,
      type: index === 0 ? 'main' : faker.helpers.arrayElement(['detail', 'gallery']),
      sortOrder: index,
      isMain: index === 0
    }));
  }

  private generateAttributes(categoryId: string): SPUAttribute[] {
    const template = attributeTemplates[categoryId as keyof typeof attributeTemplates] || [];

    return template.map(attr => ({
      id: faker.datatype.uuid(),
      name: attr.name,
      type: attr.type as any,
      value: attr.type === 'select'
        ? faker.helpers.arrayElement(attr.options || [])
        : attr.type === 'date'
        ? faker.date.future().toISOString().split('T')[0]
        : attr.type === 'number'
        ? faker.datatype.number({ min: 1, max: 100 }).toString()
        : faker.lorem.words(3),
      required: attr.required,
      options: attr.options,
      unit: attr.unit
    }));
  }

  private generatePriceAggregate(): PriceAggregate {
    const minPrice = parseFloat(faker.commerce.price(10, 100));
    const maxPrice = parseFloat(faker.commerce.price(100, 500));
    const avgPrice = (minPrice + maxPrice) / 2;

    return {
      minPrice,
      maxPrice,
      avgPrice: parseFloat(avgPrice.toFixed(2)),
      currency: 'CNY'
    };
  }

  private generateStockAggregate(): StockAggregate {
    const totalStock = faker.datatype.number({ min: 0, max: 1000 });
    const reservedStock = faker.datatype.number({ min: 0, max: Math.min(100, totalStock) });

    return {
      totalStock,
      availableStock: totalStock - reservedStock,
      reservedStock
    };
  }

  private generateBrandId(): string {
    return `BRAND_${faker.datatype.number({ min: 10, max: 99 })}`;
  }

  private generateBrandName(): string {
    return faker.helpers.arrayElement([
      '可口可乐', '百事可乐', '万达影业', '华谊兄弟',
      '中影集团', '上影集团', '横店影视', '金逸影视'
    ]);
  }

  private generateNormalScenario(): SPUItem[] {
    return [
      ...this.generateBatchSPU(50, 'CAT_101'),
      ...this.generateBatchSPU(20, 'CAT_102'),
      ...this.generateBatchSPU(15, 'CAT_103'),
      ...this.generateBatchSPU(10, 'CAT_104'),
      ...this.generateBatchSPU(5, 'CAT_105')
    ];
  }

  private generateLowStockScenario(): SPUItem[] {
    const items = this.generateBatchSPU(20);

    return items.map(item => ({
      ...item,
      stockInfo: {
        totalStock: faker.datatype.number({ min: 0, max: 20 }),
        availableStock: faker.datatype.number({ min: 0, max: 10 }),
        reservedStock: faker.datatype.number({ min: 0, max: 5 })
      },
      tags: ['低库存预警', ...item.tags.slice(0, 2)]
    }));
  }

  private generateNewProductsScenario(): SPUItem[] {
    const items = this.generateBatchSPU(30);

    return items.map(item => ({
      ...item,
      tags: ['新品', '推荐', ...item.tags.slice(0, 1)],
      createdAt: faker.date.recent(7).toISOString(),
      status: SPUStatus.ACTIVE
    }));
  }

  private generateInactiveScenario(): SPUItem[] {
    const items = this.generateBatchSPU(15);

    return items.map(item => ({
      ...item,
      status: SPUStatus.INACTIVE,
      tags: ['已停用'],
      updatedAt: faker.date.recent(90).toISOString()
    }));
  }
}

export const spuGenerator = SPUDataGenerator.getInstance();

// 导出用于测试的示例数据
export const mockSPUData: SPUItem[] = spuGenerator.generateScenario('normal');
export const generateMockSPUList = (count: number) => spuGenerator.generateBatchSPU(count);
```

### 2. 创建静态数据

```typescript
// src/mocks/data/categories.ts
import { CategoryItem } from '../../../types/category';

export const mockCategories: CategoryItem[] = [
  {
    id: 'CAT_101',
    name: '食品饮料',
    code: 'FOOD_BEVERAGE',
    parentId: null,
    level: 1,
    path: ['CAT_101'],
    sortOrder: 1,
    status: 1,
    children: [
      {
        id: 'CAT_10101',
        name: '爆米花',
        code: 'POPCORN',
        parentId: 'CAT_101',
        level: 2,
        path: ['CAT_101', 'CAT_10101'],
        sortOrder: 1,
        status: 1
      },
      {
        id: 'CAT_10102',
        name: '饮料',
        code: 'BEVERAGE',
        parentId: 'CAT_101',
        level: 2,
        path: ['CAT_101', 'CAT_10102'],
        sortOrder: 2,
        status: 1
      },
      {
        id: 'CAT_10103',
        name: '零食',
        code: 'SNACKS',
        parentId: 'CAT_101',
        level: 2,
        path: ['CAT_101', 'CAT_10103'],
        sortOrder: 3,
        status: 1
      }
    ]
  },
  {
    id: 'CAT_102',
    name: '电影票务',
    code: 'MOVIE_TICKET',
    parentId: null,
    level: 1,
    path: ['CAT_102'],
    sortOrder: 2,
    status: 1,
    children: [
      {
        id: 'CAT_10201',
        name: '标准票',
        code: 'STANDARD_TICKET',
        parentId: 'CAT_102',
        level: 2,
        path: ['CAT_102', 'CAT_10201'],
        sortOrder: 1,
        status: 1
      },
      {
        id: 'CAT_10202',
        name: 'VIP票',
        code: 'VIP_TICKET',
        parentId: 'CAT_102',
        level: 2,
        path: ['CAT_102', 'CAT_10202'],
        sortOrder: 2,
        status: 1
      }
    ]
  },
  {
    id: 'CAT_103',
    name: '会员服务',
    code: 'MEMBER_SERVICE',
    parentId: null,
    level: 1,
    path: ['CAT_103'],
    sortOrder: 3,
    status: 1
  }
];

// src/mocks/data/brands.ts
import { BrandItem } from '../../../types/brand';

export const mockBrands: BrandItem[] = [
  {
    id: 'BRAND_01',
    code: 'COCO',
    name: '可口可乐',
    logo: 'https://example.com/logos/coke.png',
    description: '全球知名饮料品牌',
    status: 1,
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'BRAND_02',
    code: 'PEPSI',
    name: '百事可乐',
    logo: 'https://example.com/logos/pepsi.png',
    description: '全球知名饮料品牌',
    status: 1,
    createdAt: '2023-01-01T00:00:00.000Z'
  },
  {
    id: 'BRAND_03',
    code: 'WANDA',
    name: '万达影业',
    logo: 'https://example.com/logos/wanda.png',
    description: '知名影视娱乐品牌',
    status: 1,
    createdAt: '2023-01-01T00:00:00.000Z'
  }
];
```

## 状态管理配置

### 1. 创建 SPU Store（Zustand）

```typescript
// src/stores/spuStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SPUItem, SPUFilters, PaginationInfo, SPUStatus } from '../types/spu';

interface SPUState {
  // 数据状态
  items: SPUItem[];
  selectedItem: SPUItem | null;

  // 加载状态
  loading: {
    list: boolean;
    detail: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };

  // 错误状态
  errors: {
    list?: string;
    detail?: string;
    create?: string;
    update?: string;
    delete?: string;
  };

  // 分页和筛选
  filters: SPUFilters;
  pagination: PaginationInfo;
  selectedRowKeys: string[];

  // 操作方法
  setItems: (items: SPUItem[]) => void;
  setSelectedItem: (item: SPUItem | null) => void;
  setLoading: (key: keyof typeof loading, value: boolean) => void;
  setError: (key: keyof typeof errors, error?: string) => void;
  setFilters: (filters: Partial<SPUFilters>) => void;
  clearFilters: () => void;
  setPagination: (pagination: Partial<PaginationInfo>) => void;
  setSelectedRowKeys: (keys: string[]) => void;
  clearSelectedRowKeys: () => void;

  // 数据操作
  addItem: (item: SPUItem) => void;
  updateItem: (id: string, updates: Partial<SPUItem>) => void;
  removeItem: (id: string) => void;
  removeItems: (ids: string[]) => void;

  // 重置状态
  reset: () => void;
}

const initialState = {
  items: [],
  selectedItem: null,
  loading: {
    list: false,
    detail: false,
    create: false,
    update: false,
    delete: false
  },
  errors: {},
  filters: {},
  pagination: {
    current: 1,
    pageSize: 20,
    total: 0
  },
  selectedRowKeys: []
};

export const useSPUStore = create<SPUState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setItems: (items) => set({ items }),

      setSelectedItem: (selectedItem) => set({ selectedItem }),

      setLoading: (key, value) =>
        set((state) => ({
          loading: { ...state.loading, [key]: value }
        })),

      setError: (key, error) =>
        set((state) => ({
          errors: { ...state.errors, [key]: error }
        })),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        })),

      clearFilters: () => set({ filters: {} }),

      setPagination: (newPagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...newPagination }
        })),

      setSelectedRowKeys: (selectedRowKeys) => set({ selectedRowKeys }),

      clearSelectedRowKeys: () => set({ selectedRowKeys: [] }),

      addItem: (item) =>
        set((state) => ({
          items: [item, ...state.items],
          pagination: {
            ...state.pagination,
            total: state.pagination.total + 1
          }
        })),

      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map(item =>
            item.id === id ? { ...item, ...updates } : item
          ),
          selectedItem:
            state.selectedItem?.id === id
              ? { ...state.selectedItem, ...updates }
              : state.selectedItem
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter(item => item.id !== id),
          selectedItem:
            state.selectedItem?.id === id ? null : state.selectedItem,
          selectedRowKeys: state.selectedRowKeys.filter(key => key !== id),
          pagination: {
            ...state.pagination,
            total: Math.max(0, state.pagination.total - 1)
          }
        })),

      removeItems: (ids) =>
        set((state) => {
          const filteredItems = state.items.filter(item => !ids.includes(item.id));
          return {
            items: filteredItems,
            selectedItem:
              state.selectedItem && ids.includes(state.selectedItem.id)
                ? null
                : state.selectedItem,
            selectedRowKeys: state.selectedRowKeys.filter(key => !ids.includes(key)),
            pagination: {
              ...state.pagination,
              total: Math.max(0, state.pagination.total - ids.length)
            }
          };
        }),

      reset: () => set(initialState)
    }),
    {
      name: 'spu-store'
    }
  )
);
```

### 2. 创建分类和品牌 Store

```typescript
// src/stores/categoryStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { CategoryItem } from '../types/category';

interface CategoryState {
  items: CategoryItem[];
  loading: boolean;
  error?: string;

  setItems: (items: CategoryItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  reset: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  devtools(
    (set) => ({
      items: [],
      loading: false,
      error: undefined,

      setItems: (items) => set({ items }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      reset: () => set({ items: [], loading: false, error: undefined })
    }),
    {
      name: 'category-store'
    }
  )
);

// src/stores/brandStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BrandItem } from '../types/brand';

interface BrandState {
  items: BrandItem[];
  loading: boolean;
  error?: string;

  setItems: (items: BrandItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: string) => void;
  reset: () => void;
}

export const useBrandStore = create<BrandState>()(
  devtools(
    (set) => ({
      items: [],
      loading: false,
      error: undefined,

      setItems: (items) => set({ items }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      reset: () => set({ items: [], loading: false, error: undefined })
    }),
    {
      name: 'brand-store'
    }
  )
);
```

## API 服务层

### 1. 创建 SPU API 服务

```typescript
// src/services/spuAPI.ts
import axios from 'axios';
import { SPUItem, SPUFilters, PaginationInfo, SPUCreateRequest, SPUUpdateRequest } from '../types/spu';

// API 基础配置
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export interface SPUListResponse {
  success: boolean;
  data: {
    list: SPUItem[];
    pagination: PaginationInfo;
  };
}

export interface SPUDetailResponse {
  success: boolean;
  data: SPUItem;
}

export interface SPUCreateResponse {
  success: boolean;
  data: SPUItem;
  message: string;
}

export interface SPUUpdateResponse {
  success: boolean;
  data: SPUItem;
  message: string;
}

export interface SPUDestroyResponse {
  success: boolean;
  message: string;
}

export interface SPUBatchDestroyResponse {
  success: boolean;
  data: { deletedCount: number };
  message: string;
}

export const spuAPI = {
  // 获取 SPU 列表
  getSPUList: async (params: {
    page: number;
    pageSize: number;
    filters?: SPUFilters;
  }): Promise<SPUListResponse> => {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      pageSize: params.pageSize.toString()
    });

    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/spu/list?${queryParams.toString()}`);
    return response;
  },

  // 获取 SPU 详情
  getSPUDetail: async (id: string): Promise<SPUDetailResponse> => {
    const response = await api.get(`/spu/${id}`);
    return response;
  },

  // 创建 SPU
  createSPU: async (data: SPUCreateRequest): Promise<SPUCreateResponse> => {
    const response = await api.post('/spu', data);
    return response;
  },

  // 更新 SPU
  updateSPU: async (id: string, data: SPUUpdateRequest): Promise<SPUUpdateResponse> => {
    const response = await api.put(`/spu/${id}`, data);
    return response;
  },

  // 删除 SPU
  deleteSPU: async (id: string): Promise<SPUDestroyResponse> => {
    const response = await api.delete(`/spu/${id}`);
    return response;
  },

  // 批量删除 SPU
  batchDeleteSPU: async (ids: string[]): Promise<SPUBatchDestroyResponse> => {
    const response = await api.delete('/spu/batch', { data: { ids } });
    return response;
  },

  // 更新 SPU 状态
  updateSPUStatus: async (id: string, status: string): Promise<SPUUpdateResponse> => {
    const response = await api.patch(`/spu/${id}/status`, { status });
    return response;
  },

  // 导出 SPU 数据
  exportSPU: async (params: {
    filters?: SPUFilters;
    format?: 'excel' | 'csv';
  }): Promise<Blob> => {
    const queryParams = new URLSearchParams();

    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    if (params.format) {
      queryParams.append('format', params.format);
    }

    const response = await api.get(`/spu/export?${queryParams.toString()}`, {
      responseType: 'blob'
    });
    return response;
  }
};
```

### 2. 创建分类和品牌 API 服务

```typescript
// src/services/categoryAPI.ts
import axios from 'axios';
import { CategoryItem } from '../types/category';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const categoryAPI = {
  // 获取分类列表
  getCategories: async (params?: {
    level?: number;
    parentId?: string;
    status?: number;
  }): Promise<{ success: boolean; data: CategoryItem[] }> => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/categories?${queryParams.toString()}`);
    return response;
  },

  // 获取分类详情
  getCategoryDetail: async (id: string): Promise<{ success: boolean; data: CategoryItem }> => {
    const response = await api.get(`/categories/${id}`);
    return response;
  }
};

// src/services/brandAPI.ts
import axios from 'axios';
import { BrandItem } from '../types/brand';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const brandAPI = {
  // 获取品牌列表
  getBrands: async (params?: {
    status?: number;
  }): Promise<{ success: boolean; data: BrandItem[] }> => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/brands?${queryParams.toString()}`);
    return response;
  },

  // 获取品牌详情
  getBrandDetail: async (id: string): Promise<{ success: boolean; data: BrandItem }> => {
    const response = await api.get(`/brands/${id}`);
    return response;
  }
};
```

## 核心组件开发

### 1. SPU 列表组件

```typescript
// src/components/SPU/SPUList/index.tsx
import React, { useEffect } from 'react';
import { Table, Button, Space, Tag, Input, Select, message, Popconfirm } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  ExportOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSPUStore } from '../../../stores/spuStore';
import { useCategoryStore } from '../../../stores/categoryStore';
import { useBrandStore } from '../../../stores/brandStore';
import { spuAPI } from '../../../services/spuAPI';
import { categoryAPI } from '../../../services/categoryAPI';
import { brandAPI } from '../../../services/brandAPI';
import { SPUItem, SPUStatus } from '../../../types/spu';
import { SPUColumnsGenerator } from './columns';
import { SPUFilters } from './filters';

const SPUList: React.FC = () => {
  const navigate = useNavigate();

  // Zustand stores
  const {
    items,
    loading,
    pagination,
    filters,
    selectedRowKeys,
    setLoading,
    setError,
    setItems,
    setPagination,
    setFilters,
    setSelectedRowKeys,
    removeItems
  } = useSPUStore();

  const { items: categories, setItems: setCategories } = useCategoryStore();
  const { items: brands, setItems: setBrands } = useBrandStore();

  // 加载分类和品牌数据
  useQuery({
    queryKey: ['categories'],
    queryFn: categoryAPI.getCategories,
    onSuccess: (data) => setCategories(data.data),
    onError: (error: any) => console.error('加载分类失败:', error)
  });

  useQuery({
    queryKey: ['brands'],
    queryFn: brandAPI.getBrands,
    onSuccess: (data) => setBrands(data.data),
    onError: (error: any) => console.error('加载品牌失败:', error)
  });

  // 加载 SPU 列表
  const {
    refetch: refetchSPUList
  } = useQuery({
    queryKey: ['spuList', pagination.current, pagination.pageSize, filters],
    queryFn: () => spuAPI.getSPUList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      filters
    }),
    onSuccess: (data) => {
      setItems(data.data.list);
      setPagination({
        current: data.data.pagination.current,
        pageSize: data.data.pagination.pageSize,
        total: data.data.pagination.total
      });
    },
    onError: (error: any) => {
      setError('list', error.message || '加载列表失败');
      message.error('加载SPU列表失败');
    }
  });

  // 生成表格列
  const columns = SPUColumnsGenerator({
    onEdit: (record) => handleEdit(record),
    onDelete: (record) => handleDelete(record),
    onCopy: (record) => handleCopy(record),
    categories,
    brands
  });

  // 搜索处理
  const handleSearch = (keyword: string) => {
    setFilters({ keyword });
    setPagination({ current: 1 });
  };

  // 筛选处理
  const handleFilter = (key: string, value: any) => {
    setFilters({ [key]: value });
    setPagination({ current: 1 });
  };

  // 分页处理
  const handleTableChange = (page: number, pageSize?: number) => {
    setPagination({
      current: page,
      ...(pageSize && { pageSize })
    });
  };

  // 行选择
  const handleRowSelect = (selectedRowKeys: string[]) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  // 操作函数
  const handleCreate = () => {
    navigate('/spu/create');
  };

  const handleEdit = (record: SPUItem) => {
    navigate(`/spu/edit/${record.id}`);
  };

  const handleDelete = async (record: SPUItem) => {
    try {
      setLoading('delete', true);
      await spuAPI.deleteSPU(record.id);
      message.success('SPU删除成功');
      refetchSPUList();
    } catch (error: any) {
      message.error(error.message || '删除失败');
    } finally {
      setLoading('delete', false);
    }
  };

  const handleCopy = (record: SPUItem) => {
    navigate(`/spu/create?copyId=${record.id}`);
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的SPU');
      return;
    }

    try {
      setLoading('delete', true);
      await spuAPI.batchDeleteSPU(selectedRowKeys);
      message.success(`成功删除${selectedRowKeys.length}个SPU`);
      setSelectedRowKeys([]);
      refetchSPUList();
    } catch (error: any) {
      message.error(error.message || '批量删除失败');
    } finally {
      setLoading('delete', false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await spuAPI.exportSPU({
        filters,
        format: 'excel'
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SPU数据_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      message.success('导出成功');
    } catch (error: any) {
      message.error('导出失败');
    }
  };

  return (
    <div className="spu-list p-6">
      {/* 搜索和筛选区域 */}
      <SPUFilters
        categories={categories}
        brands={brands}
        filters={filters}
        onSearch={handleSearch}
        onFilter={handleFilter}
        onReset={() => {
          setFilters({});
          setPagination({ current: 1 });
        }}
      />

      {/* 操作按钮 */}
      <div className="mb-4 flex justify-between">
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新建 SPU
          </Button>

          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title="确认删除"
              description={`确定要删除选中的${selectedRowKeys.length}个SPU吗？`}
              onConfirm={handleBatchDelete}
              okText="确认"
              cancelText="取消"
            >
              <Button
                danger
                loading={loading.delete}
              >
                批量删除 ({selectedRowKeys.length})
              </Button>
            </Popconfirm>
          )}
        </Space>

        <Button
          icon={<ExportOutlined />}
          onClick={handleExport}
        >
          导出数据
        </Button>
      </div>

      {/* 表格 */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        loading={loading.list}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: handleTableChange,
          onShowSizeChange: (current, size) => handleTableChange(1, size)
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: handleRowSelect,
          preserveSelectedRowKeys: true
        }}
        scroll={{ x: 1400 }}
        size="middle"
      />
    </div>
  );
};

export default SPUList;
```

### 2. 表格列配置

```typescript
// src/components/SPU/SPUList/columns.tsx
import React from 'react';
import { Button, Space, Tag, Tooltip, Avatar } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  EyeOutlined,
  ImageOutlined
} from '@ant-design/icons';
import { SPUItem, SPUStatus } from '../../../types/spu';
import { CategoryItem } from '../../../types/category';
import { BrandItem } from '../../../types/brand';

interface SPUColumnsProps {
  onEdit?: (record: SPUItem) => void;
  onDelete?: (record: SPUItem) => void;
  onCopy?: (record: SPUItem) => void;
  onView?: (record: SPUItem) => void;
  categories: CategoryItem[];
  brands: BrandItem[];
}

export const SPUColumnsGenerator = ({
  onEdit,
  onDelete,
  onCopy,
  onView,
  categories,
  brands
}: SPUColumnsProps) => {
  // 获取分类名称
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  };

  // 获取品牌名称
  const getBrandName = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    return brand?.name || brandId;
  };

  // 状态颜色映射
  const statusColors = {
    [SPUStatus.DRAFT]: 'orange',
    [SPUStatus.ACTIVE]: 'green',
    [SPUStatus.INACTIVE]: 'red'
  };

  // 状态文本映射
  const statusTexts = {
    [SPUStatus.DRAFT]: '草稿',
    [SPUStatus.ACTIVE]: '启用',
    [SPUStatus.INACTIVE]: '停用'
  };

  const columns = [
    {
      title: 'SPU编码',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      fixed: 'left',
      render: (code: string) => (
        <span className="font-mono text-sm">{code}</span>
      )
    },
    {
      title: 'SPU名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (name: string) => (
        <Tooltip placement="topLeft" title={name}>
          <span>{name}</span>
        </Tooltip>
      )
    },
    {
      title: '简称',
      dataIndex: 'shortName',
      key: 'shortName',
      width: 120,
      ellipsis: true,
      render: (shortName: string) => shortName || '-'
    },
    {
      title: '品牌',
      dataIndex: 'brandId',
      key: 'brand',
      width: 120,
      render: (brandId: string) => (
        <span className="text-gray-600">
          {getBrandName(brandId)}
        </span>
      )
    },
    {
      title: '分类',
      dataIndex: 'categoryId',
      key: 'category',
      width: 120,
      render: (categoryId: string) => (
        <Tag color="blue">
          {getCategoryName(categoryId)}
        </Tag>
      )
    },
    {
      title: '价格区间',
      dataIndex: 'priceInfo',
      key: 'priceRange',
      width: 120,
      render: (priceInfo: { minPrice: number; maxPrice: number; currency: string }) => (
        <div className="text-sm">
          <div className="text-gray-500">
            ¥{priceInfo.minPrice.toFixed(2)} - ¥{priceInfo.maxPrice.toFixed(2)}
          </div>
        </div>
      )
    },
    {
      title: '库存',
      dataIndex: 'stockInfo',
      key: 'stock',
      width: 100,
      render: (stockInfo: { availableStock: number; totalStock: number }) => {
        const lowStock = stockInfo.availableStock <= 10;
        return (
          <div className="text-sm">
            <div className={lowStock ? 'text-red-500 font-medium' : ''}>
              {stockInfo.availableStock}
            </div>
            <div className="text-gray-400 text-xs">
              总计: {stockInfo.totalStock}
            </div>
            {lowStock && (
              <div className="text-red-400 text-xs">低库存</div>
            )}
          </div>
        );
      }
    },
    {
      title: 'SKU数量',
      dataIndex: 'skuCount',
      key: 'skuCount',
      width: 80,
      align: 'center',
      render: (skuCount: number) => (
        <span className="text-gray-600">{skuCount}</span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: SPUStatus) => (
        <Tag color={statusColors[status]}>
          {statusTexts[status]}
        </Tag>
      )
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: (tags: string[]) => (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map(tag => (
            <Tag key={tag} size="small" color="default">
              {tag}
            </Tag>
          ))}
          {tags.length > 2 && (
            <Tag size="small" color="default">
              +{tags.length - 2}
            </Tag>
          )}
        </div>
      )
    },
    {
      title: '图片',
      dataIndex: 'images',
      key: 'images',
      width: 60,
      render: (images: { url: string; isMain: boolean }[]) => {
        const mainImage = images.find(img => img.isMain) || images[0];
        return mainImage ? (
          <Avatar
            size="small"
            shape="square"
            src={mainImage.url}
            icon={<ImageOutlined />}
          />
        ) : (
          <Avatar size="small" shape="square" icon={<ImageOutlined />} />
        );
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => (
        <div className="text-sm text-gray-600">
          {new Date(date).toLocaleDateString('zh-CN')}
        </div>
      )
    },
    {
      title: '更新人',
      dataIndex: 'updatedBy',
      key: 'updatedBy',
      width: 100,
      ellipsis: true,
      render: (updatedBy: string) => (
        <span className="text-sm text-gray-600">{updatedBy}</span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record: SPUItem) => (
        <Space size="small">
          {onView && (
            <Tooltip title="查看详情">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => onView(record)}
              />
            </Tooltip>
          )}

          {onEdit && (
            <Tooltip title="编辑">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
              />
            </Tooltip>
          )}

          {onCopy && (
            <Tooltip title="复制">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={() => onCopy(record)}
              />
            </Tooltip>
          )}

          {onDelete && (
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDelete(record)}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  return columns;
};
```

### 3. 筛选组件

```typescript
// src/components/SPU/SPUList/filters.tsx
import React from 'react';
import { Card, Form, Input, Select, Button, Space, Row, Col } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { SPUFilters } from '../../../types/spu';
import { CategoryItem } from '../../../types/category';
import { BrandItem } from '../../../types/brand';
import { SPUStatus } from '../../../types/spu';

interface SPUFiltersProps {
  categories: CategoryItem[];
  brands: BrandItem[];
  filters: SPUFilters;
  onSearch: (keyword: string) => void;
  onFilter: (key: string, value: any) => void;
  onReset: () => void;
}

const SPUFilters: React.FC<SPUFiltersProps> = ({
  categories,
  brands,
  filters,
  onSearch,
  onFilter,
  onReset
}) => {
  const [form] = Form.useForm();

  const handleSearch = (values: any) => {
    onSearch(values.keyword || '');

    // 应用筛选条件
    const filterValues: Partial<SPUFilters> = {};

    if (values.categoryId) filterValues.categoryId = values.categoryId;
    if (values.brandId) filterValues.brandId = values.brandId;
    if (values.status) filterValues.status = values.status;
    if (values.tags?.length > 0) filterValues.tags = values.tags;

    Object.entries(filterValues).forEach(([key, value]) => {
      onFilter(key, value);
    });
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  // 扁平化分类数据（只显示二级分类）
  const flattenCategories = (categories: CategoryItem[]) => {
    const result: CategoryItem[] = [];

    categories.forEach(category => {
      if (category.children && category.children.length > 0) {
        result.push({
          ...category,
          name: `${category.name} (全部)`
        });
        category.children.forEach(child => {
          result.push(child);
        });
      } else {
        result.push(category);
      }
    });

    return result;
  };

  return (
    <Card size="small" className="mb-4">
      <Form
        form={form}
        initialValues={filters}
        onFinish={handleSearch}
        layout="vertical"
      >
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="搜索关键词" name="keyword">
              <Input
                placeholder="输入SPU名称或编码"
                allowClear
                suffix={<SearchOutlined className="text-gray-400" />}
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="商品分类" name="categoryId">
              <Select
                placeholder="选择分类"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {flattenCategories(categories).map(category => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item label="品牌" name="brandId">
              <Select
                placeholder="选择品牌"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {brands.map(brand => (
                  <Select.Option key={brand.id} value={brand.id}>
                    {brand.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={3}>
            <Form.Item label="状态" name="status">
              <Select placeholder="选择状态" allowClear>
                <Select.Option value={SPUStatus.DRAFT}>草稿</Select.Option>
                <Select.Option value={SPUStatus.ACTIVE}>启用</Select.Option>
                <Select.Option value={SPUStatus.INACTIVE}>停用</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={5}>
            <Form.Item label="标签" name="tags">
              <Select
                mode="multiple"
                placeholder="选择标签"
                allowClear
                maxTagCount={2}
              >
                <Select.Option value="热销">热销</Select.Option>
                <Select.Option value="新品">新品</Select.Option>
                <Select.Option value="限量">限量</Select.Option>
                <Select.Option value="推荐">推荐</Select.Option>
                <Select.Option value="特价">特价</Select.Option>
                <Select.Option value="精品">精品</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={2}>
            <Form.Item label=" " colon={false}>
              <Space>
                <Button type="primary" htmlType="submit">
                  筛选
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                >
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default SPUFilters;
```

## 自定义 Hooks

### 1. SPU 相关 Hooks

```typescript
// src/hooks/useSPU.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { spuAPI } from '../services/spuAPI';
import { useSPUStore } from '../stores/spuStore';
import { SPUCreateRequest, SPUUpdateRequest } from '../types/spu';

export const useSPU = () => {
  const navigate = useNavigate();
  const { setLoading, setError, addItem, updateItem, removeItem, removeItems } = useSPUStore();

  // 创建 SPU
  const createSPUMutation = useMutation({
    mutationFn: (data: SPUCreateRequest) => spuAPI.createSPU(data),
    onMutate: () => {
      setLoading('create', true);
    },
    onSuccess: (response) => {
      message.success(response.message || 'SPU创建成功');
      addItem(response.data);
      navigate('/spu/list');
    },
    onError: (error: any) => {
      setError('create', error.message || '创建失败');
      message.error(error.message || '创建失败');
    },
    onSettled: () => {
      setLoading('create', false);
    }
  });

  // 更新 SPU
  const updateSPUMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SPUUpdateRequest }) =>
      spuAPI.updateSPU(id, data),
    onMutate: () => {
      setLoading('update', true);
    },
    onSuccess: (response, variables) => {
      message.success(response.message || 'SPU更新成功');
      updateItem(variables.id, response.data);
      navigate('/spu/list');
    },
    onError: (error: any) => {
      setError('update', error.message || '更新失败');
      message.error(error.message || '更新失败');
    },
    onSettled: () => {
      setLoading('update', false);
    }
  });

  // 删除 SPU
  const deleteSPUMutation = useMutation({
    mutationFn: (id: string) => spuAPI.deleteSPU(id),
    onMutate: () => {
      setLoading('delete', true);
    },
    onSuccess: (response, id) => {
      message.success(response.message || 'SPU删除成功');
      removeItem(id);
    },
    onError: (error: any) => {
      setError('delete', error.message || '删除失败');
      message.error(error.message || '删除失败');
    },
    onSettled: () => {
      setLoading('delete', false);
    }
  });

  // 批量删除 SPU
  const batchDeleteSPUMutation = useMutation({
    mutationFn: (ids: string[]) => spuAPI.batchDeleteSPU(ids),
    onMutate: () => {
      setLoading('delete', true);
    },
    onSuccess: (response, ids) => {
      message.success(response.message || `成功删除${ids.length}个SPU`);
      removeItems(ids);
    },
    onError: (error: any) => {
      setError('delete', error.message || '批量删除失败');
      message.error(error.message || '批量删除失败');
    },
    onSettled: () => {
      setLoading('delete', false);
    }
  });

  // 更新 SPU 状态
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      spuAPI.updateSPUStatus(id, status),
    onSuccess: (response, variables) => {
      message.success('状态更新成功');
      updateItem(variables.id, { status: response.data.status });
    },
    onError: (error: any) => {
      message.error(error.message || '状态更新失败');
    }
  });

  return {
    createSPU: createSPUMutation.mutate,
    updateSPU: updateSPUMutation.mutate,
    deleteSPU: deleteSPUMutation.mutate,
    batchDeleteSPU: batchDeleteSPUMutation.mutate,
    updateStatus: updateStatusMutation.mutate,

    isCreating: createSPUMutation.isPending,
    isUpdating: updateSPUMutation.isPending,
    isDeleting: deleteSPUMutation.isPending,
    isBatchDeleting: batchDeleteSPUMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending
  };
};

// 获取 SPU 详情
export const useSPUDetail = (id: string) => {
  const { setSelectedItem, setLoading, setError } = useSPUStore();

  return useQuery({
    queryKey: ['spuDetail', id],
    queryFn: () => spuAPI.getSPUDetail(id),
    enabled: !!id,
    onMutate: () => {
      setLoading('detail', true);
      setSelectedItem(null);
    },
    onSuccess: (response) => {
      setSelectedItem(response.data);
    },
    onError: (error: any) => {
      setError('detail', error.message || '加载详情失败');
    },
    onSettled: () => {
      setLoading('detail', false);
    }
  });
};
```

### 2. Mock 数据 Hooks

```typescript
// src/hooks/useMockData.ts
import { useEffect, useState } from 'react';
import { spuGenerator } from '../mocks/data/generators/spuGenerator';
import { mockCategories } from '../mocks/data/categories';
import { mockBrands } from '../mocks/data/brands';
import { SPUItem } from '../types/spu';

export const useMockData = () => {
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    // 初始化 Mock 数据
    const initData = async () => {
      try {
        // 生成基础数据
        spuGenerator.generateScenario('normal');

        // 等待数据准备完成
        setTimeout(() => {
          setIsDataReady(true);
        }, 100);
      } catch (error) {
        console.error('初始化 Mock 数据失败:', error);
      }
    };

    initData();
  }, []);

  const refreshData = (scenario?: 'normal' | 'lowStock' | 'newProducts' | 'inactive') => {
    spuGenerator.clearData();
    return spuGenerator.generateScenario(scenario || 'normal');
  };

  const generateData = (count: number, categoryId?: string) => {
    return spuGenerator.generateBatchSPU(count, categoryId);
  };

  return {
    isDataReady,
    refreshData,
    generateData,
    getCategories: () => mockCategories,
    getBrands: () => mockBrands,
    getGeneratedData: () => spuGenerator.getGeneratedData()
  };
};
```

## 类型定义

### 1. SPU 相关类型

```typescript
// src/types/spu.ts
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

export enum SPUStatus {
  DRAFT = 'draft',                     // 草稿
  ACTIVE = 'active',                   // 启用
  INACTIVE = 'inactive'               // 停用
}

export interface SPUAttribute {
  id: string;                          // 属性ID
  name: string;                        // 属性名称
  type: AttributeType;                 // 属性类型
  value: string;                       // 属性值
  required: boolean;                   // 是否必填
  options?: string[];                  // 选项（用于select类型）
  unit?: string;                       // 单位
}

export enum AttributeType {
  TEXT = 'text',                       // 文本
  NUMBER = 'number',                   // 数字
  DATE = 'date',                       // 日期
  SELECT = 'select',                   // 下拉选择
  TEXTAREA = 'textarea'                // 多行文本
}

export interface ProductImage {
  id: string;                          // 图片ID
  url: string;                         // 图片URL
  alt?: string;                        // 图片描述
  type: ImageType;                     // 图片类型
  sortOrder: number;                   // 排序序号
  isMain: boolean;                     // 是否主图
}

export enum ImageType {
  MAIN = 'main',                       // 主图
  DETAIL = 'detail',                   // 详情图
  GALLERY = 'gallery',                 // 商品图库
  PACKAGING = 'packaging',             // 包装图
}

export interface PriceAggregate {
  minPrice: number;                    // 最低价格
  maxPrice: number;                    // 最高价格
  avgPrice: number;                    // 平均价格
  currency: string;                    // 货币单位
}

export interface StockAggregate {
  totalStock: number;                  // 总库存
  availableStock: number;              // 可用库存
  reservedStock: number;               // 预留库存
}

export interface SPUFilters {
  keyword?: string;                    // 搜索关键词
  categoryId?: string;                 // 分类ID
  brandId?: string;                    // 品牌ID
  status?: string;                     // 状态
  tags?: string[];                     // 标签
  minPrice?: number;                   // 最低价格
  maxPrice?: number;                   // 最高价格
  lowStock?: boolean;                  // 低库存
  dateRange?: [string, string];        // 日期范围
}

export interface PaginationInfo {
  current: number;                     // 当前页码
  pageSize: number;                    // 每页大小
  total: number;                       // 总记录数
}

export interface SPUCreateRequest {
  name: string;                        // SPU名称
  shortName?: string;                  // 简称
  description?: string;                // 描述
  unit?: string;                       // 单位
  categoryId: string;                  // 分类ID
  brandId: string;                     // 品牌ID
  attributes: SPUAttribute[];          // 属性
  images: ProductImage[];              // 图片
  tags: string[];                      // 标签
}

export interface SPUUpdateRequest {
  name?: string;                       // SPU名称
  shortName?: string;                  // 简称
  description?: string;                // 描述
  unit?: string;                       // 单位
  categoryId?: string;                 // 分类ID
  brandId?: string;                    // 品牌ID
  status?: SPUStatus;                  // 状态
  attributes?: SPUAttribute[];         // 属性
  images?: ProductImage[];             // 图片
  tags?: string[];                     // 标签
}
```

### 2. 分类和品牌类型

```typescript
// src/types/category.ts
export interface CategoryItem {
  id: string;                          // 分类ID
  name: string;                        // 分类名称
  code: string;                        // 分类编码
  parentId: string | null;             // 父分类ID
  level: number;                       // 分类层级
  path: string[];                      // 分类路径
  sortOrder: number;                   // 排序序号
  status: number;                      // 状态：1-启用，0-禁用
  children?: CategoryItem[];           // 子分类
}

// src/types/brand.ts
export interface BrandItem {
  id: string;                          // 品牌ID
  code: string;                        // 品牌编码
  name: string;                        // 品牌名称
  logo?: string;                       // 品牌Logo
  description?: string;                // 品牌描述
  status: number;                      // 状态：1-启用，0-禁用
  createdAt: string;                   // 创建时间
}
```

## 测试实现

### 1. 组件测试

```typescript
// src/components/SPU/SPUList/index.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import SPUList from './index';
import { useSPUStore } from '../../../stores/spuStore';
import { useCategoryStore } from '../../../stores/categoryStore';
import { useBrandStore } from '../../../stores/brandStore';

// Mock stores
jest.mock('../../../stores/spuStore');
jest.mock('../../../stores/categoryStore');
jest.mock('../../../stores/brandStore');

// Mock API
jest.mock('../../../services/spuAPI');
jest.mock('../../../services/categoryAPI');
jest.mock('../../../services/brandAPI');

const mockUseSPUStore = useSPUStore as jest.MockedFunction<typeof useSPUStore>;
const mockUseCategoryStore = useCategoryStore as jest.MockedFunction<typeof useCategoryStore>;
const mockUseBrandStore = useBrandStore as jest.MockedFunction<typeof useBrandStore>;

// 创建测试用的 QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderSPUList = () => {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ConfigProvider locale={zhCN}>
          <SPUList />
        </ConfigProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('SPUList', () => {
  const mockSPUStore = {
    items: [
      {
        id: 'SPU_001',
        code: 'SPU10001',
        name: '测试SPU',
        categoryId: 'CAT_101',
        brandId: 'BRAND_01',
        status: 'active',
        priceInfo: { minPrice: 10, maxPrice: 50, avgPrice: 30, currency: 'CNY' },
        stockInfo: { totalStock: 100, availableStock: 80, reservedStock: 20 },
        skuCount: 3,
        attributes: [],
        images: [],
        tags: ['热销'],
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        createdBy: 'test',
        updatedBy: 'test'
      }
    ],
    loading: { list: false, detail: false, create: false, update: false, delete: false },
    pagination: { current: 1, pageSize: 20, total: 1 },
    filters: {},
    selectedRowKeys: [],
    setLoading: jest.fn(),
    setError: jest.fn(),
    setItems: jest.fn(),
    setPagination: jest.fn(),
    setFilters: jest.fn(),
    setSelectedRowKeys: jest.fn()
  };

  const mockCategoryStore = {
    items: [
      { id: 'CAT_101', name: '食品饮料', code: 'FOOD', parentId: null, level: 1, path: ['CAT_101'], sortOrder: 1, status: 1 },
      { id: 'CAT_102', name: '电影票务', code: 'TICKET', parentId: null, level: 1, path: ['CAT_102'], sortOrder: 2, status: 1 }
    ],
    loading: false,
    setItems: jest.fn()
  };

  const mockBrandStore = {
    items: [
      { id: 'BRAND_01', name: '可口可乐', code: 'COCO', status: 1, createdAt: '2023-01-01T00:00:00.000Z' },
      { id: 'BRAND_02', name: '百事可乐', code: 'PEPSI', status: 1, createdAt: '2023-01-01T00:00:00.000Z' }
    ],
    loading: false,
    setItems: jest.fn()
  };

  beforeEach(() => {
    mockUseSPUStore.mockReturnValue(mockSPUStore as any);
    mockUseCategoryStore.mockReturnValue(mockCategoryStore as any);
    mockUseBrandStore.mockReturnValue(mockBrandStore as any);
  });

  it('应该渲染SPU列表', () => {
    renderSPUList();

    expect(screen.getByText('测试SPU')).toBeInTheDocument();
    expect(screen.getByText('SPU10001')).toBeInTheDocument();
    expect(screen.getByText('食品饮料')).toBeInTheDocument();
  });

  it('应该显示搜索和筛选功能', () => {
    renderSPUList();

    expect(screen.getByPlaceholderText('输入SPU名称或编码')).toBeInTheDocument();
    expect(screen.getByText('商品分类')).toBeInTheDocument();
    expect(screen.getByText('品牌')).toBeInTheDocument();
    expect(screen.getByText('状态')).toBeInTheDocument();
  });

  it('应该支持搜索功能', async () => {
    renderSPUList();

    const searchInput = screen.getByPlaceholderText('输入SPU名称或编码');
    fireEvent.change(searchInput, { target: { value: '测试' } });

    const searchButton = screen.getByText('筛选');
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockSPUStore.setFilters).toHaveBeenCalledWith({ keyword: '测试' });
    });
  });

  it('应该支持分类筛选', async () => {
    renderSPUList();

    const categorySelect = screen.getByText('选择分类');
    fireEvent.mouseDown(categorySelect);

    const categoryOption = screen.getByText('食品饮料');
    fireEvent.click(categoryOption);

    await waitFor(() => {
      expect(mockSPUStore.setFilters).toHaveBeenCalled();
    });
  });

  it('应该支持新建SPU', () => {
    const mockNavigate = jest.fn();
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));

    renderSPUList();

    const createButton = screen.getByText('新建 SPU');
    fireEvent.click(createButton);

    // 验证导航行为
    expect(mockNavigate).toHaveBeenCalledWith('/spu/create');
  });
});
```

### 2. Mock 数据生成器测试

```typescript
// src/mocks/data/generators/spuGenerator.test.ts
import { spuGenerator } from './spuGenerator';
import { SPUStatus } from '../../../types/spu';

describe('SPUDataGenerator', () => {
  beforeEach(() => {
    spuGenerator.clearData();
  });

  it('应该生成单个SPU', () => {
    const spu = spuGenerator.generateSingleSPU();

    expect(spu).toHaveProperty('id');
    expect(spu).toHaveProperty('code');
    expect(spu).toHaveProperty('name');
    expect(spu).toHaveProperty('status');
    expect(spu).toHaveProperty('categoryId');
    expect(spu).toHaveProperty('brandId');
    expect(spu.priceInfo).toHaveProperty('minPrice');
    expect(spu.priceInfo).toHaveProperty('maxPrice');
    expect(spu.stockInfo).toHaveProperty('availableStock');
    expect(spu.stockInfo).toHaveProperty('totalStock');
    expect(spu.attributes).toBeInstanceOf(Array);
    expect(spu.images).toBeInstanceOf(Array);
    expect(spu.tags).toBeInstanceOf(Array);
  });

  it('应该生成指定数量的SPU', () => {
    const count = 10;
    const spus = spuGenerator.generateBatchSPU(count);

    expect(spus).toHaveLength(count);
    spus.forEach(spu => {
      expect(spu).toHaveProperty('id');
      expect(spu).toHaveProperty('name');
      expect(spu.code).toMatch(/^SPU\d+$/);
    });
  });

  it('应该支持场景生成', () => {
    const normalSPUs = spuGenerator.generateScenario('normal');
    const lowStockSPUs = spuGenerator.generateScenario('lowStock');
    const newProductSPUs = spuGenerator.generateScenario('newProducts');
    const inactiveSPUs = spuGenerator.generateScenario('inactive');

    expect(normalSPUs.length).toBeGreaterThan(0);
    expect(lowStockSPUs.every(spu => spu.stockInfo.availableStock <= 10)).toBe(true);
    expect(newProductSPUs.every(spu => spu.tags.includes('新品'))).toBe(true);
    expect(inactiveSPUs.every(spu => spu.status === SPUStatus.INACTIVE)).toBe(true);
  });

  it('应该支持指定分类生成', () => {
    const categoryId = 'CAT_101';
    const spus = spuGenerator.generateBatchSPU(5, categoryId);

    expect(spus).toHaveLength(5);
    spus.forEach(spu => {
      expect(spu.categoryId).toBe(categoryId);
    });
  });

  it('应该生成影院相关的商品名称', () => {
    const spu = spuGenerator.generateSingleSPU();

    // 验证商品名称包含影院相关关键词
    const cinemaKeywords = ['爆米花', '可乐', '电影票', '会员卡', '周边', '体验'];
    const hasCinemaKeyword = cinemaKeywords.some(keyword =>
      spu.name.includes(keyword)
    );

    expect(hasCinemaKeyword).toBe(true);
  });

  it('应该生成有效的价格范围', () => {
    const spu = spuGenerator.generateSingleSPU();

    expect(spu.priceInfo.minPrice).toBeGreaterThanOrEqual(0);
    expect(spu.priceInfo.maxPrice).toBeGreaterThanOrEqual(spu.priceInfo.minPrice);
    expect(spu.priceInfo.avgPrice).toBeGreaterThanOrEqual(spu.priceInfo.minPrice);
    expect(spu.priceInfo.avgPrice).toBeLessThanOrEqual(spu.priceInfo.maxPrice);
    expect(spu.priceInfo.currency).toBe('CNY');
  });

  it('应该生成有效的库存数据', () => {
    const spu = spuGenerator.generateSingleSPU();

    expect(spu.stockInfo.totalStock).toBeGreaterThanOrEqual(0);
    expect(spu.stockInfo.availableStock).toBeGreaterThanOrEqual(0);
    expect(spu.stockInfo.reservedStock).toBeGreaterThanOrEqual(0);
    expect(spu.stockInfo.totalStock).toBe(
      spu.stockInfo.availableStock + spu.stockInfo.reservedStock
    );
  });

  it('应该支持数据清理', () => {
    // 生成一些数据
    spuGenerator.generateBatchSPU(10);
    expect(spuGenerator.getGeneratedData()).toHaveLength(10);

    // 清理数据
    spuGenerator.clearData();
    expect(spuGenerator.getGeneratedData()).toHaveLength(0);
  });
});
```

## 开发和运行

### 1. 启动开发服务器

```bash
# 安装依赖
npm install

# 安装 MSW Service Worker（如果还没有安装）
npx msw init public --save

# 启动开发服务器
npm run dev
```

### 2. Mock 数据配置

在开发环境中，Mock 服务会自动启动。你可以在浏览器控制台看到相关信息：

```javascript
// 在浏览器控制台中验证 Mock 服务是否正常工作
// 尝试访问 API 接口
fetch('/api/spu/list?page=1&pageSize=10')
  .then(res => res.json())
  .then(data => console.log(data));
```

### 3. 环境变量配置

```typescript
// .env.development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_MOCK_ENABLED=true
VITE_APP_TITLE=SPU管理系统 - 开发环境

// .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_MOCK_ENABLED=false
VITE_APP_TITLE=SPU管理系统
```

### 4. 构建和部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 常见问题

### Q1: MSW 在生产环境不工作？
**A**: MSW 主要用于开发和测试环境。在生产环境中，应该配置真实的 API 服务。可以通过环境变量控制是否启用 Mock：

```typescript
// src/main.tsx
if (import.meta.env.VITE_MOCK_ENABLED === 'true') {
  startMockService();
}
```

### Q2: Mock 数据不够真实？
**A**: 使用 `@faker-js/faker` 生成更真实的数据，并根据实际业务场景调整数据模板。可以添加影院特定的商品名称、价格范围和库存模式。

### Q3: 如何模拟网络错误？
**A**: 在 Mock 处理器中模拟不同的 HTTP 状态码和错误响应：

```typescript
// 模拟网络错误
rest.get('/api/spu/list', (req, res, ctx) => {
  if (Math.random() < 0.1) { // 10% 错误率
    return res(
      ctx.delay(1000),
      ctx.status(500),
      ctx.json({
        success: false,
        message: '服务器内部错误'
      })
    );
  }
  // 正常响应...
});
```

### Q4: 大数据量渲染性能问题？
**A**: 使用以下策略优化性能：
- 分页加载
- 虚拟滚动（可以使用 `react-window`）
- 懒加载
- 数据缓存
- 防抖搜索

```typescript
// 使用 useDebounce Hook 优化搜索
const handleSearch = useDebounce((keyword: string) => {
  setFilters({ keyword });
}, 300);
```

### Q5: 如何处理 Mock 数据的持久化？
**A**: 可以使用 `localStorage` 来持久化 Mock 数据：

```typescript
// 在 spuGenerator 中添加持久化方法
saveToStorage() {
  localStorage.setItem('mockSPUData', JSON.stringify(this.getGeneratedData()));
}

loadFromStorage() {
  const data = localStorage.getItem('mockSPUData');
  if (data) {
    const spus = JSON.parse(data);
    spus.forEach((spu: SPUItem) => {
      this.generatedData.set(spu.id, spu);
    });
  }
}
```

## 最佳实践

### 1. 代码组织
- 按功能模块组织代码结构
- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 规范
- 编写单元测试和集成测试

### 2. 性能优化
- 使用 React.memo 和 useMemo 优化组件渲染
- 合理使用 React Query 的缓存机制
- 实现虚拟滚动处理大数据量
- 使用代码分割减少初始加载时间

### 3. 用户体验
- 提供加载状态和错误处理
- 实现乐观更新提升响应速度
- 使用防抖优化搜索体验
- 支持键盘快捷键操作

### 4. Mock 数据管理
- 保持 Mock 数据的真实性和多样性
- 实现数据持久化避免重复生成
- 支持不同业务场景的数据模拟
- 定期更新数据模板保持新鲜度

---

**文档版本**: v1.0（基于当前技术栈）
**创建日期**: 2025-12-12
**维护者**: Frontend Development Team
**技术栈**: React 19.2.0 + TypeScript 5.9.3 + Vite 7.2.4 + Ant Design 6.1.0 + Zustand 5.0.9 + TanStack Query 5.90.12 + MSW