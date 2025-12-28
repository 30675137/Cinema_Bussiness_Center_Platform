# Data Model: 前端路径结构优化

**Date**: 2025-01-27  
**Feature**: 006-frontend-structure-refactor

## 概述

本文档描述前端路径结构重构中涉及的文件和目录结构模型。虽然这是一个重构任务而非数据模型设计，但我们需要明确定义文件组织结构、路径映射关系和配置文件结构。

## 文件结构实体

### 1. 源代码文件实体

#### 根目录源代码文件 (RootSrcFile)
- **位置**: 项目根目录 `/src/`
- **属性**:
  - `path`: 文件相对路径（如 `src/components/Inventory/InventoryTable.tsx`）
  - `content`: 文件内容
  - `imports`: 导入语句列表
  - `exports`: 导出语句列表
- **目标位置**: `frontend/src/` 对应路径
- **合并策略**: 优先级最低，如果目标位置已存在同名文件，需要手动审查

#### Frontend 源代码文件 (FrontendSrcFile)
- **位置**: `frontend/src/`
- **属性**:
  - `path`: 文件相对路径（如 `frontend/src/components/layout/Router.tsx`）
  - `content`: 文件内容
  - `imports`: 导入语句列表（可能包含 `@admin` 别名引用）
  - `exports`: 导出语句列表
- **目标位置**: 保持在 `frontend/src/`（优先级最高）
- **合并策略**: 优先保留，作为合并的目标

#### Cinema_Operation_Admin 源代码文件 (AdminSrcFile)
- **位置**: `frontend/Cinema_Operation_Admin/src/`
- **属性**:
  - `path`: 文件相对路径（如 `Cinema_Operation_Admin/src/pages/Dashboard/index.tsx`）
  - `content`: 文件内容
  - `imports`: 导入语句列表（使用 `@/` 别名，指向 `Cinema_Operation_Admin/src`）
  - `exports`: 导出语句列表
- **目标位置**: `frontend/src/` 对应路径
- **合并策略**: 如果目标位置不存在文件，直接复制；如果存在，需要手动审查

### 2. 测试文件实体

#### 根目录测试文件 (RootTestFile)
- **位置**: 项目根目录 `/tests/`
- **属性**:
  - `path`: 文件相对路径
  - `type`: 测试类型（e2e/unit）
  - `content`: 文件内容
- **目标位置**: `frontend/tests/` 对应路径

#### Frontend 测试文件 (FrontendTestFile)
- **位置**: `frontend/tests/`
- **属性**:
  - `path`: 文件相对路径
  - `type`: 测试类型（e2e/unit）
  - `content`: 文件内容
- **目标位置**: 保持在 `frontend/tests/`（优先级最高）

#### Cinema_Operation_Admin 测试文件 (AdminTestFile)
- **位置**: `frontend/Cinema_Operation_Admin/tests/`
- **属性**:
  - `path`: 文件相对路径
  - `type`: 测试类型（e2e/unit）
  - `content`: 文件内容
- **目标位置**: `frontend/tests/` 对应路径

### 3. 配置文件实体

#### Vite 配置文件 (ViteConfig)
- **位置**: `frontend/vite.config.ts`
- **属性**:
  - `aliases`: 路径别名配置
    - `@`: 指向 `frontend/src`
    - `@admin`: 需要移除，当前指向 `Cinema_Operation_Admin/src`
- **更新需求**: 移除 `@admin` 别名配置

#### TypeScript 配置文件 (TsConfig)
- **位置**: `frontend/tsconfig.app.json`
- **属性**:
  - `paths`: 路径映射配置
    - `@/*`: 指向 `src/*`
    - `@admin/*`: 需要移除，当前指向 `Cinema_Operation_Admin/src/*`
- **更新需求**: 移除 `@admin/*` 路径映射

#### Package 配置文件 (PackageJson)
- **位置**: 
  - `frontend/package.json` (主配置)
  - `frontend/Cinema_Operation_Admin/package.json` (需要合并)
- **属性**:
  - `dependencies`: 生产依赖
  - `devDependencies`: 开发依赖
  - `scripts`: 脚本命令
- **合并需求**: 合并依赖项，保留高版本，合并所有脚本

## 路径别名映射关系

### 当前路径别名映射

```typescript
// vite.config.ts
{
  '@': resolve(__dirname, 'src'),
  '@admin': resolve(__dirname, 'Cinema_Operation_Admin/src'),
  // ... 其他别名
}

// tsconfig.app.json
{
  "@/*": ["src/*"],
  "@admin/*": ["Cinema_Operation_Admin/src/*"],
  // ... 其他映射
}
```

### 目标路径别名映射

```typescript
// vite.config.ts
{
  '@': resolve(__dirname, 'src'),
  // 移除 @admin
  // ... 其他别名保持不变
}

// tsconfig.app.json
{
  "@/*": ["src/*"],
  // 移除 @admin/*
  // ... 其他映射保持不变
}
```

## 文件导入关系

### 导入语句模式

#### 当前导入模式
```typescript
// 在 frontend/src 中使用 @admin
import SkuListPage from '@admin/pages/product/sku/SkuListPage';

// 在 Cinema_Operation_Admin/src 中使用 @/
import { useUserStore } from '@/stores/userStore';
```

#### 目标导入模式
```typescript
// 合并后统一使用 @/
import SkuListPage from '@/pages/product/sku/SkuListPage';
import { useUserStore } from '@/stores/userStore';
```

### 导入路径转换规则

| 当前路径 | 目标路径 | 说明 |
|---------|---------|------|
| `@admin/pages/Dashboard` | `@/pages/Dashboard` | 直接替换别名前缀 |
| `@admin/components/...` | `@/components/...` | 直接替换别名前缀 |
| `@admin/stores/...` | `@/stores/...` | 直接替换别名前缀 |
| `@admin/utils/...` | `@/utils/...` | 直接替换别名前缀 |

## 文件冲突处理模型

### 冲突检测规则

1. **文件名冲突**: 同一目标路径下存在同名文件
2. **导入路径冲突**: 合并后导致导入路径指向错误的位置
3. **导出冲突**: 合并后导致导出重复或冲突

### 冲突解决策略

```typescript
interface FileConflict {
  sourcePath: string;        // 源文件路径
  targetPath: string;        // 目标文件路径
  sourceContent: string;     // 源文件内容
  targetContent: string;     // 目标文件内容
  priority: 'frontend' | 'admin' | 'root';  // 优先级
  resolution: 'keep_target' | 'merge' | 'rename' | 'manual';  // 解决方式
}
```

### 冲突解决优先级

1. **frontend/src/** (优先级最高) - 保留现有版本
2. **Cinema_Operation_Admin/src/** (优先级中等) - 需要审查
3. **根目录 src/** (优先级最低) - 需要审查

## 目录结构层次

### 合并前结构
```
项目根目录/
├── src/                    # 根目录源代码
├── tests/                  # 根目录测试
└── frontend/
    ├── src/                # 前端源代码
    ├── tests/              # 前端测试
    └── Cinema_Operation_Admin/
        ├── src/            # Admin 源代码
        └── tests/          # Admin 测试
```

### 合并后结构
```
项目根目录/
└── frontend/
    ├── src/                # 统一的前端源代码
    └── tests/              # 统一的测试
```

## 依赖关系图

### 文件依赖关系

```
frontend/src/components/layout/Router.tsx
  └── @admin/pages/product/sku/SkuListPage  (需要更新为 @/pages/...)

Cinema_Operation_Admin/src/stores/userStore.ts
  └── @/types/user  (指向 Cinema_Operation_Admin/src/types/user)
  └── 合并后需要更新为 @/types/user (指向 frontend/src/types/user)
```

### 配置依赖关系

```
vite.config.ts
  ├── 依赖 tsconfig.app.json 的路径配置
  └── 影响所有使用路径别名的文件

tsconfig.app.json
  └── 影响 TypeScript 类型检查和路径解析

package.json
  └── 影响依赖安装和脚本执行
```

## 验证模型

### 结构完整性验证

1. **文件存在性检查**: 确保所有文件都已正确复制到目标位置
2. **路径解析检查**: 确保所有导入路径都能正确解析
3. **类型检查**: 确保 TypeScript 类型检查通过
4. **构建验证**: 确保项目能够正常构建

### 功能完整性验证

1. **导入导出验证**: 确保所有模块导入导出正确
2. **运行时验证**: 确保应用能够正常启动和运行
3. **测试验证**: 确保所有测试能够正常运行

## 总结

本数据模型描述了前端路径结构重构中涉及的所有文件实体、路径映射关系、冲突处理策略和验证模型。这个模型将指导重构过程的实施，确保文件合并、路径更新和配置调整都能按照既定的策略正确执行。
