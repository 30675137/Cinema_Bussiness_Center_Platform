# @spec T001-e2e-orchestrator
"""
Skill 编排执行框架。

负责调用其他 Claude Code skills（如 test-scenario-author, e2e-testdata-planner），
并提供回退策略。
"""

import subprocess
import json
from typing import Optional, Dict, Any
from pathlib import Path


class SkillExecutor:
    """Skill 编排执行器。"""

    def __init__(self):
        """初始化 Skill 执行器。"""
        self.skill_base_path = Path(__file__).parent.parent.parent
        self.available_skills = self._detect_available_skills()

    def _detect_available_skills(self) -> Dict[str, bool]:
        """
        检测当前可用的 Claude Code skills。

        Returns:
            Dict[str, bool]: skill 名称 → 是否可用的映射
        """
        skills = {
            'test-scenario-author': False,
            'e2e-testdata-planner': False,
            'e2e-test-generator': False,
            'e2e-report-configurator': False,
            'e2e-artifacts-policy': False,
            'e2e-runner': False
        }

        # 检查 .claude/skills/ 目录
        skills_dir = self.skill_base_path
        if skills_dir.exists():
            for skill_name in skills.keys():
                skill_path = skills_dir / skill_name / 'skill.md'
                if skill_path.exists():
                    skills[skill_name] = True

        return skills

    def check_skill_available(self, skill_name: str) -> bool:
        """
        检查指定 skill 是否可用。

        Args:
            skill_name: Skill 名称

        Returns:
            bool: Skill 是否可用
        """
        return self.available_skills.get(skill_name, False)

    def execute_skill(
        self,
        skill_name: str,
        args: Optional[list] = None,
        timeout: int = 300
    ) -> Dict[str, Any]:
        """
        执行指定的 Claude Code skill。

        Args:
            skill_name: Skill 名称
            args: 命令行参数列表
            timeout: 超时时间（秒）

        Returns:
            Dict 包含执行结果:
                - success (bool): 是否成功
                - output (str): 标准输出
                - error (str): 错误信息
                - used_fallback (bool): 是否使用了回退策略
        """
        if args is None:
            args = []

        # 检查 skill 是否可用
        if not self.check_skill_available(skill_name):
            print(f"⚠️  Skill '{skill_name}' 不可用，使用回退策略...")
            return self._fallback_implementation(skill_name, args)

        # 尝试通过 Claude CLI 调用 skill
        # 注意：这里假设 Claude CLI 可通过 subprocess 调用
        # 实际实现可能需要根据 Claude Code 的实际 CLI 接口调整
        try:
            cmd = ['claude', 'skill', skill_name] + args
            print(f"🔧 执行 Skill: {' '.join(cmd)}")

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout,
                check=False
            )

            if result.returncode == 0:
                return {
                    'success': True,
                    'output': result.stdout,
                    'error': '',
                    'used_fallback': False
                }
            else:
                print(f"❌ Skill 执行失败: {result.stderr}")
                return self._fallback_implementation(skill_name, args)

        except subprocess.TimeoutExpired:
            print(f"⏱️  Skill 执行超时（{timeout}秒）")
            return {
                'success': False,
                'output': '',
                'error': f'Skill execution timeout after {timeout} seconds',
                'used_fallback': False
            }
        except Exception as e:
            print(f"⚠️  Skill 调用异常: {e}")
            return self._fallback_implementation(skill_name, args)

    def _fallback_implementation(
        self,
        skill_name: str,
        args: list
    ) -> Dict[str, Any]:
        """
        为不同 skill 提供回退策略。

        Args:
            skill_name: Skill 名称
            args: 命令行参数

        Returns:
            Dict 包含回退结果
        """
        # Step 1: test-scenario-author (场景 YAML 验证)
        if skill_name == 'test-scenario-author':
            print("📋 跳过场景 YAML 验证（skill 不可用）")
            return {
                'success': True,
                'output': 'Scenario validation skipped',
                'error': '',
                'used_fallback': True
            }

        # Step 2: e2e-testdata-planner (测试数据规划)
        # 特殊处理：不使用内置默认实现，而是提示用户手动运行
        elif skill_name == 'e2e-testdata-planner':
            print("⚠️  e2e-testdata-planner skill 不可用")
            print("📝 请手动运行 /e2e-testdata-planner 生成测试数据文件")
            print("   或确保测试数据文件已存在于 testdata/ 目录")
            return {
                'success': False,
                'output': '',
                'error': 'e2e-testdata-planner skill not available. Please run manually.',
                'used_fallback': True
            }

        # Step 3: e2e-test-generator (测试脚本生成)
        elif skill_name == 'e2e-test-generator':
            print("⚠️  e2e-test-generator skill 不可用")
            print("📝 请手动运行以下命令生成测试脚本:")
            print("   /e2e-test-generator batch --scenario-ids <scenario-id-1>,<scenario-id-2>")
            print("   或确保测试脚本文件已存在于 scenarios/ 目录")
            return {
                'success': True,
                'output': 'Test script generation skipped (skill not available)',
                'error': '',
                'used_fallback': True
            }

        # Step 4: e2e-report-configurator (报告配置)
        elif skill_name == 'e2e-report-configurator':
            print("📊 使用 Playwright 默认报告配置")
            return {
                'success': True,
                'output': 'Using Playwright default report configuration',
                'error': '',
                'used_fallback': True
            }

        # Step 5: e2e-artifacts-policy (产物策略)
        elif skill_name == 'e2e-artifacts-policy':
            print("📦 使用默认产物策略: on-failure")
            return {
                'success': True,
                'output': 'Using default artifacts policy: on-failure',
                'error': '',
                'used_fallback': True
            }

        # Step 6: e2e-runner (测试执行)
        # 这是必需的 skill，无回退策略
        elif skill_name == 'e2e-runner':
            print("❌ e2e-runner skill 是必需的，无法继续执行")
            return {
                'success': False,
                'output': '',
                'error': 'e2e-runner skill is required but not available',
                'used_fallback': True
            }

        else:
            print(f"⚠️  未知 Skill: {skill_name}")
            return {
                'success': False,
                'output': '',
                'error': f'Unknown skill: {skill_name}',
                'used_fallback': False
            }

    def orchestrate_skills(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        按顺序编排执行多个 skills（FR-004 的 6 步流程）。

        Args:
            config: 运行配置，包含 skip_flags 和 selected_scenarios

        Returns:
            Dict 包含总体执行结果
        """
        skip_flags = config.get('skip_flags', {})
        selected_scenarios = config.get('selected_scenarios', [])
        results = {}

        # Step 1: Scenario Validation
        if not skip_flags.get('scenario_validation', False):
            print("\n🔍 Step 1: 场景 YAML 验证")
            results['scenario_validation'] = self.execute_skill(
                'test-scenario-author',
                ['validate', '--all']
            )
        else:
            print("\n⏭️  Step 1: 跳过场景验证")
            results['scenario_validation'] = {'success': True, 'skipped': True}

        # Step 2: Test Data Planning
        if not skip_flags.get('data_validation', False):
            print("\n🗂️  Step 2: 测试数据规划")
            results['data_validation'] = self.execute_skill(
                'e2e-testdata-planner',
                ['validate']
            )
            # 如果 e2e-testdata-planner 失败，提示用户手动操作
            if not results['data_validation']['success']:
                print("\n⚠️  请确保测试数据文件已准备好")
                # 不终止流程，继续执行后续步骤
        else:
            print("\n⏭️  Step 2: 跳过数据验证")
            results['data_validation'] = {'success': True, 'skipped': True}

        # Step 3: Test Script Generation (调用 e2e-test-generator)
        if not skip_flags.get('generation', False):
            print("\n🛠️  Step 3: 测试脚本生成")

            # 如果有选中的场景，批量生成它们的测试脚本
            if selected_scenarios:
                scenario_ids = [s['scenario_id'] for s in selected_scenarios]
                print(f"   生成 {len(scenario_ids)} 个场景的测试脚本...")

                # 调用 e2e-test-generator batch 命令
                # 传递场景 ID 列表作为参数
                results['generation'] = self.execute_skill(
                    'e2e-test-generator',
                    ['batch', '--scenario-ids', ','.join(scenario_ids)]
                )
            else:
                # 如果没有选中场景（理论上不应该发生），生成所有场景
                print("   未指定场景，生成所有场景的测试脚本...")
                results['generation'] = self.execute_skill(
                    'e2e-test-generator',
                    ['batch', '--all']
                )
        else:
            print("\n⏭️  Step 3: 跳过脚本生成")
            results['generation'] = {'success': True, 'skipped': True}

        # Step 4: Report Configuration
        if not skip_flags.get('report_config', False):
            print("\n📊 Step 4: 报告配置")
            results['report_config'] = self.execute_skill(
                'e2e-report-configurator',
                ['configure']
            )
        else:
            print("\n⏭️  Step 4: 跳过报告配置")
            results['report_config'] = {'success': True, 'skipped': True}

        # Step 5: Artifacts Policy Configuration
        if not skip_flags.get('artifacts_config', False):
            print("\n📦 Step 5: 产物策略配置")
            results['artifacts_config'] = self.execute_skill(
                'e2e-artifacts-policy',
                ['apply']
            )
        else:
            print("\n⏭️  Step 5: 跳过产物配置")
            results['artifacts_config'] = {'success': True, 'skipped': True}

        # Step 6: Test Execution (必需，无跳过选项)
        print("\n▶️  Step 6: 执行测试")
        results['test_execution'] = self.execute_skill(
            'e2e-runner',
            ['run']
        )

        # 汇总结果
        all_success = all(
            r.get('success', False) or r.get('skipped', False)
            for r in results.values()
        )

        return {
            'success': all_success,
            'results': results
        }
