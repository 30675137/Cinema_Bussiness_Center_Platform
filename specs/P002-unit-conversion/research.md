# Research Document: 单位换算系统

**Branch**: `P002-unit-conversion` | **Date**: 2025-12-25

## 研究任务概述

本文档记录 Phase 0 研究阶段的发现，解决技术上下文中的关键决策点。

---

## 1. 循环依赖检测算法

### 决策

采用 **深度优先搜索 (DFS) + 路径追踪** 算法进行循环依赖检测。

### 理由

1. **时间复杂度**: O(V + E)，其中 V 是单位数，E 是换算规则数。对于预估 50-200 条规则的规模完全足够
2. **可视化友好**: 能够返回具体的循环路径（如 "A→B→C→A"），满足 FR-003 要求
3. **实时检测**: 适合在创建/编辑时实时验证

### 替代方案

| 方案 | 优点 | 拒绝原因 |
|------|------|----------|
| BFS 拓扑排序 | 适合检测是否有环 | 无法返回具体循环路径 |
| Floyd-Warshall | 全图最短路径 | O(V³) 复杂度过高 |
| Union-Find | 适合检测无向图连通性 | 单位换算是有向图 |

### 实现要点

```typescript
// 前端实现 (TypeScript)
function detectCycle(rules: ConversionRule[], newRule: ConversionRule): string[] | null {
  const graph = buildGraph(rules);
  graph.addEdge(newRule.fromUnit, newRule.toUnit);

  const visited = new Set<string>();
  const path: string[] = [];

  function dfs(node: string): string[] | null {
    if (path.includes(node)) {
      const cycleStart = path.indexOf(node);
      return [...path.slice(cycleStart), node];
    }
    if (visited.has(node)) return null;

    visited.add(node);
    path.push(node);

    for (const neighbor of graph.getNeighbors(node)) {
      const cycle = dfs(neighbor);
      if (cycle) return cycle;
    }

    path.pop();
    return null;
  }

  return dfs(newRule.fromUnit);
}
```

---

## 2. 最短路径算法 (换算链计算)

### 决策

采用 **广度优先搜索 (BFS)** 实现最短路径查找，因为边权重不影响路径选择（只关心跳数最少）。

### 理由

1. **最少中间步骤**: FR-012 要求"选择最短路径（最少中间步骤）"，BFS 天然保证首次到达即最短
2. **简单高效**: 时间复杂度 O(V + E)，满足 100ms 内完成 10 组件 BOM 计算 (SC-002)
3. **路径还原**: 易于追踪换算路径，便于调试和日志

### 替代方案

| 方案 | 优点 | 拒绝原因 |
|------|------|----------|
| Dijkstra | 支持加权边 | 本场景边权相同，增加复杂度无必要 |
| A* | 启发式搜索 | 单位换算图规模小，无需启发式优化 |
| 递归 DFS | 实现简单 | 不保证最短路径 |

### 实现要点

```typescript
// 前端实现
interface ConversionPath {
  path: string[];       // ['瓶', 'ml', 'L']
  totalRate: number;    // 累积换算率
}

function findShortestPath(
  rules: ConversionRule[],
  fromUnit: string,
  toUnit: string
): ConversionPath | null {
  const graph = buildGraph(rules);
  const queue: Array<{ unit: string; path: string[]; rate: number }> = [
    { unit: fromUnit, path: [fromUnit], rate: 1 }
  ];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const { unit, path, rate } = queue.shift()!;

    if (unit === toUnit) {
      return { path, totalRate: rate };
    }

    if (visited.has(unit)) continue;
    visited.add(unit);

    for (const edge of graph.getEdges(unit)) {
      queue.push({
        unit: edge.toUnit,
        path: [...path, edge.toUnit],
        rate: rate * edge.conversionRate
      });
    }
  }

  return null;
}
```

---

## 3. 现有项目集成模式

### 决策

遵循现有 `hallstore` 模块的分层架构，新建 `unitconversion` 包。

### 理由

1. **一致性**: 与 `BomController`、`SkuController` 等现有控制器保持相同结构
2. **复用**: 复用 `com.cinema.common.dto.ApiResponse` 统一响应格式
3. **独立性**: 单独的包便于功能模块化和后续维护

### 现有架构分析

```text
backend/src/main/java/com/cinema/
├── common/
│   └── dto/ApiResponse.java      # 统一响应格式 ✓ 复用
├── hallstore/
│   ├── controller/               # REST 控制器
│   ├── service/                  # 业务逻辑
│   ├── repository/               # 数据访问（Supabase）
│   ├── domain/                   # 领域模型
│   └── dto/                      # 数据传输对象
└── unitconversion/               # 新增模块 (本功能)
```

### API 响应格式

复用 `com.cinema.common.dto.ApiResponse`:
- 成功: `{ success: true, data: T, message: "", timestamp: "..." }`
- 失败: `{ success: false, data: null, message: "错误信息", timestamp: "..." }`

---

## 4. 数据库表复用策略

### 决策

复用现有 `unit_conversions` 表（V028 迁移脚本已创建），不创建新表。

### 表结构

```sql
CREATE TABLE unit_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_unit VARCHAR(20) NOT NULL,
  to_unit VARCHAR(20) NOT NULL,
  conversion_rate DECIMAL(10,6) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('volume', 'weight', 'quantity')),
  CONSTRAINT uk_conversion_from_to UNIQUE (from_unit, to_unit)
);
```

### 数据映射

| 数据库值 | 前端显示 | 说明 |
|---------|---------|------|
| `volume` | VOLUME / 体积 | 毫升、升、瓶等 |
| `weight` | WEIGHT / 重量 | 克、千克、份等 |
| `quantity` | COUNT / 计数 | 个、打、箱等 |

### 已有数据

V028 迁移脚本已插入基础换算数据：
- 体积：ml↔l, ml↔升, l↔升
- 重量：g↔kg, g↔克, kg↔千克
- 数量：个↔打, 瓶↔箱, 片↔包, 根↔包, 杯↔个, 桶↔个

---

## 5. BOM 引用检查策略

### 决策

删除换算规则前，实时查询 `bom_components` 表检查引用关系。

### 理由

1. **数据完整性**: 防止删除被引用的换算规则导致 BOM 计算失败
2. **实时性**: 每次删除前查询，确保检查最新状态
3. **用户友好**: 返回具体的引用 BOM 列表，便于用户决策

### 实现要点

```java
// 后端检查逻辑
public boolean isConversionReferenced(String fromUnit, String toUnit) {
    // 查询所有 BOM 组件中使用此单位的记录
    return bomComponentRepository.existsByUnit(fromUnit)
        || bomComponentRepository.existsByUnit(toUnit);
}
```

### 检查范围

根据 spec 澄清，检查**所有 BOM**（包括草稿和已发布状态）：
- `bom_components` 表的 `unit` 字段
- 未来如有 BOM 版本管理，也需纳入检查

---

## 6. 舍入规则配置策略

### 决策

采用 **应用级配置**（前端常量 + 后端枚举）存储默认舍入规则，暂不新建数据库表。

### 理由

1. **简单性**: 当前仅需三种类型的默认精度，无需数据库存储
2. **性能**: 避免额外的数据库查询
3. **可扩展**: 未来如需用户自定义，可平滑迁移到数据库表

### 默认配置

```typescript
// 前端配置
const DEFAULT_PRECISION: Record<UnitCategory, number> = {
  VOLUME: 1,   // 体积类保留1位小数
  WEIGHT: 0,   // 重量类取整数
  COUNT: 0     // 计数类取整数
};
```

```java
// 后端枚举
public enum UnitCategory {
    VOLUME(1),   // 体积类保留1位小数
    WEIGHT(0),   // 重量类取整数
    QUANTITY(0); // 计数类取整数

    private final int defaultPrecision;
}
```

---

## 7. 前端组件设计

### 决策

参考 UIDEMO，采用 Ant Design 组件重构。

### 组件映射

| UIDEMO 组件 | Ant Design 替代 | 说明 |
|------------|-----------------|------|
| Tailwind 卡片 | `<Card>` | 统计卡片 |
| 自定义表格 | `<Table>` | 换算规则列表 |
| 模态框 | `<Modal>` + `<Form>` | 创建/编辑表单 |
| 搜索框 | `<Input.Search>` | 搜索过滤 |
| 可视化链 | 自定义组件 | 换算链图示 |

### 保留的交互逻辑

1. **按类别分组统计**: 三个统计卡片显示体积/重量/计数规则数
2. **实时搜索过滤**: 支持单位名称和备注搜索
3. **悬停显示操作**: 编辑/删除按钮悬停显示
4. **实时预览**: 表单中实时显示换算预览

---

## 8. 路由和菜单集成

### 决策

菜单项已存在于 `AppLayout.tsx`，仅需添加路由配置。

### 现状

- **菜单**: `/bom/conversion` 已在 `AppLayout.tsx:145-147` 配置
- **路由**: `Router.tsx` 中尚未配置对应路由

### 实现

```typescript
// Router.tsx 添加
const ConversionPage = lazy(() => import('@/pages/bom/ConversionPage'));

// 路由配置
{
  path: '/bom/conversion',
  element: (
    <ProtectedRoute>
      <AppLayout>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <ConversionPage />
          </Suspense>
        </ErrorBoundary>
      </AppLayout>
    </ProtectedRoute>
  ),
}
```

---

## 总结

| 研究项 | 决策 | 状态 |
|-------|------|------|
| 循环检测算法 | DFS + 路径追踪 | ✓ 已确定 |
| 最短路径算法 | BFS | ✓ 已确定 |
| 项目集成模式 | 遵循现有分层架构 | ✓ 已确定 |
| 数据库表 | 复用 unit_conversions | ✓ 已确定 |
| BOM 引用检查 | 实时查询 bom_components | ✓ 已确定 |
| 舍入规则配置 | 应用级配置（常量/枚举） | ✓ 已确定 |
| 前端组件设计 | Ant Design 替代 UIDEMO | ✓ 已确定 |
| 路由集成 | 添加 /bom/conversion 路由 | ✓ 已确定 |
