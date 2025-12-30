#!/usr/bin/env python3
"""
@spec T002-e2e-test-generator
自动生成测试数据模块脚本

扫描指定模块的所有 YAML 场景文件，提取 testdata_ref 引用，
自动生成完整的 TypeScript 测试数据模块。

Usage:
    python generate_testdata.py <module_name>

Example:
    python generate_testdata.py inventory
"""

import sys
import os
import re
import yaml
from pathlib import Path
from typing import Dict, List, Set, Any
from collections import defaultdict

class TestDataGenerator:
    def __init__(self, module_name: str, project_root: Path):
        self.module_name = module_name
        self.project_root = project_root
        self.scenarios_dir = project_root / 'scenarios' / module_name
        self.output_file = project_root / 'frontend' / 'src' / 'testdata' / f'{module_name}.ts'

        # 存储提取的测试数据引用
        self.testdata_refs: Set[str] = set()
        self.data_by_dataset: Dict[str, Set[str]] = defaultdict(set)
        self.scenarios: List[Dict[str, Any]] = []

    def scan_yaml_files(self) -> None:
        """扫描所有 YAML 文件，提取 testdata_ref"""
        print(f"🔍 扫描 {self.scenarios_dir} 目录...")

        yaml_files = list(self.scenarios_dir.glob('*.yaml'))
        print(f"📁 找到 {len(yaml_files)} 个场景文件")

        for yaml_file in yaml_files:
            print(f"  ├─ 解析 {yaml_file.name}")
            try:
                with open(yaml_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                # 提取所有 testdata_ref
                refs = re.findall(r'testdata_ref:\s*(\S+)', content)
                for ref in refs:
                    self.testdata_refs.add(ref)

                    # 解析 dataset.key 格式
                    if '.' in ref:
                        dataset, key = ref.split('.', 1)
                        self.data_by_dataset[dataset].add(key)

                # 解析 YAML 获取场景信息
                scenario = yaml.safe_load(content)
                if scenario:
                    self.scenarios.append(scenario)

            except Exception as e:
                print(f"  ⚠️  解析失败: {e}")

        print(f"\n✅ 提取到 {len(self.testdata_refs)} 个唯一的测试数据引用")
        print(f"📊 数据集分布: {dict(self.data_by_dataset)}")

    def infer_data_type(self, key: str) -> str:
        """根据 key 名称推断数据类型和结构"""
        key_lower = key.lower()

        # 用户凭证
        if '_user' in key_lower or key_lower.startswith('user_'):
            return 'user_credentials'

        # 配置数据
        if '_config' in key_lower or key_lower.endswith('_config'):
            return 'config'

        # 商品/SKU
        if 'product' in key_lower or 'sku' in key_lower:
            return 'product'

        # 订单
        if 'order' in key_lower:
            return 'order'

        # 页面路径
        if '_page' in key_lower or key_lower.endswith('_page'):
            return 'page_path'

        # 选择器/按钮
        if '_btn' in key_lower or '_selector' in key_lower:
            return 'selector'

        # 事务/交易
        if 'transaction' in key_lower:
            return 'transaction'

        # 库存相关
        if 'inventory' in key_lower or 'stock' in key_lower:
            return 'inventory'

        # 门店
        if 'store' in key_lower:
            return 'store'

        # 支付
        if 'payment' in key_lower or 'pay' in key_lower:
            return 'payment'

        # 场景数据集
        if key_lower.startswith('scenario_'):
            return 'scenario'

        # 默认
        return 'generic'

    def generate_data_template(self, key: str, data_type: str) -> str:
        """根据数据类型生成模板"""

        templates = {
            'user_credentials': """{{
  username: '{key}',
  password: 'test123',
  email: '{key}@example.com',
  role: '{role}',
}}""",
            'config': """{{
  // TODO: Add configuration fields for {key}
  enabled: true,
}}""",
            'product': """{{
  id: '550e8400-e29b-41d4-a716-{random_uuid}',
  code: '690123456{random_num}',
  name: '{name}',
  category: '分类',
  price: 35.00,
  unit: '个',
}}""",
            'order': """{{
  // TODO: Add order data for {key}
  items: [],
  totalAmount: 0,
}}""",
            'page_path': """'/path/to/{key}'""",
            'selector': """'[data-testid="{key}"]'""",
            'transaction': """{{
  transactionType: 'deduct',
  amount: 0,
  // TODO: Add transaction fields
}}""",
            'inventory': """{{
  skuId: '550e8400-e29b-41d4-a716-{random_uuid}',
  quantity: 100,
  unit: 'ml',
}}""",
            'store': """{{
  id: 'store-{random_id}',
  name: '门店 {key}',
  code: 'STORE-{random_num}',
}}""",
            'payment': """{{
  method: 'wechat',
  amount: 0,
  // TODO: Add payment fields
}}""",
            'scenario': """{{
  baseUrl: 'http://localhost:3000',
  // TODO: Add scenario-specific data for {key}
}}""",
            'generic': """{{
  // TODO: Define structure for {key}
}}""",
        }

        template = templates.get(data_type, templates['generic'])

        # 替换占位符
        import random
        random_uuid = f"{random.randint(100000, 999999)}"
        random_num = f"{random.randint(1000, 9999)}"
        random_id = f"{random.randint(1, 999):03d}"

        role = 'user'
        if 'admin' in key.lower():
            role = 'admin'
        elif 'manager' in key.lower():
            role = 'manager'
        elif 'approver' in key.lower():
            role = 'approver'
        elif 'clerk' in key.lower():
            role = 'clerk'
        elif 'warehouse' in key.lower():
            role = 'warehouse_manager'

        name = key.replace('_', ' ').title()

        return template.format(
            key=key,
            role=role,
            random_uuid=random_uuid,
            random_num=random_num,
            random_id=random_id,
            name=name
        )

    def generate_typescript_module(self) -> str:
        """生成完整的 TypeScript 测试数据模块"""
        lines = []

        # 文件头部
        lines.append("/**")
        lines.append(f" * @spec T002-e2e-test-generator")
        lines.append(f" * E2E 测试数据 - {self.module_name.upper()} 模块")
        lines.append(" *")
        lines.append(f" * 自动生成于: 由 generate_testdata.py 脚本生成")
        lines.append(f" * 场景文件数: {len(self.scenarios)}")
        lines.append(f" * 测试数据引用数: {len(self.testdata_refs)}")
        lines.append(" */")
        lines.append("")

        # 按数据集分组生成
        for dataset, keys in sorted(self.data_by_dataset.items()):
            lines.append(f"// ==================== {dataset} ====================")
            lines.append("")

            for key in sorted(keys):
                data_type = self.infer_data_type(key)

                # 生成变量名和注释
                lines.append(f"/**")
                lines.append(f" * {key.replace('_', ' ').title()}")
                lines.append(f" * Type: {data_type}")
                lines.append(f" */")
                lines.append(f"export const {key} = {self.generate_data_template(key, data_type)};")
                lines.append("")

        # 生成场景数据集
        lines.append("// ==================== 场景数据集 ====================")
        lines.append("")

        for scenario in self.scenarios:
            scenario_id = scenario.get('scenario_id', '').replace('E2E-', '').replace('-', '_').lower()
            scenario_title = scenario.get('title', 'Unknown')

            lines.append(f"/**")
            lines.append(f" * {scenario.get('scenario_id')}: {scenario_title}")
            lines.append(f" */")
            lines.append(f"export const scenario_{scenario_id.split('_')[-1] if '_' in scenario_id else '001'} = {{")
            lines.append(f"  baseUrl: 'http://localhost:3000',")
            lines.append(f"  // TODO: Add specific data for {scenario.get('scenario_id')}")
            lines.append(f"}};")
            lines.append("")

        # 生成默认导出
        lines.append("// ==================== 导出默认数据集 ====================")
        lines.append("")
        lines.append(f"export const {self.module_name}TestData = {{")

        for dataset, keys in sorted(self.data_by_dataset.items()):
            for key in sorted(keys):
                lines.append(f"  {key},")

        for scenario in self.scenarios:
            scenario_id = scenario.get('scenario_id', '').replace('E2E-', '').replace('-', '_').lower()
            scenario_num = scenario_id.split('_')[-1] if '_' in scenario_id else '001'
            lines.append(f"  scenario_{scenario_num},")

        lines.append("};")
        lines.append("")
        lines.append(f"export default {self.module_name}TestData;")

        return '\n'.join(lines)

    def write_output(self, content: str) -> None:
        """写入生成的文件"""
        self.output_file.parent.mkdir(parents=True, exist_ok=True)

        with open(self.output_file, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"\n✅ 测试数据模块已生成: {self.output_file}")
        print(f"📊 文件大小: {len(content)} 字节")

    def run(self) -> None:
        """执行生成流程"""
        print(f"🚀 开始生成 {self.module_name} 模块的测试数据...\n")

        # 1. 扫描 YAML 文件
        self.scan_yaml_files()

        # 2. 生成 TypeScript 模块
        print(f"\n📝 生成 TypeScript 测试数据模块...")
        content = self.generate_typescript_module()

        # 3. 写入文件
        self.write_output(content)

        print(f"\n✨ 完成! 请检查生成的文件并补充 TODO 部分的数据")
        print(f"💡 提示: 某些字段需要根据实际业务逻辑手动填充")

def main():
    if len(sys.argv) < 2:
        print("Usage: python generate_testdata.py <module_name>")
        print("Example: python generate_testdata.py inventory")
        sys.exit(1)

    module_name = sys.argv[1]

    # 获取项目根目录
    script_path = Path(__file__).resolve()
    project_root = script_path.parent.parent.parent.parent.parent

    print(f"📂 项目根目录: {project_root}")

    generator = TestDataGenerator(module_name, project_root)
    generator.run()

if __name__ == '__main__':
    main()
