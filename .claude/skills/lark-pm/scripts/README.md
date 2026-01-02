# O006 Sprint 管理脚本

**@spec O006-miniapp-channel-order**

本目录包含 O006 小程序渠道商品订单适配项目的 Sprint 管理脚本，支持批量导入任务到飞书项目管理系统，并提供 Sprint 级别的任务管理功能。

## 📋 文件说明

- `import-o006-tasks.ts` - 批量导入 40 个任务到飞书项目管理系统
- `manage-sprints.sh` - Sprint 管理命令行工具
- `add-missing-fields.ts` - 飞书表格字段补充指南（解决 FieldNameNotFound 错误）
- `diagnose-table-fields.ts` - 表格字段诊断工具
- `README.md` - 本文档

## 🎯 Sprint 规划概览

| Sprint | Phase | 任务数 | 预计工时 | 主要工作 |
|--------|-------|--------|---------|---------|
| Sprint-1 | Setup & Infrastructure | 4 | 1.75h | 项目初始化、环境验证 |
| Sprint-2 | Foundational | 14 | 29h | 类型定义、样式、工具、API、Hooks、Store |
| Sprint-3 | User Story 1 | 3 | 9.5h | 浏览商品菜单 |
| Sprint-4 | User Story 2 | 4 | 16.5h | 商品详情选规格 |
| Sprint-5 | User Story 3 | 5 | 19h | 购物车订单提交 |
| Sprint-6 | User Story 4 | 5 | 17.5h | 订单状态查询 |
| Sprint-7 | Polish & Testing | 7 | 30h | 打磨、测试、文档 |

**总计**: 52 个任务，预计 123.25 小时

## 🚀 快速开始

### 1. 批量导入所有任务

```bash
cd .claude/skills/lark-pm

# 方式 A: 使用 TypeScript 脚本
npx tsx scripts/import-o006-tasks.ts

# 方式 B: 使用 Shell 脚本
./scripts/manage-sprints.sh import
```

**导入内容**:
- ✅ 52 个任务全部导入
- ✅ 每个任务包含完整信息（标题、优先级、Sprint标签、工时预估、依赖关系）
- ✅ 自动标记 spec-id 为 `O006`
- ✅ 初始状态为 `📝 待办`

### 2. 查看 Sprint 任务列表

```bash
# 查看 Sprint 1 的所有任务
./scripts/manage-sprints.sh list 1

# 或使用 lark-pm 命令
npx tsx src/index.ts task list --tags "Sprint-1"
```

### 3. 查看所有 Sprint 统计

```bash
./scripts/manage-sprints.sh stats
```

输出示例：
```
📊 Sprint 统计信息:

Sprint 1:
  总任务数: 4
  已完成: 0
  进行中: 0
  待办: 4

Sprint 2:
  总任务数: 14
  已完成: 0
  进行中: 0
  待办: 14
...
```

### 4. 查看 Sprint 进度

```bash
./scripts/manage-sprints.sh progress 2
```

输出示例：
```
📈 Sprint 2 进度:

  总任务数: 14
  已完成: 5
  进行中: 3
  待办: 6

  完成率: 35%
```

## 📊 Sprint 管理流程

### 启动 Sprint

将 Sprint 中所有待办任务标记为 `🚀 进行中`：

```bash
./scripts/manage-sprints.sh start 1
```

### 完成 Sprint

将 Sprint 中所有任务标记为 `✅ 已完成`（进度 100%）：

```bash
./scripts/manage-sprints.sh complete 1
```

### 导出 Sprint 报告

导出指定 Sprint 的任务到 Excel：

```bash
./scripts/manage-sprints.sh export 2
# 输出文件: sprint-2-tasks.xlsx
```

## 🔍 高级查询

### 按 Sprint + 状态筛选

```bash
# 查看 Sprint 2 中进行中的任务
npx tsx src/index.ts task list --tags "Sprint-2" --status "🚀 进行中"

# 查看 Sprint 3 中已完成的任务
npx tsx src/index.ts task list --tags "Sprint-3" --status "✅ 已完成"
```

### 按 Sprint + 优先级筛选

```bash
# 查看 Sprint 2 中高优先级任务
npx tsx src/index.ts task list --tags "Sprint-2" --priority "🔴 高"
```

### 按 Sprint + 标签组合筛选

```bash
# 查看 Sprint 2 中前端任务
npx tsx src/index.ts task list --tags "Sprint-2" "Frontend"

# 查看 Sprint 7 中测试任务
npx tsx src/index.ts task list --tags "Sprint-7" "Test"
```

## 📦 任务标签说明

每个任务包含以下标签组合：

### Sprint 标签
- `Sprint-1` ~ `Sprint-7`: 标识任务所属 Sprint

### 功能标签
- `Infra`: 基础设施任务
- `Frontend`: 前端开发任务
- `Backend`: 后端相关任务
- `Design`: UI/样式任务
- `Test`: 测试任务
- `Docs`: 文档任务

## 🔄 更新任务状态

### 单个任务

```bash
# 标记任务为进行中
npx tsx src/index.ts task update \
  --task-id rec1234567890 \
  --status "🚀 进行中" \
  --progress 50

# 标记任务为已完成
npx tsx src/index.ts task update \
  --task-id rec1234567890 \
  --status "✅ 已完成" \
  --progress 100
```

### 批量更新（通过脚本）

```bash
# 启动整个 Sprint
./scripts/manage-sprints.sh start 2

# 完成整个 Sprint
./scripts/manage-sprints.sh complete 2
```

## 📈 查看项目总体进度

```bash
# 查看所有 O006 任务
npx tsx src/index.ts task list --spec-id "O006"

# 导出所有 O006 任务到 Excel
npx tsx src/index.ts task export \
  --format excel \
  --output o006-all-tasks.xlsx \
  --spec-id "O006"
```

## 🛠️ 自定义与扩展

### 修改任务数据

编辑 `import-o006-tasks.ts` 文件中的任务数组：

```typescript
const phase1Tasks: Task[] = [
  {
    id: 'SETUP-001',
    title: '创建功能分支...',
    priority: '🔴 高',
    sprint: 'Sprint-1',
    phase: 'Phase 1: Setup & Infrastructure',
    tags: ['Infra'],
    notes: '依赖：无',
    estimatedHours: 0.5
  },
  // 修改或添加新任务...
];
```

### 重新导入任务

```bash
# 1. 删除旧任务（在飞书多维表格中手动删除，或标记为已取消）
npx tsx src/index.ts task list --spec-id "O006" | grep "rec" | while read task_id; do
  npx tsx src/index.ts task delete --task-id "$task_id" --confirm
done

# 2. 重新导入
npx tsx scripts/import-o006-tasks.ts
```

## 🎯 最佳实践

### Sprint 工作流建议

1. **Sprint 开始前**:
   ```bash
   # 查看 Sprint 任务列表
   ./scripts/manage-sprints.sh list 1

   # 查看任务依赖关系（参考 tasks.md 依赖图）
   cat ../../specs/O006-miniapp-channel-order/tasks.md
   ```

2. **Sprint 启动**:
   ```bash
   # 标记所有任务为进行中
   ./scripts/manage-sprints.sh start 1
   ```

3. **Sprint 执行中**:
   ```bash
   # 每天查看进度
   ./scripts/manage-sprints.sh progress 1

   # 更新单个任务状态
   npx tsx src/index.ts task update --task-id recXXX --status "✅ 已完成" --progress 100
   ```

4. **Sprint 结束**:
   ```bash
   # 导出 Sprint 报告
   ./scripts/manage-sprints.sh export 1

   # 标记 Sprint 完成
   ./scripts/manage-sprints.sh complete 1
   ```

### 并行开发建议

参考 `tasks.md` 中的并行执行策略：

```bash
# Sprint 2 可并行开发的任务组
# 第一批：类型定义 + 样式
./scripts/manage-sprints.sh list 2 | grep "TYPE\|STYLE"

# 第二批：工具函数 + API 服务
./scripts/manage-sprints.sh list 2 | grep "UTIL\|API"

# 第三批：状态管理 + Hooks
./scripts/manage-sprints.sh list 2 | grep "STORE\|HOOK"
```

## 📚 相关文档

- **任务详情**: `specs/O006-miniapp-channel-order/tasks.md`
- **功能规格**: `specs/O006-miniapp-channel-order/spec.md`
- **实施计划**: `specs/O006-miniapp-channel-order/plan.md`
- **数据模型**: `specs/O006-miniapp-channel-order/data-model.md`
- **API 契约**: `specs/O006-miniapp-channel-order/contracts/api.yaml`

## 🔧 故障排除

### 问题 1: FieldNameNotFound 错误

**症状**: 批量导入时所有任务创建失败，错误提示 `FieldNameNotFound`

**原因**: 飞书表格缺少必需字段

**解决方案**:
```bash
# 1. 运行字段补充指南
cd .claude/skills/lark-pm
npx tsx scripts/add-missing-fields.ts

# 2. 按照指南在飞书表格中添加缺失字段：
#    - 规格ID (文本)
#    - 预计工时 (数字)
#    - 标签 (多选)
#    - 进度 (数字)
#    - 备注 (文本)

# 3. 重新运行导入
npx tsx scripts/import-o006-tasks.ts
```

**重要提示**:
- ✅ 字段名称必须完全匹配（包括中文字符）
- ✅ 添加字段不会删除现有数据
- ✅ "标签"字段选项: Frontend, Backend, Test, Docs, Design, Infra

### 问题 2: "未找到配置"

```bash
# 确保已初始化飞书 Base App
cd .claude/skills/lark-pm
npx tsx src/index.ts init
```

### 问题 3: Token 过期

```bash
# 重新获取 User Access Token
npm run auth

# 或手动更新 .env 文件中的 LARK_USER_ACCESS_TOKEN
```

### 问题 4: 导入部分失败

检查错误日志，常见原因：
- ❌ 飞书 API 权限不足 → 检查应用权限配置
- ❌ 字段验证失败 → 检查枚举值是否匹配（优先级、状态、标签）
- ❌ 网络超时 → 重试或减少批量导入数量

### 问题 4: jq 命令未找到

```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq
```

## 📞 支持

如有问题，请参考：
- Lark PM 主文档: `.claude/skills/lark-pm/README.md`
- 飞书开放平台文档: https://open.feishu.cn/document

---

**Last Updated**: 2026-01-02
**Spec**: O006-miniapp-channel-order
**Total Tasks**: 52
**Total Sprints**: 7
