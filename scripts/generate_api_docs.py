#!/usr/bin/env python3
"""
API Documentation Generator
从 specs 目录整合所有规格的 API 文档
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field


@dataclass
class Entity:
    """数据实体"""
    name: str
    description: str
    fields: List[Dict[str, str]] = field(default_factory=list)
    business_rules: List[str] = field(default_factory=list)
    relationships: List[str] = field(default_factory=list)
    source_spec: str = ""


@dataclass
class APIEndpoint:
    """API 端点"""
    name: str
    method: str
    path: str
    description: str = ""
    request_params: List[Dict[str, str]] = field(default_factory=list)
    request_example: str = ""
    response_format: str = ""
    error_codes: List[Dict[str, str]] = field(default_factory=list)
    business_rules: List[str] = field(default_factory=list)
    source_spec: str = ""


class SpecParser:
    """规格文档解析器"""

    def __init__(self, spec_dir: Path):
        self.spec_dir = spec_dir
        self.spec_id = spec_dir.name
        self.entities: Dict[str, Entity] = {}
        self.endpoints: List[APIEndpoint] = []

    def parse(self) -> Tuple[Dict[str, Entity], List[APIEndpoint]]:
        """解析规格目录,返回实体和API端点"""
        # 优先查找专门的数据模型和API文档
        data_model_file = self._find_file(['data-model.md', 'data_model.md'])
        api_file = self._find_file(['api.md', 'api-spec.md', 'api_spec.md'])
        spec_file = self.spec_dir / 'spec.md'

        # 解析数据模型
        if data_model_file:
            self._parse_data_model(data_model_file)
        elif spec_file.exists():
            self._parse_data_model_from_spec(spec_file)

        # 解析 API 定义
        if api_file:
            self._parse_api(api_file)
        elif spec_file.exists():
            self._parse_api_from_spec(spec_file)

        return self.entities, self.endpoints

    def _find_file(self, names: List[str]) -> Optional[Path]:
        """查找文件（支持多个候选名）"""
        for name in names:
            file_path = self.spec_dir / name
            if file_path.exists():
                return file_path
        return None

    def _parse_data_model(self, file_path: Path):
        """解析 data-model.md"""
        content = file_path.read_text(encoding='utf-8')

        # 查找实体定义 - 支持多种格式
        # ### Store (门店)
        # ### 1. Store（门店）实体
        # ## Entity Definitions
        entity_pattern = r'###?\s+(?:\d+\.)?\s*(.+?)(?:\s*[（(](.+?)[）)])?(?:\s+实体)?\s*$'

        lines = content.split('\n')
        current_entity = None
        in_table = False
        table_headers = []
        skip_keywords = [
            'overview', '概述', 'relationship', '关系', 'validation', '校验',
            'migration', '迁移', 'api response', 'state transition', '状态',
            'entity definition', 'entity relationship', 'diagram', '图',
            'database schema', 'backend domain', 'backend dto', 'frontend typescript',
            'validation rule', '数据验证', '数据存储', 'appendix', '附录',
            'table', 'index', 'constraint', 'model', '模型', 'mapping', '映射'
        ]

        for i, line in enumerate(lines):
            # 识别实体标题
            if line.startswith('###') or (line.startswith('##') and not line.startswith('###')):
                match = re.match(entity_pattern, line.strip())
                if match:
                    entity_name = match.group(1).strip()

                    # 清理实体名称
                    # "1. Store（门店）实体" -> "Store"
                    entity_name = re.sub(r'^\d+\.\s*', '', entity_name)  # 移除数字前缀
                    entity_name = re.sub(r'\s*实体$', '', entity_name)   # 移除"实体"后缀
                    entity_name = re.sub(r'\s*\(扩展\)$', '', entity_name) # 移除"(扩展)"

                    # 跳过非实体的标题
                    if any(skip in entity_name.lower() for skip in skip_keywords):
                        current_entity = None
                        in_table = False
                        continue

                    # 提取描述
                    description = match.group(2) if match.group(2) else ""

                    # 尝试从下一行获取说明
                    if i + 1 < len(lines) and not description:
                        next_line = lines[i + 1].strip()
                        if next_line.startswith('**Purpose**:') or next_line.startswith('**说明**:'):
                            description = next_line.split(':', 1)[1].strip()

                    current_entity = Entity(
                        name=entity_name,
                        description=description,
                        source_spec=self.spec_id
                    )
                    self.entities[entity_name] = current_entity
                    in_table = False

            # 解析表格字段
            elif current_entity and '|' in line and line.strip().startswith('|'):
                if not in_table and ('字段' in line or 'Field' in line.lower() or '参数' in line):
                    # 表头
                    table_headers = [h.strip() for h in line.split('|') if h.strip()]
                    in_table = True
                elif line.startswith('|---') or line.startswith('| ---'):
                    # 分隔行，跳过
                    continue
                elif in_table:
                    # 数据行
                    cells = [c.strip() for c in line.split('|') if c.strip()]
                    if len(cells) >= 2 and cells[0] and not cells[0].lower() in ['字段名', 'field', 'name', '字段']:
                        # 清理字段名中的代码标记
                        field_name = re.sub(r'[`\*]', '', cells[0]).strip()

                        field = {
                            'name': field_name,
                            'type': cells[1] if len(cells) > 1 else 'TODO: 待规格明确类型',
                            'required': cells[2] if len(cells) > 2 else '否',
                            'description': cells[3] if len(cells) > 3 else '',
                            'constraints': cells[4] if len(cells) > 4 else ''
                        }
                        current_entity.fields.append(field)
            elif not line.strip().startswith('|'):
                if in_table and current_entity and len(current_entity.fields) > 0:
                    # 表格结束
                    in_table = False

    def _parse_data_model_from_spec(self, file_path: Path):
        """从 spec.md 提取数据模型"""
        content = file_path.read_text(encoding='utf-8')

        # 查找 "Key Entities" 章节
        key_entities_pattern = r'###?\s*Key Entities.*?\n(.*?)(?=\n##[^#]|\Z)'
        match = re.search(key_entities_pattern, content, re.DOTALL | re.IGNORECASE)

        if match:
            entities_section = match.group(1)
            # 解析实体定义
            entity_blocks = re.split(r'\n-\s+\*\*(.+?)\*\*:', entities_section)

            for i in range(1, len(entity_blocks), 2):
                entity_name = entity_blocks[i].strip()
                entity_desc = entity_blocks[i+1].strip() if i+1 < len(entity_blocks) else ""

                # 提取描述的第一句话
                desc_match = re.match(r'([^。\n]+)', entity_desc)
                description = desc_match.group(1) if desc_match else entity_desc[:100]

                entity = Entity(
                    name=entity_name,
                    description=description,
                    source_spec=self.spec_id
                )

                # 提取字段（通常在列表中）
                field_pattern = r'-\s+(\w+)[：:]\s*(.+?)(?=\n\s*-|\Z)'
                for field_match in re.finditer(field_pattern, entity_desc):
                    field_name = field_match.group(1)
                    field_desc = field_match.group(2).strip()
                    entity.fields.append({
                        'name': field_name,
                        'type': 'TODO: 待规格明确类型',
                        'required': '否',
                        'description': field_desc,
                        'constraints': ''
                    })

                self.entities[entity_name] = entity

    def _parse_api(self, file_path: Path):
        """解析 API 文档"""
        content = file_path.read_text(encoding='utf-8')
        self._extract_endpoints(content)

    def _parse_api_from_spec(self, file_path: Path):
        """从 spec.md 提取 API 定义"""
        content = file_path.read_text(encoding='utf-8')
        self._extract_endpoints(content)

    def _extract_endpoints(self, content: str):
        """提取 API 端点"""
        # 匹配 HTTP 方法和路径
        endpoint_pattern = r'(GET|POST|PUT|DELETE|PATCH)\s+(/[a-zA-Z0-9/_\-{}:]+)'

        for match in re.finditer(endpoint_pattern, content):
            method = match.group(1)
            path = match.group(2)

            # 尝试提取上下文描述
            start_pos = max(0, match.start() - 200)
            context = content[start_pos:match.end() + 500]

            # 提取描述
            desc_match = re.search(r'\*\*描述\*\*[：:]\s*(.+?)(?=\n|$)', context)
            description = desc_match.group(1).strip() if desc_match else f"{method} {path}"

            # 提取请求示例（JSON代码块）
            request_example = ""
            response_format = ""

            # 查找代码块
            json_blocks = re.findall(r'```json\s*\n(.*?)```', context, re.DOTALL)
            if json_blocks:
                # 第一个作为请求，第二个作为响应
                if len(json_blocks) >= 2:
                    request_example = json_blocks[0].strip()
                    response_format = json_blocks[1].strip()
                elif len(json_blocks) == 1:
                    response_format = json_blocks[0].strip()

            endpoint = APIEndpoint(
                name=description,
                method=method,
                path=path,
                description=description,
                request_example=request_example,
                response_format=response_format,
                source_spec=self.spec_id
            )

            self.endpoints.append(endpoint)


class DocumentGenerator:
    """文档生成器"""

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.specs_dir = project_root / 'specs'
        self.all_entities: Dict[str, Entity] = {}
        self.all_endpoints: List[APIEndpoint] = []
        self.processed_specs: List[str] = []

    def process_all_specs(self):
        """处理所有规格目录"""
        for spec_dir in sorted(self.specs_dir.iterdir()):
            if spec_dir.is_dir() and not spec_dir.name.startswith('.'):
                print(f"Processing: {spec_dir.name}")
                parser = SpecParser(spec_dir)
                entities, endpoints = parser.parse()

                # 合并实体（去重）
                for name, entity in entities.items():
                    if name not in self.all_entities:
                        self.all_entities[name] = entity
                    else:
                        # 合并字段
                        existing = self.all_entities[name]
                        existing_field_names = {f['name'] for f in existing.fields}
                        for field in entity.fields:
                            if field['name'] not in existing_field_names:
                                field['description'] += f" (来源: {entity.source_spec})"
                                existing.fields.append(field)

                # 收集端点
                self.all_endpoints.extend(endpoints)

                if entities or endpoints:
                    self.processed_specs.append(spec_dir.name)

    def generate_data_model_doc(self) -> str:
        """生成数据模型文档"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        doc = f"""# 数据模型文档（整合版）

## 文档信息
- 生成时间: {timestamp}
- 数据来源: specs/ 目录下所有规格
- 总实体数: {len(self.all_entities)}
- 处理规格数: {len(self.processed_specs)}

## 核心实体

"""

        for entity_name in sorted(self.all_entities.keys()):
            entity = self.all_entities[entity_name]

            doc += f"### {entity_name}\n\n"
            doc += f"**说明**: {entity.description or 'TODO: 待补充说明'}\n\n"
            doc += f"**来源规格**: {entity.source_spec}\n\n"

            if entity.fields:
                doc += "**字段定义**:\n\n"
                doc += "| 字段名 | 类型 | 必填 | 说明 | 约束 |\n"
                doc += "|-------|------|------|------|------|\n"

                for field in entity.fields:
                    doc += f"| {field['name']} | {field.get('type', '')} | "
                    doc += f"{field.get('required', '否')} | {field.get('description', '')} | "
                    doc += f"{field.get('constraints', '')} |\n"
                doc += "\n"
            else:
                doc += "**字段定义**: TODO: 待从规格中提取\n\n"

            doc += "---\n\n"

        doc += f"""
## 附录

### 处理的规格文件

"""
        for spec in self.processed_specs:
            doc += f"- {spec}\n"

        doc += """
---

**生成说明**:
- 本文档由 generate_api_docs.py 自动生成
- 标记为 `TODO: 待规格明确` 的项需要在规格文档中补充后重新生成
- 如发现信息缺失或不准确，请参考原始规格文档
"""

        return doc

    def generate_api_spec_doc(self) -> str:
        """生成 API 规格文档"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        doc = f"""# API 接口规格文档（整合版）

## 文档信息
- 生成时间: {timestamp}
- 数据来源: specs/ 目录下所有规格
- 总端点数: {len(self.all_endpoints)}
- 处理规格数: {len(self.processed_specs)}

## 通用规范

### 基础路径
- 开发环境: `http://localhost:8080/api`
- 生产环境: `https://api.example.com/api`

### 认证方式
- **Bearer Token (JWT)**
- 请求头: `Authorization: Bearer <token>`

### 通用响应格式

**成功响应**:
```json
{{
  "success": true,
  "data": <数据对象或数组>,
  "timestamp": "2025-12-22T10:00:00Z",
  "message": "操作成功"
}}
```

**错误响应**:
```json
{{
  "success": false,
  "error": "ERROR_CODE",
  "message": "错误描述",
  "details": {{}},
  "timestamp": "2025-12-22T10:00:00Z"
}}
```

### HTTP 状态码

| 状态码 | 说明 |
|-------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 500 | 服务器内部错误 |

## API 端点

"""

        # 按方法和路径分组
        grouped_endpoints = {}
        for endpoint in self.all_endpoints:
            key = f"{endpoint.method} {endpoint.path}"
            if key not in grouped_endpoints:
                grouped_endpoints[key] = endpoint

        for i, (key, endpoint) in enumerate(sorted(grouped_endpoints.items()), 1):
            doc += f"### {i}. {endpoint.name}\n\n"
            doc += f"**端点**: `{endpoint.method} {endpoint.path}`\n\n"
            doc += f"**描述**: {endpoint.description}\n\n"
            doc += f"**来源规格**: {endpoint.source_spec}\n\n"

            if endpoint.request_example:
                doc += "**请求示例**:\n```json\n"
                doc += endpoint.request_example
                doc += "\n```\n\n"

            if endpoint.response_format:
                doc += "**成功响应** (200 OK):\n```json\n"
                doc += endpoint.response_format
                doc += "\n```\n\n"
            else:
                doc += "**成功响应**: TODO: 待定义响应格式\n\n"

            doc += "**错误响应**: TODO: 待定义错误响应\n\n"
            doc += "---\n\n"

        doc += f"""
## 附录

### 处理的规格文件

"""
        for spec in self.processed_specs:
            doc += f"- {spec}\n"

        doc += """
---

**生成说明**:
- 本文档由 generate_api_docs.py 自动生成
- 所有 API 响应格式遵循项目 API 标准（`.claude/rules/08-api-standards.md`）
- 标记为 `TODO: 待定义` 的端点需要在规格文档中补充详细信息
"""

        return doc

    def run(self):
        """执行文档生成流程"""
        print("开始处理规格文档...")
        self.process_all_specs()

        # 确保输出目录存在
        docs_data_model_dir = self.project_root / 'docs' / 'data-model'
        docs_api_dir = self.project_root / 'docs' / 'api'
        docs_data_model_dir.mkdir(parents=True, exist_ok=True)
        docs_api_dir.mkdir(parents=True, exist_ok=True)

        print(f"\n生成数据模型文档...")
        data_model_doc = self.generate_data_model_doc()
        output_file = docs_data_model_dir / 'data_model.md'
        output_file.write_text(data_model_doc, encoding='utf-8')
        print(f"✅ 数据模型文档已生成: {output_file}")

        print(f"\n生成 API 规格文档...")
        api_spec_doc = self.generate_api_spec_doc()
        output_file = docs_api_dir / 'api_spec.md'
        output_file.write_text(api_spec_doc, encoding='utf-8')
        print(f"✅ API 规格文档已生成: {output_file}")

        # 打印摘要
        print(f"\n{'='*60}")
        print("✅ 文档生成完成")
        print(f"{'='*60}")
        print(f"\n处理的规格文件: {len(self.processed_specs)} 个")
        print(f"\n生成的数据模型:")
        print(f"  - 总实体数: {len(self.all_entities)}")
        print(f"  - 文档路径: docs/data-model/data_model.md")
        print(f"\n生成的 API 文档:")
        print(f"  - 总端点数: {len(self.all_endpoints)}")
        print(f"  - 文档路径: docs/api/api_spec.md")


if __name__ == '__main__':
    # 脚本在 scripts/ 目录下，项目根目录是上一级
    project_root = Path(__file__).parent.parent
    generator = DocumentGenerator(project_root)
    generator.run()
