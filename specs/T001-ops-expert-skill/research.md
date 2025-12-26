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

---

## 7. 单位换算专家扩展 (2025-12-26 新增)

### 研究问题
如何在现有 ops-expert Skill 基础上扩展单位换算专家能力？如何复用 P002-unit-conversion 模块？

### 决策
**扩展现有 Skill，新增单位换算专家模块**，复用 P002 的后端 API 和算法实现。

### 依据
1. **复用现有基础设施**: api_client.py、Supabase 连接已建立
2. **一致的用户体验**: 运营人员通过同一个 `/ops` 命令访问所有能力
3. **统一的安全约束**: 继承现有的操作确认、日志记录机制
4. **算法成熟**: P002 已实现 BFS 路径查找和 DFS 循环检测

### 评估的替代方案
| 方案 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| 独立新建 unit-conversion Skill | 职责分离清晰 | 增加维护成本，用户需记忆多个命令 | 不采用 |
| 在前端实现换算对话 | 无需 Agent | 违背 spec 中"通过对话"的交互设计 | 不采用 |
| **扩展现有 ops-expert Skill** | 复用基础设施，用户体验一致 | 需更新多个文件 | **采用** |

---

## 8. 单位换算 API 集成

### 研究问题
如何集成 P002 的 API 和工具函数？

### 决策
**复用 P002-unit-conversion 模块的后端 API**，Python 脚本作为调用层。

### P002 已实现的 API 端点

| 端点 | 方法 | 功能 | Agent 用途 |
|------|------|------|----------|
| `/api/unit-conversions` | GET | 获取所有换算规则 | 查询规则列表 |
| `/api/unit-conversions/{id}` | GET | 获取单条规则 | 查询规则详情 |
| `/api/unit-conversions` | POST | 创建换算规则 | 对话创建规则 |
| `/api/unit-conversions/{id}` | PUT | 更新换算规则 | 对话修改规则 |
| `/api/unit-conversions/{id}` | DELETE | 删除换算规则 | 对话删除规则 |
| `/api/unit-conversions/stats` | GET | 获取统计信息 | 规则统计 |
| `/api/unit-conversions/validate-cycle` | POST | 循环依赖检测 | 创建前验证 |
| `/api/unit-conversions/calculate-path` | POST | 路径计算 | 换算计算 |

### P002 已实现的前端工具函数

```text
frontend/src/features/unit-conversion/utils/
├── pathFinding.ts      # BFS 最短路径查找
├── cycleDetection.ts   # DFS 循环检测
└── rounding.ts         # 按类别舍入规则
```

### 依据
1. **避免重复实现**: 核心算法已在 P002 实现并测试
2. **数据一致性**: 共享同一套换算规则数据（unit_conversions 表）
3. **API 稳定性**: 后端 API 接口契约明确

---

## 9. 单位换算 Python 脚本设计

### 研究问题
需要哪些 Python 脚本支持单位换算功能？

### 决策
创建 6 个 Python 脚本处理单位换算操作：

| 脚本名称 | 功能 | 调用的 API |
|---------|------|-----------|
| `query_conversions.py` | 查询换算规则列表 | GET /api/unit-conversions |
| `calculate_conversion.py` | 执行换算计算 | POST /api/unit-conversions/calculate-path |
| `create_conversion.py` | 创建换算规则 | POST /api/unit-conversions |
| `update_conversion.py` | 修改换算规则 | PUT /api/unit-conversions/{id} |
| `delete_conversion.py` | 删除换算规则 | DELETE /api/unit-conversions/{id} |
| `validate_cycle.py` | 循环依赖验证 | POST /api/unit-conversions/validate-cycle |

### 脚本调用示例

```bash
# 换算计算
python calculate_conversion.py 45 ml 瓶
# 输出: ✅ 45ml = 0.06瓶 (换算路径: ml → 瓶)

# 查询规则
python query_conversions.py --category volume
# 输出: 8 条体积类换算规则

# 创建规则
python create_conversion.py 箱 瓶 12 quantity
# 输出: ✅ 换算规则已创建: 1箱 = 12瓶 (计数类)
```

### 依据
1. **与现有脚本一致**: 遵循 query_stores.py 等脚本的模式
2. **命令行友好**: 支持参数化调用，便于 Agent 解析和执行
3. **输出格式化**: 人类可读 + 机器可解析

---

## 10. 单位换算意图识别

### 研究问题
如何识别用户的单位换算相关意图？

### 决策
在 SKILL.md 中添加 7 种单位换算相关意图：

| 意图类型 | 关键词示例 | 执行脚本 |
|---------|-----------|---------|
| 换算计算 | 等于多少、换算成、转换为、多少杯/瓶/ml | calculate_conversion.py |
| 规则查询 | 查看换算规则、换算关系、换算率 | query_conversions.py |
| 规则创建 | 添加换算规则、创建换算、定义换算 | create_conversion.py |
| 规则修改 | 修改换算规则、更新换算 | update_conversion.py |
| 规则删除 | 删除换算规则、移除换算 | delete_conversion.py |
| 路径查询 | 能换算吗、换算路径、怎么换算 | calculate_conversion.py --path-only |
| BOM成本 | 成本是多少、成本计算、配方成本 | calculate_bom_cost.py |

### 示例匹配

| 用户输入 | 识别的意图 | 执行命令 |
|---------|-----------|---------|
| "45ml威士忌等于多少瓶" | 换算计算 | `python calculate_conversion.py 45 ml 瓶` |
| "查看所有体积类换算规则" | 规则查询 | `python query_conversions.py --category volume` |
| "添加换算规则：1箱=12瓶" | 规则创建 | `python create_conversion.py 箱 瓶 12 quantity` |
| "瓶和升之间能换算吗" | 路径查询 | `python calculate_conversion.py 1 瓶 L --path-only` |

### 依据
1. **自然语言覆盖**: 覆盖运营人员常用的表述方式
2. **参数提取**: 从自然语言中提取数量、单位等参数
3. **明确执行路径**: 每种意图对应明确的脚本和参数

---

## 11. 舍入规则复用

### 研究问题
如何处理换算计算结果的精度？

### 决策
复用 P002 的舍入规则配置。

### 舍入配置

| 单位类别 | 数据库值 | 默认精度 | 舍入方式 |
|---------|---------|---------|---------|
| 体积 | volume | 1 位小数 | 四舍五入 |
| 重量 | weight | 0 位小数 | 四舍五入 |
| 计数 | quantity | 0 位小数 | 向上取整 |

### Python 实现

```python
import math

PRECISION_MAP = {
    'volume': 1,    # 45.67ml → 45.7ml
    'weight': 0,    # 12.8g → 13g
    'quantity': 0   # 2.5个 → 3个
}

def round_by_category(value: float, category: str) -> float:
    precision = PRECISION_MAP.get(category, 2)
    if category == 'quantity':
        return math.ceil(value)  # 计数类向上取整
    else:
        return round(value, precision)  # 其他类四舍五入
```

### 依据
1. **业务合理性**: 计数类向上取整符合实际业务（不能有 0.5 个）
2. **一致性**: 与前端 rounding.ts 的逻辑保持一致
3. **可预测性**: 固定的舍入规则便于运营人员理解

---

## 12. 单位换算安全约束

### 研究问题
单位换算操作需要哪些安全约束？

### 决策
继承现有 Skill 的安全约束，并针对单位换算添加特定规则。

### 安全规则

| 场景 | 安全措施 |
|------|---------|
| 规则创建 | 创建前显示内容，请求用户确认 |
| 循环依赖 | 检测到循环时阻止创建，显示循环路径 |
| 规则删除 | 检查 BOM 引用，有引用时显示警告 |
| 批量操作 | 不支持批量删除换算规则 |
| 数值验证 | 换算率和数量必须为正数 |

### 错误处理

| 错误场景 | 错误代码 | 处理方式 |
|---------|---------|---------|
| 换算路径不存在 | `PATH_NOT_FOUND` | 提示先配置相关换算规则 |
| 循环依赖检测 | `CYCLE_DETECTED` | 显示循环路径，阻止保存 |
| 规则被 BOM 引用 | `RULE_REFERENCED` | 显示引用的 BOM 列表，阻止删除 |
| 规则已存在 | `DUPLICATE_RULE` | 提示规则已存在，提供修改选项 |
| 换算数量无效 | `INVALID_QUANTITY` | 提示数量必须为正数 |

### 依据
1. **数据完整性**: 防止创建无效或冲突的换算规则
2. **业务连续性**: 防止删除被依赖的规则导致 BOM 计算失败
3. **用户友好**: 提供清晰的错误信息和解决建议

---

## 13. 数据库表复用

### 研究问题
单位换算需要新建数据库表吗？

### 决策
**不需要新建表**，复用 P002 已创建的 `unit_conversions` 表。

### 表结构

```sql
CREATE TABLE unit_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_unit VARCHAR(20) NOT NULL,
  to_unit VARCHAR(20) NOT NULL,
  conversion_rate DECIMAL(10,6) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('volume', 'weight', 'quantity')),
  CONSTRAINT uk_conversion_from_to UNIQUE (from_unit, to_unit)
);
```

### 已有数据

V028 迁移脚本已插入基础换算数据：
- 体积: ml↔L, 瓶↔ml, 杯↔ml
- 重量: g↔kg
- 计数: 个↔打, 瓶↔箱

### 依据
1. **数据复用**: 前端 UI 和 Agent 共享同一套规则数据
2. **一致性**: 避免数据同步问题
3. **简化实现**: 不需要额外的数据迁移

---

## 研究结论

所有技术未知项已解决，可以进入 Phase 1 设计阶段。关键决策：

### 基础架构决策 (2025-12-25)

1. ✅ 采用完整 Skill 目录结构（SKILL.md + references/ + examples/ + scripts/）
2. ✅ 使用 Command + Skill 组合模式，`/ops` 作为入口
3. ✅ 查询通过 Supabase MCP，写操作通过 Python 脚本
4. ✅ 知识库从 specs 目录提取，手动补充运营指南
5. ✅ 安全通过工具限制和操作确认保障

### 单位换算专家决策 (2025-12-26)

6. ✅ 扩展现有 ops-expert Skill，不新建独立 Skill
7. ✅ 复用 P002 后端 API（calculate-path, validate-cycle 等）
8. ✅ 新增 6 个 Python 脚本处理单位换算操作
9. ✅ 7 种单位换算意图识别和执行路径
10. ✅ 复用 P002 舍入规则（按类别：体积1位/重量0位/计数向上取整）
11. ✅ 复用 unit_conversions 表，不新建数据库表
12. ✅ 安全约束：循环检测阻止、BOM引用检查、操作确认

---

## 参考文档

- P002 规格: `/specs/P002-unit-conversion/spec.md`
- P002 研究: `/specs/P002-unit-conversion/research.md`
- P002 数据模型: `/specs/P002-unit-conversion/data-model.md`
- P002 任务: `/specs/P002-unit-conversion/tasks.md`
- 业务需求: `/docs/业务需求/需求专项说明/单位换算配置功能专项说明.md`
- 现有 Skill: `/.claude/skills/ops-expert/SKILL.md`
- 现有脚本: `/.claude/skills/ops-expert/scripts/`
