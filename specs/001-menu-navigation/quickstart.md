# 快速开始指南：影院商品管理中台功能导航系统

**分支**: `001-menu-navigation` | **日期**: 2025-12-11 | **版本**: 1.0

## 概述

本文档提供影院商品管理中台导航系统的快速入门指南，包括环境设置、开发流程、测试方法和部署指南。基于React 18 + TypeScript 5.0 + Ant Design 6.x + Tailwind CSS 4技术栈，支持Mock用户数据和LocalStorage用户偏好存储。

## 技术栈概览

### 核心技术

```typescript
{
  "frontend": {
    "framework": "React 18.2.0",
    "language": "TypeScript 5.0",
    "ui": "Ant Design 6.1.0",
    "styling": "Tailwind CSS 4.1.17",
    "routing": "React Router 6.8.0",
    "stateManagement": {
      "client": "Zustand 4.3.0",
      "server": "TanStack Query 4.2.0"
    },
    "testing": {
      "unit": "Vitest 0.28.0",
      "e2e": "Playwright 1.30.0"
    }
  },
  "dataStorage": {
    "mockData": "静态JSON文件",
    "userPreferences": "浏览器LocalStorage"
  }
}
```

### 前置要求

```bash
# Node.js版本要求
node --version  # >= 18.0.0
npm --version   # >= 8.0.0

# 或使用yarn
yarn --version # >= 1.22.0
```

## 项目结构

```text
frontend/Cinema_Operation_Admin/
├── src/
│   ├── components/
│   │   ├── layout/           # 布局组件
│   │   │   ├── AppLayout/
│   │   │   ├── Sidebar/
│   │   │   ├── Header/
│   │   │   └── Breadcrumb/
│   │   ├── pages/           # 页面组件
│   │   │   ├── Dashboard/
│   │   │   ├── product/
│   │   │   ├── inventory/
│   │   │   ├── pricing/
│   │   │   └── review/
│   │   └── common/          # 通用组件
│   ├── pages/               # 路由页面
│   ├── services/            # 服务层
│   │   ├── api/             # API客户端
│   │   └── mock/            # Mock数据
│   ├── stores/              # Zustand状态管理
│   ├── hooks/               # 自定义Hooks
│   ├── types/               # TypeScript类型定义
│   ├── utils/               # 工具函数
│   └── styles/              # 样式文件
├── tests/                   # 测试文件
├── public/mock-data/        # Mock数据JSON
└── docs/                    # 项目文档
```

## 核心概念

### 1. Mock用户系统

系统使用简化的Mock用户数据，替代传统的登录认证系统：

```typescript
// 默认Mock用户数据
const defaultMockUser: MockUser = {
  id: 'user-001',
  username: 'admin',
  displayName: '系统管理员',
  role: 'admin',
  department: '信息部',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-12-11T00:00:00.000Z'
};
```

### 2. 导航菜单结构

10个一级菜单及对应二级子功能：

```typescript
const menuStructure = [
  {
    id: 'menu-001',
    name: '基础设置与主数据',
    icon: 'SettingOutlined',
    children: [
      '组织/门店/仓库管理',
      '单位 & 换算规则管理',
      '字典与规则配置',
      '角色与权限管理',
      '审批流配置'
    ]
  },
  // ... 更多菜单结构
];
```

### 3. 状态管理架构

```typescript
// Zustand状态管理结构
interface NavigationStore {
  // 导航状态
  menus: MenuItem[];
  activeMenuId: string | null;
  expandedMenuIds: string[];
  sidebarCollapsed: boolean;

  // 用户偏好（持久化到LocalStorage）
  favoriteMenuIds: string[];
  recentMenuIds: string[];
  searchHistory: string[];

  // 操作方法
  setActiveMenu: (menuId: string) => void;
  toggleSidebar: () => void;
  addToFavorites: (menuId: string) => void;
  searchMenus: (query: string) => MenuItem[];
}
```

## 环境设置

### 安装依赖

```bash
# 进入项目目录
cd frontend/Cinema_Operation_Admin

# 安装依赖
npm install

# 或使用yarn
yarn install
```

### 开发环境启动

```bash
# 启动开发服务器
npm run dev

# 或使用yarn
yarn dev

# 应用将在以下地址启动
# Local:   http://localhost:5173
# Network: http://192.168.x.x:5173
```

## 开发流程

### 1. 创建新页面组件

```typescript
// src/pages/NewFeature/index.tsx
import React from 'react';
import { Card } from 'antd';

const NewFeature: React.FC = () => {
  return (
    <Card title="新功能" bordered={false}>
      {/* 页面内容 */}
    </Card>
  );
};

export default NewFeature;
```

### 2. 添加路由配置

```typescript
// src/router/index.tsx
import NewFeature from '@/pages/NewFeature';

const routes = [
  // ... 其他路由
  {
    path: '/new-feature',
    element: <NewFeature />,
    meta: {
      title: '新功能',
      requireAuth: true
    }
  }
];
```

### 3. 更新菜单配置

```typescript
// src/config/menu.ts
export const menuConfig: MenuItem[] = [
  // ... 其他菜单
  {
    id: 'menu-new',
    name: '新功能模块',
    icon: 'NewOutlined',
    path: '/new-feature',
    level: 1,
    order: 11,
    enabled: true,
    hidden: false
  }
];
```

### 4. 状态管理模式

```typescript
// src/stores/useNavigationStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigationStore {
  // 状态定义
  activeMenuId: string | null;

  // 操作方法
  setActiveMenu: (menuId: string) => void;
}

export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set) => ({
      activeMenuId: null,
      setActiveMenu: (menuId: string) => set({ activeMenuId: menuId }),
    }),
    {
      name: 'navigation-preferences',
      storage: {
        getItem: (name) => localStorage.getItem(name),
        setItem: (name, value) => localStorage.setItem(name, value),
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
```

## 测试指南

### 单元测试

```bash
# 运行单元测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式运行测试
npm run test:watch
```

### E2E测试

```bash
# 安装Playwright浏览器
npx playwright install

# 运行E2E测试
npm run test:e2e

# 运行E2E测试（ headed模式）
npm run test:e2e:headed

# 生成测试报告
npm run test:e2e:report
```

### 测试用例示例

```typescript
// tests/unit/components/Sidebar.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '@/components/layout/Sidebar';

describe('Sidebar Component', () => {
  test('renders all menu items', () => {
    render(<Sidebar />);
    expect(screen.getByText('基础设置与主数据')).toBeInTheDocument();
    expect(screen.getByText('商品管理')).toBeInTheDocument();
  });

  test('toggles sidebar collapse state', () => {
    render(<Sidebar />);
    const toggleButton = screen.getByLabelText('收起侧边栏');
    fireEvent.click(toggleButton);
    // 验证侧边栏收起状态
  });
});
```

## 构建与部署

### 开发构建

```bash
# 开发环境构建
npm run build:dev

# 预览开发构建结果
npm run preview:dev
```

### 生产构建

```bash
# 生产环境构建
npm run build

# 预览生产构建结果
npm run preview
```

### 构建优化

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          utils: ['lodash', 'dayjs'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

## 部署清单

### 预部署检查

```bash
# 1. 代码质量检查
npm run lint
npm run type-check

# 2. 测试通过
npm run test
npm run test:e2e

# 3. 构建成功
npm run build

# 4. 构建产物检查
ls -la dist/
```

### 环境变量配置

```bash
# .env.production
VITE_APP_TITLE=影院商品管理中台
VITE_API_BASE_URL=https://api.cinema-platform.com
VITE_ENABLE_MOCK=false
VITE_APP_VERSION=1.0.0
```

## 故障排除

### 常见问题

1. **依赖安装失败**
   ```bash
   # 清除缓存重新安装
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **TypeScript类型错误**
   ```bash
   # 重新生成类型声明
   npm run type-check

   # 严格模式检查
   npm run type-check:strict
   ```

3. **样式不生效**
   ```bash
   # 检查Tailwind CSS配置
   npx tailwindcss --help

   # 重新构建样式
   npm run build:css
   ```

4. **Mock数据加载失败**
   ```bash
   # 检查Mock数据文件路径
   ls public/mock-data/

   # 验证JSON格式
   npx jsonlint public/mock-data/menu.json
   ```

### 调试技巧

```typescript
// React Developer Tools
// 安装浏览器扩展：React Developer Tools

// Zustand状态调试
import { useNavigationStore } from '@/stores/useNavigationStore';

// 在组件中添加调试信息
const DebugInfo: React.FC = () => {
  const state = useNavigationStore();

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, background: 'white', padding: 10 }}>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
};

// TanStack Query调试
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 开启查询日志
      staleTime: 1000 * 60 * 5, // 5分钟
      cacheTime: 1000 * 60 * 10, // 10分钟
    },
  },
});
```

## 性能优化

### 代码分割

```typescript
// 路由级别懒加载
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const ProductManagement = lazy(() => import('@/pages/product/Management'));

// 使用Suspense包装
<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/product/*" element={<ProductManagement />} />
  </Routes>
</Suspense>
```

### 缓存策略

```typescript
// TanStack Query配置
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5分钟内数据新鲜
      cacheTime: 1000 * 60 * 10, // 10分钟缓存
      retry: 3, // 失败重试3次
      refetchOnWindowFocus: false, // 窗口聚焦时不重新获取
    },
  },
});
```

## 团队协作

### Git工作流

```bash
# 1. 创建功能分支
git checkout -b feature/navigation-system

# 2. 提交代码
git add .
git commit -m "feat: 实现导航系统基础功能"

# 3. 推送分支
git push origin feature/navigation-system

# 4. 创建Pull Request
# 在GitHub/GitLab中创建PR，请求代码审查
```

### 代码规范

```typescript
// ESLint配置
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
  },
};
```

## 技术支持

### 文档资源

- [React 18官方文档](https://react.dev/)
- [TypeScript 5.0文档](https://www.typescriptlang.org/docs/)
- [Ant Design 6.x组件库](https://ant.design/components/overview/)
- [Tailwind CSS 4文档](https://tailwindcss.com/docs)
- [Zustand状态管理](https://github.com/pmndrs/zustand)
- [TanStack Query文档](https://tanstack.com/query/latest)

### 社区支持

- GitHub Issues: [项目Issues页面]
- 技术交流: [团队内部技术群]
- 文档反馈: [文档仓库链接]

---

**快速开始完成！** 🎉

现在您可以开始使用影院商品管理中台导航系统进行开发。如需更多帮助，请参考项目文档或联系开发团队。