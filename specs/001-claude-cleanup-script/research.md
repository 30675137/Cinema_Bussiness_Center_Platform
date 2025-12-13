# Technical Research: Claude 卸载清理自动化脚本

**Feature**: 001-claude-cleanup-script  
**Date**: 2025-12-13  
**Status**: Complete

## Research Questions & Decisions

### Q1: CLI 框架选择

**Question**: 应该使用哪个 Python CLI 框架来实现子命令模式？

**Decision**: 使用 `click`

**Rationale**:
- `click` 是 Python 生态中最成熟和广泛使用的 CLI 框架
- 支持子命令、参数解析、选项、帮助信息生成
- 与 `rich` 集成良好，可以美化输出
- 文档完善，社区活跃
- 符合"稳定性优先"的技术选型原则

**Alternatives Considered**:
- `argparse`（标准库）：功能基础，需要更多样板代码
- `typer`：基于 `click` 的现代替代，但相对较新，稳定性不如 `click`
- `docopt`：基于文档字符串，但类型支持较弱

**Example Usage**:
```python
import click

@click.group()
def cli():
    """Claude Code CLI/Router 管理工具"""
    pass

@cli.command()
def install():
    """安装 Claude Code CLI 和/或 Router"""
    pass
```

---

### Q2: 终端输出美化

**Question**: 如何提供清晰的执行日志和美观的终端输出？

**Decision**: 使用 `rich`

**Rationale**:
- `rich` 提供丰富的终端格式化功能（颜色、表格、进度条、面板等）
- 与 `click` 集成良好，可以替换 `click` 的默认输出
- 支持 Markdown 渲染、语法高亮等高级功能
- 自动检测终端能力，在非交互式环境中优雅降级
- 提升用户体验，使脚本输出更专业

**Alternatives Considered**:
- `colorama`：仅支持基本颜色，功能有限
- `termcolor`：功能简单，不支持复杂格式化
- 纯文本输出：用户体验较差

**Example Usage**:
```python
from rich.console import Console
from rich.table import Table
from rich.progress import Progress

console = Console()
console.print("[green]✓[/green] 安装成功")
```

---

### Q3: 进程检测和管理

**Question**: 如何检测和停止 Claude Code Router 相关进程？

**Decision**: 使用 `psutil`

**Rationale**:
- `psutil` 是跨平台的进程和系统工具库
- 提供进程查找、终止、资源监控等功能
- 支持按进程名、命令行参数、端口等条件查找进程
- 文档完善，API 简洁
- 在 macOS 上工作良好

**Alternatives Considered**:
- `subprocess` + `pgrep`：需要调用外部命令，跨平台性差
- `os.kill`：功能基础，需要手动查找进程
- `signal`：仅支持发送信号，不提供进程查找功能

**Example Usage**:
```python
import psutil

# 查找进程
for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
    if 'claude-code-router' in proc.info['name']:
        proc.terminate()
```

---

### Q4: 安装方式检测

**Question**: 如何检测 Claude 是通过哪种方式安装的（npm、Homebrew、Native）？

**Decision**: 按优先级顺序检测

**Rationale**:
- **npm 检测**：检查 `npm list -g` 输出，查找 `@anthropic-ai/claude-code` 和 `@musistudio/claude-code-router`
- **Homebrew 检测**：检查 `brew list` 输出，查找 `claude-code` 相关包
- **Native 检测**：检查 `~/.local/bin/claude` 和 `~/.claude-code` 目录是否存在
- **NVM 检测**：如果存在 NVM，检查所有 Node 版本中的全局包

**Implementation Strategy**:
1. 先检测 npm 全局包（最常见）
2. 再检测 Homebrew 包
3. 最后检测 Native 安装残留
4. 对于 NVM，遍历所有 Node 版本

**Example Logic**:
```python
def detect_installation_methods():
    methods = []
    if check_npm_global_packages():
        methods.append('npm')
    if check_homebrew_packages():
        methods.append('homebrew')
    if check_native_installation():
        methods.append('native')
    return methods
```

---

### Q5: API Key 存储方式

**Question**: API key 应该存储在哪里，使用什么格式？

**Decision**: 存储在环境变量文件中（`~/.zshrc` 或 `~/.zshenv`），使用 `export ANTHROPIC_API_KEY=...` 格式

**Rationale**:
- 环境变量是更通用的配置方式，符合 Unix/Linux 传统
- 所有支持环境变量的工具都能自动读取
- 不需要额外的配置文件解析逻辑
- 符合用户习惯（大多数 CLI 工具使用环境变量）

**Implementation Strategy**:
1. 检测用户的 shell 配置文件（优先 `~/.zshrc`，其次 `~/.zshenv`）
2. 如果已存在 `ANTHROPIC_API_KEY`，更新它
3. 如果不存在，追加到文件末尾
4. 使用正则表达式匹配和替换，避免重复

**Example Code**:
```python
def set_api_key(api_key: str, config_file: str = "~/.zshrc"):
    config_path = Path(config_file).expanduser()
    content = config_path.read_text()
    
    # 检查是否已存在
    pattern = r'export\s+ANTHROPIC_API_KEY=.*'
    if re.search(pattern, content):
        content = re.sub(pattern, f'export ANTHROPIC_API_KEY={api_key}', content)
    else:
        content += f'\nexport ANTHROPIC_API_KEY={api_key}\n'
    
    config_path.write_text(content)
```

---

### Q6: 错误处理和容错

**Question**: 如何处理组件未安装、权限不足、文件不存在等错误情况？

**Decision**: 优雅降级，继续执行后续步骤

**Rationale**:
- 脚本应该能够处理部分组件未安装的情况
- 单个步骤失败不应中断整个流程
- 提供清晰的错误日志，但不阻止后续操作
- 最后提供验证报告，让用户知道哪些步骤成功/失败

**Implementation Strategy**:
1. 每个清理步骤使用 `try-except` 包装
2. 记录每个步骤的执行状态（成功/失败/跳过）
3. 失败时记录错误信息，但继续执行
4. 最后生成验证报告，汇总所有步骤的状态

**Example Pattern**:
```python
def cleanup_step(step_name: str, step_func: Callable):
    try:
        result = step_func()
        log_success(step_name)
        return True
    except FileNotFoundError:
        log_skip(step_name, "文件不存在，跳过")
        return False
    except PermissionError:
        log_error(step_name, "权限不足，需要管理员权限")
        return False
    except Exception as e:
        log_error(step_name, f"执行失败: {e}")
        return False
```

---

### Q7: 备份功能实现

**Question**: 如何实现可选的配置文件备份功能？

**Decision**: 在清理前备份所有相关配置文件到带时间戳的目录

**Rationale**:
- 备份是可选功能，用户可以选择启用
- 使用时间戳目录，避免覆盖之前的备份
- 备份所有可能被清理的配置文件
- 提供恢复指导（在 README 中）

**Implementation Strategy**:
1. 创建备份目录：`~/.claude-cleanup-backup/YYYY-MM-DD_HH-MM-SS/`
2. 备份以下文件/目录：
   - `~/.zshrc`、`~/.zshenv`（如果包含 Claude 相关配置）
   - `~/.claude/`、`~/.claude.json`、`~/.claude-code-router/`、`~/.claude-code/`
3. 使用 `shutil.copytree` 和 `shutil.copy2` 保持元数据
4. 在备份目录中创建 `README.txt`，说明如何恢复

**Example Code**:
```python
def backup_configs(backup_dir: Path):
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    backup_path = backup_dir / timestamp
    backup_path.mkdir(parents=True, exist_ok=True)
    
    configs_to_backup = [
        Path.home() / ".zshrc",
        Path.home() / ".claude",
        # ... 其他配置文件
    ]
    
    for config in configs_to_backup:
        if config.exists():
            if config.is_dir():
                shutil.copytree(config, backup_path / config.name)
            else:
                shutil.copy2(config, backup_path / config.name)
```

---

## Summary

所有技术决策都基于以下原则：
1. **稳定性优先**：选择成熟稳定的库和工具
2. **用户体验**：提供清晰的日志和美观的输出
3. **容错性**：优雅处理各种错误情况
4. **可维护性**：代码结构清晰，易于理解和维护

所有依赖都是 Python 生态中广泛使用的成熟库，符合项目宪章的"稳定性优先"原则。
