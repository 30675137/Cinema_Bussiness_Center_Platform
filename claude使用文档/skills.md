# Agent Skills - Claude Code 技能系统详解

**来源**: https://code.claude.com/docs/en/skills

---

## 概述

Skill（技能）是一个 Markdown 文件，用于教会 Claude 如何完成特定任务：
- 使用团队标准审查 PR
- 按照你的格式生成 commit message
- 查询公司的数据库 schema

当你的请求匹配 Skill 的用途时，Claude 会自动应用它。

---

## 创建第一个 Skill

### 示例：创建代码解释技能

这个 Skill 教会 Claude 用可视化图表和类比来解释代码。

#### 步骤 1：查看可用的 Skills

```
> What Skills are available?
```

Claude 会列出当前已加载的所有 Skills。

#### 步骤 2：创建 Skill 目录

```bash
# 个人 Skills（跨项目可用）
mkdir -p ~/.claude/skills/explaining-code

# 或项目 Skills（团队共享）
mkdir -p .claude/skills/explaining-code
```

#### 步骤 3：编写 SKILL.md

创建 `~/.claude/skills/explaining-code/SKILL.md`：

```markdown
---
name: explaining-code
description: Explains code with visual diagrams and analogies. Use when explaining how code works, teaching about a codebase, or when the user asks "how does this work?"
---

When explaining code, always include:

1. **Start with an analogy**: Compare the code to something from everyday life
2. **Draw a diagram**: Use ASCII art to show the flow, structure, or relationships
3. **Walk through the code**: Explain step-by-step what happens
4. **Highlight a gotcha**: What's a common mistake or misconception?

Keep explanations conversational. For complex concepts, use multiple analogies.
```

#### 步骤 4：加载并验证

退出并重启 Claude Code，然后验证：

```
> What Skills are available?
```

你应该看到 `explaining-code` 出现在列表中。

#### 步骤 5：测试 Skill

打开任意文件，提问匹配 Skill 描述的问题：

```
> How does this code work?
```

Claude 会询问是否使用 `explaining-code` Skill，然后在解释中包含类比和 ASCII 图表。

---

## Skills 工作原理

### 三阶段流程

1. **Discovery（发现）**
   - 启动时，Claude 只加载每个 Skill 的 name 和 description
   - 保持启动速度，同时让 Claude 知道何时使用每个 Skill

2. **Activation（激活）**
   - 当请求匹配 Skill 的描述时，Claude 请求使用该 Skill
   - 你会看到确认提示，然后完整的 `SKILL.md` 才会加载到上下文

3. **Execution（执行）**
   - Claude 遵循 Skill 的指令
   - 根据需要加载引用文件或运行捆绑脚本

### Skills 存储位置

| 位置 | 路径 | 适用范围 |
|------|------|----------|
| Enterprise | 见托管设置 | 组织内所有用户 |
| Personal | `~/.claude/skills/` | 你的所有项目 |
| Project | `.claude/skills/` | 此仓库的所有开发者 |
| Plugin | 随插件捆绑 | 安装该插件的用户 |

**优先级**：同名 Skill，上层覆盖下层（Enterprise > Personal > Project > Plugin）

---

## Skills vs 其他选项对比

| 功能 | 用途 | 触发方式 |
|------|------|----------|
| **Skills** | 给 Claude 专业知识（如"按团队标准审查 PR"） | Claude 自动选择 |
| **Slash commands** | 创建可重用提示（如 `/deploy staging`） | 手动输入 `/command` |
| **CLAUDE.md** | 设置项目级指令（如"使用 TypeScript strict mode"） | 每次对话自动加载 |
| **Subagents** | 在独立上下文中委托任务 | Claude 委托或手动调用 |
| **Hooks** | 事件触发脚本（如保存时 lint） | 特定工具事件触发 |
| **MCP servers** | 连接外部工具和数据源 | Claude 按需调用 |

### Skills vs Subagents

- **Skills**：向当前对话添加知识
- **Subagents**：在独立上下文中运行，有自己的工具

**使用 Skills**：指导和标准
**使用 Subagents**：需要隔离或不同工具访问

### Skills vs MCP

- **Skills**：告诉 Claude *如何* 使用工具
- **MCP**：*提供* 工具

例如：MCP 服务器连接数据库，Skill 教 Claude 你的数据模型和查询模式。

---

## 配置 Skills

### SKILL.md 文件结构

```markdown
---
name: your-skill-name
description: Brief description of what this Skill does and when to use it
---

# Your Skill Name

## Instructions
Provide clear, step-by-step guidance for Claude.

## Examples
Show concrete examples of using this Skill.
```

### 可用元数据字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | 是 | Skill 名称。只能使用小写字母、数字和连字符（最多 64 字符）。应与目录名匹配 |
| `description` | 是 | Skill 功能和使用时机（最多 1024 字符）。Claude 用此决定何时应用 Skill |
| `allowed-tools` | 否 | Skill 激活时 Claude 可无需询问使用的工具 |
| `model` | 否 | Skill 激活时使用的模型（如 `claude-sonnet-4-20250514`）。默认使用对话的模型 |

### 更新或删除 Skill

- **更新**：直接编辑 `SKILL.md` 文件
- **删除**：删除 Skill 目录
- **生效**：退出并重启 Claude Code

---

## 多文件 Skill 结构

### 渐进式披露

保持 `SKILL.md` 简洁（500 行以内），将详细参考资料放在单独文件中。

### 示例结构

```
my-skill/
├── SKILL.md           # 必需 - 概述和导航
├── reference.md       # 详细 API 文档 - 需要时加载
├── examples.md        # 使用示例 - 需要时加载
└── scripts/
    └── helper.py      # 工具脚本 - 执行但不加载内容
```

### SKILL.md 引用示例

```markdown
## Overview

[Essential instructions here]

## Additional resources

- For complete API details, see [reference.md](reference.md)
- For usage examples, see [examples.md](examples.md)

## Utility scripts

To validate input files, run the helper script:
```bash
python scripts/helper.py input.txt
```
```

**重要**：
- 引用保持一层深度，直接从 `SKILL.md` 链接到参考文件
- 避免深层嵌套（A → B → C），可能导致 Claude 部分读取文件

---

## 工具限制

### 允许特定工具

使用 `allowed-tools` 字段指定 Skill 激活时可自动使用的工具：

```yaml
---
name: database-queries
description: Helps write and run database queries
allowed-tools:
  - mcp__postgres__query
  - Read
---
```

### 常用工具列表

| 工具 | 说明 |
|------|------|
| `Read` | 读取文件 |
| `Write` | 写入文件 |
| `Edit` | 编辑文件 |
| `Bash` | 执行 shell 命令 |
| `mcp__*` | MCP 服务器提供的工具 |

---

## 实用 Skill 示例

### 1. PR 审查 Skill

```markdown
---
name: pr-review
description: Reviews pull requests using team coding standards. Use when reviewing code changes, checking for issues, or preparing PR feedback.
---

## Review Checklist

When reviewing code:

1. **Code Quality**
   - Check for proper error handling
   - Verify naming conventions match project style
   - Look for code duplication

2. **Testing**
   - Ensure new code has tests
   - Check edge cases are covered

3. **Security**
   - Review for SQL injection risks
   - Check for exposed secrets
   - Verify input validation

4. **Performance**
   - Look for N+1 query issues
   - Check for unnecessary loops

## Output Format

Provide feedback as:
- 🔴 **Critical**: Must fix before merge
- 🟡 **Suggestion**: Should consider
- 💚 **Praise**: Good practices
```

### 2. Commit Message Skill

```markdown
---
name: commit-message
description: Generates commit messages following conventional commits format. Use when creating commits or describing changes.
---

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

## Examples

```
feat(auth): add OAuth2 login support

Implements Google OAuth2 for user authentication.
Includes token refresh and session management.

Closes #123
```
```

### 3. API 文档 Skill

```markdown
---
name: api-docs
description: Generates API documentation in OpenAPI format. Use when documenting endpoints or creating API specifications.
---

## Document Structure

For each endpoint, include:

1. **Path and Method**
2. **Summary** - One line description
3. **Request Body** - With schema and examples
4. **Response** - All status codes with schemas
5. **Authentication** - Required auth method

## Example

```yaml
/api/users/{id}:
  get:
    summary: Get user by ID
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: string
          format: uuid
    responses:
      200:
        description: User found
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
      404:
        description: User not found
```
```

---

## 故障排除

### Skill 未触发

1. **检查描述**：确保描述包含用户可能使用的关键词
2. **重新措辞**：尝试包含更多匹配描述的词语
3. **验证加载**：运行 `What Skills are available?` 确认 Skill 已加载
4. **检查语法**：确保 YAML frontmatter 格式正确

### Skill 加载失败

1. **检查文件名**：必须是 `SKILL.md`（大写）
2. **验证 YAML**：确保 `---` 标记正确
3. **必填字段**：`name` 和 `description` 是必须的
4. **重启 Claude Code**：修改后需要重启才能生效

### 性能问题

1. **保持 SKILL.md 简洁**：不超过 500 行
2. **使用渐进式披露**：详细内容放在单独文件
3. **避免深层嵌套引用**

---

## 最佳实践

### 编写有效的描述

```markdown
# ✅ 好的描述
description: Reviews Python code for PEP 8 compliance and common anti-patterns. Use when checking code style or preparing for code review.

# ❌ 差的描述
description: Code review helper
```

- 包含具体的触发词
- 说明何时使用
- 描述 Skill 的具体功能

### 结构化指令

```markdown
# 使用清晰的标题和列表
## Step 1: Analyze
- Check for X
- Verify Y

## Step 2: Report
- Format as table
- Include severity

## Step 3: Suggest fixes
- Provide code snippets
- Explain rationale
```

### 包含示例

```markdown
## Example Input
```python
def foo(x):
    return x+1
```

## Example Output
```python
def increment(value: int) -> int:
    """Increment the given value by one."""
    return value + 1
```
```

---

## 总结

| 要点 | 说明 |
|------|------|
| **位置** | `~/.claude/skills/` (个人) 或 `.claude/skills/` (项目) |
| **必需文件** | `SKILL.md` |
| **必填字段** | `name` 和 `description` |
| **触发方式** | Claude 根据请求自动匹配 |
| **生效方式** | 重启 Claude Code |
| **最佳实践** | 描述精准、指令清晰、包含示例 |

---

*文档来源: https://code.claude.com/docs/en/skills*
