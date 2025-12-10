# 管理后台基础框架 - 快速开始指南

**项目**: 耀莱影城商品管理中台
**功能**: 管理后台基础框架
**日期**: 2025-12-10

## 项目概述

管理后台基础框架为耀莱影城商品管理中台提供统一的后台布局系统，包含左侧导航菜单、顶部面包屑导航和主内容区域。本框架支持商品管理、定价中心、审核管理、库存追溯等核心功能模块。

## 技术栈

- **前端框架**: React 18.2.0 + TypeScript 5.0
- **UI组件库**: Ant Design 6.1.0
- **CSS框架**: Tailwind CSS 4.1.17
- **路由管理**: React Router 6
- **状态管理**: Zustand + TanStack Query
- **构建工具**: Vite 6.0.7
- **测试框架**: Playwright

## 快速开始

### 1. 环境准备

确保已安装以下环境：
- Node.js 18+
- npm 或 yarn

### 2. 项目安装

```bash
# 克隆项目
git clone <repository-url>
cd Cinema_Bussiness_Center_Platform

# 安装依赖
npm install

# 或使用yarn
yarn install
```

### 3. 启动开发服务器

```bash
# 启动开发服务器
npm run dev

# 或使用yarn
yarn dev
```

访问 http://localhost:3000 查看应用

### 4. 运行测试

```bash
# 运行单元测试
npm run test

# 运行E2E测试
npm run test:e2e
```

## 项目结构

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/           # 布局组件
│   │   │   ├── AppLayout/    # 主布局组件
│   │   │   ├── Sidebar/      # 侧边栏组件
│   │   │   └── Breadcrumb/   # 面包屑组件
│   │   └── common/           # 通用组件
│   ├── pages/                # 页面组件
│   │   ├── Dashboard/        # 仪表盘
│   │   ├── product/          # 商品管理
│   │   ├── pricing/          # 定价中心
│   │   ├── review/           # 审核管理
│   │   └── inventory/        # 库存追溯
│   ├── hooks/                # 自定义Hooks
│   ├── stores/               # 状态管理
│   ├── types/                # TypeScript类型定义
│   ├── utils/                # 工具函数
│   ├── styles/               # 样式文件
│   └── App.tsx               # 应用入口
├── public/                   # 静态资源
├── tests/                    # 测试文件
│   ├── e2e/                  # E2E测试
│   └── __snapshots__/        # 测试快照
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 核心功能

### 1. 统一布局框架

所有页面都在统一的布局壳下渲染，确保一致的用户体验。

```tsx
// AppLayout组件使用示例
import AppLayout from '@/components/layout/AppLayout';

function App() {
  return (
    <AppLayout>
      <Router>
        {/* 路由配置 */}
      </Router>
    </AppLayout>
  );
}
```

### 2. 左侧导航菜单

支持多级菜单、图标显示、高亮当前页面、展开/收起功能。

```tsx
// 菜单配置示例
const menuConfig = [
  {
    id: 'dashboard',
    title: '仪表盘',
    icon: 'DashboardOutlined',
    path: '/dashboard'
  },
  {
    id: 'product',
    title: '商品管理',
    icon: 'ShopOutlined',
    path: '/product',
    children: [
      {
        id: 'product-list',
        title: '商品列表',
        icon: 'UnorderedListOutlined',
        path: '/product/list'
      }
    ]
  }
];
```

### 3. 面包屑导航

根据当前路由自动生成面包屑，支持点击导航。

```tsx
// 面包屑使用示例
import Breadcrumb from '@/components/layout/Breadcrumb';

function PageHeader() {
  return <Breadcrumb />;
}
```

### 4. 响应式布局

支持不同屏幕尺寸的自动适配。

```css
/* Tailwind CSS响应式断点 */
/* sm: 640px+, md: 768px+, lg: 1024px+, xl: 1280px+ */
```

## 开发指南

### 1. 添加新页面

1. 在 `src/pages/` 下创建页面组件
2. 在路由配置中添加路由规则
3. 在菜单配置中添加菜单项
4. 如需面包屑，配置路由元数据

```tsx
// 新建页面示例
// src/pages/NewFeature/index.tsx
import React from 'react';

const NewFeature: React.FC = () => {
  return (
    <div className="p-6">
      <h1>新功能页面</h1>
      {/* 页面内容 */}
    </div>
  );
};

export default NewFeature;
```

### 2. 添加菜单项

```tsx
// 在菜单配置中添加
{
  id: 'new-feature',
  title: '新功能',
  icon: 'StarOutlined',
  path: '/new-feature',
  visible: true,
  order: 5
}
```

### 3. Mock数据使用

项目中所有数据都来自前端mock，无需后端支持。

```tsx
// 使用mock数据示例
import { useMockData } from '@/hooks/useMockData';

const ProductList: React.FC = () => {
  const { data: products, loading, error } = useMockData('products');

  if (loading) return <div>加载中...</div>;
  if (error) return <div>加载失败</div>;

  return (
    <Table dataSource={products}>
      {/* 表格列定义 */}
    </Table>
  );
};
```

### 4. 状态管理

使用Zustand进行状态管理：

```tsx
// 创建store示例
import { create } from 'zustand';

interface LayoutStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const useLayoutStore = create<LayoutStore>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({
    sidebarCollapsed: !state.sidebarCollapsed
  }))
}));
```

## Mock数据说明

### 数据结构

- **菜单数据**: `mock/menu.json`
- **路由数据**: `mock/routes.json`
- **业务数据**: `mock/business/`

### Mock API

项目使用Mock Service Worker (MSW)模拟API调用：

```tsx
// mock/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/mock/menu/list', (req, res, ctx) => {
    return res(
      ctx.json({
        code: 200,
        message: 'success',
        data: menuData
      })
    );
  })
];
```

## 测试

### 1. 单元测试

```bash
# 运行所有测试
npm run test

# 运行特定测试文件
npm run test AppLayout.test.tsx

# 生成覆盖率报告
npm run test:coverage
```

### 2. E2E测试

```bash
# 运行E2E测试
npm run test:e2e

# 运行特定测试文件
npx playwright test layout.spec.ts

# 调试模式
npx playwright test --debug
```

### 3. 测试示例

```tsx
// AppLayout.test.tsx
import { render, screen } from '@testing-library/react';
import AppLayout from '../AppLayout';

test('renders layout components', () => {
  render(<AppLayout />);

  expect(screen.getByRole('navigation')).toBeInTheDocument();
  expect(screen.getByRole('main')).toBeInTheDocument();
});
```

## 部署

### 1. 构建生产版本

```bash
npm run build
```

### 2. 预览生产版本

```bash
npm run preview
```

### 3. 部署到静态服务器

构建产物在 `dist/` 目录，可以部署到任何静态文件服务器。

## 常见问题

### 1. 样式问题

**Q**: Tailwind CSS类不生效？
**A**: 确保在 `tailwind.config.js` 中配置了正确的内容路径。

### 2. 路由问题

**Q**: 页面刷新后404？
**A**: 需要配置服务器支持SPA路由重定向。

### 3. Mock数据问题

**Q**: Mock数据不显示？
**A**: 检查mock文件路径和数据格式是否正确。

## 开发规范

### 1. 代码规范

- 使用TypeScript严格模式
- 遵循ESLint和Prettier配置
- 组件使用PascalCase命名
- 文件使用camelCase命名

### 2. 提交规范

```bash
# 提交格式
git commit -m "feat: 添加新功能"
git commit -m "fix: 修复bug"
git commit -m "docs: 更新文档"
```

### 3. 组件开发规范

- 使用函数式组件 + Hooks
- 组件props要有明确的类型定义
- 合理拆分组件，保持单一职责
- 使用Ant Design组件保持设计一致性

## 扩展指南

### 1. 权限控制

当前版本保留了权限字段结构，但未实现权限逻辑。未来可以通过以下方式扩展：

```tsx
// 权限Hook示例
const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission: string) => {
    return user.permissions.includes(permission);
  };

  return { hasPermission };
};
```

### 2. 国际化

当前版本仅支持中文，国际化扩展预留了相关接口：

```tsx
// 国际化配置示例
const i18nConfig = {
  locale: 'zh-CN',
  messages: {
    'menu.dashboard': '仪表盘',
    'menu.product': '商品管理'
  }
};
```

## 技术支持

如遇到问题，请参考：

1. 项目文档：`docs/`
2. API文档：`docs/api/`
3. 组件文档：`docs/components/`
4. 提交Issue：GitHub Issues

---

**注意**: 本项目为Demo版本，专注于前端UI展示，使用Mock数据，不涉及后端集成和生产部署。