# Quickstart: 运营专家技能 (Ops Expert Skill)

**Date**: 2025-12-25
**Spec**: [spec.md](./spec.md)
**Branch**: `T001-ops-expert-skill`

## 开发环境准备

### 1. 确认 Claude Code 版本

```bash
claude --version
# 需要支持 skills 和 commands 功能的版本
```

### 2. 确认项目结构

```bash
# 确认 .claude 目录存在
ls -la .claude/
# 应该看到 commands/, skills/, rules/ 目录
```

### 3. 设置 Python 环境

```bash
# 进入项目根目录
cd /Users/randy/ycj_tools_box/cursor/Cinema_Bussiness_Center_Platform

# 如果使用 poetry
poetry install

# 或者使用 venv
python3 -m venv .venv
source .venv/bin/activate
pip install requests python-dotenv
```

### 4. 配置环境变量

创建或编辑 `.env` 文件（不要提交到 git）：

```bash
# 后端 API 配置
OPS_API_BASE_URL=http://localhost:8080/api
OPS_API_TOKEN=your_api_token_here

# Supabase 配置（如果需要直接访问）
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

---

## 目录结构创建

### 运行以下命令创建 Skill 目录结构

```bash
# 创建 ops-expert skill 目录
mkdir -p .claude/skills/ops-expert/{references,examples,scripts}

# 创建主文件
touch .claude/skills/ops-expert/SKILL.md

# 创建 references 文件
touch .claude/skills/ops-expert/references/{scenario-package,store-management,hall-management,reservation,database-schema,ops-guide,glossary}.md

# 创建 examples 文件
touch .claude/skills/ops-expert/examples/common-queries.md

# 创建 Python 脚本
touch .claude/skills/ops-expert/scripts/{__init__,api_client,scenario_ops,store_ops,utils}.py

# 创建 command 文件
touch .claude/commands/ops.md
```

---

## 关键文件模板

### 1. SKILL.md 模板

```markdown
---
name: ops-expert
description: 影院商品管理中台运营专家。当用户需要以下操作时使用此skill：(1) 查询场景包、门店、影厅、预约等数据；(2) 执行场景包发布/下架、门店设置修改等操作；(3) 获取系统操作指导和业务规则说明。触发词：查询、查看、显示、统计、发布、下架、修改、设置、如何、怎么。
version: 0.1.0
---

# 影院商品管理中台 - 运营专家

为运营人员提供通过对话方式查询数据、执行操作、获取指导的能力。

## 核心能力

### 1. 数据查询
通过 Supabase MCP 查询系统数据：
- 场景包列表和详情
- 门店列表和预约设置
- 影厅信息
- 预约订单统计

### 2. 操作执行
通过 Python 脚本执行写操作：
- 场景包状态变更（发布/下架）
- 门店预约设置修改
- 基本信息编辑

### 3. 操作指导
基于业务知识库提供帮助：
- 操作流程说明
- 业务规则解释
- 常见问题解答

## 工作流程

### 步骤1：意图识别
分析用户输入，识别意图类型：
- **查询意图**: 包含"查询"、"查看"、"显示"、"统计"等关键词
- **操作意图**: 包含"发布"、"下架"、"修改"、"设置"、"创建"等关键词
- **帮助意图**: 包含"如何"、"怎么"、"什么是"等关键词

### 步骤2：执行操作
根据意图类型选择执行路径：
- 查询：使用 Supabase MCP 执行 SQL 查询
- 操作：调用 Python 脚本，执行前确认
- 帮助：参考业务知识库回答

### 步骤3：返回结果
格式化输出结果，提供后续操作建议。

## 业务知识参考

### 数据库表结构
- **`references/database-schema.md`** - 核心表结构和字段说明

### 业务领域规则
- **`references/scenario-package.md`** - 场景包管理规则
- **`references/store-management.md`** - 门店管理规则
- **`references/hall-management.md`** - 影厅管理规则
- **`references/reservation.md`** - 预约管理规则

### 运营指南
- **`references/ops-guide.md`** - 运营操作指南
- **`references/glossary.md`** - 业务术语表

### 示例
- **`examples/common-queries.md`** - 常见查询和操作示例

## 安全约束

1. 破坏性操作（删除、下架、批量修改）必须请求用户确认
2. 批量操作影响超过 10 条数据时强制二次确认
3. 所有操作记录日志
```

### 2. Command 文件模板 (.claude/commands/ops.md)

```markdown
---
description: 运营专家 - 通过对话查询数据和执行操作
allowed-tools: Read, Bash(python:*), mcp__supabase__*
argument-hint: [自然语言指令]
---

你是影院商品管理中台的运营专家。使用 ops-expert skill 来理解系统业务规则和操作流程。

用户请求: $ARGUMENTS

## 执行指南

1. **分析用户意图**
   - 查询意图：使用 Supabase MCP 查询数据
   - 操作意图：调用 Python 脚本执行
   - 帮助意图：参考业务知识库回答

2. **查询操作**
   - 使用 `mcp__supabase__query` 执行 SQL
   - 限制返回行数（LIMIT 100）
   - 格式化结果便于阅读

3. **写操作**
   - 调用 `.claude/skills/ops-expert/scripts/` 下的脚本
   - 执行前显示影响范围
   - 等待用户确认后执行

4. **返回结果**
   - 清晰展示数据或操作结果
   - 提供后续操作建议
```

### 3. Python 脚本模板 (scripts/api_client.py)

```python
#!/usr/bin/env python3
"""运营专家 API 客户端基类"""

import os
import json
import requests
from typing import Optional, Dict, Any


class OpsApiClient:
    """后端 API 客户端"""

    def __init__(self):
        self.base_url = os.environ.get("OPS_API_BASE_URL", "http://localhost:8080/api")
        self.token = os.environ.get("OPS_API_TOKEN", "")

    def _headers(self) -> Dict[str, str]:
        """生成请求头"""
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """统一请求方法

        Args:
            method: HTTP 方法 (GET, POST, PUT, DELETE)
            endpoint: API 端点 (如 /scenarios/123)
            data: 请求体数据
            params: URL 参数

        Returns:
            API 响应数据
        """
        url = f"{self.base_url}{endpoint}"

        try:
            response = requests.request(
                method=method,
                url=url,
                headers=self._headers(),
                json=data,
                params=params,
                timeout=30,
            )
            response.raise_for_status()
            return {"success": True, "data": response.json()}
        except requests.exceptions.RequestException as e:
            return {"success": False, "error": str(e)}


# 单例实例
client = OpsApiClient()
```

---

## 开发流程

### 第一阶段：创建基础结构
1. 创建目录结构
2. 填写 SKILL.md 主文件
3. 创建 ops.md command 文件

### 第二阶段：构建知识库
1. 从 specs 目录提取业务规则到 references/
2. 编写 database-schema.md
3. 编写 ops-guide.md 运营指南
4. 编写 common-queries.md 示例

### 第三阶段：实现操作脚本
1. 实现 api_client.py 基础客户端
2. 实现 scenario_ops.py 场景包操作
3. 实现 store_ops.py 门店操作
4. 编写脚本单元测试

### 第四阶段：集成测试
1. 测试 `/ops 查询所有场景包`
2. 测试 `/ops 将场景包X下架`
3. 测试 `/ops 如何发布场景包`

---

## 测试命令

```bash
# 测试 command 是否可用
claude /ops 查看所有已发布的场景包

# 测试查询功能
claude /ops 门店列表

# 测试帮助功能
claude /ops 如何发布一个场景包

# 测试操作功能（会请求确认）
claude /ops 将场景包"测试包"下架
```

---

## 常见问题

### Q1: Skill 没有被自动加载？
确认 SKILL.md 的 frontmatter 格式正确，description 包含触发词。

### Q2: Python 脚本执行失败？
检查 Python 环境是否激活，环境变量是否设置正确。

### Q3: Supabase MCP 查询失败？
确认 MCP 服务器已连接，检查 Claude Code 的 MCP 配置。

---

## 下一步

完成基础结构后，运行 `/speckit.tasks` 生成详细任务列表。

---

## 单位换算专家扩展 (2025-12-26 新增)

### 新增文件

```bash
# 新增知识库文件
.claude/skills/ops-expert/references/unit-conversion.md

# 新增 Python 脚本
.claude/skills/ops-expert/scripts/query_conversions.py
.claude/skills/ops-expert/scripts/calculate_conversion.py
.claude/skills/ops-expert/scripts/create_conversion.py
.claude/skills/ops-expert/scripts/update_conversion.py
.claude/skills/ops-expert/scripts/delete_conversion.py
.claude/skills/ops-expert/scripts/validate_cycle.py
.claude/skills/ops-expert/scripts/tests/test_conversion.py
```

### 依赖的后端 API (P002)

确认后端服务已启动并提供以下 API：

```bash
# 测试后端 API 是否可用
curl http://localhost:8080/api/unit-conversions

# 预期响应
{
  "success": true,
  "data": [
    {"id": "...", "fromUnit": "ml", "toUnit": "L", "conversionRate": 0.001, "category": "volume"},
    ...
  ]
}
```

### 测试单位换算功能

```bash
# 测试换算计算
claude /ops 45ml威士忌等于多少瓶

# 测试规则查询
claude /ops 查看所有体积类换算规则

# 测试规则创建
claude /ops 添加换算规则：1箱=12瓶

# 测试路径查询
claude /ops 瓶和升之间能换算吗

# 测试成本计算
claude /ops 威士忌可乐的成本是多少
```

### Python 脚本模板 (calculate_conversion.py)

```python
#!/usr/bin/env python3
"""
单位换算计算
用法: python calculate_conversion.py <数量> <源单位> <目标单位>
示例: python calculate_conversion.py 45 ml 瓶
"""
import sys
import os
import math

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from api_client import get_client

# 舍入精度配置
PRECISION_MAP = {
    'volume': 1,    # 体积类保留1位小数
    'weight': 0,    # 重量类取整
    'quantity': 0   # 计数类取整（向上）
}

def round_by_category(value: float, category: str) -> float:
    """按类别应用舍入规则"""
    precision = PRECISION_MAP.get(category, 2)
    if category == 'quantity':
        return math.ceil(value)
    else:
        return round(value, precision)

def main():
    if len(sys.argv) < 4:
        print("用法: python calculate_conversion.py <数量> <源单位> <目标单位>")
        print("示例: python calculate_conversion.py 45 ml 瓶")
        sys.exit(1)

    quantity = float(sys.argv[1])
    from_unit = sys.argv[2]
    to_unit = sys.argv[3]

    if quantity <= 0:
        print("❌ 换算数量必须为正数")
        sys.exit(1)

    client = get_client()

    # 调用后端 API 计算换算路径
    result = client.calculate_conversion_path(from_unit, to_unit)

    if result['success'] and result['data'].get('found'):
        path_data = result['data']
        total_rate = path_data['total_rate']
        path = path_data['path']
        category = path_data.get('category', 'volume')

        # 计算换算结果
        raw_result = quantity * total_rate
        final_result = round_by_category(raw_result, category)

        print(f"✅ {quantity}{from_unit} = {final_result}{to_unit}")
        print(f"   换算路径: {' → '.join(path)}")
        print(f"   换算率: 1{from_unit} = {total_rate}{to_unit}")
        if raw_result != final_result:
            print(f"   舍入: {raw_result} → {final_result} ({category}类)")
    else:
        print(f"❌ 无法找到从 '{from_unit}' 到 '{to_unit}' 的换算路径")
        print("   建议: 请先配置相关换算规则")
        print("   示例: /ops 添加换算规则：1瓶=750ml")

if __name__ == '__main__':
    main()
```

### api_client.py 扩展

需要在现有 api_client.py 中添加以下方法：

```python
class OpsApiClient:
    # ... 现有方法 ...

    # 单位换算相关方法
    def list_conversions(self, category: str = None, search: str = None):
        """获取换算规则列表"""
        params = {}
        if category:
            params['category'] = category
        if search:
            params['search'] = search
        return self.request('GET', '/unit-conversions', params=params)

    def get_conversion(self, id: str):
        """获取单条换算规则"""
        return self.request('GET', f'/unit-conversions/{id}')

    def create_conversion(self, from_unit: str, to_unit: str, rate: float, category: str):
        """创建换算规则"""
        data = {
            'fromUnit': from_unit,
            'toUnit': to_unit,
            'conversionRate': rate,
            'category': category
        }
        return self.request('POST', '/unit-conversions', data=data)

    def update_conversion(self, id: str, from_unit: str, to_unit: str, rate: float, category: str):
        """更新换算规则"""
        data = {
            'fromUnit': from_unit,
            'toUnit': to_unit,
            'conversionRate': rate,
            'category': category
        }
        return self.request('PUT', f'/unit-conversions/{id}', data=data)

    def delete_conversion(self, id: str):
        """删除换算规则"""
        return self.request('DELETE', f'/unit-conversions/{id}')

    def calculate_conversion_path(self, from_unit: str, to_unit: str):
        """计算换算路径"""
        data = {'fromUnit': from_unit, 'toUnit': to_unit}
        return self.request('POST', '/unit-conversions/calculate-path', data=data)

    def validate_cycle(self, from_unit: str, to_unit: str, existing_rules: list = None):
        """验证循环依赖"""
        data = {
            'fromUnit': from_unit,
            'toUnit': to_unit,
            'existingRules': existing_rules or []
        }
        return self.request('POST', '/unit-conversions/validate-cycle', data=data)

    def get_conversion_stats(self):
        """获取换算规则统计"""
        return self.request('GET', '/unit-conversions/stats')
```
