# Lark PM 项目管理系统 - 实施方案总览

**@spec T004-lark-project-management**

**创建日期**: 2025-12-31
**版本**: 1.0.0
**状态**: 设计阶段

---

## 📋 背景

Lark PM 项目管理系统当前实现与规格需求存在以下差距：

### 问题 1：未实现 Scrum 敏捷管理框架
- **现状**: 仅有 5 张简单表（任务、技术债、Bug、功能矩阵、测试记录）
- **需求**: 完整的 Scrum 数据模型（Epic、UserStory、Sprint、Task、Backlog）
- **影响**: 无法支持敏捷开发流程，缺乏迭代规划和速度跟踪能力

### 问题 2：Spec 与项目管理脱节
- **现状**: Spec（规格标识符）仅在代码中通过 `@spec` 注释体现
- **需求**: Spec 应该贯穿 Epic → Story → Task 全流程，支持按 Spec 统计进度
- **影响**: 无法追溯某个功能规格的开发进度，代码归属与项目管理割裂

### 问题 3：用户体验问题
- **现状**: init 命令仅支持手动输入 Base App Token
- **需求**: 支持用户直接粘贴完整飞书 URL，自动提取 Token
- **影响**: 用户体验不佳，容易出错

### 问题 4：命令结构不一致
- **现状**: 代码实现使用 Git 风格嵌套命令（`lark-pm task list`）
- **需求**: spec.md FR-015 明确要求扁平化命令（`lark-pm task-list`）
- **影响**: 与规格文档不一致，降低可维护性

---

## 🎯 实施目标

### 核心目标
1. ✅ 实现完整的 Scrum 敏捷开发管理框架
2. ✅ 建立 Spec 与 Scrum 数据模型的映射关系
3. ✅ 提升用户体验（URL 支持、命令标准化）
4. ✅ 确保代码实现与规格文档一致

### 成功标准
- [ ] 支持创建 Epic、UserStory、Sprint，并关联 Spec
- [ ] 支持 Sprint 规划会议（将 Backlog Story 分配到 Sprint）
- [ ] 支持按 Spec 统计开发进度（某个规格完成了多少 Story）
- [ ] 用户可以直接粘贴飞书 URL 完成 init
- [ ] 所有命令采用扁平化结构

---

## 📦 分阶段实施计划

### 阶段 1：URL 支持增强（1 天）
**目标**: 提升 init 命令用户体验

**交付物**:
- [ ] 修改 `init.ts`，支持从 URL 提取 Token
- [ ] 更新 QUICKSTART.md 文档
- [ ] 测试 URL 提取逻辑

**详细设计**: [phase-1-url-support.md](./phase-1-url-support.md)

---

### 阶段 2：命令结构标准化（2 天）
**目标**: 统一命令格式，符合 spec.md FR-015

**交付物**:
- [ ] 修改 `index.ts`，将所有命令改为扁平化结构
- [ ] 更新所有命令处理函数
- [ ] 更新 skill.md 和 `/pmp` 命令文档
- [ ] 测试所有现有命令

**详细设计**: [phase-2-command-standardization.md](./phase-2-command-standardization.md)

---

### 阶段 3：Spec 与 Scrum 映射关系（3 天）
**目标**: 建立业务需求（Spec）与项目管理（Scrum）的桥梁

**交付物**:
- [ ] 定义 Spec 在 Epic/Story/Task 中的继承规则
- [ ] 实现 Spec 关联字段验证
- [ ] 实现按 Spec 查询功能（`story-list --spec-id I003`）
- [ ] 实现按 Spec 统计进度（`spec-stats --spec-id I003`）
- [ ] 编写映射关系文档和最佳实践

**详细设计**: [phase-3-spec-scrum-mapping.md](./phase-3-spec-scrum-mapping.md)

---

### 阶段 4：Scrum 完整架构实现（5 天）
**目标**: 实现完整的 Scrum 敏捷开发框架

**交付物**:
- [ ] 创建 3 张新表（Epic、UserStory、Sprint）
- [ ] 调整 4 张现有表（Task、Bug、FeatureMatrix、TechnicalDebt）
- [ ] 实现 Epic 管理命令（epic-create/list/update/delete）
- [ ] 实现 Story 管理命令（story-create/list/update/delete）
- [ ] 实现 Sprint 管理命令（sprint-create/list/stats）
- [ ] 实现 Backlog 管理命令（backlog-list/prioritize）
- [ ] 实现 Sprint 规划功能（将 Story 分配到 Sprint）
- [ ] 更新所有文档

**详细设计**: [phase-4-scrum-architecture.md](./phase-4-scrum-architecture.md)

---

## 📊 实施时间表

| 阶段 | 工作量 | 风险等级 | 依赖 | 预计完成时间 |
|-----|--------|---------|------|------------|
| 阶段 1 | 1 天 | 🟢 低 | 无 | Day 1 |
| 阶段 2 | 2 天 | 🟡 中 | 阶段 1 | Day 3 |
| 阶段 3 | 3 天 | 🟡 中 | 阶段 2 | Day 6 |
| 阶段 4 | 5 天 | 🔴 高 | 阶段 3 | Day 11 |

**总工作量**: 11 天

---

## 🏗️ 架构演进

### 当前架构（V1.0）
```
5 张表（扁平结构）：
- 任务管理
- 技术债
- Bug 跟踪
- 功能矩阵
- 测试记录

问题：
- 无层级关系
- 缺少 Sprint 时间盒
- Spec 关联不明确
```

### 目标架构（V2.0）
```
7 张表（Scrum 层级结构）：

战略层: FeatureMatrix (功能矩阵)
         ↓ (一对多)
战术层: Epic (史诗) ← 关联规格 (Spec)
         ↓ (一对多)
迭代层: UserStory (用户故事) ← 关联规格 (Spec, 继承 Epic)
         ├─ 分配到 → Sprint (迭代)
         ├─ 拆分为 → Task (任务) ← 继承 Story Spec
         └─ 阻塞者 → Bug (缺陷) ← 关联规格 (Spec)

质量层: TechnicalDebt (技术债) ← 关联规格 (Spec)
```

**关键改进**:
- ✅ 完整的层级关系（Epic → Story → Task）
- ✅ Spec 贯穿全流程（Epic/Story/Bug/Debt 都关联 Spec）
- ✅ 支持 Sprint 迭代管理
- ✅ 支持 Backlog 管理

---

## 🔧 技术实施策略

### 数据迁移策略
**选项 A: 重建 Base App（推荐）**
- ✅ 优点: 干净的数据结构，避免冲突
- ❌ 缺点: 现有数据需要手动迁移
- 📝 建议: 阶段 4 开始前，在新的 Base App 中初始化 7 张表

**选项 B: 原地升级**
- ✅ 优点: 保留现有数据
- ❌ 缺点: 需要编写数据迁移脚本，风险较高
- 📝 不推荐

### 向后兼容性
- 阶段 1-2: 完全兼容现有功能
- 阶段 3: 新增 Spec 关联逻辑，现有命令仍可用
- 阶段 4: 引入新表和新命令，旧命令保留但标记为 deprecated

---

## 📚 文档更新清单

### 必须更新的文档
- [ ] `skill.md` - 更新命令列表和示例
- [ ] `QUICKSTART.md` - 更新快速上手指南
- [ ] `data-model.md` - 更新数据模型定义
- [ ] `/pmp` 命令文档 - 更新执行指南
- [ ] `README.md` - 更新项目说明

### 新增文档
- [ ] `scrum-workflow.md` - Scrum 工作流程指南
- [ ] `spec-management.md` - Spec 管理最佳实践
- [ ] `migration-guide.md` - V1 到 V2 迁移指南

---

## 🧪 测试策略

### 单元测试
- [ ] URL 提取逻辑测试
- [ ] Spec 继承规则测试
- [ ] 命令参数验证测试

### 集成测试
- [ ] Epic → Story → Task 创建流程
- [ ] Sprint 规划流程
- [ ] Spec 统计查询

### 端到端测试
- [ ] 完整的 Scrum 工作流（从 Epic 创建到 Sprint 完成）
- [ ] Spec 全生命周期追溯

---

## 🚀 上线检查清单

### 阶段 1 上线检查
- [ ] URL 提取功能正常
- [ ] 仍支持直接输入 Token
- [ ] 错误提示友好
- [ ] 文档已更新

### 阶段 2 上线检查
- [ ] 所有命令改为扁平化结构
- [ ] 现有功能无回归
- [ ] 命令帮助信息正确
- [ ] 文档已更新

### 阶段 3 上线检查
- [ ] Spec 关联字段正常工作
- [ ] Spec 继承逻辑正确
- [ ] Spec 统计查询准确
- [ ] 文档已更新

### 阶段 4 上线检查
- [ ] 7 张表结构正确
- [ ] 所有命令功能正常
- [ ] Sprint 规划流程流畅
- [ ] 数据迁移成功（如适用）
- [ ] 文档完整更新

---

## 📝 风险与应对

### 风险 1: 数据迁移失败
**影响**: 高
**概率**: 中
**应对**: 采用重建 Base App 策略，避免复杂迁移

### 风险 2: 命令结构修改导致用户习惯破坏
**影响**: 中
**概率**: 高
**应对**: 提供清晰的迁移指南，保留旧命令别名

### 风险 3: Spec 继承逻辑复杂，用户难以理解
**影响**: 中
**概率**: 中
**应对**: 提供详细文档和示例，设置合理默认值

### 风险 4: 工期延误
**影响**: 中
**概率**: 中
**应对**: 每个阶段独立交付，可以分批上线

---

## 🎯 下一步行动

1. **Review 本文档**: 确认实施方案可行性
2. **阅读各阶段详细设计**:
   - [阶段 1: URL 支持](./phase-1-url-support.md)
   - [阶段 2: 命令标准化](./phase-2-command-standardization.md)
   - [阶段 3: Spec-Scrum 映射](./phase-3-spec-scrum-mapping.md)
   - [阶段 4: Scrum 架构](./phase-4-scrum-architecture.md)
3. **创建新的 Spec**: 在 `specs/` 目录创建新规格，基于本方案开始实施
4. **按阶段执行**: 从阶段 1 开始，逐步推进

---

**文档版本**: 1.0.0
**最后更新**: 2025-12-31
**下次审核**: 实施开始前
