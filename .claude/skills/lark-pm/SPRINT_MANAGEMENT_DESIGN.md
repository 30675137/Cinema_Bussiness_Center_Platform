# Sprint 管理系统设计方案

**@spec T004-lark-project-management**

## 一、设计目标

将 Spec-Kit 工作流与 Scrum 敏捷管理深度集成，实现以下映射关系：

```
Spec-Kit 产物               Scrum/Agile 概念
├── spec.md              → Product Backlog (Epic + User Stories)
├── plan.md              → Sprint 的技术方案文档（存储在 Sprint 表）
└── tasks.md             → Sprint Backlog (Tasks，关联到 Sprint)
```

## 二、表结构设计

### 1. 新建：Sprint 表（Sprint 管理）

**表名**: `Sprint 管理`

**字段列表**:

| 字段名 | 字段类型 | 是否必填 | 说明 | 示例值 |
|--------|---------|---------|------|--------|
| Sprint ID | 单行文本 | ✅ | 唯一标识 | `Sprint 1`, `Sprint 0 - Tech Design` |
| Sprint 名称 | 单行文本 | ✅ | 易读的名称 | `用户认证功能开发`, `架构设计冲刺` |
| spec_id | 单行文本 | ✅ | 关联的 Spec | `T004-lark-project-management` |
| 目标 | 多行文本 | ⚪ | Sprint 目标描述 | `完成用户登录和注册功能` |
| 开始日期 | 日期 | ⚪ | Sprint 开始日期 | `2026-01-01` |
| 结束日期 | 日期 | ⚪ | Sprint 结束日期 | `2026-01-14` |
| 状态 | 单选 | ✅ | Sprint 状态 | `📝 规划中` / `🚀 进行中` / `✅ 已完成` / `📊 已评审` |
| **计划文档内容** | 多行文本 | ⚪ | **plan.md 的完整内容** | `## 技术方案\n使用 IndexedDB...` |
| **计划文档链接** | URL | ⚪ | **plan.md 的在线链接** | `https://github.com/.../plan.md` |
| 关联 Epic | 关联字段 | ⚪ | 关联到 Product Backlog 的 Epic | 链接到 Epic 记录 |
| 速度 | 数字 | ⚪ | Sprint 速度（已完成故事点） | `13` |
| 容量 | 数字 | ⚪ | Sprint 容量（计划故事点） | `15` |
| 负责人 | 人员 | ⚪ | Scrum Master | @张三 |
| 备注 | 多行文本 | ⚪ | 其他说明 | `本次 Sprint focus on UI` |

**状态枚举值**:
- `📝 规划中` - Sprint Planning 阶段
- `🚀 进行中` - Sprint 执行中
- `✅ 已完成` - Sprint 已结束，待评审
- `📊 已评审` - Sprint Retrospective 完成

### 2. 增强：Product Backlog 表（产品待办列表）

**新增字段**:

| 字段名 | 字段类型 | 是否必填 | 说明 | 示例值 |
|--------|---------|---------|------|--------|
| **技术方案链接** | URL | ⚪ | 指向 plan.md 或技术设计文档 | `https://github.com/.../plan.md` |
| **user_story_id** | 单行文本 | ⚪ | User Story 编号（来自 spec.md） | `US1`, `US2` |
| **关联 Epic** | 关联字段 | ⚪ | 关联到同表的 Epic 记录 | 链接到 Epic |

**已有字段**:
- 标题
- 类型（Epic | User Story | Spike）
- 优先级（P0 | P1 | P2 | P3）
- 状态（📝 待规划 | 🚀 进行中 | ✅ 已完成 | ❌ 已取消）
- spec_id
- 描述
- 验收标准

### 3. 增强：任务管理表

**新增字段**:

| 字段名 | 字段类型 | 是否必填 | 说明 | 示例值 |
|--------|---------|---------|------|--------|
| **sprint_id** | 单行文本 | ⚪ | 所属 Sprint | `Sprint 1` |
| **user_story_id** | 单行文本 | ⚪ | 关联的 User Story | `US1` |
| **task_id** | 单行文本 | ⚪ | 任务编号（来自 tasks.md） | `T007`, `T012` |

**已有字段**:
- 标题
- spec_id
- 状态
- 优先级
- 负责人
- 描述
- 进度

## 三、数据关系图

```
┌─────────────────────────────────────────────────────────────┐
│                    Spec-Kit 产物                              │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         spec.md          plan.md        tasks.md
              │               │               │
              │               │               │
              ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────┐
│                   飞书多维表格数据                             │
└─────────────────────────────────────────────────────────────┘

产品待办列表（Product Backlog）
├── Epic (recvEPIC001)
│   ├── spec_id: "T004-lark-project-management"
│   ├── 技术方案链接: "https://.../plan.md"  ← plan.md
│   └── 关联 Sprint: Sprint 0
│
├── User Story (recvUS001)
│   ├── spec_id: "T004-lark-project-management"
│   ├── user_story_id: "US1"  ← spec.md User Story 1
│   └── 关联 Epic: recvEPIC001
│
└── User Story (recvUS002)
    ├── spec_id: "T004-lark-project-management"
    ├── user_story_id: "US2"  ← spec.md User Story 2
    └── 关联 Epic: recvEPIC001

Sprint 管理表
├── Sprint 0 - Tech Design
│   ├── spec_id: "T004-lark-project-management"
│   ├── 计划文档内容: <plan.md 完整内容>  ← plan.md 存这里！
│   ├── 计划文档链接: "https://.../plan.md"
│   └── 关联 Epic: recvEPIC001
│
└── Sprint 1
    ├── spec_id: "T004-lark-project-management"
    ├── 目标: "完成 US1"
    ├── 开始日期: 2026-01-01
    ├── 结束日期: 2026-01-14
    └── 关联 Epic: recvEPIC001

任务管理表
├── Task (tsk001)
│   ├── spec_id: "T004-lark-project-management"
│   ├── sprint_id: "Sprint 1"
│   ├── user_story_id: "US1"
│   ├── task_id: "T007"  ← tasks.md T007
│   └── 标题: "创建 Sprint CRUD 命令"
│
└── Task (tsk002)
    ├── spec_id: "T004-lark-project-management"
    ├── sprint_id: "Sprint 1"
    ├── user_story_id: "US1"
    ├── task_id: "T008"  ← tasks.md T008
    └── 标题: "实现 Sprint 表创建"
```

## 四、核心设计决策

### 决策 1: plan.md 存储位置 ✅

**方案**: 存储在 Sprint 表

**字段**:
- `计划文档内容`（多行文本）: 存储 plan.md 的完整内容
- `计划文档链接`（URL）: 指向 GitHub/GitLab 上的 plan.md

**原因**:
1. plan.md 是 Sprint 级别的技术指南，不是 Backlog Item
2. 一个 spec 可能有多个 Sprints，每个 Sprint 可以调整技术方案
3. 便于 Sprint 回顾时查看当时的技术决策
4. 符合 ADR (Architecture Decision Record) 模式

**替代方案**: 存储在 Epic 的"技术方案链接"字段
- ⚠️ 缺点：Epic 只能有一个技术方案，无法追踪演进

### 决策 2: User Story 与 Task 的关联 ✅

**方案**: 通过 `user_story_id` 文本字段关联

**流程**:
```
spec.md 的 User Story 1
  ↓ user_story_id = "US1"
Product Backlog Item (Type: User Story)
  ↓ user_story_id = "US1"
Tasks (T007, T008, ..., T012)
```

**原因**:
- 飞书多维表格的关联字段只能关联同一个表
- Task 表和 Product Backlog 表是独立的
- 使用文本字段 + 筛选查询更灵活

### 决策 3: Sprint 0 用于技术设计 ✅

**方案**: 创建特殊的 Sprint 0，专门用于技术设计

**特点**:
- Sprint ID: `Sprint 0 - Tech Design`
- 无开始/结束日期
- 状态流转: 📝 规划中 → ✅ 已完成
- 存储 plan.md 内容

**原因**:
- 技术设计通常在实施前完成
- 便于追溯技术决策历史
- 符合 Spec-Kit 的 `/speckit.plan` 语义

## 五、完整工作流示例

### Spec-Kit 集成工作流

```bash
# ============================================
# 阶段 1: 创建功能规格 (spec.md)
# ============================================

/speckit.specify "构建影院商品管理中台的 Sprint 管理功能"

# → 在飞书中执行
$ node dist/index.js backlog smart-create \
    "Epic: Sprint 管理功能" \
    --type Epic \
    --priority P1 \
    --spec-id "T004-lark-project-management"

# → 结果：Product Backlog 中创建 Epic (recvEPIC001)

# ============================================
# 阶段 2: 从 spec.md 提取 User Stories
# ============================================

# spec.md 中定义了 3 个 User Stories:
# - User Story 1 (P0): Sprint 基础 CRUD
# - User Story 2 (P1): Sprint 与 Spec-Kit 集成
# - User Story 3 (P2): Sprint 统计和可视化

$ node dist/index.js backlog smart-create \
    "User Story: Sprint 基础 CRUD" \
    --type "User Story" \
    --priority P0 \
    --spec-id "T004-lark-project-management"

# → 手动设置 user_story_id
$ node dist/index.js backlog update \
    --record-id recvUS001 \
    --user-story-id "US1"

# 重复创建 US2, US3...

# ============================================
# 阶段 3: 创建技术设计 Sprint (plan.md)
# ============================================

/speckit.plan "使用 LarkBitableService 直接 API 调用，创建 Sprint 表..."

# → 在飞书中执行
$ node dist/index.js sprint create \
    --sprint-id "Sprint 0 - Tech Design" \
    --name "技术方案设计" \
    --spec-id "T004-lark-project-management" \
    --goal "完成 Sprint 管理系统技术架构设计" \
    --plan-doc "$(cat specs/T004-lark-project-management/plan.md)" \
    --plan-link "https://github.com/org/repo/blob/main/specs/T004-lark-project-management/plan.md" \
    --status "📝 规划中"

# → 更新 Epic，关联技术方案
$ node dist/index.js backlog update \
    --record-id recvEPIC001 \
    --tech-plan-link "https://github.com/org/repo/blob/main/specs/T004-lark-project-management/plan.md"

# ============================================
# 阶段 4: 生成任务分解 (tasks.md)
# ============================================

/speckit.tasks

# tasks.md 生成:
# - Phase 1: Setup (T001-T004)
# - Phase 2: Sprint CRUD (T005-T010)
# - Phase 3: Integration (T011-T015)

# → 创建 Sprint 1
$ node dist/index.js sprint create \
    --sprint-id "Sprint 1" \
    --name "Sprint 基础功能实现" \
    --spec-id "T004-lark-project-management" \
    --goal "完成 Sprint 表创建和基础 CRUD 命令" \
    --start-date "2026-01-01" \
    --end-date "2026-01-14" \
    --capacity 15 \
    --status "🚀 进行中"

# → 从 tasks.md 批量导入任务
$ node dist/index.js task import-from-tasks-md \
    --tasks-file "specs/T004-lark-project-management/tasks.md" \
    --sprint-id "Sprint 1" \
    --phase "Phase 1,Phase 2"

# 等价于手动创建:
$ node dist/index.js task create \
    --title "T005: 设计 Sprint 表结构" \
    --spec-id "T004-lark-project-management" \
    --sprint-id "Sprint 1" \
    --user-story-id "US1" \
    --task-id "T005" \
    --priority "🔴 高" \
    --status "📝 待办"

# ============================================
# 阶段 5: Sprint 执行和跟踪
# ============================================

# 更新任务状态
$ node dist/index.js task update \
    --task-id tsk001 \
    --status "🚀 进行中" \
    --progress 50

# 查询 Sprint 进度
$ node dist/index.js sprint status --sprint-id "Sprint 1"
# 输出:
# Sprint 1 进度:
# - 总任务: 12
# - 已完成: 5
# - 进行中: 3
# - 待办: 4
# - 完成率: 41.7%
# - 剩余天数: 7

# ============================================
# 阶段 6: Sprint 评审和回顾
# ============================================

$ node dist/index.js sprint complete \
    --sprint-id "Sprint 1" \
    --velocity 13 \
    --retrospective "团队协作良好，直接 API 方案效果显著"

# → 更新 Sprint 状态为"✅ 已完成"
# → 如果有未完成任务，提示移动到 Backlog 或下一个 Sprint
```

## 六、实施计划

### Phase 1: 表结构创建（优先级 P0）

- [ ] **Task 1**: 在飞书中创建 Sprint 表
  - 使用 `mcp__lark-mcp__bitable_v1_appTable_create` 或 `LarkBitableService`
  - 字段设计见"表结构设计"章节

- [ ] **Task 2**: 更新 Product Backlog 表，增加字段：
  - `技术方案链接`（URL）
  - `user_story_id`（单行文本）
  - `关联 Epic`（关联字段）

- [ ] **Task 3**: 更新任务管理表，增加字段：
  - `sprint_id`（单行文本）
  - `user_story_id`（单行文本）
  - `task_id`（单行文本）

### Phase 2: Sprint CRUD 命令（优先级 P0）

- [ ] **Task 4**: 实现 `sprint create` 命令
  - 支持 `--plan-doc` 参数（传入 plan.md 内容）
  - 支持 `--plan-link` 参数（plan.md 的 GitHub URL）
  - 验证 spec_id 格式

- [ ] **Task 5**: 实现 `sprint list` 命令
  - 支持按 spec_id 筛选
  - 支持按状态筛选
  - 表格化输出

- [ ] **Task 6**: 实现 `sprint update` 命令
  - 支持更新所有字段
  - 支持更新 plan.md 内容

- [ ] **Task 7**: 实现 `sprint complete` 命令
  - 更新状态为"✅ 已完成"
  - 记录 velocity（速度）
  - 检查未完成任务

- [ ] **Task 8**: 实现 `sprint status` 命令
  - 统计任务完成情况
  - 计算完成率
  - 显示剩余天数

### Phase 3: 集成命令（优先级 P1）

- [ ] **Task 9**: 增强 `backlog update` 命令
  - 支持更新 `user_story_id`
  - 支持更新 `技术方案链接`

- [ ] **Task 10**: 增强 `task create` 命令
  - 支持 `--sprint-id` 参数
  - 支持 `--user-story-id` 参数
  - 支持 `--task-id` 参数

- [ ] **Task 11**: 实现 `task import-from-tasks-md` 命令
  - 解析 tasks.md 文件
  - 批量创建任务
  - 自动设置 sprint_id 和 task_id

### Phase 4: 查询和统计（优先级 P2）

- [ ] **Task 12**: 实现 `sprint burndown` 命令
  - 生成燃尽图数据（JSON 格式）
  - 按日期统计剩余任务

- [ ] **Task 13**: 实现 `backlog by-spec` 命令
  - 按 spec_id 查看所有 Epic/US/Sprint
  - 树形结构展示

- [ ] **Task 14**: 实现 `task by-sprint` 命令
  - 按 Sprint 查看所有任务
  - 分组显示（by User Story）

### Phase 5: 文档和示例（优先级 P2）

- [ ] **Task 15**: 更新 README.md
  - Sprint 管理功能说明
  - Spec-Kit 集成示例

- [ ] **Task 16**: 创建完整示例
  - 从 spec.md 到 Sprint 完成的端到端示例
  - 包含所有命令操作

- [ ] **Task 17**: 创建视频演示（可选）
  - 演示 Spec-Kit 工作流
  - 展示 Sprint 管理功能

## 七、MVP 范围

**最小可用版本应包含**:

1. ✅ Sprint 表创建
2. ✅ `sprint create` 命令（支持 plan.md 内容和链接）
3. ✅ `sprint list` 命令
4. ✅ `sprint status` 命令（基础统计）
5. ✅ 更新 Product Backlog 增加 `技术方案链接` 字段
6. ✅ 更新任务管理表增加 `sprint_id` 字段
7. ✅ 文档：工作流示例

**MVP 验证场景**:

```bash
# 1. 创建 Sprint 0 存储 plan.md
sprint create --sprint-id "Sprint 0" --plan-doc "$(cat plan.md)"

# 2. 创建 Sprint 1
sprint create --sprint-id "Sprint 1" --goal "完成 US1"

# 3. 创建任务并关联 Sprint
task create --title "T007" --sprint-id "Sprint 1"

# 4. 查看 Sprint 状态
sprint status --sprint-id "Sprint 1"
```

## 八、技术实现细节

### 8.1 使用直接 API 调用（绕过 MCP）

所有 Sprint 表操作使用 `LarkBitableService`，确保无需重启即可使用最新 token：

```typescript
// src/services/lark-bitable-service.ts
export class LarkBitableService {
  private client: LarkApiClient

  async createSprintTable(app_token: string): Promise<string> {
    const response = await this.client.post(
      `/bitable/v1/apps/${app_token}/tables`,
      {
        table: {
          name: 'Sprint 管理',
          fields: [
            { field_name: 'Sprint ID', type: 1 }, // 单行文本
            { field_name: 'Sprint 名称', type: 1 },
            { field_name: 'spec_id', type: 1 },
            { field_name: '目标', type: 1 }, // 多行文本
            // ... 更多字段
          ]
        }
      }
    )
    return response.data.table_id
  }
}
```

### 8.2 配置管理

需要在 `.lark-pm/config.json` 中新增 Sprint 表配置：

```json
{
  "appToken": "Y05Mb7greapFiSseRpoc5XkXnrb",
  "tables": {
    "backlog": "tblDiernIQoFU9Yr",
    "productBacklog": "tblDiernIQoFU9Yr",
    "tasks": "tblXXXXXXXXXXXX",
    "sprint": "tblYYYYYYYYYYYY"  // 新增
  }
}
```

## 九、术语对照表

| 中文 | 英文 | 说明 |
|------|------|------|
| 产品待办列表 | Product Backlog | 所有需求的优先级列表 |
| Epic | Epic | 大型需求，可拆分为多个 User Story |
| 用户故事 | User Story | 用户视角的功能需求 |
| Sprint | Sprint | 时间盒（1-4周），用于完成一组任务 |
| Sprint Backlog | Sprint Backlog | Sprint 中要完成的任务列表 |
| 技术尖峰 | Spike | 技术调研任务 |
| 速度 | Velocity | 团队在一个 Sprint 中完成的工作量 |
| 燃尽图 | Burndown Chart | 显示 Sprint 中剩余工作的图表 |
| Scrum Master | Scrum Master | 负责 Sprint 流程的人 |
| 回顾会议 | Retrospective | Sprint 结束后的总结会议 |

---

**创建日期**: 2026-01-01
**状态**: ✅ 设计完成，待实施
**负责人**: @randy
**优先级**: P0（核心功能）
