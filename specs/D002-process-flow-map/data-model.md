# Data Model: 业务端到端流程地图

**Feature**: D002-process-flow-map  
**Date**: 2026-01-14  
**Status**: COMPLETED ✅

## Overview

本文档定义 D002 业务端到端流程地图功能的核心数据模型。所有类型定义遵循 TypeScript 严格模式，确保类型安全和代码可维护性。数据模型分为三个层次：视图层、流程层、模块层（复用 D001）。

**设计原则**:
- **复用优先**: 最大化复用 D001 的 ModuleCard、FunctionLink 等类型
- **分层清晰**: 视图层 → 流程层 → 模块层，职责分离
- **类型安全**: 所有枚举和联合类型显式定义
- **易于扩展**: 预留扩展字段，支持未来功能

---

## Type Hierarchy

```text
ViewState (视图状态)
  ├─ ViewType (视图类型枚举)
  ├─ ProcessStage[] (流程阶段列表)
  │   └─ ModuleCard[] (模块卡片 - from D001)
  │       └─ FunctionLink[] (功能链接 - from D001)
  └─ ViewPreferences (视图偏好设置)
```

---

## 1. View Layer (视图层)

### 1.1 ViewType

```typescript
/**
 * @spec D002-process-flow-map
 * 视图类型枚举
 */
export enum ViewType {
  /** 全景视图（泳道架构） - from D001 */
  PANORAMA = 'panorama',
  
  /** 流程视图（端到端流程） - new in D002 */
  PROCESS = 'process',
}

// 类型守卫
export function isValidViewType(value: string): value is ViewType {
  return Object.values(ViewType).includes(value as ViewType);
}
```

**说明**:
- `PANORAMA`: 对应现有的泳道式业务全景地图（D001）
- `PROCESS`: 对应新增的端到端流程地图（D002）

**验证规则**:
- 必须是枚举中定义的两个值之一
- 默认值为 `PANORAMA`

---

### 1.2 ViewState

```typescript
/**
 * @spec D002-process-flow-map
 * 视图状态接口 - 管理两种视图的状态
 */
export interface ViewState {
  /** 当前激活的视图 */
  activeView: ViewType;
  
  /** 泳道视图：折叠的泳道 ID 集合 */
  collapsedLanes: Set<string>;
  
  /** 流程视图：折叠的阶段 ID 集合 */
  collapsedStages: Set<string>;
  
  /** 滚动位置（两个视图独立记录） */
  scrollPosition: ViewScrollPosition;
  
  /** 视图偏好设置 */
  preferences: ViewPreferences;
}

/**
 * 视图滚动位置
 */
export interface ViewScrollPosition {
  /** 泳道视图滚动位置 (px) */
  panorama: number;
  
  /** 流程视图滚动位置 (px) */
  process: number;
}

/**
 * 视图偏好设置
 */
export interface ViewPreferences {
  /** 是否启用动画效果 */
  enableAnimation: boolean;
  
  /** 是否显示阶段副标题 */
  showStageSubtitles: boolean;
  
  /** 是否显示流程箭头 */
  showFlowArrows: boolean;
  
  /** 卡片显示密度 */
  cardDensity: 'compact' | 'default' | 'comfortable';
}
```

**状态管理策略**:
- `activeView`: 使用 React state + sessionStorage 持久化
- `collapsedLanes/collapsedStages`: 使用 React state，仅在会话内保持
- `scrollPosition`: 使用 React state + `window.scrollTo()` 恢复
- `preferences`: 使用 localStorage 持久化用户偏好

**默认值**:
```typescript
export const DEFAULT_VIEW_STATE: ViewState = {
  activeView: ViewType.PANORAMA,
  collapsedLanes: new Set(),
  collapsedStages: new Set(),
  scrollPosition: { panorama: 0, process: 0 },
  preferences: {
    enableAnimation: true,
    showStageSubtitles: true,
    showFlowArrows: true,
    cardDensity: 'default',
  },
};
```

---

## 2. Process Layer (流程层)

### 2.1 ProcessStage

```typescript
/**
 * @spec D002-process-flow-map
 * 流程阶段接口 - 代表业务流程的一个执行阶段
 */
export interface ProcessStage {
  /** 阶段唯一标识 */
  id: string;
  
  /** 阶段序号 (1-5) */
  order: number;
  
  /** 阶段标题 */
  title: string;
  
  /** 阶段副标题（核心业务描述） */
  subtitle: string;
  
  /** 阶段包含的模块 ID 列表 */
  moduleIds: string[];
  
  /** 阶段颜色主题 (可选) */
  color?: string;
  
  /** 阶段图标 (可选) */
  icon?: React.ComponentType;
  
  /** 阶段是否可折叠 */
  collapsible: boolean;
  
  /** 阶段默认折叠状态 */
  defaultCollapsed: boolean;
}
```

**验证规则**:
- `id`: 必须唯一，使用 kebab-case (e.g., "foundation", "supply")
- `order`: 1-5 的整数
- `title`: 非空字符串，最多 10 个字符
- `subtitle`: 非空字符串，最多 20 个字符
- `moduleIds`: 至少包含 1 个模块 ID，最多 5 个
- `color`: 可选，必须是有效的 CSS 颜色值

**示例**:
```typescript
const foundationStage: ProcessStage = {
  id: 'foundation',
  order: 1,
  title: '基础建设',
  subtitle: '数据初始化',
  moduleIds: ['basic-settings', 'system-management'],
  color: '#1890ff',
  collapsible: true,
  defaultCollapsed: false,
};
```

---

### 2.2 ProcessStageConfig

```typescript
/**
 * @spec D002-process-flow-map
 * 流程阶段配置 - 完整的 5 个阶段定义
 */
export interface ProcessStageConfig {
  /** 阶段列表 */
  stages: ProcessStage[];
  
  /** 阶段间连接线样式 */
  connectionStyle: ConnectionStyle;
}

/**
 * 连接线样式
 */
export interface ConnectionStyle {
  /** 连接线颜色 */
  color: string;
  
  /** 连接线宽度 (px) */
  width: number;
  
  /** 箭头类型 */
  arrowType: 'triangle' | 'chevron' | 'dot';
  
  /** 是否显示动画 */
  animated: boolean;
}

/**
 * 默认流程阶段配置
 */
export const DEFAULT_PROCESS_STAGE_CONFIG: ProcessStageConfig = {
  stages: [
    // 5 个阶段定义（见下方 PROCESS_STAGES 常量）
  ],
  connectionStyle: {
    color: '#1890ff',
    width: 2,
    arrowType: 'triangle',
    animated: true,
  },
};
```

---

### 2.3 PROCESS_STAGES (常量配置)

```typescript
/**
 * @spec D002-process-flow-map
 * 5 个业务流程阶段静态配置
 */
export const PROCESS_STAGES: ProcessStage[] = [
  {
    id: 'foundation',
    order: 1,
    title: '基础建设',
    subtitle: '数据初始化',
    moduleIds: ['basic-settings', 'system-management'],
    color: '#1890ff',
    collapsible: true,
    defaultCollapsed: false,
  },
  {
    id: 'supply',
    order: 2,
    title: '供应生产',
    subtitle: '物料与成本',
    moduleIds: ['bom-management', 'procurement-management', 'inventory-management'],
    color: '#52c41a',
    collapsible: true,
    defaultCollapsed: false,
  },
  {
    id: 'marketing',
    order: 3,
    title: '营销发布',
    subtitle: '定价与档期',
    moduleIds: ['pricing-management', 'scenario-package', 'schedule-management', 'channel-products'],
    color: '#faad14',
    collapsible: true,
    defaultCollapsed: false,
  },
  {
    id: 'transaction',
    order: 4,
    title: '交易履约',
    subtitle: '订单处理',
    moduleIds: ['order-management'],
    color: '#f5222d',
    collapsible: true,
    defaultCollapsed: false,
  },
  {
    id: 'insight',
    order: 5,
    title: '经营洞察',
    subtitle: '分析与结算',
    moduleIds: ['operations-report'],
    color: '#722ed1',
    collapsible: true,
    defaultCollapsed: false,
  },
];
```

**数据来源**: 基于规格文档 Clarifications 章节（2026-01-14 会话）

---

## 3. Module Layer (模块层 - 复用 D001)

### 3.1 ModuleCard (from D001)

```typescript
/**
 * @spec D001-menu-panel
 * 模块卡片接口（复用自 D001）
 */
export interface ModuleCard {
  /** 模块唯一标识 */
  id: string;
  
  /** 模块名称 */
  name: string;
  
  /** 模块描述 */
  description: string;
  
  /** 模块图标组件 */
  icon: React.ComponentType;
  
  /** 默认跳转路径 */
  defaultPath: string;
  
  /** 功能链接列表 */
  functionLinks: FunctionLink[];
  
  /** 显示顺序 */
  order: number;
  
  /** 模块状态 */
  status: 'normal' | 'developing';
  
  /** 所需权限（可选） */
  requiredPermissions?: string[];
  
  /** 徽章（可选） */
  badge?: number | string;
}
```

**说明**: 此类型完全复用 D001，无需修改。

---

### 3.2 FunctionLink (from D001)

```typescript
/**
 * @spec D001-menu-panel
 * 功能链接接口（复用自 D001）
 */
export interface FunctionLink {
  /** 功能名称 */
  name: string;
  
  /** 跳转路径 */
  path: string;
  
  /** 是否启用（可选） */
  enabled?: boolean;
  
  /** 徽章（可选） */
  badge?: number | string;
}
```

**说明**: 此类型完全复用 D001，无需修改。

---

## 4. Helper Functions (辅助函数)

### 4.1 Stage Utilities

```typescript
/**
 * @spec D002-process-flow-map
 * 流程阶段工具函数
 */

/**
 * 根据阶段 ID 获取包含的模块
 */
export function getModulesByStage(
  stageId: string,
  allModules: ModuleCard[]
): ModuleCard[] {
  const stage = PROCESS_STAGES.find(s => s.id === stageId);
  if (!stage) {
    console.warn(`Stage not found: ${stageId}`);
    return [];
  }
  
  return allModules
    .filter(m => stage.moduleIds.includes(m.id))
    .sort((a, b) => a.order - b.order);
}

/**
 * 获取模块所属的阶段
 */
export function getStageByModule(moduleId: string): ProcessStage | undefined {
  return PROCESS_STAGES.find(stage => 
    stage.moduleIds.includes(moduleId)
  );
}

/**
 * 验证阶段配置完整性
 */
export function validateStageConfig(
  stages: ProcessStage[],
  allModules: ModuleCard[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // 检查阶段顺序连续性
  const orders = stages.map(s => s.order).sort((a, b) => a - b);
  for (let i = 0; i < orders.length; i++) {
    if (orders[i] !== i + 1) {
      errors.push(`Stage order gap detected: expected ${i + 1}, got ${orders[i]}`);
    }
  }
  
  // 检查模块 ID 有效性
  const allModuleIds = allModules.map(m => m.id);
  stages.forEach(stage => {
    stage.moduleIds.forEach(moduleId => {
      if (!allModuleIds.includes(moduleId)) {
        errors.push(`Invalid module ID in stage ${stage.id}: ${moduleId}`);
      }
    });
  });
  
  // 检查模块是否重复分配
  const assignedModules = stages.flatMap(s => s.moduleIds);
  const duplicates = assignedModules.filter(
    (id, index) => assignedModules.indexOf(id) !== index
  );
  if (duplicates.length > 0) {
    errors.push(`Duplicate module assignments: ${duplicates.join(', ')}`);
  }
  
  return { valid: errors.length === 0, errors };
}
```

---

### 4.2 View State Utilities

```typescript
/**
 * @spec D002-process-flow-map
 * 视图状态工具函数
 */

/**
 * 保存视图状态到 sessionStorage
 */
export function saveViewState(state: Partial<ViewState>): void {
  try {
    const saved = sessionStorage.getItem('dashboard-view-state');
    const current = saved ? JSON.parse(saved) : {};
    
    const updated = {
      ...current,
      activeView: state.activeView,
      // 注意: Set 需要转换为数组
      collapsedLanes: state.collapsedLanes 
        ? Array.from(state.collapsedLanes) 
        : current.collapsedLanes,
      collapsedStages: state.collapsedStages 
        ? Array.from(state.collapsedStages) 
        : current.collapsedStages,
    };
    
    sessionStorage.setItem('dashboard-view-state', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save view state:', e);
  }
}

/**
 * 从 sessionStorage 恢复视图状态
 */
export function loadViewState(): Partial<ViewState> | null {
  try {
    const saved = sessionStorage.getItem('dashboard-view-state');
    if (!saved) return null;
    
    const parsed = JSON.parse(saved);
    
    // 注意: 数组需要转换为 Set
    return {
      activeView: parsed.activeView,
      collapsedLanes: new Set(parsed.collapsedLanes || []),
      collapsedStages: new Set(parsed.collapsedStages || []),
    };
  } catch (e) {
    console.error('Failed to load view state:', e);
    return null;
  }
}

/**
 * 清除视图状态
 */
export function clearViewState(): void {
  sessionStorage.removeItem('dashboard-view-state');
}
```

---

## 5. Validation Rules (验证规则)

### 5.1 ProcessStage Validation

```typescript
/**
 * @spec D002-process-flow-map
 * 流程阶段验证规则
 */
export const STAGE_VALIDATION_RULES = {
  /** ID 规则: 小写字母和连字符 */
  idPattern: /^[a-z]+(-[a-z]+)*$/,
  
  /** 标题最大长度 */
  titleMaxLength: 10,
  
  /** 副标题最大长度 */
  subtitleMaxLength: 20,
  
  /** 每个阶段最少模块数 */
  minModules: 1,
  
  /** 每个阶段最多模块数 */
  maxModules: 5,
  
  /** 阶段顺序范围 */
  orderRange: { min: 1, max: 5 },
};

/**
 * 验证单个阶段
 */
export function validateStage(stage: ProcessStage): { 
  valid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];
  const rules = STAGE_VALIDATION_RULES;
  
  if (!rules.idPattern.test(stage.id)) {
    errors.push(`Invalid stage ID format: ${stage.id}`);
  }
  
  if (stage.title.length > rules.titleMaxLength) {
    errors.push(`Stage title too long: ${stage.title.length} > ${rules.titleMaxLength}`);
  }
  
  if (stage.subtitle.length > rules.subtitleMaxLength) {
    errors.push(`Stage subtitle too long: ${stage.subtitle.length} > ${rules.subtitleMaxLength}`);
  }
  
  if (stage.moduleIds.length < rules.minModules) {
    errors.push(`Stage has too few modules: ${stage.moduleIds.length} < ${rules.minModules}`);
  }
  
  if (stage.moduleIds.length > rules.maxModules) {
    errors.push(`Stage has too many modules: ${stage.moduleIds.length} > ${rules.maxModules}`);
  }
  
  if (stage.order < rules.orderRange.min || stage.order > rules.orderRange.max) {
    errors.push(`Stage order out of range: ${stage.order} not in [${rules.orderRange.min}, ${rules.orderRange.max}]`);
  }
  
  return { valid: errors.length === 0, errors };
}
```

---

## 6. Test Data (测试数据)

### 6.1 Mock ProcessStage

```typescript
/**
 * @spec D002-process-flow-map
 * 单元测试用模拟数据
 */
export const MOCK_PROCESS_STAGE: ProcessStage = {
  id: 'test-stage',
  order: 1,
  title: '测试阶段',
  subtitle: '用于单元测试',
  moduleIds: ['test-module-1', 'test-module-2'],
  color: '#1890ff',
  collapsible: true,
  defaultCollapsed: false,
};

export const MOCK_PROCESS_STAGES: ProcessStage[] = [
  {
    id: 'stage-1',
    order: 1,
    title: '阶段一',
    subtitle: '第一阶段',
    moduleIds: ['module-1'],
    color: '#1890ff',
    collapsible: true,
    defaultCollapsed: false,
  },
  {
    id: 'stage-2',
    order: 2,
    title: '阶段二',
    subtitle: '第二阶段',
    moduleIds: ['module-2', 'module-3'],
    color: '#52c41a',
    collapsible: true,
    defaultCollapsed: false,
  },
];
```

### 6.2 Mock ViewState

```typescript
export const MOCK_VIEW_STATE: ViewState = {
  activeView: ViewType.PROCESS,
  collapsedLanes: new Set(['lane-1']),
  collapsedStages: new Set(['stage-2']),
  scrollPosition: { panorama: 100, process: 200 },
  preferences: {
    enableAnimation: true,
    showStageSubtitles: true,
    showFlowArrows: true,
    cardDensity: 'default',
  },
};
```

---

## 7. Type Exports (类型导出)

```typescript
/**
 * @spec D002-process-flow-map
 * 统一导出所有类型定义
 * 文件路径: src/types/view.ts
 */

// Enums
export { ViewType };

// Interfaces
export type {
  ViewState,
  ViewScrollPosition,
  ViewPreferences,
  ProcessStage,
  ProcessStageConfig,
  ConnectionStyle,
};

// Constants
export { 
  PROCESS_STAGES, 
  DEFAULT_VIEW_STATE, 
  DEFAULT_PROCESS_STAGE_CONFIG,
  STAGE_VALIDATION_RULES,
};

// Utilities
export {
  getModulesByStage,
  getStageByModule,
  validateStageConfig,
  validateStage,
  saveViewState,
  loadViewState,
  clearViewState,
  isValidViewType,
};

// Test Data
export {
  MOCK_PROCESS_STAGE,
  MOCK_PROCESS_STAGES,
  MOCK_VIEW_STATE,
};
```

---

## Summary

### 核心实体总结

| 实体 | 用途 | 复用来源 |
|------|------|----------|
| `ViewType` | 视图类型枚举 | 新增 (D002) |
| `ViewState` | 视图状态管理 | 新增 (D002) |
| `ProcessStage` | 流程阶段定义 | 新增 (D002) |
| `ModuleCard` | 模块卡片数据 | 复用 (D001) |
| `FunctionLink` | 功能链接数据 | 复用 (D001) |

### 文件结构

```text
src/
├── types/
│   ├── module.ts          # from D001 - ModuleCard, FunctionLink
│   └── view.ts            # new in D002 - ViewState, ProcessStage
├── constants/
│   ├── modules.ts         # from D001 - BUSINESS_MODULES
│   └── processStages.ts   # new in D002 - PROCESS_STAGES
└── utils/
    ├── permission.ts      # from D001 - 权限过滤
    └── viewState.ts       # new in D002 - 视图状态管理
```

### 测试覆盖

```typescript
// 必须编写的单元测试
describe('ProcessStage', () => {
  test('getModulesByStage', () => { /* ... */ });
  test('getStageByModule', () => { /* ... */ });
  test('validateStageConfig', () => { /* ... */ });
  test('validateStage', () => { /* ... */ });
});

describe('ViewState', () => {
  test('saveViewState', () => { /* ... */ });
  test('loadViewState', () => { /* ... */ });
  test('clearViewState', () => { /* ... */ });
});
```

---

**Data Model Completed**: 2026-01-14  
**Total Interfaces**: 8  
**Total Constants**: 3  
**Total Utilities**: 9  
**Ready for Implementation**: ✅
