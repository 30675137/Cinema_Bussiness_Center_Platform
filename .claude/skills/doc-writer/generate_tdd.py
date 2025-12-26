#!/usr/bin/env python3
"""
TDD Generator - Generate Technical Design Documents from spec files.

Usage:
    python generate_tdd.py <specId>           # Generate TDD for specific spec
    python generate_tdd.py --all              # Generate TDD for all specs
    python generate_tdd.py P003 P004          # Generate TDD for multiple specs
"""

import argparse
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional


# Assuming script is in .claude/skills/doc-writer/
PROJECT_ROOT = Path(__file__).resolve().parents[3]  # Go up 3 levels: doc-writer -> skills -> .claude -> project
SPECS_DIR = PROJECT_ROOT / "specs"
DOCS_DIR = PROJECT_ROOT / "docs"
TDD_DIR = DOCS_DIR / "tdd"


def read_spec_file(spec_path: Path) -> Dict:
    """Read and parse spec.md file."""
    spec_md = spec_path / "spec.md"
    if not spec_md.exists():
        return {}

    content = spec_md.read_text(encoding='utf-8')

    # Extract metadata
    feature_branch_match = re.search(r'\*\*Feature Branch\*\*:\s*`?([^`\n]+)`?', content)
    status_match = re.search(r'\*\*Status\*\*:\s*([^\n]+)', content)
    input_match = re.search(r'\*\*Input\*\*:\s*(.+?)(?:\n\*\*|$)', content, re.DOTALL)

    return {
        "specId": feature_branch_match.group(1).strip() if feature_branch_match else spec_path.name,
        "status": status_match.group(1).strip() if status_match else "Draft",
        "input": input_match.group(1).strip() if input_match else "",
        "content": content
    }


def read_plan_file(spec_path: Path) -> str:
    """Read plan.md if exists."""
    plan_md = spec_path / "plan.md"
    if plan_md.exists():
        return plan_md.read_text(encoding='utf-8')
    return ""


def extract_user_stories(content: str) -> List[Dict]:
    """Extract user stories from spec content."""
    stories = []

    # Find all User Story sections
    story_pattern = r'###\s+User Story\s+\d+\s+-\s+([^\n]+)\s+\(Priority:\s+(\w+)\)'
    matches = re.finditer(story_pattern, content)

    for match in matches:
        title = match.group(1).strip()
        priority = match.group(2).strip()

        # Extract the "作为...我希望...以便..." pattern
        section_start = match.end()
        section_end = content.find('\n###', section_start)
        if section_end == -1:
            section_end = len(content)

        section = content[section_start:section_end]

        actor_match = re.search(r'作为([^,，]+)', section)
        action_match = re.search(r'我希望([^,，]+)', section)
        benefit_match = re.search(r'以便([^。\n]+)', section)

        stories.append({
            "priority": priority,
            "title": title,
            "actor": actor_match.group(1).strip() if actor_match else "[待补充]",
            "action": action_match.group(1).strip() if action_match else "[待补充]",
            "benefit": benefit_match.group(1).strip() if benefit_match else "[待补充]",
        })

    return stories


def extract_requirements(content: str) -> List[str]:
    """Extract functional requirements."""
    requirements = []

    # Find Requirements section
    req_match = re.search(r'##\s+Requirements.*?\n(.*?)(?=\n##|\Z)', content, re.DOTALL)
    if req_match:
        req_section = req_match.group(1)

        # Extract functional requirements
        func_match = re.search(r'###\s+Functional Requirements.*?\n(.*?)(?=\n###|\Z)', req_section, re.DOTALL)
        if func_match:
            func_text = func_match.group(1)
            # Extract bullet points
            for line in func_text.split('\n'):
                line = line.strip()
                if line.startswith('- ') or line.startswith('* '):
                    requirements.append(line[2:].strip())

    return requirements


def generate_tdd(spec_id: str) -> Optional[str]:
    """Generate TDD document for a spec."""
    # Find spec directory - try exact match first
    spec_path = SPECS_DIR / spec_id
    if not spec_path.is_dir():
        # Try to find by partial match
        for dir in SPECS_DIR.glob("*"):
            if dir.is_dir() and (spec_id in dir.name or dir.name.startswith(spec_id)):
                spec_path = dir
                break
        else:
            print(f"❌ Spec not found: {spec_id}")
            print(f"   Searched in: {SPECS_DIR}")
            return None

    # Read spec and plan
    spec = read_spec_file(spec_path)
    plan = read_plan_file(spec_path)

    # Extract structured data
    user_stories = extract_user_stories(spec["content"])
    requirements = extract_requirements(spec["content"])

    # Generate TDD content
    spec_id_clean = spec["specId"]
    date = datetime.now().strftime("%Y-%m-%d")

    tdd_content = f"""# 技术设计文档 (TDD) - {spec_id_clean}

<!-- DOC-WRITER: AUTO-GENERATED START -->
**文档版本**: 1.0
**创建日期**: {date}
**作者**: Doc-Writer (自动生成)
**审核人**: [待指定]
**状态**: {spec["status"]}

---

## 变更历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | {date} | Doc-Writer | 初始版本 - 从 spec.md 自动生成 |

---

## 1. 概述

### 1.1 背景

{spec.get("input", "[待补充: 业务背景]")}

### 1.2 项目目标

本功能旨在实现以下目标：

"""

    # Add user stories as objectives
    for story in user_stories:
        tdd_content += f"- **{story['priority']}**: {story['title']}\n"

    if not user_stories:
        tdd_content += "[待补充: 从spec.md提取用户故事]\n"

    tdd_content += f"""
### 1.3 范围边界

**包含范围**:
"""

    for req in requirements[:5]:  # First 5 requirements
        tdd_content += f"- {req}\n"

    if not requirements:
        tdd_content += "[待补充: 功能需求范围]\n"

    tdd_content += f"""
**不包含范围**:
[待补充: 明确不包含的功能]

### 1.4 术语定义

| 术语 | 定义 |
|------|------|
| SKU | Stock Keeping Unit - 库存量单位 |
| 库存调整 | 因盘点、损耗等原因进行的库存数量变更 |
| [待补充] | [待补充: 添加其他术语] |

---

## 2. 需求摘要

### 2.1 功能需求

"""

    # Add user stories details
    for idx, story in enumerate(user_stories, 1):
        tdd_content += f"""#### {story['priority']} - {story['title']}

- **作为**: {story['actor']}
- **我希望**: {story['action']}
- **以便**: {story['benefit']}

**验收标准**:
[待补充: 从spec.md的Acceptance Scenarios提取]

"""

    if not user_stories:
        tdd_content += "[待补充: 用户故事]\n\n"

    tdd_content += f"""### 2.2 非功能需求

| 类别 | 要求 | 指标 |
|------|------|------|
| 性能 | 页面加载时间 | < 2秒 |
| 可用性 | 系统可用率 | ≥ 99.9% |
| 安全性 | 数据加密传输 | HTTPS |
| 可扩展性 | 支持分页加载 | 每页20-50条 |

---

## 3. 技术选型

### 3.1 技术栈

| 层次 | 技术 | 版本 | 选型理由 |
|------|------|------|----------|
| 前端框架 | React | 19.2.0 | 符合项目规范，生态成熟 |
| UI 组件库 | Ant Design | 6.1.0 | B端标准组件库 |
| 状态管理 | Zustand | 5.0.9 | 轻量级状态管理 |
| 服务器状态 | TanStack Query | 5.90.12 | 数据获取和缓存 |
| 后端框架 | Spring Boot | 3.x | Java企业级框架 |
| 数据库 | Supabase (PostgreSQL) | - | 项目统一数据源 |

### 3.2 技术决策记录

"""

    # Check if plan.md has technical decisions
    if plan:
        tdd_content += "[待补充: 从 plan.md 提取技术决策]\n\n"
    else:
        tdd_content += "[待补充: 补充技术决策记录]\n\n"

    tdd_content += f"""---

## 4. 系统架构设计

### 4.1 架构概览

```mermaid
graph TB
    subgraph 前端层
        A[React App] --> B[Ant Design]
        A --> C[TanStack Query]
        A --> D[Zustand]
    end
    subgraph 后端层
        E[Spring Boot] --> F[Service Layer]
        F --> G[Repository Layer]
    end
    subgraph 数据层
        H[(Supabase PostgreSQL)]
        I[Supabase Auth]
    end
    A --> E
    G --> H
    E --> I
```

### 4.2 分层架构

| 层次 | 职责 | 技术 |
|------|------|------|
| 表现层 | UI 渲染、用户交互 | React + Ant Design |
| 应用层 | 业务流程编排、状态管理 | TanStack Query + Zustand |
| 服务层 | 业务逻辑实现 | Spring Boot Services |
| 数据层 | 数据持久化、访问 | Supabase + JPA |

---

## 5. 核心模块设计

[待补充: 根据功能需求设计核心模块]

---

## 6. 数据模型设计

### 6.1 数据模型

[待补充: 如果存在 data-model.md，从中提取数据模型]

### 6.2 表结构定义

[待补充: 详细表结构]

---

## 7. 接口设计

### 7.1 API 概览

[待补充: 如果存在 contracts/api.yaml，从中提取 API 定义]

---

## 8. 安全设计

### 8.1 认证授权

- **认证方式**: Supabase Auth (JWT Token)
- **权限模型**: RBAC - 基于角色的访问控制

### 8.2 数据安全

- **敏感数据**: 无特殊敏感数据
- **加密策略**: HTTPS 传输加密

### 8.3 安全检查项

- [x] 输入验证（使用 Zod schema）
- [x] 认证授权检查
- [x] HTTPS 传输
- [ ] 日志脱敏（如有敏感日志）

---

## 9. 性能设计

### 9.1 性能目标

| 场景 | 目标 | 测量方法 |
|------|------|----------|
| 页面加载 | < 2秒 | Chrome DevTools |
| API 响应 | < 1秒 (P95) | 后端日志 |
| 列表滚动 | ≥ 50 FPS | Performance Monitor |

### 9.2 优化策略

- **前端优化**: React.memo、useMemo、虚拟滚动
- **数据查询**: 分页加载、缓存策略
- **网络优化**: TanStack Query 缓存、请求去重

---

## 10. 测试策略

### 10.1 测试覆盖

| 测试类型 | 覆盖范围 | 工具 |
|----------|----------|------|
| 单元测试 | 业务逻辑、工具函数 | Vitest |
| 集成测试 | API 接口、数据库 | MSW + Spring Test |
| E2E 测试 | 用户流程 | Playwright |

### 10.2 关键测试用例

[待补充: 根据 User Story 的 Acceptance Scenarios 生成测试用例]

---

## 11. 风险评估

### 11.1 技术风险

| 风险 | 影响 | 可能性 | 缓解措施 |
|------|------|--------|----------|
| Supabase 连接超时 | 高 | 低 | 设置合理超时时间，错误提示用户 |
| 数据量过大导致性能下降 | 中 | 中 | 分页加载、虚拟滚动 |

### 11.2 业务风险

| 风险 | 影响 | 可能性 | 缓解措施 |
|------|------|--------|----------|
| 需求变更 | 中 | 中 | 采用敏捷开发，快速响应变更 |

---

## 12. 部署方案

### 12.1 部署架构

[待补充: 部署架构图]

### 12.2 部署步骤

1. 前端构建: `npm run build`
2. 后端打包: `mvn clean package`
3. 部署到服务器

### 12.3 回滚方案

保留上一版本代码，如有问题快速回滚。

---

## 13. 附录

### 13.1 参考文档

- [项目技术规范](../../../.claude/rules/)
- [Spec 原文]({spec_path.relative_to(PROJECT_ROOT)}/spec.md)
{"- [Plan 文档](" + str(spec_path.relative_to(PROJECT_ROOT)) + "/plan.md)" if plan else ""}

### 13.2 待确认事项

- [ ] 确认详细的数据模型设计
- [ ] 确认 API 接口契约
- [ ] 补充核心模块设计详情

<!-- DOC-WRITER: AUTO-GENERATED END -->

---

*本文档由 [doc-writer](../../../.claude/skills/doc-writer) 自动生成 | 生成时间: {date}*
*数据来源: {spec_path.relative_to(PROJECT_ROOT)}/spec.md*
"""

    return tdd_content


def save_tdd(spec_id: str, content: str) -> Path:
    """Save TDD document."""
    TDD_DIR.mkdir(parents=True, exist_ok=True)

    output_path = TDD_DIR / f"{spec_id}-tdd.md"
    output_path.write_text(content, encoding='utf-8')

    return output_path


def main():
    parser = argparse.ArgumentParser(description="Generate TDD documents from spec files")
    parser.add_argument('specs', nargs='*', help='Spec IDs to generate TDD for')
    parser.add_argument('--all', action='store_true', help='Generate TDD for all specs')

    args = parser.parse_args()

    if args.all:
        # Generate for all specs
        spec_ids = [d.name for d in SPECS_DIR.glob("*") if d.is_dir()]
    elif args.specs:
        spec_ids = args.specs
    else:
        print("Usage: python generate_tdd.py <specId> | --all")
        print("Example: python generate_tdd.py P003-inventory-query")
        return

    print(f"🚀 Generating TDD documents...\n")

    generated = []
    for spec_id in spec_ids:
        print(f"📝 Generating TDD for {spec_id}...")
        content = generate_tdd(spec_id)

        if content:
            output_path = save_tdd(spec_id, content)
            generated.append(output_path)
            print(f"✅ Generated: {output_path.relative_to(PROJECT_ROOT)}\n")

    print(f"\n✅ TDD generation complete!")
    print(f"📊 Total generated: {len(generated)} documents\n")
    print("Next steps:")
    print("1. Review generated TDD documents")
    print("2. Fill in [待补充] sections")
    print("3. Run /doc api to generate API documentation")
    print("4. Run /doc db to generate database documentation")


if __name__ == "__main__":
    main()
