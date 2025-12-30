# @spec T001-e2e-orchestrator
"""
报告生成模块。

负责生成 summary.json、提取 Playwright 统计信息、
创建报告符号链接。
"""

import json
import re
import os
from typing import Dict, Any, Optional
from pathlib import Path
from datetime import datetime

from .utils import ensure_directory


class ReportGenerator:
    """测试报告生成器。"""

    def __init__(self, output_dir: str, run_id: str):
        """
        初始化报告生成器。

        Args:
            output_dir: 报告输出目录（例如 test-results/run-{run_id}）
            run_id: 运行 ID
        """
        self.output_dir = Path(output_dir)
        self.run_id = run_id
        self.summary_file = self.output_dir / 'summary.json'
        self.config_snapshot_file = self.output_dir / 'config.json'

        # 确保输出目录存在
        ensure_directory(str(self.output_dir))

    def extract_playwright_stats(self, output: str) -> Dict[str, Any]:
        """
        从 Playwright CLI 输出提取统计信息。

        Args:
            output: Playwright 命令的标准输出

        Returns:
            Dict 包含测试统计信息:
                - total (int): 总测试数
                - passed (int): 通过数
                - failed (int): 失败数
                - skipped (int): 跳过数
                - flaky (int): 不稳定测试数
                - retries (Dict): 重试统计
        """
        stats = {
            'total': 0,
            'passed': 0,
            'failed': 0,
            'skipped': 0,
            'flaky': 0,
            'retries': {
                'total_retry_attempts': 0,
                'scenarios_retried': 0
            }
        }

        # 解析 Playwright 输出（示例格式）:
        # "15 passed (1.2s)"
        # "2 failed, 13 passed (1.5s)"
        # "1 flaky, 14 passed (2.0s)"
        # "3 skipped, 12 passed (1.0s)"

        # 提取 passed
        passed_match = re.search(r'(\d+)\s+passed', output)
        if passed_match:
            stats['passed'] = int(passed_match.group(1))

        # 提取 failed
        failed_match = re.search(r'(\d+)\s+failed', output)
        if failed_match:
            stats['failed'] = int(failed_match.group(1))

        # 提取 skipped
        skipped_match = re.search(r'(\d+)\s+skipped', output)
        if skipped_match:
            stats['skipped'] = int(skipped_match.group(1))

        # 提取 flaky
        flaky_match = re.search(r'(\d+)\s+flaky', output)
        if flaky_match:
            stats['flaky'] = int(flaky_match.group(1))

        # 计算总数
        stats['total'] = (
            stats['passed'] +
            stats['failed'] +
            stats['skipped'] +
            stats['flaky']
        )

        # 提取重试信息（如果有）
        # 示例: "2 retries" 或 "5 retry attempts"
        retry_match = re.search(r'(\d+)\s+retr(?:y|ies)', output)
        if retry_match:
            stats['retries']['total_retry_attempts'] = int(retry_match.group(1))
            # 估算重试的场景数（假设每个失败场景最多重试 3 次）
            stats['retries']['scenarios_retried'] = min(
                stats['retries']['total_retry_attempts'],
                stats['failed']
            )

        return stats

    def generate_summary(
        self,
        playwright_output: str,
        execution_start: datetime,
        execution_end: datetime,
        config: Dict[str, Any],
        selected_scenarios: list
    ) -> None:
        """
        生成 summary.json 文件。

        Args:
            playwright_output: Playwright CLI 标准输出
            execution_start: 执行开始时间
            execution_end: 执行结束时间
            config: 运行配置
            selected_scenarios: 已选择的场景列表
        """
        stats = self.extract_playwright_stats(playwright_output)
        duration_seconds = (execution_end - execution_start).total_seconds()

        summary = {
            'run_id': self.run_id,
            'execution_timestamp': execution_start.isoformat(),
            'execution_end_timestamp': execution_end.isoformat(),
            'duration_seconds': round(duration_seconds, 2),
            'environment': config.get('environment', 'dev'),
            'base_urls': config.get('base_urls', {}),
            'workers': config.get('workers', 1),
            'retries': config.get('retries', 0),
            'timeout': config.get('timeout', 30000),
            'summary': {
                'total': stats['total'],
                'passed': stats['passed'],
                'failed': stats['failed'],
                'skipped': stats['skipped'],
                'flaky': stats['flaky'],
                'retries': stats['retries']
            },
            'selected_scenarios': [
                {
                    'scenario_id': s.get('scenario_id', ''),
                    'title': s.get('title', ''),
                    'tags': s.get('tags', {})
                }
                for s in selected_scenarios
            ],
            'artifacts': {
                'html_report': 'index.html',
                'trace_files': f"trace-*.zip ({stats['failed']} files)" if stats['failed'] > 0 else 'none',
                'videos': f"{stats['failed']} videos" if stats['failed'] > 0 else 'none',
                'screenshots': f"{stats['failed']} screenshots" if stats['failed'] > 0 else 'none'
            }
        }

        # 写入 summary.json
        with open(self.summary_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)

        print(f"📊 生成测试摘要: {self.summary_file}")

    def save_config_snapshot(self, config: Dict[str, Any]) -> None:
        """
        保存运行配置快照。

        Args:
            config: RunConfig 转换为 Dict
        """
        with open(self.config_snapshot_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)

        print(f"💾 保存配置快照: {self.config_snapshot_file}")

    def create_latest_symlink(self) -> None:
        """
        创建 test-results/latest 符号链接指向当前运行目录。

        这样用户可以通过 test-results/latest/index.html 快速访问最新报告。
        """
        test_results_dir = self.output_dir.parent
        latest_link = test_results_dir / 'latest'

        # 删除已存在的符号链接
        if latest_link.exists() or latest_link.is_symlink():
            latest_link.unlink()

        # 创建新符号链接
        try:
            # 使用相对路径创建符号链接
            relative_path = os.path.relpath(self.output_dir, test_results_dir)
            os.symlink(relative_path, latest_link)
            print(f"🔗 创建符号链接: {latest_link} -> {self.output_dir.name}")
        except Exception as e:
            print(f"⚠️  创建符号链接失败: {e}")

    def generate_text_summary(self, summary_data: Dict[str, Any]) -> str:
        """
        生成文本格式的摘要报告（用于控制台输出）。

        Args:
            summary_data: summary.json 的内容

        Returns:
            str: 格式化的文本摘要
        """
        summary = summary_data['summary']
        total = summary['total']
        passed = summary['passed']
        failed = summary['failed']
        skipped = summary['skipped']
        flaky = summary['flaky']
        duration = summary_data['duration_seconds']

        # 计算成功率
        pass_rate = (passed / total * 100) if total > 0 else 0

        # 构建文本摘要
        lines = [
            "\n" + "=" * 60,
            f"🎯 E2E 测试执行摘要 - Run ID: {summary_data['run_id']}",
            "=" * 60,
            f"⏱️  执行时长: {duration:.2f} 秒",
            f"🌍 测试环境: {summary_data['environment']}",
            f"👷 并发数: {summary_data['workers']} workers",
            "",
            "📊 测试结果:",
            f"   总计: {total} 个场景",
            f"   ✅ 通过: {passed} ({pass_rate:.1f}%)",
            f"   ❌ 失败: {failed}",
            f"   ⏭️  跳过: {skipped}",
        ]

        if flaky > 0:
            lines.append(f"   ⚠️  不稳定: {flaky}")

        if summary['retries']['total_retry_attempts'] > 0:
            lines.extend([
                "",
                "🔄 重试统计:",
                f"   总重试次数: {summary['retries']['total_retry_attempts']}",
                f"   重试场景数: {summary['retries']['scenarios_retried']}"
            ])

        lines.extend([
            "",
            "📁 报告文件:",
            f"   HTML 报告: {self.output_dir / 'index.html'}",
            f"   JSON 摘要: {self.summary_file}",
            f"   快速访问: test-results/latest/index.html",
            "=" * 60
        ])

        return "\n".join(lines)

    def finalize_report(
        self,
        playwright_output: str,
        execution_start: datetime,
        execution_end: datetime,
        config: Dict[str, Any],
        selected_scenarios: list
    ) -> None:
        """
        完成报告生成的所有步骤（便捷方法）。

        Args:
            playwright_output: Playwright CLI 输出
            execution_start: 开始时间
            execution_end: 结束时间
            config: 运行配置
            selected_scenarios: 选中的场景列表
        """
        # 1. 生成 summary.json
        self.generate_summary(
            playwright_output,
            execution_start,
            execution_end,
            config,
            selected_scenarios
        )

        # 2. 保存配置快照
        self.save_config_snapshot(config)

        # 3. 创建 latest 符号链接
        self.create_latest_symlink()

        # 4. 输出文本摘要
        with open(self.summary_file, 'r', encoding='utf-8') as f:
            summary_data = json.load(f)

        text_summary = self.generate_text_summary(summary_data)
        print(text_summary)
