# Data Model: 菜单面板替换Dashboard页面

**Feature**: D001-menu-panel  
**Date**: 2026-01-14  
**Version**: 1.0.0

## 概述

本文档定义菜单面板功能涉及的数据模型。由于本功能为纯前端实现，所有数据均为静态配置，无数据库模型。

## 核心实体

### 1. ModuleCard (模块卡片)

代表一个业务模块的导航卡片。

**属性定义**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | ✅ | 模块唯一标识，用于 React key 和路由跳转 |
| `name` | `string` | ✅ | 模块名称，显示在卡片标题 |
| `description` | `string` | ✅ | 模块描述，显示在卡片副标题 |
| `icon` | `React.ComponentType` | ✅ | Ant Design Icon 组件 |
| `defaultPath` | `string` | ✅ | 点击卡片跳转的默认路径 |
| `functionLinks` | `FunctionLink[]` | ✅ | 模块包含的功能链接列表 (3-5个) |
| `order` | `number` | ✅ | 排序顺序，按业务流程排列 (1-12) |
| `status` | `'normal' \| 'developing'` | ✅ | 模块状态: normal(正常) / developing(开发中) |
| `requiredPermissions` | `string[]` | ❌ | 访问该模块所需的权限列表 (可选，预留字段) |
| `badge` | `number \| string` | ❌ | 角标数字或文本 (可选，用于显示待办事项) |

**TypeScript 定义**:

```typescript
import { ComponentType } from 'react';

/**
 * @spec D001-menu-panel
 * 模块卡片数据模型
 */
export interface ModuleCard {
  /** 模块唯一标识 */
  id: string;
  /** 模块名称 */
  name: string;
  /** 模块描述 */
  description: string;
  /** Ant Design Icon 组件 */
  icon: ComponentType<{ style?: React.CSSProperties }>;
  /** 默认跳转路径 */
  defaultPath: string;
  /** 功能链接列表 */
  functionLinks: FunctionLink[];
  /** 排序顺序 (1-12) */
  order: number;
  /** 模块状态 */
  status: 'normal' | 'developing';
  /** 所需权限 (可选) */
  requiredPermissions?: string[];
  /** 角标 (可选) */
  badge?: number | string;
}
```

**验证规则**:
- `id`: 非空字符串，唯一性
- `name`: 非空字符串，长度 2-20 字符
- `description`: 非空字符串，长度 5-100 字符
- `functionLinks`: 数组长度 3-5
- `order`: 整数，范围 1-12
- `defaultPath`: 有效的路由路径，以 `/` 开头

**示例数据**:

```typescript
{
  id: 'basic-settings',
  name: '基础设置与主数据',
  description: '组织架构、单位管理、字典配置',
  icon: ControlOutlined,
  defaultPath: '/basic-settings/organization',
  functionLinks: [
    { name: '组织/门店/仓库管理', path: '/basic-settings/organization' },
    { name: '单位 & 换算规则', path: '/basic-settings/units' },
    { name: '字典与规则配置', path: '/basic-settings/dictionary' },
  ],
  order: 1,
  status: 'normal',
}
```

---

### 2. FunctionLink (功能链接)

模块卡片中的具体功能入口。

**属性定义**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | `string` | ✅ | 功能名称 |
| `path` | `string` | ✅ | 跳转路径 |
| `enabled` | `boolean` | ❌ | 是否启用 (默认 true) |
| `badge` | `number \| string` | ❌ | 功能角标 (可选) |

**TypeScript 定义**:

```typescript
/**
 * @spec D001-menu-panel
 * 功能链接数据模型
 */
export interface FunctionLink {
  /** 功能名称 */
  name: string;
  /** 跳转路径 */
  path: string;
  /** 是否启用 */
  enabled?: boolean;
  /** 角标 (可选) */
  badge?: number | string;
}
```

**验证规则**:
- `name`: 非空字符串，长度 2-30 字符
- `path`: 有效的路由路径，以 `/` 开头
- `enabled`: 布尔值，默认 true

**示例数据**:

```typescript
{
  name: 'SPU 管理',
  path: '/products/spu',
  enabled: true,
}
```

---

### 3. UserPermissions (用户权限)

用户的权限列表，用于过滤模块显示。

**属性定义**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `permissions` | `string[]` | ✅ | 权限代码列表 |
| `isAdmin` | `boolean` | ✅ | 是否为管理员 (管理员拥有所有权限) |

**TypeScript 定义**:

```typescript
/**
 * @spec D001-menu-panel
 * 用户权限数据模型 (预留，当前阶段未实现)
 */
export interface UserPermissions {
  /** 权限代码列表 */
  permissions: string[];
  /** 是否为管理员 */
  isAdmin: boolean;
}
```

**说明**: 
- 当前阶段 (B端管理后台) 暂不实现权限过滤逻辑
- 所有用户默认可见所有模块
- 权限字段仅作为数据模型预留，便于后续扩展

---

## 数据流转

### 1. 模块数据初始化

```
constants/modules.ts (静态配置)
    ↓
pages/Dashboard/index.tsx (组件加载)
    ↓
filterModulesByPermission() (权限过滤，当前返回全部)
    ↓
渲染 ModuleCard 组件列表
```

### 2. 用户交互流程

```
用户点击模块卡片
    ↓
读取 module.defaultPath
    ↓
调用 navigate(defaultPath)
    ↓
React Router 跳转到目标页面
```

```
用户点击功能链接
    ↓
读取 functionLink.path
    ↓
调用 navigate(path)
    ↓
React Router 跳转到目标页面
```

---

## 数据配置示例

完整的 12 个模块配置 (位于 `frontend/src/constants/modules.ts`):

```typescript
/**
 * @spec D001-menu-panel
 * 12个业务模块的静态配置
 */
export const MODULES: ModuleCard[] = [
  {
    id: 'basic-settings',
    name: '基础设置与主数据',
    description: '组织架构、单位管理、字典配置',
    icon: ControlOutlined,
    defaultPath: '/basic-settings/organization',
    functionLinks: [
      { name: '组织/门店/仓库管理', path: '/basic-settings/organization' },
      { name: '单位 & 换算规则', path: '/basic-settings/units' },
      { name: '字典与规则配置', path: '/basic-settings/dictionary' },
    ],
    order: 1,
    status: 'normal',
  },
  // ... 其余 11 个模块配置
];
```

---

## 状态管理

### Zustand Store (可选)

如果需要全局管理用户权限状态:

```typescript
/**
 * @spec D001-menu-panel
 * 用户权限 Store (预留，当前阶段未实现)
 */
interface PermissionStore {
  permissions: string[];
  isAdmin: boolean;
  setPermissions: (permissions: string[]) => void;
}

export const usePermissionStore = create<PermissionStore>((set) => ({
  permissions: [],
  isAdmin: false,
  setPermissions: (permissions) => set({ permissions }),
}));
```

**说明**: 当前阶段无需实现，仅作为数据模型预留。

---

## 数据验证

### Zod Schema (可选)

如果需要运行时数据验证:

```typescript
import { z } from 'zod';

export const FunctionLinkSchema = z.object({
  name: z.string().min(2).max(30),
  path: z.string().regex(/^\//, 'Path must start with /'),
  enabled: z.boolean().optional().default(true),
  badge: z.union([z.number(), z.string()]).optional(),
});

export const ModuleCardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(20),
  description: z.string().min(5).max(100),
  defaultPath: z.string().regex(/^\//, 'Path must start with /'),
  functionLinks: z.array(FunctionLinkSchema).min(3).max(5),
  order: z.number().int().min(1).max(12),
  status: z.enum(['normal', 'developing']),
  requiredPermissions: z.array(z.string()).optional(),
  badge: z.union([z.number(), z.string()]).optional(),
});
```

---

## 总结

- **核心实体**: 2 个 (ModuleCard, FunctionLink)
- **预留实体**: 1 个 (UserPermissions)
- **数据来源**: 静态配置文件
- **数据验证**: TypeScript 类型检查 (必须) + Zod Schema (可选)
- **状态管理**: 无需全局状态，组件内部状态即可

所有数据模型定义完成，符合功能规格要求。
