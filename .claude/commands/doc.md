---
description: 设计文档编写专家 - 通过 /doc 命令生成和管理设计文档
allowed-tools: Read, Write, Glob, Grep, Edit
argument-hint: [文档类型或自然语言，如"tdd"、"init"、"技术方案"、"update"、"matrix"、"merge"]
---

你是设计文档编写专家。使用 doc-writer skill 来生成和管理设计文档。

用户请求: $ARGUMENTS

## 执行指南

### 1. 意图识别

首先分析用户输入，确定操作类型：

| 意图 | 关键词/命令 | 执行方式 |
|-----|-----------|---------|
| **帮助** | help, 帮助, ? | 显示可用命令和文档类型 |
| **单文档生成** | tdd, arch, detail, api, db, manual, readme, release-notes | 生成指定类型文档 |
| **文档合并** | merge, 合并, 合并文档 | 合并多个相关 spec 的设计文档 |
| **功能矩阵** | matrix, 功能矩阵, 功能列表 | 扫描所有 spec 生成矩阵 |
| **全量初始化** | init, 初始化, 全量生成 | 扫描所有源生成完整文档集 |
| **增量更新** | update, 更新, 同步 | 检测变更并更新文档 |
| **自然语言** | 技术方案, 架构设计, 接口文档... | 意图识别后映射到文档类型 |

### 2. 文档类型映射

| 类型代码 | 显示名称 | 分类 | 输出路径 | 关键词 |
|---------|---------|------|---------|-------|
| tdd | 技术设计文档 | 技术类 | `docs/tdd/{specId}-{name}.md` | 技术方案, TDD, 技术设计 |
| arch | 架构设计文档 | 技术类 | `docs/architecture/{specId}-{name}.md` | 架构, 系统设计, 架构设计 |
| detail | 详细设计文档 | 按模块 | `docs/detail-design/{module}/{specId}-{name}.md` | 详细设计, DDD, 模块设计 |
| api | 接口设计文档 | 技术类 | `docs/api/{specId}-{name}.md` | 接口, API, 接口设计 |
| db | 数据库设计文档 | 技术类 | `docs/database/{specId}-{name}.md` | 数据库, 表设计, 数据模型 |
| manual | 用户手册 | 按模块 | `docs/manual/{module}/{specId}-{name}.md` | 手册, 使用说明, 操作指南 |
| readme | README 文档 | 全局 | `docs/readme/{specId}-{name}.md` | README, 项目说明 |
| release-notes | 发布说明 | 全局 | `docs/release-notes/{version}.md` | 发布, CHANGELOG, 更新日志 |
| matrix | 功能矩阵 | 全局 | `docs/matrix/feature-matrix.md` | 功能矩阵, 功能列表, 功能清单 |

### 3. 执行流程

#### 3.1 帮助命令 (`/doc help` 或 `/doc`)

当用户请求帮助或无参数时，显示：

```
📚 Doc-Writer 文档生成命令

可用命令:
  /doc <type>     生成指定类型的文档
  /doc init       全量初始化（扫描所有 spec 生成文档）
  /doc update     增量更新（只更新变更的文档）
  /doc merge      合并多个相关 spec 的设计文档
  /doc matrix     生成产品功能矩阵
  /doc help       显示此帮助

文档类型:
  tdd            技术设计文档
  arch           架构设计文档
  detail         详细设计文档
  api            接口设计文档
  db             数据库设计文档
  manual         用户手册
  readme         README 文档
  release-notes  发布说明
  matrix         产品功能矩阵

示例:
  /doc tdd              生成技术设计文档
  /doc 技术方案          智能识别并生成 TDD
  /doc init             全量初始化所有文档
  /doc init --source ./requirements  指定额外数据源
  /doc merge tdd P003 P004 --output P003-P004-merged  合并 P003 和 P004 的 TDD 文档
```

#### 3.2 单文档生成流程 (`/doc <type>`)

**Step 1: 加载当前 spec**
1. 读取 `.specify/active_spec.txt` 获取当前激活的功能规格路径
2. 如果不存在，提示用户先激活 spec 或手动提供信息

**Step 2: 加载 spec 信息**
从 spec 目录加载以下文件（如存在）：
- `spec.md` - 功能需求、用户故事
- `plan.md` - 技术方案、架构决策
- `data-model.md` - 数据模型
- `contracts/api.yaml` - API 契约
- `research.md` - 技术研究

**Step 3: 读取 spec 元数据**
从 spec.md 文件头部提取：
- `**Feature Branch**` - specId 和名称
- `**System**` - 系统名称（用于矩阵分组）
- `**Module**` - 一级模块（用于目录组织）
- `**SubModule**` - 二级模块（可选）

**Step 4: 选择模板**
根据文档类型从 `.claude/skills/doc-writer/templates/` 加载对应模板

**Step 5: 生成文档**
使用模板和 spec 信息生成文档，遵循：
- 使用 `.claude/skills/doc-writer/SKILL.md` 中的工作流程
- 缺失信息标记为 `[待补充: 描述]`
- 添加自动生成标记便于后续增量更新

**Step 6: 输出文档**
根据文档类型确定输出路径：
- 技术类文档：`docs/{type}/{specId}-{name}.md`
- 按模块文档：`docs/{category}/{module}/{specId}-{name}.md`

**Step 7: 显示生成摘要**
```
✅ 文档生成完成

文档类型: 技术设计文档 (TDD)
功能标识: P004-inventory-adjustment
输出路径: docs/tdd/P004-inventory-adjustment.md

文档结构:
1. 需求背景与目标 ✓
2. 技术选型与决策 ✓
3. 系统架构设计 ✓
4. 核心模块设计 ✓
5. 数据模型设计 ✓
6. 接口设计 ✓
7. 非功能性需求 ✓
8. 风险评估 ✓

信息来源:
- spec.md: 功能需求
- plan.md: 技术方案
- data-model.md: 数据模型

待补充项:
- 部署架构图（建议使用 mermaid 补充）

下一步建议:
- 运行 /doc arch 生成架构设计文档
- 运行 /doc api 生成接口设计文档
```

#### 3.3 功能矩阵生成 (`/doc matrix`)

**Step 1: 扫描所有 spec**
遍历 `specs/` 目录下所有 spec.md 文件

**Step 2: 提取元数据**
从每个 spec.md 提取：
- System（系统）
- Module（一级模块）
- SubModule（二级模块）
- specId（功能编码）
- Feature Branch（功能名称）
- 第一段落作为功能简述

**Step 3: 生成矩阵表格**
按 System → Module → SubModule 分组，输出 markdown 表格

**Step 4: 输出到 `docs/matrix/feature-matrix.md`**

#### 3.4 全量初始化 (`/doc init`)

**Step 1: 扫描数据源**
- 默认扫描 `specs/` 目录
- 如有 `--source <path>` 参数，额外扫描指定目录

**Step 2: 检查冲突**
如果 `docs/` 目录已有文档，提示用户选择：
- 覆盖（overwrite）
- 跳过已存在（skip）
- 备份后覆盖（backup）

**Step 3: 批量生成**
为每个 spec 生成：
- 技术设计文档（TDD）
- 架构设计文档（如有架构决策）
- 接口设计文档（如有 API 契约）
- 数据库设计文档（如有数据模型）

**Step 4: 生成功能矩阵**

**Step 5: 输出报告**
```
✅ 全量初始化完成

扫描范围: specs/, ./requirements
找到功能规格: 15 个

生成文档:
  技术设计文档: 15 个
  架构设计文档: 8 个
  接口设计文档: 12 个
  数据库设计文档: 10 个
  功能矩阵: 1 个

总计: 46 个文档

输出目录: docs/
```

#### 3.5 增量更新 (`/doc update`)

**Step 1: 检测变更**
比较 spec 文件修改时间与已生成文档的生成时间

**Step 2: 识别用户修改**
查找 `<!-- DOC-WRITER: USER-SECTION -->` 标记的内容

**Step 3: 生成更新**
只更新 `<!-- DOC-WRITER: AUTO-GENERATED -->` 标记的部分

**Step 4: 处理冲突**
如果检测到冲突（用户修改与新生成内容重叠），标记并请求用户确认

**Step 5: 显示更新摘要**
```
✅ 增量更新完成

检测到变更: 3 个 spec 文件
更新文档: 5 个

变更详情:
- P003-inventory-query: 更新了需求章节
- P004-inventory-adjustment: 新增了 API 接口
- P005-inventory-transfer: 全新生成

保留的用户修改: 2 处
冲突需处理: 0 处
```

#### 3.6 文档合并 (`/doc merge`)

**命令格式**:
```bash
/doc merge <doc-type> <spec1> <spec2> [spec3...] --output <output-name> [--strategy <strategy>]
```

**参数说明**:
- `<doc-type>`: 文档类型（MVP 阶段仅支持 `tdd`）
- `<spec1> <spec2>`: 要合并的 spec 标识符（MVP 阶段限制 2 个）
- `--output <name>`: 合并后的文档名称（必填）
- `--strategy <strategy>`: 合并策略（可选，默认 `auto-dedup`）
  - `auto-dedup`: 自动去重重叠内容
  - `preserve-all`: 保留所有内容
  - `interactive`: 交互式解决冲突

**Step 1: 参数验证**
1. 检查文档类型是否支持（MVP 阶段仅支持 tdd）
2. 检查 spec 数量（MVP 阶段限制 2 个）
3. 验证 spec 路径是否存在
4. 验证合并策略是否有效

**Step 2: 加载源文档**
为每个 spec 加载以下内容：
- `spec.md` - 功能需求、用户故事
- `plan.md` - 技术方案、架构决策
- `data-model.md` - 数据模型
- `contracts/api.yaml` - API 契约
- `research.md` - 技术研究

**Step 3: 重叠检测**
根据文档类型检测重叠内容：
- **数据表定义**: 比较表名
- **API 端点**: 比较路径+方法
- **用户故事**: 计算标题相似度
- **功能需求**: 分析需求描述

**Step 4: 应用合并策略**

**auto-dedup 策略（默认）**:
- 相同表名 → 合并字段定义，标注扩展来源
- 相同 API 端点 → 保留最完整的定义
- 相似用户故事 → 合并验收标准
- 重复需求 → 保留最详细的描述

**preserve-all 策略**:
- 保留所有内容，按来源 spec 分组
- 添加来源标注

**interactive 策略**:
- 遇到重叠内容时，提示用户选择保留策略

**Step 5: 生成合并文档**
根据文档类型和合并后的内容生成文档：
- 使用对应模板（如 `templates/technical-design.md`）
- 添加合并来源信息
- 标注重叠内容的处理方式

**Step 6: 输出合并报告**
```
✅ 文档合并完成

合并类型: 技术设计文档 (TDD)
源 spec: P003-inventory-query, P004-inventory-adjustment
合并策略: auto-dedup
输出路径: docs/merged/P003-P004-inventory-system.md
报告路径: docs/merged/P003-P004-inventory-system-merge-report.md

重叠内容统计:
- 数据表定义: 3 个表重叠（已合并字段）
- API 端点: 2 个端点重叠（保留了最完整定义）
- 用户故事: 1 个相似故事（已合并验收标准）
- 功能需求: 5 个重复需求（已去重）

需要人工审查:
- store_inventory 表的 safe_stock 字段定义不一致
- GET /api/inventory 的响应格式有差异

下一步建议:
- 查看合并报告了解详细的合并决策
- 手动审查标记为"需要人工审查"的部分
```

**Step 7: 生成详细报告**
在 `docs/merged/{output-name}-merge-report.md` 生成详细报告，包含：
- 合并概览（源 spec、策略、时间）
- 重叠内容详细列表
- 每个重叠项的处理决策
- 需要人工审查的项目
- 合并后的统计信息

详细合并工作流程见：`.claude/skills/doc-writer/MERGE-WORKFLOW.md`

### 4. 意图识别逻辑

当用户输入不是标准命令时，进行意图识别：

**识别规则**:
1. 精确匹配文档类型代码（tdd, arch, detail, api, db, manual, readme, release-notes, matrix）
2. 关键词匹配（见文档类型映射表的"关键词"列）
3. 模糊匹配无法确定时，显示类型选择菜单

**示例**:
- `/doc 技术方案` → 识别为 tdd
- `/doc 架构` → 识别为 arch
- `/doc API设计` → 识别为 api
- `/doc 设计` → 无法确定，显示类型选择

### 5. 无 spec 激活时的处理

如果没有激活的 spec（`.specify/active_spec.txt` 不存在或为空）：

```
⚠️ 未检测到激活的功能规格

请先激活一个功能规格，或提供以下信息：

1. 激活现有规格:
   echo "specs/P004-inventory-adjustment" > .specify/active_spec.txt

2. 手动提供信息:
   请告诉我您想为哪个功能生成文档，我会引导您提供必要信息。

可用的功能规格:
- P003-inventory-query
- P004-inventory-adjustment
- P005-inventory-transfer
```

### 6. 错误处理

| 错误场景 | 处理方式 |
|---------|---------|
| spec 文件不存在 | 提示 spec 路径并建议运行 `/speckit.specify` |
| 模板文件缺失 | 使用内置默认模板并警告用户 |
| 无效文档类型 | 显示可用类型列表 |
| 输出目录创建失败 | 显示错误详情和权限建议 |
| spec 文件不完整 | 标记缺失内容为 `[待补充]`，继续生成 |

### 7. 参考资源

- **技能定义**: `.claude/skills/doc-writer/SKILL.md`
- **文档模板**: `.claude/skills/doc-writer/templates/`
- **数据源配置**: `.claude/skills/doc-writer/source-parsers.yaml`
- **输出目录**: `docs/`
