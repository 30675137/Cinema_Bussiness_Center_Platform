# Research: 运营专家技能 (Ops Expert Skill)

**Date**: 2025-12-25
**Spec**: [spec.md](./spec.md)
**Branch**: `T001-ops-expert-skill`

## 研究目标

解决实现运营专家技能过程中的技术未知项，确保设计决策有据可依。

---

## 1. Claude Code Skill 结构最佳实践

### 研究问题
Claude Code Skill 的标准目录结构和文件格式是什么？如何组织知识库内容以实现渐进式加载？

### 决策
采用标准 Skill 目录结构，包含 SKILL.md 主文件和 references/、examples/ 子目录。

### 依据
- Context7 文档显示 Claude Code Skill 支持三种结构：最小（仅 SKILL.md）、标准（SKILL.md + references/）、完整（SKILL.md + references/ + examples/ + scripts/）
- 渐进式披露原则要求将详细内容放在 references/ 目录，避免 SKILL.md 过于臃肿
- SKILL.md 中必须显式引用 references/ 和 examples/ 文件，否则 Claude 无法发现这些资源

### 评估的替代方案
| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| 最小结构（仅 SKILL.md） | 简单 | 无法容纳大量业务知识 | 不适用 |
| 标准结构（+ references/） | 平衡 | 缺少示例和脚本支持 | 不够完整 |
| **完整结构（+ examples/ + scripts/）** | 功能齐全 | 需要更多维护 | **采用** |

### 参考来源
- Context7: `/anthropics/claude-code` - skill development structure
- Context7: `/ingpoc/skills` - skill directory organization

---

## 2. Slash Command 与 Skill 触发机制

### 研究问题
如何通过 `/ops` 命令触发运营专家技能？Command 和 Skill 如何协作？

### 决策
创建 `.claude/commands/ops.md` 作为入口，在 prompt 中引用 ops-expert skill 来激活业务知识库。

### 依据
- Claude Code 的 Slash Command 使用 Markdown + YAML frontmatter 格式
- Command 可以通过 "Use the [skill-name] skill to ensure [requirements]" 语法调用 Skill
- Skill 的 description 字段定义触发条件，但 Command 提供更明确的用户入口

### Command 文件格式
```markdown
---
description: 运营专家 - 通过对话查询数据和执行操作
allowed-tools: Read, Bash(python:*), mcp__supabase__*
---

你是影院商品管理中台的运营专家。使用 ops-expert skill 来理解系统业务规则。

用户请求: $ARGUMENTS

## 你的能力

1. **查询数据**: 通过 Supabase MCP 查询场景包、门店、影厅、预约等数据
2. **执行操作**: 通过 Python 脚本调用后端 API 执行写操作
3. **提供指导**: 根据业务知识库回答操作问题

## 工作流程

1. 分析用户意图（查询/操作/帮助）
2. 如果是查询：使用 Supabase MCP 获取数据
3. 如果是操作：调用 Python 脚本执行，执行前确认
4. 如果是帮助：参考业务知识库提供指导
```

### 评估的替代方案
| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| 仅 Skill（依赖 description 自动触发） | 自动化 | 触发条件模糊，可能误触发 | 不采用 |
| **Command + Skill 组合** | 明确入口，知识库分离 | 需要两个文件 | **采用** |
| 独立 Agent | 完全隔离 | 项目中无 agents/ 目录结构 | 暂不采用 |

---

## 3. Supabase MCP 查询能力

### 研究问题
Supabase MCP 支持哪些查询操作？如何在 Skill 中指导 Claude 使用 MCP？

### 决策
在 SKILL.md 中提供 Supabase 表结构参考和常用查询模式，让 Claude 通过 MCP 工具执行 SQL 查询。

### 依据
- Supabase MCP 提供 `mcp__supabase__query` 等工具
- 需要在 Skill 中记录数据库表结构，帮助 Claude 构建正确的查询
- 查询应限制返回行数（如 LIMIT 100），避免数据过载

### 数据库表结构参考（需包含在知识库）
```
核心表:
- stores: 门店信息
- halls: 影厅信息
- scenario_packages: 场景包
- reservations: 预约订单
- store_reservation_settings: 门店预约设置
```

---

## 4. Python 脚本 API 调用架构

### 研究问题
Python 脚本如何封装后端 API 调用？如何处理认证和错误？

### 决策
创建 `api_client.py` 作为基础客户端，封装认证、请求、错误处理逻辑。业务操作脚本（如 `scenario_ops.py`）继承基础客户端。

### 依据
- 项目已有 `.specify/scripts/` 下的 Python 工具，可以复用依赖管理
- API Token 应通过环境变量 `OPS_API_TOKEN` 传入
- 脚本应返回结构化 JSON 输出，便于 Claude 解析结果

### 脚本接口设计
```python
# api_client.py
class OpsApiClient:
    def __init__(self):
        self.base_url = os.environ.get("OPS_API_BASE_URL", "http://localhost:8080")
        self.token = os.environ.get("OPS_API_TOKEN")

    def request(self, method, endpoint, data=None):
        """统一请求方法，处理认证和错误"""
        pass

# scenario_ops.py
def update_scenario_status(scenario_id: str, status: str) -> dict:
    """更新场景包状态

    Args:
        scenario_id: 场景包 ID
        status: 目标状态 (PUBLISHED/DRAFT/ARCHIVED)

    Returns:
        {"success": true, "message": "已更新"} 或错误信息
    """
    pass
```

### 评估的替代方案
| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| 直接在 Command 中写 curl | 简单 | 难以维护，错误处理差 | 不采用 |
| **Python 脚本封装** | 可测试，可复用 | 需要额外文件 | **采用** |
| Node.js 脚本 | 与前端技术栈一致 | 项目 Python 工具更成熟 | 不采用 |

---

## 5. 知识库内容来源与生成

### 研究问题
如何从 specs 目录生成业务知识库？手动补充哪些内容？

### 决策
- 从 specs 目录提取：实体定义、业务规则、验收标准
- 手动补充：运营操作指南、常见问题、对话示例

### 知识库目录结构
```
skills/ops-expert/
├── SKILL.md                    # 主文件：能力概述、工作流程
├── references/
│   ├── scenario-package.md     # 场景包管理（从 017-scenario-package 提取）
│   ├── store-management.md     # 门店管理（从 022-store-crud 等提取）
│   ├── hall-management.md      # 影厅管理（从 014-hall-store-backend 提取）
│   ├── reservation.md          # 预约管理（从 016-store-reservation-settings 等提取）
│   ├── database-schema.md      # 数据库表结构参考
│   ├── ops-guide.md            # 运营操作指南（手动维护）
│   └── glossary.md             # 业务术语表
├── examples/
│   └── common-queries.md       # 常见查询和操作示例
└── scripts/
    ├── __init__.py
    ├── api_client.py           # API 客户端基类
    ├── scenario_ops.py         # 场景包操作
    ├── store_ops.py            # 门店操作
    └── utils.py                # 工具函数
```

### Specs 到知识库映射
| Spec | 知识库文件 | 提取内容 |
|------|-----------|---------|
| 017-scenario-package | scenario-package.md | 场景包结构、状态流转、发布规则 |
| 022-store-crud | store-management.md | 门店 CRUD、状态管理 |
| 016-store-reservation-settings | reservation.md | 预约设置规则 |
| 014-hall-store-backend | hall-management.md | 影厅-门店关联 |
| P001-sku-master-data | glossary.md | SKU 相关术语 |

---

## 6. 安全与权限考虑

### 研究问题
如何确保运营专家技能不执行越权操作？

### 决策
- Command 的 `allowed-tools` 限制可用工具
- Python 脚本内置操作确认机制
- 敏感操作（删除、批量修改）需要显式用户确认

### 安全措施
1. **工具限制**: `allowed-tools: Read, Bash(python:*), mcp__supabase__query`
2. **环境变量**: API Token 不在代码中硬编码
3. **操作确认**: 写操作脚本返回前先显示影响范围，等待用户确认

---

## 研究结论

所有技术未知项已解决，可以进入 Phase 1 设计阶段。关键决策：

1. ✅ 采用完整 Skill 目录结构（SKILL.md + references/ + examples/ + scripts/）
2. ✅ 使用 Command + Skill 组合模式，`/ops` 作为入口
3. ✅ 查询通过 Supabase MCP，写操作通过 Python 脚本
4. ✅ 知识库从 specs 目录提取，手动补充运营指南
5. ✅ 安全通过工具限制和操作确认保障
