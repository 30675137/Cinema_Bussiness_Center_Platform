#!/usr/bin/env python3
# @spec T001-e2e-orchestrator
"""
E2E 测试编排器 CLI 入口。

使用方式:
  python3 .claude/skills/e2e-admin/run.py --tags "module:inventory"
"""

import sys
from pathlib import Path

# 添加 scripts 目录到 Python 路径
scripts_dir = Path(__file__).parent / 'scripts'
sys.path.insert(0, str(scripts_dir.parent))

from scripts.orchestrate import main

if __name__ == '__main__':
    sys.exit(main())
