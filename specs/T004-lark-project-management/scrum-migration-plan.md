# Scrum 数据模型改造计划

**@spec T004-lark-project-management**

## 1. 改造目标

将 lark-pm 的传统项目管理数据模型升级为 Scrum 敏捷开发模型，支持：
- Epic → User Story → Task 层级结构
- Sprint 迭代管理
- Product Backlog 和 Sprint Backlog 分离
- 燃尽图数据支持
- 速度（Velocity）跟踪

## 2. 新的数据实体设计

### 2.1 数据实体总览

| 实体 | 飞书表名 | Scrum 角色 | 层级 |
|------|---------|-----------|------|
| Epic | 史诗 | 大型功能目标 | L1 |
| UserStory | 用户故事 | 可交付的用户价值 | L2 |
| Task | 任务 | 具体开发工作 | L3 |
| Sprint | 迭代 | 时间盒容器 | - |
| Bug | 缺陷 | 质量问题 | - |
| TechnicalDebt | 技术债 | 技术改进项 | - |

### 2.2 层级关系

```
Epic (史诗)
  ├── UserStory (用户故事) #1
  │     ├── Task (任务) #1.1
  │     ├── Task (任务) #1.2
  │     └── Task (任务) #1.3
  ├── UserStory (用户故事) #2
  │     └── Task (任务) #2.1
  └── UserStory (用户故事) #3

Sprint (迭代)
  ├── UserStory #1 (本迭代)
  ├── UserStory #2 (本迭代)
  ├── Bug #1
  └── TechnicalDebt #1
```

## 3. 飞书表结构定义

### 3.1 Epic (史诗)

| 字段名 | 飞书字段类型 | 必需 | 默认值 | 说明 |
|--------|-------------|------|--------|------|
| Epic 标题 | 多行文本 (Text) | ✅ | - | 史诗名称 |
| Epic ID | 多行文本 (Text) | ✅ | - | 自动生成（如 EPIC-001） |
| 状态 | 单选 (SingleSelect) | ✅ | 📝 未开始 | 📝 未开始、🚀 进行中、✅ 已完成、❌ 已取消 |
| 负责人 | 人员 (User) | ❌ | - | Product Owner |
| 开始日期 | 日期 (DateTime) | ❌ | - | - |
| 目标完成日期 | 日期 (DateTime) | ❌ | - | - |
| 实际完成日期 | 日期 (DateTime) | ❌ | - | - |
| 业务价值 | 单选 (SingleSelect) | ✅ | 🟡 中 | 🔴 高、🟡 中、🟢 低 |
| 关联规格 | 多行文本 (Text) | ❌ | - | 如 P003, I004 |
| 描述 | 多行文本 (Text) | ❌ | - | Epic 详细描述 |
| Story 计数 | 公式 (Formula) | 自动 | - | 关联的 Story 数量 |
| 完成进度 | 公式 (Formula) | 自动 | - | 已完成 Story / 总 Story |
| 备注 | 多行文本 (Text) | ❌ | - | - |

### 3.2 UserStory (用户故事)

| 字段名 | 飞书字段类型 | 必需 | 默认值 | 说明 |
|--------|-------------|------|--------|------|
| Story 标题 | 多行文本 (Text) | ✅ | - | 用户故事描述 |
| Story ID | 多行文本 (Text) | ✅ | - | 自动生成（如 STORY-042） |
| 所属 Epic | 单向关联 (Link) | ❌ | - | 关联到 Epic 表 |
| 所属 Sprint | 单向关联 (Link) | ❌ | - | 关联到 Sprint 表 |
| 状态 | 单选 (SingleSelect) | ✅ | 📝 待办 | 📝 待办、🚀 进行中、👀 待评审、✅ 已完成、❌ 已取消 |
| 优先级 | 单选 (SingleSelect) | ✅ | 🟡 P2 | 🔴 P0、🟠 P1、🟡 P2、🟢 P3 |
| Story 点数 | 数字 (Number) | ❌ | - | 斐波那契数列（1, 2, 3, 5, 8, 13, 21） |
| 负责人 | 人员 (User) | ❌ | - | 支持多人 |
| 验收标准 | 多行文本 (Text) | ❌ | - | Acceptance Criteria |
| 关联规格 | 多行文本 (Text) | ❌ | - | 如 P003, I004 |
| 标签 | 多选 (MultiSelect) | ❌ | - | Frontend, Backend, API, DB, UI/UX |
| Task 计数 | 公式 (Formula) | 自动 | - | 关联的 Task 数量 |
| 完成进度 | 公式 (Formula) | 自动 | - | 已完成 Task / 总 Task |
| 创建时间 | 创建时间 (CreatedTime) | 自动 | - | - |
| 备注 | 多行文本 (Text) | ❌ | - | - |

### 3.3 Task (任务) - 改造后

| 字段名 | 飞书字段类型 | 必需 | 默认值 | 说明 |
|--------|-------------|------|--------|------|
| 任务标题 | 多行文本 (Text) | ✅ | - | 任务描述 |
| Task ID | 多行文本 (Text) | ✅ | - | 自动生成（如 TASK-128） |
| 所属 Story | 单向关联 (Link) | ✅ | - | 关联到 UserStory 表 |
| 状态 | 单选 (SingleSelect) | ✅ | 📝 待办 | 📝 待办、🚀 进行中、✅ 已完成、❌ 已取消、⏸️ 阻塞 |
| 负责人 | 人员 (User) | ❌ | - | 单人 |
| 工作量 | 数字 (Number) | ❌ | - | 单位: 小时 |
| 剩余工作量 | 数字 (Number) | ❌ | - | 用于燃尽图（自动更新） |
| 实际工时 | 数字 (Number) | ❌ | - | 单位: 小时 |
| 标签 | 多选 (MultiSelect) | ❌ | - | Frontend, Backend, Test, Docs, Design |
| 阻塞原因 | 多行文本 (Text) | ❌ | - | 如果状态为"阻塞" |
| 备注 | 多行文本 (Text) | ❌ | - | - |
| 创建时间 | 创建时间 (CreatedTime) | 自动 | - | - |

### 3.4 Sprint (迭代)

| 字段名 | 飞书字段类型 | 必需 | 默认值 | 说明 |
|--------|-------------|------|--------|------|
| Sprint 名称 | 多行文本 (Text) | ✅ | - | 如"Sprint 12", "2025-W01" |
| Sprint ID | 多行文本 (Text) | ✅ | - | 自动生成（如 SPR-012） |
| 状态 | 单选 (SingleSelect) | ✅ | 📝 未开始 | 📝 未开始、🚀 进行中、✅ 已完成 |
| 开始日期 | 日期 (DateTime) | ✅ | - | - |
| 结束日期 | 日期 (DateTime) | ✅ | - | - |
| 计划 Story 点数 | 数字 (Number) | ❌ | - | 计划承诺的点数 |
| 实际完成点数 | 公式 (Formula) | 自动 | - | 已完成 Story 的点数总和 |
| 团队成员 | 人员 (User) | ❌ | - | 支持多人 |
| Sprint 目标 | 多行文本 (Text) | ❌ | - | Sprint Goal |
| 回顾总结 | 多行文本 (Text) | ❌ | - | Retrospective 记录 |
| 速度 (Velocity) | 公式 (Formula) | 自动 | - | 实际完成点数 |
| 备注 | 多行文本 (Text) | ❌ | - | - |

### 3.5 Bug (缺陷) - 保持不变

保留原有结构，新增以下字段：

| 新增字段 | 飞书字段类型 | 必需 | 默认值 | 说明 |
|---------|-------------|------|--------|------|
| 所属 Sprint | 单向关联 (Link) | ❌ | - | 关联到 Sprint 表 |
| Story 点数 | 数字 (Number) | ❌ | - | 如果在 Sprint 中修复 |

### 3.6 TechnicalDebt (技术债) - 保持不变

保留原有结构，新增以下字段：

| 新增字段 | 飞书字段类型 | 必需 | 默认值 | 说明 |
|---------|-------------|------|--------|------|
| 所属 Sprint | 单向关联 (Link) | ❌ | - | 关联到 Sprint 表 |
| Story 点数 | 数字 (Number) | ❌ | - | 如果在 Sprint 中处理 |

## 4. TypeScript 类型定义

### 4.1 Epic

```typescript
/**
 * @spec T004-lark-project-management
 * Epic (史诗) 实体
 */
export interface Epic {
  id: string                    // 记录 ID
  epicId: string                // Epic ID (如 EPIC-001)
  title: string                 // Epic 标题
  status: EpicStatus            // 状态
  owner?: string                // 负责人 ID (Product Owner)
  startDate?: number            // 开始日期 (时间戳)
  targetDate?: number           // 目标完成日期
  actualDate?: number           // 实际完成日期
  businessValue: BusinessValue  // 业务价值
  specId?: string               // 关联规格
  description?: string          // 描述
  storyCount?: number           // Story 数量 (自动计算)
  progress?: number             // 完成进度 (0-100, 自动计算)
  notes?: string                // 备注
  createdTime?: number          // 创建时间
}

export enum EpicStatus {
  NotStarted = '📝 未开始',
  InProgress = '🚀 进行中',
  Done = '✅ 已完成',
  Cancelled = '❌ 已取消',
}

export enum BusinessValue {
  High = '🔴 高',
  Medium = '🟡 中',
  Low = '🟢 低',
}
```

### 4.2 UserStory

```typescript
/**
 * @spec T004-lark-project-management
 * User Story (用户故事) 实体
 */
export interface UserStory {
  id: string                    // 记录 ID
  storyId: string               // Story ID (如 STORY-042)
  title: string                 // Story 标题
  epicId?: string               // 所属 Epic ID
  sprintId?: string             // 所属 Sprint ID
  status: StoryStatus           // 状态
  priority: StoryPriority       // 优先级
  storyPoints?: number          // Story 点数 (1,2,3,5,8,13,21)
  assignees?: string[]          // 负责人 ID 列表
  acceptanceCriteria?: string   // 验收标准
  specId?: string               // 关联规格
  tags?: StoryTag[]             // 标签
  taskCount?: number            // Task 数量 (自动计算)
  progress?: number             // 完成进度 (0-100, 自动计算)
  notes?: string                // 备注
  createdTime?: number          // 创建时间
}

export enum StoryStatus {
  Todo = '📝 待办',
  InProgress = '🚀 进行中',
  InReview = '👀 待评审',
  Done = '✅ 已完成',
  Cancelled = '❌ 已取消',
}

export enum StoryPriority {
  P0 = '🔴 P0',  // 紧急
  P1 = '🟠 P1',  // 高
  P2 = '🟡 P2',  // 中
  P3 = '🟢 P3',  // 低
}

export enum StoryTag {
  Frontend = 'Frontend',
  Backend = 'Backend',
  API = 'API',
  Database = 'DB',
  UIUX = 'UI/UX',
}
```

### 4.3 Task (改造后)

```typescript
/**
 * @spec T004-lark-project-management
 * Task (任务) 实体 - Scrum 版本
 */
export interface Task {
  id: string                    // 记录 ID
  taskId: string                // Task ID (如 TASK-128)
  title: string                 // 任务标题
  storyId: string               // 所属 Story ID (必需)
  status: TaskStatus            // 状态
  assignee?: string             // 负责人 ID
  estimatedHours?: number       // 工作量 (小时)
  remainingHours?: number       // 剩余工作量 (燃尽图数据)
  actualHours?: number          // 实际工时
  tags?: TaskTag[]              // 标签
  blockedReason?: string        // 阻塞原因
  notes?: string                // 备注
  createdTime?: number          // 创建时间
}

export enum TaskStatus {
  Todo = '📝 待办',
  InProgress = '🚀 进行中',
  Done = '✅ 已完成',
  Cancelled = '❌ 已取消',
  Blocked = '⏸️ 阻塞',
}

export enum TaskTag {
  Frontend = 'Frontend',
  Backend = 'Backend',
  Test = 'Test',
  Docs = 'Docs',
  Design = 'Design',
}
```

### 4.4 Sprint

```typescript
/**
 * @spec T004-lark-project-management
 * Sprint (迭代) 实体
 */
export interface Sprint {
  id: string                    // 记录 ID
  sprintId: string              // Sprint ID (如 SPR-012)
  name: string                  // Sprint 名称 (如 "Sprint 12")
  status: SprintStatus          // 状态
  startDate: number             // 开始日期 (时间戳, 必需)
  endDate: number               // 结束日期 (时间戳, 必需)
  plannedPoints?: number        // 计划 Story 点数
  completedPoints?: number      // 实际完成点数 (自动计算)
  teamMembers?: string[]        // 团队成员 ID 列表
  sprintGoal?: string           // Sprint 目标
  retrospective?: string        // 回顾总结
  velocity?: number             // 速度 (自动计算, 等于 completedPoints)
  notes?: string                // 备注
  createdTime?: number          // 创建时间
}

export enum SprintStatus {
  NotStarted = '📝 未开始',
  InProgress = '🚀 进行中',
  Done = '✅ 已完成',
}
```

## 5. CLI 命令结构调整

### 5.1 新增命令

```bash
# Epic 管理
lark-pm epic list
lark-pm epic create --title "用户中心改造" --business-value high
lark-pm epic update --epic-id EPIC-001 --status in-progress
lark-pm epic delete --epic-id EPIC-001 --confirm

# User Story 管理
lark-pm story list [--sprint SPR-012] [--epic EPIC-001] [--status todo]
lark-pm story create --title "用户可以查看订单历史" --epic EPIC-001 --points 5
lark-pm story update --story-id STORY-042 --sprint SPR-012 --status in-progress
lark-pm story move --story-id STORY-042 --to-sprint SPR-013
lark-pm story delete --story-id STORY-042 --confirm

# Task 管理 (调整后)
lark-pm task list [--story STORY-042] [--status todo]
lark-pm task create --title "实现订单查询 API" --story STORY-042 --estimated 8
lark-pm task update --task-id TASK-128 --status in-progress --remaining 4
lark-pm task delete --task-id TASK-128 --confirm

# Sprint 管理
lark-pm sprint list [--status in-progress]
lark-pm sprint create --name "Sprint 12" --start 2025-01-06 --end 2025-01-19 --planned-points 40
lark-pm sprint update --sprint-id SPR-012 --status done --retrospective "团队协作良好"
lark-pm sprint close --sprint-id SPR-012
lark-pm sprint stats --sprint-id SPR-012  # 查看 Sprint 统计数据
lark-pm sprint burndown --sprint-id SPR-012  # 生成燃尽图数据
lark-pm sprint velocity --last 6  # 查看最近 6 个 Sprint 的速度

# Product Backlog 管理
lark-pm backlog list [--epic EPIC-001]  # 列出未分配 Sprint 的 Story
lark-pm backlog prioritize --story-id STORY-042 --priority p0
lark-pm backlog estimate --story-id STORY-042 --points 8

# Bug/技术债 (保留并扩展)
lark-pm bug create --title "登录失败" --sprint SPR-012 --points 3
lark-pm debt create --title "重构数据库连接池" --sprint SPR-012 --points 5
```

### 5.2 保留命令

```bash
# 导出与统计 (保留)
lark-pm export --format excel --output project-data.xlsx
lark-pm stats [--sprint SPR-012] [--epic EPIC-001]
lark-pm status

# 配置 (保留)
lark-pm config show
lark-pm config set --key xxx --value yyy
```

## 6. 数据迁移策略

### 6.1 迁移步骤

1. **创建新表**: Epic, UserStory, Sprint
2. **调整现有表**: Task 表新增 `所属 Story` 字段
3. **数据迁移**:
   - 将现有 `FeatureModule` 迁移为 `Epic`
   - 将现有 `Task` 拆分为 `UserStory` + `Task`
   - 创建默认 Sprint "Backlog"（未分配迭代）
4. **删除旧表**: FeatureModule (已迁移), TestRecord (可选保留)

### 6.2 迁移脚本示例

```typescript
/**
 * @spec T004-lark-project-management
 * 数据迁移: 传统模型 → Scrum 模型
 */
export async function migrateToScrum(
  larkClient: LarkClient,
  appToken: string
): Promise<void> {
  console.log('Step 1: 创建 Epic 表...')
  const epicTableId = await larkClient.createTable(appToken, {
    name: '史诗',
    fields: [...] // Epic 字段定义
  })

  console.log('Step 2: 创建 UserStory 表...')
  const storyTableId = await larkClient.createTable(appToken, {
    name: '用户故事',
    fields: [...] // UserStory 字段定义
  })

  console.log('Step 3: 创建 Sprint 表...')
  const sprintTableId = await larkClient.createTable(appToken, {
    name: '迭代',
    fields: [...] // Sprint 字段定义
  })

  console.log('Step 4: 迁移 FeatureModule → Epic...')
  const features = await larkClient.listRecords(appToken, oldFeatureTableId)
  for (const feature of features) {
    await larkClient.createRecord(appToken, epicTableId, {
      'Epic 标题': feature.fields['功能名称'],
      '状态': mapFeatureStatusToEpicStatus(feature.fields['状态']),
      // ...
    })
  }

  console.log('Step 5: 将 Task 提升为 UserStory...')
  const tasks = await larkClient.listRecords(appToken, taskTableId)
  for (const task of tasks) {
    // 创建 UserStory
    const storyId = await larkClient.createRecord(appToken, storyTableId, {
      'Story 标题': task.fields['任务标题'],
      '状态': '📝 待办',
      // ...
    })

    // 创建子 Task（拆分原任务）
    await larkClient.createRecord(appToken, taskTableId, {
      '任务标题': `实现 ${task.fields['任务标题']}`,
      '所属 Story': storyId,
      // ...
    })
  }

  console.log('✅ 迁移完成！')
}
```

### 6.3 回滚策略

- 迁移前备份 Base App
- 保留旧表 30 天
- 提供回滚脚本

## 7. 新增功能需求

### 7.1 燃尽图数据生成

```typescript
/**
 * 生成 Sprint 燃尽图数据
 */
export async function generateBurndownData(
  sprintId: string
): Promise<BurndownPoint[]> {
  const sprint = await sprintRepo.findById(sprintId)
  const stories = await storyRepo.findBySprintId(sprintId)

  const startDate = new Date(sprint.startDate)
  const endDate = new Date(sprint.endDate)
  const totalDays = differenceInDays(endDate, startDate)

  const burndownData: BurndownPoint[] = []

  for (let day = 0; day <= totalDays; day++) {
    const currentDate = addDays(startDate, day)
    const remainingPoints = calculateRemainingPoints(stories, currentDate)

    burndownData.push({
      date: currentDate.toISOString(),
      idealRemaining: totalPoints * (1 - day / totalDays),
      actualRemaining: remainingPoints,
    })
  }

  return burndownData
}
```

### 7.2 速度（Velocity）跟踪

```typescript
/**
 * 计算团队速度（最近 N 个 Sprint）
 */
export async function calculateVelocity(
  lastNSprints: number = 6
): Promise<VelocityReport> {
  const sprints = await sprintRepo.findRecent(lastNSprints, { status: 'done' })

  const velocities = sprints.map(sprint => sprint.completedPoints || 0)
  const avgVelocity = velocities.reduce((sum, v) => sum + v, 0) / velocities.length

  return {
    sprints: sprints.map(s => ({ name: s.name, velocity: s.completedPoints })),
    average: avgVelocity,
    trend: calculateTrend(velocities),
  }
}
```

## 8. 飞书表创建顺序

1. **Epic** (无依赖)
2. **Sprint** (无依赖)
3. **UserStory** (依赖 Epic, Sprint)
4. **Task** (依赖 UserStory)
5. **Bug** (依赖 Sprint) - 调整现有表
6. **TechnicalDebt** (依赖 Sprint) - 调整现有表

## 9. 验收标准

### 9.1 功能验收

- [ ] 可以创建 Epic 并查看关联的 Story 列表
- [ ] 可以创建 User Story 并分配到 Sprint
- [ ] 可以在 Story 下创建 Task
- [ ] 可以创建 Sprint 并设置开始/结束日期
- [ ] 可以查看 Sprint 燃尽图数据
- [ ] 可以查看团队速度趋势
- [ ] 可以导出 Scrum 数据到 Excel

### 9.2 数据一致性

- [ ] Epic 的 Story 计数自动更新
- [ ] Story 的 Task 计数自动更新
- [ ] Sprint 的完成点数自动计算
- [ ] Task 的剩余工时正确反映到燃尽图

### 9.3 迁移验证

- [ ] 旧 FeatureModule 数据正确迁移到 Epic
- [ ] 旧 Task 数据正确拆分为 Story + Task
- [ ] 无数据丢失
- [ ] 关联关系正确建立

## 10. 时间估算

| 任务 | 工时 |
|-----|------|
| 数据模型设计与文档 | 4h |
| 飞书表结构创建 | 3h |
| TypeScript 类型定义 | 2h |
| Repository 层实现 | 6h |
| CLI 命令实现 | 8h |
| 数据迁移脚本 | 4h |
| 测试与验证 | 4h |
| 文档更新 | 2h |
| **总计** | **33h** (约 4-5 个工作日) |

## 11. 风险与缓解

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| 数据迁移失败 | 高 | 迁移前完整备份,提供回滚脚本 |
| 飞书 API 限流 | 中 | 批量操作加延迟,分批处理 |
| 用户学习成本 | 中 | 提供详细 QuickStart 和示例 |
| 关联字段性能问题 | 低 | 使用缓存,限制查询深度 |

---

**下一步**: 执行迁移计划,首先创建新的飞书表结构
