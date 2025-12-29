---
name: retail-audit
description: 零售业务审计专家。当用户需要以下内容时使用此 skill：(1) 审计当前项目是否符合零售/电商行业标准；(2) 识别商品管理、库存管理、订单管理、会员系统、促销系统等模块的问题；(3) 对比零售最佳实践，给出优化建议；(4) 生成结构化审计报告。触发词：审计、检查、评估、优化建议、零售标准、电商标准、最佳实践、代码审查、架构评审。
---

# 零售业务审计专家

对零售/电商项目进行全面审计，识别与行业标准的差距，提供优化建议。

## 核心能力

### 1. 项目理解
通过遍历项目文档和代码，深入理解项目现状：
- 规格文档（specs/）
- 项目规则（.claude/rules/）
- 项目说明（CLAUDE.md）
- 后端代码（backend/）
- 前端代码（frontend/）

### 2. 零售标准对比
基于零售/电商行业最佳实践，审计以下领域：
- 商品管理（SPU/SKU）
- 库存管理（多仓、锁定、事务）
- 订单管理（状态机、售后）
- 会员系统（等级、积分）
- 促销系统（规则引擎）
- API 设计（RESTful）
- 数据库设计（审计字段）
- 前端架构（状态管理）

### 3. 审计报告生成
输出结构化审计报告，包括：
- 符合度评分
- 问题清单（优先级分类）
- 改进建议（附代码示例）
- 行动计划

## 审计流程

### 步骤 1: 确认审计范围

向用户确认审计范围：
- 全面审计（所有模块）
- 针对性审计（指定模块，如"只审计库存管理"）
- 快速审计（仅检查高优先级问题）

### 步骤 2: 扫描项目

自动遍历项目结构，收集关键信息。使用 Glob 和 Read 工具查找关键文件：

```
# 扫描规格文档
Read specs/**/spec.md

# 扫描项目规则
Read .claude/rules/*.md

# 扫描 CLAUDE.md
Read CLAUDE.md

# 扫描后端核心文件
Glob backend/src/**/entity/*.java
Glob backend/src/**/dto/*.java
Glob backend/src/**/controller/*.java
Glob backend/src/**/service/*.java

# 扫描前端核心文件
Glob frontend/src/**/types/*.ts
Glob frontend/src/**/services/*.ts
Glob frontend/src/**/stores/*.ts
```

### 步骤 3: 加载零售最佳实践

根据审计范围，加载相关参考文档：

- **零售最佳实践**: 见 [retail-best-practices.md](references/retail-best-practices.md)
- **审计检查清单**: 见 [audit-checklist.md](references/audit-checklist.md)
- **常见问题和反模式**: 见 [common-issues.md](references/common-issues.md)

### 步骤 4: 执行审计

针对每个审计领域，执行检查并对比最佳实践。

### 步骤 5: 生成审计报告

使用报告模板: [audit-report-template.md](assets/audit-report-template.md)

### 步骤 6: 输出报告

向用户展示 Markdown 格式的完整审计报告。

## 问题优先级定义

- 🔴 高优先级：影响核心业务逻辑、安全风险、数据一致性问题
- 🟡 中优先级：影响用户体验、功能不完整、代码可维护性
- 🟢 低优先级：代码风格、文档完善、可选功能

## 注意事项

1. 客观中立，基于事实和标准
2. 提供可执行的改进建议
3. 合理划分问题优先级
4. 提供清晰的代码示例
5. 引用零售最佳实践文档
6. 遵循项目的 .claude/rules 规范
