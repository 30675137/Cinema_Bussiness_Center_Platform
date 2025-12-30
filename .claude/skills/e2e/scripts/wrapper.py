#!/usr/bin/env python3
"""
@spec T001-e2e-orchestrator
E2E Command Center - User-invocable wrapper for E2E testing tools

This wrapper provides a unified CLI interface to all project-managed E2E skills:
- e2e-test-generator: Generate Playwright test scripts
- e2e-admin: Orchestrate complete E2E workflows
- test-scenario-author: Create and validate scenarios
- e2e-testdata-planner: Plan test data
- e2e-runner: Execute Playwright tests
"""

import sys
import subprocess
from pathlib import Path
from typing import List, Optional

# Project root directory
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.parent

# Map commands to skill scripts
COMMAND_MAP = {
    'generate': '.claude/skills/e2e-test-generator/scripts/cli.py',
    'run': '.claude/skills/e2e-runner/scripts/cli.py',
    'orchestrate': '.claude/skills/e2e-admin/scripts/orchestrate.py',
    'create-scenario': '.claude/skills/test-scenario-author/scripts/cli.py',
    'validate-scenario': '.claude/skills/test-scenario-author/scripts/cli.py',
    'testdata': '.claude/skills/e2e-testdata-planner/scripts/cli.py',
}


def print_help():
    """Print help message."""
    help_text = """
E2E Command Center - Unified E2E Testing Interface

USAGE:
    /e2e <command> [args...]

COMMANDS:
    generate <scenario-id>              Generate test script for scenario
    generate --module <name>            Generate all scripts for module

    run <scenario-id> [options]         Run Playwright test
        --ui                            Run in UI mode
        --debug                         Run in debug mode
        --cross-system                  Enable cross-system testing

    orchestrate [options]               Run complete E2E workflow
        --tags <expression>             Filter by tags (e.g., "module:inventory")
        --scenario-ids <ids>            Explicit scenario IDs (comma-separated)
        --workers <n>                   Parallel workers (1-10)
        --retries <n>                   Retry count (0-3)
        --skip-generation               Skip test script generation
        --dry-run                       Show plan without execution

    create-scenario --spec <spec-id>    Create new scenario YAML
    validate-scenario <scenario-id>     Validate scenario YAML

    testdata --scenario <id>            Plan test data for scenario

    help                                Show this help message

EXAMPLES:
    # Generate and run test
    /e2e generate E2E-INVENTORY-003
    /e2e run E2E-INVENTORY-003 --ui

    # Orchestrate full workflow
    /e2e orchestrate --tags "module:inventory" --workers 4

    # Create new scenario
    /e2e create-scenario --spec P005

For more details, see: .claude/skills/e2e/skill.md
"""
    print(help_text)


def check_skill_available(skill_script: str) -> bool:
    """Check if skill script exists."""
    script_path = PROJECT_ROOT / skill_script
    return script_path.exists()


def execute_skill(skill_script: str, args: List[str]) -> int:
    """
    Execute a project-managed skill script.

    Args:
        skill_script: Relative path to skill Python script
        args: Command-line arguments to pass to skill

    Returns:
        Exit code from skill execution
    """
    script_path = PROJECT_ROOT / skill_script

    if not check_skill_available(skill_script):
        skill_name = skill_script.split('/')[2]  # Extract skill name from path
        print(f"❌ Skill '{skill_name}' not found")
        print(f"📝 Expected location: {script_path}")
        print(f"   Please ensure the skill is installed.")
        return 1

    # Build command
    cmd = ['python3', str(script_path)] + args

    # Execute skill script
    try:
        result = subprocess.run(
            cmd,
            cwd=PROJECT_ROOT,
            check=False
        )
        return result.returncode
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user (Ctrl+C)")
        return 130
    except Exception as e:
        print(f"❌ Error executing skill: {e}")
        return 1


def parse_generate_command(args: List[str]) -> tuple[str, List[str]]:
    """
    Parse 'generate' command arguments.

    Returns:
        (skill_script, skill_args)
    """
    skill_script = COMMAND_MAP['generate']

    # Map wrapper args to e2e-test-generator args
    if not args:
        print("❌ Error: 'generate' command requires a scenario ID or --module flag")
        print("Usage: /e2e generate <scenario-id>")
        print("       /e2e generate --module <module-name>")
        return skill_script, []

    if args[0] == '--module':
        # Batch generation
        skill_args = ['batch'] + args
    else:
        # Single scenario generation
        skill_args = ['generate'] + args

    return skill_script, skill_args


def parse_run_command(args: List[str]) -> tuple[str, List[str]]:
    """Parse 'run' command arguments."""
    skill_script = COMMAND_MAP['run']

    if not args:
        print("❌ Error: 'run' command requires a scenario ID")
        print("Usage: /e2e run <scenario-id> [options]")
        return skill_script, []

    # Pass through all args to e2e-runner
    skill_args = ['run'] + args
    return skill_script, skill_args


def parse_orchestrate_command(args: List[str]) -> tuple[str, List[str]]:
    """Parse 'orchestrate' command arguments."""
    skill_script = COMMAND_MAP['orchestrate']

    # Pass through all args to e2e-admin
    skill_args = args
    return skill_script, skill_args


def parse_scenario_command(command: str, args: List[str]) -> tuple[str, List[str]]:
    """Parse scenario-related commands."""
    skill_script = COMMAND_MAP[command]

    if command == 'create-scenario':
        skill_args = ['create'] + args
    elif command == 'validate-scenario':
        if not args:
            print("❌ Error: 'validate-scenario' requires a scenario ID")
            return skill_script, []
        skill_args = ['validate'] + args
    else:
        skill_args = args

    return skill_script, skill_args


def parse_testdata_command(args: List[str]) -> tuple[str, List[str]]:
    """Parse 'testdata' command arguments."""
    skill_script = COMMAND_MAP['testdata']

    # Pass through all args to e2e-testdata-planner
    skill_args = args
    return skill_script, skill_args


def main(args: Optional[List[str]] = None) -> int:
    """
    Main entry point for e2e wrapper.

    Args:
        args: Command-line arguments (default: sys.argv[1:])

    Returns:
        Exit code
    """
    if args is None:
        args = sys.argv[1:]

    # Handle empty command or help
    if not args or args[0] in ['help', '--help', '-h']:
        print_help()
        return 0

    command = args[0]
    command_args = args[1:]

    # Route command to appropriate skill
    if command == 'generate':
        skill_script, skill_args = parse_generate_command(command_args)
    elif command == 'run':
        skill_script, skill_args = parse_run_command(command_args)
    elif command == 'orchestrate':
        skill_script, skill_args = parse_orchestrate_command(command_args)
    elif command in ['create-scenario', 'validate-scenario']:
        skill_script, skill_args = parse_scenario_command(command, command_args)
    elif command == 'testdata':
        skill_script, skill_args = parse_testdata_command(command_args)
    else:
        print(f"❌ Unknown command: {command}")
        print("Run '/e2e help' to see available commands")
        return 1

    # Exit early if parsing failed
    if not skill_args:
        return 1

    # Execute skill
    return execute_skill(skill_script, skill_args)


if __name__ == '__main__':
    sys.exit(main())
