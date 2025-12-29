# Quickstart: Claude Skill 文档生成器开发指南

**Feature**: 001-skill-doc-generator
**Date**: 2025-12-22
**Purpose**: 提供 Skill 开发、测试和部署的快速入门指南

## 概述

本指南帮助开发者快速开始 Claude Skill 文档生成器的开发和测试工作。

## 前置条件

- Claude Code CLI 已安装并配置
- 项目仓库已克隆到本地
- 熟悉 Claude Code Skill 基本概念

## 开发环境设置

### 1. 创建 Skill 目录结构

```bash
# 创建 Skill 根目录
mkdir -p .claude/skills/skill-doc-generator

# 创建子目录
mkdir -p .claude/skills/skill-doc-generator/references
mkdir -p .claude/skills/skill-doc-generator/examples
```

### 2. 创建 SKILL.md

```bash
# 复制模板（如果有）或创建新文件
touch .claude/skills/skill-doc-generator/SKILL.md
```

**SKILL.md 基本结构**：
```markdown
---
name: skill-doc-generator
description: This skill should be used when the user asks to "从 spec.md 生成数据模型", "从规格说明生成 API 文档", ...
version: 0.1.0
---

# Spec-Kit 文档整合专家

## 概述
[简要说明 Skill 的作用]

## 何时使用
[列出触发场景]

## 工作流程
[详细的步骤说明]

...
```

### 3. 创建 References 文件

**references/templates.md**：
```bash
cp specs/001-skill-doc-generator/contracts/data_model_template.md \
   .claude/skills/skill-doc-generator/references/templates.md

# 追加 api_spec_template.md 内容
cat specs/001-skill-doc-generator/contracts/api_spec_template.md >> \
   .claude/skills/skill-doc-generator/references/templates.md
```

**references/parsing-rules.md**：
```markdown
# 规格文档解析规则

## 数据模型章节识别
- 关键词：Key Entities, 关键实体, 数据模型, Data Model
- 内容模式：实体名称（粗体或标题）、字段列表（表格或列表）

## API 章节识别
- 关键词：API Endpoints, API 端点, 接口定义, REST API
- 内容模式：HTTP 方法 + 路径、请求/响应 JSON 代码块

...
```

### 4. 创建 Examples 文件

从现有规格文件中选择一个作为示例：

```bash
# 复制示例规格
cp specs/020-store-address/spec.md \
   .claude/skills/skill-doc-generator/examples/sample-spec.md

# 创建预期输出示例（手动编写或生成）
touch .claude/skills/skill-doc-generator/examples/sample-data-model.md
touch .claude/skills/skill-doc-generator/examples/sample-api-spec.md
```

## 开发工作流

### Phase 1: 编写核心 SKILL.md

1. **编写 Frontmatter**
   - 确保 description 包含所有触发短语
   - 使用第三人称格式
   - 设置初始版本为 0.1.0

2. **编写概述和触发条件**
   - 简明扼要（2-3 段）
   - 列出明确的使用场景

3. **编写工作流程**
   - 按照 research.md 中的六步流程
   - 使用祈使句（"识别规格文档"、"解析内容"）
   - 引用 references 和 examples

4. **保持精简**
   - 目标：1500-2000 字
   - 详细内容移到 references/

### Phase 2: 编写 References 文档

1. **templates.md**
   - 提供完整的 data_model.md 模板
   - 提供完整的 api_spec.md 模板
   - 使用占位符（`{{specId}}`、`{{entityName}}` 等）

2. **parsing-rules.md**
   - 列出数据模型章节识别规则
   - 列出 API 章节识别规则
   - 提供内容模式示例

### Phase 3: 准备 Examples

1. **sample-spec.md**
   - 选择一个真实的规格文档
   - 确保包含数据模型和 API 定义
   - 精简到核心内容（< 500 行）

2. **sample-data-model.md**
   - 手动生成或使用 Skill 生成
   - 展示期望的输出格式
   - 包含信息缺口标记示例

3. **sample-api-spec.md**
   - 同上，展示 API 文档格式

## 测试

### 手动测试

1. **启动 Claude Code**：
   ```bash
   cc
   ```

2. **触发 Skill**：
   ```
   从 specs/020-store-address/spec.md 生成数据模型文档
   ```

3. **验证行为**：
   - [ ] Claude 是否正确加载了 skill？
   - [ ] 是否按照工作流程执行？
   - [ ] 生成的文档是否符合模板格式？

### 验证检查清单

**Frontmatter 检查**：
- [ ] name 字段正确（skill-doc-generator）
- [ ] description 包含所有触发短语
- [ ] description 使用第三人称
- [ ] version 字段存在

**内容检查**：
- [ ] SKILL.md 正文 1500-2000 字
- [ ] 使用祈使句而非第二人称
- [ ] 引用了 references 和 examples
- [ ] 工作流程清晰分步

**References 检查**：
- [ ] templates.md 包含完整模板
- [ ] parsing-rules.md 包含解析规则
- [ ] 所有引用的文件都存在

**Examples 检查**：
- [ ] sample-spec.md 是有效的规格文档
- [ ] sample-data-model.md 符合模板格式
- [ ] sample-api-spec.md 符合模板格式

### 性能测试

测试 10 个规格文件的处理时间：

```bash
# 准备测试数据
ls specs/*/spec.md | head -10

# 触发 skill 并计时
time echo "整合所有 specs 下的数据模型和 API 文档" | cc
```

**预期结果**：
- 总时间 < 1 分钟（目标：SC-002）
- 触发时间 < 30 秒（目标：SC-001）

### 准确性测试

验证覆盖率和信息缺口标记：

1. **准备测试用例**：
   - 完整规格（包含所有信息）
   - 不完整规格（缺少字段类型、错误码等）
   - 冲突规格（同名实体但定义不同）

2. **验证覆盖率**：
   ```bash
   # 检查 data_model.md
   grep -c "### " data_model.md  # 实体数量

   # 对比原始规格中的实体数量
   grep -c "^\*\*.*\*\*:" specs/020-store-address/spec.md
   ```

3. **验证缺口标记**：
   ```bash
   # 检查 TODO 标记
   grep -c "TODO: 待规格明确" data_model.md
   grep -c "TODO: 待定义错误响应" api_spec.md
   ```

**预期结果**：
- 覆盖率 = 100%（SC-003, SC-004）
- 缺失项标记 = 100%（SC-006）

## 部署

### 本地安装

Skill 位于 `.claude/skills/skill-doc-generator/`，Claude Code 会自动发现。

### 验证安装

```bash
# 检查 Skill 是否被识别
cc --list-skills | grep skill-doc-generator
```

### 使用 Skill

```bash
# 启动 Claude Code
cc

# 通过自然语言触发
> 从 spec.md 生成数据模型

# 或明确触发
> 整合 Spec-Kit 文档
```

## 故障排除

### Skill 未被触发

**可能原因**：
- description 触发短语不匹配用户输入
- SKILL.md 文件语法错误

**解决方法**：
1. 检查 frontmatter 格式（YAML 语法）
2. 增加更多触发短语到 description
3. 查看 Claude Code 日志（如果可用）

### 生成的文档格式不正确

**可能原因**：
- templates.md 模板错误
- 占位符替换逻辑错误

**解决方法**：
1. 检查 references/templates.md 格式
2. 手动测试模板渲染
3. 对比 examples 中的预期输出

### 解析失败或覆盖率低

**可能原因**：
- 章节关键词匹配失败
- 规格文件格式与预期不符

**解决方法**：
1. 检查 parsing-rules.md 中的关键词列表
2. 增加更多关键词变体
3. 查看具体的规格文件结构，调整解析逻辑

### 性能未达标

**可能原因**：
- 文件读取次数过多
- 解析算法效率低

**解决方法**：
1. 使用批量 Glob 和 Read
2. 缓存解析结果
3. 优化正则表达式或字符串匹配

## 迭代改进

### 收集反馈

使用 Skill 处理真实规格文档后：
1. 记录触发失败的场景
2. 记录解析失败或覆盖率低的案例
3. 记录用户体验问题

### 改进流程

1. **更新 description**：添加新的触发短语
2. **更新 parsing-rules**：添加新的章节关键词或内容模式
3. **优化模板**：根据实际输出调整格式
4. **增加 examples**：提供更多测试用例

### 版本管理

遵循语义化版本：
- **0.x.y**：初始开发阶段
- **1.0.0**：第一个稳定版本（所有功能需求满足）
- **1.x.0**：新功能添加
- **1.0.x**：Bug 修复和优化

## 相关资源

- **Spec 文档**：`specs/001-skill-doc-generator/spec.md`
- **Research 文档**：`specs/001-skill-doc-generator/research.md`
- **Data Model**：`specs/001-skill-doc-generator/data-model.md`
- **模板示例**：`specs/001-skill-doc-generator/contracts/`
- **Claude Code Skill 指南**：`~/.claude/plugins/.../plugin-dev/skills/skill-development/`

## 下一步

完成开发和测试后，进入 `/speckit.tasks` 阶段生成详细的开发任务清单。
