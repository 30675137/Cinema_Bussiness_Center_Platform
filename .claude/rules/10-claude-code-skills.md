# Claude Code Skills 开发规范

## 核心原则
当创建 Claude Code skill(即通过 Claude Code CLI 调用的命令行工具扩展)时,必须遵循特定的规格文档结构和开发规范,确保 skill 的可维护性、可发现性和团队协作效率。

## 规则

### R10.1 Skill Spec 识别
- 所有创建 Claude Code skill 的规格必须使用 `T###` 模块前缀(Tool/Infrastructure)
- Spec 标题必须明确标注"Claude Code skill"或"skill"关键词
- 示例:`T001-e2e-scenario-author`, `T002-e2e-test-generator`

### R10.2 强制文档要求

**必须包含的四个文档**:

1. **skill.md 文件**:
   - 位置: `.claude/skills/<skill-name>/skill.md`
   - **必须包含 YAML frontmatter**(强制):
     ```yaml
     ---
     name: skill-name
     description: Detailed description with trigger keywords
     version: 1.0.0
     ---
     ```
   - `name` 字段: skill 的唯一标识符(必需)
   - `description` 字段: 详细功能说明,必须包含触发关键词(中英文)(必需)
   - `version` 字段: 遵循语义化版本规范(必需)
   - 内容: Skill 的完整功能说明、命令参数、使用示例、工作流程
   - 必须包含 `@spec T###` 归属标识

2. **spec.md 文件**:
   - 位置: `specs/T###-<skill-name>/spec.md`
   - 内容: 用户故事、功能需求、验收标准、成功指标
   - 必须包含明确的 skill 调用方式说明(如 `/scenario-author create`)

3. **data-model.md 文件**:
   - 位置: `specs/T###-<skill-name>/data-model.md`
   - 内容: Skill 处理的数据模型定义(如 YAML schema, JSON schema)
   - 必须包含数据验证规则和约束条件

4. **quickstart.md 文件**:
   - 位置: `specs/T###-<skill-name>/quickstart.md`
   - 内容: 快速上手指南、基本用法示例、常见问题排查
   - 必须包含完整的命令使用示例和预期输出

### R10.3 YAML Frontmatter 要求（最高优先级）

**所有 skill.md 文件必须在开头包含 YAML frontmatter**，这是 Claude Code 识别和加载 skill 的**必要条件**。

**正确示例**:
```markdown
---
name: e2e-test-generator
description: Generate Playwright E2E tests from YAML scenarios. Automatically converts scenario YAML files into executable Playwright TypeScript test scripts. Trigger keywords e2e test generator, playwright generator, test generation, 测试生成, E2E脚本生成.
version: 1.0.0
---

# e2e-test-generator

**@spec T002-e2e-test-generator**
...
```

**错误示例**（缺少 frontmatter）:
```markdown
# e2e-test-generator

**@spec T002-e2e-test-generator**
...
```

**后果**: 缺少 YAML frontmatter 会导致 skill 无法被 Claude Code 系统识别，用户无法通过 `/skill-name` 调用。

### R10.4 Skill 实现规范

1. **命令调用格式**:
   - 统一使用 `/<skill-name>` 格式(如 `/scenario-author`, `/doc-writer`)
   - 支持参数传递(如 `/scenario-author create --spec P005`)
   - 必须提供清晰的帮助文档(`/<skill-name> --help`)

2. **工作流定义**:
   - 必须在 skill.md 中明确定义对话流程或自动化流程
   - 对话式 skill 必须提供引导性问题和选项
   - 自动化 skill 必须提供详细的执行步骤说明

3. **输出规范**:
   - 生成的文件必须使用标准化命名(如 `E2E-MODULE-001.yaml`)
   - 必须提供执行结果摘要(成功/失败、生成文件列表)
   - 错误信息必须清晰说明问题和解决建议

4. **资源文件组织**:
   - 模板文件: `.claude/skills/<skill-name>/assets/templates/`
   - 参考文档: `.claude/skills/<skill-name>/references/`
   - 辅助脚本: `.claude/skills/<skill-name>/scripts/`(可选)

### R10.5 验证与测试

1. **Skill 功能测试**:
   - 必须提供至少 3 个真实使用场景的测试用例
   - 必须验证 skill 对话流程的完整性和容错性
   - 必须验证生成文件的格式正确性和完整性

2. **文档完整性检查**:
   - 必须确保 spec.md, data-model.md, quickstart.md 三个文档齐全
   - **必须确保 skill.md 包含正确的 YAML frontmatter**
   - 必须确保 skill.md 与 spec.md 中的功能描述一致
   - 必须确保所有示例代码和命令可正常执行

3. **Constitution Check 适配**:
   - Skill 开发的 Constitution Check 应标注 N/A 的规则(如组件化架构、前端技术栈等)
   - 必须保留适用的规则检查(如功能分支绑定、代码归属标识、测试驱动开发)

### R10.6 禁止行为

- ❌ **禁止 skill.md 文件缺少 YAML frontmatter**(导致 skill 无法被识别)
- ❌ 禁止创建 skill 而不编写完整的 spec 文档
- ❌ 禁止 skill.md 与 spec.md 功能描述不一致
- ❌ 禁止跳过 data-model.md 或 quickstart.md 文档
- ❌ 禁止 skill 生成的文件缺少格式验证
- ❌ 禁止 skill 功能变更后不同步更新文档

## YAML Frontmatter 字段说明

| 字段 | 必需 | 说明 | 示例 |
|------|------|------|------|
| `name` | ✅ | Skill 的唯一标识符，用于命令调用 | `e2e-test-generator` |
| `description` | ✅ | 详细功能说明，包含触发关键词（中英文） | `Generate Playwright E2E tests from YAML scenarios. Trigger keywords: test generation, 测试生成` |
| `version` | ✅ | 版本号，遵循语义化版本规范 | `1.0.0` |

**触发关键词建议**:
- 包含中英文关键词
- 包含 skill 的核心功能词汇
- 包含用户可能使用的搜索词
- 示例: `e2e, test generator, playwright, 测试生成, E2E脚本生成`

## 检查清单

在提交 Claude Code skill 之前，请确认：

- [ ] spec.md 文件存在且完整
- [ ] skill.md 文件包含 YAML frontmatter
- [ ] YAML frontmatter 包含 name, description, version 三个必需字段
- [ ] description 字段包含触发关键词（中英文）
- [ ] data-model.md 文件存在且定义清晰
- [ ] quickstart.md 文件存在且包含完整示例
- [ ] 所有文件包含 `@spec T###` 归属标识
- [ ] skill 功能已测试验证
- [ ] 文档与实际功能一致

## 参考示例

**正确的 skill.md 示例**（test-scenario-author）:
```markdown
---
name: test-scenario-author
description: Use this skill to create, manage, and validate E2E test scenarios in YAML format for the Cinema Business Center Platform project. Supports guided scenario creation, YAML templates, scenario listing/filtering, and validation against E2EScenarioSpec rules. Trigger keywords e2e, scenario, test, E2E测试, 场景测试, 测试场景.
version: 1.0.0
---

# test-scenario-author

**@spec T001-e2e-scenario-author**

Use this skill to create, manage, and validate E2E test scenarios...
```

## 版本
基于 constitution.md v1.11.1 生成 | 2025-12-30
