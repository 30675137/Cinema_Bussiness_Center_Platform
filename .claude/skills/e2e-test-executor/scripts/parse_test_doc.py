#!/usr/bin/env python3
"""
Parse test case document (Markdown) and extract structured test case data.
Generates JSON output containing test cases, steps, expected results, and validation checks.
"""

import re
import json
import argparse
from pathlib import Path
from typing import List, Dict, Any, Optional

class TestCaseParser:
    def __init__(self, md_content: str):
        self.content = md_content
        self.test_cases = []

    def parse(self) -> Dict[str, Any]:
        """Parse Markdown document and extract test cases"""
        result = {
            "metadata": self._extract_metadata(),
            "test_cases": self._extract_test_cases(),
            "state_transitions": self._extract_state_transitions(),
            "data_validations": self._extract_data_validations()
        }
        return result

    def _extract_metadata(self) -> Dict[str, str]:
        """Extract document metadata"""
        metadata = {}

        # Extract title
        title_match = re.search(r'^# (.+)$', self.content, re.MULTILINE)
        if title_match:
            metadata['title'] = title_match.group(1)

        # Extract version, date, etc.
        if '**测试版本**:' in self.content:
            version_match = re.search(r'\*\*测试版本\*\*:\s*(.+)', self.content)
            if version_match:
                metadata['version'] = version_match.group(1).strip()

        if '**编写日期**:' in self.content:
            date_match = re.search(r'\*\*编写日期\*\*:\s*(.+)', self.content)
            if date_match:
                metadata['date'] = date_match.group(1).strip()

        return metadata

    def _extract_test_cases(self) -> List[Dict[str, Any]]:
        """Extract test cases from document"""
        test_cases = []

        # Find all test case sections (### TC-XXX:)
        tc_pattern = r'### (TC-[\w-]+):\s*(.+)'
        tc_matches = re.finditer(tc_pattern, self.content)

        for match in tc_matches:
            tc_id = match.group(1)
            tc_title = match.group(2).strip()

            # Extract test case content
            tc_start = match.end()
            # Find next test case or section
            next_tc = re.search(r'\n### TC-', self.content[tc_start:])
            next_section = re.search(r'\n## ', self.content[tc_start:])

            tc_end = len(self.content)
            if next_tc and next_section:
                tc_end = tc_start + min(next_tc.start(), next_section.start())
            elif next_tc:
                tc_end = tc_start + next_tc.start()
            elif next_section:
                tc_end = tc_start + next_section.start()

            tc_content = self.content[tc_start:tc_end]

            test_case = {
                "id": tc_id,
                "title": tc_title,
                "priority": self._extract_priority(tc_content),
                "type": self._extract_test_type(tc_content),
                "preconditions": self._extract_preconditions(tc_content),
                "test_data": self._extract_test_data(tc_content),
                "steps": self._extract_test_steps(tc_content),
                "postchecks": self._extract_postchecks(tc_content)
            }

            test_cases.append(test_case)

        return test_cases

    def _extract_priority(self, content: str) -> str:
        """Extract priority from test case"""
        priority_match = re.search(r'\*\*优先级\*\*:\s*([🔴🟡🟢])\s*(\S+)', content)
        if priority_match:
            emoji = priority_match.group(1)
            level = priority_match.group(2)
            if '🔴' in emoji or '高' in level:
                return 'high'
            elif '🟡' in emoji or '中' in level:
                return 'medium'
            elif '🟢' in emoji or '低' in level:
                return 'low'
        return 'medium'

    def _extract_test_type(self, content: str) -> str:
        """Extract test type"""
        type_match = re.search(r'\*\*测试类型\*\*:\s*(.+)', content)
        if type_match:
            test_type = type_match.group(1).strip()
            if '端到端' in test_type or 'E2E' in test_type:
                return 'e2e'
            elif '异常' in test_type:
                return 'exception'
            elif '并发' in test_type:
                return 'concurrent'
        return 'functional'

    def _extract_preconditions(self, content: str) -> List[str]:
        """Extract preconditions"""
        preconditions = []

        # Find preconditions section
        precond_match = re.search(r'\*\*前置条件\*\*:(.*?)(?=\*\*|$)', content, re.DOTALL)
        if precond_match:
            precond_text = precond_match.group(1)
            # Extract checklist items
            items = re.findall(r'-\s*\[x\]\s*(.+)', precond_text)
            preconditions.extend([item.strip() for item in items])

        return preconditions

    def _extract_test_data(self, content: str) -> Dict[str, Any]:
        """Extract test data"""
        test_data = {}

        # Find test data section (YAML block)
        data_match = re.search(r'```yaml\n(.*?)```', content, re.DOTALL)
        if data_match:
            yaml_text = data_match.group(1)
            # Simple YAML parsing (basic key-value pairs)
            for line in yaml_text.split('\n'):
                if ':' in line:
                    key, value = line.split(':', 1)
                    key = key.strip()
                    value = value.strip()
                    if key and value:
                        test_data[key] = value

        return test_data

    def _extract_test_steps(self, content: str) -> List[Dict[str, Any]]:
        """Extract test steps from table"""
        steps = []

        # Find test steps table
        table_match = re.search(r'\*\*测试步骤\*\*:.*?\n\n(\|.*?\n)(.*?)(?=\n\n|\*\*|$)', content, re.DOTALL)
        if table_match:
            table_content = table_match.group(2)
            # Parse table rows
            rows = [line.strip() for line in table_content.split('\n') if line.strip().startswith('|')]

            for row in rows:
                cells = [cell.strip() for cell in row.split('|')]
                if len(cells) >= 5 and cells[1].isdigit():  # Skip header/separator
                    step = {
                        "step_number": int(cells[1]),
                        "operator": cells[2],  # 操作端
                        "operation": cells[3],  # 操作描述
                        "expected_result": cells[4],  # 预期结果
                        "actual_result": cells[5] if len(cells) > 5 else "",
                        "pass_status": cells[6] if len(cells) > 6 else ""
                    }
                    steps.append(step)

        return steps

    def _extract_postchecks(self, content: str) -> List[Dict[str, Any]]:
        """Extract post-checks (database/API validations)"""
        postchecks = []

        # Find post-check tables
        postcheck_sections = re.finditer(r'\*\*后置检查.*?\*\*:(.*?)(?=\*\*|###|$)', content, re.DOTALL)

        for section in postcheck_sections:
            section_content = section.group(1)
            # Find tables in section
            table_match = re.search(r'\n(\|.*?\n)(.*?)(?=\n\n|$)', section_content, re.DOTALL)
            if table_match:
                table_content = table_match.group(2)
                rows = [line.strip() for line in table_content.split('\n') if line.strip().startswith('|')]

                for row in rows:
                    cells = [cell.strip() for cell in row.split('|')]
                    if len(cells) >= 4 and not cells[1].startswith('-'):  # Skip separator
                        check = {
                            "check_item": cells[1],
                            "check_method": cells[2] if len(cells) > 2 else "",
                            "check_content": cells[3] if len(cells) > 3 else "",
                            "expected_value": cells[4] if len(cells) > 4 else "",
                            "actual_value": cells[5] if len(cells) > 5 else "",
                            "status": cells[6] if len(cells) > 6 else ""
                        }
                        postchecks.append(check)

        return postchecks

    def _extract_state_transitions(self) -> List[Dict[str, Any]]:
        """Extract state transition validation table"""
        transitions = []

        # Find state transition section
        transition_match = re.search(r'## 🔄 状态流转测试(.*?)(?=##|$)', self.content, re.DOTALL)
        if transition_match:
            section_content = transition_match.group(1)
            # Find table
            table_match = re.search(r'\n(\|.*?\n)(.*?)(?=\n\n|$)', section_content, re.DOTALL)
            if table_match:
                table_content = table_match.group(2)
                rows = [line.strip() for line in table_content.split('\n') if line.strip().startswith('|')]

                for row in rows:
                    cells = [cell.strip() for cell in row.split('|')]
                    if len(cells) >= 4 and not cells[1].startswith('-'):
                        transition = {
                            "current_state": cells[1],
                            "operation": cells[2],
                            "target_state": cells[3],
                            "allowed": '✅' in cells[4] if len(cells) > 4 else False,
                            "test_result": cells[5] if len(cells) > 5 else "",
                            "notes": cells[6] if len(cells) > 6 else ""
                        }
                        transitions.append(transition)

        return transitions

    def _extract_data_validations(self) -> Dict[str, List[Dict[str, Any]]]:
        """Extract data validation sections (BOM, inventory, timestamps)"""
        validations = {
            "bom_deduction": [],
            "inventory_logs": [],
            "order_data": []
        }

        # Find data validation section
        validation_match = re.search(r'## 📊 数据验证检查清单(.*?)(?=##|$)', self.content, re.DOTALL)
        if validation_match:
            section_content = validation_match.group(1)

            # Extract BOM deduction table
            bom_match = re.search(r'### BOM库存扣减详细验证(.*?)(?=###|$)', section_content, re.DOTALL)
            if bom_match:
                validations["bom_deduction"] = self._parse_validation_table(bom_match.group(1))

            # Extract inventory logs table
            log_match = re.search(r'### 库存调整日志验证(.*?)(?=###|$)', section_content, re.DOTALL)
            if log_match:
                validations["inventory_logs"] = self._parse_validation_table(log_match.group(1))

            # Extract order data table
            order_match = re.search(r'### 订单时间戳验证(.*?)(?=###|$)', section_content, re.DOTALL)
            if order_match:
                validations["order_data"] = self._parse_validation_table(order_match.group(1))

        return validations

    def _parse_validation_table(self, content: str) -> List[Dict[str, Any]]:
        """Parse a validation table into list of dicts"""
        items = []
        table_match = re.search(r'\n(\|.*?\n)(.*?)(?=\n\n|```|$)', content, re.DOTALL)
        if table_match:
            table_content = table_match.group(2)
            rows = [line.strip() for line in table_content.split('\n') if line.strip().startswith('|')]

            for row in rows:
                cells = [cell.strip() for cell in row.split('|')]
                if len(cells) >= 3 and not cells[1].startswith('-'):
                    item = {cell: value for cell, value in enumerate(cells) if cell > 0 and value}
                    items.append(item)

        return items


def main():
    parser = argparse.ArgumentParser(description='Parse test case document')
    parser.add_argument('input', help='Path to test case Markdown file')
    parser.add_argument('--output', '-o', default='test-cases.json', help='Output JSON file')

    args = parser.parse_args()

    # Read input file
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: File not found: {args.input}")
        return 1

    content = input_path.read_text(encoding='utf-8')

    # Parse document
    parser = TestCaseParser(content)
    result = parser.parse()

    # Write output
    output_path = Path(args.output)
    output_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')

    print(f"✅ Parsed {len(result['test_cases'])} test cases")
    print(f"✅ Output written to: {args.output}")

    return 0


if __name__ == '__main__':
    exit(main())
