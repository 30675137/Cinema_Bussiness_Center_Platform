# 快速上手指南：菜单面板功能

**规格**: `specs/D001-menu-panel/spec.md` | **分支**: `D001-menu-panel`

---

## 一、功能概述

本功能将现有的 Dashboard 统计页面替换为模块化菜单面板，展示 12 个业务模块卡片，用户可快速访问各个功能模块。

**核心特性**：
- 📦 卡片式布局展示 12 个业务模块
- 🎯 一键跳转到具体功能页面
- 📱 响应式设计，支持多种屏幕尺寸
- 🔐 根据用户权限自动过滤模块显示
- ⚡ 悬停效果和流畅交互体验

---

## 二、开发前准备

### 2.1 环境要求

```bash
Node.js: >= 18.0.0
npm: >= 9.0.0
```

### 2.2 技术栈版本

- React: 19.2.0
- TypeScript: 5.9.3
- Ant Design: 6.1.0
- React Router: 7.10.1
- Zustand: 5.0.9

### 2.3 切换到功能分支

```bash
# 切换到菜单面板功能分支
git checkout D001-menu-panel

# 确认分支正确
git branch
```

### 2.4 安装依赖

```bash
cd frontend
npm install
```

---

## 三、核心文件说明

### 3.1 新增文件（需创建）

| 文件路径 | 用途 | 关键内容 |
|---------|------|---------|
| `frontend/src/components/common/ModuleCard.tsx` | 模块卡片组件 | 展示单个模块的卡片UI，处理点击跳转 |
| `frontend/src/constants/modules.ts` | 模块配置数据 | 12个模块的静态配置（名称、图标、路径等） |
| `frontend/src/types/module.ts` | 类型定义 | ModuleCard、FunctionLink 接口定义 |

### 3.2 修改文件

| 文件路径 | 修改类型 | 说明 |
|---------|---------|------|
| `frontend/src/pages/Dashboard/index.tsx` | **完全替换** | 替换现有统计页面为菜单面板 |

### 3.3 测试文件（需创建）

| 文件路径 | 测试类型 | 覆盖范围 |
|---------|---------|---------|
| `frontend/src/components/common/ModuleCard.test.tsx` | 单元测试 | ModuleCard 组件的渲染、点击、权限过滤 |
| `frontend/src/pages/Dashboard/Dashboard.test.tsx` | 集成测试 | MenuPanel 页面的完整渲染和交互 |

---

## 四、开发步骤

### Step 1: 定义数据类型

创建 `frontend/src/types/module.ts`：

```typescript
/**
 * @spec D001-menu-panel
 * 模块卡片数据类型定义
 */
import { ComponentType } from 'react';

export interface ModuleCard {
  id: string;
  name: string;
  description: string;
  icon: ComponentType;
  defaultPath: string;
  functionLinks: FunctionLink[];
  order: number;
  status: 'normal' | 'developing';
  requiredPermissions?: string[];
  badge?: number | string;
}

export interface FunctionLink {
  name: string;
  path: string;
  enabled?: boolean;
  badge?: number | string;
}
```

### Step 2: 配置模块数据

创建 `frontend/src/constants/modules.ts`：

```typescript
/**
 * @spec D001-menu-panel
 * 12个业务模块的静态配置
 */
import {
  ShopOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  // ... 其他图标
} from '@ant-design/icons';
import type { ModuleCard } from '@/types/module';

export const BUSINESS_MODULES: ModuleCard[] = [
  {
    id: 'hall-store',
    name: '影厅商品管理',
    description: '管理影厅售卖商品和库存',
    icon: ShopOutlined,
    defaultPath: '/hall-store',
    order: 1,
    status: 'normal',
    functionLinks: [
      { name: '商品列表', path: '/hall-store/products', enabled: true },
      { name: '库存管理', path: '/hall-store/inventory', enabled: true },
      // ...
    ]
  },
  // ... 其他11个模块
];
```

### Step 3: 创建 ModuleCard 组件

创建 `frontend/src/components/common/ModuleCard.tsx`：

```typescript
/**
 * @spec D001-menu-panel
 * 模块卡片组件 - 展示单个业务模块的导航卡片
 */
import React from 'react';
import { Card, Badge, Tag, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { ModuleCard as ModuleCardType } from '@/types/module';

interface ModuleCardProps {
  module: ModuleCardType;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ module }) => {
  const navigate = useNavigate();
  const Icon = module.icon;

  const handleCardClick = () => {
    navigate(module.defaultPath);
  };

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      className="module-card"
      data-testid={`module-card-${module.id}`}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div className="module-header">
          <Icon style={{ fontSize: 32, color: '#1890ff' }} />
          {module.badge && <Badge count={module.badge} />}
        </div>
        <div className="module-title">
          <h3>{module.name}</h3>
          {module.status === 'developing' && <Tag color="orange">开发中</Tag>}
        </div>
        <p className="module-description">{module.description}</p>
        {/* 功能链接列表 */}
      </Space>
    </Card>
  );
};
```

### Step 4: 替换 Dashboard 页面

修改 `frontend/src/pages/Dashboard/index.tsx`：

```typescript
/**
 * @spec D001-menu-panel
 * 菜单面板页面 - 替换原有的 Dashboard 统计页面
 */
import React, { useMemo } from 'react';
import { Row, Col } from 'antd';
import { ModuleCard } from '@/components/common/ModuleCard';
import { BUSINESS_MODULES } from '@/constants/modules';
import { useUserPermissions } from '@/stores/userStore'; // Zustand

export const Dashboard: React.FC = () => {
  const userPermissions = useUserPermissions();

  // 根据权限过滤模块
  const visibleModules = useMemo(() => {
    return BUSINESS_MODULES
      .filter(module => {
        if (!module.requiredPermissions) return true;
        return module.requiredPermissions.some(p => userPermissions.includes(p));
      })
      .sort((a, b) => a.order - b.order);
  }, [userPermissions]);

  return (
    <div className="menu-panel" data-testid="menu-panel">
      <Row gutter={[24, 24]}>
        {visibleModules.map(module => (
          <Col xs={24} sm={12} md={8} lg={6} key={module.id}>
            <ModuleCard module={module} />
          </Col>
        ))}
      </Row>
    </div>
  );
};
```

### Step 5: 编写单元测试

创建 `frontend/src/components/common/ModuleCard.test.tsx`：

```typescript
/**
 * @spec D001-menu-panel
 * ModuleCard 组件单元测试
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ModuleCard } from './ModuleCard';
import { ShopOutlined } from '@ant-design/icons';

describe('ModuleCard', () => {
  const mockModule = {
    id: 'test-module',
    name: '测试模块',
    description: '这是一个测试模块',
    icon: ShopOutlined,
    defaultPath: '/test',
    order: 1,
    status: 'normal' as const,
    functionLinks: [],
  };

  it('should render module card correctly', () => {
    render(
      <BrowserRouter>
        <ModuleCard module={mockModule} />
      </BrowserRouter>
    );

    expect(screen.getByText('测试模块')).toBeInTheDocument();
    expect(screen.getByText('这是一个测试模块')).toBeInTheDocument();
  });

  // 更多测试用例...
});
```

---

## 五、运行与调试

### 5.1 启动开发服务器

```bash
cd frontend
npm run dev
```

浏览器访问：`http://localhost:5173/dashboard`

### 5.2 运行单元测试

```bash
# 运行所有测试
npm run test

# 运行特定文件测试
npm run test ModuleCard.test.tsx

# 测试覆盖率报告
npm run test:coverage
```

### 5.3 运行 E2E 测试（可选）

```bash
# 启动 Playwright E2E 测试
npm run test:e2e
```

---

## 六、验证清单

在提交代码前，请确认以下事项：

### 6.1 功能验证

- [ ] 页面能正常加载，显示 12 个模块卡片
- [ ] 卡片按照 order 字段正确排序
- [ ] 鼠标悬停时显示 hover 效果
- [ ] 点击卡片能正确跳转到对应路径
- [ ] 权限过滤逻辑正常工作
- [ ] 响应式布局在不同屏幕尺寸下正常显示

### 6.2 代码质量

- [ ] 所有新增文件包含 `@spec D001-menu-panel` 注释
- [ ] TypeScript 类型定义完整，无 `any` 类型
- [ ] 通过 ESLint 和 Prettier 检查
- [ ] 所有组件都有对应的单元测试
- [ ] 测试覆盖率 >= 80%

### 6.3 性能指标

- [ ] 页面首次加载时间 < 2 秒
- [ ] 卡片点击响应时间 < 300 毫秒
- [ ] 无控制台错误或警告

---

## 七、常见问题排查

### 问题 1: 模块卡片不显示

**可能原因**：
- 权限配置错误，所有模块都被过滤
- BUSINESS_MODULES 配置有误

**解决方法**：
```typescript
// 临时移除权限过滤逻辑，检查是否渲染
const visibleModules = BUSINESS_MODULES.sort((a, b) => a.order - b.order);
```

### 问题 2: 点击卡片无反应

**可能原因**：
- React Router 配置错误
- 目标路由不存在

**解决方法**：
```typescript
// 检查路由是否正确定义
console.log('Navigating to:', module.defaultPath);
navigate(module.defaultPath);
```

### 问题 3: 样式布局错误

**可能原因**：
- Ant Design 栅格系统配置错误
- CSS 样式冲突

**解决方法**：
```typescript
// 检查 Col 组件的 span 配置
<Col xs={24} sm={12} md={8} lg={6} key={module.id}>
```

### 问题 4: 图标不显示

**可能原因**：
- Ant Design Icons 未正确导入
- Icon 组件类型错误

**解决方法**：
```typescript
// 确保正确导入图标
import { ShopOutlined } from '@ant-design/icons';

// 确保 icon 是一个组件
const Icon = module.icon;
<Icon style={{ fontSize: 32 }} />
```

---

## 八、扩展开发

### 8.1 添加新模块

在 `frontend/src/constants/modules.ts` 中添加新的模块配置：

```typescript
{
  id: 'new-module',
  name: '新模块',
  description: '模块描述',
  icon: NewIcon,
  defaultPath: '/new-module',
  order: 13, // 按业务流程排序
  status: 'developing', // 或 'normal'
  functionLinks: [
    { name: '功能1', path: '/new-module/feature1', enabled: true }
  ],
  requiredPermissions: ['new-module:view'] // 可选
}
```

### 8.2 自定义卡片样式

修改 `ModuleCard.tsx` 组件的样式：

```typescript
<Card
  hoverable
  style={{
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  }}
>
  {/* ... */}
</Card>
```

### 8.3 添加统计徽章

为模块卡片添加实时统计数据：

```typescript
// 在 Zustand store 中管理统计数据
interface ModuleStats {
  moduleId: string;
  count: number;
}

// 在 ModuleCard 中显示
{module.badge && <Badge count={module.badge} />}
```

---

## 九、提交代码

### 9.1 代码提交规范

```bash
# 添加变更文件
git add frontend/src/components/common/ModuleCard.tsx
git add frontend/src/constants/modules.ts
git add frontend/src/types/module.ts
git add frontend/src/pages/Dashboard/index.tsx

# 提交代码
git commit -m "feat(D001-menu-panel): 实现菜单面板功能

- 创建 ModuleCard 组件
- 配置 12 个业务模块数据
- 替换 Dashboard 页面为菜单面板
- 添加单元测试覆盖

@spec D001-menu-panel"
```

### 9.2 推送到远程

```bash
# 推送功能分支
git push origin D001-menu-panel
```

---

## 十、参考资料

- **功能规格**: `specs/D001-menu-panel/spec.md`
- **实施计划**: `specs/D001-menu-panel/plan.md`
- **技术研究**: `specs/D001-menu-panel/research.md`
- **数据模型**: `specs/D001-menu-panel/data-model.md`
- **Ant Design Card**: https://ant.design/components/card-cn
- **React Router v7**: https://reactrouter.com/en/main
- **Zustand**: https://zustand-demo.pmnd.rs/

---

## 十一、联系支持

如有问题，请参考：
1. 项目宪法：`.specify/memory/constitution.md`
2. 技术研究文档：`specs/D001-menu-panel/research.md`
3. 数据模型定义：`specs/D001-menu-panel/data-model.md`
