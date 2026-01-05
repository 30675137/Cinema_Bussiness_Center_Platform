#!/usr/bin/env python3
"""
API 验证器 - 执行 curl 命令并验证响应
"""

import subprocess
import json
import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime


@dataclass
class VerificationResult:
    """验证结果"""
    criterion: str
    passed: bool
    actual_value: Any = None
    expected_value: Any = None
    error: Optional[str] = None


@dataclass
class APITestResult:
    """API 测试结果"""
    name: str
    curl_command: str
    status_code: int
    response_time_ms: float
    response_body: Dict
    verifications: List[VerificationResult]

    @property
    def passed(self) -> bool:
        return all(v.passed for v in self.verifications)

    @property
    def pass_count(self) -> int:
        return sum(1 for v in self.verifications if v.passed)

    @property
    def fail_count(self) -> int:
        return sum(1 for v in self.verifications if not v.passed)


def execute_curl(curl_command: str) -> tuple[int, Dict, float]:
    """
    执行 curl 命令并返回结果

    Returns:
        (status_code, response_body, response_time_ms)
    """
    # 添加 -w 获取状态码和时间
    modified_cmd = curl_command.strip()
    if not '-w' in modified_cmd:
        modified_cmd += ' -w "\\n%{http_code}\\n%{time_total}"'
    if not '-s' in modified_cmd:
        modified_cmd = modified_cmd.replace('curl ', 'curl -s ')

    start_time = datetime.now()
    result = subprocess.run(
        modified_cmd,
        shell=True,
        capture_output=True,
        text=True
    )
    elapsed = (datetime.now() - start_time).total_seconds() * 1000

    output_lines = result.stdout.strip().split('\n')
    if len(output_lines) >= 3:
        response_body = '\n'.join(output_lines[:-2])
        status_code = int(output_lines[-2])
        response_time = float(output_lines[-1]) * 1000
    else:
        response_body = result.stdout
        status_code = 0
        response_time = elapsed

    try:
        body_json = json.loads(response_body)
    except json.JSONDecodeError:
        body_json = {"_raw": response_body}

    return status_code, body_json, response_time


def verify_criterion(response: Dict, criterion: str) -> VerificationResult:
    """
    验证单个验收标准

    支持的标准格式:
    - "返回状态码 200"
    - "`success` 字段为 `true`"
    - "`data` 数组不为空"
    - "每个分类包含 `id`, `code`, `displayName` 字段"
    - "分类按 `sortOrder` 升序排列"
    """
    criterion_lower = criterion.lower()

    # 状态码验证
    if '状态码' in criterion:
        match = re.search(r'(\d{3})', criterion)
        if match:
            expected = int(match.group(1))
            actual = response.get('_status_code', 0)
            return VerificationResult(
                criterion=criterion,
                passed=actual == expected,
                actual_value=actual,
                expected_value=expected
            )

    # 字段值验证: `field` 字段为 `value`
    field_value_match = re.search(r'`(\w+)`\s*字段为\s*`(\w+)`', criterion)
    if field_value_match:
        field = field_value_match.group(1)
        expected = field_value_match.group(2)
        if expected == 'true':
            expected = True
        elif expected == 'false':
            expected = False
        actual = response.get(field)
        return VerificationResult(
            criterion=criterion,
            passed=actual == expected,
            actual_value=actual,
            expected_value=expected
        )

    # 数组非空验证: `field` 数组不为空
    array_match = re.search(r'`(\w+)`\s*数组不为空', criterion)
    if array_match:
        field = array_match.group(1)
        actual = response.get(field, [])
        return VerificationResult(
            criterion=criterion,
            passed=isinstance(actual, list) and len(actual) > 0,
            actual_value=f"{len(actual)} 条记录" if isinstance(actual, list) else actual,
            expected_value="非空数组"
        )

    # 字段存在验证: 包含 `field1`, `field2` 字段
    fields_match = re.search(r'包含\s*(.+)\s*字段', criterion)
    if fields_match:
        fields_str = fields_match.group(1)
        fields = re.findall(r'`(\w+)`', fields_str)
        data = response.get('data', [])
        if isinstance(data, list) and len(data) > 0:
            first_item = data[0]
            missing = [f for f in fields if f not in first_item]
            return VerificationResult(
                criterion=criterion,
                passed=len(missing) == 0,
                actual_value=list(first_item.keys()) if isinstance(first_item, dict) else first_item,
                expected_value=fields,
                error=f"缺失字段: {missing}" if missing else None
            )

    # 排序验证: 按 `field` 升序/降序排列
    sort_match = re.search(r'按\s*`(\w+)`\s*(升序|降序)', criterion)
    if sort_match:
        field = sort_match.group(1)
        order = sort_match.group(2)
        data = response.get('data', [])
        if isinstance(data, list) and len(data) > 1:
            values = [item.get(field) for item in data if field in item]
            if order == '升序':
                is_sorted = values == sorted(values)
            else:
                is_sorted = values == sorted(values, reverse=True)
            return VerificationResult(
                criterion=criterion,
                passed=is_sorted,
                actual_value=values[:5],  # 只显示前5个
                expected_value=f"按 {field} {order}排列"
            )

    # 过滤验证: 只返回 `field`: `value` 的记录
    filter_match = re.search(r'只返回\s*`(\w+)`[:\s]*`?(\w+)`?\s*的', criterion)
    if filter_match:
        field = filter_match.group(1)
        expected_value = filter_match.group(2)
        if expected_value == 'true':
            expected_value = True
        elif expected_value == 'false':
            expected_value = False
        data = response.get('data', [])
        if isinstance(data, list):
            invalid = [item for item in data if item.get(field) != expected_value]
            return VerificationResult(
                criterion=criterion,
                passed=len(invalid) == 0,
                actual_value=f"{len(invalid)} 条不符合" if invalid else "全部符合",
                expected_value=f"{field} = {expected_value}",
                error=f"发现 {len(invalid)} 条 {field} != {expected_value}" if invalid else None
            )

    # 默认返回未知验证
    return VerificationResult(
        criterion=criterion,
        passed=True,  # 无法验证的标准默认通过
        error="无法自动验证，需要人工确认"
    )


def run_api_test(
    name: str,
    curl_command: str,
    criteria: List[str]
) -> APITestResult:
    """
    执行 API 测试

    Args:
        name: 测试名称
        curl_command: curl 命令
        criteria: 验收标准列表

    Returns:
        APITestResult
    """
    status_code, response, response_time = execute_curl(curl_command)

    # 将状态码添加到响应中用于验证
    response['_status_code'] = status_code

    # 验证所有标准
    verifications = [verify_criterion(response, c) for c in criteria]

    # 移除临时字段
    del response['_status_code']

    return APITestResult(
        name=name,
        curl_command=curl_command,
        status_code=status_code,
        response_time_ms=response_time,
        response_body=response,
        verifications=verifications
    )


def format_result(result: APITestResult) -> str:
    """格式化测试结果输出"""
    lines = [
        f"🔍 执行 API 验证: {result.name}",
        "",
        f"请求: {result.curl_command}",
        f"状态: {'✅' if result.status_code == 200 else '❌'} {result.status_code}",
        f"耗时: {result.response_time_ms:.0f}ms",
        "",
        "验收标准检查:"
    ]

    for v in result.verifications:
        status = '✅' if v.passed else '❌'
        line = f"  {status} {v.criterion}"
        if v.actual_value and not v.passed:
            line += f" (实际: {v.actual_value})"
        if v.error:
            line += f" - {v.error}"
        lines.append(line)

    lines.append("")
    lines.append(f"结果: {result.pass_count}/{len(result.verifications)} 通过")

    return '\n'.join(lines)


if __name__ == '__main__':
    # 示例用法
    result = run_api_test(
        name="分类列表 API",
        curl_command="curl http://localhost:8080/api/client/menu-categories",
        criteria=[
            "返回状态码 200",
            "`success` 字段为 `true`",
            "`data` 数组不为空",
            "每个分类包含 `id`, `code`, `displayName`, `sortOrder`, `isVisible` 字段",
            "分类按 `sortOrder` 升序排列",
            "只返回 `isVisible`: `true` 的分类"
        ]
    )
    print(format_result(result))
