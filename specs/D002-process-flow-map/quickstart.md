# Quickstart: 业务端到端流程地图开发指南

**Feature**: D002-process-flow-map  
**Date**: 2026-01-14  
**Estimated Time**: 4-6 hours

## 目录

1. [前置条件](#前置条件)
2. [开发环境](#开发环境)
3. [开发步骤](#开发步骤)
4. [测试指南](#测试指南)
5. [常见问题](#常见问题)
6. [验收标准](#验收标准)

---

## 前置条件

### 1. 确认 D001 功能已完成

D002 依赖 D001 的组件和数据结构，请确认以下文件已存在：

```bash
# 检查 D001 关键文件
ls frontend/src/components/common/ModuleCard.tsx
ls frontend/src/types/module.ts
ls frontend/src/constants/modules.ts
ls frontend/src/pages/Dashboard/index.tsx
```

如果文件不存在，请先完成 D001 功能开发。

### 2. 确认技术栈版本

```bash
# 检查 Node.js 版本 (>= 18)
node -v

# 检查 npm 版本 (>= 9)
npm -v

# 进入前端目录
cd frontend

# 检查依赖版本
npm list react react-dom typescript antd
```

预期输出：
```text
├── react@19.2.0
├── react-dom@19.2.0
├── typescript@5.9.3
└── antd@6.1.0
```

### 3. 确认 Git 分支

```bash
# 确认当前在 D002 分支
git branch --show-current
# 输出: D002-process-flow-map

# 如果不在，切换分支
git checkout D002-process-flow-map
```

---

## 开发环境

### 1. 安装依赖

```bash
cd frontend
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问: http://localhost:5173

### 3. 启动测试监听

```bash
# 新终端
npm run test:watch
```

---

## 开发步骤

### Phase 1: 类型定义与配置 (30min)

#### Step 1.1: 创建视图类型定义

创建文件: `frontend/src/types/view.ts`

```typescript
/**
 * @spec D002-process-flow-map
 * 视图类型定义
 */

export enum ViewType {
  PANORAMA = 'panorama',
  PROCESS = 'process',
}

export interface ViewState {
  activeView: ViewType;
  collapsedLanes: Set<string>;
  collapsedStages: Set<string>;
  scrollPosition: {
    panorama: number;
    process: number;
  };
}

export interface ProcessStage {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  moduleIds: string[];
  color?: string;
  collapsible: boolean;
  defaultCollapsed: boolean;
}
```

#### Step 1.2: 创建流程阶段配置

创建文件: `frontend/src/constants/processStages.ts`

```typescript
/**
 * @spec D002-process-flow-map
 * 流程阶段配置
 */
import type { ProcessStage } from '@/types/view';

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

#### Step 1.3: 创建视图状态工具

创建文件: `frontend/src/utils/viewState.ts`

```typescript
/**
 * @spec D002-process-flow-map
 * 视图状态管理工具
 */
import { ViewType, ViewState } from '@/types/view';

const SESSION_KEY = 'dashboard-view-state';

export function saveViewState(state: Partial<ViewState>): void {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    const current = saved ? JSON.parse(saved) : {};
    
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      ...current,
      activeView: state.activeView,
      collapsedLanes: state.collapsedLanes ? Array.from(state.collapsedLanes) : current.collapsedLanes,
      collapsedStages: state.collapsedStages ? Array.from(state.collapsedStages) : current.collapsedStages,
    }));
  } catch (e) {
    console.error('Failed to save view state:', e);
  }
}

export function loadViewState(): Partial<ViewState> | null {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (!saved) return null;
    
    const parsed = JSON.parse(saved);
    return {
      activeView: parsed.activeView || ViewType.PANORAMA,
      collapsedLanes: new Set(parsed.collapsedLanes || []),
      collapsedStages: new Set(parsed.collapsedStages || []),
    };
  } catch (e) {
    console.error('Failed to load view state:', e);
    return null;
  }
}

export function getModulesByStage(stageId: string, allModules: ModuleCard[]) {
  const stage = PROCESS_STAGES.find(s => s.id === stageId);
  if (!stage) return [];
  return allModules.filter(m => stage.moduleIds.includes(m.id));
}
```

**验收**: 运行 TypeScript 编译，无错误

```bash
npm run type-check
```

---

### Phase 2: 视图切换组件 (45min)

#### Step 2.1: 编写测试 (TDD)

创建文件: `frontend/src/components/common/ViewSwitcher.test.tsx`

```typescript
/**
 * @spec D002-process-flow-map
 * ViewSwitcher 组件测试
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import ViewSwitcher from './ViewSwitcher';
import { ViewType } from '@/types/view';

describe('ViewSwitcher', () => {
  test('renders two view buttons', () => {
    const onViewChange = vi.fn();
    render(<ViewSwitcher activeView={ViewType.PANORAMA} onViewChange={onViewChange} />);
    
    expect(screen.getByText('全景视图')).toBeInTheDocument();
    expect(screen.getByText('流程视图')).toBeInTheDocument();
  });

  test('highlights active view', () => {
    const onViewChange = vi.fn();
    const { container } = render(
      <ViewSwitcher activeView={ViewType.PANORAMA} onViewChange={onViewChange} />
    );
    
    const panoramaBtn = screen.getByText('全景视图').closest('button');
    expect(panoramaBtn).toHaveClass('active');
  });

  test('calls onViewChange when clicking view button', () => {
    const onViewChange = vi.fn();
    render(<ViewSwitcher activeView={ViewType.PANORAMA} onViewChange={onViewChange} />);
    
    fireEvent.click(screen.getByText('流程视图'));
    expect(onViewChange).toHaveBeenCalledWith(ViewType.PROCESS);
  });
});
```

**运行测试（预期失败）**:
```bash
npm test -- ViewSwitcher.test.tsx
# 预期: ❌ 测试失败（组件尚未实现）
```

#### Step 2.2: 实现组件

创建文件: `frontend/src/components/common/ViewSwitcher.tsx`

```typescript
/**
 * @spec D002-process-flow-map
 * 视图切换组件 - 标签页式按钮组
 */
import React from 'react';
import { Button } from 'antd';
import { ViewType } from '@/types/view';
import './ViewSwitcher.css';

interface ViewSwitcherProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ activeView, onViewChange }) => {
  return (
    <div className="view-switcher">
      <Button
        type={activeView === ViewType.PANORAMA ? 'primary' : 'default'}
        onClick={() => onViewChange(ViewType.PANORAMA)}
        className={activeView === ViewType.PANORAMA ? 'active' : ''}
      >
        全景视图
      </Button>
      <Button
        type={activeView === ViewType.PROCESS ? 'primary' : 'default'}
        onClick={() => onViewChange(ViewType.PROCESS)}
        className={activeView === ViewType.PROCESS ? 'active' : ''}
      >
        流程视图
      </Button>
    </div>
  );
};

export default ViewSwitcher;
```

创建样式文件: `frontend/src/components/common/ViewSwitcher.css`

```css
/**
 * @spec D002-process-flow-map
 * 视图切换组件样式
 */
.view-switcher {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.view-switcher button {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.view-switcher button.active {
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}
```

**运行测试（预期通过）**:
```bash
npm test -- ViewSwitcher.test.tsx
# 预期: ✅ All tests passed
```

---

### Phase 3: 泳道视图组件 (30min)

#### Step 3.1: 拆分现有 Dashboard

将 `pages/Dashboard/index.tsx` 中的泳道视图逻辑拆分到新组件。

创建文件: `frontend/src/components/dashboard/SwimlaneView.tsx`

```typescript
/**
 * @spec D002-process-flow-map
 * 泳道视图组件（从 Dashboard 拆分）
 */
import React from 'react';
import ModuleCard from '@/components/common/ModuleCard';
import { BUSINESS_MODULES } from '@/constants/modules';

const SwimlaneView: React.FC = () => {
  // 将现有 Dashboard 的泳道渲染逻辑移到这里
  return (
    <div className="swimlane-view">
      {/* 按泳道分组渲染模块 */}
      <div className="swimlane-group">
        {BUSINESS_MODULES.map(module => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>
    </div>
  );
};

export default SwimlaneView;
```

**注意**: 具体实现需根据 D001 现有代码调整。

---

### Phase 4: 流程视图组件 (60min)

#### Step 4.1: 编写测试

创建文件: `frontend/src/components/dashboard/ProcessFlowView.test.tsx`

```typescript
/**
 * @spec D002-process-flow-map
 * ProcessFlowView 组件测试
 */
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import ProcessFlowView from './ProcessFlowView';

describe('ProcessFlowView', () => {
  test('renders 5 process stages', () => {
    render(<ProcessFlowView />);
    
    expect(screen.getByText('基础建设')).toBeInTheDocument();
    expect(screen.getByText('供应生产')).toBeInTheDocument();
    expect(screen.getByText('营销发布')).toBeInTheDocument();
    expect(screen.getByText('交易履约')).toBeInTheDocument();
    expect(screen.getByText('经营洞察')).toBeInTheDocument();
  });

  test('renders stage subtitles', () => {
    render(<ProcessFlowView />);
    
    expect(screen.getByText('数据初始化')).toBeInTheDocument();
    expect(screen.getByText('物料与成本')).toBeInTheDocument();
  });

  test('renders module cards within stages', () => {
    render(<ProcessFlowView />);
    
    // 应该渲染所有 12 个业务模块
    const cards = screen.getAllByTestId('module-card');
    expect(cards.length).toBeGreaterThanOrEqual(12);
  });
});
```

#### Step 4.2: 实现组件

创建文件: `frontend/src/components/dashboard/ProcessFlowView.tsx`

```typescript
/**
 * @spec D002-process-flow-map
 * 流程视图组件 - 端到端业务流程地图
 */
import React from 'react';
import { Collapse } from 'antd';
import ModuleCard from '@/components/common/ModuleCard';
import { PROCESS_STAGES } from '@/constants/processStages';
import { BUSINESS_MODULES } from '@/constants/modules';
import { getModulesByStage } from '@/utils/viewState';
import './ProcessFlowView.css';

const { Panel } = Collapse;

const ProcessFlowView: React.FC = () => {
  return (
    <div className="process-flow-view">
      <h2 className="process-title">业务端到端流程地图</h2>
      
      {PROCESS_STAGES.map((stage, stageIndex) => {
        const modules = getModulesByStage(stage.id, BUSINESS_MODULES);
        
        return (
          <div key={stage.id} className="process-stage">
            {/* 阶段头部 */}
            <div className="stage-header" style={{ borderColor: stage.color }}>
              <span className="stage-order">{stage.order}</span>
              <div className="stage-info">
                <h4 className="stage-title">{stage.title}</h4>
                <p className="stage-subtitle">{stage.subtitle}</p>
              </div>
            </div>
            
            {/* 模块卡片 */}
            <div className="stage-modules">
              {modules.map((module, moduleIndex) => (
                <React.Fragment key={module.id}>
                  <ModuleCard module={module} data-testid="module-card" />
                  
                  {/* 箭头连接 */}
                  {moduleIndex < modules.length - 1 && (
                    <div className="flow-arrow">
                      <div className="arrow-line" />
                      <div className="arrow-head" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            
            {/* 阶段间连接线 */}
            {stageIndex < PROCESS_STAGES.length - 1 && (
              <div className="stage-connector">
                <div className="connector-line" />
                <div className="connector-arrow" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProcessFlowView;
```

创建样式文件: `frontend/src/components/dashboard/ProcessFlowView.css`

```css
/**
 * @spec D002-process-flow-map
 * 流程视图样式
 */
.process-flow-view {
  padding: 24px;
}

.process-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 32px;
  text-align: center;
}

/* 流程阶段 */
.process-stage {
  margin-bottom: 48px;
  position: relative;
}

.stage-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
  border-left: 4px solid;
  margin-bottom: 24px;
}

.stage-order {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  font-size: 20px;
  font-weight: 700;
  color: #1890ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stage-info {
  flex: 1;
}

.stage-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.stage-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* 模块容器 */
.stage-modules {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
}

/* 流程箭头 */
.flow-arrow {
  position: relative;
  width: 40px;
  height: 2px;
  background: #1890ff;
  flex-shrink: 0;
}

.arrow-head {
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid #1890ff;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
}

/* 阶段连接线 */
.stage-connector {
  position: absolute;
  bottom: -48px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.connector-line {
  width: 2px;
  height: 40px;
  background: #1890ff;
}

.connector-arrow {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid #1890ff;
}

/* 响应式 */
@media (max-width: 768px) {
  .stage-modules {
    flex-direction: column;
  }
  
  .flow-arrow {
    width: 2px;
    height: 40px;
    transform: rotate(90deg);
  }
}
```

**运行测试**:
```bash
npm test -- ProcessFlowView.test.tsx
# 预期: ✅ All tests passed
```

---

### Phase 5: 重构 Dashboard 页面 (30min)

修改文件: `frontend/src/pages/Dashboard/index.tsx`

```typescript
/**
 * @spec D002-process-flow-map
 * Dashboard 页面 - 视图容器
 */
import React, { useState, useEffect } from 'react';
import ViewSwitcher from '@/components/common/ViewSwitcher';
import SwimlaneView from '@/components/dashboard/SwimlaneView';
import ProcessFlowView from '@/components/dashboard/ProcessFlowView';
import { ViewType } from '@/types/view';
import { saveViewState, loadViewState } from '@/utils/viewState';

const Dashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>(() => {
    const saved = loadViewState();
    return saved?.activeView || ViewType.PANORAMA;
  });

  useEffect(() => {
    saveViewState({ activeView });
  }, [activeView]);

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
  };

  return (
    <div className="dashboard-container">
      <ViewSwitcher activeView={activeView} onViewChange={handleViewChange} />
      
      {activeView === ViewType.PANORAMA && <SwimlaneView />}
      {activeView === ViewType.PROCESS && <ProcessFlowView />}
    </div>
  );
};

export default Dashboard;
```

---

### Phase 6: 集成测试与调试 (30min)

#### 手动测试检查清单

访问 http://localhost:5173/dashboard，逐项验证：

- [ ] 页面顶部显示两个按钮："全景视图" 和 "流程视图"
- [ ] 默认显示全景视图（D001 的泳道布局）
- [ ] 点击"流程视图"按钮，切换到流程地图
- [ ] 流程地图显示 5 个阶段，每个阶段有标题和副标题
- [ ] 流程地图显示 12 个业务模块卡片
- [ ] 模块卡片之间有蓝色箭头连接
- [ ] 阶段之间有纵向连接线
- [ ] 点击"全景视图"按钮，切换回泳道视图
- [ ] 刷新页面，保持上次选择的视图

#### 运行自动化测试

```bash
# 运行所有单元测试
npm test

# 运行覆盖率检查
npm run test:coverage

# 预期覆盖率
# - ViewSwitcher: 100%
# - ProcessFlowView: > 80%
```

---

## 测试指南

### 单元测试

```bash
# 运行所有测试
npm test

# 运行特定文件
npm test -- ViewSwitcher.test.tsx

# 监听模式
npm run test:watch

# 覆盖率报告
npm run test:coverage
```

### E2E 测试（可选）

创建文件: `frontend/tests/e2e/view-switching.spec.ts`

```typescript
/**
 * @spec D002-process-flow-map
 * E2E 测试 - 视图切换
 */
import { test, expect } from '@playwright/test';

test.describe('Dashboard View Switching', () => {
  test('should switch between panorama and process views', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    
    // 默认显示全景视图
    await expect(page.locator('.swimlane-view')).toBeVisible();
    
    // 切换到流程视图
    await page.click('text=流程视图');
    await expect(page.locator('.process-flow-view')).toBeVisible();
    await expect(page.locator('.process-title')).toHaveText('业务端到端流程地图');
    
    // 验证5个阶段
    await expect(page.locator('.process-stage')).toHaveCount(5);
    
    // 切换回全景视图
    await page.click('text=全景视图');
    await expect(page.locator('.swimlane-view')).toBeVisible();
  });
});
```

运行 E2E 测试:
```bash
npx playwright test tests/e2e/view-switching.spec.ts
```

---

## 常见问题

### Q1: TypeScript 类型错误

**问题**: `Cannot find module '@/types/view'`

**解决**:
```bash
# 检查 tsconfig.json 中的路径别名配置
# 确保包含:
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Q2: sessionStorage 数据丢失

**问题**: 刷新页面后视图选择不保留

**解决**: 检查浏览器 DevTools > Application > Session Storage，确认数据已保存：
```text
Key: dashboard-view-state
Value: {"activeView":"process"}
```

### Q3: 箭头显示异常

**问题**: 流程箭头位置错位或不显示

**解决**: 检查 CSS `position` 和 `flex` 布局，确保：
- `.flow-arrow` 使用 `position: relative`
- `.arrow-head` 使用 `position: absolute`
- 父容器 `.stage-modules` 使用 `display: flex`

### Q4: 模块卡片顺序错误

**问题**: 流程阶段中的模块顺序与预期不符

**解决**: 检查 `processStages.ts` 中的 `moduleIds` 顺序是否正确：
```typescript
{
  id: 'supply',
  moduleIds: ['bom-management', 'procurement-management', 'inventory-management'], // 顺序重要
}
```

---

## 验收标准

### 功能验收

- [ ] **FR-001**: 流程地图显示 5 个业务阶段
- [ ] **FR-002**: 标签页式视图切换按钮正常工作
- [ ] **FR-003**: 流程箭头正确连接所有模块
- [ ] **FR-004**: 阶段标题和副标题正确显示
- [ ] **FR-005**: 刷新页面后保持视图选择
- [ ] **FR-006**: 响应式布局在桌面端和移动端均正常

### 质量验收

- [ ] **代码归属**: 所有新文件包含 `@spec D002-process-flow-map` 注释
- [ ] **TypeScript**: 无类型错误，`npm run type-check` 通过
- [ ] **测试覆盖**: 单元测试覆盖率 > 80%
- [ ] **代码规范**: ESLint 和 Prettier 检查通过
- [ ] **性能**: 视图切换时间 < 2秒

### 提交验收

```bash
# 检查所有文件已添加 @spec 标识
grep -r "@spec D002-process-flow-map" frontend/src/

# 运行所有检查
npm run lint
npm run type-check
npm test

# 提交代码
git add .
git commit -m "feat(D002): 实现业务端到端流程地图功能

- 新增流程视图组件 ProcessFlowView
- 新增视图切换组件 ViewSwitcher
- 重构 Dashboard 为视图容器
- 添加 5 个流程阶段配置
- 实现状态保持（sessionStorage）

Closes: D002-process-flow-map"
```

---

## 下一步

完成 D002 开发后：

1. **合并到 dev 分支**:
```bash
git checkout dev
git merge D002-process-flow-map
```

2. **部署到测试环境**: 参考 `docs/12-开发运维/` 文档

3. **用户验收测试**: 邀请产品经理验收功能

---

**Quickstart Guide Completed**: 2026-01-14  
**Estimated Development Time**: 4-6 hours  
**Difficulty Level**: Medium  
**Prerequisites**: D001 completed
