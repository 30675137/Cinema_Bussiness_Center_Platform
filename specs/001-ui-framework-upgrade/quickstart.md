# 快速开始指南：UI框架统一升级

**创建日期**: 2025-12-10
**版本**: 1.0.0

## 概述

本指南将帮助您快速上手UI框架统一升级功能，了解如何使用新的技术栈和组件库进行开发。

## 前置要求

- Node.js 18.0+
- npm 或 yarn 包管理器
- 基础的 React 和 TypeScript 知识
- 熟悉 Ant Design 和 Tailwind CSS

## 技术栈

```json
{
  "core": "React 18 + TypeScript 5.0",
  "ui": "Ant Design 5.x + Tailwind CSS 3.x",
  "state": "Zustand + TanStack Query",
  "routing": "React Router 6",
  "build": "Vite 6.x",
  "testing": "Playwright"
}
```

## 项目结构

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ui/              # 基础UI组件
│   │   │   ├── DataTable/
│   │   │   ├── FormField/
│   │   │   ├── Card/
│   │   │   └── index.ts
│   │   ├── layout/          # 布局组件
│   │   │   ├── AppLayout/
│   │   │   ├── Sidebar/
│   │   │   ├── Header/
│   │   │   └── Breadcrumb/
│   │   └── business/        # 业务组件
│   │       ├── ProductCard/
│   │       ├── UserAvatar/
│   │       └── StatusBadge/
│   ├── hooks/
│   │   ├── api/            # API相关Hooks
│   │   ├── stores/         # Zustand Store Hooks
│   │   └── index.ts
│   ├── stores/
│   │   ├── appStore.ts     # 应用状态
│   │   ├── productStore.ts # 产品状态
│   │   └── index.ts
│   ├── services/
│   │   ├── api.ts          # API客户端配置
│   │   ├── mockApi.ts      # Mock API服务
│   │   └── types.ts        # API类型定义
│   ├── mock/
│   │   └── data/           # Mock数据文件
│   ├── types/
│   │   ├── product.ts      # 产品类型
│   │   ├── user.ts         # 用户类型
│   │   └── index.ts
│   ├── styles/
│   │   ├── globals.css     # 全局样式
│   │   ├── antd-overrides.css # Ant Design覆盖
│   │   └── tailwind.css    # Tailwind配置
│   ├── utils/
│   │   ├── cn.ts           # 类名合并工具
│   │   ├── format.ts       # 格式化工具
│   │   └── constants.ts    # 常量定义
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── Products/
│   │   └── Users/
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## 安装和配置

### 1. 依赖安装

```bash
# 核心依赖
npm install react@^19.2.0 react-dom@^19.2.0
npm install antd@^5.x.x @ant-design/icons@^5.x.x
npm install tailwindcss@^3.x.x
npm install zustand@^4.x.x @tanstack/react-query@^5.x.x
npm install react-router-dom@^6.x.x

# 开发依赖
npm install -D typescript@^5.0.0
npm install -D @types/react@^19.0.0 @types/react-dom@^19.0.0
npm install -D @vitejs/plugin-react@^5.x.x
npm install -D vite@^6.x.x
npm install -D autoprefixer@^10.x.x postcss@^8.x.x
```

### 2. Tailwind CSS 配置

**tailwind.config.js**:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // Ant Design 主题同步
        antPrimary: '#1890ff',
        antSuccess: '#52c41a',
        antWarning: '#faad14',
        antError: '#ff4d4f',
      },
      screens: {
        xs: '480px',
        sm: '576px',
        md: '768px',
        lg: '992px',
        xl: '1200px',
        xxl: '1600px',
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true, // 保留 Tailwind 的基础样式重置
  }
}
```

**postcss.config.js**:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 3. Vite 配置

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
```

### 4. TypeScript 配置

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 5. 全局样式设置

**src/styles/globals.css**:
```css
@tailwind base;
@layer antd {
  /* Ant Design 样式层级 */
}
@tailwind components;
@tailwind utilities;

/* 统一的颜色系统 */
:root {
  --color-primary: theme('colors.primary.500');
  --color-success: theme('colors.antSuccess');
  --color-warning: theme('colors.antWarning');
  --color-error: theme('colors.antError');
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
```

## 核心组件使用

### 1. 数据表格组件

```tsx
import { DataTable } from '@/components/ui/DataTable';
import type { Product } from '@/types/product';

const ProductTable = () => {
  const columns: ColumnType<Product>[] = [
    {
      key: 'name',
      title: '产品名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      key: 'category',
      title: '分类',
      dataIndex: 'category',
      width: 120,
      render: (category) => (
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
          {category}
        </span>
      ),
    },
    {
      key: 'price',
      title: '价格',
      dataIndex: 'price',
      width: 100,
      render: (price) => `¥${price.toFixed(2)}`,
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => (
        <span className={`px-2 py-1 text-xs rounded ${
          status === 'active'
            ? 'bg-green-100 text-green-800'
            : status === 'pending'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {status === 'active' ? '已发布' : status === 'pending' ? '待审核' : '已下架'}
        </span>
      ),
    },
  ];

  const { data: products, isLoading } = useProducts();

  return (
    <DataTable
      data={products || []}
      columns={columns}
      loading={isLoading}
      onRowSelect={(selectedRows) => console.log('选中行:', selectedRows)}
    />
  );
};
```

### 2. 表单组件

```tsx
import { FormField } from '@/components/ui/FormField';
import { Button } from 'antd';

const ProductForm = () => {
  const [form] = Form.useForm();

  const fields: FormField[] = [
    {
      name: 'name',
      label: '产品名称',
      type: 'input',
      required: true,
      placeholder: '请输入产品名称',
      rules: [
        { required: true, message: '产品名称不能为空' },
        { min: 2, max: 100, message: '产品名称长度在2-100字符之间' }
      ],
    },
    {
      name: 'category',
      label: '产品分类',
      type: 'select',
      required: true,
      options: [
        { label: '设备用品', value: 'equipments' },
        { label: '食品饮料', value: 'food' },
        { label: '票务服务', value: 'tickets' },
      ],
    },
    {
      name: 'price',
      label: '价格',
      type: 'number',
      required: true,
      placeholder: '请输入产品价格',
      rules: [
        { required: true, message: '价格不能为空' },
        { min: 0, message: '价格不能为负数' }
      ],
    },
    {
      name: 'description',
      label: '产品描述',
      type: 'textarea',
      placeholder: '请输入产品描述',
    },
  ];

  const handleSubmit = (values: any) => {
    console.log('表单提交:', values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm"
    >
      {fields.map((field) => (
        <FormField key={field.name} {...field} />
      ))}

      <div className="flex justify-end space-x-2 mt-6">
        <Button>取消</Button>
        <Button type="primary" htmlType="submit">
          保存
        </Button>
      </div>
    </Form>
  );
};
```

### 3. 布局组件

```tsx
import { AppLayout } from '@/components/layout/AppLayout';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Breadcrumb } from '@/components/layout/Breadcrumb';

const Dashboard = () => {
  const breadcrumbItems = [
    { title: '首页', path: '/' },
    { title: '仪表板' },
  ];

  return (
    <AppLayout
      sidebar={<Sidebar />}
      header={<Header title="影院商品管理中台" />}
      breadcrumb={<Breadcrumb items={breadcrumbItems} />}
    >
      <div className="p-6">
        {/* 页面内容 */}
      </div>
    </AppLayout>
  );
};
```

## 状态管理使用

### 1. Zustand Store

```tsx
// stores/appStore.ts
import { create } from 'zustand';

interface AppState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  currentPath: string;
  globalLoading: boolean;
}

interface AppActions {
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setCurrentPath: (path: string) => void;
  setGlobalLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState & AppActions>((set) => ({
  sidebarCollapsed: false,
  theme: 'light',
  currentPath: '/',
  globalLoading: false,

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setTheme: (theme) => set({ theme }),
  setCurrentPath: (path) => set({ currentPath: path }),
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}));
```

### 2. TanStack Query

```tsx
// hooks/api/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/services/api';
import type { Product } from '@/types/product';

export const useProducts = (params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  category?: string;
}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: () => {
      // 刷新产品列表
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // 显示成功消息
      message.success('产品创建成功');
    },
    onError: (error) => {
      message.error('产品创建失败');
    },
  });
};
```

## Mock数据使用

### 1. Mock数据文件

**mock/data/products/product-list.json**:
```json
[
  {
    "id": "prod-001",
    "name": "3D眼镜标准版",
    "description": "影院专用3D眼镜，舒适佩戴，高清体验",
    "category": "equipments",
    "price": 15.00,
    "status": "active",
    "imageUrl": "/images/products/3d-glasses.jpg",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-12-10T08:20:00Z",
    "inventory": 500,
    "tags": ["3D", "眼镜", "标准"]
  }
]
```

### 2. Mock API服务

```tsx
// services/mockApi.ts
import productData from '@/mock/data/products/product-list.json';
import categoryData from '@/mock/data/products/product-categories.json';

export const mockApi = {
  // 产品相关
  getProducts: async (params?: any) => {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    let data = [...productData];

    // 搜索筛选
    if (params?.keyword) {
      data = data.filter(product =>
        product.name.includes(params.keyword) ||
        product.description.includes(params.keyword)
      );
    }

    // 分类筛选
    if (params?.category) {
      data = data.filter(product => product.category === params.category);
    }

    // 分页处理
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      data: data.slice(start, end),
      pagination: {
        current: page,
        pageSize,
        total: data.length,
      },
    };
  },

  createProduct: async (productData: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newProduct = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newProduct;
  },

  // 分类相关
  getCategories: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return categoryData;
  },
};
```

## 开发工具和插件

### 1. VS Code 推荐插件

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### 2. Prettier 配置

**.prettierrc**:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## 测试

### 1. 单元测试示例

```tsx
// __tests__/components/DataTable.test.tsx
import { render, screen } from '@testing-library/react';
import { DataTable } from '@/components/ui/DataTable';

const mockData = [
  { id: '1', name: '测试产品', price: 10.0 },
];

const mockColumns = [
  { key: 'name', title: '名称', dataIndex: 'name' },
  { key: 'price', title: '价格', dataIndex: 'price' },
];

describe('DataTable', () => {
  it('renders table with data', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
      />
    );

    expect(screen.getByText('测试产品')).toBeInTheDocument();
    expect(screen.getByText('10.00')).toBeInTheDocument();
  });
});
```

### 2. E2E 测试示例

```typescript
// tests/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('dashboard page loads correctly', async ({ page }) => {
  await page.goto('/');

  // 检查页面标题
  await expect(page).toHaveTitle(/影院商品管理中台/);

  // 检查侧边栏
  await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

  // 检查仪表板统计
  await expect(page.locator('[data-testid="stats-total-products"]')).toBeVisible();
});
```

## 部署

### 1. 构建命令

```bash
# 开发环境
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

### 2. 环境变量配置

**.env.development**:
```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_MOCK_API=true
```

**.env.production**:
```env
VITE_API_BASE_URL=https://api.cinema-platform.com/v1
VITE_MOCK_API=false
```

## 常见问题

### 1. Tailwind CSS 类不生效

**问题**: Tailwind utility classes 没有被正确应用。

**解决方案**:
- 检查 `tailwind.config.js` 中的 `content` 配置是否正确
- 确保 `globals.css` 中正确引入了 `@tailwind` 指令
- 检查 PostCSS 配置是否正确

### 2. Ant Design 主题定制

**解决方案**:
```tsx
import { ConfigProvider, theme } from 'antd';

const App = () => {
  const { token } = theme.useToken();

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#3b82f6', // Tailwind blue-500
          borderRadius: 6,
          colorBgContainer: '#ffffff',
        },
      }}
    >
      {/* 应用内容 */}
    </ConfigProvider>
  );
};
```

### 3. Zustand 状态不更新

**解决方案**:
- 确保使用正确的选择器
- 避免在组件中使用过时的状态
- 使用 `shallow` 比较来优化性能

```tsx
// ❌ 错误：每次都会触发重渲染
const state = useAppStore();

// ✅ 正确：只选择需要的状态
const sidebarCollapsed = useAppStore(state => state.sidebarCollapsed);
const setSidebarCollapsed = useAppStore(state => state.setSidebarCollapsed);

// ✅ 正确：选择多个状态
const { sidebarCollapsed, theme } = useAppStore(
  state => ({ sidebarCollapsed: state.sidebarCollapsed, theme: state.theme }),
  shallow
);
```

## 下一步

1. **阅读详细文档**: 查看 `data-model.md` 了解完整的数据结构
2. **查看API规范**: 参考 `contracts/api.yaml` 了解接口定义
3. **学习最佳实践**: 阅读 `research.md` 了解技术选型原因
4. **开始开发**: 参考项目结构开始您的组件开发

## 获取帮助

如果您在开发过程中遇到问题，可以：

1. 查看项目的 GitHub Issues
2. 阅读相关技术文档
3. 联系开发团队获取支持

---

**Happy Coding! 🚀**