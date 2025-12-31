# Scrum 数据模型与 Spec 的关系

**@spec T004-lark-project-management**

## 问题

**Scrum 数据结构（Epic/Story/Task/Sprint）与项目的 Spec（规格标识符）是什么关系？**

## 核心理解

### Spec 是什么？

**Spec（规格标识符）** 是影院商品管理中台项目的核心组织方式：

- **格式**: `<模块字母><三位数字>-<slug>`
- **示例**: `I003-inventory-query`（库存查询）、`P001-spu-management`（商品管理）
- **作用**:
  - 功能分支与开发工作的唯一标识符
  - 代码归属的追溯依据（通过 `@spec` 注释）
  - 需求文档的组织方式（`specs/<specId>/spec.md`）

### Scrum 数据结构是什么？

**Scrum** 是敏捷开发的项目管理框架：

- **Epic**（史诗）：大型功能目标
- **User Story**（用户故事）：可交付的用户价值
- **Task**（任务）：具体开发工作
- **Sprint**（迭代）：时间盒（1-4周）

---

## 关系模型

### 1. 一对多映射：Spec ↔ Epic/Story/Task

**一个 Spec 可以对应多个 Scrum 工作项**

```
Spec: I003-inventory-query (库存查询)
  ↓
Epic: EPIC-001 "库存管理系统"
  ├── Story: STORY-042 "用户可以查看库存列表"
  │     ├── Task: TASK-128 "实现库存查询 API" (@spec I003)
  │     ├── Task: TASK-129 "实现前端列表组件" (@spec I003)
  │     └── Task: TASK-130 "编写单元测试" (@spec I003)
  ├── Story: STORY-043 "用户可以筛选库存记录"
  │     ├── Task: TASK-131 "实现筛选逻辑" (@spec I003)
  │     └── Task: TASK-132 "实现筛选 UI" (@spec I003)
  └── Story: STORY-044 "用户可以导出库存数据"
        └── Task: TASK-133 "实现 Excel 导出" (@spec I003)
```

**关键点**:
- ✅ 一个 Spec 可以拆分为多个 Story
- ✅ 每个 Story 可以有多个 Task
- ✅ 所有 Task 的代码都标注 `@spec I003`

---

### 2. Spec 是"业务需求"，Scrum 是"项目管理"

| 维度 | Spec | Scrum |
|-----|------|-------|
| **性质** | 业务需求标识符 | 项目管理方法 |
| **粒度** | 功能模块级别 | Epic → Story → Task 层级 |
| **生命周期** | 长期存在（代码归属） | 短期迭代（Sprint 2-4周） |
| **关注点** | What（做什么功能） | How + When（如何做、何时完成） |
| **文档** | `specs/<specId>/spec.md` | Sprint Backlog, Burndown Chart |

**示例对比**:

**Spec 视角**（业务需求）:
- `I003-inventory-query`: 实现库存查询功能
- 包含需求文档、API 契约、验收标准
- 代码中所有文件都标注 `@spec I003`

**Scrum 视角**（项目管理）:
- Epic: "库存管理系统"
- Story: "用户可以查看库存列表"（5 个故事点）
- Task: "实现库存查询 API"（8 小时工作量）
- Sprint: "Sprint 12"（2025-01-06 ~ 2025-01-19）

---

### 3. 数据表中的关联字段

#### 飞书表字段设计

**Epic 表**:
```yaml
字段:
  - Epic ID: EPIC-001
  - Epic 标题: "库存管理系统"
  - 关联规格: "I003, I004, I005"  # 一个 Epic 可以关联多个 Spec
  - 状态: 🚀 进行中
```

**UserStory 表**:
```yaml
字段:
  - Story ID: STORY-042
  - Story 标题: "用户可以查看库存列表"
  - 所属 Epic: EPIC-001 (关联字段)
  - 关联规格: "I003"  # 单个 Story 通常只关联一个 Spec
  - 所属 Sprint: SPR-012 (关联字段)
  - Story 点数: 5
```

**Task 表**:
```yaml
字段:
  - Task ID: TASK-128
  - 任务标题: "实现库存查询 API"
  - 所属 Story: STORY-042 (关联字段)
  - 关联规格: 继承自 Story (I003)  # 可选，通常不直接填写
  - 负责人: 张三
  - 工作量: 8 小时
```

---

### 4. 实际工作流程

#### 场景 1：新功能开发（从 Spec 到 Scrum）

**步骤 1: 创建 Spec**
```bash
# Product Owner 定义需求
specs/I006-inventory-adjustment/spec.md

# Spec 内容:
- 功能: 库存调整审批
- 验收标准: 管理员可以审批库存调整申请
- API: POST /api/inventory/adjustments/:id/approve
```

**步骤 2: 创建 Epic**
```bash
lark-pm epic create \
  --title "库存调整审批系统" \
  --spec-id I006 \
  --business-value high
```

**步骤 3: 拆分 User Stories**
```bash
# Story 1
lark-pm story create \
  --title "管理员可以查看待审批的库存调整单" \
  --epic EPIC-005 \
  --spec-id I006 \
  --points 5

# Story 2
lark-pm story create \
  --title "管理员可以审批通过调整单" \
  --epic EPIC-005 \
  --spec-id I006 \
  --points 3

# Story 3
lark-pm story create \
  --title "管理员可以拒绝调整单" \
  --epic EPIC-005 \
  --spec-id I006 \
  --points 2
```

**步骤 4: 规划 Sprint**
```bash
# 将 Story 1 和 Story 2 分配到 Sprint 12
lark-pm story update --story-id STORY-052 --sprint SPR-012
lark-pm story update --story-id STORY-053 --sprint SPR-012

# Story 3 留在 Backlog（下个 Sprint 再做）
```

**步骤 5: 拆分 Tasks**
```bash
# 为 Story 1 创建 Tasks
lark-pm task create \
  --title "实现获取待审批列表 API" \
  --story STORY-052 \
  --estimated 6 \
  --assignee "张三"

lark-pm task create \
  --title "实现前端审批列表组件" \
  --story STORY-052 \
  --estimated 8 \
  --assignee "李四"
```

**步骤 6: 开发（代码绑定 Spec）**
```typescript
/**
 * @spec I006-inventory-adjustment
 * 库存调整审批 API
 */
@RestController
@RequestMapping("/api/inventory/adjustments")
export class InventoryAdjustmentController {
  // ...
}
```

---

#### 场景 2：Sprint 规划会议

**会议目标**: 决定 Sprint 12 要完成哪些工作

**输入**:
- Product Backlog（所有未完成的 Story，按优先级排序）
- 团队速度（Velocity）：最近 3 个 Sprint 平均完成 40 个故事点

**过程**:
```bash
# 1. 查看 Backlog
lark-pm backlog list --priority p0,p1

# 输出:
# STORY-042 (I003) | 用户可以查看库存列表 | 5 点 | P0
# STORY-052 (I006) | 管理员可以查看待审批单 | 5 点 | P0
# STORY-053 (I006) | 管理员可以审批通过调整单 | 3 点 | P1
# STORY-055 (P001) | 商品可以批量导入 | 8 点 | P1
# ...

# 2. 团队承诺 Sprint 12 完成 42 个故事点
lark-pm sprint create \
  --name "Sprint 12" \
  --start 2025-01-06 \
  --end 2025-01-19 \
  --planned-points 42

# 3. 将 Story 分配到 Sprint
lark-pm story update --story-id STORY-042 --sprint SPR-012
lark-pm story update --story-id STORY-052 --sprint SPR-012
lark-pm story update --story-id STORY-053 --sprint SPR-012
lark-pm story update --story-id STORY-055 --sprint SPR-012
# 总计: 5 + 5 + 3 + 8 = 21 点（还可以再加 21 点的 Story）
```

**输出**:
- Sprint 12 的 Sprint Backlog
- 每个 Story 关联的 Spec（I003, I006, P001）
- 团队开始开发，所有代码标注对应的 `@spec`

---

#### 场景 3：跨 Spec 的 Epic

**问题**: 一个 Epic 可以关联多个 Spec 吗？

**答案**: ✅ 可以！

**示例**:
```
Epic: EPIC-010 "商品库存一体化系统"
  ├── Story: STORY-101 "商品 SKU 管理" → @spec P002
  ├── Story: STORY-102 "库存同步机制" → @spec I007
  ├── Story: STORY-103 "库存预警规则" → @spec I008
  └── Story: STORY-104 "商品库存报表" → @spec E001

关联规格: "P002, I007, I008, E001"
```

**飞书表数据**:
```yaml
Epic:
  Epic ID: EPIC-010
  Epic 标题: "商品库存一体化系统"
  关联规格: "P002, I007, I008, E001"  # 多个 Spec，逗号分隔
  状态: 🚀 进行中
```

---

### 5. 数据查询示例

#### 查询 1：某个 Spec 的所有工作项

```bash
# 查询 I003 规格的所有 Story 和 Task
lark-pm story list --spec-id I003
lark-pm task list --spec-id I003

# 输出:
# Stories (I003):
#   - STORY-042: 用户可以查看库存列表 (5 点, Sprint 12)
#   - STORY-043: 用户可以筛选库存记录 (3 点, Sprint 13)
#   - STORY-044: 用户可以导出库存数据 (5 点, Backlog)
#
# Tasks (I003):
#   - TASK-128: 实现库存查询 API (Story-042)
#   - TASK-129: 实现前端列表组件 (Story-042)
#   - TASK-130: 编写单元测试 (Story-042)
#   - ...
```

#### 查询 2：某个 Sprint 包含哪些 Spec

```bash
# 查询 Sprint 12 的所有 Story
lark-pm story list --sprint SPR-012

# 输出:
# STORY-042 (I003) | 用户可以查看库存列表 | 5 点
# STORY-052 (I006) | 管理员可以查看待审批单 | 5 点
# STORY-053 (I006) | 管理员可以审批通过调整单 | 3 点
# STORY-055 (P001) | 商品可以批量导入 | 8 点

# 结论: Sprint 12 涉及 3 个 Spec (I003, I006, P001)
```

#### 查询 3：某个 Sprint 的进度（按 Spec 分组）

```bash
lark-pm sprint stats --sprint-id SPR-012 --group-by spec

# 输出:
# Sprint 12 统计 (按 Spec 分组):
# ┌─────────┬────────┬──────────┬──────────┬──────────┐
# │ Spec ID │ Stories│ 计划点数 │ 完成点数 │ 进度     │
# ├─────────┼────────┼──────────┼──────────┼──────────┤
# │ I003    │ 1      │ 5        │ 5        │ 100%     │
# │ I006    │ 2      │ 8        │ 5        │ 62.5%    │
# │ P001    │ 1      │ 8        │ 3        │ 37.5%    │
# └─────────┴────────┴──────────┴──────────┴──────────┘
# 总计:     4        21         13         61.9%
```

---

### 6. 关键设计决策

#### 决策 1：Spec 字段是"文本"而非"关联字段"

**原因**:
- Spec 是标识符，不是数据实体（没有 Spec 表）
- Spec 存在于文件系统（`specs/<specId>/spec.md`）
- 使用文本字段方便快速搜索和过滤

**实现**:
```typescript
// Epic 表字段
{
  field_name: '关联规格',
  type: 1,               // 多行文本
  ui_type: 'Text',
}

// 查询时按文本匹配
lark-pm epic list --spec-id I003  // 查找包含 "I003" 的 Epic
```

#### 决策 2：Story 继承 Epic 的 Spec，Task 继承 Story 的 Spec

**规则**:
- Epic 关联的 Spec → 该 Epic 下所有 Story 默认继承
- Story 可以覆盖 Epic 的 Spec（跨 Spec 的 Epic）
- Task 不需要单独填写 Spec（从 Story 自动继承）

**示例**:
```yaml
Epic: EPIC-001
  关联规格: "I003, I004"

  ├── Story: STORY-042
  │     关联规格: "I003" (继承自 Epic)
  │     ├── Task: TASK-128 (继承 I003)
  │     └── Task: TASK-129 (继承 I003)
  │
  └── Story: STORY-043
        关联规格: "I004" (继承自 Epic)
        └── Task: TASK-130 (继承 I004)
```

#### 决策 3：Bug 和技术债也关联 Spec

**原因**:
- Bug 和技术债也属于某个功能模块
- 代码修复时需要标注 `@spec`
- 统计时可以按 Spec 分组查看质量指标

**示例**:
```bash
# 创建 Bug（关联 Spec）
lark-pm bug create \
  --title "库存查询接口返回 500 错误" \
  --spec-id I003 \
  --severity critical \
  --sprint SPR-012

# 创建技术债（关联 Spec）
lark-pm debt create \
  --title "优化库存查询 SQL 性能" \
  --spec-id I003 \
  --severity medium \
  --sprint SPR-013
```

---

## 总结

### 核心关系

```
Spec (业务需求标识符)
  ↓ 一对多
Epic (大型功能目标)
  ↓ 一对多
UserStory (可交付的用户价值)
  ↓ 一对多
Task (具体开发工作)
  ↓ 代码归属
源代码 (@spec 注释)
```

### 两种视角

| 视角 | 关注点 | 工具 |
|-----|--------|------|
| **Spec 视角** | 功能需求、代码归属、长期追溯 | `specs/` 目录、`@spec` 注释、Git 分支 |
| **Scrum 视角** | 项目管理、迭代规划、团队协作 | lark-pm、Sprint Backlog、燃尽图 |

### 关键字段映射

| Scrum 实体 | 关联 Spec 字段 | 字段类型 | 必需 |
|-----------|---------------|---------|------|
| Epic | 关联规格 | 文本（多个，逗号分隔） | ❌ 可选 |
| UserStory | 关联规格 | 文本（单个） | ❌ 可选（可继承 Epic） |
| Task | - | - | ❌ 无需填写（继承 Story） |
| Bug | 关联规格 | 文本（单个） | ❌ 可选 |
| TechnicalDebt | 关联规格 | 文本（单个） | ❌ 可选 |
| Sprint | - | - | ❌ 无需填写 |

### 最佳实践

1. **Epic 创建时明确关联 Spec**，方便后续追溯
2. **Story 继承 Epic 的 Spec**，减少重复填写
3. **Task 不需要填写 Spec**，通过 Story 自动继承
4. **Bug/技术债始终关联 Spec**，便于质量统计
5. **跨 Spec 的 Epic** 在"关联规格"字段填写多个 Spec（逗号分隔）

---

**版本**: 1.0.0
**最后更新**: 2025-12-31
**相关文档**: [scrum-migration-plan.md](./scrum-migration-plan.md)
