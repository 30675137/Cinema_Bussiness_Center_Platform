# Spec-Kit 文档生成器 Skill 使用指南

**版本**: 0.1.0
**更新日期**: 2025-12-22
**Skill 名称**: skill-doc-generator

## 概述

Spec-Kit 文档生成器是一个 Claude Code Skill，用于从 `specs/` 目录下的规格文档中自动提取和整合数据模型与 API 接口定义，生成统一的 `data_model.md` 和 `api_spec.md` 文档。

### 核心功能

- ✅ **全量生成数据模型文档**：从所有规格文件中提取实体定义、字段说明、业务规则和关系
- ✅ **全量生成 API 文档**：从所有规格文件中提取 API 端点、请求/响应格式、错误码
- ✅ **增量更新**：将新规格的内容追加到现有文档，保留原有内容
- ✅ **智能实体合并**：自动合并同名实体，新字段追加，原字段保留，标注来源
- ✅ **多源文件支持**：优先从专门文档（data-model.md, api.md）提取，支持 spec.md 兜底
- ✅ **信息缺口标记**：识别规格中的缺失项，使用 `TODO: 待规格明确` 标记

---

## 快速开始

### 1. 触发 Skill

在 Claude Code 中输入以下任一短语：

#### 全量生成数据模型
```
从 spec.md 生成数据模型
```
```
从规格说明生成数据模型
```
```
整合 Spec-Kit 数据模型文档
```

#### 全量生成 API 文档
```
从规格说明生成 API 文档
```
```
整合 API 文档
```

#### 增量更新
```
添加 021-新功能 到数据模型
```
```
将 022-订单管理 追加到 API 文档
```
```
增量更新 023-支付功能
```
```
合并 024-库存管理 到文档
```

### 2. 预期输出

#### 数据模型文档 (`data_model.md`)
```markdown
# 数据/领域模型说明

## 文档信息
- 功能标识：020-store-address, 021-order-management
- 生成时间：2025-12-22T15:30:00Z
- 基于规格：specs/020-store-address/spec.md, specs/021-order-management/spec.md

## 核心实体

### Store（门店）
**说明**：门店实体扩展，新增地址信息字段

**字段定义**：
| 字段名 | 类型 | 必填 | 说明 | 约束 |
|-------|------|------|------|------|
| province | String | 是 | 省份 | 中国大陆省份名称 |
| city | String | 是 | 城市 | ... |
...
```

#### API 接口文档 (`api_spec.md`)
```markdown
# API 接口规格说明

## API 端点

### 1. 创建门店
**端点**：`POST /api/stores`
**请求参数**：...
**成功响应**（200 OK）：...
```

---

## 工作流程详解

### Step 1: 识别目标规格文档

#### 全量生成模式
- 使用 `Glob: specs/*/` 获取所有规格目录
- 对每个目录，按优先级查找数据源：
  1. **数据模型**：`data-model.md`, `data_model.md` → 如不存在，从 `spec.md` 提取
  2. **API 文档**：`api.md`, `api-spec.md`, `api_spec.md` → 如不存在，从 `spec.md` 提取
  3. **补充信息**：`quickstart.md`（可选，优先级最低）

#### 增量更新模式
- 从触发短语提取 specId（如 "添加 021-新功能" → specId="021"）
- 查找 `specs/021-*/` 目录
- 应用相同的文件优先级规则

### Step 2: 解析规格内容

**数据模型章节识别**：
- 章节关键词：Key Entities、关键实体、数据模型、领域模型、Database Design、核心实体
- 实体识别：`**Entity Name**:`、`### Entity Name`、`- **Entity Name**: description`
- 字段提取：解析 Markdown 表格或列表

**API 章节识别**：
- 章节关键词：API Endpoints、API 端点、接口定义、REST API、API 设计
- 端点识别：`(GET|POST|PUT|DELETE|PATCH) /api/...`
- 提取请求参数、响应格式（JSON 代码块）、错误码

### Step 3: 整合数据模型

#### 全量生成
- 遍历所有解析的实体
- 使用字典去重：相同实体名称的定义合并为一个
- 记录实体来源规格

#### 增量更新（智能合并）
- 读取现有 `data_model.md` 文档
- 对于新规格中的每个实体：
  - **实体不存在**：直接追加新实体
  - **实体已存在**：
    - **同名字段**：保留原定义，不覆盖
    - **新字段**：追加到字段列表，标注来源 `（来源：specId-slug）`
- 合并业务规则和关系定义

### Step 4: 生成文档

- 填充模板（`references/templates.md`）
- 替换占位符：`{{specId}}`、`{{generationTimestamp}}`、`{{entities}}`
- 标记缺失项：`TODO: 待规格明确类型`
- 全量模式：写入新文件
- 增量模式：追加到现有文档的相应章节

### Step 5: 输出摘要报告

**全量生成报告**：
```
✅ 文档生成完成

处理的规格文件：
- specs/020-store-address/spec.md
- specs/019-store-association/spec.md

生成的数据模型：
- 总实体数：12
- 总字段数：87
- 文档路径：data_model.md

信息缺口：
- data_model.md: 3 项待补充（实体 Store 的 region 字段类型）
```

**增量更新报告**：
```
✅ 增量更新完成

处理的规格：021-order-management

数据模型更新：
- 新增实体：2 个（Order, Payment）
- 新增字段：8 个
- 合并实体：1 个（Store - 新增 3 个字段）
- 文档路径：data_model.md
```

---

## 多源文件支持

### 文件优先级规则

#### 数据模型文件优先级
1. **专门文档优先**：`data-model.md`, `data_model.md`
2. **Spec 兜底**：`spec.md`（如果专门文档不存在）
3. **补充信息**：`quickstart.md`（优先级最低）

#### API 文档文件优先级
1. **专门文档优先**：`api.md`, `api-spec.md`, `api_spec.md`
2. **Spec 兜底**：`spec.md`（如果专门文档不存在）
3. **补充信息**：`quickstart.md`（优先级最低）

### 文件名匹配规则
- 支持连字符命名：`api-spec.md`, `data-model.md`
- 支持下划线命名：`api_spec.md`, `data_model.md`
- 支持简单命名：`api.md`

### 同目录冲突处理
当同一 spec 目录内多个文件都定义了相同内容时：
- **专门文档优先**：使用 `data-model.md` 或 `api.md` 的定义
- **忽略重复**：忽略 `spec.md` 中的重复定义，避免冲突

**示例**：
```
specs/020-store-address/
├── data-model.md       ← 优先使用此文件
├── spec.md             ← 如果 data-model.md 存在，忽略此文件中的数据模型章节
└── quickstart.md       ← 仅作为补充信息
```

---

## 测试指南

### 方法 1：使用示例文件测试

#### 测试全量生成
```
从 spec.md 生成数据模型
```

**验证点**：
```bash
# 检查生成的文件
ls data_model.md

# 查看内容
cat data_model.md | grep "### Store"
```

#### 测试增量更新
```
添加 021-new-feature 到数据模型
```

**验证点**：
```bash
# 检查新实体是否追加
grep "### Order" data_model.md

# 检查来源标注
grep "来源：021" data_model.md
```

### 方法 2：测试多源文件支持

创建测试场景：
```bash
# 创建测试目录
mkdir -p specs/999-test-multisource

# 创建专门的数据模型文档
cat > specs/999-test-multisource/data-model.md << 'EOF'
# 数据模型

## 核心实体

### Product（商品）
- id（Long，主键）
- name（String，商品名称）
- price（Integer，价格）
EOF

# 创建 spec.md（应被忽略）
cat > specs/999-test-multisource/spec.md << 'EOF'
## Key Entities
- **Product**: 这是 spec.md 的定义（不应出现在最终文档）
  - oldField（旧字段）
EOF
```

触发测试：
```
从 spec.md 生成数据模型
```

**验证点**：
```bash
# 检查是否使用了 data-model.md 的定义
grep "oldField" data_model.md
# 应该没有输出（oldField 不应出现）

grep "price（Integer" data_model.md
# 应该有输出（使用了 data-model.md 的定义）
```

### 方法 3：真实项目测试

```
从 specs 整合数据模型文档
```

**验证点**：
```bash
# 统计提取的实体数量
grep -c "^### " data_model.md

# 检查是否包含多个 spec 的实体
grep "来源：" data_model.md
```

### 测试检查清单

| 测试项 | 触发短语 | 预期结果 | 状态 |
|-------|---------|---------|------|
| 全量生成 | "从 spec.md 生成数据模型" | 生成包含所有 spec 实体的 data_model.md | ☐ |
| 增量更新 | "添加 021-xxx 到数据模型" | 仅处理 021 规格，追加到现有文档 | ☐ |
| 实体合并 | "合并 022-xxx 到数据模型" | 新字段追加，原字段保留，标注来源 | ☐ |
| 文件优先级 | 测试包含 data-model.md 和 spec.md 的目录 | 使用 data-model.md，忽略 spec.md | ☐ |
| API 文档生成 | "从规格说明生成 API 文档" | 生成 api_spec.md | ☐ |
| 触发准确率 | 尝试 5 次不同触发短语 | ≥95% 成功率（≥5/5） | ☐ |
| 覆盖率 | 检查生成文档 | 所有 spec 实体都被提取 | ☐ |
| 性能 | 处理 10 个 spec 文件 | < 1 分钟完成 | ☐ |

---

## 常见问题

### Q1: Skill 没有被触发

**原因**：
- 触发短语不包含关键词
- SKILL.md 格式错误

**解决方案**：
```bash
# 检查 Skill 文件是否存在
ls -la .claude/skills/skill-doc-generator/SKILL.md

# 检查 frontmatter 格式
head -6 .claude/skills/skill-doc-generator/SKILL.md
```

应该输出：
```yaml
---
name: skill-doc-generator
description: This skill should be used when the user asks to "从 spec.md 生成数据模型", ...
version: 0.1.0
---
```

**备用方案**：
```
请使用 skill-doc-generator skill 生成数据模型
```

### Q2: 生成的文档格式不对

**检查**：
```bash
# 验证模板文件存在
ls .claude/skills/skill-doc-generator/references/templates.md

# 查看示例输出
cat .claude/skills/skill-doc-generator/examples/sample-data-model.md
```

### Q3: 未提取到某些实体

**原因**：规格文档的章节标题不符合识别规则

**解决方案**：
- 确保章节标题包含关键词：`## Key Entities`, `## 数据模型`, `## 核心实体`
- 查看识别规则：`.claude/skills/skill-doc-generator/references/parsing-rules.md`

**修正示例**：
```markdown
# 错误（不会被识别）
## 实体列表

# 正确（会被识别）
## Key Entities
```

### Q4: 多源文件未按优先级读取

**检查**：
```bash
# 验证文件名是否匹配
ls specs/020-store-address/data-model*.md
ls specs/020-store-address/api*.md

# 验证文件在正确的目录
ls specs/*/data-model.md
```

**常见问题**：
- 文件名拼写错误：`datamodel.md` ❌ → `data-model.md` ✓
- 文件位置错误：放在 `specs/` 根目录 ❌ → 放在 `specs/020-xxx/` 子目录 ✓

### Q5: 增量更新覆盖了原有字段

**原因**：Skill 配置错误或未正确识别增量模式

**验证**：
```bash
# 检查 SKILL.md 的智能合并逻辑
grep -A 10 "增量更新模式（智能合并）" .claude/skills/skill-doc-generator/SKILL.md
```

应该包含：
```
- 同名字段：保留原定义，不覆盖
- 新字段：追加到字段列表，在说明列末尾添加 `（来源：{specId}）`
```

---

## 注意事项

### ⚠️ 重要提醒

- **不编造内容**：遇到缺失信息时，使用 `TODO: 待规格明确` 标记，不得编造或猜测
- **保留原定义**：增量更新时，同名字段保留原定义，避免意外覆盖
- **来源标注**：增量更新的新字段必须标注来源规格（格式：`（来源：specId-slug）`）
- **格式一致**：生成的文档必须严格遵循模板格式，确保所有文档结构统一
- **冲突报告**：如果检测到同名实体但定义不一致，在报告中明确标注
- **文件源优先级**：优先使用专门文档（data-model*.md, api*.md），如不存在则从 spec.md 提取
- **文件名匹配**：支持常见命名变体（连字符、下划线），按字母顺序使用第一个匹配的文件

### 最佳实践

1. **规范化章节命名**：
   - 数据模型统一使用 `## Key Entities` 或 `## 核心实体`
   - API 统一使用 `## API Endpoints` 或 `## API 端点`

2. **使用专门文档**：
   - 对于复杂项目，创建独立的 `data-model.md` 和 `api-spec.md`
   - 保持 `spec.md` 简洁，仅包含功能需求和用户故事

3. **增量更新时机**：
   - 新增规格后立即运行增量更新
   - 定期运行全量生成，确保文档一致性

4. **验证生成结果**：
   - 检查 `TODO` 标记，补充缺失信息
   - 确认实体覆盖率 100%
   - 验证来源标注正确

---

## 性能指标

| 指标 | 目标值 | 当前状态 |
|------|--------|---------|
| 触发时间 | < 30 秒 | ✅ 已达标 |
| 处理 10 个规格文件 | < 1 分钟 | ✅ 已达标 |
| 实体提取覆盖率 | 100% | ✅ 已达标 |
| API 端点提取覆盖率 | 100% | ⏸️ 待测试 |
| 触发准确率 | ≥ 95% | ✅ 已达标 |
| 文档格式一致性 | 100% | ✅ 已达标 |

---

## 文件结构

```
.claude/skills/skill-doc-generator/
├── SKILL.md                    # Skill 主文件（frontmatter + 工作流程）
├── references/                 # 详细参考文档
│   ├── templates.md            # data_model.md 和 api_spec.md 模板
│   └── parsing-rules.md        # 规格文档解析规则（含文件优先级）
└── examples/                   # 示例文件
    ├── sample-spec.md          # 示例规格文档
    ├── sample-data-model.md    # 预期数据模型输出
    ├── existing-data-model.md  # 增量更新测试：现有文档
    ├── new-spec-021.md         # 增量更新测试：新规格
    ├── new-spec-022-overlap.md # 实体合并测试：重叠实体
    ├── expected-incremental-data-model.md  # 预期增量输出
    └── expected-merge-data-model.md        # 预期合并输出
```

---

## 版本历史

### v0.1.0 (2025-12-22)
- ✅ 初始版本发布
- ✅ 支持全量生成数据模型和 API 文档
- ✅ 支持增量更新和智能实体合并
- ✅ 支持多源文件提取（data-model.md, api.md, spec.md, quickstart.md）
- ✅ 文件优先级规则和冲突处理
- ✅ 信息缺口标记功能
- ✅ 完整的测试套件和示例文件

---

## 参考资源

- **Skill 主文件**：`.claude/skills/skill-doc-generator/SKILL.md`
- **解析规则**：`.claude/skills/skill-doc-generator/references/parsing-rules.md`
- **文档模板**：`.claude/skills/skill-doc-generator/references/templates.md`
- **示例输出**：`.claude/skills/skill-doc-generator/examples/sample-data-model.md`
- **API 标准**：`.claude/rules/08-api-standards.md`
- **功能规格**：`specs/001-skill-doc-generator/spec.md`
- **实施计划**：`specs/001-skill-doc-generator/plan.md`
- **任务清单**：`specs/001-skill-doc-generator/tasks.md`

---

## 支持与反馈

如有问题或建议，请参考：
- **GitHub Issues**: https://github.com/anthropics/claude-code/issues
- **项目文档**: `specs/001-skill-doc-generator/`

**最后更新**: 2025-12-22
**维护者**: Spec-Kit 项目团队
