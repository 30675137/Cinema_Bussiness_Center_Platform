#!/usr/bin/env python3
"""
Enhanced API Documentation Generator
支持从 OpenAPI YAML 和 Markdown 整合所有 API 文档

**@spec O005-channel-product-config**
"""

import os
import re
import yaml
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field


@dataclass
class APIEndpoint:
    """API 端点"""
    name: str
    method: str
    path: str
    description: str = ""
    tags: List[str] = field(default_factory=list)
    parameters: List[Dict] = field(default_factory=list)
    request_body: Optional[Dict] = None
    responses: Dict[str, Dict] = field(default_factory=dict)
    security: List[Dict] = field(default_factory=list)
    source_spec: str = ""
    source_type: str = ""  # 'openapi' or 'markdown'


class OpenAPIParser:
    """OpenAPI 3.0 YAML 解析器"""

    def __init__(self, spec_id: str):
        self.spec_id = spec_id
        self.endpoints: List[APIEndpoint] = []

    def parse_yaml(self, yaml_path: Path) -> List[APIEndpoint]:
        """解析 OpenAPI YAML 文件"""
        try:
            with open(yaml_path, 'r', encoding='utf-8') as f:
                spec = yaml.safe_load(f)

            if not spec or 'paths' not in spec:
                return []

            # 解析所有路径和操作
            for path, path_item in spec.get('paths', {}).items():
                for method, operation in path_item.items():
                    if method.upper() not in ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']:
                        continue

                    endpoint = APIEndpoint(
                        name=operation.get('summary', f"{method.upper()} {path}"),
                        method=method.upper(),
                        path=path,
                        description=operation.get('description', ''),
                        tags=operation.get('tags', []),
                        parameters=operation.get('parameters', []),
                        request_body=operation.get('requestBody'),
                        responses=operation.get('responses', {}),
                        security=operation.get('security', []),
                        source_spec=self.spec_id,
                        source_type='openapi'
                    )
                    self.endpoints.append(endpoint)

            return self.endpoints

        except Exception as e:
            print(f"⚠️ 解析 {yaml_path} 失败: {e}")
            return []


class MarkdownAPIParser:
    """Markdown API 文档解析器（现有逻辑）"""

    def __init__(self, spec_id: str):
        self.spec_id = spec_id
        self.endpoints: List[APIEndpoint] = []

    def parse_markdown(self, content: str) -> List[APIEndpoint]:
        """从 Markdown 提取 API 端点"""
        endpoint_pattern = r'(GET|POST|PUT|DELETE|PATCH)\s+(/[a-zA-Z0-9/_\-{}:]+)'

        for match in re.finditer(endpoint_pattern, content):
            method = match.group(1)
            path = match.group(2)

            # 提取上下文描述
            start_pos = max(0, match.start() - 200)
            context = content[start_pos:match.end() + 500]

            # 提取描述
            desc_match = re.search(r'\*\*描述\*\*[：:]\s*(.+?)(?=\n|$)', context)
            description = desc_match.group(1).strip() if desc_match else f"{method} {path}"

            endpoint = APIEndpoint(
                name=description,
                method=method,
                path=path,
                description=description,
                source_spec=self.spec_id,
                source_type='markdown'
            )
            self.endpoints.append(endpoint)

        return self.endpoints


class UnifiedDocumentGenerator:
    """统一文档生成器"""

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.specs_dir = project_root / 'specs'
        self.all_endpoints: List[APIEndpoint] = []
        self.processed_specs: List[str] = []
        self.openapi_specs: List[str] = []
        self.markdown_specs: List[str] = []

    def process_all_specs(self):
        """处理所有规格目录"""
        for spec_dir in sorted(self.specs_dir.iterdir()):
            if not spec_dir.is_dir() or spec_dir.name.startswith('.'):
                continue

            print(f"Processing: {spec_dir.name}")
            spec_id = spec_dir.name

            # 1. 优先查找 contracts/api.yaml
            contracts_yaml = spec_dir / 'contracts' / 'api.yaml'
            if contracts_yaml.exists():
                parser = OpenAPIParser(spec_id)
                endpoints = parser.parse_yaml(contracts_yaml)
                if endpoints:
                    self.all_endpoints.extend(endpoints)
                    self.processed_specs.append(spec_id)
                    self.openapi_specs.append(spec_id)
                    print(f"  ✅ OpenAPI: {len(endpoints)} endpoints")
                    continue

            # 2. 查找 Markdown API 文档
            api_files = [
                spec_dir / 'api.md',
                spec_dir / 'api-spec.md',
                spec_dir / 'api_spec.md',
                spec_dir / 'spec.md'
            ]

            for api_file in api_files:
                if api_file.exists():
                    content = api_file.read_text(encoding='utf-8')
                    parser = MarkdownAPIParser(spec_id)
                    endpoints = parser.parse_markdown(content)
                    if endpoints:
                        self.all_endpoints.extend(endpoints)
                        self.processed_specs.append(spec_id)
                        self.markdown_specs.append(spec_id)
                        print(f"  ✅ Markdown: {len(endpoints)} endpoints")
                        break

    def generate_unified_api_doc(self) -> str:
        """生成统一 API 文档（Markdown 格式）"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        doc = f"""# API 接口规格文档（统一整合版）

**@spec O005-channel-product-config** (及其他规格)

## 📋 文档信息

- **生成时间**: {timestamp}
- **数据来源**: `specs/` 目录下所有规格
- **总端点数**: {len(self.all_endpoints)}
- **处理规格数**: {len(self.processed_specs)}
- **OpenAPI 规格**: {len(self.openapi_specs)} 个
- **Markdown 规格**: {len(self.markdown_specs)} 个

## 🌐 通用规范

### 基础路径

| 环境 | URL |
|-----|-----|
| 本地开发 | `http://localhost:8080/api` |
| 开发环境 | `https://api-dev.cinema-platform.com/api` |
| 生产环境 | `https://api.cinema-platform.com/api` |

### 认证方式

- **Bearer Token (JWT)**
- 请求头: `Authorization: Bearer <token>`

### 统一响应格式

**成功响应**:
```json
{{
  "success": true,
  "data": <数据对象或数组>,
  "timestamp": "2026-01-02T10:00:00Z",
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
  "timestamp": "2026-01-02T10:00:00Z"
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

---

## 📚 API 端点分组

"""

        # 按标签分组（OpenAPI）或按规格分组（Markdown）
        grouped_endpoints = self._group_endpoints_by_tag()

        for tag, endpoints in sorted(grouped_endpoints.items()):
            doc += f"### {tag}\n\n"

            for i, endpoint in enumerate(endpoints, 1):
                doc += self._format_endpoint(endpoint, i)

        doc += f"""
---

## 📊 统计信息

### OpenAPI 规范（{len(self.openapi_specs)} 个规格）

"""
        for spec in sorted(self.openapi_specs):
            count = len([e for e in self.all_endpoints if e.source_spec == spec])
            doc += f"- **{spec}**: {count} 个端点\n"

        if self.markdown_specs:
            doc += f"\n### Markdown 规范（{len(self.markdown_specs)} 个规格）\n\n"
            for spec in sorted(self.markdown_specs):
                count = len([e for e in self.all_endpoints if e.source_spec == spec])
                doc += f"- **{spec}**: {count} 个端点\n"

        doc += f"""

---

## 📝 附录

### 所有处理的规格文件

"""
        for spec in sorted(self.processed_specs):
            source_type = '📘 OpenAPI' if spec in self.openapi_specs else '📄 Markdown'
            doc += f"- {source_type} `{spec}`\n"

        doc += f"""

---

**生成说明**:
- 本文档由 `generate_unified_api_docs.py` 自动生成
- 优先解析 `contracts/api.yaml` (OpenAPI 3.0)，其次解析 Markdown 文档
- 所有 API 响应格式遵循项目 API 标准（`.claude/rules/08-api-standards.md`）
- 标记为 `TODO: 待定义` 的端点需要在规格文档中补充详细信息

**下次更新**: 当新增或修改 API 规格后，运行:
```bash
python scripts/generate_unified_api_docs.py
```
"""

        return doc

    def _group_endpoints_by_tag(self) -> Dict[str, List[APIEndpoint]]:
        """按标签分组端点"""
        grouped = {}

        for endpoint in self.all_endpoints:
            if endpoint.source_type == 'openapi' and endpoint.tags:
                # OpenAPI 端点按 tag 分组
                for tag in endpoint.tags:
                    if tag not in grouped:
                        grouped[tag] = []
                    grouped[tag].append(endpoint)
            else:
                # Markdown 端点按 spec 分组
                group_name = endpoint.source_spec
                if group_name not in grouped:
                    grouped[group_name] = []
                grouped[group_name].append(endpoint)

        return grouped

    def _format_endpoint(self, endpoint: APIEndpoint, index: int) -> str:
        """格式化单个端点文档"""
        doc = f"#### {index}. {endpoint.name}\n\n"
        doc += f"**端点**: `{endpoint.method} {endpoint.path}`\n\n"

        if endpoint.description:
            doc += f"**描述**: {endpoint.description}\n\n"

        doc += f"**来源规格**: `{endpoint.source_spec}` ({endpoint.source_type})\n\n"

        # 如果是 OpenAPI 端点，输出更多详细信息
        if endpoint.source_type == 'openapi':
            # 参数
            if endpoint.parameters:
                doc += "**参数**:\n\n"
                doc += "| 名称 | 位置 | 类型 | 必填 | 说明 |\n"
                doc += "|-----|------|------|------|------|\n"
                for param in endpoint.parameters:
                    name = param.get('name', '')
                    location = param.get('in', '')
                    required = '✅' if param.get('required') else '❌'
                    schema = param.get('schema', {})
                    param_type = schema.get('type', 'object')
                    desc = param.get('description', '')
                    doc += f"| `{name}` | {location} | {param_type} | {required} | {desc} |\n"
                doc += "\n"

            # 请求体
            if endpoint.request_body:
                doc += "**请求体**:\n\n"
                content = endpoint.request_body.get('content', {})
                if 'application/json' in content:
                    schema = content['application/json'].get('schema', {})
                    doc += f"- Content-Type: `application/json`\n"
                    if schema.get('$ref'):
                        ref_name = schema['$ref'].split('/')[-1]
                        doc += f"- Schema: `{ref_name}` (见 OpenAPI spec)\n"
                doc += "\n"

            # 响应
            if endpoint.responses:
                doc += "**响应**:\n\n"
                for status_code, response in endpoint.responses.items():
                    desc = response.get('description', '')
                    doc += f"- **{status_code}**: {desc}\n"
                doc += "\n"

        else:
            # Markdown 端点简化输出
            doc += "**详细信息**: 请参考规格文档 `specs/{}/spec.md`\n\n".format(endpoint.source_spec)

        doc += "---\n\n"
        return doc

    def run(self):
        """执行文档生成流程"""
        print("🚀 开始处理规格文档...")
        print("="*60)
        self.process_all_specs()

        # 确保输出目录存在
        docs_api_dir = self.project_root / 'docs' / 'api'
        docs_api_dir.mkdir(parents=True, exist_ok=True)

        print(f"\n📝 生成统一 API 规格文档...")
        api_doc = self.generate_unified_api_doc()
        output_file = docs_api_dir / 'unified-api-spec.md'
        output_file.write_text(api_doc, encoding='utf-8')
        print(f"✅ API 规格文档已生成: {output_file}")

        # 打印摘要
        print(f"\n{'='*60}")
        print("✅ 文档生成完成")
        print(f"{'='*60}")
        print(f"\n📊 统计信息:")
        print(f"  - 处理的规格文件: {len(self.processed_specs)} 个")
        print(f"  - OpenAPI 规格: {len(self.openapi_specs)} 个")
        print(f"  - Markdown 规格: {len(self.markdown_specs)} 个")
        print(f"  - 总端点数: {len(self.all_endpoints)}")
        print(f"\n📂 生成的文档:")
        print(f"  - 统一 API 文档: docs/api/unified-api-spec.md")
        print(f"\n💡 提示:")
        print(f"  - 查看 docs/api/unified-api-spec.md 获取完整 API 列表")
        print(f"  - O005 的 {len([e for e in self.all_endpoints if e.source_spec == 'O005-channel-product-config'])} 个端点已整合")


if __name__ == '__main__':
    # 脚本在 scripts/ 目录下，项目根目录是上一级
    project_root = Path(__file__).parent.parent
    generator = UnifiedDocumentGenerator(project_root)
    generator.run()
