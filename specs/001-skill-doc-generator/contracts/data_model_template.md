# 数据/领域模型说明

## 文档信息
- 功能标识：{{specId}}-{{slug}}
- 生成时间：{{generationTimestamp}}
- 基于规格：specs/{{specId}}-{{slug}}/spec.md

## 领域概述

{{domainOverview}}

## 核心实体

{{#each entities}}
### {{name}}

**说明**：{{description}}

**字段定义**：

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
{{#each fields}}
| {{name}} | {{type}} | {{#if required}}是{{else}}否{{/if}} | {{description}} | {{constraints}} |
{{/each}}

**业务规则**：
{{#each businessRules}}
- {{this}}
{{/each}}

**关系**：
{{#each relationships}}
- 与 {{targetEntity}} 的关系：{{type}} - {{description}}
{{/each}}

---

{{/each}}

## 数据验证规则

### 字段级验证
{{fieldLevelValidations}}

### 实体级验证
{{entityLevelValidations}}

### 业务级验证
{{businessLevelValidations}}

## 数据存储

**主存储**：{{storageType}}

**表结构**：
{{#each tables}}
- {{name}}：{{description}}
{{/each}}

**索引策略**：
{{#each indexes}}
- {{name}}：{{fields}} - {{purpose}}
{{/each}}

## 附录

### 术语表

| 术语 | 定义 |
|------|------|
{{#each glossary}}
| {{term}} | {{definition}} |
{{/each}}

### 状态机图

{{#if stateMachine}}
```mermaid
stateDiagram-v2
{{stateMachine}}
```
{{else}}
暂无状态机定义
{{/if}}

### ER 图

{{#if erDiagram}}
```mermaid
erDiagram
{{erDiagram}}
```
{{else}}
暂无 ER 图定义
{{/if}}

---

**生成说明**：
- 本文档由 Claude Skill 文档生成器自动生成
- 如发现信息缺失或不准确，请参考原始规格文档并手动补充
- 标记为 `TODO: 待规格明确` 的项需要在规格文档中补充后重新生成
