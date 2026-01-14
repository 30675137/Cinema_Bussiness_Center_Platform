# Research: 菜单面板替换Dashboard页面

**Feature**: D001-menu-panel  
**Date**: 2026-01-14  
**Status**: Complete

## 研究目标

本文档记录菜单面板功能实现的技术决策、最佳实践和备选方案评估。

## R1: 组件设计模式选择

### Decision
使用 **卡片式布局 (Card-based Layout)** + **Grid 响应式系统**

### Rationale
1. Ant Design Card 组件开箱即用，提供完善的样式和交互
2. CSS Grid 布局天然支持响应式设计，无需额外媒体查询
3. 卡片模式直观展示模块信息，符合用户心智模型
4. 易于扩展和维护，添加新模块只需配置数据

### Alternatives Considered
- **列表式布局**: 信息密度低，不适合展示 12 个模块
- **Tab 切换式**: 需要额外点击，增加用户操作成本
- **Accordion 手风琴**: 隐藏大部分内容，降低可发现性

---

## R2: 模块数据管理方式

### Decision
使用 **静态配置文件** (`constants/modules.ts`) 管理模块数据

### Rationale
1. 无需后端 API，减少网络请求，提升页面加载速度
2. 模块信息相对固定，变更频率低
3. 配置文件易于维护和版本控制
4. 支持 TypeScript 类型检查，避免数据错误

### Alternatives Considered
- **后端 API + 数据库**: 过度设计，增加系统复杂度和维护成本
- **Zustand 全局状态**: 数据无需跨组件共享，不需要状态管理
- **JSON 配置文件**: TypeScript 配置文件提供更好的类型安全

---

## R3: 权限过滤策略

### Decision
基于 **前端声明式权限过滤** + Zustand 用户权限状态

### Rationale
1. B端管理后台当前阶段暂不实现认证授权逻辑(符合宪法原则九)
2. 预留权限字段 `requiredPermissions`，便于后续扩展
3. 使用过滤函数 `filterModulesByPermission()` 隔离权限逻辑
4. 权限规则集中管理，易于修改和测试

### Implementation Approach
```typescript
// types/module.ts
interface ModuleCard {
  id: string;
  name: string;
  requiredPermissions?: string[]; // 可选，预留字段
  // ... 其他字段
}

// utils/permission.ts
function filterModulesByPermission(
  modules: ModuleCard[],
  userPermissions: string[]
): ModuleCard[] {
  // 当前阶段：返回所有模块（暂不过滤）
  // 后续：实现基于 requiredPermissions 的过滤逻辑
  return modules;
}
```

### Alternatives Considered
- **路由级别权限控制**: 粒度过大，无法控制模块卡片显示
- **服务端权限过滤**: 增加 API 复杂度，与当前纯前端方案不符

---

## R4: 响应式布局实现

### Decision
使用 **Ant Design Row/Col 栅格系统** + 自定义断点

### Rationale
1. Ant Design 栅格系统成熟稳定，与项目技术栈一致
2. 支持 5 个断点 (xs, sm, md, lg, xl)，覆盖主流分辨率
3. 基于 24 列栅格，灵活调整卡片宽度
4. 自动处理间距和对齐，减少手动 CSS

### Implementation
```typescript
<Row gutter={[24, 24]}>
  {modules.map(module => (
    <Col xs={24} sm={12} md={8} lg={6} xl={6} key={module.id}>
      <ModuleCard {...module} />
    </Col>
  ))}
</Row>
```

**布局适配**:
- 手机 (xs: <576px): 1 列 (24/24)
- 平板 (sm: 576-768px): 2 列 (12/24)
- 小屏笔记本 (md: 768-992px): 3 列 (8/24)
- 大屏 (lg/xl: ≥992px): 4 列 (6/24)

### Alternatives Considered
- **CSS Grid**: 需要手动编写媒体查询，增加维护成本
- **Flexbox**: 对齐和换行逻辑复杂，不如栅格系统直观

---

## R5: 卡片交互设计

### Decision
采用 **悬停效果** + **点击跳转** 的组合交互模式

### Rationale
1. 悬停效果提供视觉反馈，提升可点击性
2. 点击卡片跳转到默认页面，点击功能链接跳转到具体功能
3. 符合用户对卡片组件的操作习惯

### Implementation
```typescript
// 卡片悬停样式
const cardStyle = {
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transform: 'translateY(-4px)',
  },
};
```

### Interaction Flow
1. 鼠标悬停 → 卡片阴影加深 + 轻微上移
2. 点击卡片 → 跳转到模块默认页面
3. 点击功能链接 → 跳转到具体功能页面
4. 禁用模块 → 灰色显示 + 阻止点击

### Alternatives Considered
- **长按触发菜单**: 移动端交互模式，不适合 PC 管理后台
- **双击展开详情**: 增加用户学习成本，违背直觉

---

## R6: 性能优化策略

### Decision
使用 **React.memo** + **虚拟列表 (可选)**

### Rationale
1. 12 个模块卡片数量适中，React.memo 足够优化重渲染
2. 虚拟列表适用于 100+ 项，当前场景无需引入
3. 图标使用 Ant Design Icons (Tree-shaking 友好)
4. 静态配置数据，无需缓存策略

### Implementation
```typescript
// ModuleCard.tsx
export const ModuleCard = React.memo<ModuleCardProps>(({ module }) => {
  // ...组件实现
});
```

### Performance Targets (from spec)
- 页面加载时间 < 2秒 ✅ (无网络请求，纯静态渲染)
- 卡片点击响应 < 300ms ✅ (React Router 客户端路由)
- 首次渲染 FCP < 1秒 ✅ (组件数量少，逻辑简单)

### Alternatives Considered
- **代码分割 (Code Splitting)**: 组件体积小，分割收益不明显
- **图片懒加载**: 模块图标为 SVG Icon，无需懒加载

---

## R7: 模块图标选择

### Decision
使用 **Ant Design Icons** 中的语义化图标

### Rationale
1. 与项目 UI 组件库一致，视觉风格统一
2. SVG 图标，矢量缩放，无模糊问题
3. Tree-shaking 支持，仅打包使用的图标
4. 图标语义化，易于理解模块功能

### Icon Mapping
| 模块 | 图标 | 语义 |
|------|------|------|
| 基础设置 | ControlOutlined | 控制/配置 |
| 商品管理 | ShoppingOutlined | 购物/商品 |
| BOM管理 | ReconciliationOutlined | 配方/清单 |
| 场景包管理 | GoldOutlined | 套餐/礼品 |
| 价格管理 | DollarOutlined | 价格/金钱 |
| 采购管理 | ShoppingCartOutlined | 采购/购物车 |
| 库存管理 | DatabaseOutlined | 数据库/库存 |
| 档期排期 | CalendarOutlined | 日历/排期 |
| 渠道配置 | CoffeeOutlined | 渠道/饮品 |
| 订单管理 | FileTextOutlined | 订单/文档 |
| 运营报表 | BarChartOutlined | 图表/分析 |
| 系统管理 | SettingOutlined | 设置/系统 |

### Alternatives Considered
- **自定义 SVG 图标**: 增加设计成本，与系统风格不统一
- **图片图标**: 增加资源体积，不支持动态着色

---

## R8: 测试策略

### Decision
**单元测试 (必须)** + **E2E 测试 (可选)**

### Rationale
1. 符合宪法原则三 (测试驱动开发)
2. E2E 测试可选，功能相对简单，单元测试覆盖核心逻辑即可
3. 使用 Vitest + React Testing Library 进行组件测试

### Test Coverage
**必须测试**:
- ModuleCard 组件渲染测试
- 点击跳转行为测试
- 权限过滤逻辑测试
- 响应式布局测试 (不同屏幕尺寸)

**可选测试 (E2E)**:
- 用户访问首页 → 看到所有模块卡片
- 点击模块卡片 → 跳转到对应页面
- 点击功能链接 → 跳转到具体功能

### Test Example
```typescript
describe('ModuleCard', () => {
  it('should render module name and description', () => {
    const module = { name: '商品管理', description: '管理商品信息' };
    render(<ModuleCard module={module} />);
    expect(screen.getByText('商品管理')).toBeInTheDocument();
  });

  it('should navigate when clicked', () => {
    const module = { id: 'products', defaultPath: '/products' };
    const navigate = vi.fn();
    render(<ModuleCard module={module} />);
    fireEvent.click(screen.getByTestId('module-card'));
    expect(navigate).toHaveBeenCalledWith('/products');
  });
});
```

---

## 总结

所有技术决策均基于以下原则:
1. **复用现有技术栈**: Ant Design + React Router
2. **简单优先**: 静态配置 > 动态 API
3. **性能优先**: 避免不必要的优化，专注核心体验
4. **可扩展性**: 预留权限字段，便于后续演进
5. **符合宪法**: 遵循项目技术规范和架构约束

所有 NEEDS CLARIFICATION 项已解决，可进入 Phase 1 设计阶段。
