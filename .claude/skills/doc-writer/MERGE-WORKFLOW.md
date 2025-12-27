# Doc Merge Workflow Specification

**Version**: 1.0.0
**Created**: 2025-12-27
**Status**: MVP Implementation

## Overview

`/doc merge` 命令用于合并多个相关或重叠的 spec 文档，生成统一的、结构合理且内容不重叠的设计文档。

## Command Syntax

```bash
/doc merge <doc-type> <spec1> <spec2> [spec3...] --output <output-name> [--strategy <strategy>]
```

**参数说明**:

| 参数 | 必填 | 类型 | 说明 | 示例 |
|------|------|------|------|------|
| `<doc-type>` | 是 | enum | 要生成的文档类型 | tdd, arch, api, db |
| `<spec1> <spec2> ...` | 是 | string[] | 要合并的 spec 标识符（2个或更多） | P003-inventory-query P004-inventory-adjustment |
| `--output <name>` | 是 | string | 输出文档名称 | P005-inventory-management |
| `--strategy <strategy>` | 否 | enum | 合并策略（默认 auto-dedup） | auto-dedup, preserve-all, interactive |

**示例**:

```bash
# 合并 P003 和 P004 的技术设计文档
/doc merge tdd P003-inventory-query P004-inventory-adjustment --output P005-inventory-management

# 合并多个 spec 的 API 文档
/doc merge api P003 P004 P006 --output inventory-api-complete

# 使用交互式策略
/doc merge tdd P003 P004 --output P005 --strategy interactive
```

## Merge Strategies

### Strategy 1: auto-dedup (默认)

**适用场景**: 大部分常规合并场景

**处理规则**:

| 内容类型 | 检测方法 | 合并策略 |
|---------|---------|---------|
| 数据表定义 | 比较表名 | 相同表名 → 合并字段，标注扩展来源 |
| API 端点 | 比较路径+方法 | 相同端点 → 保留最完整定义，标注差异 |
| 用户故事 | 比较角色+目标 | 相似故事 → 合并为更完整描述 |
| 功能需求 | 比较需求描述 | 相同需求 → 去重，保留编号映射 |
| 技术决策 | 比较决策标题 | 冲突决策 → 保留所有，标注"待确认" |
| 非功能需求 | 比较指标类型 | 取最严格标准 |

**示例输出**:

```markdown
### store_inventory (门店库存)

**来源**: P003-inventory-query (基础表), P004-inventory-adjustment (扩展)

| Column | Type | Constraints | 来源 | 说明 |
|--------|------|-------------|------|------|
| id | uuid | PK | P003 | 主键 |
| sku_id | uuid | FK | P003 | SKU外键 |
| on_hand_qty | integer | NOT NULL | P003 | 现存数量 |
| safety_stock | integer | DEFAULT 0 | **P004 新增** | 安全库存阈值 |
| version | integer | DEFAULT 1 | **P004 新增** | 乐观锁版本号 |
```

### Strategy 2: preserve-all

**适用场景**: 需要生成对比文档或保留所有原始内容

**处理规则**:
- 所有内容按来源分章节保留
- 不进行去重或合并
- 明确标注每部分的来源

**示例输出**:

```markdown
## 6. 数据模型设计

### 6.1 来自 P003-inventory-query 的数据模型

#### store_inventory (门店库存)

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| on_hand_qty | integer | NOT NULL |

### 6.2 来自 P004-inventory-adjustment 的数据模型

#### store_inventory (门店库存)

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| on_hand_qty | integer | NOT NULL |
| safety_stock | integer | DEFAULT 0 |
| version | integer | DEFAULT 1 |

### 6.3 差异对比

- **P004 新增字段**: safety_stock, version
```

### Strategy 3: interactive (交互式)

**适用场景**: 重度重叠的 spec，需要人工决策

**处理流程**:
1. 自动检测冲突项
2. 每个冲突逐一询问用户选择
3. 记录用户选择并应用

**交互示例**:

```
检测到冲突 #1: store_inventory 表定义不一致

来源 A (P003):
  - 字段: id, sku_id, on_hand_qty (8个字段)
  - 说明: 基础库存查询表

来源 B (P004):
  - 字段: id, sku_id, on_hand_qty, safety_stock, version (10个字段)
  - 说明: 扩展了安全库存和乐观锁字段

请选择处理方式:
A. 使用 P004 的完整定义（推荐）
B. 使用 P003 的定义
C. 手动合并（保留两者的所有字段）
D. 跳过此表

您的选择 [A/B/C/D]:
```

## Merge Workflow

### Phase 1: 参数验证

```
输入: /doc merge tdd P003 P004 --output P005

验证步骤:
1. 检查 doc-type 是否有效 (tdd, arch, api, db, detail)
2. 检查 spec 数量 >= 2
3. 检查 spec 路径是否存在
   - specs/P003-inventory-query/
   - specs/P004-inventory-adjustment/
4. 检查 output 名称格式
5. 检查 strategy 是否有效（如有指定）

如果验证失败:
  → 显示错误信息和正确用法示例
  → 终止执行
```

### Phase 2: 内容加载

```
对每个 spec 执行:
1. 读取 spec.md
   - 提取: Feature Branch, System, Module, User Stories, Requirements
2. 读取 data-model.md（如存在）
   - 提取: Tables, Fields, Relationships, ER Diagram
3. 读取 contracts/api.yaml（如存在）
   - 提取: Endpoints, Request/Response Models, Enums
4. 读取 plan.md（如存在）
   - 提取: Technical Decisions, Architecture, Tech Stack
5. 读取 research.md（如存在）
   - 提取: Research Findings, Trade-offs

数据结构:
{
  "P003-inventory-query": {
    "metadata": { specId, system, module, ... },
    "userStories": [ {...}, {...} ],
    "requirements": [ {...}, {...} ],
    "dataModel": {
      "tables": [ {...}, {...} ],
      "erDiagram": "..."
    },
    "api": {
      "endpoints": [ {...}, {...} ],
      "schemas": [ {...}, {...} ]
    },
    "technical": { ... }
  },
  "P004-inventory-adjustment": { ... }
}
```

### Phase 3: 重叠检测

```
执行检测算法:

1. 数据表重叠检测
   for each table_A in spec_A.dataModel.tables:
     for each table_B in spec_B.dataModel.tables:
       if table_A.name == table_B.name:
         compare(table_A.fields, table_B.fields)
         → 记录: overlap_tables[table_name] = { spec_A, spec_B, diff }

2. API 端点重叠检测
   for each endpoint_A in spec_A.api.endpoints:
     for each endpoint_B in spec_B.api.endpoints:
       if (endpoint_A.path == endpoint_B.path) AND
          (endpoint_A.method == endpoint_B.method):
         compare(endpoint_A.request, endpoint_B.request)
         compare(endpoint_A.response, endpoint_B.response)
         → 记录: overlap_endpoints[key] = { spec_A, spec_B, diff }

3. 用户故事重叠检测
   for each story_A in spec_A.userStories:
     for each story_B in spec_B.userStories:
       similarity = calculate_similarity(story_A.content, story_B.content)
       if similarity > 0.7:
         → 记录: overlap_stories[] = { story_A, story_B, similarity }

4. 功能需求重叠检测
   for each req_A in spec_A.requirements:
     for each req_B in spec_B.requirements:
       if normalize(req_A.description) == normalize(req_B.description):
         → 记录: overlap_requirements[] = { req_A, req_B }

输出: overlap_report = {
  tables: [ {...}, {...} ],
  endpoints: [ {...}, {...} ],
  stories: [ {...}, {...} ],
  requirements: [ {...}, {...} ]
}
```

### Phase 4: 策略应用

#### 4.1 auto-dedup 策略

```
for each overlap in overlap_report:
  apply_merge_rule(overlap.type)

merge_rules:
  tables:
    - 合并字段列表
    - 保留所有约束
    - 标注字段来源 (spec_A, spec_B, or MERGED)
    - 生成统一的表定义

  endpoints:
    - 合并查询参数（取并集）
    - 合并请求/响应字段（取并集）
    - 保留最完整的描述
    - 标注扩展来源

  stories:
    - 合并验收标准
    - 合并优先级（取最高）
    - 生成统一的故事描述

  requirements:
    - 去重相同需求
    - 保留编号映射表
    - 生成统一的需求编号
```

#### 4.2 preserve-all 策略

```
按章节保留所有内容:

## 来自 P003 的内容
### 用户故事
### 数据模型
### API 设计

## 来自 P004 的内容
### 用户故事
### 数据模型
### API 设计

## 差异对比
### 数据模型差异
### API 差异
```

#### 4.3 interactive 策略

```
for each overlap in overlap_report:
  display_conflict(overlap)
  user_choice = ask_user_to_resolve(overlap)
  apply_user_choice(user_choice)
```

### Phase 5: 文档生成

```
根据 doc-type 选择模板:
  tdd → templates/technical-design.md
  arch → templates/architecture-design.md
  api → templates/interface-design.md
  db → templates/database-design.md

填充模板内容:
  1. 文档头部
     - 标题: "技术设计文档 (TDD) - {output-name}"
     - 合并来源: "P003-inventory-query, P004-inventory-adjustment"
     - 合并时间: "2025-12-27"
     - 合并策略: "auto-dedup"

  2. 概述章节
     - 背景: 整合多个 spec 的背景描述
     - 功能范围: 列出所有来源 spec 的功能范围
     - 依赖关系: 标注 spec 之间的依赖

  3. 需求章节
     - 合并后的用户故事（标注来源）
     - 合并后的功能需求（标注来源）
     - 去重统计

  4. 数据模型章节
     - 合并后的 ER 图
     - 合并后的表定义（标注扩展字段）
     - 关系说明

  5. API 设计章节
     - 合并后的端点列表
     - 统一的请求/响应格式
     - 共享的 Schema

  6. 附录
     - 合并报告
     - 编号映射表
     - 差异说明
```

### Phase 6: 输出与报告

```
1. 保存合并文档
   路径: docs/{doc-type}/{output-name}-merged.md
   示例: docs/tdd/P005-inventory-management-merged.md

2. 生成合并报告
   路径: docs/{doc-type}/{output-name}-merge-report.md
   内容:
     - 合并统计
     - 去重内容列表
     - 保留差异列表
     - 建议后续操作

3. 显示输出摘要
   ✅ 文档合并完成

   合并类型: 技术设计文档 (TDD)
   合并来源:
     - P003-inventory-query (库存查询)
     - P004-inventory-adjustment (库存调整)
   输出路径: docs/tdd/P005-inventory-management-merged.md

   合并统计:
     用户故事: 5 个 (P003: 2, P004: 3)
     功能需求: 28 个 (去重: 4)
     数据表: 6 个 (合并: 3)
     API 端点: 12 个 (共享: 2)

   去重内容:
     - store_inventory 表 (合并 P003 + P004 扩展字段)
     - GET /api/transactions (合并查询参数)

   合并报告: docs/tdd/P005-merge-report.md
```

## Merge Report Template

```markdown
# 合并报告 - {output-name}

**生成时间**: 2025-12-27 10:00:00
**合并策略**: auto-dedup
**文档类型**: 技术设计文档 (TDD)

## 1. 合并来源

| Spec ID | 功能名称 | 状态 | 创建日期 |
|---------|---------|------|---------|
| P003-inventory-query | 库存查询 | Completed | 2025-12-20 |
| P004-inventory-adjustment | 库存调整 | In Progress | 2025-12-26 |

## 2. 合并统计

### 2.1 内容统计

| 内容类型 | P003 | P004 | 合并后 | 去重数量 |
|---------|------|------|--------|---------|
| 用户故事 | 2 | 3 | 5 | 0 |
| 功能需求 | 15 | 17 | 28 | 4 |
| 数据表 | 4 | 5 | 6 | 3 |
| API 端点 | 5 | 9 | 12 | 2 |

### 2.2 去重详情

#### 数据表去重

| 表名 | P003 字段数 | P004 字段数 | 合并后字段数 | 处理方式 |
|------|-----------|-----------|------------|---------|
| store_inventory | 8 | 10 | 10 | 合并（P004 扩展 2 字段） |
| inventory_transactions | 12 | 12 | 12 | 完全相同 |
| skus | 15 | 15 | 15 | 完全相同 |

#### API 端点去重

| 端点 | P003 | P004 | 处理方式 |
|------|------|------|---------|
| GET /api/transactions | 基础查询 | +调整类型筛选 | 合并查询参数 |
| GET /api/inventory/{id} | 基础查询 | +流水标签 | 合并响应字段 |

## 3. 保留的差异

### 3.1 功能定位差异

**P003 专注**:
- 库存查询
- 状态计算
- 数据导出

**P004 专注**:
- 库存调整
- 审批流程
- 流水追溯

### 3.2 技术决策差异

| 决策点 | P003 | P004 | 合并结果 |
|--------|------|------|---------|
| 权限控制 | 查询权限 | 调整+审批权限 | 统一权限模型 |
| 数据验证 | 查询参数验证 | 调整数据验证 | 分别保留 |

## 4. 编号映射表

### 4.1 功能需求编号映射

| 合并后编号 | 原始编号 | 来源 | 需求描述 |
|-----------|---------|------|---------|
| FR-001 | P003-FR-001 | P003 | 支持库存列表查询 |
| FR-002 | P003-FR-002 | P003 | 支持多条件筛选 |
| FR-003 | P003-FR-003 | P003 | 库存状态计算 |
| FR-004 | P003-FR-004 | P003 | 数据导出Excel |
| FR-005 | P004-FR-001 | P004 | 支持三种调整类型 |
| FR-006 | P004-FR-002 | P004 | 调整立即更新库存 |
| ... | ... | ... | ... |

### 4.2 用户故事编号映射

| 合并后编号 | 原始编号 | 来源 | 故事标题 |
|-----------|---------|------|---------|
| US-001 | P003-US-001 | P003 | 查询库存列表 |
| US-002 | P003-US-002 | P003 | 查看库存详情 |
| US-003 | P004-US-001 | P004 | 录入库存调整 |
| US-004 | P004-US-002 | P004 | 查看库存流水 |
| US-005 | P004-US-003 | P004 | 填写调整原因 |

## 5. 待确认事项

### 5.1 技术决策冲突

- [ ] **缓存策略**: P003 使用 5 分钟缓存，P004 使用 1 分钟缓存
  - 建议: 统一为 1 分钟（调整功能需要更实时的数据）

### 5.2 业务逻辑冲突

- [ ] **库存更新时机**: P003 不涉及更新，P004 涉及立即更新
  - 建议: 明确各功能的库存更新权限和时机

## 6. 建议后续操作

1. **审查合并文档**
   - 检查数据模型是否完整
   - 验证 API 端点定义是否准确
   - 确认用户故事覆盖完整

2. **解决待确认事项**
   - 统一缓存策略
   - 明确权限模型

3. **生成实施计划**
   - 运行 `/speckit.plan` 生成实施计划
   - 或直接运行 `/doc update tdd` 更新合并文档

4. **代码实现**
   - 基于合并后的设计文档进行开发
   - 确保实现覆盖所有功能需求

---

*本报告由 doc-writer merge 功能自动生成*
```

## Content Deduplication Algorithms

### Algorithm 1: Table Comparison

```typescript
function compareTable(tableA: Table, tableB: Table): MergeResult {
  if (tableA.name !== tableB.name) {
    return { type: 'different', action: 'keep_both' };
  }

  // 相同表名，比较字段
  const fieldsA = new Set(tableA.fields.map(f => f.name));
  const fieldsB = new Set(tableB.fields.map(f => f.name));

  const commonFields = intersection(fieldsA, fieldsB);
  const onlyInA = difference(fieldsA, fieldsB);
  const onlyInB = difference(fieldsB, fieldsA);

  if (onlyInA.size === 0 && onlyInB.size === 0) {
    // 完全相同
    return {
      type: 'identical',
      action: 'keep_one',
      source: 'either'
    };
  }

  if (onlyInA.size === 0 && onlyInB.size > 0) {
    // B 扩展了 A
    return {
      type: 'extended',
      action: 'merge',
      base: 'A',
      extension: 'B',
      newFields: Array.from(onlyInB)
    };
  }

  if (onlyInB.size === 0 && onlyInA.size > 0) {
    // A 扩展了 B
    return {
      type: 'extended',
      action: 'merge',
      base: 'B',
      extension: 'A',
      newFields: Array.from(onlyInA)
    };
  }

  // 双向都有独特字段
  return {
    type: 'diverged',
    action: 'merge_all',
    onlyInA: Array.from(onlyInA),
    onlyInB: Array.from(onlyInB),
    warning: 'Both specs extended the table independently'
  };
}
```

### Algorithm 2: API Endpoint Comparison

```typescript
function compareEndpoint(endpointA: Endpoint, endpointB: Endpoint): MergeResult {
  const keyA = `${endpointA.method} ${endpointA.path}`;
  const keyB = `${endpointB.method} ${endpointB.path}`;

  if (keyA !== keyB) {
    return { type: 'different', action: 'keep_both' };
  }

  // 相同端点，比较参数和响应
  const paramsMatch = deepEqual(endpointA.parameters, endpointB.parameters);
  const responseMatch = deepEqual(endpointA.response, endpointB.response);

  if (paramsMatch && responseMatch) {
    return {
      type: 'identical',
      action: 'keep_one',
      source: 'either'
    };
  }

  // 参数或响应不同，需要合并
  return {
    type: 'overlap',
    action: 'merge',
    paramsDiff: diff(endpointA.parameters, endpointB.parameters),
    responseDiff: diff(endpointA.response, endpointB.response),
    mergedParams: merge(endpointA.parameters, endpointB.parameters),
    mergedResponse: merge(endpointA.response, endpointB.response)
  };
}
```

### Algorithm 3: User Story Similarity

```typescript
function calculateStorySimilarity(storyA: UserStory, storyB: UserStory): number {
  // 比较角色
  const roleMatch = storyA.role === storyB.role ? 0.3 : 0;

  // 比较目标（使用余弦相似度）
  const goalSimilarity = cosineSimilarity(
    tokenize(storyA.goal),
    tokenize(storyB.goal)
  ) * 0.5;

  // 比较理由
  const reasonSimilarity = cosineSimilarity(
    tokenize(storyA.reason),
    tokenize(storyB.reason)
  ) * 0.2;

  return roleMatch + goalSimilarity + reasonSimilarity;
}

function mergeUserStories(storyA: UserStory, storyB: UserStory): UserStory {
  return {
    role: storyA.role,
    goal: mergeSentences(storyA.goal, storyB.goal),
    reason: mergeSentences(storyA.reason, storyB.reason),
    acceptanceCriteria: [
      ...storyA.acceptanceCriteria,
      ...storyB.acceptanceCriteria
    ],
    priority: Math.min(storyA.priority, storyB.priority), // 取最高优先级
    sources: ['spec-A', 'spec-B']
  };
}
```

## Error Handling

### Error 1: Invalid Spec Path

```
错误: 无法找到 spec 文件

输入: /doc merge tdd P003 P999 --output P005

错误详情:
  - P003-inventory-query: ✓ 找到
  - P999: ✗ 路径 specs/P999/ 不存在

建议操作:
  1. 检查 spec ID 是否正确
  2. 运行 `ls specs/` 查看可用的 spec
  3. 确保 spec 目录存在且包含 spec.md 文件
```

### Error 2: Insufficient Specs

```
错误: 合并需要至少 2 个 spec

输入: /doc merge tdd P003 --output P005

建议:
  /doc merge tdd P003 P004 --output P005
```

### Error 3: Output Name Conflict

```
错误: 输出文档已存在

输出路径: docs/tdd/P005-inventory-management-merged.md

选项:
  A. 覆盖现有文档
  B. 使用新的输出名称
  C. 取消操作

您的选择 [A/B/C]:
```

### Error 4: No Overlapping Content

```
警告: 未检测到重叠内容

来源:
  - P003-inventory-query: 库存查询功能
  - P007-order-management: 订单管理功能

说明:
  这两个 spec 似乎没有明显的功能重叠或数据共享。
  合并后的文档将包含两个独立的功能模块。

是否继续合并? [Y/N]:
```

## MVP Limitations

### 阶段 1 MVP 不支持的功能

1. **合并 spec 数量限制**: 仅支持 2 个 spec 合并（3+ 个将在阶段 2 支持）
2. **文档类型限制**: 仅支持 TDD 合并（其他类型将在阶段 2 支持）
3. **策略限制**: 仅支持 auto-dedup 策略（其他策略将在阶段 2 支持）
4. **部分合并**: 不支持仅合并特定章节（完整合并）
5. **依赖检测**: 不自动检测 spec 之间的依赖关系
6. **冲突预览**: 不提供合并前的冲突预览

### 阶段 2 计划增强

1. 支持 3+ spec 合并
2. 支持所有文档类型（arch, api, db, detail）
3. 实现 preserve-all 和 interactive 策略
4. 添加部分合并功能
5. 智能依赖检测和建议
6. 合并前冲突预览和风险评估

## Testing Checklist

### 功能测试

- [ ] 合并 2 个有重叠数据表的 spec
- [ ] 合并 2 个有重叠 API 端点的 spec
- [ ] 合并 2 个有相似用户故事的 spec
- [ ] 合并 2 个完全无重叠的 spec
- [ ] 验证编号映射表正确性
- [ ] 验证合并报告完整性

### 边界测试

- [ ] 仅提供 1 个 spec（应报错）
- [ ] 提供不存在的 spec（应报错）
- [ ] 输出名称冲突（应提示处理）
- [ ] 空 spec（缺少 spec.md）
- [ ] spec 缺少 data-model.md

### 质量测试

- [ ] 合并后文档格式正确
- [ ] 所有来源标注清晰
- [ ] 无内容丢失
- [ ] 无重复内容
- [ ] Mermaid 图表正确
- [ ] 链接引用有效

---

*本规范将用于实现 `/doc merge` MVP 功能*
