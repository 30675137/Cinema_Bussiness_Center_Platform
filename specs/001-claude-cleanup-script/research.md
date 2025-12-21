# Research: Claude 卸载清理自动化脚本

**Date**: 2025-12-13
**Purpose**: 解决 Technical Context 中的未知项，确定最佳实践和技术选型

## 研究主题

### 1. Python 子命令 CLI 框架选择

**Question**: 应该使用哪个 Python CLI 框架来实现子命令模式？

**Decision**: 使用 `argparse`（Python 标准库）

**Rationale**:
- **标准库，无第三方依赖**：符合 FR-016 要求的简洁性，脚本可直接分发运行
- **子命令支持**：`add_subparsers()` 原生支持 install/uninstall/set-api-key/set-config 等子命令
- **足够功能**：支持位置参数、可选参数、帮助信息、类型检查
- **成熟稳定**：Python 3.2+ 标准库，文档完善，社区广泛使用

**Alternatives Considered**:
- **Click**: 功能强大，语法简洁，但引入第三方依赖，与"无依赖"目标冲突
- **Typer**: 基于类型提示的现代 CLI 框架，但同样引入依赖（typer + click）
- **Fire**: Google 开发，自动生成 CLI，但过于魔法化，不适合需要精确控制的场景

**Implementation Notes**:
```python
parser = argparse.ArgumentParser(description='Claude 安装/卸载管理工具')
subparsers = parser.add_subparsers(dest='command', required=True)

# install 子命令
install_parser = subparsers.add_parser('install', help='安装 Claude 组件')
install_parser.add_argument('--dry-run', action='store_true')
install_parser.add_argument('--verbose', action='store_true')
install_parser.add_argument('--quiet', action='store_true')

# uninstall 子命令
uninstall_parser = subparsers.add_parser('uninstall', help='卸载 Claude 组件')
uninstall_parser.add_argument('--backup', action='store_true')
# ... 其他参数
```

---

### 2. Shell 配置文件检测策略

**Question**: 如何检测用户当前 shell 实际使用的配置文件？

**Decision**: 优先检测 `$ZDOTDIR`，回退至 `~/.zshenv`、`~/.zshrc`，选择第一个存在且可写的文件

**Rationale**:
- **Zsh 加载顺序**：`.zshenv`（所有 shell）→ `.zprofile`（登录 shell）→ `.zshrc`（交互 shell）→ `.zlogin`
- **环境变量最佳位置**：`.zshenv` 对所有 shell 生效，包括脚本和非交互式 shell
- **用户自定义路径**：`$ZDOTDIR` 允许用户自定义配置目录，需优先检测
- **避免重复**：仅修改一个文件（FR-036），避免配置不一致

**Alternatives Considered**:
- **修改所有配置文件**：导致配置重复和不一致，维护困难
- **仅修改 `.zshrc`**：不适用于非交互式 shell 和脚本执行
- **让用户手动选择**：增加交互复杂度，不符合自动化目标

**Implementation Notes**:
```python
def detect_zsh_config():
    zdotdir = os.environ.get('ZDOTDIR', os.path.expanduser('~'))
    candidates = [
        Path(zdotdir) / '.zshenv',
        Path.home() / '.zshenv',
        Path.home() / '.zshrc'
    ]
    for config_file in candidates:
        if config_file.exists() and os.access(config_file, os.W_OK):
            return config_file
    # 如果都不存在，默认创建 ~/.zshenv
    return Path.home() / '.zshenv'
```

---

### 3. Npm 全局包检测方法

**Question**: 如何准确检测 npm 全局包是否已安装？

**Decision**: 结合 `npm list -g --depth=0` 和 `which` 命令双重验证

**Rationale**:
- **npm list**: 查询 npm 全局包列表，准确识别包名和版本
- **which 命令**: 验证二进制文件是否在 PATH 中，防止误报
- **双重验证**: npm list 可能不准确（如手动删除文件），which 验证实际可用性
- **低误报率**: 满足 SC-004 < 5% 误报率要求

**Alternatives Considered**:
- **仅使用 which**: 无法区分安装方式（npm/Homebrew/Native）
- **仅使用 npm list**: 数据可能过时，无法验证实际可用性
- **解析 package.json**: 位置可能变化（NVM 多版本），实现复杂

**Implementation Notes**:
```python
def detect_npm_package(package_name):
    try:
        result = subprocess.run(
            ['npm', 'list', '-g', '--depth=0', package_name],
            capture_output=True, text=True, timeout=10
        )
        npm_installed = package_name in result.stdout

        # 双重验证：检查命令是否在 PATH 中
        cmd_name = package_name.split('/')[-1]  # @anthropic-ai/claude-code → claude-code
        which_result = subprocess.run(['which', cmd_name], capture_output=True)
        cmd_available = which_result.returncode == 0

        return npm_installed and cmd_available
    except subprocess.TimeoutExpired:
        return False
```

---

### 4. NVM 多版本 Node 清理策略

**Question**: 如何清理 NVM 管理的所有 Node 版本中的 Claude 相关包？

**Decision**: 遍历 `$NVM_DIR/versions/node/*/lib/node_modules/`，逐个卸载

**Rationale**:
- **NVM 目录结构**: 每个 Node 版本独立安装全局包在 `$NVM_DIR/versions/node/vX.Y.Z/lib/node_modules/`
- **完整清理**: FR-005 要求支持所有 Node 版本，需遍历所有版本目录
- **性能考虑**: NVM 版本通常 < 10 个，遍历开销可接受
- **容错性**: 每个版本独立处理，单个失败不影响其他版本（FR-018）

**Alternatives Considered**:
- **仅清理当前激活版本**: 不彻底，残留其他版本中的包
- **使用 nvm exec**: 需要切换版本，复杂且耗时
- **手动遍历所有可能路径**: NVM 目录结构稳定，直接遍历更简洁

**Implementation Notes**:
```python
def clean_nvm_packages(package_name):
    nvm_dir = os.environ.get('NVM_DIR', os.path.expanduser('~/.nvm'))
    versions_dir = Path(nvm_dir) / 'versions' / 'node'

    if not versions_dir.exists():
        return []  # NVM 未安装

    cleaned = []
    for version_dir in versions_dir.glob('v*/'):
        package_path = version_dir / 'lib' / 'node_modules' / package_name
        if package_path.exists():
            # 在该版本环境下卸载
            node_bin = version_dir / 'bin' / 'npm'
            if node_bin.exists():
                subprocess.run([str(node_bin), 'uninstall', '-g', package_name])
                cleaned.append(str(version_dir))
    return cleaned
```

---

### 5. Homebrew 包检测与卸载

**Question**: 如何检测和卸载通过 Homebrew 安装的 Claude 包？

**Decision**: 使用 `brew list` 检测，`brew uninstall` 卸载，容错处理未安装 Homebrew 情况

**Rationale**:
- **官方命令**: `brew list <formula>` 可靠检测包是否安装
- **容错性**: Homebrew 可能未安装（FR-003 "如果存在"），需 try-except
- **性能**: brew 命令响应快（< 1s），满足性能目标

**Alternatives Considered**:
- **手动检查 /usr/local/Cellar**: Homebrew 目录可能自定义（M1 Mac 在 /opt/homebrew），不可靠
- **解析 brew list 输出**: 命令输出格式稳定，直接检查返回码即可

**Implementation Notes**:
```python
def detect_homebrew_package(formula_name):
    try:
        result = subprocess.run(
            ['brew', 'list', formula_name],
            capture_output=True, timeout=5
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False  # Homebrew 未安装或超时
```

---

### 6. 进程检测与终止策略

**Question**: 如何检测和停止 Claude Code Router 相关进程？

**Decision**: 使用 `pgrep` 查找进程，`pkill -SIGTERM` 优雅终止，5秒后 `pkill -SIGKILL` 强制终止

**Rationale**:
- **SIGTERM 优雅终止**: 允许进程清理资源、保存状态
- **SIGKILL 兜底**: 5秒超时后强制终止，确保清理完成
- **pgrep 精确匹配**: 基于进程名匹配，避免误杀其他进程
- **标准工具**: macOS 自带，无需第三方库

**Alternatives Considered**:
- **psutil 库**: 功能强大但引入第三方依赖，与"无依赖"目标冲突
- **直接 SIGKILL**: 可能导致数据丢失，不符合最佳实践
- **使用 ps + grep**: pgrep 更简洁可靠

**Implementation Notes**:
```python
def kill_processes(process_name):
    try:
        # 查找进程
        pgrep = subprocess.run(['pgrep', '-f', process_name], capture_output=True)
        if pgrep.returncode != 0:
            return  # 无进程运行

        # SIGTERM 优雅终止
        subprocess.run(['pkill', '-SIGTERM', '-f', process_name])
        time.sleep(5)

        # 检查是否仍在运行
        still_running = subprocess.run(['pgrep', '-f', process_name], capture_output=True)
        if still_running.returncode == 0:
            # SIGKILL 强制终止
            subprocess.run(['pkill', '-SIGKILL', '-f', process_name])
    except Exception as e:
        logging.warning(f"Failed to kill {process_name}: {e}")
```

---

### 7. Dry-run 模式实现

**Question**: 如何实现 `--dry-run` 预览模式？

**Decision**: 使用全局标志 `DRY_RUN`，所有破坏性操作前检查，输出 `[DRY-RUN]` 前缀日志

**Rationale**:
- **简单可靠**: 单一标志控制，无需复杂状态管理
- **明确标识**: `[DRY-RUN]` 前缀清晰区分（FR-032）
- **完整预览**: 显示所有操作但不执行（FR-031）

**Alternatives Considered**:
- **装饰器模式**: 过度设计，增加复杂度
- **Mock 对象**: 适合测试，不适合生产 dry-run 功能

**Implementation Notes**:
```python
DRY_RUN = False  # 全局标志

def execute_command(cmd, description):
    if DRY_RUN:
        logging.info(f"[DRY-RUN] Would execute: {description}")
        logging.debug(f"[DRY-RUN] Command: {' '.join(cmd)}")
        return True
    else:
        logging.info(f"Executing: {description}")
        result = subprocess.run(cmd, capture_output=True)
        return result.returncode == 0
```

---

### 8. 日志级别实现

**Question**: 如何支持 `--verbose` 和 `--quiet` 日志级别？

**Decision**: 使用 Python `logging` 模块，支持 DEBUG/INFO/WARNING/ERROR 级别

**Rationale**:
- **标准库**: 无需第三方依赖
- **灵活配置**: 支持多级别，格式化输出
- **性能**: 低开销，适合脚本环境
- **FR-033/FR-034 要求**: 明确支持 verbose 和 quiet 模式

**Alternatives Considered**:
- **print 函数**: 无法灵活控制日志级别
- **rich 库**: 功能强大但引入第三方依赖

**Implementation Notes**:
```python
def setup_logging(verbose=False, quiet=False):
    if quiet:
        level = logging.ERROR
    elif verbose:
        level = logging.DEBUG
    else:
        level = logging.INFO

    logging.basicConfig(
        level=level,
        format='%(levelname)s: %(message)s'
    )
```

---

### 9. 配置文件格式与验证

**Question**: `~/.claude/settings.json` 应该使用什么 schema？

**Decision**: 使用 JSON 格式，包含环境变量和权限设置，启动时加载并验证

**Rationale**:
- **标准格式**: Python 原生支持 `json` 模块，无需第三方库
- **可读性**: 人类可读可编辑
- **验证**: 使用简单字典检查必需字段

**Schema Example**:
```json
{
  "env_vars": {
    "ANTHROPIC_API_KEY": "sk-...",
    "ANTHROPIC_BASE_URL": "https://api.anthropic.com",
    "ANTHROPIC_AUTH_TOKEN": "..."
  },
  "permissions": {
    "dangerously_skip_permissions": false
  },
  "aliases": {
    "cc": "claude --dangerously-skip-permissions",
    "c": "claude"
  }
}
```

**Validation**:
```python
def load_config():
    config_path = Path.home() / '.claude' / 'settings.json'
    if not config_path.exists():
        return {}

    with open(config_path) as f:
        config = json.load(f)

    # 简单验证
    if not isinstance(config.get('env_vars', {}), dict):
        raise ValueError("env_vars must be a dict")

    return config
```

---

### 10. Backup 策略

**Question**: 如何实现可选的配置文件备份功能？

**Decision**: 使用时间戳目录 `~/claude-backup-YYYYMMDD-HHMMSS/`，复制所有配置文件

**Rationale**:
- **时间戳**: 唯一标识，支持多次备份
- **用户主目录**: 显眼位置，便于用户查找
- **完整备份**: 包括 `~/.claude/`、shell 配置文件等
- **SC-006 要求**: 30 秒内完成备份

**Implementation Notes**:
```python
def create_backup():
    timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
    backup_dir = Path.home() / f'claude-backup-{timestamp}'
    backup_dir.mkdir(parents=True, exist_ok=True)

    # 备份配置目录
    claude_dir = Path.home() / '.claude'
    if claude_dir.exists():
        shutil.copytree(claude_dir, backup_dir / '.claude')

    # 备份 shell 配置
    zsh_config = detect_zsh_config()
    if zsh_config.exists():
        shutil.copy(zsh_config, backup_dir / zsh_config.name)

    return backup_dir
```

---

### 11. 交互式提示实现

**Question**: 如何实现交互式组件选择和 alias 确认？

**Decision**: 使用 `input()` 标准库函数，提供清晰提示和默认值

**Rationale**:
- **标准库**: 无需第三方依赖
- **简单直观**: 用户熟悉的交互方式
- **可测试**: 可通过 Mock stdin 进行测试

**Alternatives Considered**:
- **inquirer/questionary**: 美观但引入依赖
- **click.prompt**: 需要 click 依赖

**Implementation Notes**:
```python
def prompt_component_selection():
    print("请选择要安装的组件:")
    print("1. Claude Code CLI")
    print("2. Claude Code Router")
    print("3. 两者都安装")

    choice = input("请输入选项 (1/2/3) [默认: 3]: ").strip() or "3"

    if choice == "1":
        return ["claude-code"]
    elif choice == "2":
        return ["router"]
    else:
        return ["claude-code", "router"]
```

---

## 研究总结

所有技术决策已明确，无遗留"NEEDS CLARIFICATION"项。关键设计原则：

1. **标准库优先**：argparse、logging、json、subprocess、pathlib、shutil - 无第三方依赖
2. **双重验证**：npm + which，降低误报率至 < 5%
3. **容错设计**：单步失败不中断流程（FR-018）
4. **明确日志**：dry-run 和 verbose 模式清晰标识（FR-032、FR-033）
5. **完整清理**：NVM 多版本、多安装方式全覆盖（FR-005、FR-035）
6. **智能检测**：shell 配置文件自动检测活跃文件（FR-036）

所有依赖都是 Python 3.8+ 标准库，脚本可独立运行，符合"保持脚本自包含，便于分发"的目标。

下一步：Phase 1 - 生成 data-model.md 和 contracts/
