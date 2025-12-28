# Subagents - Claude Code 子代理系统详解

**来源**: https://code.claude.com/docs/en/sub-agents

---

## 概述

Subagents（子代理）是 Claude Code 中的专用 AI 助手，可被调用来处理特定类型的任务。
它们通过提供特定于任务的配置（包括自定义系统提示、工具和独立的上下文窗口）来实现更高效的问题解决。

---

## 什么是 Subagents

Subagents 是 Claude Code 可以委托任务的预配置 AI 人格。每个 subagent：
- 有特定的用途和专业领域
- 使用与主对话分离的独立上下文窗口
- 可以配置为使用特定的工具
- 包含指导其行为的自定义系统提示

当 Claude Code 遇到匹配 subagent 专业领域的任务时，它可以将该任务委托给专用 subagent，该 subagent 独立工作并返回结果。

---

## 主要优势

### 上下文保护
每个 subagent 在自己的上下文中运行，防止污染主对话，使其专注于高级目标。

### 专业领域
Subagents 可以用特定领域的详细说明进行微调，从而在指定任务上获得更高的成功率。

### 可重用性
创建后，你可以在不同项目中使用 subagents，并与团队共享以实现一致的工作流程。

### 灵活权限
每个 subagent 可以有不同的工具访问级别，允许你将强大的工具限制为特定 subagent 类型。

---

## 快速开始

### 创建第一个 Subagent

#### 步骤 1：打开 subagents 界面

```bash
/agents
```

#### 步骤 2：选择 'Create New Agent'

选择创建项目级还是用户级 subagent

#### 步骤 3：定义 subagent

- **推荐**：先让 Claude 生成，然后自定义
- 详细描述 subagent，包括 Claude 何时使用它
- 选择要授予访问权限的工具，或留空以继承所有工具
- 界面显示所有可用工具
- 如果使用 Claude 生成，也可以按 'e' 在自己的编辑器中编辑系统提示

#### 步骤 4：保存并使用

Subagent 现在可用。Claude 在适当情况下自动使用它，或你可以显式调用它：

```
> Use the code-reviewer subagent to check my recent changes
```

---

## Subagent 配置

### 文件位置

| 类型 | 位置 | 范围 | 优先级 |
|------|------|------|--------|
| 项目 subagents | `.claude/agents/` | 当前项目可用 | 最高 |
| 用户 subagents | `~/.claude/agents/` | 所有项目可用 | 较低 |

当 subagent 名称冲突时，项目级 subagents 优先于用户级 subagents。

### 插件 agents

插件可以提供与 Claude Code 无缝集成的自定义 subagents。插件 agents 与用户定义的 agents 工作方式相同，并出现在 `/agents` 界面中。

**插件 agent 位置**：插件在它们的 `agents/` 目录（或插件清单中指定的自定义路径）中包含 agents。

**使用插件 agents**：
- 插件 agents 与你的自定义 agents 一起出现在 /agents 中
- 可以显式调用："Use the code-reviewer agent from the security-plugin"
- Claude 可以在适当时自动调用
- 可以通过 /agents 界面管理（查看、检查）

### CLI 配置

你也可以使用 `--agents` CLI 标志动态定义 subagents，它接受 JSON 对象：

```bash
claude --agents '{
"code-reviewer": {
"description": "Expert code reviewer. Use proactively after code changes.",
"prompt": "You are a senior code reviewer. Focus on code quality, security, and best practices.",
"tools": ["Read", "Grep", "Glob", "Bash"],
"model": "sonnet"
}
}'
```

**优先级**：CLI 定义的 subagents 优先级低于项目级 subagents，但高于用户级 subagents。

**用例**：
- 快速测试 subagent 配置
- 无需保存的会话特定 subagents
- 需要自定义 subagents 的自动化脚本
- 在文档或脚本中共享 subagent 定义

### 文件格式

每个 subagent 在 Markdown 文件中定义，具有以下结构：

```markdown
---
name: your-sub-agent-name
description: Description of when this subagent should be invoked
tools: tool1, tool2, tool3  # 可选 - 省略时继承所有工具
model: sonnet  # 可选 - 指定模型别名或 'inherit'
permissionMode: default  # 可选 - subagent 的权限模式
skills: skill1, skill2  # 可选 - 自动加载的技能
---

你的 subagent 的系统提示在这里。可以是多段落
并应清楚定义 subagent 的角色、能力和解决问题的方法。

包括具体的说明、最佳实践和 subagent 应遵循的任何约束。
```

#### 配置字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | 是 | 使用小写字母和连字符的唯一标识符 |
| `description` | 是 | subagent 目的的自然语言描述 |
| `tools` | 否 | 特定工具的逗号分隔列表。省略时继承主线程的所有工具 |
| `model` | 否 | 此 subagent 使用的模型。可以是模型别名（sonnet, opus, haiku）或 'inherit' 以使用主对话的模型。省略时默认为配置的 subagent 模型 |
| `permissionMode` | 否 | subagent 的权限模式。有效值：default, acceptEdits, bypassPermissions, plan, ignore。控制 subagent 如何处理权限请求 |
| `skills` | 否 | 启动时自动加载的技能名称的逗号分隔列表。subagents 不从父对话继承 Skills。省略时，不预加载 Skills |

### 模型选择

`model` 字段允许你控制 subagent 使用的 AI 模型：
- **模型别名**：使用可用别名之一：sonnet, opus, 或 haiku
- **'inherit'**：使用与主对话相同的模型（对一致性有用）
- **省略**：未指定时，使用为 subagents 配置的默认模型（sonnet）

使用 `'inherit'` 在你希望 subagents 适应主对话的模型选择时特别有用，确保整个会话中的一致能力和响应风格。

### 可用工具

Subagents 可以被授予访问 Claude Code 的任何内部工具的权限。

**推荐**：使用 `/agents` 命令修改工具访问权限 - 它提供交互界面，列出所有可用工具，包括任何连接的 MCP 服务器工具，使选择所需工具更容易。

配置工具的两个选项：
- 省略工具字段以继承主线程的所有工具（默认），包括 MCP 工具
- 指定为逗号分隔列表以进行更细粒度的控制（可以手动或通过 /agents 编辑）

---

## 管理 Subagents

### 使用 /agents 命令（推荐）

`/agents` 命令提供全面的 subagent 管理界面：

```
/agents
```

这会打开交互菜单，你可以在其中：
- 查看所有可用 subagents（内置、用户和项目）
- 使用引导设置创建新 subagents
- 编辑现有自定义 subagents，包括其工具访问权限
- 删除自定义 subagents
- 查看重复存在时的活动 subagents
- 使用完整可用工具列表管理工具权限

### 直接文件管理

你也可以通过直接处理它们的文件来管理 subagents：

```bash
# 创建项目 subagent
mkdir -p .claude/agents
echo '---
name: test-runner
description: Use proactively to run tests and fix failures
---

You are a test automation expert. When you see code changes, proactively run the appropriate tests. If tests fail, analyze the failures and fix them while preserving the original test intent.' > .claude/agents/test-runner.md

# 创建用户 subagent
mkdir -p ~/.claude/agents
# ... 创建 subagent 文件
```

通过手动添加文件创建的 subagents 将在下次启动 Claude Code 会话时加载。要立即创建和使用 subagent 而无需重启，请使用 `/agents` 命令。

---

## 有效使用 Subagents

### 自动委托

Claude Code 根据以下内容主动委托任务：
- 你请求中的任务描述
- subagent 配置中的描述字段
- 当前上下文和可用工具

要鼓励更多主动 subagent 使用，请在 `description` 字段中包含 "use PROACTIVELY" 或 "MUST BE USED" 等短语。

### 显式调用

通过在命令中提及它来请求特定 subagent：

```
> Use the test-runner subagent to fix failing tests
> Have the code-reviewer subagent look at my recent changes
> Ask the debugger subagent to investigate this error
```

---

## 内置 Subagents

Claude Code 包括开箱即用的内置 subagents：

### 通用 subagent

通用 subagent 是一个功能强大的代理，适用于需要探索和操作的复杂多步骤任务。与探索 subagent 不同，它可以修改文件并执行更广泛的操作。

**关键特征**：
- **模型**：使用 Sonnet 进行更强大的推理
- **工具**：可以访问所有工具
- **模式**：可以读写文件

---

## 实用 Subagent 示例

### 1. 代码审查 Subagent

```markdown
---
name: code-reviewer
description: Expert code reviewer. Use proactively after code changes to check for quality, security, and best practices.
tools: Read, Grep, Glob, Bash
model: sonnet
---

You are a senior code reviewer. Focus on:

1. **Code Quality**
   - Check for proper error handling
   - Verify naming conventions
   - Look for code duplication

2. **Security**
   - Review for injection risks
   - Check for exposed secrets
   - Verify input validation

3. **Best Practices**
   - Follow project coding standards
   - Ensure proper documentation
   - Check for performance issues

Format your review as:
- 🔴 **Critical**: Must fix before merge
- 🟡 **Suggestion**: Should consider
- 💚 **Praise**: Good practices
```

### 2. 测试运行器 Subagent

```markdown
---
name: test-runner
description: Use proactively to run tests and fix failures. Check for test coverage and ensure all tests pass.
tools: Bash, Read, Write
model: inherit
---

You are a test automation expert. When you see code changes:

1. **Run appropriate tests**
   - Unit tests for changed files
   - Integration tests for affected modules
   - Regression tests for critical paths

2. **Analyze failures**
   - Identify root cause of test failures
   - Fix broken tests while preserving original intent
   - Add new tests for bug fixes

3. **Report status**
   - Test coverage percentage
   - List of passing/failing tests
   - Suggestions for additional test cases
```

### 3. 调试器 Subagent

```markdown
---
name: debugger
description: Investigate errors and debug issues. Analyze stack traces, logs, and reproduce problems.
tools: Read, Grep, Bash, Edit
permissionMode: plan
---

You are an expert debugger. When investigating issues:

1. **Analyze the problem**
   - Examine error messages and stack traces
   - Check logs for related entries
   - Reproduce the issue if possible

2. **Identify root cause**
   - Trace execution flow
   - Check variable values and state
   - Identify the specific location of the problem

3. **Propose solution**
   - Suggest fixes with code examples
   - Consider edge cases
   - Verify the fix addresses the root cause
```

---

## 最佳实践

### 命名约定
- 使用小写字母和连字符
- 描述性名称（如 `code-reviewer`, `test-runner`）
- 避免过于通用的名称

### 描述优化
- 包含触发关键词
- 明确何时使用
- 描述专业领域

### 工具权限
- 限制到必需的工具
- 避免不必要的权限
- 使用 `permissionMode` 控制行为

### 系统提示
- 明确角色和职责
- 包含具体指令
- 设置输出格式
- 考虑边缘情况

---

## 总结

| 要点 | 说明 |
|------|------|
| **位置** | `.claude/agents/` (项目) 或 `~/.claude/agents/` (用户) |
| **文件格式** | Markdown 文件，YAML frontmatter |
| **触发方式** | 自动委托或显式调用 |
| **权限控制** | 工具访问和权限模式 |
| **最佳实践** | 明确描述、限制权限、结构化提示 |

---

*文档来源: https://code.claude.com/docs/en/sub-agents*
