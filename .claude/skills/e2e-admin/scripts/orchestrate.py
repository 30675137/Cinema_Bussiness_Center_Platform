#!/usr/bin/env python3
# @spec T001-e2e-orchestrator
"""
E2E 测试编排器主入口。

提供 CLI 命令行接口，协调场景选择、配置组装、服务管理、
Skill 编排和测试执行。
"""

import argparse
import sys
import subprocess
from typing import List, Optional
from pathlib import Path
from datetime import datetime

try:
    from .scenario_filter import load_scenarios, filter_by_tags, detect_required_systems
    from .config_assembler import RunConfig, assemble_config_from_args, validate_config
    from .service_manager import ServiceManager
    from .skill_executor import SkillExecutor
    from .report_generator import ReportGenerator
    from .utils import generate_run_id
except ImportError:
    # 绝对导入（当作为脚本直接运行时）
    from scenario_filter import load_scenarios, filter_by_tags, detect_required_systems
    from config_assembler import RunConfig, assemble_config_from_args, validate_config
    from service_manager import ServiceManager
    from skill_executor import SkillExecutor
    from report_generator import ReportGenerator
    from utils import generate_run_id


def parse_arguments() -> argparse.Namespace:
    """
    解析命令行参数。

    Returns:
        argparse.Namespace: 解析后的参数
    """
    parser = argparse.ArgumentParser(
        description='E2E 测试编排器 - 按标签选择场景、自动启动服务、执行测试并生成报告',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 按模块标签筛选
  /e2e-admin --tags "module:inventory"

  # 组合标签（AND 逻辑）
  /e2e-admin --tags "module:inventory AND priority:p1"

  # 指定环境
  /e2e-admin --tags "module:order" --env staging

  # 配置并发和重试
  /e2e-admin --tags "priority:p1" --workers 4 --retries 2

  # 跳过某些步骤
  /e2e-admin --tags "module:inventory" --skip-scenario-validation --skip-generation
        """
    )

    # 必需参数
    parser.add_argument(
        '--tags',
        type=str,
        help='标签过滤表达式（支持 AND/OR 逻辑）。示例: "module:inventory", "module:inventory AND priority:p1"'
    )

    parser.add_argument(
        '--scenario-ids',
        type=str,
        help='显式指定场景 ID 列表（逗号分隔）。示例: "E2E-INVENTORY-001,E2E-ORDER-002"'
    )

    # 环境配置
    parser.add_argument(
        '--env',
        type=str,
        choices=['dev', 'staging', 'prod'],
        default='dev',
        help='目标测试环境（默认: dev）'
    )

    # 执行参数
    parser.add_argument(
        '--workers',
        type=int,
        help='并行执行的 worker 数量（1-10，默认: 1）'
    )

    parser.add_argument(
        '--retries',
        type=int,
        help='失败测试的重试次数（0-3，默认: 0）'
    )

    parser.add_argument(
        '--timeout',
        type=int,
        help='单个测试的超时时间（毫秒，默认: 30000）'
    )

    # 跳过标志
    parser.add_argument(
        '--skip-scenario-validation',
        action='store_true',
        help='跳过场景 YAML 验证（Step 1）'
    )

    parser.add_argument(
        '--skip-data-validation',
        action='store_true',
        help='跳过测试数据验证（Step 2）'
    )

    parser.add_argument(
        '--skip-generation',
        action='store_true',
        help='跳过测试脚本生成（Step 3）'
    )

    parser.add_argument(
        '--skip-report-config',
        action='store_true',
        help='跳过报告配置（Step 4）'
    )

    parser.add_argument(
        '--skip-artifacts-config',
        action='store_true',
        help='跳过产物策略配置（Step 5）'
    )

    parser.add_argument(
        '--skip-service-management',
        action='store_true',
        help='跳过开发服务器自动启动（假设服务已手动启动）'
    )

    # 调试选项
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='仅显示将要执行的操作，不实际运行测试'
    )

    parser.add_argument(
        '--verbose',
        action='store_true',
        help='显示详细日志'
    )

    args = parser.parse_args()

    # 验证至少提供一种场景选择方式
    if not args.tags and not args.scenario_ids:
        parser.error('必须提供 --tags 或 --scenario-ids 参数')

    return args


def display_scenario_selection(scenarios: list, tag_expression: Optional[str]) -> None:
    """
    显示选中的场景列表。

    Args:
        scenarios: 选中的场景列表
        tag_expression: 标签过滤表达式（可选）
    """
    print("\n" + "=" * 60)
    print("📋 场景选择结果")
    print("=" * 60)

    if tag_expression:
        print(f"🏷️  标签过滤: {tag_expression}")

    print(f"✅ 匹配场景数: {len(scenarios)}")
    print()

    if len(scenarios) == 0:
        print("⚠️  未找到匹配的场景")
        return

    # 显示前 10 个场景
    preview_count = min(10, len(scenarios))
    print(f"场景预览（前 {preview_count} 个）:")
    print()

    for i, scenario in enumerate(scenarios[:preview_count], 1):
        tags_str = ', '.join([
            f"{k}:{','.join(v) if isinstance(v, list) else v}"
            for k, v in scenario.tags.items()
        ])
        print(f"  {i}. {scenario.scenario_id}")
        print(f"     {scenario.title}")
        print(f"     [{tags_str}]")
        print()

    if len(scenarios) > preview_count:
        print(f"  ... 还有 {len(scenarios) - preview_count} 个场景")
        print()

    print("=" * 60)


def execute_playwright_tests(
    config: RunConfig,
    scenarios_dir: str = "scenarios"
) -> subprocess.CompletedProcess:
    """
    执行 Playwright 测试。

    Args:
        config: 运行配置
        scenarios_dir: 场景目录路径

    Returns:
        subprocess.CompletedProcess: Playwright 执行结果
    """
    # 构建 Playwright CLI 命令
    cmd = [
        'npx', 'playwright', 'test',
        f'--project={config.project}',
        f'--output={config.output_dir}'
    ]

    # 添加 workers 参数
    if config.workers > 1:
        cmd.append(f'--workers={config.workers}')

    # 添加 retries 参数
    if config.retries > 0:
        cmd.append(f'--retries={config.retries}')

    # 添加 timeout 参数
    cmd.append(f'--timeout={config.timeout}')

    # 指定测试文件路径（使用 glob 模式匹配 .spec.ts 文件）
    test_pattern = f"{scenarios_dir}/**/*.spec.ts"
    cmd.append(test_pattern)

    print(f"\n▶️  执行命令: {' '.join(cmd)}\n")

    # 执行测试
    result = subprocess.run(
        cmd,
        capture_output=True,
        text=True,
        check=False
    )

    return result


def main() -> int:
    """
    主入口函数。

    Returns:
        int: 退出码（0 = 成功，非 0 = 失败）
    """
    try:
        # 1. 解析命令行参数
        args = parse_arguments()

        print("\n🚀 E2E 测试编排器启动")
        print(f"📅 时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        # 2. 加载场景
        print("\n🔍 加载场景文件...")
        scenarios_dir = Path.cwd() / "scenarios"

        if not scenarios_dir.exists():
            print(f"❌ 场景目录不存在: {scenarios_dir}")
            print(f"   请确保在项目根目录运行此命令")
            return 1

        all_scenarios = load_scenarios(str(scenarios_dir))
        print(f"✅ 加载了 {len(all_scenarios)} 个场景")

        # 3. 场景过滤
        if args.tags:
            print(f"\n🏷️  应用标签过滤: {args.tags}")
            selected_scenarios = filter_by_tags(all_scenarios, args.tags)
        elif args.scenario_ids:
            scenario_id_list = [sid.strip() for sid in args.scenario_ids.split(',')]
            print(f"\n🎯 显式选择场景: {', '.join(scenario_id_list)}")
            selected_scenarios = [
                s for s in all_scenarios if s.scenario_id in scenario_id_list
            ]
        else:
            selected_scenarios = all_scenarios

        # 4. 显示选中的场景
        display_scenario_selection(selected_scenarios, args.tags)

        # 边缘情况处理：无匹配场景
        if len(selected_scenarios) == 0:
            print("\n⚠️  未找到匹配的场景，退出执行")
            return 0

        # 5. 组装运行配置
        print("\n⚙️  组装运行配置...")
        config = assemble_config_from_args(args)

        # 设置选中的场景
        config.selected_scenarios = [
            {
                'scenario_id': s.scenario_id,
                'title': s.title,
                'tags': s.tags
            }
            for s in selected_scenarios
        ]

        # 验证配置
        validate_config(config)

        print(f"✅ Run ID: {config.run_id}")
        print(f"   环境: {config.environment}")
        print(f"   Workers: {config.workers}")
        print(f"   Retries: {config.retries}")
        print(f"   Timeout: {config.timeout}ms")
        print(f"   输出目录: {config.output_dir}")

        # 6. 检测需要的系统（在 dry-run 前移动）
        required_systems = detect_required_systems(selected_scenarios)
        if required_systems:
            print(f"\n🖥️  检测到需要的系统: {', '.join(sorted(required_systems))}")
        else:
            print("\n⚠️  未检测到需要启动的系统（所有场景可能为纯 API 测试）")

        # Dry-run 模式
        if args.dry_run:
            print("\n🔍 [DRY RUN] 仅显示执行计划，不实际运行测试")
            if required_systems:
                print(f"\n将自动启动服务:")
                for system in sorted(required_systems):
                    service_config = config.base_urls.get(system, 'N/A')
                    print(f"  - {system}: {service_config}")
            print(f"\n将执行 {len(selected_scenarios)} 个场景:")
            for s in selected_scenarios:
                print(f"  - {s.scenario_id}: {s.title}")
            return 0

        # 7. 启动服务
        if args.skip_service_management:
            print("\n⏭️  跳过服务管理（假设服务已手动启动）")
            service_manager = None
            started_services = []
        elif required_systems:
            service_manager = ServiceManager()
            print("\n🔧 启动开发服务器...")

            started_services = []
            for system in required_systems:
                try:
                    process = service_manager.start_service(system)
                    if process:
                        started_services.append(system)
                except Exception as e:
                    print(f"❌ 启动 {system} 服务失败: {e}")
                    # 清理已启动的服务
                    service_manager.stop_all_services()
                    return 1
        else:
            print("\n⚠️  未检测到需要启动的系统（所有场景可能为纯 API 测试）")
            service_manager = None
            started_services = []

        # 8. Skill 编排（可选）
        if not all([
            args.skip_scenario_validation,
            args.skip_data_validation,
            args.skip_generation,
            args.skip_report_config,
            args.skip_artifacts_config
        ]):
            print("\n🔧 执行 Skill 编排...")
            skill_executor = SkillExecutor()
            skill_results = skill_executor.orchestrate_skills(config.to_dict())

            if not skill_results['success']:
                print("\n⚠️  Skill 编排过程中出现错误，但继续执行测试...")
                if args.verbose:
                    print(f"   详细结果: {skill_results}")

        # 9. 执行测试
        print("\n▶️  开始执行测试...")
        execution_start = datetime.now()

        try:
            result = execute_playwright_tests(config, str(scenarios_dir))
            execution_end = datetime.now()

            # 显示 Playwright 输出
            if result.stdout:
                print(result.stdout)
            if result.stderr and args.verbose:
                print(f"\n⚠️  错误输出:\n{result.stderr}")

        except Exception as e:
            print(f"\n❌ 测试执行失败: {e}")
            if service_manager:
                service_manager.stop_all_services()
            return 1

        # 10. 生成报告
        print("\n📊 生成测试报告...")
        report_generator = ReportGenerator(config.output_dir, config.run_id)

        try:
            report_generator.finalize_report(
                playwright_output=result.stdout,
                execution_start=execution_start,
                execution_end=execution_end,
                config=config.to_dict(),
                selected_scenarios=[
                    {
                        'scenario_id': s.scenario_id,
                        'title': s.title,
                        'tags': s.tags
                    }
                    for s in selected_scenarios
                ]
            )
        except Exception as e:
            print(f"⚠️  报告生成失败: {e}")

        # 11. 清理服务
        if service_manager and started_services:
            print("\n🛑 停止开发服务器...")
            service_manager.stop_all_services()

        # 12. 返回退出码
        print("\n✅ E2E 测试编排完成")
        return result.returncode

    except KeyboardInterrupt:
        print("\n\n⚠️  用户中断执行（Ctrl+C）")
        print("🧹 清理资源...")

        # 清理服务
        if 'service_manager' in locals() and service_manager:
            service_manager.stop_all_services()

        return 130  # SIGINT 退出码

    except Exception as e:
        print(f"\n❌ 执行过程中发生错误: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()

        # 清理服务
        if 'service_manager' in locals() and service_manager:
            service_manager.stop_all_services()

        return 1


if __name__ == '__main__':
    sys.exit(main())
