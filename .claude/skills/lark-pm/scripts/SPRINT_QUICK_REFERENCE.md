# Sprint 快速参考卡片

**@spec O006-miniapp-channel-order**

## 📋 一键命令

```bash
# 进入 lark-pm 目录
cd .claude/skills/lark-pm

# 批量导入所有任务
npx tsx scripts/import-o006-tasks.ts

# 查看 Sprint 1
./scripts/manage-sprints.sh list 1

# 查看所有 Sprint 统计
./scripts/manage-sprints.sh stats

# 启动 Sprint 2
./scripts/manage-sprints.sh start 2

# 查看 Sprint 2 进度
./scripts/manage-sprints.sh progress 2

# 完成 Sprint 2
./scripts/manage-sprints.sh complete 2

# 导出 Sprint 2 报告
./scripts/manage-sprints.sh export 2
```

## 🎯 7 个 Sprint 概览

| Sprint | Phase | 任务 | 工时 | 关键交付物 |
|--------|-------|------|------|-----------|
| **Sprint-1** | Setup & Infrastructure | 4 | 1.75h | ✅ 功能分支<br>✅ Taro 环境验证<br>✅ active_spec 配置 |
| **Sprint-2** | Foundational | 14 | 29h | ✅ TypeScript 类型定义<br>✅ 样式基础设施<br>✅ API 服务层<br>✅ TanStack Query Hooks<br>✅ Zustand Cart Store |
| **Sprint-3** | User Story 1 | 3 | 9.5h | ✅ 商品列表页<br>✅ 分类筛选<br>✅ 商品卡片展示 |
| **Sprint-4** | User Story 2 | 4 | 16.5h | ✅ 商品详情页<br>✅ 规格选择器组件<br>✅ 实时价格计算 |
| **Sprint-5** | User Story 3 | 5 | 19h | ✅ 购物车抽屉<br>✅ 订单提交<br>✅ Mock 支付 |
| **Sprint-6** | User Story 4 | 5 | 17.5h | ✅ 订单列表页<br>✅ 订单详情<br>✅ 状态轮询<br>✅ 取餐通知 |
| **Sprint-7** | Polish & Testing | 7 | 30h | ✅ 路由配置<br>✅ 错误处理<br>✅ 性能优化<br>✅ 单元测试<br>✅ E2E 测试<br>✅ 文档更新 |

**总计**: 52 任务, 123.25 小时 ≈ 15-16 人天

## 🔄 标准 Sprint 工作流

### 1️⃣ Sprint Planning (规划)

```bash
# 查看 Sprint 任务清单
./scripts/manage-sprints.sh list <sprint-number>

# 查看依赖关系
cat ../../specs/O006-miniapp-channel-order/tasks.md

# 分配任务给团队成员（在飞书多维表格中操作）
```

### 2️⃣ Sprint Kickoff (启动)

```bash
# 标记所有任务为 "进行中"
./scripts/manage-sprints.sh start <sprint-number>
```

### 3️⃣ Daily Standup (每日站会)

```bash
# 查看 Sprint 进度
./scripts/manage-sprints.sh progress <sprint-number>

# 查看特定状态的任务
npx tsx src/index.ts task list --tags "Sprint-<number>" --status "🚀 进行中"
```

### 4️⃣ Task Completion (任务完成)

```bash
# 更新单个任务
npx tsx src/index.ts task update \
  --task-id <rec-id> \
  --status "✅ 已完成" \
  --progress 100
```

### 5️⃣ Sprint Review (评审)

```bash
# 导出 Sprint 报告
./scripts/manage-sprints.sh export <sprint-number>

# 查看最终统计
./scripts/manage-sprints.sh stats
```

### 6️⃣ Sprint Retrospective (回顾)

```bash
# 标记 Sprint 完成
./scripts/manage-sprints.sh complete <sprint-number>

# 准备下一个 Sprint
./scripts/manage-sprints.sh list <next-sprint-number>
```

## 🏃 并行开发策略

### Sprint 2: Foundational (14 任务可分 3 批并行)

**第一批** (可同时开发):
```bash
npx tsx src/index.ts task list --tags "Sprint-2" | grep "TYPE-001\|TYPE-002\|TYPE-003\|STYLE-001\|STYLE-002"
```
- TYPE-001, TYPE-002, TYPE-003 (TypeScript 类型定义)
- STYLE-001, STYLE-002 (样式和图片资源)

**第二批** (依赖第一批):
```bash
npx tsx src/index.ts task list --tags "Sprint-2" | grep "UTIL-001\|API-001\|API-002"
```
- UTIL-001 (工具函数)
- API-001, API-002 (API 服务)

**第三批** (依赖第二批):
```bash
npx tsx src/index.ts task list --tags "Sprint-2" | grep "STORE-001\|HOOK-001\|HOOK-002\|HOOK-003"
```
- STORE-001 (购物车 Store)
- HOOK-001, HOOK-002, HOOK-003 (TanStack Query Hooks)

### Sprint 4 & Sprint 5 (页面并行开发)

```bash
# Sprint 4 商品详情页 + Sprint 5 购物车可部分并行
npx tsx src/index.ts task list --tags "Sprint-4" "Sprint-5"
```

## 📊 进度追踪示例

### 查看整体进度

```bash
# 所有 Sprint 概览
./scripts/manage-sprints.sh stats

# 输出示例：
# Sprint 1: 4 任务, 已完成 4 (100%)
# Sprint 2: 14 任务, 已完成 10 (71%)
# Sprint 3: 3 任务, 已完成 0 (0%)
# ...
```

### 查看当前 Sprint 详情

```bash
# Sprint 2 详细进度
./scripts/manage-sprints.sh progress 2

# 输出示例：
# 总任务数: 14
# 已完成: 10
# 进行中: 3
# 待办: 1
# 完成率: 71%
```

### 查看阻塞任务

```bash
# 查看所有进行中的任务（可能存在阻塞）
npx tsx src/index.ts task list --status "🚀 进行中" --spec-id "O006"
```

## 🎯 MVP 快速启动

如果只需要 MVP (浏览商品菜单功能):

```bash
# 导入所有任务
npx tsx scripts/import-o006-tasks.ts

# 仅启动 MVP 相关 Sprint
./scripts/manage-sprints.sh start 1  # Setup
./scripts/manage-sprints.sh start 2  # Foundational (部分任务)
./scripts/manage-sprints.sh start 3  # User Story 1 (MVP)

# 查看 MVP 任务
npx tsx src/index.ts task list --tags "Sprint-1"
npx tsx src/index.ts task list --tags "Sprint-3"
```

**MVP 任务清单** (10 个任务):
- Sprint-1: SETUP-001 ~ SETUP-004 (4 任务)
- Sprint-2: TYPE-001, API-001 部分, HOOK-001, STYLE-001, STYLE-002 (5 任务)
- Sprint-3: US1-001, US1-002, US1-003 (3 任务)

## 🔗 快捷链接

- **飞书多维表格**: 打开飞书 → 多维表格 → "项目管理系统"
- **任务详情**: `specs/O006-miniapp-channel-order/tasks.md`
- **功能规格**: `specs/O006-miniapp-channel-order/spec.md`
- **管理脚本**: `.claude/skills/lark-pm/scripts/manage-sprints.sh`

## 💡 提示

1. **每日更新**: 建议每日结束前更新任务进度
2. **依赖关系**: 参考 `tasks.md` 中的依赖图，避免阻塞
3. **并行开发**: 利用标签筛选独立任务，提高效率
4. **导出报告**: Sprint 结束时导出 Excel 报告存档
5. **标签一致**: 所有任务包含 `Sprint-X` 标签，便于筛选

---

**快速帮助**: `./scripts/manage-sprints.sh help`
