#!/usr/bin/env python3
"""
验证文档解析器 - 从 Markdown 验证步骤文档中提取测试用例
"""

import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class APITestCase:
    """API 测试用例"""
    name: str
    curl_command: str
    expected_result: Optional[Dict] = None
    criteria: List[str] = field(default_factory=list)


@dataclass
class UITestCase:
    """UI 测试用例"""
    name: str
    steps: List[Dict[str, Any]] = field(default_factory=list)
    criteria: List[str] = field(default_factory=list)


@dataclass
class VerificationDocument:
    """验证文档"""
    title: str
    spec_id: str
    prerequisites: List[str] = field(default_factory=list)
    api_tests: List[APITestCase] = field(default_factory=list)
    ui_tests: List[UITestCase] = field(default_factory=list)


def parse_verification_document(file_path: str) -> VerificationDocument:
    """
    解析验证步骤文档

    Args:
        file_path: Markdown 文件路径

    Returns:
        VerificationDocument
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 提取标题
    title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    title = title_match.group(1) if title_match else "未知文档"

    # 提取 spec ID
    spec_match = re.search(r'\*\*规格\*\*:\s*(\S+)', content)
    spec_id = spec_match.group(1) if spec_match else ""

    doc = VerificationDocument(title=title, spec_id=spec_id)

    # 提取前置条件
    prereq_section = re.search(
        r'##\s*📋?\s*前置准备(.*?)(?=##|\Z)',
        content,
        re.DOTALL
    )
    if prereq_section:
        prereqs = re.findall(r'-\s*\[\s*\]\s*(.+)', prereq_section.group(1))
        doc.prerequisites = prereqs

    # 提取步骤
    steps = re.findall(
        r'###\s+步骤\s*\d+[:\s]*(.+?)\n(.*?)(?=###\s+步骤|\Z)',
        content,
        re.DOTALL
    )

    for step_name, step_content in steps:
        step_name = step_name.strip()

        # 判断是 API 还是 UI 测试
        if '后端' in step_name or 'API' in step_name:
            api_test = parse_api_step(step_name, step_content)
            if api_test:
                doc.api_tests.append(api_test)
        elif '前端' in step_name or 'UI' in step_name or '小程序' in step_name:
            ui_test = parse_ui_step(step_name, step_content)
            if ui_test:
                doc.ui_tests.append(ui_test)

    return doc


def parse_api_step(name: str, content: str) -> Optional[APITestCase]:
    """解析 API 测试步骤"""
    # 提取 curl 命令
    curl_match = re.search(
        r'```bash\s*(curl\s+.+?)\s*```',
        content,
        re.DOTALL
    )
    if not curl_match:
        return None

    curl_command = curl_match.group(1).strip()
    # 处理多行 curl 命令
    curl_command = re.sub(r'\s*\\\s*\n\s*', ' ', curl_command)

    # 提取预期结果
    expected_match = re.search(
        r'\*\*预期结果\*\*[:\s]*```json\s*(.+?)\s*```',
        content,
        re.DOTALL
    )
    expected_result = None
    if expected_match:
        try:
            import json
            expected_result = json.loads(expected_match.group(1))
        except:
            pass

    # 提取验收标准
    criteria = re.findall(r'-\s*\[\s*\]\s*(.+)', content)

    return APITestCase(
        name=name,
        curl_command=curl_command,
        expected_result=expected_result,
        criteria=criteria
    )


def parse_ui_step(name: str, content: str) -> Optional[UITestCase]:
    """解析 UI 测试步骤"""
    # 提取验收标准
    criteria = re.findall(r'-\s*\[\s*\]\s*(.+)', content)

    if not criteria:
        return None

    # 将验收标准转换为 UI 验证步骤
    steps = []
    for criterion in criteria:
        step = criterion_to_ui_step(criterion)
        if step:
            steps.append(step)

    return UITestCase(
        name=name,
        steps=steps,
        criteria=criteria
    )


def criterion_to_ui_step(criterion: str) -> Optional[Dict[str, Any]]:
    """将验收标准转换为 UI 验证步骤"""

    # 元素存在验证
    if '显示' in criterion or '存在' in criterion:
        # 提取关键词作为选择器提示
        keywords = extract_keywords(criterion)
        selector = generate_selector(keywords)
        return {
            'action': 'verify_exists',
            'params': {
                'selector': selector,
                'description': criterion
            }
        }

    # 文本内容验证
    if '包含' in criterion or '文本' in criterion:
        match = re.search(r'[""「](.+?)[""」]', criterion)
        if match:
            expected_text = match.group(1)
            return {
                'action': 'verify_text',
                'params': {
                    'selector': 'body',
                    'expected': expected_text,
                    'description': criterion
                }
            }

    # 选中状态验证
    if '选中' in criterion or '高亮' in criterion:
        keywords = extract_keywords(criterion)
        selector = generate_selector(keywords)
        return {
            'action': 'verify_class',
            'params': {
                'selector': selector,
                'class_name': 'active',
                'description': criterion
            }
        }

    # 点击操作
    if '点击' in criterion:
        match = re.search(r'点击[""「](.+?)[""」]', criterion)
        if match:
            text = match.group(1)
            return {
                'action': 'click',
                'params': {
                    'selector': f'text={text}',
                    'description': criterion
                }
            }

    # 价格格式验证
    if '价格' in criterion and ('格式' in criterion or '¥' in criterion):
        return {
            'action': 'verify_price',
            'params': {
                'selector': '[class*="price"], .price',
                'description': criterion
            }
        }

    # 列表数据验证
    if '列表' in criterion or '卡片' in criterion:
        return {
            'action': 'verify_count',
            'params': {
                'selector': '[class*="item"], [class*="card"], [class*="product"]',
                'min_count': 1,
                'description': criterion
            }
        }

    # 默认返回存在性验证
    return {
        'action': 'verify_exists',
        'params': {
            'selector': 'body',
            'description': criterion
        }
    }


def extract_keywords(text: str) -> List[str]:
    """从文本中提取关键词"""
    keywords = []

    # 提取引号中的内容
    quoted = re.findall(r'[""「](.+?)[""」]', text)
    keywords.extend(quoted)

    # 提取常见 UI 元素关键词
    ui_terms = ['分类', '标签', '菜单', '商品', '卡片', '列表', '按钮', '图片', '价格']
    for term in ui_terms:
        if term in text:
            keywords.append(term)

    return keywords


def generate_selector(keywords: List[str]) -> str:
    """根据关键词生成选择器"""
    selectors = []

    keyword_to_selector = {
        '分类': '[class*="category"], [class*="tab"]',
        '标签': '[class*="tag"], [class*="tab"]',
        '菜单': '[class*="menu"], [class*="nav"]',
        '商品': '[class*="product"], [class*="item"]',
        '卡片': '[class*="card"]',
        '列表': '[class*="list"]',
        '按钮': 'button, [class*="btn"]',
        '图片': 'img, [class*="image"]',
        '价格': '[class*="price"]',
    }

    for keyword in keywords:
        if keyword in keyword_to_selector:
            selectors.append(keyword_to_selector[keyword])
        else:
            # 使用 text= 选择器
            selectors.append(f'text={keyword}')

    return ', '.join(selectors) if selectors else 'body'


def format_document(doc: VerificationDocument) -> str:
    """格式化输出解析结果"""
    lines = [
        f"📄 验证文档: {doc.title}",
        f"📋 规格 ID: {doc.spec_id}",
        "",
        f"前置条件: {len(doc.prerequisites)} 项",
        f"API 测试: {len(doc.api_tests)} 个",
        f"UI 测试: {len(doc.ui_tests)} 个",
        "",
        "--- API 测试 ---"
    ]

    for api in doc.api_tests:
        lines.append(f"\n[{api.name}]")
        lines.append(f"  命令: {api.curl_command[:50]}...")
        lines.append(f"  验收标准: {len(api.criteria)} 项")

    lines.append("\n--- UI 测试 ---")

    for ui in doc.ui_tests:
        lines.append(f"\n[{ui.name}]")
        lines.append(f"  步骤: {len(ui.steps)} 个")
        lines.append(f"  验收标准: {len(ui.criteria)} 项")

    return '\n'.join(lines)


if __name__ == '__main__':
    import sys

    if len(sys.argv) < 2:
        print("用法: python doc_parser.py <验证文档路径>")
        sys.exit(1)

    file_path = sys.argv[1]
    doc = parse_verification_document(file_path)
    print(format_document(doc))
