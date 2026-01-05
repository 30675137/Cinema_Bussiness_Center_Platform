# 代码健康报告

**项目**: {{projectName}}
**生成时间**: {{generatedAt}}
**检查范围**: {{scanScope}}
**报告版本**: {{reportVersion}}

---

## 📊 健康评分概览

| 指标 | 分数 | 等级 | 趋势 |
|------|------|------|------|
| **综合健康度** | {{overallScore}}/100 | {{overallGrade}} | {{overallTrend}} |
| 代码质量 | {{qualityScore}}/100 | {{qualityGrade}} | {{qualityTrend}} |
| 复杂度控制 | {{complexityScore}}/100 | {{complexityGrade}} | {{complexityTrend}} |
| 重复代码 | {{duplicationScore}}/100 | {{duplicationGrade}} | {{duplicationTrend}} |
| 架构健康 | {{architectureScore}}/100 | {{architectureGrade}} | {{architectureTrend}} |

### 评分标准

| 等级 | 分数范围 | 说明 |
|------|---------|------|
| 🟢 A | 90-100 | 优秀，保持当前状态 |
| 🟢 B | 80-89 | 良好，有小改进空间 |
| 🟡 C | 70-79 | 一般，需要关注 |
| 🟡 D | 60-69 | 较差，需要改进 |
| 🔴 F | <60 | 严重，需要立即行动 |

---

## 📈 统计概览

```
代码统计:
├── 文件总数: {{totalFiles}}
├── 代码行数: {{totalLines}}
├── 空白行数: {{blankLines}}
├── 注释行数: {{commentLines}}
└── 代码占比: {{codeRatio}}%

问题统计:
├── 🔴 严重: {{criticalCount}}
├── 🟠 高危: {{highCount}}
├── 🟡 中等: {{mediumCount}}
├── 🟢 低危: {{lowCount}}
└── 总计: {{totalIssues}}

技术债务:
├── 待处理: {{openDebts}}
├── 处理中: {{inProgressDebts}}
├── 已解决: {{resolvedDebts}}
└── 预估工作量: {{estimatedEffort}}
```

---

## 🔴 严重问题 (需立即处理)

{{#if criticalIssues}}
{{#each criticalIssues}}
### {{index}}. {{title}}

**文件**: `{{file}}`
**类型**: {{type}}
**影响**: {{impact}}

**问题描述**:
{{description}}

**重构建议**:
{{suggestion}}

**预估工作量**: {{effort}}

---
{{/each}}
{{else}}
✅ 未发现严重问题
{{/if}}

---

## 🟠 高优先级问题

{{#if highIssues}}
| # | 文件 | 问题 | 类型 | 工作量 |
|---|------|------|------|--------|
{{#each highIssues}}
| {{index}} | `{{file}}` | {{title}} | {{type}} | {{effort}} |
{{/each}}

<details>
<summary>查看详细说明</summary>

{{#each highIssues}}
### {{index}}. {{title}}

**文件**: `{{file}}`

{{description}}

**建议**: {{suggestion}}

---
{{/each}}

</details>
{{else}}
✅ 未发现高优先级问题
{{/if}}

---

## 🟡 中优先级问题

{{#if mediumIssues}}
| # | 文件 | 问题 | 类型 |
|---|------|------|------|
{{#each mediumIssues}}
| {{index}} | `{{file}}` | {{title}} | {{type}} |
{{/each}}
{{else}}
✅ 未发现中优先级问题
{{/if}}

---

## 📋 重复代码分析

### 重复统计

| 指标 | 数值 |
|------|------|
| 重复代码组数 | {{duplicateGroups}} |
| 重复代码行数 | {{duplicateLines}} |
| 重复率 | {{duplicationRate}}% |

### 重复热点 (Top 5)

{{#each topDuplicates}}
#### 重复组 #{{index}}

**相似度**: {{similarity}}%
**重复行数**: {{lines}} 行
**涉及文件**:
{{#each files}}
- `{{this}}`
{{/each}}

**代码预览**:
```{{language}}
{{preview}}
```

**重构建议**: {{suggestion}}

---
{{/each}}

---

## 📊 复杂度分析

### 复杂度最高的函数 (Top 10)

| 排名 | 函数 | 文件 | 圈复杂度 | 认知复杂度 | 行数 | 评级 |
|------|------|------|---------|-----------|------|------|
{{#each topComplexFunctions}}
| {{rank}} | `{{name}}` | `{{file}}` | {{cyclomatic}} | {{cognitive}} | {{lines}} | {{rating}} |
{{/each}}

### 复杂度分布

```
复杂度分布:
├── 低 (1-5):   {{lowComplexityCount}} 个 ({{lowComplexityPercent}}%)
├── 中 (6-10):  {{mediumComplexityCount}} 个 ({{mediumComplexityPercent}}%)
├── 高 (11-20): {{highComplexityCount}} 个 ({{highComplexityPercent}}%)
└── 极高 (>20): {{veryHighComplexityCount}} 个 ({{veryHighComplexityPercent}}%)
```

---

## 🔗 依赖分析

### 模块依赖图

```mermaid
graph TD
{{dependencyGraph}}
```

### 循环依赖

{{#if circularDependencies}}
⚠️ 检测到 {{circularCount}} 组循环依赖:

{{#each circularDependencies}}
**循环 #{{index}}**: {{cycle}}
{{/each}}
{{else}}
✅ 未检测到循环依赖
{{/if}}

### 耦合度分析

| 模块 | 扇入 | 扇出 | 耦合度 | 评级 |
|------|------|------|--------|------|
{{#each modulesCoupling}}
| `{{name}}` | {{fanIn}} | {{fanOut}} | {{coupling}} | {{rating}} |
{{/each}}

---

## 📝 技术债务清单

### 待处理债务 (按优先级排序)

| ID | 标题 | 类型 | 优先级 | 模块 | 预估工作量 |
|----|------|------|--------|------|-----------|
{{#each openDebts}}
| {{id}} | {{title}} | {{type}} | {{priority}} | {{module}} | {{effort}} |
{{/each}}

### 本期新增债务

{{#if newDebts}}
{{#each newDebts}}
- **{{id}}**: {{title}} ({{priority}})
{{/each}}
{{else}}
✅ 本期无新增技术债务
{{/if}}

### 本期解决债务

{{#if resolvedDebts}}
{{#each resolvedDebts}}
- **{{id}}**: {{title}} ✅
{{/each}}
{{else}}
本期无解决的技术债务
{{/if}}

---

## 🎯 重构优先级建议

基于 **影响范围 × 修复成本 × 变更频率** 计算的优先级:

### 立即处理 (本周)

{{#each immediateActions}}
1. **{{title}}**
   - 文件: `{{file}}`
   - 原因: {{reason}}
   - 预计工作量: {{effort}}
{{/each}}

### 短期计划 (本月)

{{#each shortTermActions}}
1. **{{title}}**
   - 原因: {{reason}}
   - 预计工作量: {{effort}}
{{/each}}

### 长期改进 (季度)

{{#each longTermActions}}
1. **{{title}}**
   - 原因: {{reason}}
{{/each}}

---

## 📈 趋势对比

{{#if previousReport}}
### 与上次报告对比 ({{previousReportDate}})

| 指标 | 上次 | 本次 | 变化 |
|------|------|------|------|
| 健康评分 | {{previous.score}} | {{current.score}} | {{scoreDelta}} |
| 严重问题 | {{previous.critical}} | {{current.critical}} | {{criticalDelta}} |
| 重复代码率 | {{previous.duplication}}% | {{current.duplication}}% | {{duplicationDelta}} |
| 技术债务 | {{previous.debts}} | {{current.debts}} | {{debtsDelta}} |

### 改进情况

{{#if improvements}}
✅ 改进项:
{{#each improvements}}
- {{this}}
{{/each}}
{{/if}}

{{#if regressions}}
⚠️ 退化项:
{{#each regressions}}
- {{this}}
{{/each}}
{{/if}}
{{else}}
*这是首次生成报告，无历史数据对比*
{{/if}}

---

## 📚 附录

### A. 检测规则版本

| 规则集 | 版本 |
|--------|------|
| React 规则 | {{reactRulesVersion}} |
| Java 规则 | {{javaRulesVersion}} |

### B. 忽略的文件

```
{{#each ignoredPatterns}}
- {{this}}
{{/each}}
```

### C. 阈值配置

| 指标 | 警告阈值 | 严重阈值 |
|------|---------|---------|
| 文件行数 | {{thresholds.fileLines.warning}} | {{thresholds.fileLines.error}} |
| 函数行数 | {{thresholds.functionLines.warning}} | {{thresholds.functionLines.error}} |
| 圈复杂度 | {{thresholds.complexity.warning}} | {{thresholds.complexity.error}} |
| 重复代码 | {{thresholds.duplication.warning}} | {{thresholds.duplication.error}} |

---

*本报告由 Code Health Guardian 自动生成*
*生成时间: {{generatedAt}}*
