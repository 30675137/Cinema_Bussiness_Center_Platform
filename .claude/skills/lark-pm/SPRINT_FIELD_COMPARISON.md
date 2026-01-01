# Sprint 表字段对比与实施计划

**@spec T004-lark-project-management**

## 一、现有 Sprint 表字段

**表 ID**: `tbllbcahbnPvidbE`
**表名**: `迭代 (Sprint)`

当前字段列表：
1. **Sprint 名称** (Text / 单行文本) - ✅ 已存在

## 二、设计方案要求的字段

根据 `SPRINT_MANAGEMENT_DESIGN.md`，完整字段列表如下：

| 序号 | 字段名 | 字段类型 | 是否必填 | 当前状态 | 实施操作 |
|-----|--------|---------|---------|---------|---------|
| 1 | Sprint ID | 单行文本 | ✅ | ❌ 缺失 | **需新增** |
| 2 | Sprint 名称 | 单行文本 | ✅ | ✅ 已存在 | 保留 |
| 3 | spec_id | 单行文本 | ✅ | ❌ 缺失 | **需新增** |
| 4 | 目标 | 多行文本 | ⚪ | ❌ 缺失 | **需新增** |
| 5 | 开始日期 | 日期 | ⚪ | ❌ 缺失 | **需新增** |
| 6 | 结束日期 | 日期 | ⚪ | ❌ 缺失 | **需新增** |
| 7 | 状态 | 单选 | ✅ | ❌ 缺失 | **需新增** |
| 8 | **计划文档内容** | 多行文本 | ⚪ | ❌ 缺失 | **需新增（关键）** |
| 9 | **计划文档链接** | URL | ⚪ | ❌ 缺失 | **需新增（关键）** |
| 10 | 关联 Epic | 关联字段 | ⚪ | ❌ 缺失 | **需新增** |
| 11 | 速度 | 数字 | ⚪ | ❌ 缺失 | **需新增** |
| 12 | 容量 | 数字 | ⚪ | ❌ 缺失 | **需新增** |
| 13 | 负责人 | 人员 | ⚪ | ❌ 缺失 | **需新增** |
| 14 | 备注 | 多行文本 | ⚪ | ❌ 缺失 | **需新增** |

**统计**:
- ✅ 已存在: 1 个字段
- ❌ 需新增: 13 个字段

## 三、字段详细说明

### 3.1 核心字段（P0 优先级）

#### Sprint ID（单行文本，必填）
- **用途**: Sprint 的唯一标识
- **示例**: `Sprint 1`, `Sprint 0 - Tech Design`
- **验证规则**: 不允许重复

#### spec_id（单行文本，必填）
- **用途**: 关联到功能规格
- **示例**: `T004-lark-project-management`
- **格式**: `<模块前缀>###-<slug>`

#### 状态（单选，必填）
- **用途**: Sprint 当前状态
- **选项**:
  - `📝 规划中` - Sprint Planning 阶段
  - `🚀 进行中` - Sprint 执行中
  - `✅ 已完成` - Sprint 已结束，待评审
  - `📊 已评审` - Sprint Retrospective 完成

#### 计划文档内容（多行文本，可选）⭐
- **用途**: 存储 plan.md 的完整内容
- **重要性**: ⭐⭐⭐ 核心字段，用于存储技术方案
- **示例**:
  ```markdown
  ## 技术方案

  ### 数据库设计
  使用 Supabase PostgreSQL 存储...

  ### API 设计
  - POST /api/sprint/create
  - GET /api/sprint/list
  ```

#### 计划文档链接（URL，可选）⭐
- **用途**: 指向 GitHub/GitLab 上的 plan.md 文件
- **重要性**: ⭐⭐⭐ 核心字段，便于查看在线版本
- **示例**: `https://github.com/org/repo/blob/main/specs/T004-lark-project-management/plan.md`

### 3.2 时间管理字段（P1 优先级）

#### 开始日期（日期，可选）
- **用途**: Sprint 开始时间
- **示例**: `2026-01-01`

#### 结束日期（日期，可选）
- **用途**: Sprint 结束时间
- **示例**: `2026-01-14` (14天 Sprint)

### 3.3 规划与跟踪字段（P1 优先级）

#### 目标（多行文本，可选）
- **用途**: Sprint 目标描述
- **示例**: `完成 Sprint 管理系统的基础 CRUD 功能`

#### 速度（数字，可选）
- **用途**: Sprint 实际完成的故事点
- **示例**: `13`
- **计算方式**: 所有已完成 User Story 的估算点数总和

#### 容量（数字，可选）
- **用途**: Sprint 计划容量（故事点）
- **示例**: `15`
- **用途**: 用于计算 Sprint 完成率 = 速度 / 容量

### 3.4 协作字段（P2 优先级）

#### 关联 Epic（关联字段，可选）
- **用途**: 关联到 Product Backlog 表的 Epic 记录
- **关联表**: 产品待办列表 (Product Backlog)
- **允许多选**: 否

#### 负责人（人员，可选）
- **用途**: Scrum Master 或 Sprint 负责人
- **示例**: @张三

#### 备注（多行文本，可选）
- **用途**: 其他说明信息
- **示例**: `本次 Sprint focus on UI 实现，后端 API 已就绪`

## 四、实施步骤

### Phase 1: 手动添加字段（推荐）⭐

**原因**: 飞书多维表格 UI 操作更直观，支持拖拽调整字段顺序

**步骤**:
1. 打开飞书多维表格：https://example.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb?table=tbllbcahbnPvidbE
2. 点击表格右上角"+"添加字段
3. 按照上述"字段详细说明"逐个添加 13 个字段
4. 配置字段类型、必填项、选项等

**优先添加**（P0）:
- Sprint ID
- spec_id
- 状态
- 计划文档内容 ⭐
- 计划文档链接 ⭐

### Phase 2: API 批量添加（备选）

**注意**: 使用 API 添加字段需要谨慎，建议先在测试环境验证

```typescript
// src/commands/sprint/init-fields.ts
export async function initSprintFields() {
  const service = new LarkBitableService();

  const fieldsToAdd = [
    { field_name: 'Sprint ID', type: 1, ui_type: 'Text' },
    { field_name: 'spec_id', type: 1, ui_type: 'Text' },
    // ... 其他字段
  ];

  for (const field of fieldsToAdd) {
    await service.createField({
      app_token: 'Y05Mb7greapFiSseRpoc5XkXnrb',
      table_id: 'tbllbcahbnPvidbE',
      field
    });
  }
}
```

## 五、Product Backlog 表增强

根据设计方案，Product Backlog 表也需要新增字段：

**新增字段**:
| 字段名 | 字段类型 | 用途 |
|--------|---------|------|
| 技术方案链接 | URL | 指向 plan.md 文件 |
| user_story_id | 单行文本 | User Story 编号（US1, US2...） |
| 关联 Epic | 关联字段 | 关联到同表的 Epic 记录 |

**实施方式**: 同样建议手动添加字段

## 六、任务管理表增强

**新增字段**:
| 字段名 | 字段类型 | 用途 |
|--------|---------|------|
| sprint_id | 单行文本 | 所属 Sprint（如 "Sprint 1"） |
| user_story_id | 单行文本 | 关联的 User Story（如 "US1"） |
| task_id | 单行文本 | 任务编号（如 "T007"） |

## 七、验收标准

完成字段添加后，应满足以下条件：

1. ✅ Sprint 表包含所有 14 个字段
2. ✅ "计划文档内容"字段类型为"多行文本"
3. ✅ "计划文档链接"字段类型为"URL"
4. ✅ "状态"字段包含 4 个选项（📝 规划中 / 🚀 进行中 / ✅ 已完成 / 📊 已评审）
5. ✅ "关联 Epic"字段正确关联到 Product Backlog 表
6. ✅ Product Backlog 表增加了"技术方案链接"、"user_story_id"、"关联 Epic"字段
7. ✅ 任务管理表增加了"sprint_id"、"user_story_id"、"task_id"字段

## 八、后续命令实现

字段添加完成后，即可实现以下命令：

```bash
# 创建 Sprint（包含 plan.md 内容）
node dist/index.js sprint create \
  --sprint-id "Sprint 1" \
  --name "基础功能实现" \
  --spec-id "T004-lark-project-management" \
  --goal "完成 Sprint CRUD 命令" \
  --start-date "2026-01-01" \
  --end-date "2026-01-14" \
  --status "📝 规划中" \
  --plan-doc "$(cat specs/T004-lark-project-management/plan.md)" \
  --plan-link "https://github.com/.../plan.md"

# 列出所有 Sprints
node dist/index.js sprint list --spec-id "T004-lark-project-management"

# 查看 Sprint 状态
node dist/index.js sprint status --sprint-id "Sprint 1"
```

---

**创建日期**: 2026-01-01
**状态**: ✅ 分析完成，待手动添加字段
**建议**: 优先手动添加字段，确保数据一致性
