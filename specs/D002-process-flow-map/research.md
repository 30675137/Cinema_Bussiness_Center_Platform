# Research: 业务端到端流程地图技术调研

**Feature**: D002-process-flow-map  
**Date**: 2026-01-14  
**Status**: COMPLETED ✅

## Executive Summary

本文档记录 D002 业务端到端流程地图功能的技术调研结果。基于规格需求和 D001 现有实现，经过6个关键技术决策的评估，最终选定了最佳技术方案。所有决策优先考虑性能、可维护性和与现有代码的兼容性。

**核心决策**:
1. ✅ 视图切换：条件渲染方案
2. ✅ 流程箭头：CSS 伪元素 + SVG 补充
3. ✅ 状态保持：React state + sessionStorage
4. ✅ 响应式：Ant Design 断点系统
5. ✅ 性能优化：React.memo + useMemo
6. ✅ 数据结构：分层配置（阶段→模块）

---

## Decision 1: 视图切换实现方案

### 选择：Option A - 条件渲染

**最终决定**: 使用 React state 控制当前激活视图，通过条件渲染切换 `<SwimlaneView />` 和 `<ProcessFlowView />` 组件。

### 理由

1. **性能最优**: 仅渲染当前激活的视图，减少 DOM 节点数量
2. **实现简单**: 无需引入路由变更，符合 Dashboard 单页面的设计理念
3. **状态隔离**: 两个视图组件独立，便于维护和测试
4. **符合规格**: 规格要求"在同一个页面内切换"，不是跳转到新路由

### 实现示例

```typescript
/**
 * @spec D002-process-flow-map
 * Dashboard 页面 - 视图容器
 */
import React, { useState } from 'react';
import ViewSwitcher from '@/components/common/ViewSwitcher';
import SwimlaneView from '@/components/dashboard/SwimlaneView';
import ProcessFlowView from '@/components/dashboard/ProcessFlowView';

type ViewType = 'panorama' | 'process';

const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('panorama');

  return (
    <div className="dashboard-container">
      <ViewSwitcher 
        activeView={activeView} 
        onViewChange={setActiveView} 
      />
      
      {activeView === 'panorama' && <SwimlaneView />}
      {activeView === 'process' && <ProcessFlowView />}
    </div>
  );
};

export default Dashboard;
```

### 替代方案

**Option B**: React Router 子路由
- ❌ **缺点**: URL 会变化，违背"在同一页面切换"的设计
- ❌ **缺点**: 增加路由配置复杂度
- ✅ **优点**: 浏览器前进/后退可切换视图

**Option C**: CSS 显示/隐藏
- ❌ **缺点**: 两个视图都渲染，性能开销大
- ❌ **缺点**: 难以控制生命周期和状态
- ✅ **优点**: 切换无重新渲染，极快

**选择 A 的关键因素**: 平衡性能、实现复杂度和用户体验。

---

## Decision 2: 流程箭头绘制技术

### 选择：Option A + Option B 混合方案

**最终决定**: 
- **主要方案**: 使用 CSS 伪元素 (`::after`) + border 三角形绘制简单箭头
- **补充方案**: 对于复杂布局（如分叉、合并），使用 SVG 绘制

### 理由

1. **性能优先**: CSS 伪元素无额外 DOM 节点，性能最优
2. **实现简单**: 大部分流程是线性连接，CSS 足够
3. **灵活扩展**: SVG 作为补充方案，覆盖复杂场景
4. **无第三方依赖**: 避免引入 React Flow 等重型库

### 实现示例

#### CSS 箭头（线性连接）

```css
/**
 * @spec D002-process-flow-map
 * 流程箭头样式
 */
.process-module-card {
  position: relative;
}

/* 箭头线 */
.process-module-card::after {
  content: '';
  position: absolute;
  right: -40px;
  top: 50%;
  width: 40px;
  height: 2px;
  background: #1890ff;
  transform: translateY(-50%);
}

/* 箭头头部 */
.process-module-card::before {
  content: '';
  position: absolute;
  right: -40px;
  top: 50%;
  width: 0;
  height: 0;
  border-left: 8px solid #1890ff;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  transform: translateY(-50%);
}

/* 最后一个模块不显示箭头 */
.process-module-card:last-child::after,
.process-module-card:last-child::before {
  display: none;
}
```

#### SVG 箭头（复杂连接）

```typescript
/**
 * @spec D002-process-flow-map
 * SVG 流程箭头组件（用于复杂连接）
 */
import React from 'react';

interface ProcessFlowArrowProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color?: string;
}

const ProcessFlowArrow: React.FC<ProcessFlowArrowProps> = ({ 
  from, 
  to, 
  color = '#1890ff' 
}) => {
  const path = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  
  return (
    <svg className="process-flow-arrow" style={{ overflow: 'visible' }}>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill={color} />
        </marker>
      </defs>
      <path
        d={path}
        stroke={color}
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
    </svg>
  );
};

export default ProcessFlowArrow;
```

### 替代方案

**Option D**: React Flow / React Diagram
- ❌ **缺点**: Bundle size 增加 > 100KB
- ❌ **缺点**: 功能过于复杂，存在学习成本
- ✅ **优点**: 功能强大，支持拖拽、缩放

**Option C**: Canvas 绘制
- ❌ **缺点**: 实现复杂，需要处理坐标计算
- ❌ **缺点**: 响应式适配困难
- ✅ **优点**: 性能好，适合大量连接

**选择混合方案的关键因素**: 
- 规格中的流程是线性的，CSS 足以应对 90% 场景
- SVG 作为补充，处理少量复杂连接
- 避免过度工程化

---

## Decision 3: 视图状态保持策略

### 选择：Option A + Option B 混合方案

**最终决定**: 
- 使用 **React state** 存储短期状态（折叠状态、滚动位置）
- 使用 **sessionStorage** 持久化视图选择（刷新页面后保持）

### 理由

1. **React state**: 适合组件内短期状态，切换视图时保持
2. **sessionStorage**: 页面刷新后恢复用户偏好的视图
3. **不使用 localStorage**: 避免跨会话持久化，减少用户困惑
4. **不使用 URL**: 保持 URL 简洁，避免状态泄露到分享链接

### 实现示例

```typescript
/**
 * @spec D002-process-flow-map
 * 视图状态管理工具
 */
import { useState, useEffect } from 'react';

export type ViewType = 'panorama' | 'process';

export interface ViewState {
  activeView: ViewType;
  collapsedLanes: Set<string>;
  collapsedStages: Set<string>;
  scrollPosition: { panorama: number; process: number };
}

const SESSION_KEY = 'dashboard-view-state';

export function useViewState() {
  // 从 sessionStorage 恢复视图选择
  const getInitialView = (): ViewType => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.activeView || 'panorama';
      }
    } catch (e) {
      console.warn('Failed to parse view state:', e);
    }
    return 'panorama';
  };

  const [viewState, setViewState] = useState<ViewState>({
    activeView: getInitialView(),
    collapsedLanes: new Set(),
    collapsedStages: new Set(),
    scrollPosition: { panorama: 0, process: 0 },
  });

  // 保存视图选择到 sessionStorage
  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      activeView: viewState.activeView,
    }));
  }, [viewState.activeView]);

  return [viewState, setViewState] as const;
}

// 滚动位置恢复 Hook
export function useScrollRestore(viewType: ViewType, scrollPosition: number) {
  useEffect(() => {
    window.scrollTo({ top: scrollPosition, behavior: 'instant' });
  }, [viewType]);

  useEffect(() => {
    const handleScroll = () => {
      // 在卸载前保存滚动位置
      return window.scrollY;
    };
    return () => {
      handleScroll();
    };
  }, []);
}
```

### 状态结构设计

```typescript
/**
 * @spec D002-process-flow-map
 * 视图状态类型定义
 */
export interface ViewState {
  // 当前激活的视图
  activeView: 'panorama' | 'process';
  
  // 泳道视图：折叠的泳道 ID
  collapsedLanes: Set<string>;
  
  // 流程视图：折叠的阶段 ID
  collapsedStages: Set<string>;
  
  // 滚动位置（两个视图独立）
  scrollPosition: {
    panorama: number;
    process: number;
  };
}
```

### 替代方案

**Option D**: Zustand store
- ❌ **缺点**: 增加全局状态管理复杂度
- ✅ **优点**: 跨组件状态共享
- **结论**: 当前场景状态局部性强，无需引入 Zustand

**Option C**: URL query params
- ❌ **缺点**: URL 变长，用户分享链接会带状态
- ✅ **优点**: 可书签化
- **结论**: 不符合"状态不应反映到 URL"的设计原则

---

## Decision 4: 响应式布局适配

### 选择：Option A - Ant Design 断点系统

**最终决定**: 使用 Ant Design 内置的断点系统 (`xs, sm, md, lg, xl`)，结合 CSS Media Query 实现响应式。

### 理由

1. **与现有代码一致**: D001 已使用 Ant Design 断点
2. **断点标准**: 行业标准断点，覆盖主流设备
3. **实现简单**: 无需额外依赖或 Hook
4. **性能优**: 纯 CSS 实现，无 JS 开销

### 断点定义

```typescript
/**
 * @spec D002-process-flow-map
 * Ant Design 断点标准
 */
export const BREAKPOINTS = {
  xs: 0,     // < 576px   (手机竖屏)
  sm: 576,   // ≥ 576px   (手机横屏)
  md: 768,   // ≥ 768px   (平板竖屏)
  lg: 992,   // ≥ 992px   (平板横屏/小屏桌面)
  xl: 1200,  // ≥ 1200px  (桌面)
  xxl: 1600, // ≥ 1600px  (大屏桌面)
};

/**
 * 响应式布局策略
 */
export const LAYOUT_STRATEGY = {
  // 桌面端：横向流程图
  desktop: {
    breakpoint: 'lg',
    flowDirection: 'horizontal',
    cardsPerRow: 3,
  },
  
  // 平板端：2列布局
  tablet: {
    breakpoint: 'md',
    flowDirection: 'horizontal',
    cardsPerRow: 2,
  },
  
  // 移动端：纵向瀑布流
  mobile: {
    breakpoint: 'xs',
    flowDirection: 'vertical',
    cardsPerRow: 1,
  },
};
```

### 实现示例

```css
/**
 * @spec D002-process-flow-map
 * 响应式流程地图样式
 */

/* 桌面端：横向流程图 */
@media (min-width: 992px) {
  .process-flow-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }
  
  .process-stage {
    flex-direction: row;
  }
  
  .process-module-card::after {
    /* 横向箭头 */
    right: -40px;
    width: 40px;
    height: 2px;
  }
}

/* 平板端：2列布局 */
@media (min-width: 768px) and (max-width: 991px) {
  .process-flow-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

/* 移动端：纵向瀑布流 */
@media (max-width: 767px) {
  .process-flow-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .process-module-card::after {
    /* 纵向箭头 */
    bottom: -40px;
    left: 50%;
    width: 2px;
    height: 40px;
    transform: translateX(-50%) rotate(90deg);
  }
}
```

### 替代方案

**Option B**: React Hooks (useMediaQuery)
- ❌ **缺点**: JS 计算，略有性能开销
- ✅ **优点**: 可在 JS 中动态判断
- **结论**: 当前场景 CSS 足够，无需 Hook

**Option C**: 独立移动端组件
- ❌ **缺点**: 代码重复，维护成本高
- ✅ **优点**: 完全定制
- **结论**: 响应式设计更优

---

## Decision 5: 性能优化策略

### 选择：多层次优化组合

**最终决定**: 采用多种优化手段组合，确保视图切换 < 2秒，动画 60fps。

### 优化策略清单

#### 5.1 组件优化

```typescript
/**
 * @spec D002-process-flow-map
 * React.memo 优化示例
 */
import React, { memo } from 'react';

// 1. 使用 React.memo 避免不必要的重渲染
export const ProcessFlowView = memo(() => {
  // ... component logic
});

// 2. 自定义比较函数
export const ProcessModuleCard = memo(
  ({ module }) => {
    // ... component logic
  },
  (prevProps, nextProps) => {
    return prevProps.module.id === nextProps.module.id;
  }
);
```

#### 5.2 Hook 优化

```typescript
/**
 * @spec D002-process-flow-map
 * useMemo / useCallback 优化
 */
import { useMemo, useCallback } from 'react';

const ProcessFlowView = () => {
  // 缓存计算结果
  const modulesByStage = useMemo(() => {
    return groupModulesByStage(modules);
  }, [modules]);

  // 缓存事件处理函数
  const handleStageToggle = useCallback((stageId: string) => {
    setCollapsedStages(prev => {
      const next = new Set(prev);
      if (next.has(stageId)) {
        next.delete(stageId);
      } else {
        next.add(stageId);
      }
      return next;
    });
  }, []);

  return (
    // ... JSX
  );
};
```

#### 5.3 动画性能

```css
/**
 * @spec D002-process-flow-map
 * 使用 GPU 加速的 CSS 属性
 */
.view-switch-transition {
  /* ✅ 使用 transform 和 opacity（GPU 加速） */
  transition: transform 0.3s ease, opacity 0.3s ease;
  will-change: transform, opacity;
}

/* ❌ 避免使用会触发 reflow 的属性 */
.view-switch-bad {
  transition: width 0.3s ease, height 0.3s ease; /* 性能差 */
}
```

#### 5.4 Bundle Size 控制

```typescript
/**
 * @spec D002-process-flow-map
 * 动态导入优化
 */

// ❌ 静态导入（增加初始 bundle）
// import ProcessFlowView from './ProcessFlowView';

// ✅ 动态导入（按需加载）
const ProcessFlowView = lazy(() => import('./ProcessFlowView'));

const Dashboard = () => {
  return (
    <Suspense fallback={<Spin />}>
      {activeView === 'process' && <ProcessFlowView />}
    </Suspense>
  );
};
```

### 关键性能指标

| 指标 | 目标值 | 测量方法 |
|------|--------|----------|
| 视图切换时间 | < 2秒 | Performance API |
| 首次渲染(FCP) | < 1秒 | Lighthouse |
| 动画帧率 | 60fps | Chrome DevTools |
| Bundle size 增量 | < 50KB | webpack-bundle-analyzer |
| TTI (Time to Interactive) | < 3秒 | Lighthouse |

### 性能监控代码

```typescript
/**
 * @spec D002-process-flow-map
 * 性能监控工具
 */
export function measureViewSwitch(viewType: ViewType) {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`View switch to ${viewType}: ${duration.toFixed(2)}ms`);
    
    if (duration > 2000) {
      console.warn('⚠️  View switch exceeded 2s target!');
    }
  };
}
```

---

## Decision 6: 流程阶段数据结构

### 选择：分层配置（阶段 → 模块）

**最终决定**: 创建独立的 `processStages.ts` 配置文件，定义5个阶段及其包含的模块映射。

### 理由

1. **关注点分离**: 阶段配置与模块配置分离
2. **易于维护**: 修改阶段不影响模块定义
3. **类型安全**: TypeScript 强类型约束
4. **可扩展**: 未来可添加阶段级别的配置

### 数据结构定义

```typescript
/**
 * @spec D002-process-flow-map
 * 流程阶段数据结构
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
  /** 阶段颜色主题 */
  color?: string;
}

/**
 * 5个业务流程阶段配置
 */
export const PROCESS_STAGES: ProcessStage[] = [
  {
    id: 'foundation',
    order: 1,
    title: '基础建设',
    subtitle: '数据初始化',
    moduleIds: ['basic-settings', 'system-management'],
    color: '#1890ff',
  },
  {
    id: 'supply',
    order: 2,
    title: '供应生产',
    subtitle: '物料与成本',
    moduleIds: ['bom-management', 'procurement-management', 'inventory-management'],
    color: '#52c41a',
  },
  {
    id: 'marketing',
    order: 3,
    title: '营销发布',
    subtitle: '定价与档期',
    moduleIds: ['pricing-management', 'scenario-package', 'schedule-management', 'channel-products'],
    color: '#faad14',
  },
  {
    id: 'transaction',
    order: 4,
    title: '交易履约',
    subtitle: '订单处理',
    moduleIds: ['order-management'],
    color: '#f5222d',
  },
  {
    id: 'insight',
    order: 5,
    title: '经营洞察',
    subtitle: '分析与结算',
    moduleIds: ['operations-report'],
    color: '#722ed1',
  },
];

/**
 * 根据阶段 ID 获取包含的模块
 */
export function getModulesByStage(
  stageId: string,
  allModules: ModuleCard[]
): ModuleCard[] {
  const stage = PROCESS_STAGES.find(s => s.id === stageId);
  if (!stage) return [];
  
  return allModules.filter(m => stage.moduleIds.includes(m.id));
}

/**
 * 获取模块所属的阶段
 */
export function getStageByModule(moduleId: string): ProcessStage | undefined {
  return PROCESS_STAGES.find(stage => 
    stage.moduleIds.includes(moduleId)
  );
}
```

### 与 D001 模块配置的映射

```typescript
/**
 * @spec D002-process-flow-map
 * 流程地图组件示例 - 展示阶段与模块的关联
 */
import { BUSINESS_MODULES } from '@/constants/modules'; // from D001
import { PROCESS_STAGES, getModulesByStage } from '@/constants/processStages';

const ProcessFlowView = () => {
  return (
    <div className="process-flow-view">
      {PROCESS_STAGES.map(stage => {
        const modules = getModulesByStage(stage.id, BUSINESS_MODULES);
        
        return (
          <div key={stage.id} className="process-stage">
            <div className="stage-header">
              <span className="stage-order">{stage.order}</span>
              <h4 className="stage-title">{stage.title}</h4>
              <p className="stage-subtitle">{stage.subtitle}</p>
            </div>
            
            <div className="stage-modules">
              {modules.map((module, index) => (
                <React.Fragment key={module.id}>
                  <ModuleCard module={module} />
                  {index < modules.length - 1 && <Arrow />}
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      })}
      
      <div className="process-end">END OF BUSINESS LOOP</div>
    </div>
  );
};
```

---

## Summary & Next Steps

### 研究成果总结

| 决策 | 方案 | 关键收益 |
|------|------|----------|
| **视图切换** | 条件渲染 | 性能最优，实现简单 |
| **流程箭头** | CSS + SVG 混合 | 无额外依赖，性能好 |
| **状态保持** | React state + sessionStorage | 用户体验佳，代码简洁 |
| **响应式** | Ant Design 断点 | 与现有代码一致 |
| **性能优化** | React.memo + useMemo | 满足性能目标 |
| **数据结构** | 分层配置 | 易维护，可扩展 |

### 技术栈确认

- **前端框架**: React 19.2.0 + TypeScript 5.9.3
- **UI 库**: Ant Design 6.1.0
- **状态管理**: React Hooks + sessionStorage
- **样式方案**: CSS Modules + Ant Design 断点
- **图形绘制**: CSS 伪元素 + SVG (fallback)
- **性能工具**: React.memo, useMemo, useCallback, lazy loading

### 验收标准

✅ 所有 NEEDS CLARIFICATION 项已解决  
✅ 技术方案与规格需求对齐  
✅ 性能目标可达成（< 2秒切换，60fps 动画）  
✅ 代码复用 D001 组件和逻辑  
✅ 无引入重型第三方依赖

### Phase 1 准备就绪

基于以上研究结果，现在可以进入 Phase 1 设计阶段：
1. 生成 `data-model.md` - 定义 ViewState, ProcessStage 等类型
2. 生成 `quickstart.md` - 基于研究结果的开发指南
3. 更新 agent context - 添加技术栈信息

**下一步**: 执行 Phase 1 设计任务

---

**Research Completed**: 2026-01-14  
**Total Decisions**: 6  
**All Clarifications Resolved**: ✅  
**Ready for Phase 1**: ✅
