# T004 项目管理系统 - Backlog 拆解方案

**@spec T004-lark-project-management**

**拆解日期**: 2025-12-31
**拆解模式**: Scrum - Epic → User Story → Task

---

## 📊 Epic 总览

**Epic**: T004 - Lark MCP Scrum 项目管理系统

**Epic 目标**: 构建基于飞书多维表格的 Scrum 敏捷项目管理系统，支持 Product Backlog、Sprint、Task、Bug、Technical Debt 全生命周期管理。

**业务价值**: 95/100
**总故事点估算**: 55 (拆分为 6 个 User Story)
**预计 Sprint**: 4-5 个 Sprint (2 周/Sprint)

---

## 🎯 Product Backlog 拆解

### PBI-001: 飞书多维表格基础架构搭建

**标题**: [T004-PBI-001] 飞书多维表格基础架构搭建

**类型**: User Story

**优先级**: 🔴 P0 (必须首先完成)

**状态**: ✅ 已完成 (2025-12-31 已创建 5 个表)

**故事点**: 8

**负责人**: Product Owner + Tech Lead

**spec_id**: T004

**验收标准**:
1. ✅ 创建 5 个核心表: Product Backlog, Sprint, Task, Bug, Technical Debt
2. ✅ Product Backlog 表包含完整字段 (10 个)
3. ⏸️ 其他 4 个表补充完整字段
4. ⏸️ 配置双向关联字段 (Product Backlog ↔ Sprint, Task ↔ Sprint, etc.)
5. ⏸️ 创建常用视图 (按优先级、按 Sprint、我的任务)
6. ⏸️ 赋予团队成员编辑权限

**描述**:
作为项目管理员，我需要搭建飞书多维表格的基础架构，以便团队可以开始使用 Scrum 工作流。

**场景**:
- 创建新的 Lark Base App
- 设计并创建 5 个核心表
- 配置字段和关联关系
- 设置权限和视图

**业务价值**: 100 (基础设施，必须完成)

**当前进度**: 60% (表已创建，字段需补充)

---

### PBI-002: Scrum 工作流文档编写

**标题**: [T004-PBI-002] Scrum 工作流文档编写

**类型**: User Story

**优先级**: 🔴 P0 (必须与基础架构同步完成)

**状态**: ✅ 已完成 (2025-12-31)

**故事点**: 5

**负责人**: Scrum Master

**spec_id**: T004

**验收标准**:
1. ✅ 创建 Scrum 数据模型文档 (data-model-scrum.md)
2. ✅ 创建 Scrum 工作流指南 (scrum-workflow.md)
3. ✅ 创建迁移指南 (migration-guide.md)
4. ✅ 创建实施总结 (SCRUM_IMPLEMENTATION_SUMMARY.md)
5. ⏸️ 更新 lark-pm skill.md 文档
6. ⏸️ 创建培训材料 (PPT/视频)

**描述**:
作为 Scrum Master，我需要编写完整的 Scrum 工作流文档，以便团队成员能够快速上手并正确使用 Scrum 流程。

**场景**:
- 团队成员第一次使用 Scrum
- 需要参考文档进行 Sprint Planning
- 需要了解如何创建 User Story 和 Task

**业务价值**: 95 (保证流程规范)

**当前进度**: 80% (核心文档已完成，培训材料待创建)

---

### PBI-003: lark-pm CLI 工具 Scrum 命令开发

**标题**: [T004-PBI-003] lark-pm CLI 工具 Scrum 命令开发

**类型**: User Story

**优先级**: 🟠 P1 (提升效率)

**状态**: 📝 待规划

**故事点**: 13

**负责人**: Backend Developer

**spec_id**: T004

**验收标准**:
1. 支持 Product Backlog 管理命令:
   - `/lark-pm backlog-create` - 创建 User Story
   - `/lark-pm backlog-list` - 列出待办项
   - `/lark-pm backlog-update` - 更新待办项状态
2. 支持 Sprint 管理命令:
   - `/lark-pm sprint-create` - 创建 Sprint
   - `/lark-pm sprint-start` - 启动 Sprint
   - `/lark-pm sprint-close` - 关闭 Sprint
   - `/lark-pm sprint-stats` - 查看 Sprint 统计
3. 支持任务管理命令:
   - `/lark-pm task-create` - 创建任务 (关联 User Story)
   - `/lark-pm task-list` - 列出任务
   - `/lark-pm task-update` - 更新任务状态
4. 支持 Bug 和技术债管理命令
5. 所有命令支持 `--help` 参数显示帮助信息
6. 命令输出格式友好 (表格/JSON)

**描述**:
作为开发人员，我需要通过 Claude Code CLI 快速创建和管理 Scrum 工件，而不需要每次都打开飞书界面，以便提高工作效率。

**场景**:
- 快速创建 User Story 和 Task
- 批量更新任务状态
- 查看 Sprint 进度和统计数据
- 导出数据为 Excel/CSV

**业务价值**: 80 (提升效率，但非必须)

**依赖**: PBI-001 (表结构必须先完成)

---

### PBI-004: 团队 Scrum 培训与试运行

**标题**: [T004-PBI-004] 团队 Scrum 培训与试运行

**类型**: Spike (调研任务)

**优先级**: 🟠 P1

**状态**: 📝 待规划

**故事点**: 3

**负责人**: Scrum Master

**spec_id**: T004

**验收标准**:
1. 完成 Scrum 培训会 (2 小时)
   - Scrum 基本概念讲解
   - 飞书表操作演示
   - 工作流演练
2. 组织第一次 Sprint Planning
   - 创建 Sprint 1
   - 选择 3-5 个 User Story
   - 拆解任务并估算工时
3. 试运行第一个 Sprint (2 周)
   - 执行 Daily Standup
   - 跟踪任务进度
   - 收集问题和反馈
4. 完成第一次 Sprint Review 和 Retrospective
5. 总结经验教训并优化流程

**描述**:
作为 Scrum Master，我需要组织团队培训和试运行，确保团队理解并能够正确使用 Scrum 流程，找出潜在问题并优化。

**场景**:
- 团队第一次使用 Scrum
- 需要实践验证流程是否可行
- 收集团队反馈并改进

**业务价值**: 90 (保证流程落地)

**依赖**: PBI-001, PBI-002

---

### PBI-005: 自动化指标统计与可视化

**标题**: [T004-PBI-005] 自动化指标统计与可视化

**类型**: User Story

**优先级**: 🟡 P2 (增强功能)

**状态**: 📝 待规划

**故事点**: 13

**负责人**: Backend Developer + Frontend Developer

**spec_id**: T004

**验收标准**:
1. Sprint Burndown Chart (燃尽图)
   - 自动计算每日剩余故事点
   - 可视化展示 (飞书看板或独立页面)
2. Team Velocity Tracking (团队速率跟踪)
   - 记录每个 Sprint 的完成故事点
   - 计算平均速率
   - 趋势图展示
3. Bug 统计分析
   - 按严重程度统计
   - 按发现环境统计
   - 修复时长分析
4. 技术债统计
   - 按类型统计
   - 按影响程度统计
   - 技术债占比分析
5. 导出功能
   - 支持导出为 Excel/PDF 报表
   - 支持定时发送到飞书群

**描述**:
作为 Scrum Master，我需要自动化的指标统计和可视化工具，以便快速了解团队表现、识别瓶颈并做出数据驱动的决策。

**场景**:
- Sprint Review 时展示燃尽图
- 向管理层汇报团队速率
- 分析 Bug 和技术债趋势
- 制定改进计划

**业务价值**: 75 (提升管理效率)

**依赖**: PBI-001, PBI-004 (需要积累至少 3 个 Sprint 的数据)

---

### PBI-006: 与 spec-driven 开发流程集成

**标题**: [T004-PBI-006] 与 spec-driven 开发流程集成

**类型**: User Story

**优先级**: 🟡 P2 (优化集成)

**状态**: 📝 待规划

**故事点**: 8

**负责人**: Tech Lead

**spec_id**: T004

**验收标准**:
1. 自动从 spec.md 创建 User Story
   - 解析 spec.md 标题作为 Story 标题
   - 提取验收标准
   - 自动设置 spec_id
2. 自动从 tasks.md 创建 Task
   - 解析 tasks.md 任务列表
   - 自动关联到 User Story
   - 估算工时
3. spec.md 与 User Story 双向同步
   - spec.md 更新时同步到 User Story
   - User Story 状态变更时更新 spec.md
4. 代码 `@spec` 标识与飞书表关联
   - 代码提交时自动更新任务进度
   - 支持通过 spec_id 查询相关任务
5. Git 提交自动关联任务
   - Commit message 包含任务 ID (如 TSK-001)
   - 自动更新任务状态

**描述**:
作为开发人员，我需要 Scrum 项目管理系统与现有的 spec-driven 开发流程无缝集成，减少重复录入和手动同步的工作量。

**场景**:
- 编写 spec.md 后自动生成 User Story
- 代码提交后自动更新任务进度
- 查看某个 spec 的所有相关任务和进度

**业务价值**: 70 (减少重复劳动)

**依赖**: PBI-001, PBI-003

---

## 📋 Task 拆解示例

### PBI-001 任务拆解

#### TSK-001: 手动补充 Sprint 表字段

**任务标题**: [T004-TSK-001] 手动补充 Sprint 表字段

**User Story**: PBI-001 - 飞书多维表格基础架构搭建

**状态**: 📝 待办

**负责人**: [管理员]

**优先级**: 🔴 高

**预估工时**: 1 小时

**实际工时**: -

**Sprint**: Sprint 1

**spec_id**: T004

**标签**: Infra

**描述**:
在飞书多维表格中手动添加 Sprint 表的 8 个字段：
- Sprint 编号 (AutoNumber)
- 开始日期 (DateTime)
- 结束日期 (DateTime)
- Sprint 目标 (Text)
- 状态 (SingleSelect)
- 总故事点 (Number)
- 完成故事点 (Number)
- 完成率 (Progress)

参考: data-model-scrum.md 第 2 节

---

#### TSK-002: 手动补充 Task 表字段

**任务标题**: [T004-TSK-002] 手动补充 Task 表字段

**User Story**: PBI-001

**状态**: 📝 待办

**负责人**: [管理员]

**优先级**: 🔴 高

**预估工时**: 1 小时

**spec_id**: T004

**标签**: Infra

**描述**:
在飞书多维表格中手动添加 Task 表的 12 个字段（参考 data-model-scrum.md 第 3 节）

---

#### TSK-003: 手动补充 Bug 表字段

**任务标题**: [T004-TSK-003] 手动补充 Bug 表字段

**User Story**: PBI-001

**状态**: 📝 待办

**负责人**: [管理员]

**优先级**: 🔴 高

**预估工时**: 1 小时

**spec_id**: T004

**标签**: Infra

---

#### TSK-004: 手动补充 Technical Debt 表字段

**任务标题**: [T004-TSK-004] 手动补充 Technical Debt 表字段

**User Story**: PBI-001

**状态**: 📝 待办

**负责人**: [管理员]

**优先级**: 🔴 高

**预估工时**: 1 小时

**spec_id**: T004

**标签**: Infra

---

#### TSK-005: 配置双向关联字段

**任务标题**: [T004-TSK-005] 配置双向关联字段

**User Story**: PBI-001

**状态**: 📝 待办

**负责人**: [管理员]

**优先级**: 🔴 高

**预估工时**: 2 小时

**spec_id**: T004

**标签**: Infra

**描述**:
配置以下双向关联:
1. Product Backlog ↔ Sprint
2. Task ↔ Product Backlog (User Story)
3. Task ↔ Sprint
4. Bug ↔ Product Backlog
5. Bug ↔ Sprint
6. TechnicalDebt ↔ Sprint

---

#### TSK-006: 创建常用视图

**任务标题**: [T004-TSK-006] 创建常用视图

**User Story**: PBI-001

**状态**: 📝 待办

**负责人**: [管理员]

**优先级**: 🟡 中

**预估工时**: 2 小时

**spec_id**: T004

**标签**: Infra

**描述**:
为每个表创建常用视图:
- Product Backlog: 按优先级、当前 Sprint、按模块
- Task: 我的任务、当前 Sprint、看板视图
- Bug: 待修复、按严重程度
- TechnicalDebt: 待处理、按类型

---

#### TSK-007: 删除旧表

**任务标题**: [T004-TSK-007] 删除旧表

**User Story**: PBI-001

**状态**: 📝 待办

**负责人**: [管理员]

**优先级**: 🟢 低

**预估工时**: 0.5 小时

**spec_id**: T004

**标签**: Infra

**描述**:
删除 6 个旧表 (备份后):
- 数据表
- 测试记录
- 功能矩阵
- Bug 跟踪
- 技术债 (旧)
- 任务管理

---

### PBI-002 任务拆解

#### TSK-008: 更新 lark-pm skill.md 文档

**任务标题**: [T004-TSK-008] 更新 lark-pm skill.md 文档

**User Story**: PBI-002 - Scrum 工作流文档编写

**状态**: 📝 待办

**负责人**: Tech Writer

**优先级**: 🟡 中

**预估工时**: 2 小时

**spec_id**: T004

**标签**: Docs

**描述**:
更新 `.claude/skills/lark-pm/skill.md` 以反映 Scrum 模式:
- 更新 description
- 添加 Scrum 命令示例
- 更新数据模型说明
- 添加 Scrum 工作流链接

---

#### TSK-009: 创建 Scrum 培训 PPT

**任务标题**: [T004-TSK-009] 创建 Scrum 培训 PPT

**User Story**: PBI-002

**状态**: 📝 待办

**负责人**: Scrum Master

**优先级**: 🟡 中

**预估工时**: 4 小时

**spec_id**: T004

**标签**: Docs

**描述**:
创建 Scrum 培训材料:
- Scrum 基本概念 (10 页)
- 飞书表操作演示 (5 页)
- 工作流演练 (5 页)
- Q&A (2 页)

---

### PBI-003 任务拆解

#### TSK-010: 实现 backlog-* 命令

**任务标题**: [T004-TSK-010] 实现 backlog-* 命令

**User Story**: PBI-003 - lark-pm CLI 工具 Scrum 命令开发

**状态**: 📝 待办

**负责人**: Backend Developer

**优先级**: 🟠 P1

**预估工时**: 8 小时

**spec_id**: T004

**标签**: Backend

**描述**:
实现 Product Backlog 管理命令:
- backlog-create
- backlog-list
- backlog-update
- backlog-delete

包含单元测试和文档。

---

#### TSK-011: 实现 sprint-* 命令

**任务标题**: [T004-TSK-011] 实现 sprint-* 命令

**User Story**: PBI-003

**状态**: 📝 待办

**负责人**: Backend Developer

**优先级**: 🟠 P1

**预估工时**: 8 小时

**spec_id**: T004

**标签**: Backend

---

#### TSK-012: 实现 task-* 命令 (Scrum 模式)

**任务标题**: [T004-TSK-012] 实现 task-* 命令 (Scrum 模式)

**User Story**: PBI-003

**状态**: 📝 待办

**负责人**: Backend Developer

**优先级**: 🟠 P1

**预估工时**: 6 小时

**spec_id**: T004

**标签**: Backend

**描述**:
更新现有 task 命令以支持 Scrum:
- task-create: 支持关联 User Story 和 Sprint
- task-list: 支持按 Sprint 筛选
- task-update: 支持状态流转 (待办→进行中→测试中→已完成)

---

## 📊 Backlog 优先级排序

### Sprint 1 (立即开始)

优先级: 🔴 P0

**目标**: 完成基础架构搭建和文档编写

| PBI ID | 标题 | 故事点 | 任务数 |
|--------|------|--------|--------|
| PBI-001 | 飞书多维表格基础架构搭建 | 8 | 7 |
| PBI-002 | Scrum 工作流文档编写 | 5 | 2 |

**总故事点**: 13
**预计工时**: 14 小时
**预计完成日期**: 2026-01-03

### Sprint 2 (后续规划)

优先级: 🟠 P1

**目标**: 团队培训与 CLI 工具开发

| PBI ID | 标题 | 故事点 | 任务数 |
|--------|------|--------|--------|
| PBI-004 | 团队 Scrum 培训与试运行 | 3 | - |
| PBI-003 | lark-pm CLI 工具 Scrum 命令开发 | 13 | 3+ |

**总故事点**: 16
**预计完成日期**: 2026-01-17

### Sprint 3-4 (未来规划)

优先级: 🟡 P2

| PBI ID | 标题 | 故事点 |
|--------|------|--------|
| PBI-005 | 自动化指标统计与可视化 | 13 |
| PBI-006 | 与 spec-driven 开发流程集成 | 8 |

**总故事点**: 21

---

## 🎯 建议行动计划

### 本周 (2025-12-31 ~ 2026-01-05)

1. **管理员操作**:
   - [ ] 补充 Sprint 表字段 (TSK-001)
   - [ ] 补充 Task 表字段 (TSK-002)
   - [ ] 补充 Bug 表字段 (TSK-003)
   - [ ] 补充 TechnicalDebt 表字段 (TSK-004)
   - [ ] 配置双向关联 (TSK-005)

2. **Scrum Master 操作**:
   - [ ] 创建 Scrum 培训 PPT (TSK-009)
   - [ ] 更新 lark-pm skill 文档 (TSK-008)

### 下周 (2026-01-06 ~ 2026-01-10)

1. **团队培训**:
   - [ ] 组织 Scrum 培训会 (2 小时)
   - [ ] 演示飞书表操作

2. **第一次 Sprint Planning**:
   - [ ] 创建 Sprint 1
   - [ ] 将 PBI-001 和 PBI-002 的剩余任务规划到 Sprint 1
   - [ ] 团队成员认领任务

3. **开始 Sprint 1**:
   - [ ] 每天 9:30 AM Daily Standup
   - [ ] 更新任务状态
   - [ ] 跟踪燃尽图

---

## ✅ 确认清单

请确认以下拆解是否合理：

- [ ] **Epic 拆分**: T004 拆分为 6 个 User Story 是否合适？
- [ ] **故事点估算**: 总共 55 点是否合理？
- [ ] **优先级排序**: P0/P1/P2 的划分是否正确？
- [ ] **任务拆解**: PBI-001 的 7 个任务是否足够细化？
- [ ] **Sprint 规划**: Sprint 1 规划 13 点是否合适？
- [ ] **依赖关系**: 各 PBI 之间的依赖是否清晰？

**建议修改**:
- [ ] 调整故事点估算
- [ ] 调整优先级
- [ ] 增加/删除 User Story
- [ ] 调整任务拆解粒度
- [ ] 其他: _______________

---

**文档版本**: 1.0.0
**下一步**: 确认后导入飞书多维表格
